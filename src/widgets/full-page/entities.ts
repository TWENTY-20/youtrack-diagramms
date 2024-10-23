export interface Project{
    id: string
    name: string
    iconUrl: string
}
export interface Article{
    id: string
    attachments: ArticleAttachment[]
    summary: string
    idReadable : string
    project?: Project
}

export interface ArticleAttachment{
    id: string
    name: string
    extension: string
    base64Content: string
    article?: Article
}

