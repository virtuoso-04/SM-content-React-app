import React, { useState, useEffect, useCallback } from 'react';
import { apiCall } from '../services/realApi';
import { FaImage, FaExternalLinkAlt, FaTrash } from 'react-icons/fa';

const STORAGE_KEY = 'image_generator_history';

const ImageGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setImages(JSON.parse(saved));
      } catch (storageError) {
        console.warn('Failed to parse image history', storageError);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(images));
    } catch (storageError) {
      console.warn('Failed to persist image history', storageError);
    }
  }, [images]);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      setError('Please describe the image you want to create.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await apiCall('image-generator', prompt.trim());
      const newEntry = {
        prompt: prompt.trim(),
        url: response.output,
        model: response.model_used,
        provider: response.provider,
        createdAt: new Date().toISOString()
      };
      setImages(prev => [newEntry, ...prev].slice(0, 12));
      setPrompt('');
    } catch (err) {
      setError(err.message || 'Unable to generate image right now.');
    } finally {
      setLoading(false);
    }
  }, [prompt]);

  const clearHistory = useCallback(() => {
    setImages([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-amber-400 text-white apple-shadow-lg">
            <FaImage size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 bg-clip-text text-transparent">
              Image Generator
            </h2>
            <p className="text-gray-600 font-semibold">Powered by free multimodel routing (Pollinations / Picsum)</p>
          </div>
        </div>
        {images.length > 0 && (
          <button
            onClick={clearHistory}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-gray-700 to-gray-800 text-white font-bold apple-shadow hover:apple-shadow-lg transition-all text-sm"
          >
            Clear History
          </button>
        )}
      </div>

      <div className="glass-strong rounded-2xl p-6 border border-purple-200/60 apple-shadow-xl space-y-4">
        {error && (
          <div className="p-3 glass-subtle border border-red-200 rounded-xl text-red-700 text-sm font-semibold">
            {error}
          </div>
        )}
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Example: Hyper-realistic product shot of a smart water bottle on a marble table, volumetric lighting"
          className="w-full min-h-[120px] rounded-2xl border-2 border-purple-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/30 px-4 py-3 text-gray-800 font-medium bg-white/80"
          disabled={loading}
        />
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full md:w-auto px-8 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-500 to-amber-400 text-white font-bold text-lg apple-shadow-lg hover:apple-shadow-2xl transform hover:scale-105 active:scale-95 transition-all disabled:opacity-60"
        >
          {loading ? 'Generating...' : 'Generate Image'}
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">Recent Creations</h3>
          <p className="text-sm text-gray-500 font-semibold">Newest first · stored locally</p>
        </div>
        {images.length === 0 ? (
          <div className="glass-subtle rounded-2xl p-8 text-center border border-dashed border-purple-200">
            <p className="text-gray-600 font-medium">You haven't generated any images yet. Describe a scene to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((image, index) => (
              <div key={`${image.createdAt}-${index}`} className="glass-strong rounded-2xl border border-purple-100/60 apple-shadow-lg overflow-hidden flex flex-col">
                <div className="relative h-64 bg-gray-50">
                  <img
                    src={image.url}
                    alt={image.prompt}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-4 space-y-3 flex-1 flex flex-col">
                  <p className="text-sm text-gray-700 font-semibold">{image.prompt}</p>
                  <div className="text-xs text-gray-500 font-semibold">
                    {image.provider ? `Provider: ${image.provider}` : 'Provider: Pollinations'}
                  </div>
                  <div className="mt-auto flex items-center justify-between">
                    <a
                      href={image.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-sm font-bold text-purple-600 hover:text-purple-800"
                    >
                      <FaExternalLinkAlt size={12} /> Open
                    </a>
                    <button
                      onClick={() => setImages(prev => prev.filter((_, idx) => idx !== index))}
                      className="text-sm text-gray-500 hover:text-red-500 flex items-center gap-1"
                      aria-label="Remove image from history"
                    >
                      <FaTrash size={12} /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGenerator;
