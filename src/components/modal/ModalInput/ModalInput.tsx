import {useState, useEffect} from 'react';
import './ModalInput.scss';
import '@/components/modal/ModalLayout.scss';
import ModalLayout from "@/components/modal/ModalLayout";
import {ModalInputProps} from "@/types/modals";
import ModalButton from "@/components/modal/Buttons/ModalButton";
import {useRouter} from "next/navigation";
import {useQueryClient} from '@tanstack/react-query';
import {toast, Toaster} from 'react-hot-toast';
import SpinnerOverlay from '@/components/spinner/SpinnerOverlay';

export default function ModalInput({
                                       modalType,
                                       title,
                                       onClose,
                                       onSubmit,
                                       onResendCode,
                                       onVerifyError,
                                       error: externalError,
                                       defaultValue = '',
                                       disabled = false
                                   }: ModalInputProps) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [inputValue, setInputValue] = useState(defaultValue);
    const [error, setError] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | undefined>(externalError);
    const [successModal, setSuccessModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const [timeLeft, setTimeLeft] = useState(180);
    const [isTimerActive, setIsTimerActive] = useState(modalType === 'auth');

    useEffect(() => {
        setErrorMsg(externalError);
        setError(!!externalError);
    }, [externalError]);

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        if (isTimerActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsTimerActive(false);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isTimerActive, timeLeft]);

    useEffect(() => {
        setInputValue(defaultValue);
    }, [defaultValue]);

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const handleResendCode = async () => {
        if (onResendCode) {
            try {
                onResendCode();
                setTimeLeft(180);
                setIsTimerActive(true);
            } catch {
                toast.error('인증코드 재전송에 실패했습니다.');
            }
        }
    };

    const getModalConfig = () => {
        // 레이아웃에 맞춰 5가지 모달 타입으로 분기하였습니다.
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
            case 'tag':
                return {
                    title: '태그 추가',
                    description: '추가할 태그명을 입력해주세요.',
                    placeholder: '태그명 (ex.복지제도)',
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
            case 'folder':
                return {
                    title: '폴더 생성',
                    description: '생성할 폴더명을 입력해주세요.',
                    placeholder: '폴더명 (ex.회사규정)',
                    buttonType: 'default',
                    buttonLabel: '생성',
                };
            case 'edit-dataset':
                return {
                    title: '데이터셋 이름 수정',
                    description: '변경할 데이터셋 이름을 입력해주세요.',
                    placeholder: '데이터셋명 (ex.회사규정)',
                    buttonType: 'default',
                    buttonLabel: '수정',
                };
            case 'edit-folder':
                return {
                    title: title || '폴더명 수정',
                    description: '변경할 폴더명을 입력해주세요.',
                    placeholder: '폴더명 (ex.회사규정)',
                    buttonType: 'default',
                    buttonLabel: '수정',
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
                try {
                    await onSubmit(inputValue);
                } catch (error: any) {
                    if (onVerifyError) {
                        onVerifyError(error);
                    } else {
                        setError(true);
                        setErrorMsg('인증에 실패했습니다.');
                    }
                }
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
                        setInputValue('');
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
            if (onSubmit) {
                setLoading(true);
                try {
                    const result = await onSubmit(inputValue);
                    if (result !== false) {
                        setSuccessModal(true);
                        setInputValue('');
                        setError(false);
                        setErrorMsg(undefined);
                    } else {
                        setError(true);
                    }
                } catch (e: any) {
                    setError(true);
                    setErrorMsg(e.message || '유효한 토큰을 입력해 주세요');
                } finally {
                    setLoading(false);
                }
            }
            return;
        }

        if (modalType === 'tag') {
            if (onSubmit) {
                setLoading(true);
                try {
                    const result = await onSubmit(inputValue);
                    if (result !== false) {
                        setSuccessModal(true);
                        setInputValue('');
                        setError(false);
                        setErrorMsg(undefined);
                    } else {
                        setError(true);
                    }
                } catch (e: any) {
                    setError(true);
                    setErrorMsg(e.message || '태그 등록에 실패했습니다.');
                } finally {
                    setLoading(false);
                }
            }
            return;
        }

        if (modalType === 'folder') {
            if (onSubmit) {
                setLoading(true);
                try {
                    const result = await onSubmit(inputValue);
                    if (result !== false) {
                        setSuccessModal(true);
                        setInputValue('');
                        setError(false);
                        setErrorMsg(undefined);
                    } else {
                        setError(true);
                    }
                } catch (e: any) {
                    setError(true);
                    setErrorMsg(e.message || '폴더 생성에 실패했습니다.');
                } finally {
                    setLoading(false);
                }
            }
            return;
        }

        if (modalType === 'edit-dataset') {
            if (onSubmit) {
                setLoading(true);
                try {
                    const result = await onSubmit(inputValue);
                    if (result !== false) {
                        setInputValue('');
                        setError(false);
                        setErrorMsg(undefined);
                        onClose();
                    } else {
                        setError(true);
                    }
                } catch (e: any) {
                    setError(true);
                    setErrorMsg(e.message || '데이터셋 이름 수정에 실패했습니다.');
                } finally {
                    setLoading(false);
                }
            }
            return;
        }

        if (modalType === 'edit-folder') {
            if (onSubmit) {
                setLoading(true);
                try {
                    const result = await onSubmit(inputValue);
                    if (result !== false) {
                        setInputValue('');
                        setError(false);
                        setErrorMsg(undefined);
                        onClose();
                    } else {
                        setError(true);
                    }
                } catch (e: any) {
                    setError(true);
                    setErrorMsg(e.message || '폴더명 수정에 실패했습니다.');
                } finally {
                    setLoading(false);
                }
            }
            return;
        }

        onClose();
    };

    const isVerifyLoading = modalType === 'auth' && disabled;

    return (
        <>
            {isVerifyLoading && <SpinnerOverlay message="인증 중..." zIndex={10000}/>}

            <Toaster position="top-right"/>
            <ModalLayout
                title={title || config.title}
                description={config.description}
                className="tall-modal"
                footer={
                    <ModalButton
                        type={config.buttonType as 'default' | 'delete-data'}
                        label={loading ? '처리중...' : config.buttonLabel}
                        onClick={handleSubmit}
                        disabled={loading}
                    />
                }
                onClose={onClose}
            >
                <div className="modal-input-container">
                    <h2 className="modal-input-title">{config.title}</h2>
                    <div className="input-wrapper">
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
                            disabled={modalType === 'auth' && (timeLeft === 0 || isVerifyLoading)}
                        />
                        {modalType === 'auth' && (
                            <span className={`timer-display ${timeLeft === 0 ? 'expired' : ''}`}>
                                {timeLeft === 0 ? '요청 시간이 만료되었습니다' : formatTime(timeLeft)}
                            </span>
                        )}
                    </div>
                </div>
                <div className="modal-input-row">
                    <span className="modal-error-message">
                        {error && modalType === 'auth' && !errorMsg ? '인증코드를 다시 확인해 주세요' : ''}
                        {error && modalType === 'token' && !errorMsg ? '유효한 토큰을 입력해 주세요' : ''}
                        {error && modalType === 'department' && !errorMsg ? '부서 등록에 실패했습니다' : ''}
                        {error && modalType === 'tag' && !errorMsg ? '태그 등록에 실패했습니다' : ''}
                        {error && modalType === 'folder' && !errorMsg ? '폴더 생성에 실패했습니다' : ''}
                        {error && modalType === 'edit-dataset' && !errorMsg ? '데이터셋 이름 수정에 실패했습니다' : ''}
                        {error && modalType === 'edit-folder' && !errorMsg ? '폴더명 수정에 실패했습니다' : ''}
                        {errorMsg || ''}
                    </span>
                    {config.subText && (
                        <span className="modal-input-noemail">
                            {config.subText}
                            <a
                                onClick={() => {
                                    if (modalType === 'auth' && !isVerifyLoading) {
                                        handleResendCode();
                                    }
                                }}
                                style={{
                                    cursor: isVerifyLoading ? 'not-allowed' : 'pointer',
                                    opacity: isVerifyLoading ? 0.5 : 1
                                }}
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
                                    : modalType === 'tag'
                                        ? '태그 등록 완료'
                                        : modalType === 'folder'
                                            ? '폴더 생성 완료'
                                            : ''
                    }
                    description={
                        modalType === 'auth'
                            ? '인증되었습니다.'
                            : modalType === 'token'
                                ? '토큰이 등록되었습니다.'
                                : modalType === 'department'
                                    ? '부서가 등록되었습니다.'
                                    : modalType === 'tag'
                                        ? '태그가 등록되었습니다.'
                                        : modalType === 'folder'
                                            ? '폴더가 생성되었습니다.'
                                            : ''
                    }
                    footer={
                        <ModalButton
                            type="default"
                            label="확인"
                            onClick={() => {
                                setSuccessModal(false);
                                onClose();
                                // 2차인증 & 부서 등록 & 폴더 생성 분기 설정하였습니다.
                                if (modalType !== 'department' && modalType !== 'tag' && modalType !== 'folder') {
                                    router.push('/master/manage');
                                }
                            }}
                            disabled={loading}
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