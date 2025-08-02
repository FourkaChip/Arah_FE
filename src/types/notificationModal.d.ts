export interface NotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    maxItems?: number;
    buttonRef: React.RefObject<HTMLButtonElement | null>;
  }