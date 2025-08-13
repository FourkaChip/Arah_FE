import React, {memo} from 'react';
import './MarkAllReadButton.scss';
import {MarkAllReadButtonProps} from "@/types/notificationModal";


const MarkAllReadButton = memo<MarkAllReadButtonProps>(({
                                                            onClick,
                                                            disabled = false,
                                                            className = "",
                                                            children = "전체 읽음 표시"
                                                        }) => {
    return (
        <button
            type="button"
            className={`mark-all-read-btn ${className}`}
            onClick={onClick}
            disabled={disabled}
            aria-label="모든 알림을 읽음으로 표시"
        >
            {children}
        </button>
    );
});

MarkAllReadButton.displayName = 'MarkAllReadButton';

export default MarkAllReadButton;