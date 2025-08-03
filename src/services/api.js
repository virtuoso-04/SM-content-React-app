// Mock API service for Smart Content Studio AI tools

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