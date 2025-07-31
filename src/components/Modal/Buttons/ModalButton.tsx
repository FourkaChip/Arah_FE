// 확인, 등록 등에 사용되는 버튼 디자인입니다. 모달창에서만 사용
import '@/components/Modal/Buttons/ModalButton.scss'; // globals.scss에 있는 스타일 코드는 적용되지 않고, 해당 경로의 scss만 참조합니다.
import { ModalConfirmButtonProps} from "@/types/modals";

export default function ModalButton({ type, label, onClick }: ModalConfirmButtonProps) {
    return (
        <button
            className={`common-button ${type}`}
            onClick={onClick ? onClick : undefined}
            type="button"
        >
            {label}
        </button>
    );
}