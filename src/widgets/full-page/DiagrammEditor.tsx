import {DrawIoEmbed} from "react-drawio";
import {Article, ArticleAttachment} from "./entities.ts";
import {host} from "./youTrackApp.ts";
import {useTranslation} from "react-i18next";
import {useEffect, useState} from "react";
import {EventData} from "./types.ts";


export default function DiagrammEditor({selectedArticle, selectedAttachment, setSelectedAttachment}: {
    selectedArticle: Article | null,
    selectedAttachment: ArticleAttachment | null,
    setSelectedAttachment: (attachment: ArticleAttachment) => void
}) {

    const {t} = useTranslation();
    const [xml, setXml] = useState<string>("")




    useEffect(() => {
        window.addEventListener('message', onEvent)

        return () => {
            window.removeEventListener('message', onEvent);
        };
    }, [selectedArticle, selectedAttachment]);

    useEffect(() => {
        setXml(selectedAttachment?.base64Content ?? "")
    }, [selectedAttachment]);

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
            }
        } catch (e) {
            return
        }
    }

    const onSaveDiagramm = async (data: string) => {
        if (selectedArticle === null || selectedAttachment === null) {
            host.alert(t('alert_select_items'))
            return new Promise<boolean>((resolve) => {
                resolve(false)
            })
        } else {
            if (selectedAttachment.id === 'new') {
                const formData = new FormData();
                return fetch(data ?? "data:;base64")
                    .then(res => res.blob())
                    .then((blob) => formData.append(selectedAttachment.name, new File([blob], selectedAttachment.name)))
                    .then(async () => {
                        return host.fetchYouTrack(`articles/${selectedArticle.idReadable}/attachments?fields=id,name,extension,base64Content`, {
                            method: "POST",
                            headers: {
                                "Content-Type": undefined,
                            },
                            sendRawBody: true,
                            body: formData
                        });
                    }).then((res: ArticleAttachment[]) => {
                        if (res.length > 0) {
                            setSelectedAttachment(res[0]);
                            return true
                        } else return false
                    })
            } else {
                const diagramm = {
                    name: selectedAttachment.name,
                    base64Content: data,
                }
                return host.fetchYouTrack(`articles/${selectedArticle.idReadable}/attachments/${selectedAttachment.id}?fields=id,name,extension,base64Content`, {
                    method: "POST",
                    body: diagramm
                }).then((res: ArticleAttachment) => {
                    return !!res;
                })
            }
        }
    }


    return (
        <DrawIoEmbed
            key={'drawio_embedded'}
            xml={xml}
            urlParameters={{
                ui: 'dark',
                spin: true,
                libraries: true,
                saveAndExit: false
            }}/>
    )
}
