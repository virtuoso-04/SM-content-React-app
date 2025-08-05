import React, { useState, useEffect } from 'react';
import { apiCall } from '../services/realApi';
import Loader from './Loader';
import FormattedAIResponse from './FormattedAIResponse';
import { FaGamepad } from 'react-icons/fa';

const tools = [
  {
    id: "narrative",
    name: "Narrative Assistant",
    description: "Craft story arcs, quests, and immersive world-building",
    placeholder: "e.g., 'Design a backstory for a utopian city powered by dreams'",
    prompt:
      "You are a lead narrative designer. Based on the following idea, generate a rich game narrative with:\n- Title and setting\n- Key plot points and twists\n- Themes and player motivations\n- Story arc (beginning → conflict → resolution):\n\n",
  },
  {
    id: "dialogue",
    name: "Dialogue Crafter",
    description: "Write engaging in-game dialogue for characters and scenes",
    placeholder: "e.g., 'Conversation between a sarcastic AI and its confused creator'",
    prompt:
      "You're a game writer specializing in character dialogue. Generate a scene with:\n- Back-and-forth lines (3–5 turns)\n- Distinct personalities and tone\n- Optional emotional tension or humor\n\nScenario:\n",
  },
  {
    id: "mechanics",
    name: "Mechanics Tuner",
    description: "Design gameplay loops, systems, and player progression",
    placeholder: "e.g., 'Design a dynamic stealth system for a cyberpunk heist game'",
    prompt:
      "You're a systems designer. Based on the idea below, define:\n- Core gameplay loop\n- Player progression or unlocks\n- Unique mechanics or twists\n- How the system stays balanced/fun\n\nConcept:\n",
  },
  {
    id: "code",
    name: "Code Assistant",
    description: "Generate functional code or pseudocode for gameplay features",
    placeholder: "e.g., 'Unity C# script for enemy patrolling behavior'",
    prompt:
      "You are a senior game developer. Generate optimized, commented code (or pseudocode) for the task below:\n- Clearly explain logic\n- Mention engine if relevant (Unity, Godot, Unreal)\n- Include tips for extensibility or performance\n\nTask:\n",
  },
  {
    id: "explain",
    name: "Concept Explainer",
    description: "Simplify complex game development topics",
    placeholder: "e.g., 'Explain why shaders are used and how fragment shaders work'",
    prompt:
      "You're a game dev educator. Explain the topic below in simple terms, using:\n- Real-world analogies\n- Common use cases in games\n- Visual or conceptual breakdowns\n- Pros, cons, and implementation tips\n\nTopic:\n",
  },
];


const endpointMap = {
  narrative: "story",
  dialogue: "dialogue",
  mechanics: "mechanics",
  code: "code",
  explain: "explain",
};

const STORAGE_KEY = 'gameforge_history';

const GameForge = () => {
  const [activeTool, setActiveTool] = useState("narrative");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (error) {
        console.error('Error parsing gameforge history:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const handleGenerate = async () => {
    setError('');
    setOutput('');
    if (!input.trim()) {
      setError('Please enter a prompt.');
      return;
    }
    setLoading(true);
    try {
      // Get the current tool's prompt to prepend to the user input
      const currentTool = tools.find(t => t.id === activeTool);
      const promptPrefix = currentTool?.prompt || "";
      const fullPrompt = promptPrefix + input.trim();
      
      // Create a path for the API call, format: gamedev/endpoint (e.g., gamedev/story)
      const endpoint = `gamedev/${endpointMap[activeTool]}`;
      const res = await apiCall(endpoint, fullPrompt);
      
      setOutput(res.output);
      
      // Add to history
      const newEntry = { 
        tool: currentTool?.name,
        input: input.trim(), 
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
      console.error('GameForge error:', e);
      setError(e.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg">
          <FaGamepad size={32} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">GameForge AI</h2>
          <p className="text-gray-600">Generate game content with AI assistance</p>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col gap-6">
        <div className="flex flex-wrap gap-2 mb-4">
          {tools.map(tool => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                tool.id === activeTool 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tool.name}
            </button>
          ))}
        </div>

        {/* Tool description */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h3 className="font-medium text-blue-800 mb-1">
            {tools.find(t => t.id === activeTool)?.name}
          </h3>
          <p className="text-sm text-blue-700">
            {tools.find(t => t.id === activeTool)?.description}
          </p>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700 mb-2 block">
              Your input for {tools.find(t => t.id === activeTool)?.name}
            </span>
            <textarea
              rows={4}
              className="w-full rounded-lg border border-gray-300 p-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none bg-gray-50 text-gray-900"
              placeholder={tools.find(t => t.id === activeTool)?.placeholder}
              value={input}
              onChange={e => setInput(e.target.value)}
            />
          </label>
          
          <button
            onClick={handleGenerate}
            disabled={loading || !input.trim()}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader />
                <span>Generating...</span>
              </div>
            ) : (
              'Generate'
            )}
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {output && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg animate-fade-in">
            <h3 className="font-semibold text-gray-800 mb-2">Generated Content:</h3>
            <div className="text-gray-700">
              <FormattedAIResponse content={output} />
            </div>
          </div>
        )}

        {history.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-800">Previous Generations</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {history.map((item, idx) => (
                <div key={idx} className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-500">{item.date}</span>
                    <span className="text-xs font-medium bg-blue-100 text-blue-800 rounded-full px-2 py-1">
                      {item.tool}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Prompt:</span> {item.input}
                  </div>
                  <div className="text-sm text-gray-800 line-clamp-3">
                    <span className="font-medium">Output:</span> {item.output?.substring(0, 100)}...
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

export default GameForge;
