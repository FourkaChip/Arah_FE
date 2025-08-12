import React from "react";

export interface NotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    maxItems?: number;
    buttonRef: React.RefObject<HTMLButtonElement | null>;
    refreshModalData?: () => Promise<void>; // 모달용 새로고침 함수 추가
}

export interface MarkAllReadButtonProps {
    onClick: () => void;
    disabled?: boolean;
    className?: string;
    children?: React.ReactNode;
}