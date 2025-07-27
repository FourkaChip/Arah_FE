'use client';

import {useState} from 'react';
import ModalFAQ from "@/components/Modal/ModalFAQ/ModalFAQ";
import './ModalFAQTrigger.scss';
import {faFile} from "@fortawesome/free-solid-svg-icons/faFile";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

export default function ModalFAQTrigger() {
    const [isOpen, setIsOpen] = useState(false);

    const handleOpen = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);

    return (
        <>
            <button className="button is-link" onClick={handleOpen}>
                <FontAwesomeIcon icon={faFile} style={{ width: 20, height: 20, marginRight: 10 }} />
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