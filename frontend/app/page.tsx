'use client';

import React, { useState, useEffect, useRef } from 'react';
import ChatMessage from './components/ChatMessage';
import CollapsibleSection from './components/CollapsibleSection';
import { FaSpinner } from 'react-icons/fa';
import Head from 'next/head';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

interface DataItem {
  [key: string]: string | number | null;
}

interface DataSummary {
  columns: string[];
  data_summary: DataItem[];
}

interface SourceData {
  [datasetName: string]: DataSummary;
}

interface ChatResponse {
  reply: string;
  source_data: SourceData | null;
}

export default function Home() {
  const [inputMessage, setInputMessage] = useState('');
  const [model, setModel] = useState('gpt-3.5-turbo');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I am your survey analysis assistant. How can I help you today?',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [sourceData, setSourceData] = useState<SourceData | null>(null);

  // Reference to the chat container for scrolling
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to the bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Add user's message to the conversation
    const newMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString(),
    };
    const newMessages = [...messages, newMessage];
    setMessages(newMessages);
    setInputMessage('');
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: newMessages, model }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          setError('The server is busy. Please wait a moment and try again.');
        } else {
          const errorData = await response.json();
          setError(errorData.detail || 'An error occurred while processing your request.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ChatResponse = await response.json();
      console.log('Received data:', data);

      // Add assistant's reply to the conversation
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toISOString(),
      };
      setMessages([...newMessages, assistantMessage]);

      // Update sourceData
      setSourceData(data.source_data);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Error state is already set above
    }
    setIsLoading(false);
  };

  const handleNewChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Hello! I am your survey analysis assistant. How can I help you today?',
        timestamp: new Date().toISOString(),
      },
    ]);
    setInputMessage('');
    setError('');
    setSourceData(null);
  };

  const modelOptions = [
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (4K tokens)' },
    { value: 'gpt-3.5-turbo-16k', label: 'GPT-3.5 Turbo (16K tokens)' },
    { value: 'gpt-4', label: 'GPT-4 (8K tokens)' },
    { value: 'gpt-4-32k', label: 'GPT-4 (32K tokens)' },
  ];

  function capitalize(str: string) {
    return str
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  return (
    <>
      <Head>
        <title>Survey Chat Assistant</title>
        {/* Favicon Links */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        {/* Additional Meta Tags for better SEO and PWA support */}
        <meta name="theme-color" content="#ffffff" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-start p-4 sm:p-8 bg-gray-100">
        <div className="w-full max-w-3xl bg-white shadow-lg rounded-lg p-4 sm:p-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-center">
            Survey Chat Assistant
          </h1>
          <p className="mb-4 sm:mb-6 text-center text-gray-600">
            This AI assistant helps analyze and compare survey results related to sustainability and
            other topics. Ask any questions you have about the surveys!
          </p>
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
            <div className="mb-2 sm:mb-0 w-full sm:w-auto">
              <label htmlFor="model" className="block mb-1 font-medium">
                Choose Model:
              </label>
              <select
                id="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="p-2 border rounded w-full sm:w-auto"
              >
                {modelOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleNewChat}
              className="p-2 bg-red-500 text-white rounded hover:bg-red-600 w-full sm:w-auto"
            >
              New Chat
            </button>
          </div>
          <div
            ref={chatContainerRef}
            className="mb-4 sm:mb-6 border p-4 h-64 sm:h-96 overflow-y-scroll bg-gray-50 rounded"
          >
            {messages.map((msg, index) => (
              <ChatMessage key={index} message={msg} />
            ))}
            {isLoading && (
              <div className="mb-4 flex justify-start">
                <img
                  src="/assistant-avatar.png"
                  alt="Assistant"
                  className="w-8 h-8 rounded-full mr-2"
                />
                <div className="inline-block p-3 rounded-lg bg-gray-200 text-gray-800 flex items-center">
                  <FaSpinner className="animate-spin inline-block mr-2" />
                  <span>Typing...</span>
                </div>
              </div>
            )}
          </div>
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="flex">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message"
              disabled={isLoading}
              className="flex-grow p-3 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className={`p-3 rounded-r-lg ${
                isLoading || !inputMessage.trim()
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'
              } text-white`}
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </form>
          {sourceData && (
            <div className="mt-6 bg-gray-100 p-4 sm:p-6 rounded-lg">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">Source Data</h2>
              {Object.entries(sourceData).map(([datasetName, dataset], idx) => (
                <CollapsibleSection key={idx} title={`${capitalize(datasetName)} Data`}>
                  <p className="font-medium">Top {dataset.columns.length} Columns:</p>
                  <ul className="list-disc list-inside mb-2">
                    {dataset.columns.map((col: string, index: number) => (
                      <li key={index}>{col}</li>
                    ))}
                  </ul>
                  <p className="font-medium">Data Samples:</p>
                  <pre className="bg-white p-2 rounded overflow-x-scroll">
                    {JSON.stringify(dataset.data_summary, null, 2)}
                  </pre>
                </CollapsibleSection>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
