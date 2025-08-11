// 공통 모달창 컴포넌트. 여기에 상황별 콘텐츠를 넣어서 사용합니다.
import './ModalDefault.scss';
import ModalButton from "@/components/modal/Buttons/ModalButton";
import ModalLayout from "@/components/modal/ModalLayout";
import { ModalWindowProps } from "@/types/modals";

type ModalDefaultProps = ModalWindowProps;

export default function ModalDefault({
    type,
    label,
    onClose,
    onSubmit,
    errorMessages,
    description,
}: ModalDefaultProps) {
    let fallbackDescription = '';
    let buttonLabel = '';
    const buttonType = type;

    switch (type) {
        case 'default':
            if (errorMessages && errorMessages.length > 0) {
                fallbackDescription = errorMessages[0];
            } else if (label === '토큰 재등록') {
                fallbackDescription = '토큰 재등록이 완료되었습니다.';
            } else if (label === '��제 완료') {
                fallbackDescription = '성공적으로 삭제되었습니다.';
            } else if (label === '업로드 완료') {
                fallbackDescription = '데이터셋이 성공적으로 업로드되었습니다.';
            } else if (label === '오류') {
                fallbackDescription = '오류가 발생했습니다.';
            } else {
                fallbackDescription = '답변이 전송되었습니다.';
            }
            buttonLabel = '확인';
            break;
        case 'cancel':
            fallbackDescription = '작업을 취소하시겠습니까?';
            buttonLabel = '취소';
            break;
        case 'delete-data':
            fallbackDescription = '정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.';
            buttonLabel = '삭제';
            break;
    }

    return (
        <ModalLayout title={label} description={description || fallbackDescription} onClose={onClose}>
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