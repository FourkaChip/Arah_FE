'use client';
import {useState} from 'react';
import './ModalInput.scss';
import '@/components/Modal/ModalLayout.scss';
import ModalLayout from "@/components/Modal/ModalLayout";
import {ModalLayoutProps} from "@/types/modals";
import ModalButton from "@/components/Modal/Buttons/ModalButton";

export type ModalInputType = 'token' | 'auth' | 'department' | 'password';

interface ModalInputProps extends ModalLayoutProps {
    modalType: ModalInputType;
}

export default function ModalInput({modalType, onClose}: ModalInputProps) {
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

    const [inputValue, setInputValue] = useState('');
    const [error, setError] = useState(false);
    const [successModal, setSuccessModal] = useState(false);

    return (
        <>
            <ModalLayout
                title={config.title}
                description={config.description}
                className="tall-modal"
                footer={
                    <ModalButton
                        type={config.buttonType as 'default' | 'delete-data'}
                        label={config.buttonLabel}
                        onClick={() => {
                            if (modalType === 'auth') {
                                if (inputValue === 'success') {
                                    setSuccessModal(true);
                                } else {
                                    setError(true);
                                }
                            } else if (modalType === 'token') {
                                if (inputValue === 'valid-token') {
                                    setSuccessModal(true);
                                } else {
                                    setError(true);
                                }
                            } else if (modalType === 'department') {
                                if (inputValue === 'valid-dept') {
                                    setSuccessModal(true);
                                } else {
                                    setError(true);
                                }
                            } else {
                                onClose();
                            }
                        }}
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
                        }}
                    />
                </label>
                {error && modalType === 'auth' && (
                    <p className="modal-error-message">인증코드를 다시 확인해 주세요</p>
                )}
                {error && modalType === 'token' && (
                    <p className="modal-error-message">유효한 토큰을 입력해 주세요</p>
                )}
                {config.subText && (
                    <p className="modal-input-noemail">
                        {config.subText}
                        <a>{config.subLinkText}</a>
                    </p>
                )}
            </ModalLayout>
            {/* 마스터 로그인 인증 성공 시 */}
            {/* 토큰 모달이 나오는 경우는, DB 조회 후 토큰 column이 비어 있으면 로그인버튼 클릭 시 나타납니다.(구현 예정) */}
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
                                window.location.href = '/master/manage';
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