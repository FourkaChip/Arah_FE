// 공통 모달창 컴포넌트. 여기에 상황별 콘텐츠를 넣어서 사용합니다.
'use client';
import './ModalWindow.scss';
import ModalButton from "@/components/Modal/Buttons/ModalButton";
import { ModalWindowProps} from "@/types/modals";

export default function ModalWindow({ type, label, onClose }: ModalWindowProps) {
    let description = '';
    let buttonLabel = '';
    let buttonType = type; // 그대로 넘기기

    switch (type) {
        case 'default':
            description = '답변이 전송되었습니다.';
            buttonLabel = '확인';
            break;
        case 'cancel':
            description = '작업을 취소하시겠습니까?';
            buttonLabel = '취소';
            break;
        case 'delete-data':
            description = '정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.';
            buttonLabel = '삭제';
            break;
    }

    return (
        <div className="modal-window">
            <div className="modal-dialog">
                <button className="modal-close" onClick={onClose}>×</button>
                <h2 className="modal-title">{label}</h2>
                <p className="modal-description">{description}</p>
                <div className="modal-buttons">
                    <ModalButton
                        type={buttonType}
                        label={buttonLabel}
                        onClick={onClose}
                    />
                </div>
            </div>
        </div>
    );
}