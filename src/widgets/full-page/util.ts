import {host} from "./youTrackApp.ts";

export default async function fetchPaginated<T>(path: string): Promise<T[]> {
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
        skip += 50

    }
    return result
}
