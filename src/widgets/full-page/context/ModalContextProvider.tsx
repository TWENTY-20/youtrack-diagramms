import {createContext, ReactNode, useContext, useState} from "react";
import {ModalAction} from "../entities/util.ts";

export const ModalContext = createContext<ModalContextProviderProps | undefined>(undefined);

interface ModalContextProviderProps {
    action: ModalAction
    openModal: (callback?: () => void) => void
    closeModal: () => void
}

const DEFAULT_MODAL_ACTION: ModalAction = {
    show: false,
    callback: undefined
}

export default function ModalContextProvider({children}: { children: ReactNode }) {
    const [action, setAction] = useState<ModalAction>(DEFAULT_MODAL_ACTION)

    const openModal = (callback?: () => void) => setAction({show: true, callback})

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
