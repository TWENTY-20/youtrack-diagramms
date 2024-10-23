import {useTranslation} from "react-i18next";
import {useEffect, useState} from "react";
import YTApp from "./youTrackApp.ts";
import {ArticleAttachment} from "../full-page/entities.ts";
import {host} from "../full-page/youTrackApp.ts";
import Button from "@jetbrains/ring-ui-built/components/button/button";
import ClickableLink from "@jetbrains/ring-ui-built/components/link/clickableLink";
import {ControlsHeight} from "@jetbrains/ring-ui-built/components/global/controls-height";

export default function App() {
    const {t} = useTranslation()

    const [attachments, setAttachments] = useState<ArticleAttachment[]>([])

    useEffect(() => {
        void host.fetchYouTrack(`articles/${YTApp.entity.id}/attachments?fields=id,name,extension,base64Content,article`).then((attachments: ArticleAttachment[]) => {
            attachments = attachments.filter(i => extractMediaType(i.base64Content) === 'image/svg+xml')
            console.log(attachments)
            setAttachments(attachments)
        })
    }, []);

    const onSelectAttachment = (attachment: ArticleAttachment | null) => {
        cacheAttachment(attachment)
        window.open(`/app/diagramm-editor/editor`, '_blank')
        window.parent.location.href = `/articles/${YTApp.entity.id}`
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
            articleId: YTApp.entity.id,
            attachmentId: attachment?.id ?? 'new',
            edited: Math.floor(Date.now() / 1000)
        }
        void host.fetchApp("backend/cacheAttachment", {
            method: "POST",
            body: body
        })
    }


    return (
        <div className={"flex flex-col "}>
            <div className={"flex flex-col space-y-2 overflow-auto"} style={{height: '250px'}}>
                {attachments.map((it: ArticleAttachment, index) =>
                    <ClickableLink key={index} className={'attachmentItem'} onClick={() => onSelectAttachment(it)}>
                        {it.name}
                    </ClickableLink>
                )}

            </div>

            <div className={'flex flex-row pt-4'}>
                <Button style={{backgroundColor: "var(--ring-main-color)"}} height={ControlsHeight.S} onClick={() => {
                    onSelectAttachment(null)
                }}>{t('newDiagramm')}</Button>
            </div>
        </div>
    );
}
