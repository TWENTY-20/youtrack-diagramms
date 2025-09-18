import {host} from "../../global/youTrackApp.ts";

interface SettingsResponse {
    value: boolean
}

export async function getAutoSave(): Promise<boolean> {
    return host.fetchApp('backend/getAutoSaveSetting', {}).then((res: SettingsResponse) => {
        if (res.value !== undefined && res.value !== null) {
            return res.value
        }
        console.error('Auto save response is not valid: ', res)
        return true
    })
}
