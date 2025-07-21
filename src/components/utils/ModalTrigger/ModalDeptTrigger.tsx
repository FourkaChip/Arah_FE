// 부서 모달 전용 Trigger 컴포넌트입니다.
'use client';

import { useState } from 'react';
import ModalDepartment from '@/components/Modal/ModalDepartment/ModalDepartment';

export default function ModalDeptTrigger({ buttonText }: { buttonText: string }) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button onClick={() => setOpen(true)}>{buttonText}</button>
            {open && <ModalDepartment onClose={() => setOpen(false)} />}
        </>
    );
}