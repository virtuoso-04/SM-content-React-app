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
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg">
          <FaEdit size={32} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Content Refiner</h2>
          <p className="text-gray-600">Polish your content for clarity, style, and impact</p>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col gap-6">
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700 mb-2 block">Content to Refine</span>
            <textarea
              className="w-full h-32 rounded-lg border border-gray-300 p-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none bg-gray-50 text-gray-900"
              placeholder="Paste or type your content here..."
              value={input}
              onChange={e => setInput(e.target.value)}
            />
          </label>
          
          <label className="block">
            <span className="text-sm font-medium text-gray-700 mb-2 block">Refinement Instruction (Optional)</span>
            <input
              className="w-full rounded-lg border border-gray-300 p-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-gray-50 text-gray-900"
              placeholder="e.g., 'make it more formal', 'improve grammar', 'change tone to enthusiastic'"
              value={instruction}
              onChange={e => setInstruction(e.target.value)}
            />
          </label>
          
          <button
            onClick={handleGenerate}
            disabled={loading || !input.trim()}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-300 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
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
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {output && (
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg animate-fade-in">
            <h3 className="font-semibold text-gray-800 mb-2">Refined Content:</h3>
            <div className="text-gray-700">
              <FormattedAIResponse content={output} />
            </div>
          </div>
        )}

        {history.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-800">Previous Refinements</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {history.map((item, idx) => (
                <div key={idx} className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="text-xs text-gray-500 mb-2">{item.date}</div>
                  <div className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">Input:</span> {item.input.slice(0, 100)}...
                  </div>
                  {item.instruction && (
                    <div className="text-sm text-gray-500 mb-1">
                      <span className="font-medium">Instruction:</span> {item.instruction}
                    </div>
                  )}
                  <div className="text-sm text-gray-800">
                    <span className="font-medium">Refined:</span> {item.output}
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