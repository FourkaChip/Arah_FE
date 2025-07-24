import {modalInputFilledConfig} from '@/constants/modalConfig';
import '@/../src/components/Modal/ModalInput/ModalInputFilled.scss';
import ModalButton from "@/components/Modal/Buttons/ModalButton";

interface ModalInputFilledProps {
    type: 'password-lost' | 'token-check';
    onClose: () => void;
}

const ModalInputFilled = ({type, onClose}: ModalInputFilledProps) => {
    const {title, description, value, buttonLabel} = modalInputFilledConfig[type];

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(value);
            alert('복사되었습니다.');
        } catch (err) {
            console.error('복사 실패:', err);
        }
    };

    return (
        <div className="modal-overlay token-modal">
            <div className="modal-input-filled">
                <div className="modal-window-input-filled">
                    <div className="modal-dialog-filled-modal">
                        <button className="modal-close" onClick={onClose}>×</button>
                        <h2 className="modal-title-filled">{title}</h2>
                        <p className="modal-description-filled">{description}</p>

                        <div className="filled-input-wrapper">
                            <input className="filled-input" value={value} readOnly/>
                            <button className="copy-button" onClick={handleCopy} aria-label="복사">
                                📋
                            </button>
                        </div>

                        <div className="footer-modalinput-filled">
                            <ModalButton
                                type="default"
                                label={buttonLabel}
                                onClick={() => {
                                    if (type === 'password-lost') onClose();
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModalInputFilled;