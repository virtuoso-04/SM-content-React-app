import React, { useState, useEffect, useRef, useCallback } from 'react';
import { apiCall } from '../services/realApi';
import Loader from './Loader';
import FormattedAIResponse from './FormattedAIResponse';
import { FaComments, FaUser, FaRobot } from 'react-icons/fa';

const STORAGE_KEY = 'chatbot_history';



const Chatbot = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [useSmartRouting, setUseSmartRouting] = useState(true);
  const [lastModelUsed, setLastModelUsed] = useState(null);
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
      let res;
      if (useSmartRouting) {
        // Use smart routing system
        res = await apiCall('smart-route', {
          prompt: userMessage,
          quality_priority: true
        });
        // Update last model used
        if (res.model_used) {
          setLastModelUsed({
            name: res.model_used,
            provider: res.provider,
            task: res.task_type
          });
        }
      } else {
        // Use legacy chatbot endpoint
        res = await apiCall('chatbot', userMessage);
      }
      
      if (!res || res.success === false || !res.output) {
        throw new Error(res?.detail || 'AI response was empty. Please try again.');
      }

      const newEntry = { 
        user: userMessage, 
        bot: res.output,
        model: res.model_used || 'gemini'
      };
      setHistory((prev) => {
        const updated = [...prev, newEntry];
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (storageError) {
          console.warn('Failed to save chat history to localStorage:', storageError);
        }
        return updated;
      });
    } catch (e) {
      console.error('Chatbot error:', e);
      setError(e.message || 'Something went wrong. Please try again.');
      // Restore the input if there was an error
      setInput(userMessage);
    } finally {
      setLoading(false);
    }
  }, [input, useSmartRouting]);

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
      {/* Enhanced Header - Responsive */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 animate-fade-in">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 text-white apple-shadow-lg group hover:scale-110 transition-transform duration-300">
            <FaComments size={28} className="sm:hidden group-hover:rotate-12 transition-transform duration-300" />
            <FaComments size={36} className="hidden sm:block group-hover:rotate-12 transition-transform duration-300" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
              AI Assistant
            </h2>
            <p className="text-gray-600 font-semibold mt-1 text-sm sm:text-base md:text-lg">Your intelligent automation companion</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Smart Routing Toggle */}
          <div className="flex items-center gap-2 px-3 py-2 glass-strong rounded-xl border-2 border-emerald-200/50">
            <button
              onClick={() => setUseSmartRouting(!useSmartRouting)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                useSmartRouting ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gray-300'
              }`}
              title={useSmartRouting ? 'Multi-Model Routing: ON' : 'Multi-Model Routing: OFF'}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                  useSmartRouting ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className="text-xs font-semibold text-gray-700 hidden sm:inline">
              {useSmartRouting ? 'Smart AI' : 'Standard'}
            </span>
          </div>
          
          {/* Model Info Badge */}
          {lastModelUsed && (
            <div className="px-3 py-1.5 glass-strong rounded-lg border border-teal-200/50 animate-fade-in">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 animate-pulse"></div>
                <span className="text-xs font-mono text-gray-600 hidden md:inline">
                  {lastModelUsed.name.split('-')[0]}
                </span>
              </div>
            </div>
          )}

          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:apple-shadow-lg transform hover:scale-105 active:scale-95 transition-all text-xs sm:text-sm font-bold apple-shadow hover:-translate-y-0.5"
            >
              Clear Chat
            </button>
          )}
        </div>
      </div>
      
      <div className="flex-1 flex flex-col gap-3 sm:gap-4 min-h-0">
        {/* Chat Area with improved styling - Responsive */}
        <div className="flex-1 glass rounded-xl sm:rounded-2xl p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6 min-h-0 apple-shadow-lg border border-emerald-100/50 custom-scrollbar">
          {history.length === 0 ? (
            <div className="flex items-center justify-center h-full px-4">
              <div className="text-center space-y-4 sm:space-y-6 max-w-2xl animate-fade-in w-full">
                {/* Large Icon */}
                <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-emerald-100 to-cyan-100 apple-shadow-lg mb-2 sm:mb-4">
                  <FaComments size={40} className="sm:hidden text-emerald-600" />
                  <FaComments size={48} className="hidden sm:block text-emerald-600" />
                </div>
                
                <div className="space-y-2 sm:space-y-3">
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-800">I'm your AI Assistant!</h3>
                  <p className="text-gray-600 text-base sm:text-lg font-medium">
                    Just chat naturally - I'll understand what you need and help you create amazing content!
                  </p>
                </div>
                
                {/* Feature Grid - Responsive */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-left mt-4 sm:mt-6">
                  <div className="glass-subtle p-3 sm:p-4 rounded-lg sm:rounded-xl border border-purple-100/50 hover:glass hover:border-purple-200 transition-all duration-300 apple-shadow">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex-shrink-0"></div>
                      <p className="text-xs sm:text-sm font-semibold text-gray-700">Generate Instagram posts with AI images</p>
                    </div>
                  </div>
                  <div className="glass-subtle p-3 sm:p-4 rounded-lg sm:rounded-xl border border-cyan-100/50 hover:glass hover:border-cyan-200 transition-all duration-300 apple-shadow">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex-shrink-0"></div>
                      <p className="text-xs sm:text-sm font-semibold text-gray-700">Create captions & hashtags</p>
                    </div>
                  </div>
                  <div className="glass-subtle p-3 sm:p-4 rounded-lg sm:rounded-xl border border-emerald-100/50 hover:glass hover:border-emerald-200 transition-all duration-300 apple-shadow">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex-shrink-0"></div>
                      <p className="text-xs sm:text-sm font-semibold text-gray-700">Summarize long content instantly</p>
                    </div>
                  </div>
                  <div className="glass-subtle p-3 sm:p-4 rounded-lg sm:rounded-xl border border-amber-100/50 hover:glass hover:border-amber-200 transition-all duration-300 apple-shadow">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 flex-shrink-0"></div>
                      <p className="text-xs sm:text-sm font-semibold text-gray-700">Brainstorm creative content ideas</p>
                    </div>
                  </div>
                  <div className="glass-subtle p-3 sm:p-4 rounded-lg sm:rounded-xl border border-violet-100/50 hover:glass hover:border-violet-200 transition-all duration-300 apple-shadow">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 flex-shrink-0"></div>
                      <p className="text-xs sm:text-sm font-semibold text-gray-700">Refine and improve your text</p>
                    </div>
                  </div>
                  <div className="glass-subtle p-3 sm:p-4 rounded-lg sm:rounded-xl border border-rose-100/50 hover:glass hover:border-rose-200 transition-all duration-300 apple-shadow">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-rose-500 to-red-500 flex-shrink-0"></div>
                      <p className="text-xs sm:text-sm font-semibold text-gray-700">Generate catchy blog titles</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 sm:mt-6 space-y-2">
                  <p className="text-emerald-600 text-base sm:text-lg font-bold">✨ Just tell me what you need!</p>
                  <div className="glass-subtle p-3 rounded-lg border border-emerald-100/50">
                    <p className="text-xs sm:text-sm text-gray-600 italic">
                      Examples: "Create an Instagram post about morning coffee" • "Give me hashtags for travel" • "Summarize this article..."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            history.map((item, idx) => (
              <div key={idx} className="space-y-3 sm:space-y-4 animate-fade-in">
                {/* User message - right aligned - Responsive */}
                <div className="flex justify-end">
                  <div className="flex items-start gap-2 sm:gap-3 max-w-[85%] sm:max-w-[75%]">
                    <div className="glass-strong border border-blue-200/50 rounded-xl sm:rounded-2xl rounded-tr-sm px-3 sm:px-5 py-3 sm:py-4 apple-shadow-lg hover:apple-shadow-xl transition-all duration-300 group">
                      <p className="text-xs sm:text-sm leading-relaxed text-gray-800 font-medium break-words">{item.user}</p>
                    </div>
                    <div className="p-2 sm:p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full apple-shadow flex-shrink-0">
                      <FaUser size={12} className="sm:hidden text-white" />
                      <FaUser size={16} className="hidden sm:block text-white" />
                    </div>
                  </div>
                </div>
                
                {/* Bot message - left aligned - Responsive */}
                <div className="flex justify-start">
                  <div className="flex items-start gap-2 sm:gap-3 max-w-[90%] sm:max-w-[80%]">
                    <div className="p-2 sm:p-2.5 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-full apple-shadow animate-pulse-slow flex-shrink-0">
                      <FaRobot size={12} className="sm:hidden text-white" />
                      <FaRobot size={16} className="hidden sm:block text-white" />
                    </div>
                    <div className="glass-strong border-2 border-emerald-200/50 rounded-xl sm:rounded-2xl rounded-tl-sm px-3 sm:px-5 py-3 sm:py-4 apple-shadow-lg hover:apple-shadow-xl hover:border-emerald-300/50 transition-all duration-300 w-full">
                      <div className="text-gray-700 leading-relaxed text-xs sm:text-sm">
                        <FormattedAIResponse content={item.bot} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          
          {loading && (
            <div className="flex justify-start animate-fade-in">
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="p-2 sm:p-2.5 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-full apple-shadow animate-bounce flex-shrink-0">
                  <FaRobot size={12} className="sm:hidden text-white" />
                  <FaRobot size={16} className="hidden sm:block text-white" />
                </div>
                <div className="glass-strong border-2 border-emerald-200/50 rounded-xl sm:rounded-2xl rounded-tl-sm px-3 sm:px-5 py-3 sm:py-4 apple-shadow-lg">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Loader />
                    <span className="text-gray-600 text-xs sm:text-sm font-semibold">AI is thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>
        
        {/* Enhanced Input Area - Responsive */}
        <div className="glass-strong rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-emerald-100/50 apple-shadow-xl space-y-2 sm:space-y-3">
          {error && (
            <div className="p-3 sm:p-4 glass border-2 border-red-300 rounded-xl text-red-700 animate-shake apple-shadow-lg bg-red-50/50 font-semibold text-xs sm:text-sm">
              {error}
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !loading && input.trim() && handleSend()}
              placeholder="Type your message..."
              className="flex-1 px-4 sm:px-5 py-3 sm:py-4 rounded-xl border-2 border-emerald-100 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all bg-white/90 placeholder-gray-400 text-gray-900 font-medium apple-shadow text-sm sm:text-base"
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white rounded-xl font-bold text-base sm:text-lg apple-shadow-lg hover:apple-shadow-xl transform hover:scale-105 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
              <span className="relative z-10">{loading ? 'Sending...' : 'Send'}</span>
            </button>
          </div>
          
          {/* Quick actions - Responsive */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-1 sm:pt-2">
            <button
              onClick={() => setInput('Create an Instagram post about ')}
              className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-lg hover:from-purple-200 hover:to-pink-200 transition-all duration-200 whitespace-nowrap apple-shadow"
              disabled={loading}
            >
              📸 Instagram Post
            </button>
            <button
              onClick={() => setInput('Generate hashtags for ')}
              className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-700 rounded-lg hover:from-cyan-200 hover:to-blue-200 transition-all duration-200 whitespace-nowrap apple-shadow"
              disabled={loading}
            >
              # Hashtags
            </button>
            <button
              onClick={() => setInput('Summarize this: ')}
              className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 rounded-lg hover:from-emerald-200 hover:to-teal-200 transition-all duration-200 whitespace-nowrap apple-shadow"
              disabled={loading}
            >
              📝 Summarize
            </button>
            <button
              onClick={() => setInput('Give me content ideas about ')}
              className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 rounded-lg hover:from-amber-200 hover:to-yellow-200 transition-all duration-200 whitespace-nowrap apple-shadow"
              disabled={loading}
            >
              💡 Ideas
            </button>
            <button
              onClick={() => setInput('Refine this text: ')}
              className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 rounded-lg hover:from-violet-200 hover:to-purple-200 transition-all duration-200 whitespace-nowrap apple-shadow"
              disabled={loading}
            >
              ✨ Refine
            </button>
            <button
              onClick={() => setInput('Generate blog titles about ')}
              className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-rose-100 to-red-100 text-rose-700 rounded-lg hover:from-rose-200 hover:to-red-200 transition-all duration-200 whitespace-nowrap apple-shadow"
              disabled={loading}
            >
              � Blog Titles
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Chatbot; 