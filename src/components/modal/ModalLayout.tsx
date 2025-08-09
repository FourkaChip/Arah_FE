// 전체적인 모달 레이아웃을 관리하는 공통 컴포넌트입니다.
'use client';
import React from 'react';
import './ModalLayout.scss';
import {ModalLayoutProps} from "@/types/modals";

const ModalLayout = ({
  title,
  description,
  onClose,
  children,
  footer,
  className,
}: ModalLayoutProps) => {
  let overlayClass = 'modal-overlay';
  let windowClass = 'modal-window';
  let dialogClass = 'modal-dialog';
  let modalClass = '';

  if (typeof className === 'string' && className) {
    windowClass += ` ${className}`;
    dialogClass += ` ${className}`;
    modalClass = className;
  } else if (typeof className === 'object' && className !== null) {
    overlayClass = className.overlay || overlayClass;
    windowClass = className.window || windowClass;
    dialogClass = className.dialog || dialogClass;
    modalClass = className.modal || '';
  }

  return (
    <div className={overlayClass}>
      <div className={`${windowClass} ${modalClass ? modalClass : ''}`}>
        <div className={`${dialogClass} ${modalClass ? modalClass : ''}`}>
          <button className="modal-close" onClick={onClose}>×</button>
          <h2 className={`modal-title ${modalClass ? `${modalClass}-title` : ''}`}>{title}</h2>
          {description && (
            <p className={`modal-description ${modalClass ? `${modalClass}-description` : ''}`}>
              {description}
            </p>
          )}
          <div className="modal-content">{children}</div>
          {footer && <div className="modal-footer">{footer}</div>}
        </div>
      </div>
    </div>
  );
};

export default ModalLayout;