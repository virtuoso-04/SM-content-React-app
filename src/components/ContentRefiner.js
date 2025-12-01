import React, { useState, useEffect } from 'react';
import { apiCall } from '../services/realApi';
import Loader from './Loader';
import FormattedAIResponse from './FormattedAIResponse';
import { FaEdit } from 'react-icons/fa';

const STORAGE_KEY = 'content_refiner_history';

const ContentRefiner = () => {
  const [input, setInput] = useState('');
  const [instruction, setInstruction] = useState('');
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
        console.error('Error parsing content refiner history:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const handleGenerate = async () => {
    setError('');
    setOutput('');
    if (!input.trim()) {
      setError('Please enter content to refine.');
      return;
    }
    setLoading(true);
    try {
      const res = await apiCall('content-refiner', { text: input.trim(), instruction: instruction.trim() });
      setOutput(res.output);
      const newEntry = { 
        input: input.trim(), 
        instruction: instruction.trim(), 
        output: res.output, 
        date: new Date().toLocaleString() 
      };
      const newHistory = [newEntry, ...history].slice(0, 10);
      setHistory(newHistory);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
      } catch (storageError) {
        console.warn('Failed to save history to localStorage:', storageError);
      }
    } catch (e) {
      console.error('Content refiner error:', e);
      setError(e.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col text-slate-100">
      <div className="mb-6 flex items-center gap-4">
        <div className="rounded-2xl border border-white/20 bg-gradient-to-br from-fuchsia-500/60 to-violet-500/60 p-3 text-white shadow-[0_20px_60px_rgba(217,70,239,0.35)]">
          <FaEdit size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-white">Content Refiner</h2>
          <p className="text-sm text-slate-300">Polish your content for clarity, style, and impact</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-6">
        <div className="glass-panel border-white/10 bg-white/5 p-5">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold uppercase tracking-[0.3em] text-slate-300">Content to Refine</span>
            <textarea
              className="glass-input w-full resize-none border-white/15 bg-white/5 p-4 text-base text-white"
              placeholder="Paste or type your content here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={5}
            />
          </label>

          <label className="mt-4 block">
            <span className="mb-2 block text-sm font-semibold uppercase tracking-[0.3em] text-slate-300">Refinement Instruction (Optional)</span>
            <input
              className="glass-input w-full border-white/15 bg-white/5 p-4 text-base text-white"
              placeholder="e.g., 'make it more formal', 'improve grammar', 'change tone to enthusiastic'"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
            />
          </label>

          <button
            onClick={handleGenerate}
            disabled={loading || !input.trim()}
            className="mt-4 w-full rounded-2xl border border-transparent bg-gradient-to-r from-[#F9D423] via-[#FF4E50] to-[#F9D423] px-6 py-3 font-semibold text-slate-900 shadow-[0_25px_80px_rgba(255,78,80,0.35)] transition hover:translate-y-[-1px] disabled:opacity-40"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader />
                <span>Refining Content...</span>
              </div>
            ) : (
              'Refine Content'
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
            <h3 className="mb-2 font-semibold text-white">Refined Content:</h3>
            <div className="text-slate-200">
              <FormattedAIResponse content={output} />
            </div>
          </div>
        )}

        {history.length > 0 && (
          <div className="glass-panel border-white/10 bg-white/5 p-5">
            <h3 className="mb-3 font-semibold text-white">Previous Refinements</h3>
            <div className="max-h-60 space-y-3 overflow-y-auto pr-1">
              {history.map((item, idx) => (
                <div key={idx} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="mb-2 text-xs text-slate-400">{item.date}</div>
                  <div className="mb-1 text-sm text-slate-300">
                    <span className="font-semibold text-white">Input:</span> {item.input.slice(0, 100)}...
                  </div>
                  {item.instruction && (
                    <div className="mb-1 text-sm text-slate-300">
                      <span className="font-semibold text-white">Instruction:</span> {item.instruction}
                    </div>
                  )}
                  <div className="text-sm text-slate-100">
                    <span className="font-semibold text-white">Refined:</span> {item.output}
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

export default ContentRefiner;