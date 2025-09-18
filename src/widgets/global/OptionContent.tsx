import {Attachment} from "../full-page/entities/youtrack.ts";
import AttachmentItem from "./AttachmentItem.tsx";
import {onSelectAttachment} from "./util.ts";
import Button from "@jetbrains/ring-ui-built/components/button/button";
import {ControlsHeight} from "@jetbrains/ring-ui-built/components/global/controls-height";
import {useTranslation} from "react-i18next";
import YTApp from "./youTrackApp.ts";
import {Target} from "../full-page/entities/util.ts";

export default function OptionContent({target, attachments}: { target: Target, attachments: Attachment[] }) {

    const {t} = useTranslation()

    return (
        <div className={"flex flex-col "}>
            <div className={"flex flex-col space-y-2 overflow-auto"} style={{height: '250px'}}>
                {
                    attachments.length > 0 ?
                        attachments.map((it: Attachment) =>
                            // eslint-disable-next-line @typescript-eslint/no-misused-promises
                            <AttachmentItem key={it.id} attachment={it} onSelectAttachment={async (it) => await onSelectAttachment(it, target, YTApp.entity.id)}/>
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
                <Button style={{backgroundColor: "var(--ring-main-color)", color: 'white'}} height={ControlsHeight.S} onClick={async () => await onSelectAttachment(null, target, YTApp.entity.id)}>
                    {t('newDiagramm')}</Button>
            </div>
        </div>
    )
}
