import {createContext, ReactNode, useContext, useState} from "react";
import {Target} from "../entities/util.ts";
import {Article, Attachment, Issue, Project} from "../entities/youtrack.ts";

const FilterContext = createContext<FilterContextProviderProps | undefined>(undefined)

interface FilterContextProviderProps {
    target: Target
    project: Project | undefined
    article: Article | undefined
    issue: Issue | undefined
    attachment: Attachment | undefined
    setTarget: (target: Target) => void
    setProject: (project: Project | undefined) => void
    setArticle: (article: Article | undefined) => void
    setIssue: (issue: Issue | undefined) => void
    setAttachment: (attachment: Attachment | undefined) => void
    setProjectAndReset: (project: Project | undefined) => void
    setTargetAndReset: (target: Target) => void
    setIssueAndReset: (issue: Issue | undefined) => void
    setArticleAndReset: (article: Article | undefined) => void
}

export default function FilterContextProvider({children}: { children: ReactNode }) {
    const [target, setTarget] = useState(Target.ARTICLE)
    const [project, setProject] = useState<Project | undefined>(undefined)
    const [article, setArticle] = useState<Article | undefined>(undefined)
    const [issue, setIssue] = useState<Issue | undefined>(undefined)
    const [attachment, setAttachment] = useState<Attachment | undefined>(undefined)

    function setProjectAndReset(project: Project | undefined) {
        setProject(project)
        setArticle(undefined)
        setIssue(undefined)
        setAttachment(undefined)
    }

    function setTargetAndReset(target: Target) {
        setTarget(target)
        setProject(undefined)
        setArticle(undefined)
        setIssue(undefined)
        setAttachment(undefined)
    }

    function setIssueAndReset(issue: Issue | undefined) {
        setIssue(issue)
        setArticle(undefined)
        setAttachment(undefined)
    }

    function setArticleAndReset(article: Article | undefined) {
        setArticle(article)
        setIssue(undefined)
        setAttachment(undefined)
    }


    return (
        <FilterContext.Provider value={{
            target,
            project,
            article,
            issue,
            attachment,
            setTarget,
            setProject,
            setArticle,
            setIssue,
            setAttachment,
            setProjectAndReset,
            setTargetAndReset,
            setArticleAndReset,
            setIssueAndReset
        }}>
            {children}
        </FilterContext.Provider>
    )
}

export function useFilterContext() {
    const context = useContext(FilterContext)
    if (context === undefined) {
        throw new Error('useFilterContext must be used within a FilterContextProvider')
    }
    return context
}
