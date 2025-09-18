import {host} from "../youTrackApp.ts";
import {Article, Attachment, Issue, Project} from "../entities/youtrack.ts";

async function fetchAll<T>(path: string): Promise<T[]> {
    const result: T[] = []
    let stop = false
    let skip = 0;
    while (!stop) {
        const pager = `&$skip=${skip}&$top=500`
        const items = await host.fetchYouTrack(path + pager).then((items: T[]) => {
            return items
        })
        if (items.length < 500) stop = true
        result.push(...items)
        skip += 500

    }
    return result
}

async function fetchPaginated<T>(path: string, setter: (i: T[]) => void) {
    const result: T[] = []
    let stop = false
    let skip = 0;
    while (!stop) {
        const pager = `&$skip=${skip}&$top=50`
        const items = await host.fetchYouTrack(path + pager).then((items: T[]) => {
            return items
        })
        if (items.length < 50) stop = true
        result.push(...items)
        setter(result)
        skip += 50
    }
}

async function fetchSection<T>(path: string, skip: number = 0, top: number = 50): Promise<T[]> {
    const pager = `&$skip=${skip}&$top=${top}`
    return await host.fetchYouTrack(path + pager) as Promise<T[]>
}

export const projectToSelectItem = (it: Project) => ({key: it.id, label: it.name, avatar: it.iconUrl, model: it});
export const articleToSelectItem = (it: Article) => ({key: it.id, label: it.summary, model: it});
export const issueToSelectItem = (it: Issue) => ({key: it.id, label: it.summary, model: it});
export const attachmentToSelectItem = (it: Attachment) => ({key: it.id, label: it.name, model: it});

export const nullableProjectToSelectItem = (it: Project | undefined) => (it === undefined ? undefined : projectToSelectItem(it));
export const nullableArticleToSelectItem = (it: Article | undefined) => (it === undefined ? undefined : articleToSelectItem(it));
export const nullableIssueToSelectItem = (it: Issue | undefined) => (it === undefined ? undefined : issueToSelectItem(it));
export const nullableAttachmentToSelectItem = (it: Attachment | undefined) => (it === undefined ? undefined : attachmentToSelectItem(it));

function triggerExportEvent(): void {
    const elements = document.getElementsByClassName('diagrams-iframe');
    const frame = elements.length > 0 ? elements[0] : undefined;
    if (frame) (frame as HTMLIFrameElement)?.contentWindow?.postMessage(JSON.stringify({action: 'export', format: 'xmlpng', spinKey: 'saving'}), '*');
}


export {fetchAll, fetchPaginated, fetchSection, triggerExportEvent}
