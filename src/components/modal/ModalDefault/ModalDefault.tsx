// 공통 모달창 컴포넌트. 여기에 상황별 콘텐츠를 넣어서 사용합니다.
import './ModalDefault.scss';
import ModalButton from "@/components/modal/Buttons/ModalButton";
import ModalLayout from "@/components/modal/ModalLayout";
import { ModalWindowProps } from "@/types/modals";

export default function ModalDefault({ type, label, onClose, onSubmit, errorMessages }: ModalWindowProps) {
    let description = '';
    let buttonLabel = '';
    const buttonType = type;

    switch (type) {
        case 'default':
            if (errorMessages && errorMessages.length > 0) {
                description = errorMessages[0];
            } else if (label === '토큰 재등록') {
                description = '토큰 재등록이 완료되었습니다.';
            } else if (label === '삭제 완료') {
                description = '성공적으로 삭제되었습니다.';
            } else if (label === '업로드 완료') {
                description = '데이터셋이 성공적으로 업로드되었습니다.';
            } else if (label === '오류') {
                description = '오류가 발생했습니다.';
            } else {
                description = '답변이 전송되었습니다.';
            }
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
            <div className="modal-description">
                {errorMessages && errorMessages.length > 1 ? (
                    <div style={{textAlign: 'left'}}>
                        {errorMessages.map((message, index) => (
                            <p key={index} style={{margin: '8px 0', color: '#333'}}>{message}</p>
                        ))}
                    </div>
                ) : (
                    <p>{description}</p>
                )}
            </div>
            <div className="modal-buttons">
                {type === 'delete-data' ? (
                    <ModalButton
                        type={buttonType}
                        label={buttonLabel}
                        onClick={onSubmit}
                    />
                ) : (
                    <ModalButton
                        type={buttonType}
                        label={buttonLabel}
                        onClick={onClose}
                    />
                )}
            </div>
        </ModalLayout>
    );
}