import {createContext, ReactNode, useContext, useState} from "react";
import {ConfirmAction} from "../entities/util.ts";

const ConfirmContext = createContext<ConfirmContextProviderProps | undefined>(undefined)

interface ConfirmContextProviderProps {
    confirmAction: ConfirmAction
    confirm: (action: ConfirmAction) => void
    close: () => void
}

export const DEFAULT_CONFIRM_ACTION: ConfirmAction = {
    show: false,
    message: "",
    onConfirm: () => {
    }
}


export default function ConfirmContextProvider({children}: { children: ReactNode }) {
    const [action, setAction] = useState(DEFAULT_CONFIRM_ACTION)

    const close = () => setAction(DEFAULT_CONFIRM_ACTION)

    return (
        <ConfirmContext.Provider value={{confirmAction: action, confirm: setAction, close}}>
            {children}
        </ConfirmContext.Provider>
    )
}

export function useConfirmContext() {
    const context = useContext(ConfirmContext)
    if (!context) throw new Error('useConfirmContext must be used within a ConfirmContextProvider')
    return context
}
