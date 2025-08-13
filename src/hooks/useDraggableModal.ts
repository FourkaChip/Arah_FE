// src/hooks/useDraggableModal.ts
'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface DraggableOptions {
    initialWidth: number;
    initialHeight: number;
    margin?: number;
}

export const useDraggableModal = (
    modalRef: React.RefObject<HTMLDivElement | null>,
    options: DraggableOptions
) => {
    const { initialWidth, initialHeight, margin = 20 } = options;
    const isDragging = useRef(false);
    const dragOffset = useRef({ x: 0, y: 0 });

    const [modalPosition, setModalPosition] = useState(() => {
        if (typeof window === 'undefined') {
            return { x: 0, y: 0 };
        }
        return {
            x: window.innerWidth - initialWidth - margin,
            y: window.innerHeight - initialHeight - margin,
        };
    });

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging.current || !modalRef.current || typeof window === 'undefined') return;

        const newX = e.clientX - dragOffset.current.x;
        const newY = e.clientY - dragOffset.current.y;

        const maxX = window.innerWidth - modalRef.current.offsetWidth;
        const maxY = window.innerHeight - modalRef.current.offsetHeight;

        const boundedX = Math.max(0, Math.min(newX, maxX));
        const boundedY = Math.max(0, Math.min(newY, maxY));

        setModalPosition({ x: boundedX, y: boundedY });
    }, [modalRef]);

    const handleMouseUp = useCallback(() => {
        if (isDragging.current) {
            isDragging.current = false;
            if (typeof document !== 'undefined') {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            }
        }
    }, [handleMouseMove]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (!modalRef.current || typeof document === 'undefined') return;

        isDragging.current = true;
        const rect = modalRef.current.getBoundingClientRect();
        dragOffset.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        e.preventDefault();
    }, [modalRef, handleMouseMove, handleMouseUp]);

    useEffect(() => {
        return () => {
            if (typeof document !== 'undefined') {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            }
            isDragging.current = false;
        };
    }, [handleMouseMove, handleMouseUp]);

    return { modalPosition, handleMouseDown };
};
