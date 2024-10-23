import SelectionBar from "./SelectionBar.tsx";
import DiagrammEditor from "./DiagrammEditor.tsx";
import {Article, ArticleAttachment} from "./entities.ts";
import {useEffect, useState} from "react";

export default function App() {

    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
    const [selectedAttachment, setSelectedAttachment] = useState<ArticleAttachment | null>(null)


    useEffect(() => {
       // const params = new URLSearchParams(window.top.document.location.search);
        //console.log(params)
    }, [])



    return (

        <div style={{height: '100rem', position: 'relative'}}>
            <SelectionBar key={'selection_bar'} selectedArticle={selectedArticle} setSelectedArticle={setSelectedArticle} selectedAttachment={selectedAttachment} setSelectedAttachment={setSelectedAttachment}/>
            <div style={{height: '95%'}}>
                <DiagrammEditor
                    key={'diagramm_editor'}
                    selectedArticle={selectedArticle}
                    selectedAttachment={selectedAttachment}
                    setSelectedAttachment={setSelectedAttachment}
                />
            </div>

        </div>

    );
}
