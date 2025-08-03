import React, { useState, useEffect } from 'react';
import { apiCall } from '../services/realApi';
import Loader from './Loader';
import FormattedAIResponse from './FormattedAIResponse';
import { FaLightbulb } from 'react-icons/fa';

const STORAGE_KEY = 'idea_generator_history';

const IdeaGenerator = () => {
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
        console.error('Error parsing idea generator history:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const handleGenerate = async () => {
    setError('');
    setOutput('');
    if (!input.trim()) {
      setError('Please enter a topic or prompt.');
      return;
    }
    setLoading(true);
    try {
      const res = await apiCall('idea-generator', input.trim());
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
      console.error('Idea generator error:', e);
      setError(e.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg">
          <FaLightbulb size={32} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Idea Generator</h2>
          <p className="text-gray-600">Spark creativity with AI-powered brainstorming</p>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col gap-6">
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700 mb-2 block">Topic or Prompt</span>
            <textarea
              className="w-full h-32 rounded-lg border border-gray-300 p-4 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all resize-none bg-gray-50 text-gray-900"
              placeholder="Enter your topic (e.g., 'blog post about sustainable living', 'social media captions for a coffee shop')"
              value={input}
              onChange={e => setInput(e.target.value)}
            />
          </label>
          
          <button
            onClick={handleGenerate}
            disabled={loading || !input.trim()}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-300 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader />
                <span>Generating Ideas...</span>
              </div>
            ) : (
              'Generate Ideas'
            )}
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {output && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg animate-fade-in">
            <h3 className="font-semibold text-gray-800 mb-2">Generated Ideas:</h3>
            <div className="text-gray-700">
              <FormattedAIResponse content={output} />
            </div>
          </div>
        )}

        {history.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-800">Previous Ideas</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {history.map((item, idx) => (
                <div key={idx} className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="text-xs text-gray-500 mb-2">{item.date}</div>
                  <div className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Topic:</span> {item.input}
                  </div>
                  <div className="text-sm text-gray-800">
                    <span className="font-medium">Ideas:</span> {item.output}
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

export default IdeaGenerator; 