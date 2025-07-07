import {Filter} from "../entities/util.ts";
import {Attachment, Issue} from "../entities/youtrack.ts";
import {host} from "../youTrackApp.ts";

export const ATTACHMENT_FIELDS = "id,name,extension,base64Content,mimeType,size"
export const PROJECT_FIELDS = "id,name,iconUrl,archived"
export const ISSUE_FIELDS = `id,summary,idReadable,project(${PROJECT_FIELDS}),attachments(${ATTACHMENT_FIELDS})`
export const ARTICLE_FIELDS = `id,summary,idReadable,project(${PROJECT_FIELDS}),attachments(${ATTACHMENT_FIELDS})`
export const SVG_QUERY = 'attachments:*.svg'

export function generateFilterQuery(filter: Filter) {
    let query = ''
    if (filter.search) {
        query += `+summary:{*${encodeURIComponent(filter.search)}*}`
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

export async function fetchArticle(id: string): Promise<Issue | undefined> {
    return await host.fetchYouTrack(`articles/${id}?fields=${ARTICLE_FIELDS}`, {}) as Promise<Issue | undefined>
}


export async function saveDiagramm(wrapperId: string, selectedAttachment: Attachment, target: string, data: string) {
    const diagramm = {
        name: selectedAttachment.name,
        base64Content: data,
    }
    if (selectedAttachment.id === 'new') {
        //const formData = new FormData();
        if (target === 'issues') {
            return host.fetchYouTrack(`${target}/${wrapperId}/attachments?fields=id,name,extension,base64Content`, {
                method: "POST",
                body: diagramm
            }).then((res: Attachment) => {
                return !!res;
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
            }).then((res) => {
                return !!res
            })
        }
    } else {
        return host.fetchYouTrack(`${target}/${wrapperId}/attachments/${selectedAttachment.id}?fields=id,name,extension,base64Content`, {
            method: "POST",
            body: diagramm
        }).then((res: Attachment) => {
            return !!res;
        })
    }
}
