import React, { useState, useRef, useEffect } from 'react';
import './TooltipCell.scss';

interface TooltipCellProps {
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
    const [isOverflowing, setIsOverflowing] = useState(false);
    const textRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const checkOverflow = () => {
            if (textRef.current) {
                const isTextOverflowing = textRef.current.scrollWidth > textRef.current.clientWidth;
                setIsOverflowing(isTextOverflowing);
            }
        };

        checkOverflow();
        window.addEventListener('resize', checkOverflow);
        return () => window.removeEventListener('resize', checkOverflow);
    }, [text]);

    const handleMouseEnter = () => {
        if (isOverflowing) {
            setShowTooltip(true);
        }
    };

    const handleMouseLeave = () => {
        setShowTooltip(false);
    };

    return (
        <div className={`tooltip-wrapper ${className}`}>
            <div
                ref={textRef}
                className="tooltip-text"
                style={{ maxWidth }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {text}
            </div>

            {showTooltip && isOverflowing && (
                <div className="tooltip-popup">
                    {text}
                    <div className="tooltip-arrow" />
                </div>
            )}
        </div>
    );
};

export default React.memo(TooltipCell);
