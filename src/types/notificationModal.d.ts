import React from "react";

export interface NotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    maxItems?: number;
    buttonRef: React.RefObject<HTMLButtonElement | null>;
    refreshModalData?: () => Promise<void>;
}

export interface MarkAllReadButtonProps {
    onClick: () => void;
    disabled?: boolean;
    className?: string;
    children?: React.ReactNode;
}