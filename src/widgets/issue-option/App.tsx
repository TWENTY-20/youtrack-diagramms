import {useTranslation} from "react-i18next";
import {useCallback, useEffect, useState} from "react";
import YTApp from "./youTrackApp.ts";
import {Attachment, Issue} from "../full-page/entities/youtrack.ts";
import {host} from "../full-page/youTrackApp.ts";
import Button from "@jetbrains/ring-ui-built/components/button/button";
import {ControlsHeight} from "@jetbrains/ring-ui-built/components/global/controls-height";
import LoaderScreen from "@jetbrains/ring-ui-built/components/loader-screen/loader-screen";
import AttachmentItem from "../global/AttachmentItem.tsx";
import {fetchIssue} from "../full-page/util/queries.ts";

export default function App() {
    const {t} = useTranslation()

    const [attachments, setAttachments] = useState<Attachment[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        void fetchIssue(YTApp.entity.id).then((issue: Issue | undefined) => {
            if (issue) {
                setAttachments(issue.attachments.filter(i => i.mimeType === 'image/svg+xml'))
            } else {
                console.error("Issue not found")
            }
            setIsLoading(false)
        })
    }, []);

    const onSelectAttachment = useCallback(async (attachment: Attachment | null) => {
        await cacheAttachment(attachment)
        window.open(`/app/diagramm-editor/editor`, '_blank')
        window.parent.location.href = `/issue/${YTApp.entity.id}`
    }, [])

    async function cacheAttachment(attachment: Attachment | null) {
        const body = {
            id: YTApp.entity.id,
            attachmentId: attachment?.id ?? 'new',
            edited: Math.floor(Date.now() / 1000),
            forArticle: false
        }
        await host.fetchApp("backend/cacheAttachment", {
            method: "POST",
            body: body
        })
    }

    return (
        <div className={"flex flex-col"}>
            <div className={"flex flex-col space-y-2 overflow-auto"} style={{height: '250px'}}>
                {isLoading ?
                    <div className={"flex justify-center items-center w-full h-full"}>
                        <LoaderScreen/>
                    </div>
                    :
                    attachments.length > 0 ?
                        attachments.map((it: Attachment, index) =>
                            <AttachmentItem key={index} attachment={it} onSelectAttachment={(it) => void onSelectAttachment(it)}/>
                        )
                        :
                        <div className={"flex items-center h-full"}>
                            {t('noAttachmentsIssue')}
                        </div>
                }

            </div>

            <div className={'flex flex-row pt-4'}>
                {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
                <Button style={{backgroundColor: "var(--ring-main-color)", color: 'white'}} height={ControlsHeight.S} onClick={async () => await onSelectAttachment(null)}>
                    {t('newDiagramm')}</Button>

            </div>
        </div>
    );
}
