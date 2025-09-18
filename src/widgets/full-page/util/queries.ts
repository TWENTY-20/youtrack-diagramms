import {Filter, SaveResponse, Target} from "../entities/util.ts";
import {Article, Attachment, Issue} from "../entities/youtrack.ts";
import {host} from "../youTrackApp.ts";

export const ATTACHMENT_FIELDS = "id,name,extension,mimeType,size,created"
export const ATTACHMENT_CONTENT_FIELDS = "id,name,extension,base64Content,mimeType,size"
export const PROJECT_FIELDS = "id,name,iconUrl,archived"
export const ISSUE_FIELDS = `id,summary,idReadable,project(${PROJECT_FIELDS}),attachments(${ATTACHMENT_FIELDS})`
export const ARTICLE_FIELDS = `id,summary,idReadable,project(${PROJECT_FIELDS}),attachments(${ATTACHMENT_FIELDS})`
export const SVG_QUERY = 'attachments:*.svg'

export function generateFilterQuery(filter: Filter, target: Target) {
    let query = ''
    if (filter.search) {
        query += `${target === Target.ISSUE ? 'summary' : 'title'}:{${encodeURIComponent(filter.search)}*}`
    }
    if (filter.project) {
        query += `+project:{${encodeURIComponent(filter.project.name)}}`
    }
    if (filter.onlySvgAttachments) {
        query += `+${SVG_QUERY}`
    }
    return query === '' ? '' : `&query=${query}`

}

export function generateProjectQuery(search: string) {
    if (!search) return ''
    return `&query=${encodeURIComponent(search)}`
}

export async function fetchIssue(id: string): Promise<Issue | undefined> {
    return await host.fetchYouTrack(`issues/${id}?fields=${ISSUE_FIELDS}`, {}) as Promise<Issue | undefined>
}

export async function fetchArticle(id: string): Promise<Article | undefined> {
    return await host.fetchYouTrack(`articles/${id}?fields=${ARTICLE_FIELDS}`, {}) as Promise<Article | undefined>
}

async function refetchArticleAttachmentId(articleId: string, attachmentName: string) {
    const article = await fetchArticle(articleId)
    if (!article) return undefined
    const attachmentsList = article.attachments.filter(it => it.name === attachmentName)
    if (attachmentsList.length === 0) return undefined
    if (attachmentsList.length === 1) return attachmentsList[0].id
    return attachmentsList.sort((a, b) => b.created! - a.created!)[0].id
}


export async function saveDiagramm(wrapperId: string, selectedAttachment: Attachment, target: string, data: string): Promise<SaveResponse> {
    const diagramm = {
        name: selectedAttachment.name,
        base64Content: data,
    }
    if (selectedAttachment.id === 'new') {
        if (target === 'issues') {
            return host.fetchYouTrack(`${target}/${wrapperId}/attachments?fields=id,name,extension,base64Content`, {
                method: "POST",
                body: diagramm
            }).then((res: Attachment) => {
                return res ? {success: true, attachmentId: res.id} : {success: false};
            })

        } else {
            const body = {
                id: wrapperId,
                content: data,
                filename: selectedAttachment.name
            }
            return host.fetchApp("backend/addAttachmentToArticle", {
                method: "POST",
                body: body
            }).then(async (res: { name: string }) => {
                if (res) {
                    const attachmentId = await refetchArticleAttachmentId(wrapperId, res.name)
                    return attachmentId ? {success: true, attachmentId: attachmentId} : {success: false};
                } else {
                    return {success: false};
                }
            })
        }
    } else {
        return host.fetchYouTrack(`${target}/${wrapperId}/attachments/${selectedAttachment.id}?fields=id,name,extension,base64Content`, {
            method: "POST",
            body: diagramm
        }).then((res: Attachment) => {
            return res ? {success: true, attachmentId: res.id} : {success: false};
        })
    }
}
