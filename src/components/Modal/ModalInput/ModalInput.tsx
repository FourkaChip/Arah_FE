'use client';
import './ModalInput.scss';
import '@/components/Modal/ModalLayout.scss';
import ModalLayout from "@/components/Modal/ModalLayout";
import { ModalLayoutProps } from "@/types/modals";
import ModalButton from "@/components/Modal/Buttons/ModalButton";


export default function ModalInput({ title, description, onClose }: ModalLayoutProps) {
    return (
        <ModalLayout
            title="마스터 2차 인증"
            description="등록된 이메일로 전송된 인증코드를 입력하세요"
            className="tall-modal"
            footer={
                <ModalButton
                    type={'default'}
                    label={'확인'}
                    onClick={onClose}
                />
            }
            onClose={onClose}
        >
            <label className="modal-input-label">
                <h2 className="modal-input-title">인증 코드</h2>
                <input className="input" placeholder="인증코드 입력" />
            </label>
            <p className="modal-input-noemail">이메일을 받지 못하셨나요? <a>재요청</a></p>
        </ModalLayout>
    );
}