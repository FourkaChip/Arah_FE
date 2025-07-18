// 전체적인 모달 레이아웃을 관리하는 공통 컴포넌트입니다.
'use client';
import React from 'react';
import './ModalLayout.scss';
import {ModalLayoutProps} from "@/types/modals";

const ModalLayout = ({title, description, onClose, children, footer, className}: ModalLayoutProps & { className?: string }) => {
    return (
        <div className={`modal-window ${className ?? ''}`}>
            {/* className을 분기하여 상황별로 다른 레이아웃을 적용할 수 있도록 하였습니다. */}
            <div className={`modal-dialog ${className ?? ''}`}>
                <button className="modal-close" onClick={onClose}>×</button>
                <h2 className={`modal-title ${className ? `${className}-title` : ''}`}>{title}</h2>
                {description && (
                    <p className={`modal-description ${className ? `${className}-description` : ''}`}>
                        {description}
                    </p>
                )}
                <div className="modal-content">{children}</div>
                {footer && <div className="modal-footer">{footer}</div>}
            </div>
        </div>
    );
};

export default ModalLayout;