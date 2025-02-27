import {useTranslation} from "react-i18next";
import {useCallback, useEffect, useState} from "react";
import YTApp from "./youTrackApp.ts";
import {ArticleAttachment} from "../full-page/entities.ts";
import {host} from "../full-page/youTrackApp.ts";
import Button from "@jetbrains/ring-ui-built/components/button/button";
import {ControlsHeight} from "@jetbrains/ring-ui-built/components/global/controls-height";
import LoaderScreen from "@jetbrains/ring-ui-built/components/loader-screen/loader-screen";
import AttachmentItem from "./AttachmentItem.tsx";
import {fetchAll} from "../full-page/util.ts";


export default function App() {
    const {t} = useTranslation()

    const [attachments, setAttachments] = useState<ArticleAttachment[]>([])
    const [isLoading, setIsLoading] = useState(true)


    useEffect(() => {
        void fetchAll<ArticleAttachment>(`articles/${YTApp.entity.id}/attachments?fields=id,name,extension,base64Content,article,size`).then((attachments: ArticleAttachment[]) => {
            attachments = attachments.filter(i => extractMediaType(i.base64Content) === 'image/svg+xml')
            setAttachments(attachments)
            setIsLoading(false)
        })
    }, []);

    const onSelectAttachment = useCallback(async (attachment: ArticleAttachment | null) => {
        await cacheAttachment(attachment)
        window.open(`/app/diagramm-editor/editor`, '_blank')
        window.parent.location.href = `/articles/${YTApp.entity.id}`
    }, [])


    function extractMediaType(base64Content: string): string | null {
        const regex = /^data:(.+?);base64,/;
        const match = base64Content.match(regex);
        if (match) {
            return match[1];
        } else {
            return null
        }
    }

    async function cacheAttachment(attachment: ArticleAttachment | null) {
        const body = {
            id: YTApp.entity.id,
            attachmentId: attachment?.id ?? 'new',
            edited: Math.floor(Date.now() / 1000),
            forArticle: true
        }
        await host.fetchApp("backend/cacheAttachment", {
            method: "POST",
            body: body
        })
    }


    return (
        <div className={"flex flex-col "}>
            <div className={"flex flex-col space-y-2 overflow-auto"} style={{height: '250px'}}>
                {isLoading ?
                    <div className={"flex justify-center items-center w-full h-full"}>
                        <LoaderScreen/>
                    </div>
                    :
                    attachments.length > 0 ?
                        attachments.map((it: ArticleAttachment, index) =>
                            // eslint-disable-next-line @typescript-eslint/no-misused-promises
                            <AttachmentItem key={index} attachment={it} onSelectAttachment={async (it) => await onSelectAttachment(it)}/>
                        )
                        :
                        <div>
                            <div className={"flex items-center h-full"}>
                                {t('noAttachmentsArticle')}
                            </div>
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
