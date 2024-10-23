import {useCallback, useEffect, useState} from "react";
import Select from "@jetbrains/ring-ui-built/components/select/select";
import {useTranslation} from "react-i18next";
import {Article, ArticleAttachment, Project} from "./entities.ts";
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


export default function SelectionBar({selectedArticle, setSelectedArticle, selectedAttachment, setSelectedAttachment,}: {
    selectedArticle: Article | null;
    setSelectedArticle: (selectedArticle: Article | null) => void;
    selectedAttachment: ArticleAttachment | null;
    setSelectedAttachment: (selectedAttachment: ArticleAttachment | null) => void;
}) {

    const {t} = useTranslation();
    const [projects, setProjects] = useState<Project[] | null>(null)
    const [selectedProject, setSelectedProject] = useState<Project | null>(null)
    const [articles, setArticles] = useState<Article[] | null>(null)
    const [attachments, setAttachments] = useState<ArticleAttachment[] | null>(null)
    const [selectHidden, setSelectHidden] = useState(false)
    const [addPopUpHidden, setAddPopUpHidden] = useState(true)
    const [newDiagrammName, setNewDiagrammName] = useState<string | undefined>(undefined)


    const projectToSelectItem = (it: Project) => ({key: it.id, label: it.name, avatar: it.iconUrl, model: it});
    const articleToSelectItem = (it: Article) => ({key: it.id, label: it.summary, model: it});
    const attachmentToSelectItem = (it: ArticleAttachment) => ({key: it.id, label: it.name, model: it});
    const nullableProjectToSelectItem = (it: Project | null) => (it === null ? null : projectToSelectItem(it));
    const nullableArticleToSelectItem = (it: Article | null) => (it === null ? null : articleToSelectItem(it));
    const nullableAttachmentToSelectItem = (it: ArticleAttachment | null) => (it === null ? null : attachmentToSelectItem(it));


    useEffect(() => {
        void host.fetchApp("backend/getAttachment", {}).then((res: CacheResponse) => {
            if (!res) return
            if ((Math.floor(Date.now() / 1000) - res.edited) < 15) {
                void host.fetchYouTrack(`articles/${res.articleId}?fields=id,idReadable,summary,project(id)`).then((article: Article) => {
                    console.log(article)
                    void host.fetchYouTrack(`admin/projects/${article.project?.id}?fields=id,name,iconUrl`).then((project: Project) => {
                        console.log(project)
                        setSelectedProject(project)
                        setSelectedArticle(article)
                        if (res.attachmentId === 'new') {
                            setAddPopUpHidden(false)
                        } else {
                            void host.fetchYouTrack(`articles/${article.idReadable}/attachments/${res.attachmentId}?fields=id,name,extension,base64Content`).then((attachment: ArticleAttachment) => {
                                setSelectedAttachment(attachment)
                            })
                        }
                    })
                })
            }
        })
    }, []);


    function loadProjects() {
        void host.fetchYouTrack(`admin/projects?fields=id,name,iconUrl`).then((projects: Project[]) => {
            setProjects(projects);
        })
    }

    function loadArticles(project: Project | null) {
        if (!project) return;
        if (articles != null) return
        void host.fetchYouTrack(`admin/projects/${project.id}/articles?fields=id,summary,idReadable`).then((articles: Article[]) => {
            setArticles(articles);
        })
    }

    function loadAttachments(article: Article | null) {
        if (article === null) {
            setAttachments(null)
            setSelectedAttachment(null)
        } else {
            void host.fetchYouTrack(`articles/${article.idReadable}/attachments?fields=id,name,extension,base64Content`).then((attachments: ArticleAttachment[]) => {
                attachments = attachments.filter(i => extractMediaType(i.base64Content) === 'image/svg+xml')
                setAttachments(attachments)
            })
        }
    }

    const onSelectProject = useCallback((project: Project) => {
        if (selectedProject?.id !== project.id) {
            setSelectedArticle(null)
            setSelectedAttachment(null)
        }
        setSelectedProject(project)
        loadArticles(project)
    }, [selectedProject, selectedArticle, selectedAttachment])

    const onSelectArticle = useCallback((article: Article) => {
        if (selectedArticle?.id !== article.id) {
            setSelectedAttachment(null)
        }
        setSelectedArticle(article)
        loadAttachments(article)
    }, [selectedProject, selectedArticle, selectedAttachment])

    const onSelectAttachment = useCallback((attachment: ArticleAttachment) => {
        setSelectedAttachment(attachment)
    }, [selectedProject, selectedArticle, selectedAttachment])

    const onSettingsButtonClick = useCallback(() => {
        if (selectedProject !== null && selectedArticle !== null && selectedAttachment !== null) {
            setSelectHidden(!selectHidden)
        } else {
            host.alert(t('alertSelectAttachment'))
        }
    }, [selectHidden, selectedProject, selectedAttachment, selectedArticle])

    const onAddNewDiagramm = useCallback(() => {
        if (selectedProject !== null && selectedArticle !== null && newDiagrammName !== undefined) {
            setSelectedAttachment({base64Content: "", extension: "", id: "new", name: newDiagrammName + '.svg'})
            setAddPopUpHidden(true)
            setNewDiagrammName(undefined)
        } else {
            host.alert(t('alert_select_items'))
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
            <div className={"flex flex-row justify-between"}>
                {selectHidden ?
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
                            {selectedAttachment !== null && selectedArticle !== null &&
                                <ClickableLink href={`/articles/${selectedArticle.id}`} style={{color: 'var(--ring-link-color)'}}>
                                    {selectedAttachment.name}
                                </ClickableLink>
                            }
                        </Breadcrumbs>
                    </div>
                    :
                    <div className={"flex flex-row"}>

                        <Select
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
                        >
                        </Select>
                        <p className={"px-2 align-middle"} style={{fontSize: '14pt', color: 'var(--ring-secondary-color)'}}>/</p>
                        <Select
                            selected={nullableArticleToSelectItem(selectedArticle)}
                            label={t('selectArticle')}
                            filter={{placeholder: t("filterArticles")}}
                            loading={articles === null}
                            loadingMessage={t('loading')}
                            onOpen={() => loadArticles(selectedProject)}
                            notFoundMessage={t('noArticlesFound')}
                            data={articles?.map(articleToSelectItem)}
                            onSelect={(item) => {
                                if (!item) return
                                onSelectArticle(item.model)
                            }}
                        >
                        </Select>
                        <p className={"px-2 align-middle"} style={{fontSize: '14pt', color: 'var(--ring-secondary-color)'}}>/</p>
                        <Select
                            selected={nullableAttachmentToSelectItem(selectedAttachment)}
                            label={t('selectAttachment')}
                            filter={{placeholder: t("filterattachments")}}
                            loading={attachments === null}
                            loadingMessage={t('loading')}
                            notFoundMessage={t('noAttachmentsFound')}
                            onOpen={() => loadAttachments(selectedArticle)}
                            data={attachments?.map(attachmentToSelectItem)}
                            onSelect={(item) => {
                                if (!item) return
                                onSelectAttachment(item.model)
                            }}
                        >
                        </Select>
                    </div>
                }
                <div>
                    <Button style={{backgroundColor: "var(--ring-main-color)"}} onClick={() => setAddPopUpHidden(false)} height={ControlsHeight.S}>
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


                                <h1 className={"pb-2"}> {t('createNewDiagramm')}</h1>

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
                                >
                                </Select>

                                <Input value={newDiagrammName} onChange={(i) => {
                                    setNewDiagrammName(i.target.value)
                                }} className={"pt-2"} placeholder={"Name"} label={t('diagrammName')}/>

                                <div className={"flex flex-row justify-end pt-4"}>
                                    <Button height={ControlsHeight.S} onClick={() => {
                                        setAddPopUpHidden(true)
                                        setNewDiagrammName(undefined)
                                    }}> {t('cancel')}</Button>
                                    <Button height={ControlsHeight.S} onClick={() => onAddNewDiagramm()} className={"ms-2"}
                                            style={{backgroundColor: 'var(--ring-main-color)'}}> {t('add')}</Button>
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
