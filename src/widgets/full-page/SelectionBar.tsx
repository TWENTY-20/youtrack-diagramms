import {useCallback, useEffect, useState} from "react";
import Select from "@jetbrains/ring-ui-built/components/select/select";
import {useTranslation} from "react-i18next";
import {Article, ArticleAttachment, Attachment, AttachmentWrapper, Issue, Project} from "./entities.ts";
import {host} from "./youTrackApp.ts";
import Breadcrumbs from "@jetbrains/ring-ui-built/components/breadcrumbs/breadcrumbs";
import ClickableLink from "@jetbrains/ring-ui-built/components/link/clickableLink";
import Button from "@jetbrains/ring-ui-built/components/button/button";
import Icon from "@jetbrains/ring-ui-built/components/icon";
import Settings from "@jetbrains/icons/settings";
import {ControlsHeight} from "@jetbrains/ring-ui-built/components/global/controls-height";
import Popup from "@jetbrains/ring-ui-built/components/popup/popup";
import Input from "@jetbrains/ring-ui-built/components/input/input";
import {CacheResponse} from "./types.ts";


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

    const [selectHidden, setSelectHidden] = useState(false)
    const [addPopUpHidden, setAddPopUpHidden] = useState(true)
    const [newDiagrammName, setNewDiagrammName] = useState<string | undefined>(undefined)
    const [articleIdsWithAttachment, setArticleIdsWithAttachment] = useState<string[]>([])
    const [issueIdsWithAttachment, setIssueIdsWithAttachment] = useState<string[]>([])
    const [projectsIdsWithAttachment, setProjectIdsWithAttachment] = useState<string[]>([])


    const projectToSelectItem = (it: Project) => ({key: it.id, label: it.name, avatar: it.iconUrl, model: it});
    const articleToSelectItem = (it: Article) => ({key: it.id, label: it.summary, model: it});
    const issueToSelectItem = (it: Issue) => ({key: it.id, label: it.summary, model: it});
    const attachmentToSelectItem = (it: Attachment) => ({key: it.id, label: it.name, model: it});

    const nullableProjectToSelectItem = (it: Project | null) => (it === null ? null : projectToSelectItem(it));
    const nullableArticleToSelectItem = (it: Article | null) => (it === null ? null : articleToSelectItem(it));
    const nullableIssueToSelectItem = (it: Issue | null) => (it === null ? null : issueToSelectItem(it));
    const nullableAttachmentToSelectItem = (it: Attachment | null) => (it === null ? null : attachmentToSelectItem(it));


    useEffect(() => {
        loadIds()
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
                                    setSelectHidden(true)
                                }
                            })
                        }
                    })
                })
            }
        })

    }, []);

    function loadIds() {
        let projectIds: (string | undefined)[] = []
        void host.fetchYouTrack(`articles?fields=id,attachments(id,base64Content),project(id)`).then((articles: Article[]) => {
            articles = articles.filter(i => i.attachments.filter(a => extractMediaType(a.base64Content) === 'image/svg+xml').length > 0 )
            setArticleIdsWithAttachment(articles.map((article: Article) => article.id))
            projectIds = articles.map(a => a.project?.id)
        }).then(() => {
            void host.fetchYouTrack(`issues?fields=id,attachments(id,base64Content),project(id)`).then((issues: Issue[]) => {
                issues = issues.filter(i => i.attachments.filter(a => extractMediaType(a.base64Content) === 'image/svg+xml').length > 0)
                setIssueIdsWithAttachment(issues.map((issue: Issue) => issue.id))
                projectIds = [...projectIds, ...issues.map(a => a.project?.id)]
                const projects = [...new Set(projectIds.filter(p => p !== undefined))]
                console.log(projects)
                setProjectIdsWithAttachment(projects)
            })
        })

    }


    function loadProjects(onlyWithAttachments: boolean = false) {
        void host.fetchYouTrack(`admin/projects?fields=id,name,iconUrl`).then((projects: Project[]) => {
            if (onlyWithAttachments) {
                projects = projects.filter(p => projectsIdsWithAttachment.includes(p.id))
            }
            setProjects(projects);
        })
    }

    function loadArticles(project: Project | null, onlyWithAttachments: boolean = false) {
        if (!project) return;
        void host.fetchYouTrack(`admin/projects/${project.id}/articles?fields=id,summary,idReadable`).then((articles: Article[]) => {
            if (onlyWithAttachments) {
                articles = articles.filter(i => articleIdsWithAttachment.includes(i.id))
            }
            setArticles(articles);
        })
    }

    function loadIssues(project: Project | null, onlyWithAttachments: boolean = false) {
        if (!project) return;
        void host.fetchYouTrack(`admin/projects/${project.id}/issues?fields=id,summary,idReadable`).then((issues: Issue[]) => {
            if (onlyWithAttachments) {
                issues = issues.filter(i => issueIdsWithAttachment.includes(i.id))
            }
            setIssues(issues)
        })
    }

    const loadAttachments = useCallback((wrapper: AttachmentWrapper | null) => {
        if (wrapper === null) {
            setAttachments(null)
            setSelectedAttachment(null)
        } else {
            const target = forArticle ? 'articles' : 'issues'
            void host.fetchYouTrack(`${target}/${wrapper.idReadable}/attachments?fields=id,name,extension,base64Content`).then((attachments: Attachment[]) => {
                attachments = attachments.filter(i => extractMediaType(i.base64Content) === 'image/svg+xml')
                setAttachments(attachments)
            })
        }
    }, [forArticle])

    const onSelectProject = useCallback((project: Project, onlyWithAttachments: boolean = false) => {
        if (selectedProject?.id !== project.id) {
            setSelectedArticle(null)
            setSelectedAttachment(null)
            setSelectedIssue(null)
        }
        setSelectedProject(project)
        if (forArticle) {
            loadArticles(project, onlyWithAttachments)
        } else {
            loadIssues(project, onlyWithAttachments)
        }
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

    const onSettingsButtonClick = useCallback(() => {
        if (selectedProject !== null && selectedAttachment !== null && (selectedArticle !== null || selectedIssue !== null)) {
            setSelectHidden(!selectHidden)
        } else {
            host.alert(t('alertSelectAttachment'))
        }
    }, [selectHidden, selectedProject, selectedAttachment, selectedArticle])

    const onAddNewDiagramm = useCallback(() => {
        if (selectedProject !== null && newDiagrammName !== undefined && (selectedArticle !== null || selectedIssue !== null)) {
            setSelectedAttachment({base64Content: "", extension: "", id: "new", name: newDiagrammName + '.svg'})
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

    function extractMediaType(base64Content: string): string | null {
        const regex = /^data:(.+?);base64,/;
        const match = base64Content.match(regex);
        if (match) {
            return match[1];
        } else {
            return null
        }
    }


    return (
        <div className={"flex flex-col p-2 pb-6"}>
            <div style={{height: "65px"}} className={"flex flex-row justify-between items-end"}>
                {selectHidden ?
                    <div className={"flex flex-col"}>
                        <h1 className={"pb-3"} style={{fontSize: "16px", fontWeight: "bold"}}> {t('attachTo')} {
                            forArticle ? t("article") : t('issue')
                        }  </h1>
                        <div className={"flex flex-row"}>
                            <Breadcrumbs>
                                {selectedProject !== null &&
                                    <ClickableLink href={`/projects/${selectedProject.id}`} style={{color: 'var(--ring-link-color)'}} className={"breadCrumbLink"}>
                                        <div className={"flex flex-row"}>
                                            <img style={{height: '20px', width: '20px', paddingRight: '5px'}} src={selectedProject.iconUrl} alt={""} className={"breadCrumbLink"}/>
                                            <span>{selectedProject.name}</span>
                                        </div>
                                    </ClickableLink>
                                }
                                {selectedArticle !== null &&
                                    <ClickableLink href={`/articles/${selectedArticle.id}`} style={{color: 'var(--ring-link-color)'}}>
                                        {selectedArticle.idReadable}
                                    </ClickableLink>
                                }
                                {selectedIssue !== null &&
                                    <ClickableLink href={`/issue/${selectedIssue.id}`} style={{color: 'var(--ring-link-color)'}}>
                                        {selectedIssue.idReadable}
                                    </ClickableLink>
                                }
                                {selectedAttachment !== null && selectedArticle !== null &&
                                    <ClickableLink href={`/articles/${selectedArticle.id}`} style={{color: 'var(--ring-link-color)'}}>
                                        {selectedAttachment.name}
                                    </ClickableLink>
                                }
                                {selectedAttachment !== null && selectedIssue !== null &&
                                    <ClickableLink href={`/issue/${selectedIssue.id}`} style={{color: 'var(--ring-link-color)'}}>
                                        {selectedAttachment.name}
                                    </ClickableLink>
                                }
                            </Breadcrumbs>
                        </div>
                    </div>
                    :
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
                                    notFoundMessage={t('noArticlesFound')}
                                    data={articles?.map(articleToSelectItem)}
                                    onSelect={(item) => {
                                        if (!item) return
                                        onSelectArticle(item.model)
                                    }}
                                    popupClassName={"remove-input-focus"}
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
                                filter={{placeholder: t("filterattachments")}}
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
                }
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
                                    className={"pt-2"}
                                    selected={nullableProjectToSelectItem(selectedProject)}
                                    label={t('selectProject')}
                                    filter={{placeholder: t("filterProjects")}}
                                    loading={projects === null}
                                    loadingMessage={t('loading')}
                                    notFoundMessage={t('noProjectsFound')}
                                    data={projects?.map(projectToSelectItem)}
                                    onOpen={loadProjects}
                                    onSelect={(item) => {
                                        if (!item) return
                                        onSelectProject(item.model)
                                    }}
                                    selectedLabel={t('project')}
                                >
                                </Select>

                                {forArticle ?
                                    <Select
                                        className={"pt-2"}
                                        selected={nullableArticleToSelectItem(selectedArticle)}
                                        label={t('selectArticle')}
                                        filter={{placeholder: t("filterArticles")}}
                                        loading={articles === null}
                                        loadingMessage={t('loading')}
                                        notFoundMessage={t('noArticlesFound')}
                                        data={articles?.map(articleToSelectItem)}
                                        onSelect={(item) => {
                                            if (!item) return
                                            onSelectArticle(item.model)
                                        }}
                                        selectedLabel={t('article')}
                                        popupClassName={"remove-input-focus"}
                                    >
                                    </Select>
                                    :
                                    <Select
                                        className={"pt-2"}
                                        selected={nullableIssueToSelectItem(selectedIssue)}
                                        label={t('selectIssue')}
                                        filter={{placeholder: t("filterIssues")}}
                                        loading={issues === null}
                                        loadingMessage={t('loading')}
                                        onOpen={() => loadIssues(selectedProject)}
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
                                }} className={"pt-2 remove-input-focus"} placeholder={"Name"} label={t('diagrammName')}/>

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
                    <Button className={"ms-2"} onClick={onSettingsButtonClick} height={ControlsHeight.S} active={!selectHidden}>
                        <Icon glyph={Settings}
                              className="text-[var(--ring-icon-color)] hover:text-[var(--ring-link-hover-color)]"
                              height={15}
                              width={15}
                        />
                    </Button>
                </div>

            </div>
        </div>
    )
}
