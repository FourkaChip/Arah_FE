// components/Modal/BotTest/MessageBubble.tsx
'use client';
import React from 'react';
import { Message } from '@/constants/dummydata/DummyBotTest';
import Image from 'next/image';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isBot = message.sender === 'bot';

  return (
    <div className={`message-bubble-container ${isBot ? 'is-bot' : 'is-user'}`}>
      {isBot && (
        <Image src="/bot-icon.jpeg" alt="Bot Icon" width={32} height={32} className="bot-icon" />
      )}
      <div className="message-bubble">
        <p className="message-text">{message.text}</p>
      </div>
    </div>
  );
};

export default MessageBubble;