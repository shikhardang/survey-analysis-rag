'use client';

import React, { useState, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const [timestamp, setTimestamp] = useState('');

  useEffect(() => {
    if (message.timestamp) {
      const timeString = new Date(message.timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      setTimestamp(timeString);
    }
  }, [message.timestamp]);

  return (
    <div className={`mb-4 flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <img
          src="/assistant-avatar.png"
          alt="Assistant"
          className="w-8 h-8 rounded-full mr-2"
        />
      )}
      <div
        className={`max-w-xs p-3 rounded-lg ${
          isUser ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        {timestamp && (
          <div className="text-xs text-gray-500 mt-1 text-right">{timestamp}</div>
        )}
      </div>
      {isUser && (
        <img
          src="/user-avatar.jpeg"
          alt="You"
          className="w-8 h-8 rounded-full ml-2"
        />
      )}
    </div>
  );
};

export default ChatMessage;
