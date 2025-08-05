import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

// Utility component to format AI responses with proper styling
const FormattedAIResponse = ({ content, stream }) => {
  const [streamedContent, setStreamedContent] = useState("");
  
  // Handle streaming if stream prop is provided
  useEffect(() => {
    if (!stream) return;

    const reader = stream.getReader();
    const decoder = new TextDecoder("utf-8");

    const readStream = async () => {
      let done = false;
      while (!done) {
        const { value, done: streamDone } = await reader.read();
        done = streamDone;
        setStreamedContent((prev) => prev + decoder.decode(value));
      }
    };

    readStream();
  }, [stream]);
  
  // Use either the streamed content or the directly passed content
  const displayContent = stream ? streamedContent : content;

  return (
    <div className="formatted-response prose prose-sm max-w-none">
      <ReactMarkdown>{displayContent}</ReactMarkdown>
    </div>
  );
};

export default FormattedAIResponse;
