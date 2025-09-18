import {useEffect} from "react";
import SelectionBar from "./components/SelectionBar.tsx";
import FilterContextProvider from "./context/FilterContextProvider.tsx";
import DiagrammEditor from "./components/DiagrammEditor.tsx";
import ConfirmContextProvider from "./context/ConfirmContextProvider.tsx";
import ModalContextProvider from "./context/ModalContextProvider.tsx";
import ConfirmModal from "./components/modal/ConfirmModal.tsx";
import Modal from "./components/modal/Modal.tsx";
import {useAutoSaveSetting} from "./hooks/useAutoSaveSetting.tsx";
import LoaderScreen from "@jetbrains/ring-ui-built/components/loader-screen/loader-screen";

export default function App() {

    const {autoSaveEnabled, autoSaveSettingsLoading} = useAutoSaveSetting()

    useEffect(() => {
        window.onresize = () => {
            document.documentElement.style.setProperty('--window-height', window.outerHeight.toString() + 'px')
        }
    }, []);


    return (
        <div className={'ps-4 relative'}>
            <FilterContextProvider>
                <ConfirmContextProvider>
                    <ModalContextProvider>
                        {autoSaveSettingsLoading ?
                            <LoaderScreen/>
                            :
                            <>
                                <SelectionBar key={'selection_bar'} autoSave={autoSaveEnabled}/>
                                <div className={"drawIo"}>
                                    <DiagrammEditor key={'diagramm_editor'} autoSave={autoSaveEnabled}/>
                                </div>
                            </>
                        }
                        <ConfirmModal/>
                        <Modal/>
                    </ModalContextProvider>
                </ConfirmContextProvider>
            </FilterContextProvider>
        </div>

    );
}
