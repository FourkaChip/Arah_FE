// 전체적인 모달 레이아웃을 관리하는 공통 컴포넌트입니다.
'use client';
import React from 'react';
import './ModalLayout.scss';
import {ModalLayoutProps} from "@/types/modals";

const ModalLayout = ({title, description, onClose, children, footer}: ModalLayoutProps) => {
    return (
        <div className="modal-window">
            <div className="modal-dialog">
                <button className="modal-close" onClick={onClose}>×</button>
                <h2 className="modal-title">{title}</h2>
                {description && <p className="modal-description">{description}</p>}
                <div className="modal-content">{children}</div>
                {footer && <div className="modal-footer">{footer}</div>}
            </div>
        </div>
    );
};

export default ModalLayout;