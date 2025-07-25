'use client';

import {useState} from 'react';
import ModalCommit from '@/components/Modal/DataSet/ModalCommit/ModalCommit';

export default function ModalCommitTrigger() {
    const [isOpen, setIsOpen] = useState(false);

    const handleOpen = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);

    return (
        <>
            <button className="sub-btn" onClick={handleOpen}>
                보기
            </button>
            {isOpen && <ModalCommit onClose={handleClose} />}
        </>
    );
}