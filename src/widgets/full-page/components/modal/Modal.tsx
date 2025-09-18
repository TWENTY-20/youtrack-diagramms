import Button from "@jetbrains/ring-ui-built/components/button/button";
import {useTranslation} from "react-i18next";
import {useModalContext} from "../../context/ModalContextProvider.tsx";
import Dialog from "@jetbrains/ring-ui-built/components/dialog/dialog";
import {useFilterContext} from "../../context/FilterContextProvider.tsx";
import {ModalMode, Target} from "../../entities/util.ts";
import {ControlsHeight} from "@jetbrains/ring-ui-built/components/global/controls-height.js";
import Select from "@jetbrains/ring-ui-built/components/select/select";
import {
    articleToSelectItem,
    attachmentToSelectItem,
    issueToSelectItem,
    nullableArticleToSelectItem,
    nullableAttachmentToSelectItem,
    nullableIssueToSelectItem,
    nullableProjectToSelectItem,
    projectToSelectItem
} from "../../util/util.ts";
import useProjects from "../../hooks/useProjects.tsx";
import useArticles from "../../hooks/useArticles.tsx";
import useIssues from "../../hooks/useIssues.tsx";
import {useCallback, useEffect, useMemo, useState} from "react";
import Input, {Size} from "@jetbrains/ring-ui-built/components/input/input";
import {host} from "../../youTrackApp.ts";
import {Attachment, Project} from "../../entities/youtrack.ts";
import ButtonGroup from "@jetbrains/ring-ui-built/components/button-group/button-group";
import ClickableLink from "@jetbrains/ring-ui-built/components/link/clickableLink";
import Icon from "@jetbrains/ring-ui-built/components/icon";
import Close from "@jetbrains/icons/close";
import Info from "@jetbrains/icons/info";
import Tooltip from "@jetbrains/ring-ui-built/components/tooltip/tooltip";


export default function Modal() {

    const {t} = useTranslation();

    const {action: {show, mode, callback}, closeModal} = useModalContext()
    const {project, target, issue, article, setAttachment, setProjectAndReset, setTargetAndReset, setIssueAndReset, setArticleAndReset, attachment} = useFilterContext()

    const {projects, projectsLoading, fetchNextProjects, onSearchChange: onProjectSearch} = useProjects()
    const {articles, articlesLoading, fetchNextArticles, onFilterChange: onArticleFilter} = useArticles(false)
    const {issues, issuesLoading, fetchNextIssues, onFilterChange: onIssueFilter} = useIssues(false)

    const [diagramName, setDiagramName] = useState<string | undefined>(undefined)

    const [cachedAttachment, setCachedAttachment] = useState<Attachment | undefined>(undefined)

    useEffect(() => {
        if (show && project !== undefined) {
            loadTargetData(project)
        }
    }, [show, project]);


    const loadTargetData = useCallback((project: Project) => {
        if (target === Target.ARTICLE) {
            onArticleFilter({project: project, onlySvgAttachments: mode === ModalMode.OPEN})
        } else {
            onIssueFilter({project: project, onlySvgAttachments: mode === ModalMode.OPEN})
        }
    }, [onArticleFilter, onIssueFilter, target, project, mode])

    const onAddNewDiagramm = useCallback(() => {
        if (project !== null && diagramName !== undefined && (articles !== null || issues !== null)) {
            setAttachment({mimeType: "", size: 0, base64Content: "", extension: "", id: "new", name: diagramName + '.svg'})
            closeModal()
            setDiagramName(undefined)
        } else {
            if (target === Target.ARTICLE) {
                host.alert(t('alert_select_items_article'))
            } else {
                host.alert(t('alert_select_items_issue'))

            }
        }
    }, [diagramName, project, article, issue, target])

    const attachments = useMemo(() => {
        if (target === Target.ARTICLE) {
            return article ? article.attachments : []
        } else {
            return issue ? issue.attachments : []
        }
    }, [issue, article, target])

    return (
        <Dialog
            show={show}
            onCloseAttempt={closeModal}
        >
            <div>
                <div className={"flex flex-row justify-end pe-4 pt-4"}>
                    <ClickableLink onClick={() => {
                        closeModal()
                        setDiagramName(undefined)
                    }}>
                        <Icon className={'infoIcon'} glyph={Close}/>
                    </ClickableLink>
                </div>
                <div className={"flex flex-col px-8 pb-8 gap-y-5"}>
                    <div className={"flex flex-row gap-x-2"}>
                        <h1 className={'text-2xl font-bold'}>{mode === ModalMode.CREATE ? t('newDiagramm') : t('openDiagram')}</h1>
                        {mode === ModalMode.OPEN &&
                            <Tooltip className={'mt-1'} title={t('tooltip_selectionBar')}>
                                <Icon glyph={Info} className={'infoIcon'}/>
                            </Tooltip>
                        }
                    </div>
                    <div>
                        <ButtonGroup label={t('location')}>
                            <Button onClick={() => setTargetAndReset(Target.ARTICLE)} active={target === Target.ARTICLE} height={ControlsHeight.S}>{t('article')}</Button>
                            <Button onClick={() => setTargetAndReset(Target.ISSUE)} active={target === Target.ISSUE} height={ControlsHeight.S}>{t('issue')}</Button>
                        </ButtonGroup>
                    </div>

                    <Select
                        className={"forceFullWidth"}
                        popupClassName={"remove-input-focus"}
                        selectedLabel={t('project')}
                        label={t('selectProject')}
                        filter={{placeholder: t("filterProjects")}}
                        loadingMessage={t('loading')}
                        notFoundMessage={t('noProjectsFound')}
                        selected={nullableProjectToSelectItem(project)}
                        loading={projectsLoading}
                        data={projects?.map(projectToSelectItem)}
                        onSelect={(item) => {
                            if (item) {
                                setProjectAndReset(item.model)
                                loadTargetData(item.model)
                            }
                        }}
                        onLoadMore={() => void fetchNextProjects()}
                        onFilter={(text) => onProjectSearch(text)}
                        renderOptimization={false}
                        size={Size.FULL}
                    />

                    {target === Target.ARTICLE ?
                        <Select
                            className={"forceFullWidth"}
                            popupClassName={"remove-input-focus"}
                            label={t('selectArticle')}
                            selectedLabel={t('article')}
                            filter={{placeholder: t("filterArticles")}}
                            selected={nullableArticleToSelectItem(article)}
                            loadingMessage={t('loading')}
                            notFoundMessage={t('noArticlesFound')}
                            loading={articlesLoading}
                            data={articles?.map(articleToSelectItem)}
                            onLoadMore={() => {
                                void fetchNextArticles()
                            }}
                            onSelect={(item) => item && setArticleAndReset(item.model)}
                            onFilter={(text) => onArticleFilter({project: project, search: text})}
                            disabled={project === undefined}
                            renderOptimization={false}
                            size={Size.FULL}
                        />
                        :
                        <Select
                            className={"forceFullWidth"}
                            popupClassName={"remove-input-focus"}
                            selectedLabel={t('issue')}
                            selected={nullableIssueToSelectItem(issue)}
                            label={t('selectIssue')}
                            filter={{placeholder: t("filterIssues")}}
                            loading={issuesLoading}
                            loadingMessage={t('loading')}
                            onLoadMore={() => {
                                void fetchNextIssues()
                            }}
                            notFoundMessage={t('noIssuesFound')}
                            data={issues?.map(issueToSelectItem)}
                            onSelect={(item) => item && setIssueAndReset(item.model)}
                            onFilter={(text) => onIssueFilter({project: project, search: text})}
                            disabled={project === undefined}
                            renderOptimization={false}
                            size={Size.FULL}
                        />
                    }

                    {mode === ModalMode.CREATE ?
                        <Input
                            value={diagramName}
                            onChange={(i) => setDiagramName(i.target.value)}
                            className={"remove-input-focus"}
                            placeholder={"Name"}
                            label={t('diagrammName')}
                            disabled={issue === undefined && article === undefined}
                            size={Size.FULL}
                        />
                        :
                        <Select
                            selectedLabel={t('attachment')}
                            popupClassName={"remove-input-focus"}
                            label={t('selectAttachment')}
                            filter={{placeholder: t("filterAttachments")}}
                            loadingMessage={t('loading')}
                            notFoundMessage={t('noAttachmentsFound')}
                            selected={nullableAttachmentToSelectItem(attachment)}
                            loading={attachments === null}
                            data={attachments?.map(attachmentToSelectItem)}
                            onSelect={(item) => item && setCachedAttachment(item.model)}
                            renderOptimization={false}
                            disabled={issue === undefined && article === undefined}
                            size={Size.FULL}
                        />
                    }

                    <div className={"flex flex-row gap-x-2 pt-2"}>
                        <Button primary height={ControlsHeight.S} onClick={() => {
                            if (mode === ModalMode.CREATE) {
                                onAddNewDiagramm()
                            } else {
                                setAttachment(cachedAttachment)
                            }
                            if (callback) callback()
                            closeModal()
                        }}>
                            {mode === ModalMode.CREATE ? t('create') : t('open')}
                        </Button>
                        <Button height={ControlsHeight.S} onClick={() => {
                            closeModal()
                            setDiagramName(undefined)
                        }}>
                            {t('cancel')}
                        </Button>
                    </div>
                </div>
            </div>
        </Dialog>
    )
}
