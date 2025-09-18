import {Article} from "../entities/youtrack.ts";
import useFetchPaginated from "./useFetchPaginated.tsx";
import {ARTICLE_FIELDS, generateFilterQuery} from "../util/queries.ts";
import {useDebounceCallback} from "usehooks-ts";
import {Filter, Target} from "../entities/util.ts";

export default function useArticles(fetchInitial = true) {

    const {results, loading, fetchNextPage, setQuery} = useFetchPaginated<Article>(`articles?fields=${ARTICLE_FIELDS}`, '', 100, fetchInitial)

    const onFilterChange = useDebounceCallback((filter: Filter) => {
        setQuery(generateFilterQuery(filter, Target.ARTICLE))
    }, 500)

    return {articles: results, articlesLoading: loading, fetchNextArticles: fetchNextPage, onFilterChange}
}
