import {host} from "../youTrackApp.ts";

import {useTranslation} from "react-i18next";
import {useCallback, useEffect} from "react";
import {EventData} from "../entities/types.ts";
import {AlertType} from "@jetbrains/ring-ui-built/components/alert/alert";
import {DrawIoEmbed} from "react-drawio";
import {useFilterContext} from "../context/FilterContextProvider.tsx";
import {Target} from "../entities/util.ts";
import {saveDiagramm} from "../util/queries.ts";
import {useAttachmentContent} from "../hooks/useAttachmentContent.tsx";
import {triggerExportEvent} from "../util/util.ts";

export default function DiagrammEditor() {

    const {t} = useTranslation();

    const {target, article, issue, attachment, isSomethingSelected, setIsSaved} = useFilterContext()
    const {content} = useAttachmentContent()

    useEffect(() => {
        window.addEventListener('message', onEvent)
        return () => {
            window.removeEventListener('message', onEvent);
        };
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

    const onEvent = useCallback((evt: MessageEvent) => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            const data = JSON.parse(evt.data) as EventData;
            console.log(data)
            if ("event" in data) {
                switch (data.event) {
                    case 'export':
                        if (data.data) {
                            void onSaveDiagramm(data.data).then(saved => {
                                setIsSaved(saved ?? false)
                                if (saved) {
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
                    case 'autosave':
                        setIsSaved(false)
                        if (isSomethingSelected) triggerExportEvent()
                        break
                }
            }
        } catch {
            return
        }
    }, [onSaveDiagramm, attachment, issue, article, target])

    return (
        <div className={"w-full h-full relative"}>
            <div id={"editor"} className={"w-full h-full"}>
                <DrawIoEmbed
                    key={'drawio_embedded'}
                    xml={content}
                    autosave={true}
                    urlParameters={{
                        ui: 'kennedy',
                        spin: true,
                        libraries: true,
                        saveAndExit: false,
                        noSaveBtn: true,
                        noExitBtn: true
                    }}/>
            </div>
        </div>
    )
}
