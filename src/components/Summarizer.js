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
    <div className="flex h-full flex-col text-slate-100">
      <div className="mb-6 flex items-center gap-4">
        <div className="rounded-2xl border border-white/20 bg-gradient-to-br from-sky-500/50 to-indigo-500/40 p-3 text-white shadow-[0_20px_60px_rgba(15,118,230,0.35)]">
          <MdSummarize size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-white">Text Summarizer</h2>
          <p className="text-sm text-slate-300">Transform long content into concise, clear summaries</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-6">
        <div className="glass-panel border-white/10 bg-white/5 p-5">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold uppercase tracking-[0.3em] text-slate-300">Input Text</span>
            <textarea
              className="glass-input w-full resize-none border-white/15 bg-white/5 p-4 text-base text-white"
              placeholder="Paste or type your long text here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={6}
            />
          </label>

          <button
            onClick={handleGenerate}
            disabled={loading || !input.trim()}
            className="mt-4 w-full rounded-2xl border border-transparent bg-gradient-to-r from-[#A6FFCB] via-[#12D8FA] to-[#1FA2FF] px-6 py-3 font-semibold text-slate-900 shadow-[0_25px_80px_rgba(15,118,230,0.35)] transition hover:translate-y-[-1px] disabled:opacity-40"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader />
                <span>Generating Summary...</span>
              </div>
            ) : (
              'Generate Summary'
            )}
          </button>
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-400/40 bg-rose-500/10 p-4 text-sm text-rose-100">
            {error}
          </div>
        )}

        {output && (
          <div className="glass-panel border-white/10 bg-white/5 p-5 animate-fade-in">
            <h3 className="mb-2 font-semibold text-white">Summary:</h3>
            <div className="text-slate-200">
              <FormattedAIResponse content={output} />
            </div>
          </div>
        )}

        {history.length > 0 && (
          <div className="glass-panel border-white/10 bg-white/5 p-5">
            <h3 className="mb-3 font-semibold text-white">Previous Summaries</h3>
            <div className="max-h-60 space-y-3 overflow-y-auto pr-1">
              {history.map((item, idx) => (
                <div key={idx} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="mb-2 text-xs text-slate-400">{item.date}</div>
                  <div className="mb-2 text-sm text-slate-300">
                    <span className="font-semibold text-white">Input:</span> {item.input.slice(0, 100)}...
                  </div>
                  <div className="text-sm text-slate-100">
                    <span className="font-semibold text-white">Summary:</span> {item.output}
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