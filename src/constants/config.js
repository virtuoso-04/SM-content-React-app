/**
 * API Configuration Constants
 */

// API Base URL
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// API Endpoints
export const API_ENDPOINTS = {
  HEALTH: '/health',
  SUMMARIZE: '/api/summarize',
  GENERATE_IDEAS: '/api/generate-ideas',
  REFINE_CONTENT: '/api/refine-content',
  CHAT: '/api/chat',
  GENERATE_IMAGE: '/api/generate-image',
  GAMEDEV: {
    STORY: '/api/gamedev/story',
    DIALOGUE: '/api/gamedev/dialogue',
    MECHANICS: '/api/gamedev/mechanics',
    CODE: '/api/gamedev/code',
    EXPLAIN: '/api/gamedev/explain',
  },
};

// Image Generation Settings
export const IMAGE_QUALITY_TIERS = {
  FAST: {
    value: 'fast',
    label: '⚡ Fast',
    description: 'Instant generation with Pollinations AI',
    color: 'emerald',
  },
  BALANCED: {
    value: 'balanced',
    label: '🎯 Balanced',
    description: 'Good quality with fast results',
    color: 'cyan',
  },
  HIGH: {
    value: 'high',
    label: '✨ High',
    description: 'Detailed images with Gemini',
    color: 'indigo',
  },
  ULTRA: {
    value: 'ultra',
    label: '💎 Ultra',
    description: 'Premium quality with Grok',
    color: 'purple',
  },
};

export const IMAGE_PROVIDERS = {
  POLLINATIONS: 'pollinations',
  GEMINI: 'gemini',
  GROK: 'grok',
  FAL: 'fal',
};

export const ASPECT_RATIOS = [
  { value: 'square', label: 'Square (1:1)', dimensions: '1024×1024' },
  { value: 'landscape', label: 'Landscape (3:2)', dimensions: '1216×832' },
  { value: 'portrait', label: 'Portrait (2:3)', dimensions: '832×1216' },
];

// Chatbot Settings
export const CHAT_TONES = [
  { value: 'friendly', label: 'Friendly', emoji: '😊' },
  { value: 'professional', label: 'Professional', emoji: '💼' },
  { value: 'playful', label: 'Playful', emoji: '🎉' },
  { value: 'expert', label: 'Expert', emoji: '🎓' },
];

export const CREATIVITY_LEVELS = [
  { value: 0.3, label: 'Focused', description: 'Precise and consistent' },
  { value: 0.5, label: 'Balanced', description: 'Mix of accuracy and creativity' },
  { value: 0.7, label: 'Creative', description: 'Diverse and innovative' },
  { value: 0.9, label: 'Experimental', description: 'Highly creative and varied' },
];

// UI Constants
export const ANIMATION_DURATIONS = {
  FAST: 0.2,
  NORMAL: 0.3,
  SLOW: 0.5,
};

export const TOAST_DURATION = 5000;

export const MAX_INPUT_LENGTHS = {
  TEXT: 10000,
  TOPIC: 500,
  INSTRUCTION: 500,
  MESSAGE: 2000,
  PROMPT: 1000,
  STYLE: 500,
  GAMEDEV_PROMPT: 2000,
};
