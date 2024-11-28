import {host} from "./youTrackApp.ts";

async function fetchAll<T>(path: string): Promise<T[]> {
    const result: T[] = []
    let stop = false
    let skip = 0;
    while (!stop) {
        const pager = `&$skip=${skip}&$top=500`
        const items = await host.fetchYouTrack(path + pager).then((items: T[]) => {
            return items
        })
        if (items.length < 500) stop = true
        result.push(...items)
        skip += 500

    }
    return result
}

async function fetchPaginated<T>(path: string, setter: (i: T[]) => void) {
    const result: T[] = []
    let stop = false
    let skip = 0;
    while (!stop) {
        const pager = `&$skip=${skip}&$top=50`
        const items = await host.fetchYouTrack(path + pager).then((items: T[]) => {
            return items
        })
        if (items.length < 50) stop = true
        result.push(...items)
        setter(result)
        skip += 50
    }
}

async function fetchSection<T>(path: string, skip: number = 0, top: number = 50): Promise<T[]> {
    const pager = `&$skip=${skip}&$top=${top}`
    return await host.fetchYouTrack(path + pager) as Promise<T[]>
}

export {fetchAll, fetchPaginated, fetchSection}
