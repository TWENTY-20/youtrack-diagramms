import {useEffect} from "react";
import SelectionBar from "./components/SelectionBar.tsx";
import FilterContextProvider from "./context/FilterContextProvider.tsx";
import DiagrammEditor from "./components/DiagrammEditor.tsx";
import ConfirmContextProvider from "./context/ConfirmContextProvider.tsx";
import ModalContextProvider from "./context/ModalContextProvider.tsx";
import ConfirmModal from "./components/modal/ConfirmModal.tsx";
import CreateModal from "./components/modal/CreateModal.tsx";

export default function App() {

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
                        <SelectionBar key={'selection_bar'}/>
                        <div className={"drawIo"}>
                            <DiagrammEditor key={'diagramm_editor'}/>
                        </div>
                        <ConfirmModal/>
                        <CreateModal/>
                    </ModalContextProvider>
                </ConfirmContextProvider>
            </FilterContextProvider>
        </div>

    );
}
