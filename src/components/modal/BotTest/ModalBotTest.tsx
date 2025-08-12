//components/Modal/BotTest/ModalBotTest.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import ModalLayout from '../ModalLayout';
import { Message } from '@/constants/dummydata/DummyBotTest';
import { sendChatMessage } from '@/api/admin/botTest/botTestFetch';
import MessageBubble from './MessageBubble';
import styles from './ModalBotTest.module.scss';
import Image from 'next/image';

interface ModalBotTestProps {
    onClose: () => void;
}

const ModalBotTest: React.FC<ModalBotTestProps> = ({ onClose }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatAreaRef = useRef<HTMLDivElement>(null);
    const hasInitialized = useRef(false);
    const nextId = useRef(1);

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
        <ModalLayout
            title="봇 테스트"
            onClose={onClose}
            className={{
                overlay: styles.botTestOverlay,
                window: styles.botTestWindow,
                dialog: styles.botTestDialog,
                modal: styles.botTestModal
            }}
        >
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
        </ModalLayout>
    );
};

export default ModalBotTest;
