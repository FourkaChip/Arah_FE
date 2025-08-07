//components/Modal/BotTest/ModalBotTest.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import ModalLayout from '../ModalLayout';
import { Message } from '@/constants/dummydata/DummyBotTest';
import { botDummyMessages } from '@/constants/dummydata/DummyBotTest';
import MessageBubble from './MessageBubble';
import './ModalBotTest.scss';
import Image from 'next/image';

interface ModalBotTestProps {
  onClose: () => void;
}

const ModalBotTest: React.FC<ModalBotTestProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const showMessages = async () => {
      for (let i = 0; i < botDummyMessages.length; i++) {
        const currentMessage = botDummyMessages[i];
        if (currentMessage.sender === 'bot') {
          setIsTyping(true);
          await new Promise(resolve => setTimeout(resolve, 500));
          setIsTyping(false);
        }
        setMessages(prev => [...prev, currentMessage]);
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    };

    showMessages();
  }, []);

  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <ModalLayout title="봇 테스트" onClose={onClose} className="bot-test-modal">
      <div className="bot-chat-container">
        <div className="chat-area" ref={chatAreaRef}>
          {messages.map(msg => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          {isTyping && (
            <div className="message-bubble-container is-bot">
              <Image src="/bot-icon.jpeg" alt="Bot Icon" width={32} height={32} className="bot-icon" />
              <div className="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}
        </div>
        <div className="chat-input-container">
          <input
            type="text"
            className="input"
            placeholder="테스트할 발화를 입력해 주세요."
          />
          <button className="send-button">
            <i className="fa-regular fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </ModalLayout>
  );
};

export default ModalBotTest;
