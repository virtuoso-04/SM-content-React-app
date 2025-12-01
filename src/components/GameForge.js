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
    <div className="flex h-full flex-col text-slate-100">
      <div className="mb-6 flex items-center gap-4">
        <div className="rounded-2xl border border-white/20 bg-gradient-to-br from-blue-500/60 to-violet-500/60 p-3 text-white shadow-[0_20px_60px_rgba(99,102,241,0.35)]">
          <FaGamepad size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-white">GameForge AI</h2>
          <p className="text-sm text-slate-300">Generate game content with AI assistance</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-6">
        <div className="mb-2 flex flex-wrap gap-2">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className={`rounded-2xl px-4 py-2 text-sm font-medium transition-all ${
                tool.id === activeTool
                  ? 'border border-cyan-300/70 bg-gradient-to-r from-cyan-500/30 via-blue-500/20 to-indigo-500/20 text-white shadow-lg'
                  : 'border border-white/10 bg-white/5 text-slate-200 hover:border-cyan-200/40'
              }`}
            >
              {tool.name}
            </button>
          ))}
        </div>

        <div className="glass-panel border-white/10 bg-white/5 p-4">
          <h3 className="mb-1 text-base font-semibold text-white">
            {tools.find((t) => t.id === activeTool)?.name}
          </h3>
          <p className="text-sm text-slate-300">
            {tools.find((t) => t.id === activeTool)?.description}
          </p>
        </div>

        <div className="glass-panel border-white/10 bg-white/5 p-5">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold uppercase tracking-[0.3em] text-slate-300">
              Your input for {tools.find((t) => t.id === activeTool)?.name}
            </span>
            <textarea
              rows={4}
              className="glass-input w-full resize-none border-white/15 bg-white/5 p-4 text-base text-white"
              placeholder={tools.find((t) => t.id === activeTool)?.placeholder}
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </label>

          <button
            onClick={handleGenerate}
            disabled={loading || !input.trim()}
            className="mt-4 w-full rounded-2xl border border-transparent bg-gradient-to-r from-[#A6FFCB] via-[#12D8FA] to-[#1FA2FF] px-6 py-3 font-semibold text-slate-900 shadow-[0_25px_80px_rgba(15,118,230,0.35)] transition hover:translate-y-[-1px] disabled:opacity-40"
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
          <div className="rounded-2xl border border-rose-400/40 bg-rose-500/10 p-4 text-sm text-rose-100">
            {error}
          </div>
        )}

        {output && (
          <div className="glass-panel border-white/10 bg-white/5 p-5 animate-fade-in">
            <h3 className="mb-2 font-semibold text-white">Generated Content:</h3>
            <div className="text-slate-200">
              <FormattedAIResponse content={output} />
            </div>
          </div>
        )}

        {history.length > 0 && (
          <div className="glass-panel border-white/10 bg-white/5 p-5">
            <h3 className="mb-3 font-semibold text-white">Previous Generations</h3>
            <div className="max-h-60 space-y-3 overflow-y-auto pr-1">
              {history.map((item, idx) => (
                <div key={idx} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                    <span>{item.date}</span>
                    <span className="glass-chip text-cyan-100">{item.tool}</span>
                  </div>
                  <div className="mb-2 text-sm text-slate-300">
                    <span className="font-semibold text-white">Prompt:</span> {item.input}
                  </div>
                  <div className="text-sm text-slate-100">
                    <span className="font-semibold text-white">Output:</span> {item.output?.substring(0, 100)}...
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
