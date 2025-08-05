// 데이터셋 모달 전용 Trigger 컴포넌트입니다.
'use client';

import {useState} from 'react';
import './ModalDeptTrigger.scss';
import ModalUpload from "@/components/modal/DataSet/ModalUpload/ModalUpload";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faFile} from "@fortawesome/free-solid-svg-icons/faFile";

export default function ModalDataTrigger({buttonText}: { buttonText: string }) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button className="button is-link" onClick={() => setOpen(true)}>
                <FontAwesomeIcon icon={faFile} style={{ width: 20, height: 20, marginRight: 10 }} />
                {buttonText}
            </button>
            {open && <ModalUpload onClose={() => setOpen(false)}/>}
        </>
    );

}