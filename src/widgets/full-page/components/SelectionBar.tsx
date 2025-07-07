import Select from "@jetbrains/ring-ui-built/components/select/select";
import {useTranslation} from "react-i18next";
import Button from "@jetbrains/ring-ui-built/components/button/button";
import {ControlsHeight} from "@jetbrains/ring-ui-built/components/global/controls-height";
import {
    articleToSelectItem,
    attachmentToSelectItem,
    issueToSelectItem,
    nullableArticleToSelectItem,
    nullableAttachmentToSelectItem,
    nullableIssueToSelectItem,
    nullableProjectToSelectItem,
    projectToSelectItem
} from "../util/util.ts";
import Icon from "@jetbrains/ring-ui-built/components/icon";
import Info from "@jetbrains/icons/info";
import Tooltip from "@jetbrains/ring-ui-built/components/tooltip/tooltip";
import {useFilterContext} from "../context/FilterContextProvider.tsx";
import useProjects from "../hooks/useProjects.tsx";
import useIssues from "../hooks/useIssues.tsx";
import useArticles from "../hooks/useArticles.tsx";
import {Target} from "../entities/util.ts";
import {useCallback, useEffect, useMemo} from "react";
import {Project} from "../entities/youtrack.ts";
import {useModalContext} from "../context/ModalContextProvider.tsx";
import {host} from "../youTrackApp.ts";
import {CacheResponse} from "../entities/types.ts";
import {fetchArticle, fetchIssue} from "../util/queries.ts";


export default function SelectionBar() {


    const {t} = useTranslation();
    const {project, setProject, issue, setIssue, setArticle, article, setAttachment, attachment, target, setTarget, setProjectAndReset, setTargetAndReset} = useFilterContext()

    const {projects, projectsLoading, fetchNextProjects, onSearchChange: onProjectSearch} = useProjects()
    const {issues, issuesLoading, fetchNextIssues, onFilterChange: onIssuefilter} = useIssues(false)
    const {articles, articlesLoading, fetchNextArticles, onFilterChange: onArticleFilter} = useArticles(false)
    const {openModal} = useModalContext()

    const attachments = useMemo(() => {
        if (target === Target.ARTICLE) {
            return article ? article.attachments : []
        } else {
            return issue ? issue.attachments : []
        }
    }, [issue, article, target])

    const onSelectProject = useCallback((project: Project) => {
        setProjectAndReset(project)
        if (target === Target.ARTICLE) {
            onArticleFilter({project: project, onlySvgAttachments: true})
        } else {
            onIssuefilter({project: project, onlySvgAttachments: true})
        }
    }, [setProjectAndReset, onArticleFilter, onIssuefilter, target])


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
                if (res.attachmentId === 'new') openModal()
            }
        })

    }, []);


    return (
        <div className={"flex flex-col p-2 pb-6"}>
            <div style={{height: "65px"}} className={"flex flex-row justify-between items-end"}>
                <div className={"flex flex-col"}>
                    <div className={"flex flex-row pb-3 space-x-2"}>
                        <h1 style={{fontSize: "16px", fontWeight: "bold"}}> {t('attachTo')}</h1>
                        <Button onClick={() => setTargetAndReset(Target.ARTICLE)} active={target === Target.ARTICLE} height={ControlsHeight.S}>{t('article')}</Button>
                        <h1 style={{fontSize: "16px", fontWeight: "bold"}}> {t('or')}</h1>
                        <Button onClick={() => setTargetAndReset(Target.ISSUE)} active={target === Target.ISSUE} height={ControlsHeight.S}>{t('issue')}</Button>
                    </div>

                    <div className={"flex flex-row"}>
                        <Select
                            popupClassName={"remove-input-focus"}
                            label={t('selectProject')}
                            filter={{placeholder: t("filterProjects")}}
                            loadingMessage={t('loading')}
                            notFoundMessage={t('noProjectsFound')}
                            selected={nullableProjectToSelectItem(project)}
                            loading={projectsLoading}
                            onLoadMore={() => void fetchNextProjects()}
                            data={projects?.map(projectToSelectItem)}
                            onSelect={(item) => item && onSelectProject(item.model)}
                            onFilter={(text) => onProjectSearch(text)}
                            renderOptimization={false}
                        >
                        </Select>
                        <p className={"px-2 align-middle"} style={{fontSize: '14pt', color: 'var(--ring-secondary-color)'}}>/</p>
                        {target === Target.ARTICLE ?
                            <Select
                                popupClassName={"remove-input-focus"}
                                label={t('selectArticle')}
                                filter={{placeholder: t("filterArticles")}}
                                loadingMessage={t('loading')}
                                notFoundMessage={t('noArticlesFound')}
                                selected={nullableArticleToSelectItem(article)}
                                loading={articlesLoading}
                                onLoadMore={() => void fetchNextArticles()}
                                data={articles?.map(articleToSelectItem)}
                                onSelect={(item) => item && setArticle(item.model)}
                                onFilter={(text) => onArticleFilter({project: project, search: text})}
                                renderOptimization={false}
                            >
                            </Select>
                            :
                            <Select
                                popupClassName={"remove-input-focus"}
                                label={t('selectIssue')}
                                filter={{placeholder: t("filterIssues")}}
                                loadingMessage={t('loading')}
                                notFoundMessage={t('noIssuesFound')}
                                selected={nullableIssueToSelectItem(issue)}
                                loading={issuesLoading}
                                onLoadMore={() => void fetchNextIssues()}
                                data={issues?.map(issueToSelectItem)}
                                onSelect={(item) => item && setIssue(item.model)}
                                onFilter={(text) => onIssuefilter({project: project, search: text})}
                                renderOptimization={false}

                            >
                            </Select>
                        }
                        <p className={"px-2 align-middle"} style={{fontSize: '14pt', color: 'var(--ring-secondary-color)'}}>/</p>
                        <Select
                            popupClassName={"remove-input-focus"}
                            label={t('selectAttachment')}
                            filter={{placeholder: t("filterAttachments")}}
                            loadingMessage={t('loading')}
                            notFoundMessage={t('noAttachmentsFound')}
                            selected={nullableAttachmentToSelectItem(attachment)}
                            loading={attachments === null}
                            data={attachments?.map(attachmentToSelectItem)}
                            onSelect={(item) => item && setAttachment(item.model)}
                            renderOptimization={false}
                        >
                        </Select>
                        <Tooltip className={'mt-1 ml-3'} title={t('tooltip_selectionBar')}>
                            <Icon glyph={Info}
                                  className={'infoIcon'}
                                  height={20}
                                  width={20}
                            />
                        </Tooltip>
                    </div>
                </div>
                <div>
                    <Button id={"new_diagramm_btn"} style={{backgroundColor: "var(--ring-main-color)", color: 'white'}} onClick={() => openModal()} height={ControlsHeight.S}>
                        {t('newDiagramm')}

                    </Button>
                </div>
            </div>
        </div>
    )
}
