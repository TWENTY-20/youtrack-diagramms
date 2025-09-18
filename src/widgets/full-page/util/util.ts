import {Article, Attachment, Issue, Project} from "../entities/youtrack.ts";

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
    if (frame) (frame as HTMLIFrameElement)?.contentWindow?.postMessage(JSON.stringify({action: 'export', format: 'xmlsvg', spinKey: 'saving'}), '*');
}

function isDarkTheme() {
    const styles = getComputedStyle(document.documentElement)
    return styles.colorScheme === 'dark'
}

function extractExtension(name: string): string | undefined {
    const splits = name.split('.')
    return splits.length >= 2 ? splits[splits.length - 1] : undefined
}


export {triggerExportEvent, isDarkTheme, extractExtension}
