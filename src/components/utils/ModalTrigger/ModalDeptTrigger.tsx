// 부서 모달 전용 Trigger 컴포넌트입니다.
"use client";

import {useState, useCallback} from 'react';
import ModalDepartment from '@/components/modal/ModalDepartment/ModalDepartment';
import './ModalDeptTrigger.scss';

export default function ModalDeptTrigger({buttonText}: { buttonText: string }) {
    // 모달 열림 상태
    const [open, setOpen] = useState(false);

    // 모달 열기/닫기 핸들러를 useCallback으로 메모이제이션
    const handleOpen = useCallback(() => setOpen(true), []);
    const handleClose = useCallback(() => setOpen(false), []);

    return (
        <>
            <button className="button is-link" onClick={handleOpen}>
                <img src="/AddAdmin.svg" alt="icon" className="icon-left" />
                {buttonText}
            </button>
            {open && (
                <ModalDepartment onClose={handleClose} />
            )}
        </>
    );
}