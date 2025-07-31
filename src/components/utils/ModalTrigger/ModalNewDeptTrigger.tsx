// 부서 등록 모달 전용 Trigger 컴포넌트입니다.
'use client';

import {useState} from 'react';
import './ModalDeptTrigger.scss';
import ModalInput from '@/components/Modal/ModalInput/ModalInput';
import { createDepartment } from '@/api/auth/master';
import { useQueryClient } from '@tanstack/react-query';

export default function ModalNewDeptTrigger({buttonText}: { buttonText: string }) {
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();

    const handleCreateDepartment = async (deptName: string) => {
        if (!deptName.trim()) return false;

        try {
            // TODO: 현재 companyId는 하드코딩되어 있습니다. 추후에 동적으로 변경할 수 있도록 수정 필요합니다.
            await createDepartment(deptName, 2);
            await queryClient.invalidateQueries({ queryKey: ['departmentList'] });
            setOpen(false);
            return true;
        } catch (e) {
            console.error('부서 생성 실패:', e);
            return false;
        }
    };

    return (
        <>
            <button className="button is-link" onClick={() => setOpen(true)}>
                <img src="/AddAdmin.svg" alt="icon" className="icon-left" />
                {buttonText}
            </button>
            {open && (
                <ModalInput
                    onClose={() => setOpen(false)}
                    modalType={'department'}
                    title={'부서 등록'}
                    onSubmit={handleCreateDepartment}
                />
            )}
        </>
    );
}