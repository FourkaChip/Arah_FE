'use client';

import {useState} from 'react';
import ModalFAQ from "@/components/Modal/ModalFAQ/ModalFAQ";

export default function ModalFAQTrigger() {
    const [isOpen, setIsOpen] = useState(false);

    const handleOpen = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);

    return (
        <>
            <button className="button is-primary" onClick={handleOpen}>
                FAQ 등록
            </button>
            {isOpen && <ModalFAQ
                onClose={() => handleClose()}
                onSubmit={(data) => {
                    console.log("등록된 FAQ 데이터:", data);
                }}
            />}
        </>
    );
}