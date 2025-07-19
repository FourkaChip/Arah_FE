// 모달에서 사용되는 상황별 데이터 타입을 관리하는 파일입니다.
import React from "react";

export type ModalButtonType = 'default' | 'cancel' | 'delete-data';
export type ModalType =
    | 'auth'
    | 'token-register'
    | 'token-check'
    | 'password'
    | 'password-lost'
    | 'department-register'
    | 'delete-password-check';

export interface ClientModalTriggerProps {
    type: ModalButtonType;
    title: string;
    buttonText: string;
}

export interface ModalWindowProps {
    type: ModalButtonType;
    label: string;
    onClose: () => void;
}

export interface ModalConfirmButtonProps {
    type: ModalButtonType;
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