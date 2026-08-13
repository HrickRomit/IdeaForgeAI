import React, { useState } from "react";
import { BookOpenCheck, Bot, Check, Copy, Database, ExternalLink } from "lucide-react";

/**
 * Custom Copy Button for Code Blocks
 */
function CodeBlock({ code, lang }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 overflow-hidden rounded-xl border border-[#2a3833] bg-[#17201d] text-[11px] font-mono shadow-inner">
      <div className="flex items-center justify-between border-b border-[#2a3833] bg-[#101715] px-3.5 py-1.5 text-[10px] font-semibold text-[#64736f]">
        <span className="uppercase text-[#15c7a8]">{lang || "code"}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          {copied ? (
            <>
              <Check className="size-3 text-[#15c7a8]" />
              <span className="text-[#15c7a8]">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="size-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="max-h-80 overflow-x-auto p-3.5 text-[#74ead7] leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/**
 * Custom Markdown & Structure Renderer for Chatbot Responses.
 * Supports headings, bold/italic, bullet & numbered lists, blockquotes, code blocks, tables, inline code, links, and source cards.
 */
export default function ChatMarkdownRenderer({ content, sources = [] }) {
  if (!content) return null;

  // Split text into blocks (paragraphs, lists, code blocks, quotes, headers)
  const lines = content.split("\n");
  const blocks = [];
  let currentList = null;
  let inCodeBlock = false;
  let codeBuffer = [];
  let codeLang = "";
  let inTable = false;
  let tableRows = [];

  const flushList = () => {
    if (currentList) {
      blocks.push(currentList);
      currentList = null;
    }
  };

  const flushTable = () => {
    if (inTable && tableRows.length > 0) {
      blocks.push({ type: "table", rows: [...tableRows] });
      tableRows = [];
      inTable = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Code block toggle ```
    if (trimmed.startsWith("```")) {
      flushList();
      flushTable();
      if (inCodeBlock) {
        blocks.push({ type: "code", code: codeBuffer.join("\n"), lang: codeLang });
        codeBuffer = [];
        codeLang = "";
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
        codeLang = trimmed.slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Tables (| col | col |)
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      flushList();
      if (!inTable) inTable = true;
      // Skip separator rows like |---|---|
      if (!/^\|[\s\-:|]+\|$/.test(trimmed)) {
        const cells = trimmed
          .split("|")
          .slice(1, -1)
          .map((c) => c.trim());
        tableRows.push(cells);
      }
      continue;
    } else if (inTable) {
      flushTable();
    }

    // Empty lines
    if (!trimmed) {
      flushList();
      flushTable();
      continue;
    }

    // Headings
    if (trimmed.startsWith("#")) {
      flushList();
      flushTable();
      const level = (trimmed.match(/^#+/) || ["#"])[0].length;
      const text = trimmed.replace(/^#+\s*/, "");
      blocks.push({ type: "heading", level, text });
      continue;
    }

    // Blockquotes
    if (trimmed.startsWith(">")) {
      flushList();
      flushTable();
      const text = trimmed.replace(/^>\s*/, "");
      blocks.push({ type: "quote", text });
      continue;
    }

    // Unordered List Items (*, -, •)
    const bulletMatch = trimmed.match(/^[\*\-•]\s+(.*)/);
    if (bulletMatch) {
      flushTable();
      if (!currentList || currentList.listType !== "ul") {
        flushList();
        currentList = { type: "list", listType: "ul", items: [] };
      }
      currentList.items.push(bulletMatch[1]);
      continue;
    }

    // Ordered List Items (1., 2.)
    const numMatch = trimmed.match(/^(\d+)[\.\)]\s+(.*)/);
    if (numMatch) {
      flushTable();
      if (!currentList || currentList.listType !== "ol") {
        flushList();
        currentList = { type: "list", listType: "ol", items: [] };
      }
      currentList.items.push(numMatch[2]);
      continue;
    }

    // Normal Paragraph
    flushList();
    flushTable();
    blocks.push({ type: "paragraph", text: line });
  }

  flushList();
  flushTable();

  // Helper to format inline markdown (bold, italic, inline code, links)
  const renderInline = (text) => {
    if (!text) return null;

    const parts = [];
    // Matches **bold**, `inline code`, *italic*, [link](url)
    const regex = /(\*\*|__)(.*?)\1|(`)(.*?)\3|(\*|_)(.*?)\5|\[(.*?)\]\((.*?)\)/g;
    let lastIdx = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIdx) {
        parts.push(text.substring(lastIdx, match.index));
      }

      if (match[1]) {
        // Bold
        parts.push(
          <strong key={match.index} className="font-bold text-[#17201d]">
            {match[2]}
          </strong>
        );
      } else if (match[3]) {
        // Inline Code
        parts.push(
          <code
            key={match.index}
            className="rounded bg-[#e5f8f4] px-1.5 py-0.5 text-[11px] font-mono font-semibold text-[#0b6b61]"
          >
            {match[4]}
          </code>
        );
      } else if (match[5]) {
        // Italic
        parts.push(
          <em key={match.index} className="italic text-[#374742]">
            {match[6]}
          </em>
        );
      } else if (match[7]) {
        // Link [text](url)
        parts.push(
          <a
            key={match.index}
            href={match[8]}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 font-semibold text-[#0b6b61] underline hover:text-[#15c7a8]"
          >
            {match[7]}
            <ExternalLink className="size-3" />
          </a>
        );
      }

      lastIdx = regex.lastIndex;
    }

    if (lastIdx < text.length) {
      parts.push(text.substring(lastIdx));
    }

    return parts.length > 0 ? parts : text;
  };

  return (
    <div className="space-y-3 text-xs leading-relaxed text-[#17201d] break-words">
      {blocks.map((block, idx) => {
        if (block.type === "heading") {
          const hClasses =
            block.level === 1
              ? "text-sm font-extrabold text-[#0b6b61] mt-3.5 mb-1.5 border-b border-[#e4ebe8] pb-1 flex items-center gap-1.5"
              : block.level === 2
              ? "text-xs font-bold text-[#0b6b61] mt-3 mb-1 flex items-center gap-1.5"
              : "text-xs font-bold text-[#17201d] mt-2 mb-1";
          return (
            <div key={idx} className={hClasses}>
              {renderInline(block.text)}
            </div>
          );
        }

        if (block.type === "quote") {
          return (
            <blockquote
              key={idx}
              className="my-2.5 rounded-r-xl border-l-4 border-[#15c7a8] bg-[#f0f9f6] p-3 text-xs italic text-[#0b6b61]"
            >
              {renderInline(block.text)}
            </blockquote>
          );
        }

        if (block.type === "code") {
          return <CodeBlock key={idx} code={block.code} lang={block.lang} />;
        }

        if (block.type === "table") {
          return (
            <div key={idx} className="my-3 overflow-x-auto rounded-xl border border-[#e4ebe8] shadow-inner">
              <table className="w-full border-collapse text-left text-[11px]">
                <tbody>
                  {block.rows.map((row, rIdx) => (
                    <tr
                      key={rIdx}
                      className={
                        rIdx === 0
                          ? "bg-[#e5f8f4] font-bold text-[#0b6b61]"
                          : "border-t border-[#edf2ef] transition hover:bg-[#f8faf9]"
                      }
                    >
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="px-3 py-2">
                          {renderInline(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        if (block.type === "list") {
          if (block.listType === "ol") {
            return (
              <ol key={idx} className="my-2 space-y-1.5 pl-4 list-decimal marker:font-bold marker:text-[#0b6b61]">
                {block.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="pl-1">
                    {renderInline(item)}
                  </li>
                ))}
              </ol>
            );
          }
          return (
            <ul key={idx} className="my-2 space-y-1.5 pl-1">
              {block.items.map((item, itemIdx) => (
                <li key={itemIdx} className="flex items-start gap-2">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#15c7a8]" />
                  <span className="flex-1">{renderInline(item)}</span>
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={idx} className="leading-relaxed">
            {renderInline(block.text)}
          </p>
        );
      })}

      {/* Sources / Evidence Section */}
      {sources && sources.length > 0 && (
        <div className="mt-4 pt-3 border-t border-[#e4ebe8] space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#0b6b61]">
            <Database className="size-3.5 text-[#15c7a8]" />
            <span>Referenced Archive Sources ({sources.length})</span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {sources.map((src, idx) => {
              const metadata = src.metadata || {};
              const title = src.title || metadata.title || "Archived Project";
              const matchScore = src.distance_score !== undefined
                ? Math.max(1, Math.round((1 - src.distance_score) * 100))
                : null;
              const dept = metadata.department || metadata.faculty || "Archive Record";

              return (
                <div
                  key={src.project_id || idx}
                  className="rounded-xl border border-[#d3e5df] bg-[#f0f7f4] p-2.5 text-[11px] transition hover:border-[#15c7a8] hover:bg-white hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-[#17201d] line-clamp-1">{title}</span>
                    {matchScore !== null && (
                      <span className="shrink-0 rounded-full bg-[#15c7a8]/20 px-2 py-0.5 text-[10px] font-bold text-[#0b6b61]">
                        {matchScore}% match
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-[10px] text-[#64736f] truncate">{dept}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
