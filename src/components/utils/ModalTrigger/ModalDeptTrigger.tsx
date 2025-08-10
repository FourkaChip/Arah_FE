// 부서 모달 전용 Trigger 컴포넌트입니다.
"use client";

import {useState, useCallback} from 'react';
import ModalDepartment from '@/components/modal/ModalDepartment/ModalDepartment';
import './ModalDeptTrigger.scss';
import Image from 'next/image';

export default function ModalDeptTrigger({buttonText}: { buttonText: string }) {
    const [open, setOpen] = useState(false);

    const handleOpen = useCallback(() => setOpen(true), []);
    const handleClose = useCallback(() => setOpen(false), []);

    return (
        <>
            <button className="button is-link" onClick={handleOpen}>
                <Image src="/AddAdmin.svg" alt="icon" className="icon-left" width={50} height={50} />
                {buttonText}
            </button>
            {open && (
                <ModalDepartment onClose={handleClose} />
            )}
        </>
    );
}