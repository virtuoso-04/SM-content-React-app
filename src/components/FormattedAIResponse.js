import React from 'react';

// Utility component to format AI responses with proper markdown styling
const FormattedAIResponse = ({ content }) => {
  if (!content) return null;

  // Process the content to handle markdown-like formatting
  const processContent = () => {
    const lines = content.split('\n');
    const elements = [];
    let codeBlockContent = [];
    let inCodeBlock = false;
    let codeLanguage = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Handle code blocks
      if (trimmed.startsWith('```')) {
        if (!inCodeBlock) {
          // Starting a code block
          inCodeBlock = true;
          codeLanguage = trimmed.substring(3).trim();
        } else {
          // Ending a code block
          inCodeBlock = false;
          elements.push(
            <div key={`code-${i}`} className="bg-gray-900 text-gray-100 rounded-lg p-4 my-3 font-mono text-sm overflow-x-auto">
              {codeLanguage && (
                <div className="text-gray-400 text-xs mb-2 uppercase">{codeLanguage}</div>
              )}
              <pre className="whitespace-pre-wrap break-words">
                {codeBlockContent.join('\n')}
              </pre>
            </div>
          );
          codeBlockContent = [];
          codeLanguage = '';
        }
        continue;
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        continue;
      }

      // Handle headings
      if (trimmed.startsWith('####')) {
        elements.push(
          <h4 key={i} className="text-md font-bold text-gray-800 mt-4 mb-2">
            {formatInlineMarkdown(trimmed.substring(4).trim())}
          </h4>
        );
      } else if (trimmed.startsWith('###')) {
        elements.push(
          <h3 key={i} className="text-lg font-bold text-gray-800 mt-4 mb-2">
            {formatInlineMarkdown(trimmed.substring(3).trim())}
          </h3>
        );
      } else if (trimmed.startsWith('##')) {
        elements.push(
          <h2 key={i} className="text-xl font-bold text-gray-900 mt-5 mb-3">
            {formatInlineMarkdown(trimmed.substring(2).trim())}
          </h2>
        );
      } else if (trimmed.startsWith('#')) {
        elements.push(
          <h1 key={i} className="text-2xl font-bold text-gray-900 mt-5 mb-3">
            {formatInlineMarkdown(trimmed.substring(1).trim())}
          </h1>
        );
      }
      // Handle bullet points
      else if (trimmed.startsWith('•') || trimmed.startsWith('-') || (trimmed.startsWith('*') && !trimmed.startsWith('**'))) {
        const bulletText = trimmed.replace(/^[\s•\-*]+/, '');
        elements.push(
          <div key={i} className="flex items-start gap-2 my-2 ml-4">
            <span className="text-blue-500 font-bold mt-1 text-sm">•</span>
            <span className="text-sm leading-relaxed">{formatInlineMarkdown(bulletText)}</span>
          </div>
        );
      }
      // Handle numbered lists
      else if (/^\s*\d+\./.test(trimmed)) {
        const number = trimmed.match(/^\s*\d+\./)[0];
        const listText = trimmed.replace(/^\s*\d+\.\s*/, '');
        elements.push(
          <div key={i} className="my-2 ml-4">
            <span className="font-semibold text-blue-600 text-sm">{number}</span>
            <span className="ml-1 text-sm leading-relaxed">{formatInlineMarkdown(listText)}</span>
          </div>
        );
      }
      // Handle horizontal rules
      else if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
        elements.push(<hr key={i} className="my-4 border-gray-300" />);
      }
      // Handle blockquotes
      else if (trimmed.startsWith('>')) {
        const quoteText = trimmed.substring(1).trim();
        elements.push(
          <div key={i} className="border-l-4 border-blue-500 pl-4 py-2 my-3 bg-blue-50 italic text-gray-700">
            {formatInlineMarkdown(quoteText)}
          </div>
        );
      }
      // Regular lines
      else if (trimmed) {
        elements.push(
          <div key={i} className="my-1 text-sm leading-relaxed text-gray-800">
            {formatInlineMarkdown(line)}
          </div>
        );
      }
      // Empty lines for spacing
      else {
        elements.push(<div key={i} className="h-2"></div>);
      }
    }

    return elements;
  };

  // Format inline markdown elements (bold, italic, code, links)
  const formatInlineMarkdown = (text) => {
    const parts = [];
    let key = 0;

    // Process bold (**text** or __text__) and inline code together
    const combinedRegex = /(\*\*|__)([^*_]+?)\1|`([^`]+?)`/g;
    let lastIndex = 0;
    let match;

    while ((match = combinedRegex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push(
          <span key={key++}>{text.substring(lastIndex, match.index)}</span>
        );
      }

      // Check if it's bold or code
      if (match[1]) {
        // It's bold text
        parts.push(
          <strong key={key++} className="font-bold text-gray-900">
            {match[2]}
          </strong>
        );
      } else if (match[3]) {
        // It's inline code
        parts.push(
          <code key={key++} className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono text-pink-600">
            {match[3]}
          </code>
        );
      }

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(<span key={key++}>{text.substring(lastIndex)}</span>);
    }

    return parts.length > 0 ? parts : text;
  };

  return (
    <div className="prose prose-sm max-w-none">
      {processContent()}
    </div>
  );
};

export default FormattedAIResponse;
