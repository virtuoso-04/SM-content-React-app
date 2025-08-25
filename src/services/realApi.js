// Real API service for Smart Content Studio AI tools
// This service connects to the FastAPI backend

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Helper function to make API requests
const makeApiRequest = async (endpoint, data) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      // Handle different HTTP error status codes
      if (response.status === 400) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Invalid request data');
      } else if (response.status === 500) {
        throw new Error('AI service is temporarily unavailable. Please try again.');
      } else if (response.status === 504) {
        throw new Error('Request timeout. The AI service is taking too long to respond.');
      } else {
        throw new Error(`Service error: ${response.status}`);
      }
    }

    const result = await response.json();
    return result;
    
  } catch (error) {
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Unable to connect to AI service. Please check your connection.');
    }
    // Re-throw other errors
    throw error;
  }
};

// Main API function that replaces mockApiCall
export const apiCall = async (tool, input) => {
  try {
    let endpoint;
    let requestData;

    // Map frontend tool names to backend endpoints and format data
    switch (tool) {
      case 'summarizer':
        if (!input || typeof input !== 'string' || input.trim().length === 0) {
          throw new Error('Please provide text to summarize');
        }
        endpoint = '/api/summarize';
        requestData = { text: input.trim() };
        break;
        
      case 'idea-generator':
        if (!input || typeof input !== 'string' || input.trim().length === 0) {
          throw new Error('Please provide a topic or prompt');
        }
        endpoint = '/api/generate-ideas';
        requestData = { topic: input.trim() };
        break;
        
      case 'content-refiner':
        const { text, instruction } = typeof input === 'object' ? input : { text: input, instruction: '' };
        
        if (!text || typeof text !== 'string' || text.trim().length === 0) {
          throw new Error('Please provide content to refine');
        }
        
        endpoint = '/api/refine-content';
        requestData = { 
          text: text.trim(), 
          instruction: instruction ? instruction.trim() : '' 
        };
        break;
        
      case 'chatbot':
        if (!input || typeof input !== 'string' || input.trim().length === 0) {
          throw new Error('Please enter a message');
        }
        endpoint = '/api/chat';
        requestData = { message: input.trim() };
        break;
        
      // Handle GameForge requests - format: gamedev/endpoint
      case 'gamedev/story':
      case 'gamedev/dialogue':
      case 'gamedev/mechanics':
      case 'gamedev/code':
      case 'gamedev/explain':
        if (!input || typeof input !== 'string' || input.trim().length === 0) {
          throw new Error('Please enter a prompt');
        }
        endpoint = `/api/${tool}`;
        requestData = { prompt: input.trim() };
        break;
        
      default:
        throw new Error('Unknown tool specified');
    }

    // Make the API request
    const response = await makeApiRequest(endpoint, requestData);
    return response;
    
  } catch (error) {
    // Log error for debugging (remove in production)
    console.error(`API call failed for ${tool}:`, error);
    throw error;
  }
};

// Keep the old mockApiCall for backward compatibility or fallback
export const mockApiCall = async (tool, input) => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Simulate random failures occasionally for testing error handling
  if (Math.random() < 0.05) {
    throw new Error('Network error: Please try again');
  }

  // Simulate different responses based on tool
  switch (tool) {
    case 'summarizer':
      if (!input || typeof input !== 'string' || input.trim().length === 0) {
        throw new Error('Please provide text to summarize');
      }
      return { 
        output: `This is a concise summary of your content: The main points include key concepts and important details that capture the essence of the original text while maintaining clarity and brevity. The summary highlights the most significant information in a structured and easily digestible format.` 
      };
      
    case 'idea-generator':
      if (!input || typeof input !== 'string' || input.trim().length === 0) {
        throw new Error('Please provide a topic or prompt');
      }
      const ideas = [
        `Creative approach: ${input} with interactive elements`,
        `Professional angle: ${input} focusing on industry best practices`,
        `Educational perspective: ${input} as a learning resource`,
        `Innovative twist: ${input} using modern technology`,
        `Community-driven: ${input} with user-generated content`
      ];
      return { 
        output: ideas.join('\n• ')
      };
      
    case 'content-refiner': {
      const { text, instruction } = typeof input === 'object' ? input : { text: input, instruction: '' };
      
      if (!text || typeof text !== 'string' || text.trim().length === 0) {
        throw new Error('Please provide content to refine');
      }
      
      let refined = text.replace(/\s+/g, ' ').trim();
      
      if (instruction && instruction.trim()) {
        if (instruction.toLowerCase().includes('formal')) {
          refined = `This refined content adopts a professional tone: ${refined}. The language has been elevated to maintain appropriate formality while preserving the original meaning.`;
        } else if (instruction.toLowerCase().includes('grammar')) {
          refined = `Grammar-corrected version: ${refined}. All grammatical errors have been addressed while maintaining the original voice and style.`;
        } else if (instruction.toLowerCase().includes('enthusiastic')) {
          refined = `Exciting and engaging version: ${refined}! This content now radiates enthusiasm and energy while delivering the same core message.`;
        } else {
          refined = `Enhanced content based on your instruction "${instruction}": ${refined}`;
        }
      } else {
        refined = `Polished version: ${refined}. The content has been refined for better clarity, flow, and readability.`;
      }
      
      return { output: refined };
    }
    
    case 'chatbot': {
      if (!input || typeof input !== 'string' || input.trim().length === 0) {
        throw new Error('Please enter a message');
      }
      
      const responses = [
        `That's a great question about "${input}"! As an AI assistant, I find this topic quite interesting. What specific aspects would you like to explore further?`,
        `I understand you're asking about "${input}". This is definitely worth discussing! Here's my perspective: it's a multifaceted topic with many interesting angles to consider.`,
        `Thank you for sharing "${input}" with me! I'm here to help you explore this further. Could you tell me what particular aspect interests you most?`,
        `Your message about "${input}" is thought-provoking! I'd love to continue this conversation. What would you like to know more about?`,
        `Interesting point about "${input}"! As we chat, I'm learning more about your perspective. What other questions do you have?`
      ];
      return { output: responses[Math.floor(Math.random() * responses.length)] };
    }
    
    default:
      throw new Error('Unknown tool specified');
  }
};

// Health check function to test backend connectivity
export const checkBackendHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (response.ok) {
      const data = await response.json();
      return { healthy: true, data };
    }
    return { healthy: false, error: `HTTP ${response.status}` };
  } catch (error) {
    return { healthy: false, error: error.message };
  }
};

// Export the real API call as the default
export default apiCall;
