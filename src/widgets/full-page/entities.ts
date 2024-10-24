export interface Project {
    id: string
    name: string
    iconUrl: string
}

export interface AttachmentWrapper {
    id: string
    summary: string
    idReadable: string
    project?: Project
}

export interface Article extends AttachmentWrapper {
    attachments: ArticleAttachment[]
}

export interface Issue extends AttachmentWrapper {
    attachments: IssueAttachment[]
}

export interface Attachment {
    id: string
    name: string
    extension: string
    base64Content: string
}

export interface ArticleAttachment extends Attachment {
    article?: Article
}

export interface IssueAttachment extends Attachment {
    issue?: Issue
}

