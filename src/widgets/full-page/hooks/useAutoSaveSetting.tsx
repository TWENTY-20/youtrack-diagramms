import {useEffect, useState} from "react";
import {getAutoSave} from "../util/accessSettings.ts";

export function useAutoSaveSetting() {
    const [isLoading, setIsLoading] = useState(true)
    const [enabled, setEnabled] = useState(true)

    useEffect(() => {
        getAutoSave()
            .then((autosave) => {
                setEnabled(autosave)
            })
            .catch(() => console.error('Error while fetching autosave setting'))
            .finally(() => setIsLoading(false))
    }, []);

    return {
        autoSaveSettingsLoading: isLoading,
        autoSaveEnabled: enabled
    }
}
