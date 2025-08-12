import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);
    
    setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);

    try {
      const res = await fetch(`${API}/chatbot/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMessage })
      });
      
      const data = await res.json();
      if (res.ok) {
        setMessages(prev => [...prev, {
          text: data.answer,
          sender: 'bot',
          confidence: data.confidence
        }]);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        text: "Sorry, I'm having trouble understanding that right now.",
        sender: 'bot',
        error: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chat-header">
        <h2>E-Waste AI Assistant</h2>
        <p>Powered by E-waste AI</p>
      </div>
      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.sender}`}>
            <div className="message-text">
              <ReactMarkdown>{msg.text}</ReactMarkdown>
            </div>
            {msg.confidence && msg.sender === 'bot' && (
              <div className="message-meta">
                Confidence: {(msg.confidence * 100).toFixed(1)}%
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="message bot">
            <div className="typing-indicator">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} className="chat-input">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message... (Shift+Enter for new line)"
          rows={1}
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()}>
          {loading ? '...' : 'Send'}
        </button>
      </form>
    </div>
  );
}
