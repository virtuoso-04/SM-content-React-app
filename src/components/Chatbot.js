import React, { useState, useEffect, useRef, useCallback } from 'react';
import { apiCall } from '../services/realApi';
import Loader from './Loader';
import { FaComments, FaUser, FaRobot } from 'react-icons/fa';
import FormattedAIResponse from './FormattedAIResponse';

const STORAGE_KEY = 'chatbot_history';

const Chatbot = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [tone, setTone] = useState('friendly');
  const [creativity, setCreativity] = useState(0.7);
  const chatEndRef = useRef(null);
  
  const toneOptions = [
    { value: 'friendly', label: 'Friendly', description: 'Warm and conversational' },
    { value: 'professional', label: 'Professional', description: 'Executive-ready' },
    { value: 'playful', label: 'Playful', description: 'Energetic & emoji-rich' },
    { value: 'expert', label: 'Expert', description: 'Insightful & authoritative' },
  ];

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
      const res = await apiCall('chatbot', {
        message: userMessage,
        tone,
        creativity,
      });
      const newEntry = { user: userMessage, bot: res.output, tone, creativity };
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
  }, [input, history, tone, creativity]);

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
    <div className="flex h-full flex-col text-slate-100">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl border border-white/20 bg-gradient-to-r from-emerald-400/60 to-cyan-500/60 p-3 text-white shadow-[0_20px_60px_rgba(34,197,94,0.35)]">
            <FaComments size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-white">🤖 AI Chatbot</h2>
            <p className="text-sm text-slate-300">Have a friendly conversation with our AI assistant 💬</p>
          </div>
        </div>

        {history.length > 0 && (
          <button
            onClick={clearHistory}
            className="rounded-2xl border border-white/15 bg-white/5 px-3 py-1 text-sm text-slate-200 transition hover:border-cyan-300/50"
          >
            Clear Chat
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-4">
        <div className="glass-panel min-h-0 flex-1 space-y-4 overflow-y-auto border-white/10 bg-white/5 p-4">
          {history.length === 0 ? (
            <div className="flex h-full items-center justify-center text-slate-400">
              <div className="text-center">
                <FaComments size={48} className="mx-auto mb-3 opacity-60" />
                <p className="mb-2 text-lg">👋 Start a conversation!</p>
                <p className="text-sm">Ask me anything about content creation, writing, or just chat! 💬</p>
              </div>
            </div>
          ) : (
            history.map((item, idx) => {
              const entryTone = item.tone || 'friendly';
              const entryCreativity = typeof item.creativity === 'number' ? Math.round(item.creativity * 100) : null;
              const toneLabel = toneOptions.find((opt) => opt.value === entryTone)?.label || 'Friendly';
              return (
              <div key={idx} className="space-y-3">
                <div className="flex justify-end">
                  <div className="flex max-w-[80%] items-start gap-2">
                    <div className="rounded-2xl border border-cyan-300/40 bg-gradient-to-r from-cyan-400/40 to-blue-500/40 px-4 py-2 text-white shadow-lg">
                      {item.user}
                    </div>
                    <div className="rounded-full border border-white/10 bg-white/10 p-1">
                      <FaUser size={12} className="text-white" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-start">
                  <div className="flex max-w-[80%] items-start gap-2">
                    <div className="rounded-full border border-white/10 bg-white/10 p-1">
                      <FaRobot size={12} className="text-emerald-200" />
                    </div>
                    <div className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-200 shadow-md">
                      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-slate-300">
                        <span className="glass-chip text-emerald-200">
                          {toneLabel} tone
                        </span>
                        {entryCreativity !== null && (
                          <span className="glass-chip text-cyan-200">
                            Creativity {entryCreativity}%
                          </span>
                        )}
                      </div>
                      <FormattedAIResponse content={item.bot} />
                    </div>
                  </div>
                </div>
              </div>
              );
            })
          )}
          
          {loading && (
            <div className="flex justify-start">
              <div className="flex items-start gap-2">
                <div className="rounded-full border border-white/10 bg-white/10 p-1">
                  <FaRobot size={12} className="text-emerald-200" />
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-slate-200 shadow-md">
                  <div className="flex items-center gap-2">
                    <Loader />
                    <span className="text-sm text-slate-400">AI is thinking... 🤔</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>
        
        <div className="space-y-3">
          {error && (
            <div className="rounded-2xl border border-rose-400/40 bg-rose-500/10 p-3 text-sm text-rose-100">
              {error}
            </div>
          )}

          <div className="grid gap-3 md:grid-cols-[1.2fr_1fr]">
            <div className="glass-panel border-white/10 bg-white/5 p-4">
              <label htmlFor="tone" className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-300">
                Response tone
              </label>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {toneOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setTone(option.value)}
                    className={`rounded-2xl border px-3 py-2 text-left text-sm transition-all ${
                      tone === option.value
                        ? 'border-cyan-300/70 bg-gradient-to-r from-cyan-500/30 via-sky-500/20 to-indigo-500/20 text-white'
                        : 'border-white/10 text-slate-200 hover:border-cyan-200/40'
                    }`}
                  >
                    <div className="font-semibold">{option.label}</div>
                    <div className="text-xs text-slate-400">{option.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-panel border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.3em] text-slate-300">
                Creativity
                <span className="text-cyan-200">{Math.round(creativity * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(creativity * 100)}
                onChange={(e) => setCreativity(parseInt(e.target.value, 10) / 100)}
                className="mt-3 w-full accent-cyan-300"
              />
              <p className="mt-1 text-xs text-slate-400">Lower = precise • Higher = imaginative</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <textarea
              className="glass-input flex-1 border-white/15 bg-white/5 p-3 text-base text-white"
              placeholder="Type your message... 💭"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              maxLength={500}
              aria-label="Chat message input"
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="rounded-2xl border border-transparent bg-gradient-to-r from-[#A6FFCB] via-[#12D8FA] to-[#1FA2FF] px-6 py-3 font-semibold text-slate-900 shadow-[0_25px_80px_rgba(15,118,230,0.35)] transition hover:translate-y-[-1px] disabled:opacity-40"
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