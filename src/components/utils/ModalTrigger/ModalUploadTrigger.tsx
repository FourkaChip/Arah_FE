// 데이터셋 업로드 모달 전용 Trigger 컴포넌트입니다.
'use client';

import { useState } from 'react';
import ModalUpload from "@/components/Modal/DataSet/ModalUpload/ModalUpload";

export default function ModalUploadTrigger({ buttonText, className }: { buttonText: string; className?: string }) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button className={className} onClick={() => setOpen(true)}>
                {buttonText}
            </button>
            {open && <ModalUpload onClose={() => setOpen(false)} />}
        </>
    );
}