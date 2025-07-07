import Confirm from "@jetbrains/ring-ui-built/components/confirm/confirm";
import {useConfirmContext} from "../../context/ConfirmContextProvider.tsx";
import {useTranslation} from "react-i18next";


export default function ConfirmModal() {

    const {confirmAction, close}= useConfirmContext()
    const {t} = useTranslation()

    return (
        <Confirm show={confirmAction.show}
                 onConfirm={confirmAction.onConfirm}
                 text={confirmAction.message}
                 description={confirmAction.description ?? ''}
                 onReject={close}
                 confirmLabel={t('confirm')}
                 rejectLabel={t('cancel')}
                 rejectOnEsc
        />
    )
}
