import React, { useState, useEffect, useRef, useCallback } from 'react';
import { apiCall } from '../services/realApi';
import Loader from './Loader';
import { FaComments, FaUser, FaRobot } from 'react-icons/fa';

const STORAGE_KEY = 'chatbot_history';

const Chatbot = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (error) {
        console.error('Error parsing chat history:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history]);

  const handleSend = useCallback(async () => {
    setError('');
    if (!input.trim()) {
      setError('Please enter a message.');
      return;
    }
    
    const userMessage = input.trim();
    setInput('');
    setLoading(true);
    
    try {
      const res = await apiCall('chatbot', userMessage);
      const newEntry = { user: userMessage, bot: res.output };
      const updatedHistory = [...history, newEntry];
      setHistory(updatedHistory);
      
      // Save to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
      } catch (storageError) {
        console.warn('Failed to save chat history to localStorage:', storageError);
      }
    } catch (e) {
      console.error('Chatbot error:', e);
      setError(e.message || 'Something went wrong. Please try again.');
      // Restore the input if there was an error
      setInput(userMessage);
    } finally {
      setLoading(false);
    }
  }, [input, history]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear chat history from localStorage:', error);
    }
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg">
            <FaComments size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">🤖 AI Chatbot</h2>
            <p className="text-gray-600">Have a friendly conversation with our AI assistant 💬</p>
          </div>
        </div>
        
        {history.length > 0 && (
          <button
            onClick={clearHistory}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Clear Chat
          </button>
        )}
      </div>
      
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex-1 bg-gray-50 rounded-lg p-4 overflow-y-auto space-y-4 min-h-0">
          {history.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <FaComments size={48} className="mx-auto mb-3 opacity-50" />
                <p className="text-lg mb-2">👋 Start a conversation!</p>
                <p className="text-sm">Ask me anything about content creation, writing, or just chat! 💬</p>
              </div>
            </div>
          ) : (
            history.map((item, idx) => (
              <div key={idx} className="space-y-3">
                {/* User message */}
                <div className="flex justify-end">
                  <div className="flex items-start gap-2 max-w-[80%]">
                    <div className="bg-blue-500 text-white rounded-lg px-4 py-2 shadow-md">
                      {item.user}
                    </div>
                    <div className="p-1 bg-blue-100 rounded-full">
                      <FaUser size={12} className="text-blue-600" />
                    </div>
                  </div>
                </div>
                
                {/* Bot message */}
                <div className="flex justify-start">
                  <div className="flex items-start gap-2 max-w-[80%]">
                    <div className="p-1 bg-green-100 rounded-full">
                      <FaRobot size={12} className="text-green-600" />
                    </div>
                    <div className="bg-white text-gray-800 rounded-lg px-4 py-2 shadow-md border">
                      <div className="whitespace-pre-wrap break-words leading-relaxed">
                        {item.bot.split('\n').map((line, lineIdx) => {
                          // Handle bullet points
                          if (line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*')) {
                            return (
                              <div key={lineIdx} className="flex items-start gap-2 my-2">
                                <span className="text-blue-500 font-bold mt-1 text-sm">•</span>
                                <span className="text-sm leading-relaxed">{line.replace(/^[\s•\-*]+/, '')}</span>
                              </div>
                            );
                          }
                          // Handle numbered lists
                          else if (/^\s*\d+\./.test(line)) {
                            return (
                              <div key={lineIdx} className="my-2">
                                <span className="font-semibold text-blue-600 text-sm">{line.match(/^\s*\d+\./)[0]}</span>
                                <span className="ml-1 text-sm leading-relaxed">{line.replace(/^\s*\d+\.\s*/, '')}</span>
                              </div>
                            );
                          }
                          // Handle bold text (wrapped in **)
                          else if (line.includes('**')) {
                            const parts = line.split('**');
                            return (
                              <div key={lineIdx} className="my-1">
                                {parts.map((part, partIdx) => 
                                  partIdx % 2 === 1 ? 
                                    <strong key={partIdx} className="font-semibold text-gray-900">{part}</strong> : 
                                    <span key={partIdx} className="text-sm leading-relaxed">{part}</span>
                                )}
                              </div>
                            );
                          }
                          // Handle code blocks (wrapped in ```)
                          else if (line.trim().startsWith('```')) {
                            return (
                              <div key={lineIdx} className="bg-gray-100 rounded p-2 my-2 font-mono text-xs overflow-x-auto">
                                {line.replace(/```/g, '')}
                              </div>
                            );
                          }
                          // Regular lines
                          else if (line.trim()) {
                            return (
                              <div key={lineIdx} className="my-1 text-sm leading-relaxed">
                                {line}
                              </div>
                            );
                          }
                          // Empty lines for spacing
                          else {
                            return <div key={lineIdx} className="h-3"></div>;
                          }
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          
          {loading && (
            <div className="flex justify-start">
              <div className="flex items-start gap-2">
                <div className="p-1 bg-green-100 rounded-full">
                  <FaRobot size={12} className="text-green-600" />
                </div>
                <div className="bg-white text-gray-800 rounded-lg px-4 py-2 shadow-md border">
                  <div className="flex items-center gap-2">
                    <Loader />
                    <span className="text-gray-500 text-sm">AI is thinking... 🤔</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>
        
        <div className="space-y-3">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          
          <div className="flex gap-3">
            <textarea
              className="flex-1 rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none bg-white text-gray-900 min-h-[44px] max-h-24"
              placeholder="Type your message... 💭"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              maxLength={500}
              aria-label="Chat message input"
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot; 