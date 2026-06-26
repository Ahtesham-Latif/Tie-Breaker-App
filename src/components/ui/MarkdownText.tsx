import React from "react";
import ReactMarkdown from "react-markdown";
import { cn } from "../../lib/utils";

export function MarkdownText({ children, invertCitations = false }: { children?: string; invertCitations?: boolean }) {
  if (!children) return null;
  return (
    <ReactMarkdown
      components={{
        p: "span",
        a: ({ node, ...props }) => (
          <a {...props} className={cn(
            "hover:underline font-bold transition-colors break-words underline-offset-4",
            invertCitations 
              ? "text-bg-surface hover:text-bg-surface/80 decoration-bg-surface/30" 
              : "text-accent hover:text-accent/80 decoration-accent/30"
          )} target="_blank" rel="noopener noreferrer" />
        )
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
