import {useCallback, useEffect, useMemo, useState} from "react";
import {host} from "../youTrackApp.ts";

export default function useFetchPaginated<T>(url: string, query: string = '', pageSize: number = 10, fetchInitial = true) {
    const [pages, setPages] = useState<T[][]>([])
    const [loading, setLoading] = useState(false)
    const [hasNextPage, setHasNextPage] = useState(true)
    const [skip, setSkip] = useState(0)
    const [contentQuery, setContentQuery] = useState(query)
    const results = useMemo(() => pages.flat(), [pages])
    const paginationQuery = useMemo(() => `&$skip=${skip}&$top=${pageSize}`, [skip, pageSize])

    const fetchNextPage = useCallback(async () => {
        if (!hasNextPage) {
            return
        }
        setLoading(true)
        await host.fetchYouTrack(url + contentQuery + paginationQuery).then((items: T[]) => {
            if (items.length < pageSize) setHasNextPage(false)
            setPages(prev => [...prev, items])
            setSkip(prev => prev + pageSize)
            setLoading(false)
        })

    }, [url, paginationQuery, setLoading, pageSize, contentQuery, hasNextPage])

    const init = useCallback(async (query: string = '') => {
        setContentQuery(query)
        setLoading(true)
        await host.fetchYouTrack(url + query + `&$skip=0&$top=${pageSize}`).then((items: T[]) => {
            if (items.length < pageSize) setHasNextPage(false)
            setPages([items])
            setSkip(pageSize)
            setLoading(false)
        })

    }, [url, pageSize])

    const setQuery = useCallback((query: string) => {
        void init(query)
    }, [init])

    useEffect(() => {
        if (fetchInitial) void fetchNextPage()
    }, []);

    return {
        results,
        loading,
        fetchNextPage,
        setQuery
    }


}
