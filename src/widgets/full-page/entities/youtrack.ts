export interface BaseEntity {
    id: string
}
export interface Project extends BaseEntity {
    name: string
    iconUrl: string
    archived?: boolean
}

/*export interface AttachmentWrapper extends BaseEntity {
    summary: string
    idReadable: string
    project?: Project
}*/

export interface Article extends BaseEntity {
    summary: string
    idReadable: string
    project?: Project
    attachments: Attachment[]
}

export interface Issue extends BaseEntity {
    summary: string
    idReadable: string
    project?: Project
    attachments: Attachment[]
}

export interface Attachment {
    id: string
    name: string
    extension: string
    base64Content: string
    mimeType: string
    size?: number
    created?: number
    preventFetchContent?: boolean
}

export interface ArticleAttachment extends Attachment {
    article?: Article
}

export interface IssueAttachment extends Attachment {
    issue?: Issue
}

