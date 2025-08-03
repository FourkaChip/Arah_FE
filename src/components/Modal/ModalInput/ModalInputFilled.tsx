import { registerCompanyToken } from '@/api/auth/master';
import { useAuthStore } from '@/store/auth.store';
import {modalInputFilledConfig} from '@/constants/modalConfig';
import '@/../src/components/Modal/ModalInput/ModalInputFilled.scss';
import ModalButton from "@/components/Modal/Buttons/ModalButton";
import ModalDefault from "@/components/Modal/ModalDefault/ModalDefault";
import { useState, useEffect } from 'react';

interface ModalInputFilledProps {
    type: 'password-lost' | 'token-check';
    onClose: () => void;
    value?: string;
}

const ModalInputFilled = ({type, onClose, value}: ModalInputFilledProps) => {
    const {title, description, value: defaultValue, buttonLabel} = modalInputFilledConfig[type];

    // 기존 토큰 값
    const [inputValue, setInputValue] = useState('');
    // 재등록 모드 여부
    const [editMode, setEditMode] = useState(false);
    // 등록 처리 중 여부
    const [loading, setLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false); // 추가

    useEffect(() => {
        setInputValue(value ?? defaultValue ?? '');
    }, [value, defaultValue]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(inputValue);
            alert('복사되었습니다.');
        } catch (err) {}
    };

    const handleSubmit = async () => {
        if (type === 'password-lost') {
            onClose();
            return;
        }

        if (type === 'token-check') {
            if (!editMode) {
                // 재등록 버튼 클릭 시 input 활성화
                setEditMode(true);
                setInputValue('');
                return;
            }
            const tokenToRegister = inputValue;
            const accessToken = useAuthStore.getState().accessToken;

            if (!tokenToRegister || tokenToRegister.trim() === '') {
                alert("등록할 토큰을 입력해 주세요.");
                return;
            }

            setLoading(true);
            try {
                await registerCompanyToken(tokenToRegister);
                setEditMode(false);
                setInputValue(tokenToRegister);
                setShowSuccessModal(true); // 성공 모달 띄우기
            } catch (e: any) {
                alert(e.message || "토큰 재등록 실패");
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <>
            <div className="modal-overlay token-modal">
                <div className="modal-input-filled">
                    <div className="modal-window-input-filled">
                        <div className="modal-dialog-filled-modal">
                            <button className="modal-close" onClick={onClose}>×</button>
                            <h2 className="modal-title-filled">{title}</h2>
                            <p className="modal-description-filled">{description}</p>

                            <div className="filled-input-wrapper">
                                <input
                                    className="filled-input"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    readOnly={!editMode}
                                    placeholder={editMode ? "새 토큰 입력" : undefined}
                                />
                                {!editMode && (
                                    <button className="copy-button" onClick={handleCopy} aria-label="복사">
                                        📋
                                    </button>
                                )}
                            </div>

                            <div className="footer-modalinput-filled">
                                <ModalButton
                                    type="default"
                                    label={editMode ? (loading ? "등록 중..." : "등록") : buttonLabel}
                                    onClick={handleSubmit}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {showSuccessModal && (
                <ModalDefault
                    type="default"
                    label="토큰 재등록"
                    onClose={() => {
                        setShowSuccessModal(false);
                        onClose();
                    }}
                />
            )}
        </>
    );
};

export default ModalInputFilled;