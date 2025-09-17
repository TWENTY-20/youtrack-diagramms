import {createContext, ReactNode, useContext, useState} from "react";
import {ModalAction, ModalMode} from "../entities/util.ts";

export const ModalContext = createContext<ModalContextProviderProps | undefined>(undefined);

interface ModalContextProviderProps {
    action: ModalAction
    openModal: (mode: ModalMode, callback?: () => void) => void
    closeModal: () => void
}

const DEFAULT_MODAL_ACTION: ModalAction = {
    show: false,
    callback: undefined,
    mode: ModalMode.OPEN
}

export default function ModalContextProvider({children}: { children: ReactNode }) {
    const [action, setAction] = useState<ModalAction>(DEFAULT_MODAL_ACTION)

    const openModal = (mode: ModalMode, callback?: () => void) => setAction({show: true, callback, mode})

    const closeModal = () => setAction(DEFAULT_MODAL_ACTION)


    return (
        <ModalContext.Provider value={{action, openModal, closeModal}}>
            {children}
        </ModalContext.Provider>
    )

}

export function useModalContext() {
    const context = useContext(ModalContext)
    if (context === undefined) {
        throw new Error('useModalContext must be used within a ModalContextProvider')
    }
    return context
}
