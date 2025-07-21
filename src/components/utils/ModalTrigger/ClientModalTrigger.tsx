// 서버 컴포넌트에서 버튼 클릭 시 모달을 호출하기 위한 Trigger 컴포넌트입니다.
'use client';

import {useState} from 'react';
import ModalDefault from "@/components/Modal/ModalDefault/ModalDefault";
import {ClientModalTriggerProps} from "@/types/modals";

export default function ClientModalTrigger({
                                               type,
                                               title,
                                               buttonText,
                                           }: ClientModalTriggerProps) {
    const [showModal, setShowModal] = useState(false);

    return (
        <>
            <button onClick={() => setShowModal(true)}>{buttonText}</button>
            {showModal && (
                <ModalDefault
                    type={type}
                    label={title}
                    onClose={() => setShowModal(false)}
                />
            )}
        </>
    );
}