import React, { useState, useEffect } from 'react';
import { apiCall } from '../services/realApi';
import Loader from './Loader';
import FormattedAIResponse from './FormattedAIResponse';
import { MdSummarize } from 'react-icons/md';

const STORAGE_KEY = 'summarizer_history';

const Summarizer = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (error) {
        console.error('Error parsing summarizer history:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const handleGenerate = async () => {
    setError('');
    setOutput('');
    if (!input.trim()) {
      setError('Please enter text to summarize.');
      return;
    }
    setLoading(true);
    try {
      const res = await apiCall('summarizer', input.trim());
      setOutput(res.output);
      const newEntry = { input: input.trim(), output: res.output, date: new Date().toLocaleString() };
      const newHistory = [newEntry, ...history].slice(0, 10);
      setHistory(newHistory);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
      } catch (storageError) {
        console.warn('Failed to save history to localStorage:', storageError);
      }
    } catch (e) {
      console.error('Summarizer error:', e);
      setError(e.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 animate-fade-in">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 text-white apple-shadow-lg group hover:scale-110 transition-transform duration-300">
          <MdSummarize size={36} className="group-hover:rotate-12 transition-transform duration-300" />
        </div>
        <div>
          <h2 className="text-4xl font-extrabold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">Text Summarizer</h2>
          <p className="text-gray-600 font-semibold mt-1.5 text-lg">Transform long content into concise, clear summaries</p>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col gap-6">
        {/* Input Section */}
        <div className="glass rounded-2xl p-6 space-y-5 animate-slide-in apple-shadow-lg border border-emerald-100/50 hover:apple-shadow-xl transition-shadow duration-300">
          <label className="block">
            <span className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Input Text
            </span>
            <textarea
              className="w-full h-40 rounded-xl border-2 border-emerald-100 p-4 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all resize-none bg-white/90 text-gray-900 placeholder-gray-400 font-medium apple-shadow"
              placeholder="Paste or type your long text here..."
              value={input}
              onChange={e => setInput(e.target.value)}
            />
          </label>
          
          <button
            onClick={handleGenerate}
            disabled={loading || !input.trim()}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white font-bold text-lg apple-shadow-lg hover:apple-shadow-xl transform hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed group relative overflow-hidden"
          >
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
            
            {loading ? (
              <div className="flex items-center justify-center gap-2 relative z-10">
                <Loader />
                <span>Generating Summary...</span>
              </div>
            ) : (
              <span className="relative z-10">Generate Summary</span>
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 glass border-2 border-red-300 rounded-xl text-red-700 animate-shake apple-shadow-lg bg-red-50/50 font-semibold">
            {error}
          </div>
        )}

        {/* Output */}
        {output && (
          <div className="p-6 glass-strong rounded-2xl border-2 border-emerald-200/50 animate-fade-in apple-shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"></div>
              <h3 className="font-extrabold text-gray-900 text-xl">Summary:</h3>
            </div>
            <div className="text-gray-700 leading-relaxed">
              <FormattedAIResponse content={output} />
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"></div>
              <h3 className="font-extrabold text-gray-900 text-xl">Previous Summaries</h3>
            </div>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {history.map((item, idx) => (
                <div key={idx} className="p-5 glass rounded-xl border border-emerald-100/50 card-hover apple-shadow hover:border-emerald-200 transition-all duration-300">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-xs text-gray-500 font-semibold">{item.date}</div>
                  </div>
                  <div className="text-sm text-gray-600 mb-3 bg-emerald-50/50 p-3 rounded-lg">
                    <span className="font-bold text-emerald-700">Input:</span> {item.input.slice(0, 100)}...
                  </div>
                  <div className="text-sm text-gray-800">
                    <div className="font-bold mb-2 text-gray-900">Summary:</div>
                    <FormattedAIResponse content={item.output} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Summarizer; 