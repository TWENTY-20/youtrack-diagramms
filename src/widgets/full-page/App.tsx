import SelectionBar from "./components/SelectionBar.tsx";
import FilterContextProvider from "./context/FilterContextProvider.tsx";
import DiagramEditor from "./components/DiagramEditor.tsx";
import ConfirmContextProvider from "./context/ConfirmContextProvider.tsx";
import ModalContextProvider from "./context/ModalContextProvider.tsx";
import ConfirmModal from "./components/modal/ConfirmModal.tsx";
import Modal from "./components/modal/Modal.tsx";
import {useAutoSaveSetting} from "./hooks/useAutoSaveSetting.tsx";
import LoaderScreen from "@jetbrains/ring-ui-built/components/loader-screen/loader-screen";
import {useLayoutEffect, useRef} from "react";

export default function App() {

    const {autoSaveEnabled, autoSaveSettingsLoading} = useAutoSaveSetting()

    const firstRender = useRef(true);

    useLayoutEffect(() => {
        /**
         * Sets the widget size inside the iframe.
         * `document.documentElement.clientHeight` is only set starting version 2026.2.
         * `window.outerHeight` is used as fallback for versions < 2026.2.
         *
         * Tested for Firefox & Chrome on MacOS
         */
        const updateWindowHeight = () => {
            let height = document.documentElement.clientHeight;
            // during the first render clientHeight might report 0 or 150 (likely the placeholder height) in versions < 2026.2
            const isOldVersionOnFirstRender = firstRender.current && (height === 0 || height === 150);
            if (isOldVersionOnFirstRender || height === 0) {
                height = Math.max(window.outerHeight - 136, 0);
            }

            firstRender.current = false;
            const heightPxString = height.toString() + "px";
            document.documentElement.style.setProperty("--window-height", heightPxString);
        };

        window.onresize = updateWindowHeight;
        updateWindowHeight();
    }, []);


    return (
        <div className={' relative app flex flex-col'}>
            <FilterContextProvider>
                <ConfirmContextProvider>
                    <ModalContextProvider>
                        {autoSaveSettingsLoading ?
                            <LoaderScreen/>
                            :
                            <>
                                <SelectionBar key={'selection_bar'} autoSave={autoSaveEnabled}/>
                                <div className={"drawIo grow"}>
                                    <DiagramEditor key={'diagramm_editor'} autoSave={autoSaveEnabled}/>
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
