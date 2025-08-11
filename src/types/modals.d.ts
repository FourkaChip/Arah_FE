// 모달에서 사용되는 상황별 데이터 타입을 관리하는 파일입니다.
import React from "react";

// ModalButtonType은 모달에서 버튼의 유형을 정의합니다.
export type ModalButtonType = 'default' | 'cancel' | 'delete-data' | 'department';

// ModalType은 모달의 종류를 정의합니다.
export type ModalType =
    | 'auth'
    | 'token-register'
    | 'token-check'
    | 'password'
    | 'password-lost'
    | 'department-register'
    | 'delete-password-check';

export type ModalInputType = 'auth' | 'token' | 'department' | 'tag' | 'password' | 'folder' | 'edit-dataset';

// ModalButtonProps는 모달에서 버튼에 사용되는 속성 타입입니다.
export interface ClientModalTriggerProps {
    type: ModalButtonType;
    title: string;
    buttonText: React.ReactNode;
}

// ModalButtonProps는 모달에서 버튼에 사용되는 속성 타입입니다.
export interface ModalWindowProps {
    type: ModalButtonType;
    label: string;
    onClose: () => void;
    onSubmit?: () => void;
    errorMessages?: string[];
    description?: string; // 설명을 위한 필드 추가
}

// ModalConfirmButtonProps는 모달에서 확인 버튼에 사용되는 속성 타입입니다.
export interface ModalConfirmButtonProps {
    type: ModalButtonType;
    label: string;
    onClick?: () => void;
    onSubmit?: () => void;
    disabled?: boolean;
}

// ModalInputProps는 모달 입력창에서 사용되는 속성 타입입니다.
export interface ModalInputProps {
    modalType: ModalInputType;
    title?: string;
    description?: string;
    onClose: () => void;
    onSubmit?: (value: string) => Promise<boolean | void> | boolean | void;
    onResendCode?: () => void;
    onVerifyError?: (error: any) => void;
    error?: string;
    defaultValue?: string;
    disabled?: boolean;
}

// ModalLayoutProps는 모달 입력창에서 사용되는 속성 타입입니다.
export interface ModalLayoutProps {
    title: string;
    description?: string;
    onClose: () => void;
    children?: React.ReactNode;
    footer?: React.ReactNode;
    className?: string | {
        overlay?: string;
        window?: string;
        dialog?: string;
        modal?: string;
    };
}

// ModalDepartmentProps는 부서 등록 모달에서 사용되는 속성 타입입니다.
export interface ModalDepartmentProps {
    defaultStep?: 'list' | 'select';
    defaultUser?: any;
    defaultChecked?: string[];
    onClose?: () => void;
}

// ModalUploadProps는 데이터셋 업로드 모달에서 사용되는 속성 타입입니다.
export interface ModalUploadProps {
    onClose: () => void;
}

// ModalFAQProps는 FAQ 등록 모달에서 사용되는 속성 타입입니다.
export interface ModalFAQProps {
    onClose: () => void;
    onSubmit: (data: {
        category: string;
        question: string;
        answer: string;
    }) => void;
    category?: string;
    question?: string;
    answer?: string;
}

// CustomDropDownProps는 커스텀 드롭다운 컴포넌트에서 사용되는 속성 타입입니다.
export interface CustomDropDownProps {
    value: string;
    options: string[];
    onChange: (value: string) => void;
    onAddOption?: () => void;
}

export interface ModalCommitProps {
    onClose: () => void;
    docId?: number;
    folderId?: number;
}

export interface ExtendedModalUploadProps extends ModalUploadProps {
    folderId?: number | null;
    onSubmit?: (file: File, commitMessage: string) => Promise<any>;
}

export interface ModalInputFilledProps {
    type: 'password-lost' | 'token-check';
    onClose: () => void;
    value?: string;
}