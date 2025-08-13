//components/Modal/BotTest/ModalBotTest.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { sendChatMessage } from '@/api/admin/botTest/botTestFetch';
import MessageBubble from './MessageBubble';
import styles from './ModalBotTest.module.scss';
import Image from 'next/image';

export interface Message {
    id: number;
    sender: 'user' | 'bot';
    text: string;
}

interface ModalBotTestProps {
    onClose: () => void;
}

const ModalBotTest: React.FC<ModalBotTestProps> = ({ onClose }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatAreaRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const hasInitialized = useRef(false);
    const nextId = useRef(1);
    const isDragging = useRef(false);
    const dragOffset = useRef({ x: 0, y: 0 });

    // 모달 위치 상태 - 오른쪽 아래에 초기 배치
    const [modalPosition, setModalPosition] = useState(() => {
        const modalWidth = 380;
        const modalHeight = 550;
        const margin = 20; // 오른쪽, 아래쪽 여백
        return {
            x: window.innerWidth - modalWidth - margin, // 오른쪽에서 여백만큼
            y: window.innerHeight - modalHeight - margin // 아래쪽에서 여백만큼
        };
    });

    // 초기 인사 메시지 표시
    useEffect(() => {
        if (hasInitialized.current) return;
        hasInitialized.current = true;

        const showInitialMessage = async () => {
            setIsTyping(true);
            await new Promise(resolve => setTimeout(resolve, 1000));
            setIsTyping(false);
            
            setMessages([{
                id: nextId.current++,
                sender: 'bot',
                text: '안녕하세요! FourKa 챗봇입니다. 무엇을 도와드릴까요?'
            }]);
        };

        showInitialMessage();
    }, []);

    // 스크롤을 맨 아래로
    useEffect(() => {
        if (chatAreaRef.current) {
            chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    // 드래그 시작
    const handleMouseDown = (e: React.MouseEvent) => {
        if (!modalRef.current || typeof document === 'undefined') return;
        
        isDragging.current = true;
        const rect = modalRef.current.getBoundingClientRect();
        dragOffset.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        e.preventDefault();
    };

    // 드래그 중
    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging.current || !modalRef.current) return;
        
        const newX = e.clientX - dragOffset.current.x;
        const newY = e.clientY - dragOffset.current.y;
        
        // 화면 경계 내에서만 이동 가능하도록 제한
        const maxX = window.innerWidth - modalRef.current.offsetWidth;
        const maxY = window.innerHeight - modalRef.current.offsetHeight;
        
        const boundedX = Math.max(0, Math.min(newX, maxX));
        const boundedY = Math.max(0, Math.min(newY, maxY));
        
        setModalPosition({ x: boundedX, y: boundedY });
    }, []);

    // 드래그 종료
    const handleMouseUp = useCallback(() => {
        if (isDragging.current) {
            isDragging.current = false;
            // 안전한 이벤트 리스너 제거
            if (typeof document !== 'undefined') {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            }
        }
    }, [handleMouseMove]);

    // 컴포넌트 언마운트 시 이벤트 리스너 정리
    useEffect(() => {
        return () => {
            // cleanup 시 안전하게 제거
            if (typeof document !== 'undefined') {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            }
            isDragging.current = false;
        };
    }, [handleMouseMove, handleMouseUp]);

    // 메시지 전송 핸들러
    const handleSendMessage = async () => {
        const trimmedMessage = inputValue.trim();
        if (!trimmedMessage || isLoading) return;

        // 사용자 메시지 추가
        const userMessage: Message = {
            id: nextId.current++,
            sender: 'user',
            text: trimmedMessage
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);
        setIsTyping(true);

        // 포커스를 인풋에 유지
        setTimeout(() => {
            inputRef.current?.focus();
        }, 0);

        try {
            // API 호출
            const botResponse = await sendChatMessage(trimmedMessage);
            
            // 봇 응답 추가
            setIsTyping(false);
            const botMessage: Message = {
                id: nextId.current++,
                sender: 'bot',
                text: botResponse
            };

            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            setIsTyping(false);
            const errorMessage: Message = {
                id: nextId.current++,
                sender: 'bot',
                text: '죄송합니다. 일시적인 오류가 발생했습니다. 다시 시도해주세요.'
            };

            setMessages(prev => [...prev, errorMessage]);
            console.error('Chat error:', error);
        } finally {
            setIsLoading(false);
            // 응답 완료 후 인풋에 포커스
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    };

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
