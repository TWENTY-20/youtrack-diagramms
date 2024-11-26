import {DrawIoEmbed} from "react-drawio";
import {Article, ArticleAttachment, Attachment, AttachmentWrapper, Issue} from "./entities.ts";
import {host} from "./youTrackApp.ts";
import {useTranslation} from "react-i18next";
import {useCallback, useEffect, useState} from "react";
import {EventData} from "./types.ts";
import Popup from "@jetbrains/ring-ui-built/components/popup/popup";
import Button from "@jetbrains/ring-ui-built/components/button/button";
import {ControlsHeight} from "@jetbrains/ring-ui-built/components/global/controls-height";


export default function DiagrammEditor({selectedArticle, selectedIssue, selectedAttachment, setSelectedAttachment, forArticle}: {
    selectedArticle: Article | null,
    selectedIssue: Issue | null
    selectedAttachment: ArticleAttachment | null,
    setSelectedAttachment: (attachment: ArticleAttachment | null) => void,
    forArticle: boolean
}) {

    const {t} = useTranslation();
    const [xml, setXml] = useState<string>("")
    const [confirmationHidden, setConfirmationHidden] = useState(true)

    useEffect(() => {
        window.addEventListener('message', onEvent)

        return () => {
            window.removeEventListener('message', onEvent);
        };
    }, [selectedArticle, selectedAttachment, selectedIssue]);

    useEffect(() => {
        setXml(selectedAttachment?.base64Content ?? "")
    }, [selectedAttachment]);

    useEffect(() => {
        setSelectedAttachment(null)
    }, [forArticle]);


    function onEvent(evt: MessageEvent) {
        try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            const data = JSON.parse(evt.data) as EventData;
            switch (data.event) {
                case 'export':
                    if (data.data) {
                        void onSaveDiagramm(data.data).then(v => {
                            if (v) {
                                host.alert(t('alert_diagramm_saved'))
                            } else {
                                console.log('not saved')
                            }
                        })
                    } else {
                        console.log('no data')
                    }
                    break;
                case 'exit':
                    setConfirmationHidden(false)
                    break

            }
        } catch (e) {
            return
        }
    }


    const onSaveDiagramm = async (data: string) => {
        if (forArticle) {
            if (selectedArticle === null || selectedAttachment === null) {
                host.alert(t('alert_select_items_article'))
                return new Promise<boolean>((resolve) => {
                    resolve(false)
                })
            } else {
                return saveDiagramm(selectedArticle, selectedAttachment, 'articles', data)
            }

        } else {
            if (selectedIssue === null || selectedAttachment === null) {
                host.alert(t('alert_select_items_issue'))
                return new Promise<boolean>((resolve) => {
                    resolve(false)
                })
            } else {
                return saveDiagramm(selectedIssue, selectedAttachment, 'issues', data)
            }
        }
    }

    async function saveDiagramm(wrapper: AttachmentWrapper, selectedAttachment: Attachment, target: string, data: string) {
        const diagramm = {
            name: selectedAttachment.name,
            base64Content: data,
        }
        if (selectedAttachment.id === 'new') {
            //const formData = new FormData();
            if (target === 'issues') {
                return host.fetchYouTrack(`${target}/${wrapper.idReadable}/attachments?fields=id,name,extension,base64Content`, {
                    method: "POST",
                    body: diagramm
                }).then((res: Attachment) => {
                    return !!res;
                })

            } else {
                const body = {
                    id: wrapper.idReadable,
                    content: data,
                    filename: selectedAttachment.name
                }
                return host.fetchApp("backend/addAttachmentToArticle", {
                    method: "POST",
                    body: body
                }).then((res) => {
                    return !!res
                })
            }
        } else {
            return host.fetchYouTrack(`${target}/${wrapper.idReadable}/attachments/${selectedAttachment.id}?fields=id,name,extension,base64Content`, {
                method: "POST",
                body: diagramm
            }).then((res: Attachment) => {
                return !!res;
            })
        }
    }

    const onLeavePage = useCallback(() => {
        let target = ""
        if (forArticle) {
            target = `/articles${selectedArticle !== null ? '/' + selectedArticle?.id : ''}`
        } else {
            target = `/issue${selectedIssue !== null ? '/' + selectedIssue.id : ''}`
        }
        window.parent.location.href = target
    }, [forArticle, selectedIssue, selectedArticle])

    return (
        <div className={"w-full h-full relative"}>
            <div id={"editor"} className={"w-full h-full"}>
                <DrawIoEmbed
                    key={'drawio_embedded'}
                    xml={xml}
                    urlParameters={{
                        ui: 'kennedy',
                        spin: true,
                        libraries: true,
                        saveAndExit: false
                    }}/>
            </div>
            <Popup
                className={"add-popup confirmation-popup"}
                hidden={confirmationHidden}
                onCloseAttempt={() => setConfirmationHidden(true)}
                dontCloseOnAnchorClick={true}
                trapFocus={true}
            >
                <div className={"flex flex-col p-5"}>
                    <h1 className={'font-bold pb-3'} style={{fontSize: "16px"}}>{t('leavePageQ')}</h1>
                    <p className={"pb-5"}>{t('remindSave')}</p>
                    <div className={"flex flex-row justify-end space-x-2"}>
                        <Button height={ControlsHeight.S} onClick={() => {
                            setConfirmationHidden(true)
                        }}>{t('cancel')}</Button>
                        <Button height={ControlsHeight.S} style={{backgroundColor: "var(--ring-main-color)"}} onClick={onLeavePage}>{t('leavePage')}</Button>
                    </div>
                </div>

            </Popup>
        </div>
    )
}
