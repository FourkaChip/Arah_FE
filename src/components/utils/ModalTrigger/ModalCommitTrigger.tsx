'use client';

import {useState} from 'react';
import ModalCommit from '@/components/modal/DataSet/ModalCommit/ModalCommit';
import {ModalCommitTriggerProps} from "@/types/dataset";

export default function ModalCommitTrigger({ docId }: ModalCommitTriggerProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleOpen = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);

    return (
        <>
            <button className="sub-btn" onClick={handleOpen}>
                보기
            </button>
            {isOpen && <ModalCommit onClose={handleClose} docId={docId} />}
        </>
    );
}