import {Article, Attachment, Issue} from "../entities/youtrack.ts";
import {extractExtension} from "./util.ts";

export function filterArticle(item: Article): boolean {
    return item.attachments.filter(filterAttachment).length > 0
}

export function filterIssue(item: Issue): boolean {
    return item.attachments.filter(filterAttachment).length > 0
}

export function filterAttachment(item: Attachment): boolean {
    return (item.extension ? item.extension : extractExtension(item.name)) === "svg"
}
