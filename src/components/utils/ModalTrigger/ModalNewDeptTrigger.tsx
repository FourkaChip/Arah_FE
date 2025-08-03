// 부서 등록 모달 전용 Trigger 컴포넌트입니다.
'use client';

import {useState, useEffect} from 'react';
import './ModalDeptTrigger.scss';
import ModalInput from '@/components/Modal/ModalInput/ModalInput';
import {createDepartment, fetchCurrentUserInfo} from '@/api/auth/master';
import {useQueryClient} from '@tanstack/react-query';

export default function ModalNewDeptTrigger({buttonText}: { buttonText: string }) {
    const [open, setOpen] = useState(false);
    const [companyId, setCompanyId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const queryClient = useQueryClient();

    // 컴포넌트 마운트 시 로그인한 사용자의 companyId를 가져옵니다.
    useEffect(() => {
        const getUserInfo = async () => {
            if (open) {
                setIsLoading(true);
                try {
                    const userInfo = await fetchCurrentUserInfo();
                    if (userInfo && userInfo.companyId) {
                        setCompanyId(userInfo.companyId);
                        setError(null);
                    } else {
                        setError('회사 정보를 가져올 수 없습니다.');
                    }
                } catch (e) {
                    setError('사용자 정보를 불러오는데 실패했습니다.');
                } finally {
                    setIsLoading(false);
                }
            }
        };

        getUserInfo();
    }, [open]);

    const handleCreateDepartment = async (deptName: string) => {
        if (!deptName.trim()) return false;
        if (!companyId) {
            setError('회사 정보를 가져올 수 없습니다.');
            return false;
        }

        try {
            // 로그인한 사용자의 companyId를 사용합니다.
            await createDepartment(deptName, companyId);
            await queryClient.invalidateQueries({queryKey: ['departmentList']});
            setOpen(false);
            return true;
        } catch (e: any) {
            setError(e.message || '부서 생성에 실패했습니다.');
            return false;
        }
    };

    return (
        <>
            <button
                className="button is-link"
                onClick={() => {
                    setError(null);
                    setOpen(true)
                }}
                disabled={isLoading}
            >
                <img src="/AddAdmin.svg" alt="icon" className="icon-left"/>
                {buttonText}
            </button>
            {open && (
                <ModalInput
                    onClose={() => setOpen(false)}
                    modalType={'department'}
                    title={'부서 등록'}
                    onSubmit={handleCreateDepartment}
                    error={error || undefined}
                />
            )}
        </>
    );
}