"use client";

import * as React from "react";
import { Check, Copy, Terminal, ChevronDown, ChevronRight } from "lucide-react";
import { cn, dedent } from "@/lib/utils";
import { Button } from "./button";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

// Custom cyberpunk theme for syntax highlighting
const cyberpunkTheme = {
  'code[class*="language-"]': {
    color: "#d4d4d8",
    background: "transparent",
    textShadow: "none",
    fontFamily:
      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    fontSize: "0.875rem",
    textAlign: "left",
    whiteSpace: "pre",
    wordSpacing: "normal",
    wordBreak: "normal",
    wordWrap: "normal",
    lineHeight: "1.5",
    MozTabSize: "4",
    OTabSize: "4",
    tabSize: "4",
    WebkitHyphens: "none",
    MozHyphens: "none",
    msHyphens: "none",
    hyphens: "none",
  },
  'pre[class*="language-"]': {
    color: "#d4d4d8",
    background: "transparent",
    textShadow: "none",
    fontFamily:
      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    fontSize: "0.875rem",
    textAlign: "left",
    whiteSpace: "pre",
    wordSpacing: "normal",
    wordBreak: "normal",
    wordWrap: "normal",
    lineHeight: "1.5",
    MozTabSize: "4",
    OTabSize: "4",
    tabSize: "4",
    WebkitHyphens: "none",
    MozHyphens: "none",
    msHyphens: "none",
    hyphens: "none",
    padding: "1em",
    margin: "0.5em 0",
    overflow: "auto",
  },
  comment: { color: "#6b7280", fontStyle: "italic" },
  prolog: { color: "#6b7280" },
  doctype: { color: "#6b7280" },
  cdata: { color: "#6b7280" },
  punctuation: { color: "#94a3b8" },
  property: { color: "#22d3ee" },
  tag: { color: "#22d3ee" },
  boolean: { color: "#c084fc" },
  number: { color: "#fb923c" },
  constant: { color: "#fb923c" },
  symbol: { color: "#fb923c" },
  deleted: { color: "#f87171" },
  selector: { color: "#a78bfa" },
  "attr-name": { color: "#fbbf24" },
  string: { color: "#4ade80" },
  char: { color: "#4ade80" },
  builtin: { color: "#22d3ee" },
  inserted: { color: "#4ade80" },
  operator: { color: "#c084fc" },
  entity: { color: "#fbbf24", cursor: "help" },
  url: { color: "#22d3ee" },
  ".language-css .token.string": { color: "#4ade80" },
  ".style .token.string": { color: "#4ade80" },
  variable: { color: "#e879f9" },
  atrule: { color: "#c084fc" },
  "attr-value": { color: "#4ade80" },
  function: { color: "#fbbf24" },
  "class-name": { color: "#22d3ee" },
  keyword: { color: "#c084fc", fontWeight: "500" },
  regex: { color: "#fb923c" },
  important: { color: "#f87171", fontWeight: "bold" },
  bold: { fontWeight: "bold" },
  italic: { fontStyle: "italic" },
  namespace: { opacity: 0.7 },
};

interface CodeBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  title?: string;
  showCopy?: boolean;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

const CodeBlock = React.forwardRef<HTMLDivElement, CodeBlockProps>(
  (
    {
      code: rawCode,
      language = "tsx",
      showLineNumbers = false,
      title,
      showCopy = true,
      collapsible = false,
      defaultExpanded = true,
      className,
      ...props
    },
    ref
  ) => {
    const code = React.useMemo(() => dedent(rawCode), [rawCode]);
    const [open, setOpen] = React.useState(defaultExpanded);
    const [copied, setCopied] = React.useState(false);

    const handleCopy = async (e: React.MouseEvent) => {
      e.stopPropagation();
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative group rounded-lg overflow-hidden",
          "bg-black/40 backdrop-blur-sm",
          "border border-white/10",
          "hover:border-white/20",
          "transition-all duration-300",
          collapsible && !open && "hover:bg-zinc-900/40",
          className
        )}
        {...props}
      >
        {/* Scanline Effect */}
        <div className="absolute inset-0 pointer-events-none z-10 opacity-2">
          <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.03)_2px,rgba(255,255,255,0.03)_4px)]" />
        </div>

        {/* Noise Texture */}
        <div className="absolute inset-0 pointer-events-none z-10 opacity-1.5 mix-blend-overlay">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]" />
        </div>

        {/* Corner Accent Lines */}
        <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-cyan-500/20 pointer-events-none z-20" />
        <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-cyan-500/20 pointer-events-none z-20" />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b border-l border-cyan-500/20 pointer-events-none z-20" />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-cyan-500/20 pointer-events-none z-20" />

        {/* Header */}
        {(title || showCopy || collapsible) && (
          <div
            className={cn(
              "relative z-30 flex items-center justify-between px-4 py-2 border-b border-white/10 bg-zinc-950/60 select-none",
              collapsible &&
                "cursor-pointer hover:bg-white/5 active:bg-white/10 transition-colors"
            )}
            onClick={() => collapsible && setOpen(!open)}
          >
            <div className="flex items-center gap-2">
              {collapsible && (
                <div className="mr-1 text-zinc-500">
                  {open ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </div>
              )}
              <Terminal className="w-3.5 h-3.5 text-cyan-400/80" />
              <span className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider">
                Code
              </span>
              {title && (
                <>
                  <span className="text-zinc-700">•</span>
                  <span className="text-xs font-mono font-bold text-cyan-400/90 uppercase tracking-wider">
                    {title}
                  </span>
                </>
              )}
              {language && !title && (
                <>
                  <span className="text-zinc-700">•</span>
                  <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
                    {language}
                  </span>
                </>
              )}
            </div>
            {showCopy && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-6 px-2 text-zinc-400 hover:text-zinc-300 hover:bg-white/5"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 mr-1" />
                    <span className="text-[10px] font-mono uppercase tracking-wider">
                      Copied
                    </span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 mr-1" />
                    <span className="text-[10px] font-mono uppercase tracking-wider">
                      Copy
                    </span>
                  </>
                )}
              </Button>
            )}
          </div>
        )}

        {/* Code Content */}
        {open && (
          <div className="relative z-20 overflow-x-auto custom-scrollbar animate-in slide-in-from-top-2 duration-300">
            <SyntaxHighlighter
              language={language}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              style={cyberpunkTheme as any}
              showLineNumbers={showLineNumbers}
              customStyle={{
                margin: 0,
                padding: "1rem",
                background: "transparent",
                fontSize: "0.875rem",
                lineHeight: "1.5",
              }}
              codeTagProps={{
                style: {
                  fontFamily:
                    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                },
              }}
              lineNumberStyle={{
                minWidth: "2rem",
                paddingRight: "1rem",
                color: "#164e63",
                userSelect: "none",
                fontWeight: "normal",
                opacity: 0.6,
              }}
              wrapLines={true}
              lineProps={() => ({
                style: {
                  display: "block",
                },
                className: "hover:bg-white/2",
              })}
            >
              {code}
            </SyntaxHighlighter>
          </div>
        )}
      </div>
    );
  }
);

CodeBlock.displayName = "CodeBlock";

export { CodeBlock };
