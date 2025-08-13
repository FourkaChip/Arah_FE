// src/hooks/useBotChat.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { sendChatMessage } from '@/api/admin/botTest/botTestFetch';
import { Message } from '@/types/botTest';

export const useBotChat = (inputRef: React.RefObject<HTMLInputElement | null>) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
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

    // 메시지 전송 핸들러
    const handleSendMessage = async () => {
        const trimmedMessage = inputValue.trim();
        if (!trimmedMessage || isLoading) return;

        const userMessage: Message = {
            id: nextId.current++,
            sender: 'user',
            text: trimmedMessage
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);
        setIsTyping(true);

        setTimeout(() => {
            inputRef.current?.focus();
        }, 0);

        try {
            const botResponse = await sendChatMessage(trimmedMessage);
            
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
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    };

    return {
        messages,
        isTyping,
        inputValue,
        isLoading,
        setInputValue,
        handleSendMessage,
    };
};
