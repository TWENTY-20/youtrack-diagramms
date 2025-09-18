import {useEffect, useState} from "react";
import {Attachment, Issue} from "../full-page/entities/youtrack.ts";
import LoaderScreen from "@jetbrains/ring-ui-built/components/loader-screen/loader-screen";
import {fetchIssue} from "../full-page/util/queries.ts";
import OptionContent from "../global/OptionContent.tsx";
import {Target} from "../full-page/entities/util.ts";
import YTApp from "../global/youTrackApp.ts";
import {extractExtension} from "../full-page/util/util.ts";

export default function App() {

    const [attachments, setAttachments] = useState<Attachment[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        void fetchIssue(YTApp.entity.id).then((issue: Issue | undefined) => {
            if (issue) {
                setAttachments(issue.attachments.filter(a => (a.extension ? a.extension : extractExtension(a.name)) === 'svg'))
            } else {
                console.error("Issue not found")
            }
            setIsLoading(false)
        })
    }, []);

    return (
        <>
            {isLoading ?
                <LoaderScreen/>
                :
                <OptionContent target={Target.ISSUE} attachments={attachments}/>
            }
        </>
    );
}
