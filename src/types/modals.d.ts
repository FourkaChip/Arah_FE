// 모달에서 사용되는 상황별 데이터 타입을 관리하는 파일입니다.
import React from "react";

export type ModalType = 'default' | 'cancel' | 'delete-data';

export interface ClientModalTriggerProps {
    type: ModalType;
    title: string;
    buttonText: string;
}

export interface ModalWindowProps {
    type: ModalType;
    label: string;
    onClose: () => void;
}

export interface ModalConfirmButtonProps {
    type: ModalType;
    label: string;
    onClick: () => void;
}

export interface ModalLayoutProps {
    title: string;
    description?: string;
    onClose: () => void;
    children?: React.ReactNode;
    footer?: React.ReactNode;
}