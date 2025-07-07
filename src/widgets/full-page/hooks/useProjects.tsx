import useFetchPaginated from "./useFetchPaginated.tsx";
import {Project} from "../entities/youtrack.ts";
import {generateProjectQuery, PROJECT_FIELDS} from "../util/queries.ts";
import {useDebounceCallback} from "usehooks-ts";

export default function useProjects() {
    const {results, loading, fetchNextPage, setQuery} = useFetchPaginated<Project>(`admin/projects?fields=${PROJECT_FIELDS}`)

    const onSearchChange = useDebounceCallback((search: string) => {
        setQuery(generateProjectQuery(search))
    }, 500)

    return {
        projects: results,
        projectsLoading: loading,
        fetchNextProjects: fetchNextPage,
        onSearchChange
    }
}
