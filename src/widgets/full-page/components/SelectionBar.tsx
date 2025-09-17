import {useTranslation} from "react-i18next";
import Button from "@jetbrains/ring-ui-built/components/button/button";
import {useFilterContext} from "../context/FilterContextProvider.tsx";
import useIssues from "../hooks/useIssues.tsx";
import useArticles from "../hooks/useArticles.tsx";
import {ModalMode, Target} from "../entities/util.ts";
import {useEffect, useMemo, useState} from "react";
import {useModalContext} from "../context/ModalContextProvider.tsx";
import {host} from "../youTrackApp.ts";
import {CacheResponse} from "../entities/types.ts";
import {fetchArticle, fetchIssue} from "../util/queries.ts";
import Icon from "@jetbrains/ring-ui-built/components/icon";
import Add from "@jetbrains/icons/add"
import Select from "@jetbrains/ring-ui-built/components/select/select";
import {
    articleToSelectItem, attachmentToSelectItem,
    issueToSelectItem,
    nullableArticleToSelectItem,
    nullableAttachmentToSelectItem,
    nullableIssueToSelectItem,
} from "../util/util.ts";
import {Size} from "@jetbrains/ring-ui-built/components/input/input";

export default function SelectionBar() {

    const {t} = useTranslation();
    const {
        project,
        setProject,
        issue,
        setIssue,
        setArticle,
        article,
        setAttachment,
        attachment,
        target,
        setTarget,
        setArticleAndReset,
        setIssueAndReset
    } = useFilterContext()

    const {issues, issuesLoading, fetchNextIssues, onFilterChange: onIssuefilter} = useIssues(false)
    const {articles, articlesLoading, fetchNextArticles, onFilterChange: onArticleFilter} = useArticles(false)
    const {openModal} = useModalContext()
    const [showSelectPath, setShowSelectPath] = useState(false)


    const attachments = useMemo(() => {
        if (target === Target.ARTICLE) {
            return article ? article.attachments : []
        } else {
            return issue ? issue.attachments : []
        }
    }, [issue, article, target])

    useEffect(() => {
        void host.fetchApp("backend/getAttachment", {}).then(async (res: CacheResponse) => {
            if (!res) return
            if ((Math.floor(Date.now() / 1000) - res.edited) < 15) {
                setTarget(res.forArticle ? Target.ARTICLE : Target.ISSUE)
                if (res.forArticle) {
                    const a = await fetchArticle(res.id)
                    if (a) {
                        setProject(a.project)
                        setArticle(a)
                        setAttachment(a.attachments.find(i => i.id === res.attachmentId))
                    } else {
                        console.log("Article not found")
                    }
                } else {
                    const i = await fetchIssue(res.id)
                    if (i) {
                        setProject(i.project)
                        setIssue(i)
                        setAttachment(i.attachments.find(i => i.id === res.attachmentId))
                    } else {
                        console.log("Issue not found")
                    }
                }
                if (res.attachmentId === 'new') openModal(ModalMode.CREATE)
            }
        })

    }, []);

    return (
        <div className={"flex flex-row gap-x-2 py-6"}>
            {showSelectPath && project !== undefined ?
                <div className={"flex flex-row"}>
                    <Button primary className={'select-group-left'} onClick={() => openModal(ModalMode.OPEN)}>
                        <div className={"flex flex-row gap-x-2"}>
                            <img src={project.iconUrl} alt={''} className={'avatar'}/>
                            {project.name}
                        </div>
                    </Button>
                    {target === Target.ARTICLE ?
                        <Select
                            popupClassName={"remove-input-focus select-max-width"}
                            label={t('selectArticle')}
                            buttonClassName={'select-group-middle select-primary ring-button-flat'}
                            filter={{placeholder: t("filterArticles")}}
                            loadingMessage={t('loading')}
                            notFoundMessage={t('noArticlesFound')}
                            selected={nullableArticleToSelectItem(article)}
                            loading={articlesLoading}
                            onLoadMore={() => void fetchNextArticles()}
                            data={articles?.map(articleToSelectItem)}
                            onOpen={() => onArticleFilter({project: project, onlySvgAttachments: true})}
                            onSelect={(item) => item && setArticleAndReset(item.model)}
                            onFilter={(text) => onArticleFilter({project: project, search: text, onlySvgAttachments: true})}
                            renderOptimization={false}
                            size={Size.AUTO}

                        >
                        </Select>
                        :
                        <Select
                            popupClassName={"remove-input-focus select-max-width"}
                            label={t('selectIssue')}
                            buttonClassName={'select-group-middle select-primary ring-button-flat'}
                            filter={{placeholder: t("filterIssues")}}
                            loadingMessage={t('loading')}
                            notFoundMessage={t('noIssuesFound')}
                            selected={nullableIssueToSelectItem(issue)}
                            loading={issuesLoading}
                            onLoadMore={() => void fetchNextIssues()}
                            data={issues?.map(issueToSelectItem)}
                            onSelect={(item) => item && setIssueAndReset(item.model)}
                            onFilter={(text) => onIssuefilter({project: project, search: text, onlySvgAttachments: true})}
                            renderOptimization={false}
                            size={Size.AUTO}

                        >
                        </Select>
                    }
                    <Select
                        popupClassName={"remove-input-focus"}
                        label={t('selectAttachment')}
                        buttonClassName={'select-group-right select-primary ring-button-flat'}
                        filter={{placeholder: t("filterAttachments")}}
                        loadingMessage={t('loading')}
                        notFoundMessage={t('noAttachmentsFound')}
                        selected={nullableAttachmentToSelectItem(attachment)}
                        loading={attachments === null}
                        data={attachments?.map(attachmentToSelectItem)}
                        onSelect={(item) => item && setAttachment(item.model)}
                        renderOptimization={false}
                        size={Size.AUTO}
                        inputPlaceholder={t('selectAttachment')}
                    >
                    </Select>
                </div>
                :
                <Button primary onClick={() => openModal(ModalMode.OPEN, () => setShowSelectPath(true))}>
                    {t('openDiagram')}
                </Button>
            }
            <Button className={'iconButton'} primary onClick={() => openModal(ModalMode.CREATE, () => setShowSelectPath(true))}>
                <Icon glyph={Add}/>
            </Button>
        </div>
    )
}
