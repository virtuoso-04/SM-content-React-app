/**
 * Prompt Templates for Smart Content Studio
 * Predefined templates to help users get started quickly
 */

export const summarizerTemplates = [
  {
    id: 'academic',
    name: 'Academic Summary',
    icon: '🎓',
    description: 'Formal summary for academic or research content',
    systemPrompt: 'Provide a comprehensive academic summary with key findings, methodology, and conclusions.',
  },
  {
    id: 'executive',
    name: 'Executive Brief',
    icon: '💼',
    description: 'High-level executive summary for business documents',
    systemPrompt: 'Create a concise executive summary highlighting key business insights, recommendations, and action items.',
  },
  {
    id: 'simple',
    name: 'Simple Summary',
    icon: '📝',
    description: 'Easy-to-understand summary for general audience',
    systemPrompt: 'Provide a simple, easy-to-understand summary using plain language suitable for a general audience.',
  },
  {
    id: 'bullet',
    name: 'Bullet Points',
    icon: '•',
    description: 'Key points in bullet format',
    systemPrompt: 'Summarize the main points as clear, concise bullet points.',
  },
  {
    id: 'social',
    name: 'Social Media Post',
    icon: '📱',
    description: 'Summary optimized for social media sharing',
    systemPrompt: 'Create an engaging summary suitable for social media with relevant hashtags and emojis.',
  },
];

export const ideaGeneratorTemplates = [
  {
    id: 'brainstorm',
    name: 'Brainstorming Session',
    icon: '💡',
    description: 'Generate diverse creative ideas',
    prompt: 'Generate 7 creative and diverse ideas about: {topic}',
  },
  {
    id: 'problem-solving',
    name: 'Problem Solving',
    icon: '🔧',
    description: 'Solutions to specific challenges',
    prompt: 'Suggest 5 innovative solutions to solve this problem: {topic}',
  },
  {
    id: 'content-topics',
    name: 'Content Topics',
    icon: '📚',
    description: 'Blog posts and article ideas',
    prompt: 'Generate 6 engaging blog post or article ideas about: {topic}',
  },
  {
    id: 'product-features',
    name: 'Product Features',
    icon: '🚀',
    description: 'Features for product development',
    prompt: 'Suggest 5 innovative features for a product related to: {topic}',
  },
  {
    id: 'marketing',
    name: 'Marketing Campaign',
    icon: '📢',
    description: 'Marketing and promotional ideas',
    prompt: 'Generate 5 creative marketing campaign ideas for: {topic}',
  },
];

export const contentRefinerTemplates = [
  {
    id: 'professional',
    name: 'Professional Tone',
    icon: '🎯',
    description: 'Refine to professional business language',
    instruction: 'Make this content more professional and business-appropriate while maintaining its core message.',
  },
  {
    id: 'casual',
    name: 'Casual & Friendly',
    icon: '😊',
    description: 'Make content more conversational',
    instruction: 'Rewrite this in a casual, friendly, and conversational tone.',
  },
  {
    id: 'concise',
    name: 'Make Concise',
    icon: '✂️',
    description: 'Shorten and simplify',
    instruction: 'Make this more concise and direct while keeping all essential information.',
  },
  {
    id: 'elaborate',
    name: 'Elaborate More',
    icon: '📖',
    description: 'Add more detail and depth',
    instruction: 'Expand this content with more details, examples, and explanations.',
  },
  {
    id: 'grammar',
    name: 'Fix Grammar',
    icon: '✅',
    description: 'Correct grammar and punctuation',
    instruction: 'Fix all grammar, spelling, and punctuation errors while preserving the original meaning.',
  },
  {
    id: 'seo',
    name: 'SEO Optimize',
    icon: '🔍',
    description: 'Optimize for search engines',
    instruction: 'Optimize this content for SEO with relevant keywords, clear structure, and engaging meta descriptions.',
  },
];

export const chatbotTemplates = [
  {
    id: 'explain',
    name: 'Explain Like I\'m 5',
    icon: '👶',
    description: 'Simple explanations',
    prompt: 'Explain this in simple terms: {message}',
  },
  {
    id: 'pros-cons',
    name: 'Pros & Cons',
    icon: '⚖️',
    description: 'Analyze advantages and disadvantages',
    prompt: 'List the pros and cons of: {message}',
  },
  {
    id: 'howto',
    name: 'How To Guide',
    icon: '📋',
    description: 'Step-by-step instructions',
    prompt: 'Provide a step-by-step guide on how to: {message}',
  },
  {
    id: 'compare',
    name: 'Compare',
    icon: '🔄',
    description: 'Compare options or concepts',
    prompt: 'Compare and contrast: {message}',
  },
  {
    id: 'advice',
    name: 'Get Advice',
    icon: '💭',
    description: 'Personalized recommendations',
    prompt: 'Give me practical advice on: {message}',
  },
];

export const gameForgeTemplates = {
  story: [
    {
      id: 'fantasy-quest',
      name: 'Fantasy Quest',
      icon: '🗡️',
      description: 'Epic fantasy adventure',
      prompt: 'Create a fantasy quest about: {input}',
    },
    {
      id: 'scifi-mission',
      name: 'Sci-Fi Mission',
      icon: '🚀',
      description: 'Space exploration story',
      prompt: 'Design a sci-fi mission involving: {input}',
    },
    {
      id: 'mystery',
      name: 'Mystery Story',
      icon: '🔍',
      description: 'Detective or puzzle story',
      prompt: 'Write a mystery storyline about: {input}',
    },
    {
      id: 'horror',
      name: 'Horror Scenario',
      icon: '👻',
      description: 'Suspenseful horror plot',
      prompt: 'Create a horror game scenario centered on: {input}',
    },
  ],
  dialogue: [
    {
      id: 'npc-merchant',
      name: 'Merchant NPC',
      icon: '🏪',
      description: 'Shop keeper dialogue',
      prompt: 'Write dialogue for a merchant NPC who: {input}',
    },
    {
      id: 'quest-giver',
      name: 'Quest Giver',
      icon: '📜',
      description: 'Character offering quests',
      prompt: 'Create quest giver dialogue for: {input}',
    },
    {
      id: 'companion',
      name: 'Companion',
      icon: '👥',
      description: 'Party member dialogue',
      prompt: 'Write companion character dialogue about: {input}',
    },
    {
      id: 'villain',
      name: 'Villain',
      icon: '😈',
      description: 'Antagonist dialogue',
      prompt: 'Create villain dialogue for: {input}',
    },
  ],
  mechanics: [
    {
      id: 'combat',
      name: 'Combat System',
      icon: '⚔️',
      description: 'Battle mechanics',
      prompt: 'Design combat mechanics for: {input}',
    },
    {
      id: 'progression',
      name: 'Progression System',
      icon: '📈',
      description: 'Leveling and upgrades',
      prompt: 'Create a progression system for: {input}',
    },
    {
      id: 'puzzle',
      name: 'Puzzle Mechanic',
      icon: '🧩',
      description: 'Environmental puzzles',
      prompt: 'Design puzzle mechanics involving: {input}',
    },
    {
      id: 'multiplayer',
      name: 'Multiplayer Mode',
      icon: '👫',
      description: 'Co-op or PvP mechanics',
      prompt: 'Suggest multiplayer mechanics for: {input}',
    },
  ],
  code: [
    {
      id: 'unity-movement',
      name: 'Unity Movement',
      icon: '🎮',
      description: 'Character controller (Unity C#)',
      prompt: 'Write Unity C# code for character movement: {input}',
    },
    {
      id: 'godot-interaction',
      name: 'Godot Interaction',
      icon: '🎯',
      description: 'Object interaction (Godot GDScript)',
      prompt: 'Write Godot GDScript for object interaction: {input}',
    },
    {
      id: 'inventory',
      name: 'Inventory System',
      icon: '🎒',
      description: 'Item management code',
      prompt: 'Create code for an inventory system that: {input}',
    },
    {
      id: 'ai-behavior',
      name: 'AI Behavior',
      icon: '🤖',
      description: 'NPC AI logic',
      prompt: 'Write AI behavior code for: {input}',
    },
  ],
  explain: [
    {
      id: 'engine-basics',
      name: 'Engine Basics',
      icon: '🔰',
      description: 'Fundamental concepts',
      prompt: 'Explain this game engine concept: {input}',
    },
    {
      id: 'optimization',
      name: 'Optimization',
      icon: '⚡',
      description: 'Performance tips',
      prompt: 'Explain optimization techniques for: {input}',
    },
    {
      id: 'design-pattern',
      name: 'Design Pattern',
      icon: '🏗️',
      description: 'Code architecture',
      prompt: 'Explain the design pattern: {input}',
    },
    {
      id: 'concept',
      name: 'Game Concept',
      icon: '💡',
      description: 'Game design principles',
      prompt: 'Explain the game design concept of: {input}',
    },
  ],
};

export const imageGeneratorTemplates = [
  {
    id: 'photorealistic',
    name: 'Photorealistic',
    icon: '📸',
    description: 'Realistic photograph style',
    style: 'photorealistic, high detail, professional photography, 4k',
  },
  {
    id: 'digital-art',
    name: 'Digital Art',
    icon: '🎨',
    description: 'Modern digital artwork',
    style: 'digital art, artstation trending, vibrant colors, detailed',
  },
  {
    id: 'anime',
    name: 'Anime Style',
    icon: '🌸',
    description: 'Japanese anime aesthetic',
    style: 'anime style, manga art, cel shaded, vibrant colors',
  },
  {
    id: 'oil-painting',
    name: 'Oil Painting',
    icon: '🖼️',
    description: 'Classic oil painting',
    style: 'oil painting, classical art, brushstrokes, textured canvas',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    icon: '🌃',
    description: 'Futuristic neon aesthetic',
    style: 'cyberpunk, neon lights, futuristic, sci-fi, high tech',
  },
  {
    id: 'watercolor',
    name: 'Watercolor',
    icon: '💧',
    description: 'Soft watercolor painting',
    style: 'watercolor painting, soft colors, artistic, flowing',
  },
];

// Helper function to apply template
export const applyTemplate = (template, userInput = '') => {
  if (template.prompt) {
    return template.prompt.replace('{topic}', userInput).replace('{message}', userInput).replace('{input}', userInput);
  }
  return userInput;
};
