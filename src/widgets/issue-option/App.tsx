import {useTranslation} from "react-i18next";
import {useEffect, useState} from "react";
import YTApp from "./youTrackApp.ts";
import {Attachment, IssueAttachment} from "../full-page/entities.ts";
import {host} from "../full-page/youTrackApp.ts";
import Button from "@jetbrains/ring-ui-built/components/button/button";
import {ControlsHeight} from "@jetbrains/ring-ui-built/components/global/controls-height";
import LoaderScreen from "@jetbrains/ring-ui-built/components/loader-screen/loader-screen";
import AttachmentItem from "./AttachmentItem.tsx";
import {fetchAll} from "../full-page/util.ts";

export default function App() {
    const {t} = useTranslation()

    const [attachments, setAttachments] = useState<Attachment[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        void fetchAll<IssueAttachment>(`issues/${YTApp.entity.id}/attachments?fields=id,name,extension,base64Content,issue`).then((attachments: IssueAttachment[]) => {
            attachments = attachments.filter(i => extractMediaType(i.base64Content) === 'image/svg+xml')
            setAttachments(attachments)
            setIsLoading(false)
        })
    }, []);

    const onSelectAttachment = async (attachment: IssueAttachment | null) => {
        // Ensure attachment is cached before opening the editor.
        await cacheAttachment(attachment)
        window.open(`/app/diagramm-editor/editor`, '_blank')
        window.parent.location.href = `/issue/${YTApp.entity.id}`
    }


    function extractMediaType(base64Content: string): string | null {
        const regex = /^data:(.+?);base64,/;
        const match = base64Content.match(regex);
        if (match) {
            return match[1];
        } else {
            return null
        }
    }

    async function cacheAttachment(attachment: IssueAttachment | null) {
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
                        attachments.map((it: IssueAttachment, index) =>
                            <AttachmentItem key={index} attachment={it} onSelectAttachment={onSelectAttachment}/>
                        )
                        :
                        <div className={"flex items-center h-full"}>
                            {t('noAttachmentsIssue')}
                        </div>
                }

            </div>

            <div className={'flex flex-row pt-4'}>
                <Button style={{backgroundColor: "var(--ring-main-color)", color: 'white'}} height={ControlsHeight.S} onClick={() => {
                    onSelectAttachment(null)
                }}>{t('newDiagramm')}</Button>
            </div>
        </div>
    );
}
