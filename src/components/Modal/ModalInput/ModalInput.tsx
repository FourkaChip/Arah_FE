"use client";
import {useState, useEffect} from 'react';
import './ModalInput.scss';
import '@/components/Modal/ModalLayout.scss';
import ModalLayout from "@/components/Modal/ModalLayout";
import {ModalInputProps, ModalInputType} from "@/types/modals";
import ModalButton from "@/components/Modal/Buttons/ModalButton";
import {useRouter} from "next/navigation";
import ModalDefault from "@/components/Modal/ModalDefault/ModalDefault";
import {useQueryClient} from '@tanstack/react-query';

export default function ModalInput({
                                       modalType,
                                       title,
                                       onClose,
                                       onSubmit,
                                       onResendCode,
                                       error: externalError
                                   }: ModalInputProps) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [inputValue, setInputValue] = useState('');
    const [error, setError] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | undefined>(externalError);
    const [successModal, setSuccessModal] = useState(false);
    const [loading, setLoading] = useState(false);

    // 외부에서 전달된 에러 메시지가 변경되면 state를 업데이트
    useEffect(() => {
        setErrorMsg(externalError);
        setError(!!externalError);
    }, [externalError]);

    const getModalConfig = () => {
        // 레이아웃에 맞춰 4가지 모달 타입으로 분기하였습니다.
        switch (modalType) {
            case 'token':
                return {
                    title: '토큰 등록',
                    description: '카카오워크 내 그룹 채팅방을 생성할 수 있는 토큰을 등록합니다.',
                    placeholder: '토큰 입력',
                    subText: '토큰을 분실하셨나요? ',
                    subLinkText: '여기를 클릭하세요',
                    buttonType: 'default',
                    buttonLabel: '등록',
                };
            case 'auth':
                return {
                    title: '마스터 2차 인증',
                    description: '등록된 이메일로 전송된 인증코드를 입력하세요',
                    placeholder: '인증코드 입력',
                    subText: '이메일을 받지 못하셨나요? ',
                    subLinkText: '재요청',
                    buttonType: 'default',
                    buttonLabel: '확인',
                };
            case 'department':
                return {
                    title: '부서 등록',
                    description: '추가할 부서를 입력해주세요.',
                    placeholder: '부서명 (ex.인사담당부)',
                    buttonType: 'default',
                    buttonLabel: '등록',
                };
            case 'password':
                return {
                    title: '비밀번호 재확인',
                    description: '데이터 삭제를 위해 비밀번호를 한 번 더 입력해 주세요.',
                    placeholder: '비밀번호 입력',
                    buttonType: 'delete-data',
                    buttonLabel: '삭제',
                };
            default:
                throw new Error(`Unknown modalType: ${modalType}`);
        }
    };

    const config = getModalConfig();

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && inputValue && !loading) {
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        if (!inputValue.trim()) {
            setError(true);
            return;
        }

        if (modalType === 'auth') {
            if (onSubmit) {
                onSubmit(inputValue);
            }
            return;
        }

        if (modalType === 'department') {
            if (onSubmit) {
                setLoading(true);
                try {
                    const result = await onSubmit(inputValue);
                    if (result !== false) {
                        await queryClient.invalidateQueries({queryKey: ['departmentList']});
                        setSuccessModal(true);
                        setInputValue(''); // 입력 필드 초기화
                        setError(false);
                        setErrorMsg(undefined);
                    } else {
                        setError(true);
                    }
                } catch (e: any) {
                    setError(true);
                    setErrorMsg(e.message || '부서 등록에 실패했습니다.');
                } finally {
                    setLoading(false);
                }
            }
            return;
        }

        if (modalType === 'token') {
            if (inputValue === 'valid-token') {
                setSuccessModal(true);
            } else {
                setError(true);
            }
        } else {
            onClose();
        }
    };

    return (
        <>
            <ModalLayout
                title={title || config.title}
                description={config.description}
                className="tall-modal"
                footer={
                    <ModalButton
                        type={config.buttonType as 'default' | 'delete-data'}
                        label={loading ? '처리중...' : config.buttonLabel}
                        onClick={handleSubmit}
                    />
                }
                onClose={onClose}
            >
                <label className="modal-input-label">
                    <h2 className="modal-input-title">{config.title}</h2>
                    <input
                        className={`input ${error ? 'is-error' : ''}`}
                        placeholder={config.placeholder}
                        value={inputValue}
                        onChange={(e) => {
                            setInputValue(e.target.value);
                            setError(false);
                            setErrorMsg(undefined);
                        }}
                        onKeyDown={handleKeyDown}
                    />
                </label>
                <div className="modal-input-row">
                    <span className="modal-error-message">
                        {error && modalType === 'auth' && !errorMsg ? '인증코드를 다시 확인해 주세요' : ''}
                        {error && modalType === 'token' && !errorMsg ? '유효한 토큰을 입력해 주세요' : ''}
                        {error && modalType === 'department' && !errorMsg ? '부서 등록에 실패했습니다' : ''}
                        {errorMsg || ''}
                    </span>
                    {config.subText && (
                        <span className="modal-input-noemail">
                            {config.subText}
                            <a
                                onClick={() => {
                                    if (modalType === 'auth' && onResendCode) {
                                        onResendCode();
                                    }
                                }}
                                style={{cursor: 'pointer'}}
                            >
                                {config.subLinkText}
                            </a>
                        </span>
                    )}
                </div>
            </ModalLayout>
            {successModal && (
                <ModalLayout
                    title={
                        modalType === 'auth'
                            ? '인증 완료'
                            : modalType === 'token'
                                ? '토큰 등록 완료'
                                : modalType === 'department'
                                    ? '부서 등록 완료'
                                    : ''
                    }
                    description={
                        modalType === 'auth'
                            ? '인증되었습니다.'
                            : modalType === 'token'
                                ? '토큰이 등록되었습니다.'
                                : modalType === 'department'
                                    ? '부서가 등록되었습니다.'
                                    : ''
                    }
                    footer={
                        <ModalButton
                            type="default"
                            label="확인"
                            onClick={() => {
                                setSuccessModal(false);
                                onClose();
                                // 2차인증 & 부서 등록 분기 설정하였습니다.
                                if (modalType !== 'department') {
                                    router.push('/master/manage');
                                }
                            }}
                        />
                    }
                    onClose={() => {
                        setSuccessModal(false);
                        onClose();
                    }}
                />
            )}
        </>
    );
}