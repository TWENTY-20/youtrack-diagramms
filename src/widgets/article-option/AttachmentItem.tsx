import Tag from "@jetbrains/ring-ui-built/components/tag/tag";
import ClickableLink from "@jetbrains/ring-ui-built/components/link/clickableLink";
import Icon from "@jetbrains/ring-ui-built/components/icon";
import Pencil from "@jetbrains/icons/pencil";
import {ArticleAttachment} from "../full-page/entities.ts";
import {useState} from "react";

export default function AttachmentItem({attachment, onSelectAttachment}: { attachment: ArticleAttachment, onSelectAttachment: (attachment: ArticleAttachment) => void }) {

    const [hovering, setHovering] = useState(false)

    function formatBytes(bytes: number | undefined) {
        if (bytes === undefined) return ''
        if (bytes / 1000 < 1) return `${bytes} Bytes`
        if (bytes / 1000000 < 1) return `${Math.round(bytes / 1000)} MB`
        return `${Math.round(bytes / 1000000)} GB`


    }

    return (
        <div className={"flex flex-row justify-between attachmentItem"} onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)}>
            <span>
            <Tag className={"font-bold text-white badge mr-2"} readOnly>SVG</Tag>
                {attachment.name}
            </span>
            {hovering ?
                <ClickableLink className={'pr-2'} onClick={() => onSelectAttachment(attachment)}>
                    <Icon glyph={Pencil}
                          className="attachmentIcon"
                          height={18}
                          width={18}
                    />
                </ClickableLink>
                :
                <p style={{color: '9D9FA7'}} className={"ml-1"}>{formatBytes(attachment.size)}</p>
            }
        </div>
    )
}
