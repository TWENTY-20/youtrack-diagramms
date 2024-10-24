import SelectionBar from "./SelectionBar.tsx";
import DiagrammEditor from "./DiagrammEditor.tsx";
import {Article, Attachment, Issue} from "./entities.ts";
import {useState} from "react";

export default function App() {

    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
    const [selectedAttachment, setSelectedAttachment] = useState<Attachment | null>(null)
    const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)

    const [forArticle, setForArticle] = useState<boolean>(true)



    return (

        <div style={{height: '100rem', position: 'relative'}}>
            <SelectionBar key={'selection_bar'} selectedArticle={selectedArticle} setSelectedArticle={setSelectedArticle} selectedAttachment={selectedAttachment}
                          setSelectedAttachment={setSelectedAttachment} selectedIssue={selectedIssue} setSelectedIssue={setSelectedIssue} forArticle={forArticle} setForArticle={setForArticle} />
            <div className={"drawIo"} style={{height: '92%'}}>
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
