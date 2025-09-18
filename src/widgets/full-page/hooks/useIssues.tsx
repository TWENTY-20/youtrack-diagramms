import {Filter, Target} from "../entities/util.ts";
import useFetchPaginated from "./useFetchPaginated.tsx";
import {generateFilterQuery, ISSUE_FIELDS} from "../util/queries.ts";
import {Issue} from "../entities/youtrack.ts";
import {useDebounceCallback} from "usehooks-ts";

export default function useIssues(fetchInitial = true) {

    const {results, loading, fetchNextPage, setQuery} = useFetchPaginated<Issue>(`issues?fields=${ISSUE_FIELDS}`, '', 100, fetchInitial)

    const onFilterChange = useDebounceCallback((filter: Filter) => {
        setQuery(generateFilterQuery(filter, Target.ISSUE))
    }, 500)

    return {issues: results, issuesLoading: loading, fetchNextIssues: fetchNextPage, onFilterChange}
}
