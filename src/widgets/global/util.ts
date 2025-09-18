import {Attachment} from "../full-page/entities/youtrack.ts";
import YTApp, {host} from "./youTrackApp.ts";
import {Target} from "../full-page/entities/util.ts";

export const onSelectAttachment = async (attachment: Attachment | null, target: Target, id: string) => {
    await cacheAttachment(attachment, target === Target.ARTICLE)
    window.open(`/app/diagramm-editor/editor`, '_blank')
    window.parent.location.href = `/${target === Target.ISSUE ? 'issue' : target.valueOf()}/${id}`
}

export async function cacheAttachment(attachment: Attachment | null, forArticle: boolean) {
    const body = {
        id: YTApp.entity.id,
        attachmentId: attachment?.id ?? 'new',
        edited: Math.floor(Date.now() / 1000),
        forArticle: forArticle
    }
    await host.fetchApp("backend/cacheAttachment", {
        method: "POST",
        body: body
    })
}
