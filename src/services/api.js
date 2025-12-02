/**
 * Enhanced API Service with better organization
 */
import { apiRequest, APIError } from '../utils/api';
import { API_ENDPOINTS } from '../constants/config';

/**
 * Text Generation Services
 */
export const summarizeText = async (text) => {
  return apiRequest(API_ENDPOINTS.SUMMARIZE, {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
};

export const generateIdeas = async (topic) => {
  return apiRequest(API_ENDPOINTS.GENERATE_IDEAS, {
    method: 'POST',
    body: JSON.stringify({ topic }),
  });
};

export const refineContent = async (text, instruction = '') => {
  return apiRequest(API_ENDPOINTS.REFINE_CONTENT, {
    method: 'POST',
    body: JSON.stringify({ text, instruction }),
  });
};

export const chatWithAI = async (message, tone = 'friendly', creativity = 0.7) => {
  return apiRequest(API_ENDPOINTS.CHAT, {
    method: 'POST',
    body: JSON.stringify({ message, tone, creativity }),
  });
};

/**
 * Image Generation Service
 */
export const generateImage = async ({
  prompt,
  style = '',
  aspectRatio = 'square',
  provider = null,
  quality = 'balanced',
}) => {
  return apiRequest(API_ENDPOINTS.GENERATE_IMAGE, {
    method: 'POST',
    body: JSON.stringify({
      prompt,
      style,
      aspect_ratio: aspectRatio,
      provider,
      quality,
    }),
  });
};

/**
 * Game Development Services
 */
export const gameDevStory = async (prompt) => {
  return apiRequest(API_ENDPOINTS.GAMEDEV.STORY, {
    method: 'POST',
    body: JSON.stringify({ prompt }),
  });
};

export const gameDevDialogue = async (prompt) => {
  return apiRequest(API_ENDPOINTS.GAMEDEV.DIALOGUE, {
    method: 'POST',
    body: JSON.stringify({ prompt }),
  });
};

export const gameDevMechanics = async (prompt) => {
  return apiRequest(API_ENDPOINTS.GAMEDEV.MECHANICS, {
    method: 'POST',
    body: JSON.stringify({ prompt }),
  });
};

export const gameDevCode = async (prompt) => {
  return apiRequest(API_ENDPOINTS.GAMEDEV.CODE, {
    method: 'POST',
    body: JSON.stringify({ prompt }),
  });
};

export const gameDevExplain = async (prompt) => {
  return apiRequest(API_ENDPOINTS.GAMEDEV.EXPLAIN, {
    method: 'POST',
    body: JSON.stringify({ prompt }),
  });
};

/**
 * Health Check
 */
export const checkHealth = async () => {
  try {
    const data = await apiRequest(API_ENDPOINTS.HEALTH);
    return { healthy: true, data };
  } catch (error) {
    return { 
      healthy: false, 
      error: error instanceof APIError ? error.message : 'Service unavailable' 
    };
  }
};

/**
 * Legacy compatibility wrapper
 */
export const apiCall = async (tool, input) => {
  try {
    switch (tool) {
      case 'summarizer':
        return await summarizeText(input);
      
      case 'idea-generator':
        return await generateIdeas(input);
      
      case 'content-refiner': {
        const { text, instruction } = typeof input === 'object' 
          ? input 
          : { text: input, instruction: '' };
        return await refineContent(text, instruction);
      }
      
      case 'chatbot': {
        const params = typeof input === 'object'
          ? input
          : { message: input };
        return await chatWithAI(
          params.message,
          params.tone,
          params.creativity
        );
      }
      
      case 'image-generator': {
        const params = typeof input === 'object'
          ? input
          : { prompt: input };
        return await generateImage(params);
      }
      
      case 'gamedev/story':
        return await gameDevStory(input);
      
      case 'gamedev/dialogue':
        return await gameDevDialogue(input);
      
      case 'gamedev/mechanics':
        return await gameDevMechanics(input);
      
      case 'gamedev/code':
        return await gameDevCode(input);
      
      case 'gamedev/explain':
        return await gameDevExplain(input);
      
      default:
        throw new Error(`Unknown tool: ${tool}`);
    }
  } catch (error) {
    console.error(`API call failed for ${tool}:`, error);
    throw error;
  }
};

export default apiCall;
