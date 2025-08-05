import React, { useState } from 'react';

const tools = [
  { id: "narrative", name: "Narrative Assistant" },
  { id: "dialogue", name: "Dialogue Crafter" },
  { id: "mechanics", name: "Mechanics Tuner" },
  { id: "code", name: "Code Assistant" },
  { id: "explain", name: "Concept Explainer" },
];

const GameForge = () => {
  const [activeTool, setActiveTool] = useState("narrative");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const handleGenerate = async () => {
    setOutput("Generating...");

    try {
      const res = await fetch(`/api/gamedev/${activeTool}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input }),
      });
      const data = await res.json();
      setOutput(data.response);
    } catch (err) {
      setOutput("Error generating response.");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">GameForge AI</h1>

      <div className="flex space-x-2 mb-4">
        {tools.map(tool => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            className={`px-4 py-2 rounded ${tool.id === activeTool ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            {tool.name}
          </button>
        ))}
      </div>

      <textarea
        rows={4}
        className="w-full p-2 border mb-4"
        placeholder={`Enter prompt for ${tools.find(t => t.id === activeTool)?.name}`}
        value={input}
        onChange={e => setInput(e.target.value)}
      />

      <button onClick={handleGenerate} className="bg-green-600 text-white px-4 py-2 rounded">
        Generate
      </button>

      <div className="mt-4 p-4 border bg-white whitespace-pre-wrap">
        {output}
      </div>
    </div>
  );
};

export default GameForge;
