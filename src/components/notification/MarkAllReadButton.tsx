import React from 'react';
import './MarkAllReadButton.scss';

interface MarkAllReadButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

const MarkAllReadButton: React.FC<MarkAllReadButtonProps> = ({ 
  onClick, 
  disabled = false,
  className = ""
}) => {
  return (
    <button 
      className={`mark-all-read-btn ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      전체 읽음 표시
    </button>
  );
};

export default MarkAllReadButton;