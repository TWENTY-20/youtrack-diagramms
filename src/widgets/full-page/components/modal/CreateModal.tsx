import Button from "@jetbrains/ring-ui-built/components/button/button";
import {useTranslation} from "react-i18next";
import {useModalContext} from "../../context/ModalContextProvider.tsx";
import Dialog from "@jetbrains/ring-ui-built/components/dialog/dialog";
import {useFilterContext} from "../../context/FilterContextProvider.tsx";
import {Target} from "../../entities/util.ts";
import {ControlsHeight} from "@jetbrains/ring-ui-built/components/global/controls-height.js";
import Select from "@jetbrains/ring-ui-built/components/select/select";
import {articleToSelectItem, issueToSelectItem, nullableArticleToSelectItem, nullableIssueToSelectItem, nullableProjectToSelectItem, projectToSelectItem} from "../../util/util.ts";
import useProjects from "../../hooks/useProjects.tsx";
import useArticles from "../../hooks/useArticles.tsx";
import useIssues from "../../hooks/useIssues.tsx";
import {useCallback, useState} from "react";
import Input from "@jetbrains/ring-ui-built/components/input/input";
import {host} from "../../youTrackApp.ts";
import {Project} from "../../entities/youtrack.ts";


export default function CreateModal() {

    const {t} = useTranslation();

    const {action: {show}, closeModal} = useModalContext()
    const {project, target, issue, article, setAttachment, setProjectAndReset, setTargetAndReset, setIssueAndReset, setArticleAndReset} = useFilterContext()

    const {projects, projectsLoading, fetchNextProjects, onSearchChange: onProjectSearch} = useProjects()
    const {articles, articlesLoading, fetchNextArticles, onFilterChange: onArticleFilter} = useArticles(false)
    const {issues, issuesLoading, fetchNextIssues, onFilterChange: onIssueFilter} = useIssues(false)

    const [diagramName, setDiagramName] = useState<string | undefined>(undefined)

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

    const onSelectProject = useCallback((project: Project) => {
        setProjectAndReset(project)
        if (target === Target.ARTICLE) {
            onArticleFilter({project: project})
        } else {
            onIssueFilter({project: project})
        }
    }, [setProjectAndReset, onArticleFilter, onIssueFilter, target])


    return (
        <Dialog
            show={show}
            onCloseAttempt={closeModal}
        >
            <div className={"flex flex-col p-5 "}>
                <div className={"flex flex-row space-x-2 align-middle"}>
                    <h1 style={{fontSize: "16px", fontWeight: "bold"}}> {t('attachTo')}</h1>
                    <Button onClick={() => setTargetAndReset(Target.ARTICLE)} active={target === Target.ARTICLE} height={ControlsHeight.S}>{t('article')}</Button>
                    <h1 style={{fontSize: "16px", fontWeight: "bold"}}> {t('or')}</h1>
                    <Button onClick={() => setTargetAndReset(Target.ISSUE)} active={target === Target.ISSUE} height={ControlsHeight.S}>{t('issue')}</Button>
                </div>

                <Select
                    className={"pt-2 forceFullWidth"}
                    popupClassName={"remove-input-focus"}
                    selectedLabel={t('project')}
                    label={t('selectProject')}
                    filter={{placeholder: t("filterProjects")}}
                    loadingMessage={t('loading')}
                    notFoundMessage={t('noProjectsFound')}
                    selected={nullableProjectToSelectItem(project)}
                    loading={projectsLoading}
                    data={projects?.map(projectToSelectItem)}
                    onSelect={(item) => item && onSelectProject(item.model)}
                    onLoadMore={() => void fetchNextProjects()}
                    onFilter={(text) => onProjectSearch(text)}
                    renderOptimization={false}
                />

                {target === Target.ARTICLE ?
                    <Select
                        className={"pt-2 forceFullWidth"}
                        popupClassName={"remove-input-focus"}
                        label={t('selectArticle')}
                        selectedLabel={t('article')}
                        filter={{placeholder: t("filterArticles")}}
                        selected={nullableArticleToSelectItem(article)}
                        loadingMessage={t('loading')}
                        notFoundMessage={t('noArticlesFound')}
                        loading={articlesLoading}
                        data={articles?.map(articleToSelectItem)}
                        onLoadMore={() => void fetchNextArticles()}
                        onSelect={(item) => item && setArticleAndReset(item.model)}
                        onFilter={(text) => onArticleFilter({project: project, search: text})}
                        renderOptimization={false}
                        disabled={project === undefined}

                    />
                    :
                    <Select
                        className={"pt-2 forceFullWidth"}
                        popupClassName={"remove-input-focus"}
                        selectedLabel={t('issue')}
                        selected={nullableIssueToSelectItem(issue)}
                        label={t('selectIssue')}
                        filter={{placeholder: t("filterIssues")}}
                        loading={issuesLoading}
                        loadingMessage={t('loading')}
                        onLoadMore={() => void fetchNextIssues()}
                        notFoundMessage={t('noIssuesFound')}
                        data={issues?.map(issueToSelectItem)}
                        onSelect={(item) => item && setIssueAndReset(item.model)}
                        onFilter={(text) => onIssueFilter({project: project, search: text})}
                        disabled={project === undefined}
                    />
                }

                <Input
                    value={diagramName}
                    onChange={(i) => setDiagramName(i.target.value)}
                    className={"pt-2 remove-input-focus forceFullWidth"}
                    placeholder={"Name"}
                    label={t('diagrammName')}
                    disabled={issue === undefined && article === undefined}
                />

                <div className={"flex flex-row justify-end pt-4"}>
                    <Button height={ControlsHeight.S} onClick={() => {
                        closeModal()
                        setDiagramName(undefined)
                    }}> {t('cancel')}</Button>
                    <Button height={ControlsHeight.S} onClick={() => onAddNewDiagramm()} className={"ms-2"}
                            style={{backgroundColor: 'var(--ring-main-color)', color: 'white'}}> {t('add')}</Button>
                </div>
            </div>
        </Dialog>
    )
}
