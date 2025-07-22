// 부서 모달 전용 Trigger 컴포넌트입니다.
'use client';

import {useState} from 'react';
import ModalDepartment from '@/components/Modal/ModalDepartment/ModalDepartment';
import './ModalDeptTrigger.scss';

export default function ModalDeptTrigger({buttonText}: { buttonText: string }) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button className="button is-link" onClick={() => setOpen(true)}>
                <img src="/AddAdmin.svg" alt="icon" className="icon-left" />
                {buttonText}
            </button>
            {open && <ModalDepartment onClose={() => setOpen(false)}/>}
        </>
    );
}