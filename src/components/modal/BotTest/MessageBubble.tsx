// components/Modal/BotTest/MessageBubble.tsx
'use client';
import React from 'react';
import Image from 'next/image';
import styles from './ModalBotTest.module.scss';

export interface Message {
    id: number;
    sender: 'user' | 'bot';
    text: string;
}

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isBot = message.sender === 'bot';

  return (
    <div className={`${styles.messageBubbleContainer} ${isBot ? styles.isBot : styles.isUser}`}>
      {isBot && (
        <Image src="/bot-icon.jpeg" alt="Bot Icon" width={32} height={32} className={styles.botIcon} />
      )}
      <div className={styles.messageBubble}>
        <p className={styles.messageText}>{message.text}</p>
      </div>
    </div>
  );
};

export default MessageBubble;