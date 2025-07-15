'use client';
import './ModalWindow.scss';
import ModalConfirmButton from "@/components/Modal/Buttons/ModalConfirmButton";

export default function ModalWindow() {
  return (
    <div className="modal-window">
      <div className="modal-dialog">
        <button className="modal-close">×</button>
        <h2 className="modal-title">답변 전송</h2>
        <p className="modal-description">답변이 전송되었습니다.</p>
        <ModalConfirmButton onclick={function(): void {
                  throw new Error('Function not implemented.');
              } }/>
      </div>
    </div>
  );
}