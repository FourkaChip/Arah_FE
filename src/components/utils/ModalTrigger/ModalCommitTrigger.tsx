'use client';

import {useState} from 'react';
import ModalCommit from '@/components/Modal/DataSet/ModalCommit/ModalCommit';

export default function ModalCommitTrigger() {
    const [isOpen, setIsOpen] = useState(false);

    const handleOpen = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);

    return (
        <>
            <button className="button is-primary" onClick={handleOpen}>
                변경사항 확인
            </button>
            {isOpen && <ModalCommit onClose={handleClose} />}
        </>
    );
}