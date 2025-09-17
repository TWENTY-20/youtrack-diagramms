import {Project} from "./youtrack.ts";

export enum Target {
    ARTICLE = 'articles',
    ISSUE = 'issues',
}

export interface ModalAction {
    show: boolean
    callback?: () => void
    mode: ModalMode
}

export interface Filter {
    project?: Project
    search?: string
    onlySvgAttachments?: boolean
}
export interface ConfirmAction {
    show: boolean
    message: string
    description?: string
    onConfirm: () => void
}

export enum ModalMode{
    OPEN,
    CREATE
}
