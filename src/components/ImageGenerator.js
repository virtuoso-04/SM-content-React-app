import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaImage, FaDownload, FaHistory, FaMagic } from 'react-icons/fa';
import Loader from './Loader';
import { apiCall } from '../services/realApi';

const stylePresets = [
  { label: 'Cinematic Realism', value: 'cinematic lighting, ultra realistic, 8k detail' },
  { label: 'Digital Art', value: 'digital art, vibrant colors, sharp lines' },
  { label: 'Watercolor', value: 'watercolor painting, soft gradients, textured paper' },
  { label: 'Retro Futurism', value: 'retro futurism, neon lights, synthwave palette' },
  { label: 'Minimalist', value: 'minimalist, clean shapes, negative space' },
  { label: 'Game Concept', value: 'concept art, game ready, atmospheric lighting' },
];

const aspectRatioOptions = [
  { label: 'Square', value: 'square', size: '1024 x 1024' },
  { label: 'Portrait', value: 'portrait', size: '832 x 1216' },
  { label: 'Landscape', value: 'landscape', size: '1216 x 832' },
];

const samplePrompts = [
  'Futuristic botanist tending bioluminescent plants inside a glass dome greenhouse on Mars',
  'Artisan coffee shop interior with Scandinavian design, morning sunlight, cozy ambience',
  'Mythical phoenix emerging from ocean waves, dramatic lighting, cinematic energy',
];

const ImageGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState(stylePresets[0].value);
  const [customStyle, setCustomStyle] = useState('');
  const [aspectRatio, setAspectRatio] = useState('square');
  const [provider, setProvider] = useState('pollinations'); // New: image provider selection
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  const activeStyle = customStyle.trim() ? customStyle : selectedStyle;
  const glassCard = 'rounded-3xl border border-white/15 bg-white/10 backdrop-blur-2xl shadow-2xl shadow-slate-900/40';
  const fadeInUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };
  const subtleScale = {
    hidden: { opacity: 0, scale: 0.96 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.45, ease: 'easeOut' } },
  };

  const handleGenerate = async () => {
    setError('');
    if (!prompt.trim()) {
      setError('Describe what you would like to see in the image.');
      return;
    }

    setLoading(true);
    try {
      const response = await apiCall('image-generator', {
        prompt: prompt.trim(),
        style: activeStyle,
        aspectRatio,
        provider,
      });

      const imageEntry = {
        prompt: prompt.trim(),
        style: activeStyle,
        aspectRatio,
        provider: response.provider,
        imageUrl: response.image_url,
        createdAt: new Date().toISOString(),
      };

      setResult(imageEntry);
      setHistory((prev) => [imageEntry, ...prev].slice(0, 8));
    } catch (err) {
      setError(err.message || 'Unable to generate image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSample = (text) => {
    setPrompt(text);
  };

  const copyImageUrl = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
    } catch (err) {
      console.warn('Failed to copy image url', err);
    }
  };

  return (
    <div className="flex h-full flex-col gap-8 rounded-[32px] border border-white/5 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.35),_transparent_38%),_#020617] p-6 text-slate-100 shadow-[0_30px_120px_rgba(2,6,23,0.65)]">
      <motion.div
        className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-3xl bg-white/10 border border-white/20 text-cyan-200 shadow-2xl shadow-cyan-500/40">
            <FaImage size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white">🎨 Vision Crafter</h2>
            <p className="text-slate-300">Turn storytelling prompts into production-ready visuals</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-300">
          <FaHistory />
          <span>{history.length} saved ideas</span>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <motion.div className={`${glassCard} p-6`} initial="hidden" animate="visible" variants={subtleScale}>
            <label className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">Describe your scene</label>
            <textarea
              className="mt-3 min-h-[150px] w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-base text-white placeholder:text-slate-400 focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/30"
              placeholder="E.g. Cozy reading nook with warm lighting, mid-century furniture, window overlooking rainy city"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              maxLength={400}
            />

            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Quick inspiration</p>
              <div className="flex flex-wrap gap-2">
                {samplePrompts.map((sample) => (
                  <motion.button
                    key={sample}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSample(sample)}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200 transition hover:border-cyan-300/40 hover:text-white"
                  >
                    {sample.split(' ').slice(0, 5).join(' ')}...
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2">
            <motion.div className={`${glassCard} p-6`} initial="hidden" animate="visible" variants={subtleScale}>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-300">Visual styling</p>
              <div className="mt-4 grid gap-3">
                {stylePresets.map((preset) => (
                  <motion.button
                    key={preset.label}
                    type="button"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => {
                      setSelectedStyle(preset.value);
                      setCustomStyle('');
                    }}
                    className={`rounded-2xl border px-4 py-3 text-left transition-all duration-300 ${
                      activeStyle === preset.value && !customStyle
                        ? 'border-cyan-300/80 bg-gradient-to-r from-cyan-500/30 via-blue-500/20 to-indigo-500/20 text-white'
                        : 'border-white/10 text-slate-200 hover:border-cyan-200/40 hover:text-white'
                    }`}
                  >
                    <p className="font-semibold">{preset.label}</p>
                    <p className="text-xs text-slate-400">{preset.value}</p>
                  </motion.button>
                ))}
              </div>
              <div className="mt-4">
                <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Custom style</label>
                <input
                  type="text"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-slate-500 focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/30"
                  placeholder="e.g. Studio Ghibli watercolor, volumetric lighting"
                  value={customStyle}
                  onChange={(e) => setCustomStyle(e.target.value)}
                />
              </div>
            </motion.div>

            <motion.div className={`${glassCard} flex flex-col p-6`} initial="hidden" animate="visible" variants={subtleScale}>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-300">AI Provider</p>
              <div className="mt-4 space-y-3">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setProvider('pollinations')}
                  className={`w-full rounded-2xl border px-4 py-3 text-left transition-all duration-300 ${
                    provider === 'pollinations'
                      ? 'border-emerald-300/80 bg-gradient-to-r from-emerald-400/20 via-teal-500/10 to-cyan-500/20 text-white'
                      : 'border-white/10 text-slate-200 hover:border-emerald-200/40 hover:text-white'
                  }`}
                >
                  <p className="font-semibold">⚡ Pollinations AI</p>
                  <p className="text-xs text-slate-400">Fast renders • Creative variety • No auth required</p>
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setProvider('gemini')}
                  className={`w-full rounded-2xl border px-4 py-3 text-left transition-all duration-300 ${
                    provider === 'gemini'
                      ? 'border-indigo-300/80 bg-gradient-to-r from-indigo-400/20 via-purple-500/10 to-blue-500/20 text-white'
                      : 'border-white/10 text-slate-200 hover:border-indigo-200/40 hover:text-white'
                  }`}
                >
                  <p className="font-semibold">✨ Gemini Imagen 3</p>
                  <p className="text-xs text-slate-400">Production quality • Fine details • Realistic textures</p>
                </motion.button>
              </div>

              <p className="mt-6 text-sm font-semibold uppercase tracking-[0.3em] text-slate-300">Canvas</p>
              <div className="mt-4 space-y-3">
                {aspectRatioOptions.map((option) => (
                  <motion.button
                    key={option.value}
                    type="button"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setAspectRatio(option.value)}
                    className={`w-full rounded-2xl border px-4 py-3 text-left transition-all duration-300 ${
                      aspectRatio === option.value
                        ? 'border-teal-300/80 bg-gradient-to-r from-teal-400/20 via-cyan-500/10 to-blue-500/20 text-white'
                        : 'border-white/10 text-slate-200 hover:border-teal-200/40 hover:text-white'
                    }`}
                  >
                    <p className="font-semibold">{option.label}</p>
                    <p className="text-xs text-slate-400">{option.size}</p>
                  </motion.button>
                ))}
              </div>

              <motion.button
                type="button"
                onClick={handleGenerate}
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.01 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="mt-auto flex items-center justify-center gap-2 rounded-2xl border border-transparent bg-gradient-to-r from-[#A6FFCB] via-[#12D8FA] to-[#1FA2FF] px-6 py-3 text-base font-semibold text-slate-900 shadow-2xl shadow-cyan-500/40 transition disabled:opacity-60"
              >
                {loading ? <Loader /> : <FaMagic />}
                {loading ? `Creating with ${provider === 'gemini' ? 'Imagen 3' : 'Pollinations'}...` : 'Generate Image'}
              </motion.button>
              {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}
            </motion.div>
          </div>
        </div>

        <motion.div className={`${glassCard} p-6`} initial="hidden" animate="visible" variants={subtleScale}>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-300">Latest render</p>
          <div className="mt-4 aspect-square w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center">
            {loading && <Loader />}
            <AnimatePresence mode="wait">
              {!loading && result && (
                <motion.img
                  key={result.imageUrl}
                  src={result.imageUrl}
                  alt={result.prompt}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                />
              )}
            </AnimatePresence>
            {!loading && !result && (
              <div className="text-center text-slate-500">
                <FaImage className="mx-auto mb-3" size={36} />
                <p>Images will appear here</p>
              </div>
            )}
          </div>

          {result && (
            <motion.div className="mt-4 space-y-3 text-sm text-slate-200" initial="hidden" animate="visible" variants={fadeInUp}>
              <p className="font-semibold text-white">Prompt</p>
              <p className="rounded-2xl border border-white/10 bg-white/5 p-3 text-slate-100">{result.prompt}</p>
              <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide text-slate-300">
                <span className="rounded-full border border-cyan-200/30 bg-cyan-500/10 px-3 py-1 text-cyan-200">{aspectRatioOptions.find((opt) => opt.value === result.aspectRatio)?.label}</span>
                <span className={`rounded-full border px-3 py-1 ${
                  result.provider === 'gemini' 
                    ? 'border-indigo-300/40 bg-indigo-500/15 text-indigo-200'
                    : result.provider === 'pollinations'
                    ? 'border-emerald-300/40 bg-emerald-500/15 text-emerald-200'
                    : 'border-indigo-200/30 bg-indigo-500/10 text-indigo-200'
                }`}>
                  {result.provider === 'gemini' ? '✨ Gemini Imagen' : result.provider === 'pollinations' ? '⚡ Pollinations' : result.provider}
                </span>
              </div>
              <div className="flex gap-3">
                <a
                  href={result.imageUrl}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-2 font-semibold text-white transition hover:border-cyan-200/50"
                >
                  <FaDownload />
                  Download
                </a>
                <button
                  type="button"
                  onClick={() => copyImageUrl(result.imageUrl)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-2 font-semibold text-white transition hover:border-cyan-200/50"
                >
                  Copy URL
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {history.length > 0 && (
        <motion.div className="mt-4" initial="hidden" animate="visible" variants={fadeInUp}>
          <div className="mb-3 flex items-center gap-3 text-white">
            <FaHistory />
            <h3 className="text-lg font-semibold">Recent renders</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {history.map((item) => (
              <motion.div
                key={item.createdAt}
                className={`${glassCard} p-3`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              >
                <div className="aspect-square overflow-hidden rounded-xl border border-white/10 bg-white/5">
                  <img src={item.imageUrl} alt={item.prompt} className="h-full w-full object-cover" loading="lazy" />
                </div>
                <p className="mt-3 text-sm font-semibold text-white">{item.prompt.length > 100 ? `${item.prompt.slice(0, 100)}…` : item.prompt}</p>
                <p className="text-xs text-slate-300">{item.style.slice(0, 80)}{item.style.length > 80 ? '…' : ''}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ImageGenerator;
