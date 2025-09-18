import Icon from "@jetbrains/ring-ui-built/components/icon";
import Pencil from "@jetbrains/icons/pencil";
import {Attachment} from "../full-page/entities/youtrack.ts";
import Text from "@jetbrains/ring-ui-built/components/text/text";
import Button from "@jetbrains/ring-ui-built/components/button/button";

export default function AttachmentItem({attachment, onSelectAttachment}: { attachment: Attachment, onSelectAttachment: (attachment: Attachment) => void }) {

    return (
        <div className={"flex flex-row justify-between items-center attachmentItem"}>
            <div className={"flex flex-row gap-x-4 items-center"}>
                <img src={attachment.thumbnailURL} className={'attachmentIcon'} alt={''}/>
                <p className={'truncate'} style={{maxWidth: '300px'}}><Text info>{attachment.name}</Text></p>
            </div>
            <Button primary className={'iconButton'} onClick={() => onSelectAttachment(attachment)}>
                <Icon glyph={Pencil}/>
            </Button>
        </div>
    )
}
