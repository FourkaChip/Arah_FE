// 부서 등록 모달 전용 Trigger 컴포넌트입니다.
'use client';

import {useState} from 'react';
import './ModalDeptTrigger.scss';
import ModalInput from '@/components/Modal/ModalInput/ModalInput';

export default function ModalNewDeptTrigger({buttonText}: { buttonText: string }) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button className="button is-link" onClick={() => setOpen(true)}>
                <img src="/AddAdmin.svg" alt="icon" className="icon-left" />
                {buttonText}
            </button>
            {open && <ModalInput onClose={() => setOpen(false)} modalType={'department'} title={'부서 등록'}/>}
        </>
    );
}