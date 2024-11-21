import SelectionBar from "./SelectionBar.tsx";
import DiagrammEditor from "./DiagrammEditor.tsx";
import {Article, Attachment, Issue} from "./entities.ts";
import {useEffect, useState} from "react";

export default function App() {

    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
    const [selectedAttachment, setSelectedAttachment] = useState<Attachment | null>(null)
    const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)

    const [forArticle, setForArticle] = useState<boolean>(true)


    useEffect(() => {
        window.onresize = () => {
            document.documentElement.style.setProperty('--window-height', window.outerHeight.toString()+'px')
        }
    }, []);


    return (
        <div style={{position: 'relative'}}>
            <SelectionBar key={'selection_bar'} selectedArticle={selectedArticle} setSelectedArticle={setSelectedArticle} selectedAttachment={selectedAttachment}
                          setSelectedAttachment={setSelectedAttachment} selectedIssue={selectedIssue} setSelectedIssue={setSelectedIssue} forArticle={forArticle} setForArticle={setForArticle}/>
            <div className={"drawIo"}>
                <DiagrammEditor
                    key={'diagramm_editor'}
                    selectedArticle={selectedArticle}
                    selectedAttachment={selectedAttachment}
                    setSelectedAttachment={setSelectedAttachment}
                    selectedIssue={selectedIssue}
                    forArticle={forArticle}
                />
            </div>

        </div>

    );
}
