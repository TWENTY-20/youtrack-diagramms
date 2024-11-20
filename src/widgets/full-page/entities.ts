export interface BaseEntity {
    id: string
}
export interface Project extends BaseEntity {
    name: string
    iconUrl: string
}

export interface AttachmentWrapper extends BaseEntity {
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
    mimeType: string
    size?: number
}

export interface ArticleAttachment extends Attachment {
    article?: Article
}

export interface IssueAttachment extends Attachment {
    issue?: Issue
}

