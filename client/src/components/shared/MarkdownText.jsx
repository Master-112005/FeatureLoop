import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';

export function MarkdownText({ source, className }) {
  return (
    <div className={`markdown-body ${className || ''}`}>
      <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{source || ''}</ReactMarkdown>
      <style>{`
        .markdown-body > :first-child { margin-top: 0; }
        .markdown-body > :last-child { margin-bottom: 0; }
        .markdown-body p { margin: 0.4em 0; }
        .markdown-body ul, .markdown-body ol { padding-left: 1.4em; margin: 0.4em 0; }
        .markdown-body li { margin: 0.15em 0; }
        .markdown-body code {
          background: var(--color-muted);
          border-radius: 4px;
          padding: 0.1em 0.35em;
          font-size: 0.9em;
          font-family: var(--font-mono);
        }
        .markdown-body pre {
          background: var(--color-muted);
          border-radius: 8px;
          padding: 0.75em 1em;
          overflow-x: auto;
        }
        .markdown-body pre code { background: transparent; padding: 0; }
        .markdown-body a { color: var(--color-primary); text-decoration: underline; text-underline-offset: 3px; }
        .markdown-body blockquote { border-inline-start: 3px solid var(--color-border); margin: 0.4em 0; padding-inline-start: 0.9em; color: var(--color-muted-foreground); }
      `}</style>
    </div>
  );
}