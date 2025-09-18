import {useEffect, useState} from "react";
import {Article, Attachment} from "../full-page/entities/youtrack.ts";
import LoaderScreen from "@jetbrains/ring-ui-built/components/loader-screen/loader-screen";
import {fetchArticle} from "../full-page/util/queries.ts";
import OptionContent from "../global/OptionContent.tsx";
import {Target} from "../full-page/entities/util.ts";
import YTApp from "../global/youTrackApp.ts";
import {extractExtension} from "../full-page/util/util.ts";


export default function App() {

    const [attachments, setAttachments] = useState<Attachment[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        void fetchArticle(YTApp.entity.id).then((article: Article | undefined) => {
            if (article) {
                setAttachments(article.attachments.filter(a => (a.extension ? a.extension : extractExtension(a.name)) === 'svg'))
            } else {
                console.error("Article not found")
            }
            setIsLoading(false)
        })
    }, []);

    return (
        <>
            {isLoading ?
                <LoaderScreen/>
                :
                <OptionContent target={Target.ARTICLE} attachments={attachments}/>
            }
        </>

    );
}
