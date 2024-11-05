import {useTranslation} from "react-i18next";
import {useEffect, useState} from "react";
import YTApp from "./youTrackApp.ts";
import {ArticleAttachment, Attachment} from "../full-page/entities.ts";
import {host} from "../full-page/youTrackApp.ts";
import Button from "@jetbrains/ring-ui-built/components/button/button";
import ClickableLink from "@jetbrains/ring-ui-built/components/link/clickableLink";
import {ControlsHeight} from "@jetbrains/ring-ui-built/components/global/controls-height";
import LoaderScreen from "@jetbrains/ring-ui-built/components/loader-screen/loader-screen";

export default function App() {
    const {t} = useTranslation()

    const [attachments, setAttachments] = useState<Attachment[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        void host.fetchYouTrack(`issues/${YTApp.entity.id}/attachments?fields=id,name,extension,base64Content,article`).then((attachments: Attachment[]) => {
            attachments = attachments.filter(i => extractMediaType(i.base64Content) === 'image/svg+xml')
            setAttachments(attachments)
            setIsLoading(false)
        })
    }, []);

    const onSelectAttachment = (attachment: ArticleAttachment | null) => {
        cacheAttachment(attachment)
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

    function cacheAttachment(attachment: ArticleAttachment | null) {
        const body = {
            id: YTApp.entity.id,
            attachmentId: attachment?.id ?? 'new',
            edited: Math.floor(Date.now() / 1000),
            forArticle: false
        }
        void host.fetchApp("backend/cacheAttachment", {
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
                        attachments.map((it: ArticleAttachment, index) =>
                            <ClickableLink key={index} className={'attachmentItem'} onClick={() => onSelectAttachment(it)}>
                                {it.name}
                            </ClickableLink>
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
