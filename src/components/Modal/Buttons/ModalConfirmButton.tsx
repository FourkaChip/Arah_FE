'use client';
// 확인, 등록 등에 사용되는 버튼 디자인
import '@/components/Modal/Buttons/ModalConfirmButton.scss'; // globals.scss에 있는 스타일 코드는 적용되지 않고, 해당 경로의 scss만 참조합니다.
export default function ModalConfirmButton() {
    return (
            <button className="common-agree-button">
                확인
            </button>
    );
}