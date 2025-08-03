import React from 'react';

// Utility component to format AI responses with proper styling
const FormattedAIResponse = ({ content }) => {
  if (!content) return null;

  return (
    <div className="whitespace-pre-wrap break-words leading-relaxed">
      {content.split('\n').map((line, lineIdx) => {
        // Handle bullet points
        if (line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*')) {
          return (
            <div key={lineIdx} className="flex items-start gap-2 my-2">
              <span className="text-blue-500 font-bold mt-1 text-sm">•</span>
              <span className="text-sm leading-relaxed">{line.replace(/^[\s•\-*]+/, '')}</span>
            </div>
          );
        }
        // Handle numbered lists
        else if (/^\s*\d+\./.test(line)) {
          return (
            <div key={lineIdx} className="my-2">
              <span className="font-semibold text-blue-600 text-sm">{line.match(/^\s*\d+\./)[0]}</span>
              <span className="ml-1 text-sm leading-relaxed">{line.replace(/^\s*\d+\.\s*/, '')}</span>
            </div>
          );
        }
        // Handle bold text (wrapped in **)
        else if (line.includes('**')) {
          const parts = line.split('**');
          return (
            <div key={lineIdx} className="my-1">
              {parts.map((part, partIdx) => 
                partIdx % 2 === 1 ? 
                  <strong key={partIdx} className="font-semibold text-gray-900">{part}</strong> : 
                  <span key={partIdx} className="text-sm leading-relaxed">{part}</span>
              )}
            </div>
          );
        }
        // Handle code blocks (wrapped in ```)
        else if (line.trim().startsWith('```') || line.trim().endsWith('```')) {
          return (
            <div key={lineIdx} className="bg-gray-100 rounded p-2 my-2 font-mono text-xs overflow-x-auto">
              {line.replace(/```/g, '')}
            </div>
          );
        }
        // Handle inline code (wrapped in `)
        else if (line.includes('`')) {
          const parts = line.split('`');
          return (
            <div key={lineIdx} className="my-1">
              {parts.map((part, partIdx) => 
                partIdx % 2 === 1 ? 
                  <code key={partIdx} className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">{part}</code> : 
                  <span key={partIdx} className="text-sm leading-relaxed">{part}</span>
              )}
            </div>
          );
        }
        // Regular lines
        else if (line.trim()) {
          return (
            <div key={lineIdx} className="my-1 text-sm leading-relaxed">
              {line}
            </div>
          );
        }
        // Empty lines for spacing
        else {
          return <div key={lineIdx} className="h-3"></div>;
        }
      })}
    </div>
  );
};

export default FormattedAIResponse;
