/**
 * API Utilities - Enhanced error handling and response processing
 */

import { API_BASE_URL } from '../constants/config';

/**
 * Custom API Error class
 */
export class APIError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Make API request with enhanced error handling
 */
export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, { ...defaultOptions, ...options });
    
    // Parse response
    const data = await response.json().catch(() => ({}));

    // Handle errors
    if (!response.ok) {
      throw new APIError(
        data.detail || data.message || `Request failed with status ${response.status}`,
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    // Re-throw API errors
    if (error instanceof APIError) {
      throw error;
    }

    // Handle network errors
    if (error.name === 'TypeError' || error.message.includes('fetch')) {
      throw new APIError(
        'Network error. Please check your connection and try again.',
        0,
        { originalError: error.message }
      );
    }

    // Handle other errors
    throw new APIError(
      error.message || 'An unexpected error occurred',
      500,
      { originalError: error }
    );
  }
}

/**
 * Validate input before sending to API
 */
export function validateInput(value, maxLength, fieldName = 'Input') {
  if (!value || typeof value !== 'string') {
    throw new Error(`${fieldName} must be a non-empty string`);
  }

  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`${fieldName} cannot be empty`);
  }

  if (trimmed.length > maxLength) {
    throw new Error(`${fieldName} must be ${maxLength} characters or less`);
  }

  return trimmed;
}

/**
 * Format error message for display
 */
export function formatErrorMessage(error) {
  if (error instanceof APIError) {
    // Rate limit errors
    if (error.status === 429) {
      return '⏰ Rate limit exceeded. Please wait a moment and try again.';
    }
    
    // Authentication errors
    if (error.status === 401 || error.status === 403) {
      return '🔒 Authentication required. Please sign in and try again.';
    }
    
    // Server errors
    if (error.status >= 500) {
      return '🔧 Server error. Our team has been notified. Please try again later.';
    }
    
    // Bad request errors
    if (error.status === 400) {
      return error.message;
    }
    
    return error.message;
  }

  return error.message || 'An unexpected error occurred. Please try again.';
}

/**
 * Retry logic for failed requests
 */
export async function retryRequest(fn, maxRetries = 3, delay = 1000) {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry client errors (4xx)
      if (error instanceof APIError && error.status >= 400 && error.status < 500) {
        throw error;
      }
      
      // Wait before retrying
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }
  
  throw lastError;
}

/**
 * Check API health
 */
export async function checkAPIHealth() {
  try {
    const data = await apiRequest('/health');
    return data.status === 'healthy';
  } catch {
    return false;
  }
}
