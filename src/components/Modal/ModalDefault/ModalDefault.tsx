// 공통 모달창 컴포넌트. 여기에 상황별 콘텐츠를 넣어서 사용합니다.
import './ModalDefault.scss';
import ModalButton from "@/components/Modal/Buttons/ModalButton";
import ModalLayout from "@/components/Modal/ModalLayout";
import { ModalWindowProps } from "@/types/modals";

export default function ModalDefault({ type, label, onClose }: ModalWindowProps) {
    let description = '';
    let buttonLabel = '';
    const buttonType = type;

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
        <ModalLayout title={label} onClose={onClose}>
            <p className="modal-description">{description}</p>
            <div className="modal-buttons">
                <ModalButton
                    type={buttonType}
                    label={buttonLabel}
                    onClick={onClose}
                />
            </div>
        </ModalLayout>
    );
}