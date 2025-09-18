import {useFilterContext} from "../context/FilterContextProvider.tsx";
import {useCallback, useEffect, useState} from "react";
import {Article, Attachment, Issue} from "../entities/youtrack.ts";
import {Target} from "../entities/util.ts";
import {ATTACHMENT_CONTENT_FIELDS} from "../util/queries.ts";
import {host} from "../../global/youTrackApp.ts";
import {useTranslation} from "react-i18next";

export function useAttachmentContent() {

    const {t} = useTranslation()

    const {target, article, issue, attachment} = useFilterContext()
    const [attachmentLoading, setAttachmentLoading] = useState(false)
    const [content, setContent] = useState<string | undefined>(undefined)

    useEffect(() => {
        if (attachment?.preventFetchContent || attachment?.id === 'new') return
        void fetchAttachment()
    }, [attachment])

    const fetchAttachment = useCallback(async () => {
        if (!isSelectionValid(target, article, issue, attachment?.id)) {
            setContent(undefined)
            return
        }
        setAttachmentLoading(true)
        const id = target === Target.ARTICLE ? article?.id : issue?.id
        if (!id) return
        const url = `${target}/${id}/attachments/${attachment?.id}?fields=${ATTACHMENT_CONTENT_FIELDS}`
        await host.fetchYouTrack(url).then((res: Attachment) => {
            if (res) setContent(res.base64Content ?? undefined)
            else {
                host.alert(t('contentLoadingError'))
                setContent(undefined)
            }

        }).finally(() => setAttachmentLoading(false))
    }, [target, article, issue, attachment])

    const isSelectionValid = (target: string | undefined, article: Article | undefined, issue: Issue | undefined, attachmentId: string | undefined) => {
        if (!target) return false
        if (!attachmentId) return false
        if (attachmentId === 'new') return false
        if (target === Target.ARTICLE.valueOf() && !article) return false
        if (target === Target.ISSUE.valueOf() && !issue) return false
        return true
    }

    return {
        content,
        attachmentLoading
    }


}
