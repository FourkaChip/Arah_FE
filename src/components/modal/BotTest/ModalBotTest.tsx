//components/Modal/BotTest/ModalBotTest.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import styles from './ModalBotTest.module.scss';
import Image from 'next/image';
import { useBotChat } from '@/hooks/useBotChat';
import { useDraggableModal } from '@/hooks/useDraggableModal';

interface ModalBotTestProps {
    onClose: () => void;
}

const ModalBotTest: React.FC<ModalBotTestProps> = ({ onClose }) => {
    const chatAreaRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    const {
        messages,
        isTyping,
        inputValue,
        isLoading,
        setInputValue,
        handleSendMessage,
    } = useBotChat(inputRef);

    const { modalPosition, handleMouseDown } = useDraggableModal(modalRef, {
        initialWidth: 380,
        initialHeight: 550,
    });

    // 스크롤을 맨 아래로
    useEffect(() => {
        if (chatAreaRef.current) {
            chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    // 엔터 키 처리
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className={styles.botTestOverlay} onClick={onClose}>
            <div 
                ref={modalRef}
                className={styles.botTestModal}
                onClick={(e) => e.stopPropagation()}
                style={{
                    position: 'absolute',
                    left: modalPosition.x,
                    top: modalPosition.y,
                    transform: 'none'
                }}
            >
                <div 
                    className={styles.header}
                    onMouseDown={handleMouseDown}
                    style={{ cursor: 'move' }}
                >
                    <h2>봇 테스트</h2>
                    <button className={styles.closeButton} onClick={onClose}>×</button>
                </div>
                <div className={styles.botChatContainer}>
                <div className={styles.chatArea} ref={chatAreaRef}>
                    {messages.map(msg => (
                        <MessageBubble key={msg.id} message={msg} />
                    ))}
                    {isTyping && (
                        <div className={`${styles.messageBubbleContainer} ${styles.isBot}`}>
                            <Image 
                                src="/bot-icon.jpeg" 
                                alt="Bot Icon" 
                                width={32} 
                                height={32}
                                className={styles.botIcon}
                            />
                            <div className={styles.typingIndicator}>
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    )}
                </div>
                <div className={styles.chatInputContainer}>
                    <input
                        ref={inputRef}
                        type="text"
                        className={styles.input}
                        placeholder="테스트할 발화를 입력해 주세요."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isLoading}
                    />
                    <button 
                        className={styles.sendButton}
                        onClick={handleSendMessage}
                        disabled={isLoading || !inputValue.trim()}
                    >
                        <i className="fa-regular fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        </div>
        </div>
    );
};

export default ModalBotTest;
