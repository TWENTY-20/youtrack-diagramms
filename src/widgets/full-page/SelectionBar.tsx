import {useCallback, useEffect, useState} from "react";
import Select from "@jetbrains/ring-ui-built/components/select/select";
import {useTranslation} from "react-i18next";
import {Article, ArticleAttachment, Attachment, AttachmentWrapper, Issue, Project} from "./entities.ts";
import {host} from "./youTrackApp.ts";
import Button from "@jetbrains/ring-ui-built/components/button/button";
import {ControlsHeight} from "@jetbrains/ring-ui-built/components/global/controls-height";
import Popup from "@jetbrains/ring-ui-built/components/popup/popup";
import Input from "@jetbrains/ring-ui-built/components/input/input";
import {CacheResponse} from "./types.ts";
import {fetchAll, fetchSection} from "./util.ts";


export default function SelectionBar({selectedArticle, setSelectedArticle, selectedAttachment, setSelectedAttachment, selectedIssue, setSelectedIssue, forArticle, setForArticle}: {
    selectedArticle: Article | null;
    setSelectedArticle: (selectedArticle: Article | null) => void;
    selectedAttachment: ArticleAttachment | null;
    setSelectedAttachment: (selectedAttachment: ArticleAttachment | null) => void;
    selectedIssue: Issue | null;
    setSelectedIssue: (selectedIssue: Issue | null) => void;
    forArticle: boolean;
    setForArticle: (forArticle: boolean) => void;
}) {


    const {t} = useTranslation();
    const [projects, setProjects] = useState<Project[] | null>(null)
    const [selectedProject, setSelectedProject] = useState<Project | null>(null)
    const [articles, setArticles] = useState<Article[] | null>(null)
    const [attachments, setAttachments] = useState<ArticleAttachment[] | null>(null)
    const [issues, setIssues] = useState<Issue[] | null>(null)

    const [addPopUpHidden, setAddPopUpHidden] = useState(true)
    const [newDiagrammName, setNewDiagrammName] = useState<string | undefined>(undefined)

    const [currentSkip, setCurrentSkip] = useState<number>(0)
    const [filterText, setFilterText] = useState('')

    const projectToSelectItem = (it: Project) => ({key: it.id, label: it.name, avatar: it.iconUrl, model: it});
    const articleToSelectItem = (it: Article) => ({key: it.id, label: it.summary, model: it});
    const issueToSelectItem = (it: Issue) => ({key: it.id, label: it.summary, model: it});
    const attachmentToSelectItem = (it: Attachment) => ({key: it.id, label: it.name, model: it});

    const nullableProjectToSelectItem = (it: Project | null) => (it === null ? null : projectToSelectItem(it));
    const nullableArticleToSelectItem = (it: Article | null) => (it === null ? null : articleToSelectItem(it));
    const nullableIssueToSelectItem = (it: Issue | null) => (it === null ? null : issueToSelectItem(it));
    const nullableAttachmentToSelectItem = (it: Attachment | null) => (it === null ? null : attachmentToSelectItem(it));


    const PAGINATION_STEP = 1000

    useEffect(() => {
        void host.fetchApp("backend/getAttachment", {}).then((res: CacheResponse) => {
            if (!res) return
            if ((Math.floor(Date.now() / 1000) - res.edited) < 15) {
                setForArticle(res.forArticle)
                const target = res.forArticle ? 'articles' : 'issues'
                void host.fetchYouTrack(`${target}/${res.id}?fields=id,idReadable,summary,project(id)`).then((wrapper: AttachmentWrapper) => {
                    void host.fetchYouTrack(`admin/projects/${wrapper.project?.id}?fields=id,name,iconUrl`).then((project: Project) => {
                        setSelectedProject(project)
                        if (res.forArticle) {
                            setSelectedArticle({...wrapper, attachments: []})
                        } else {
                            setSelectedIssue({...wrapper, attachments: []})
                        }
                        if (res.attachmentId === 'new') {
                            setAddPopUpHidden(false)
                        } else {
                            void host.fetchYouTrack(`${target}/${wrapper.idReadable}/attachments/${res.attachmentId}?fields=id,name,extension,base64Content`).then((attachment: Attachment) => {
                                if (attachment) {
                                    setSelectedAttachment(attachment)
                                }
                            })
                        }
                    })
                })
            }
        })

    }, []);

    useEffect(() => {
        setSelectedProject(null)
        setSelectedIssue(null)
        setSelectedArticle(null)
        setSelectedAttachment(null)
        setProjects(null)
        setArticles(null)
        setIssues(null)
        setAttachments(null)
        setCurrentSkip(0)
    }, [forArticle]);


    const loadProjects = useCallback((onlyWithAttachments: boolean = false) => {
        setCurrentSkip(0)
        void fetchAll<Project>('admin/projects?fields=id,name,iconUrl').then(async projects => {
                if (onlyWithAttachments) {
                    const result: Project[] = []
                    if (forArticle) {
                        for (const project of projects) {
                            await fetchSection<Article>(`articles?fields=id,summary,idReadable,project(id)&query=project:${escapeProjectName(project.name)}+attachments:*.svg`, 0, 1).then(a => {
                                if (a.length > 0) result.push(project)
                            })
                        }
                    } else {
                        for (const project of projects) {
                            await fetchSection<Issue>(`issues?fields=id,summary,idReadable,project(id)&query=project:${escapeProjectName(project.name)}+attachments:*.svg`, 0, 1).then(a => {
                                if (a.length > 0) result.push(project)
                            })
                        }
                    }
                    setProjects(result)
                } else {
                    setProjects(projects)
                }
            }
        )
    }, [forArticle])

    const loadArticles = useCallback((project: Project | null, onlyWithAttachments: boolean = false) => {
        if (!project) return;
        const query = onlyWithAttachments ? '+attachments:*.svg' : ''
        void fetchSection<Article>(`articles?fields=id,summary,idReadable,project(id)&query=project:${escapeProjectName(project.name)}${query}`, 0, PAGINATION_STEP).then((a: Article[]) => {
            setArticles(a)
            setCurrentSkip(PAGINATION_STEP)
        })
    }, [articles, setArticles])

    const loadIssues = useCallback((project: Project | null, onlyWithAttachments: boolean = false) => {
        if (!project) return;
        const query = onlyWithAttachments ? '+attachments:*.svg' : ''
        void fetchSection<Issue>(`issues?fields=id,summary,idReadable,project(id)&query=project:${escapeProjectName(project.name)}${query}`, 0, PAGINATION_STEP).then((a: Issue[]) => {
            setIssues(a)
            setCurrentSkip(PAGINATION_STEP)
        })
    }, [issues, setIssues])


    const loadAttachments = useCallback((wrapper: AttachmentWrapper | null) => {
        console.log('attach')
        console.log(wrapper)
        if (wrapper === null) {
            setAttachments(null)
            setSelectedAttachment(null)
        } else {
            const target = forArticle ? 'articles' : 'issues'
            void fetchAll<Attachment>(`${target}/${wrapper.idReadable}/attachments?fields=id,name,extension,base64Content,mimeType`).then((attachments: Attachment[]) => {
                attachments = attachments.filter(i => i.mimeType === 'image/svg+xml')
                setAttachments(attachments)
            })
        }
    }, [forArticle])

    const onSelectProject = useCallback((project: Project) => {
        if (selectedProject?.id !== project.id) {
            setSelectedArticle(null)
            setSelectedAttachment(null)
            setSelectedIssue(null)
        }
        setSelectedProject(project)
    }, [selectedProject, selectedArticle, selectedAttachment])


    const onSelectArticle = useCallback((article: Article) => {
        if (selectedArticle?.id !== article.id) {
            setSelectedAttachment(null)
        }
        setSelectedIssue(null)
        setSelectedArticle(article)
        loadAttachments(article)
    }, [selectedProject, selectedArticle, selectedAttachment])

    const onSelectIssue = useCallback((issue: Issue) => {
        if (selectedIssue?.id !== issue.id) {
            setSelectedAttachment(null)
        }
        setSelectedArticle(null)
        setSelectedIssue(issue)
        loadAttachments(issue)
    }, [selectedProject, selectedIssue, selectedAttachment])

    const onSelectAttachment = useCallback((attachment: ArticleAttachment) => {
        setSelectedAttachment(attachment)
    }, [selectedProject, selectedArticle, selectedAttachment])

    const onAddNewDiagramm = useCallback(() => {
        if (selectedProject !== null && newDiagrammName !== undefined && (selectedArticle !== null || selectedIssue !== null)) {
            setSelectedAttachment({article: undefined, mimeType: "", size: 0, base64Content: "", extension: "", id: "new", name: newDiagrammName + '.svg'})
            setAddPopUpHidden(true)
            setNewDiagrammName(undefined)
        } else {
            if (forArticle) {
                host.alert(t('alert_select_items_article'))
            } else {
                host.alert(t('alert_select_items_issue'))

            }
        }
    }, [newDiagrammName])

    const onLoadMoreArticles = useCallback((onlyWithAttachments: boolean = false) => {
        console.log('loadMoreArticles')
        if (!selectedProject) return;
        let query = onlyWithAttachments ? `+attachments:*.svg` : ''
        query = query + (filterText !== '' ? `+*${filterText}*` : '')

        void fetchSection<Article>(`articles?fields=id,summary,idReadable,project(id)&query=project:${escapeProjectName(selectedProject.name)}${query}`, currentSkip, PAGINATION_STEP).then((a: Article[]) => {
            if (a.length === 0) return;
            if (articles !== null) {
                setArticles([...articles, ...a])
                return
            }
            setArticles(a)
        }).finally(() => setCurrentSkip(currentSkip + PAGINATION_STEP))
    }, [selectedProject, currentSkip, articles, filterText]);

    const onFilterArticles = useCallback((text: string, onlyWithAttachments: boolean = false) => {
        console.log(text)
        if (!selectedProject) return;
        setFilterText(text)
        let query = onlyWithAttachments ? `+attachments:*.svg` : ''
        query = query + (filterText !== '' ? `+*${filterText}*` : '')
        void fetchSection<Article>(`articles?fields=id,summary,idReadable,project(id)&query=project:${escapeProjectName(selectedProject.name)}${query}`, 0, PAGINATION_STEP).then((list: Article[]) => {
            setArticles(list)
            setCurrentSkip(PAGINATION_STEP)
        })
    }, [selectedProject]);

    const onLoadMoreIssues = useCallback((onlyWithAttachments: boolean = false) => {
        if (!selectedProject) return;
        let query = onlyWithAttachments ? `+attachments:*.svg` : ''
        query = query + (filterText !== '' ? `+*${filterText}*` : '')
        void fetchSection<Issue>(`issues?fields=id,summary,idReadable,project(id)&query=project:${escapeProjectName(selectedProject.name)}${query}`, currentSkip, PAGINATION_STEP).then((a: Issue[]) => {
            if (a.length === 0) return;
            if (issues !== null) {
                setIssues([...issues, ...a])
                return
            }
            setIssues(a)
        }).finally(() => setCurrentSkip(currentSkip + PAGINATION_STEP))
    }, [selectedProject, currentSkip, issues, filterText]);

    const onFilterIssues = useCallback((text: string, onlyWithAttachments: boolean = false) => {
        if (!selectedProject) return;
        setFilterText(text)
        let query = onlyWithAttachments ? `+attachments:*.svg` : ''
        query = query + (filterText !== '' ? `+*${filterText}*` : '')
        void fetchSection<Issue>(`issues?fields=id,summary,idReadable,project(id)&query=project:${escapeProjectName(selectedProject.name)}${query}`, 0, PAGINATION_STEP).then((list: Issue[]) => {
            setIssues(list)
            setCurrentSkip(PAGINATION_STEP)
        })
    }, [selectedProject]);


    function escapeProjectName(name: string) {
        name = name.replace(' ', '+')
        return `%7B${name}%7D`
    }


    return (
        <div className={"flex flex-col p-2 pb-6"}>
            <div style={{height: "65px"}} className={"flex flex-row justify-between items-end"}>
                <div className={"flex flex-col"}>
                    <div className={"flex flex-row pb-3 space-x-2"}>
                        <h1 style={{fontSize: "16px", fontWeight: "bold"}}> {t('attachTo')}</h1>
                        <Button onClick={() => {
                            setForArticle(true)
                        }} active={forArticle} height={ControlsHeight.S}>{t('article')}</Button>
                        <h1 style={{fontSize: "16px", fontWeight: "bold"}}> {t('or')}</h1>
                        <Button onClick={() => {
                            setForArticle(false)
                        }} active={!forArticle} height={ControlsHeight.S}>{t('issue')}</Button>
                    </div>

                    <div className={"flex flex-row"}>
                        <Select
                            selected={nullableProjectToSelectItem(selectedProject)}
                            label={t('selectProject')}
                            filter={{placeholder: t("filterProjects")}}
                            loading={projects === null}
                            loadingMessage={t('loading')}
                            notFoundMessage={t('noProjectsFound')}
                            data={projects?.map(projectToSelectItem)}
                            onBeforeOpen={() => setProjects(null)}
                            onOpen={() => loadProjects(true)}
                            onSelect={(item) => {
                                if (!item) return
                                onSelectProject(item.model)
                            }}
                            popupClassName={"remove-input-focus"}
                        >
                        </Select>
                        <p className={"px-2 align-middle"} style={{fontSize: '14pt', color: 'var(--ring-secondary-color)'}}>/</p>
                        {forArticle ?
                            <Select
                                selected={nullableArticleToSelectItem(selectedArticle)}
                                label={t('selectArticle')}
                                filter={{placeholder: t("filterArticles")}}
                                loading={articles === null}
                                loadingMessage={t('loading')}
                                onOpen={() => loadArticles(selectedProject, true)}
                                onLoadMore={() => onLoadMoreArticles(true)}
                                offset={10}
                                notFoundMessage={t('noArticlesFound')}
                                data={articles?.map(articleToSelectItem)}
                                onSelect={(item) => {
                                    if (!item) return
                                    onSelectArticle(item.model)
                                }}
                                popupClassName={"remove-input-focus"}
                                onFilter={(text) => onFilterArticles(text, true)}
                                renderOptimization={false}
                            >
                            </Select>
                            :
                            <Select
                                selected={nullableIssueToSelectItem(selectedIssue)}
                                label={t('selectIssue')}
                                filter={{placeholder: t("filterIssues")}}
                                loading={issues === null}
                                loadingMessage={t('loading')}

                                onOpen={() => loadIssues(selectedProject, true)}
                                onLoadMore={() => onLoadMoreIssues(true)}
                                onFilter={(text) => onFilterIssues(text, true)}
                                notFoundMessage={t('noIssuesFound')}
                                data={issues?.map(issueToSelectItem)}
                                onSelect={(item) => {
                                    if (!item) return
                                    onSelectIssue(item.model)
                                }}
                                popupClassName={"remove-input-focus"}
                            >
                            </Select>
                        }
                        <p className={"px-2 align-middle"} style={{fontSize: '14pt', color: 'var(--ring-secondary-color)'}}>/</p>
                        <Select
                            selected={nullableAttachmentToSelectItem(selectedAttachment)}
                            label={t('selectAttachment')}
                            filter={{placeholder: t("filterAttachments")}}
                            loading={attachments === null}
                            loadingMessage={t('loading')}
                            notFoundMessage={t('noAttachmentsFound')}
                            onOpen={() => loadAttachments(forArticle ? selectedArticle : selectedIssue)}
                            data={attachments?.map(attachmentToSelectItem)}
                            onSelect={(item) => {
                                if (!item) return
                                onSelectAttachment(item.model)
                            }}
                            popupClassName={"remove-input-focus"}
                        >
                        </Select>
                    </div>
                </div>
                <div>
                    <Button id={"new_diagramm_btn"} style={{backgroundColor: "var(--ring-main-color)", color: 'white'}} onClick={() => setAddPopUpHidden(false)} height={ControlsHeight.S}>
                        {t('newDiagramm')}
                        <Popup
                            className={"add-popup"}
                            hidden={addPopUpHidden}
                            onCloseAttempt={() => setAddPopUpHidden(true)}
                            dontCloseOnAnchorClick={true}
                            minWidth={100}
                            trapFocus={true}
                        >
                            <div className={"flex flex-col p-5 "}>
                                <div className={"flex flex-row space-x-2 align-middle"}>
                                    <h1 style={{fontSize: "16px", fontWeight: "bold"}}> {t('attachTo')}</h1>
                                    <Button onClick={() => {
                                        setForArticle(true)
                                        setSelectedAttachment(null)
                                    }} active={forArticle} height={ControlsHeight.S}>{t('article')}</Button>
                                    <h1 style={{fontSize: "16px", fontWeight: "bold"}}> {t('or')}</h1>
                                    <Button onClick={() => {
                                        setForArticle(false)
                                        setSelectedAttachment(null)
                                    }} active={!forArticle} height={ControlsHeight.S}>{t('issue')}</Button>
                                </div>

                                <Select
                                    className={"pt-2 forceFullWidth"}
                                    selected={nullableProjectToSelectItem(selectedProject)}
                                    label={t('selectProject')}
                                    filter={{placeholder: t("filterProjects")}}
                                    loading={projects === null}
                                    loadingMessage={t('loading')}
                                    notFoundMessage={t('noProjectsFound')}
                                    data={projects?.map(projectToSelectItem)}
                                    onOpen={() => void loadProjects()}
                                    onSelect={(item) => {
                                        if (!item) return
                                        onSelectProject(item.model)
                                        setArticles(null)
                                        setIssues(null)
                                    }}
                                    selectedLabel={t('project')}
                                    popupClassName={"remove-input-focus"}
                                >
                                </Select>

                                {forArticle ?
                                    <Select
                                        className={"pt-2 forceFullWidth"}
                                        selected={nullableArticleToSelectItem(selectedArticle)}
                                        label={t('selectArticle')}
                                        filter={{placeholder: t("filterArticles")}}
                                        loading={articles === null}
                                        loadingMessage={t('loading')}
                                        notFoundMessage={t('noArticlesFound')}
                                        data={articles?.map(articleToSelectItem)}
                                        onOpen={() => loadArticles(selectedProject)}
                                        onLoadMore={onLoadMoreArticles}
                                        onFilter={onFilterArticles}
                                        onSelect={(item) => {
                                            if (!item) return
                                            onSelectArticle(item.model)
                                        }}
                                        selectedLabel={t('article')}
                                        popupClassName={"remove-input-focus"}
                                        renderOptimization={false}

                                    >
                                    </Select>
                                    :
                                    <Select
                                        className={"pt-2 forceFullWidth"}
                                        selected={nullableIssueToSelectItem(selectedIssue)}
                                        label={t('selectIssue')}
                                        filter={{placeholder: t("filterIssues")}}
                                        loading={issues === null}
                                        loadingMessage={t('loading')}
                                        onOpen={() => loadIssues(selectedProject)}
                                        onLoadMore={onLoadMoreIssues}
                                        onFilter={onFilterIssues}
                                        notFoundMessage={t('noIssuesFound')}
                                        data={issues?.map(issueToSelectItem)}
                                        onSelect={(item) => {
                                            if (!item) return
                                            onSelectIssue(item.model)
                                        }}
                                        selectedLabel={t('issue')}
                                        popupClassName={"remove-input-focus"}
                                    >
                                    </Select>
                                }

                                <Input value={newDiagrammName} onChange={(i) => {
                                    setNewDiagrammName(i.target.value)
                                }} className={"pt-2 remove-input-focus forceFullWidth"} placeholder={"Name"} label={t('diagrammName')}/>

                                <div className={"flex flex-row justify-end pt-4"}>
                                    <Button height={ControlsHeight.S} onClick={() => {
                                        setAddPopUpHidden(true)
                                        setNewDiagrammName(undefined)
                                    }}> {t('cancel')}</Button>
                                    <Button height={ControlsHeight.S} onClick={() => onAddNewDiagramm()} className={"ms-2"}
                                            style={{backgroundColor: 'var(--ring-main-color)', color: 'white'}}> {t('add')}</Button>
                                </div>
                            </div>
                        </Popup>
                    </Button>
                </div>
            </div>
        </div>
    )
}
