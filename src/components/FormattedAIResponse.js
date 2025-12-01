import React, { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

const sanitizeMarkdown = (text) => {
  if (!text) return "";

  let output = text;

  output = output.replace(/(^|\n)\s*•\s*/g, (match, boundary) => `${boundary}- `);

  output = output.replace(/(\d+\.)(?=\*\*)/g, (match) => `${match} `);

  const labelRegex = /(^|\n)([>\s-]*)([^*\n:]{1,80}):\*\*(?=\s)/g;
  output = output.replace(labelRegex, (match, boundary, prefix, label) => {
    const cleanedLabel = label.trim();
    if (!cleanedLabel || cleanedLabel.startsWith("**")) {
      return match;
    }
    return `${boundary}${prefix}**${cleanedLabel}:**`;
  });

  return output;
};

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
  const displayContent = useMemo(
    () => (stream ? streamedContent : content) || "",
    [content, stream, streamedContent]
  );

  const enhancedContent = useMemo(
    () => sanitizeMarkdown(displayContent),
    [displayContent]
  );

  const markdownComponents = useMemo(
    () => ({
      h1: ({ children }) => (
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-white">
          {children}
        </h1>
      ),
      h2: ({ children }) => (
        <h2 className="mt-4 text-xl font-semibold text-slate-100">
          {children}
        </h2>
      ),
      h3: ({ children }) => (
        <h3 className="mt-4 text-lg font-semibold text-slate-100">
          {children}
        </h3>
      ),
      h4: ({ children }) => (
        <h4 className="mt-3 text-base font-semibold text-slate-200">
          {children}
        </h4>
      ),
      p: ({ children }) => (
        <p className="leading-relaxed text-slate-200">
          {children}
        </p>
      ),
      ul: ({ children }) => (
        <ul className="my-3 list-disc space-y-2 pl-6 text-slate-200">
          {children}
        </ul>
      ),
      ol: ({ children }) => (
        <ol className="my-3 list-decimal space-y-2 pl-6 text-slate-200">
          {children}
        </ol>
      ),
      li: ({ children }) => (
        <li className="leading-relaxed marker:text-cyan-300">
          {children}
        </li>
      ),
      blockquote: ({ children }) => (
        <blockquote className="my-4 border-l-4 border-cyan-300/60 bg-white/5 px-4 py-2 text-slate-100">
          {children}
        </blockquote>
      ),
      hr: () => <hr className="my-6 border-white/10" />, 
      table: ({ children }) => (
        <div className="my-4 overflow-hidden rounded-xl border border-white/10">
          <table className="w-full divide-y divide-white/10 text-left text-sm">
            {children}
          </table>
        </div>
      ),
      th: ({ children }) => (
        <th className="bg-white/10 px-4 py-2 font-semibold text-white">
          {children}
        </th>
      ),
      td: ({ children }) => (
        <td className="bg-white/5 px-4 py-2 text-slate-200">
          {children}
        </td>
      ),
      strong: ({ children }) => (
        <strong className="font-semibold text-white">{children}</strong>
      ),
      em: ({ children }) => <em className="italic text-slate-300">{children}</em>,
      code({ node, inline, className, children, ...props }) {
        if (inline) {
          return (
            <code
              className="rounded-md bg-white/10 px-1.5 py-0.5 font-mono text-sm text-cyan-200"
              {...props}
            >
              {children}
            </code>
          );
        }

        return (
          <pre className="my-4 overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/80 p-4 text-sm text-slate-50 shadow-inner">
            <code className={`${className || ""} font-mono`} {...props}>
              {children}
            </code>
          </pre>
        );
      },
      a: ({ children, href }) => (
        <a
          className="font-medium text-cyan-300 underline-offset-4 transition hover:text-cyan-200"
          href={href}
          target="_blank"
          rel="noreferrer"
        >
          {children}
        </a>
      ),
    }),
    []
  );

  return (
    <div className="formatted-response glass-panel border-white/10 bg-white/5 p-6">
      <div className="prose prose-invert prose-headings:font-semibold prose-p:leading-relaxed prose-li:leading-relaxed prose-li:marker:text-cyan-300 max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={markdownComponents}
        >
          {enhancedContent}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default FormattedAIResponse;
