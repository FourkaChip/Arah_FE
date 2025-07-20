// 모달에서 사용되는 상황별 데이터 타입을 관리하는 파일입니다.
import React from "react";

// ModalButtonType은 모달에서 버튼의 유형을 정의합니다.
export type ModalButtonType = 'default' | 'cancel' | 'delete-data';

// ModalType은 모달의 종류를 정의합니다.
export type ModalType =
    | 'auth'
    | 'token-register'
    | 'token-check'
    | 'password'
    | 'password-lost'
    | 'department-register'
    | 'delete-password-check';

// ModalButtonProps는 모달에서 버튼에 사용되는 속성 타입입니다.
export interface ClientModalTriggerProps {
    type: ModalButtonType;
    title: string;
    buttonText: string;
}

// ModalButtonProps는 모달에서 버튼에 사용되는 속성 타입입니다.
export interface ModalWindowProps {
    type: ModalButtonType;
    label: string;
    onClose: () => void;
}

// ModalConfirmButtonProps는 모달에서 확인 버튼에 사용되는 속성 타입입니다.
export interface ModalConfirmButtonProps {
    type: ModalButtonType;
    label: string;
    onClick: () => void;
}

// ModalInputProps는 모달 입력창에서 사용되는 속성 타입입니다.
export interface ModalLayoutProps {
    title: string;
    description?: string;
    onClose: () => void;
    children?: React.ReactNode;
    footer?: React.ReactNode;
}

// ModalDepartmentProps는 부서 등록 모달에서 사용되는 속성 타입입니다.
export interface ModalDepartmentProps {
    defaultStep?: 'list' | 'select';
    defaultUser?: any;
    defaultChecked?: string[];
    onClose?: () => void;
}