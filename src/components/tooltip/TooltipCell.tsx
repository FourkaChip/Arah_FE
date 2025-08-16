// components/tooltip/TooltipCell.tsx
import React, { useState, useRef, useEffect } from 'react';
import './TooltipCell.scss';

export interface TooltipCellProps {
    text: string;
    maxWidth?: string;
    className?: string;
}

const TooltipCell: React.FC<TooltipCellProps> = ({
                                                     text,
                                                     maxWidth = "200px",
                                                     className = ""
                                                 }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const [tooltipText, setTooltipText] = useState('');
    const [isOverflowing, setIsOverflowing] = useState(false);
    const textRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const checkOverflow = () => {
            if (textRef.current) {
                // 단일 줄 텍스트의 경우 overflow 체크
                if (!text.includes(', ')) {
                    const isTextOverflowing = textRef.current.scrollWidth > textRef.current.clientWidth;
                    setIsOverflowing(isTextOverflowing);
                }
            }
        };

        checkOverflow();
        window.addEventListener('resize', checkOverflow);
        return () => window.removeEventListener('resize', checkOverflow);
    }, [text]);

    const handleMouseEnter = () => {
        if (isOverflowing) {
            setTooltipText(text);
            setShowTooltip(true);
        }
    };

    const handleMouseLeave = () => {
        setShowTooltip(false);
        setTooltipText('');
    };

    // 개별 div 요소에 대한 마우스 이벤트 핸들러
    const handleDivMouseEnter = (e: React.MouseEvent<HTMLDivElement>, fullText: string) => {
        const target = e.currentTarget;
        const isOverflowing = target.scrollWidth > target.clientWidth;

        if (isOverflowing) {
            setTooltipText(fullText);
            setShowTooltip(true);
        }
    };

    const handleDivMouseLeave = () => {
        setShowTooltip(false);
        setTooltipText('');
    };

    // 여러 줄 표시를 위한 텍스트 처리
    const displayText = text.includes(', ') ?
        text.split(', ').map((item, index) => (
            <div
                key={index}
                onMouseEnter={(e) => handleDivMouseEnter(e, item)}
                onMouseLeave={handleDivMouseLeave}
                className="department-item"
            >
                {item}
            </div>
        )) : text;

    return (
        <div className={`tooltip-wrapper ${className}`}>
            <div
                ref={textRef}
                className="tooltip-text"
                style={{ maxWidth }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {displayText}
            </div>

            {showTooltip && tooltipText && (
                <div className="tooltip-popup">
                    {tooltipText}
                    <div className="tooltip-arrow" />
                </div>
            )}
        </div>
    );
};

export default TooltipCell;