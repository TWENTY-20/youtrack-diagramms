import {host} from "../youTrackApp.ts";
import {useTranslation} from "react-i18next";
import {useCallback, useEffect, useState} from "react";
import {EventData} from "../entities/types.ts";
import {AlertType} from "@jetbrains/ring-ui-built/components/alert/alert";
import {DrawIoEmbed} from "react-drawio";
import {useFilterContext} from "../context/FilterContextProvider.tsx";
import {Target} from "../entities/util.ts";
import {saveDiagramm} from "../util/queries.ts";
import {useConfirmContext} from "../context/ConfirmContextProvider.tsx";


export default function DiagrammEditor() {

    const {t} = useTranslation();
    const [xml, setXml] = useState<string>("")

    const {target, article, issue, attachment} = useFilterContext()
    const {confirm, close} = useConfirmContext()

    useEffect(() => {
        window.addEventListener('message', onEvent)
        return () => {
            window.removeEventListener('message', onEvent);
        };
    }, [attachment]);

    useEffect(() => {
        setXml(attachment?.base64Content ?? "")
    }, [attachment]);


    const onSaveDiagramm = useCallback(async (data: string) => {
        let id: string | undefined = undefined
        if (attachment === undefined) {
            host.alert(t('alert_select_attachment'), AlertType.WARNING)
            return
        }
        if (target === Target.ARTICLE) {
            if (article === undefined) {
                host.alert(t('alert_select_items_article'))
                return new Promise<boolean>((resolve) => {
                    resolve(false)
                })
            } else {
                id = article.idReadable
            }
        } else {
            if (issue === undefined) {
                host.alert(t('alert_select_items_issue'))
                return new Promise<boolean>((resolve) => {
                    resolve(false)
                })
            } else {
                id = issue.idReadable
            }
        }
        return saveDiagramm(id, attachment, target.valueOf(), data)
    }, [target, issue, article, attachment])

    const onLeavePage = useCallback(() => {
        let href = ''
        if (target === Target.ARTICLE) {
            href = `/articles${article ? '/' + article.id : ''}`
        } else {
            href = `/issue${issue ? '/' + issue.id : ''}`
        }
        window.parent.location.href = href
    }, [target, issue, article])

    const onEvent = useCallback((evt: MessageEvent) => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            const data = JSON.parse(evt.data) as EventData;
            if ("event" in data) {
                switch (data.event) {
                    case 'export':
                        if (data.data) {
                            void onSaveDiagramm(data.data).then(v => {
                                if (v) {
                                    host.alert(t('alert_diagramm_saved'), AlertType.SUCCESS)
                                } else {
                                    host.alert(t('alert_diagramm_error'), AlertType.ERROR)
                                    console.log('not saved')
                                }
                            })
                        } else {
                            console.log('no export data')
                        }
                        break;
                    case 'exit':
                        confirm({
                            show: true,
                            message: t('leavePageQ'),
                            description: t('remindSave'),
                            onConfirm: () => {
                                onLeavePage()
                                close()
                            }
                        })
                        break
                }
            }
        } catch {
            return
        }
    }, [onSaveDiagramm, onLeavePage, attachment, issue, article, target])


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
        </div>
    )
}
