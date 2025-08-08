'use client';

import {useState} from 'react';
import ModalFAQ from "@/components/modal/ModalFAQ/ModalFAQ";
import ModalDefault from "@/components/modal/ModalDefault/ModalDefault";
import './ModalFAQTrigger.scss';
import {faFile} from "@fortawesome/free-solid-svg-icons/faFile";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {fetchAddAdminFaq, fetchAdminFaqTagList} from "@/api/admin/faq/faqFetch";
import {fetchCurrentUserInfo} from "@/api/auth/master";
import {useModalMessage} from "@/hooks/useModalMessage";

export default function ModalFAQTrigger({onAdded}: {onAdded?: () => void}) {
    const [isOpen, setIsOpen] = useState(false);
    const [companyId, setCompanyId] = useState<number>(1);
    const {
        openSuccessModal,
        successMessage,
        openErrorModal,
        errorMessage,
        showSuccess,
        showError,
        closeSuccess,
        closeError,
    } = useModalMessage();

    const handleOpen = async () => {
        try {
            const userInfo = await fetchCurrentUserInfo();
            if (userInfo.companyId || userInfo.company_id) {
                setCompanyId(userInfo.companyId ?? userInfo.company_id);
            }
        } catch {
            setCompanyId(1);
        }
        setIsOpen(true);
    };

    const handleClose = () => setIsOpen(false);

    const handleSubmit = async (data: { category: string; question: string; answer: string }) => {
        try {
            const tags = await fetchAdminFaqTagList();
            const tagObj = tags.find((tag: any) => tag.name === data.category);
            const tag_id = tagObj ? tagObj.tag_id : null;
            if (!tag_id) {
                showError("선택한 태그가 존재하지 않습니다.");
                return;
            }
            await fetchAddAdminFaq(companyId, data.question, data.answer, tag_id);
            showSuccess("FAQ가 성공적으로 등록되었습니다.");
            if (onAdded) onAdded();
            handleClose();
        } catch (e) {
            showError("FAQ 등록에 실패했습니다.");
        }
    };

    return (
        <>
            <button className="button is-link" onClick={handleOpen}>
                <FontAwesomeIcon icon={faFile} style={{ width: 20, height: 20, marginRight: 10 }} />
                FAQ 등록
            </button>
            {isOpen && <ModalFAQ
                onClose={handleClose}
                onSubmit={handleSubmit}
                companyId={companyId}
            />}
            {openSuccessModal && (
                <ModalDefault
                    type="default"
                    label={successMessage}
                    onClose={closeSuccess}
                />
            )}
            {openErrorModal && (
                <ModalDefault
                    type="default"
                    label={errorMessage}
                    onClose={closeError}
                />
            )}
        </>
    );
}