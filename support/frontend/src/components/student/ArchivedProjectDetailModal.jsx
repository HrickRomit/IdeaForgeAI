import { useState, useMemo } from "react";
import {
  X,
  Bot,
  Send,
  Loader2,
  BookOpen,
  Sparkles,
  Layers,
  Cpu,
  CheckCircle2,
  FileText,
  Lightbulb,
  Tag,
  GraduationCap,
  MessageSquareText,
  User,
  Calendar,
  Building2,
  HelpCircle,
} from "lucide-react";
import { sendChatMessage } from "../../api/chatApi";
import ChatMarkdownRenderer from "../common/ChatMarkdownRenderer.jsx";

export default function ArchivedProjectDetailModal({ project, similarityScore, onClose }) {
  const [activeTab, setActiveTab] = useState("details"); // 'details' | 'tech' | 'gap' | 'chatbot'
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      content: `Hello! I am your AI assistant for "${project?.title || "this archived project"}". Ask me anything about its problem statement, methodology, tech stack, or how it compares to your project idea!`,
    },
  ]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [isSending, setIsSending] = useState(false);

  if (!project) return null;

  const metadata = project.metadata || {};
  const title = project.title || metadata.title || "Archived Project";
  const abstract = metadata.abstract || project.document_snippet || "No abstract available.";
  const problemStatement = metadata.problem_statement || metadata.problem || "No problem statement recorded.";
  const department = metadata.department || metadata.faculty || "Computer Science & Engineering";
  const year = metadata.academic_year || metadata.year || "2025-2026";
  const supervisor = metadata.supervisor || "Faculty Advisor";
  const difficulty = metadata.difficulty || "Intermediate";
  const researchArea = metadata.research_area || metadata.domain || "Academic Systems";
  const technologies = useMemo(() => {
    if (Array.isArray(metadata.technologies)) return metadata.technologies;
    if (typeof metadata.technologies === "string") return metadata.technologies.split(",").map((s) => s.trim());
    return ["FastAPI", "React", "Python", "PostgreSQL"];
  }, [metadata.technologies]);

  const keywords = useMemo(() => {
    if (Array.isArray(metadata.keywords)) return metadata.keywords;
    if (typeof metadata.keywords === "string") return metadata.keywords.split(",").map((s) => s.trim());
    return ["semantic search", "archive", "project assistant"];
  }, [metadata.keywords]);

  const outcomes = useMemo(() => {
    if (Array.isArray(metadata.outcomes)) return metadata.outcomes;
    if (Array.isArray(metadata.expected_outcomes)) return metadata.expected_outcomes;
    return [
      "Automated record cataloging and indexing",
      "Role-based workflow for faculty and students",
      "High accuracy similarity and search detection",
    ];
  }, [metadata.outcomes, metadata.expected_outcomes]);

  const gap =
    metadata.gap ||
    metadata.future_scope ||
    "The project notes potential for integrating real-time collaboration, predictive analytics, and enhanced domain-specific LLM fine-tuning.";

  const scorePercent = similarityScore !== undefined ? Math.round(similarityScore * 100) : null;

  const getScoreBadgeColor = (score) => {
    if (!score) return "bg-[#e5f8f4] text-[#0b6b61]";
    if (score < 35) return "bg-[#e5f8f4] text-[#0b6b61]";
    if (score < 65) return "bg-[#fef3c7] text-[#d97706]";
    return "bg-[#fee2e2] text-[#dc2626]";
  };

  const starterPrompts = [
    `How does my proposal differ from "${title}"?`,
    `What tech stack and tools were used in this project?`,
    `What are the main research gaps and future scope of this project?`,
    `Summarize the key objectives of this archived project.`,
  ];

  const handleSendMessage = async (questionText) => {
    const query = (questionText || input).trim();
    if (!query || isSending) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      role: "user",
      content: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsSending(true);

    try {
      // Pass contextual query mentioning the specific archived project
      const contextPrompt = `[Context: Archived Project "${title}"] Question: ${query}`;
      const response = await sendChatMessage({
        message: contextPrompt,
        session_id: sessionId,
      });

      const data = response.data;
      setSessionId(data.session_id);
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${data.assistant_message_id || Date.now()}`,
          role: "assistant",
          content: data.answer,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "Sorry, I couldn't reach the AI assistant. Please try again in a moment.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSendMessage();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl transition-all">
        {/* Header */}
        <header className="border-b border-[#e4ebe8] bg-[#fbfdfc] px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#e5f8f4] px-3 py-1 text-xs font-semibold text-[#0b6b61]">
                  <GraduationCap className="size-3.5" /> Archived Project
                </span>
                {scorePercent !== null && (
                  <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${getScoreBadgeColor(scorePercent)}`}>
                    <Sparkles className="size-3.5" /> {scorePercent}% Similarity Match
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold leading-tight text-[#17201d]">{title}</h2>
              <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-[#64736f]">
                <span className="flex items-center gap-1">
                  <Building2 className="size-3.5" /> {department}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="size-3.5" /> {year}
                </span>
                <span className="flex items-center gap-1">
                  <User className="size-3.5" /> {supervisor}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="grid size-9 place-items-center rounded-2xl bg-[#f0f4f2] text-[#64736f] transition hover:bg-[#e1e8e5] hover:text-[#17201d]"
              aria-label="Close modal"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-5 flex gap-2 border-t border-[#edf2ef] pt-4">
            <button
              onClick={() => setActiveTab("details")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === "details"
                  ? "bg-[#15c7a8] text-white shadow-sm"
                  : "bg-[#f4f7f5] text-[#52625d] hover:bg-[#e7eeeb]"
              }`}
            >
              <FileText className="size-4" /> Overview & Details
            </button>
            <button
              onClick={() => setActiveTab("tech")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === "tech"
                  ? "bg-[#15c7a8] text-white shadow-sm"
                  : "bg-[#f4f7f5] text-[#52625d] hover:bg-[#e7eeeb]"
              }`}
            >
              <Cpu className="size-4" /> Tech Stack & Scope
            </button>
            <button
              onClick={() => setActiveTab("gap")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === "gap"
                  ? "bg-[#15c7a8] text-white shadow-sm"
                  : "bg-[#f4f7f5] text-[#52625d] hover:bg-[#e7eeeb]"
              }`}
            >
              <Lightbulb className="size-4" /> Research Gap
            </button>
            <button
              onClick={() => setActiveTab("chatbot")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === "chatbot"
                  ? "bg-[#0b6b61] text-white shadow-sm"
                  : "bg-[#e5f8f4] text-[#0b6b61] hover:bg-[#d4f3ec]"
              }`}
            >
              <Bot className="size-4" /> Ask Project Chatbot
            </button>
          </div>
        </header>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 text-sm text-[#17201d]">
          {activeTab === "details" && (
            <div className="space-y-6">
              <div>
                <h3 className="flex items-center gap-2 text-sm font-bold text-[#0b6b61]">
                  <BookOpen className="size-4" /> Abstract & Summary
                </h3>
                <p className="mt-2 rounded-2xl bg-[#f8faf9] p-4 leading-relaxed text-[#43524d] shadow-inner">
                  {abstract}
                </p>
              </div>

              {problemStatement && (
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-bold text-[#0b6b61]">
                    <HelpCircle className="size-4" /> Problem Statement
                  </h3>
                  <p className="mt-2 rounded-2xl bg-[#f8faf9] p-4 leading-relaxed text-[#43524d]">
                    {problemStatement}
                  </p>
                </div>
              )}

              <div>
                <h3 className="flex items-center gap-2 text-sm font-bold text-[#0b6b61]">
                  <CheckCircle2 className="size-4" /> Key Outcomes & Features
                </h3>
                <ul className="mt-2 space-y-2">
                  {outcomes.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-[#43524d]">
                      <span className="mt-1 size-1.5 shrink-0 rounded-full bg-[#15c7a8]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === "tech" && (
            <div className="space-y-6">
              <div>
                <h3 className="flex items-center gap-2 text-sm font-bold text-[#0b6b61]">
                  <Cpu className="size-4" /> Technology Stack
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {technologies.map((tech, idx) => (
                    <span
                      key={idx}
                      className="rounded-xl bg-[#e5f8f4] px-3.5 py-1.5 text-xs font-bold text-[#0b6b61]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="flex items-center gap-2 text-sm font-bold text-[#0b6b61]">
                  <Tag className="size-4" /> Domain & Keywords
                </h3>
                <p className="mt-1 text-xs text-[#64736f]">Research Domain: <strong>{researchArea}</strong> | Difficulty: <strong>{difficulty}</strong></p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {keywords.map((kw, idx) => (
                    <span
                      key={idx}
                      className="rounded-xl bg-[#f0f4f2] px-3 py-1 text-xs font-medium text-[#52625d]"
                    >
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "gap" && (
            <div className="space-y-6">
              <div>
                <h3 className="flex items-center gap-2 text-sm font-bold text-[#b45309]">
                  <Lightbulb className="size-4" /> Research Gap & Future Scope
                </h3>
                <div className="mt-3 rounded-2xl bg-[#fffbeb] p-4 text-[#92400e] shadow-sm">
                  <p className="leading-relaxed">{gap}</p>
                </div>
              </div>

              <div className="rounded-2xl bg-[#f7faf8] p-4 border border-[#e4ebe8]">
                <h4 className="font-bold text-[#17201d]">How to build upon this project:</h4>
                <p className="mt-1 text-xs leading-relaxed text-[#52625d]">
                  You can leverage this archived project as a baseline by extending its feature set, applying newer frameworks, addressing its noted limitations, or testing in a different operational context.
                </p>
              </div>
            </div>
          )}

          {activeTab === "chatbot" && (
            <div className="flex h-[24rem] flex-col overflow-hidden rounded-2xl border border-[#e4ebe8] bg-[#fcfdfe]">
              {/* Chat messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${
                      msg.role === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <div
                      className={`grid size-7 shrink-0 place-items-center rounded-xl text-xs font-bold ${
                        msg.role === "user"
                          ? "bg-[#17201d] text-white"
                          : "bg-[#15c7a8] text-[#071817]"
                      }`}
                    >
                      {msg.role === "user" ? "You" : <Bot className="size-4" />}
                    </div>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                        msg.role === "user"
                          ? "bg-[#17201d] text-white"
                          : "bg-white border border-[#e4ebe8] text-[#17201d] shadow-sm p-3"
                      }`}
                    >
                      {msg.role === "user" ? (
                        msg.content
                      ) : (
                        <ChatMarkdownRenderer content={msg.content} sources={msg.sources} />
                      )}
                    </div>
                  </div>
                ))}
                {isSending && (
                  <div className="flex items-center gap-2 text-xs font-medium text-[#64736f]">
                    <Loader2 className="size-4 animate-spin text-[#15c7a8]" />
                    AI Assistant is thinking...
                  </div>
                )}
              </div>

              {/* Starter prompts */}
              <div className="border-t border-[#edf2ef] bg-white p-2">
                <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#64736f]">
                  Suggested Questions:
                </p>
                <div className="flex flex-wrap gap-1.5 px-2 pb-2">
                  {starterPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(prompt)}
                      disabled={isSending}
                      className="rounded-lg bg-[#f0f7f5] px-2.5 py-1 text-[11px] font-medium text-[#0b6b61] transition hover:bg-[#d9f2ed] disabled:opacity-50"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                {/* Input box */}
                <form onSubmit={handleFormSubmit} className="flex gap-2 p-2 border-t border-[#edf2ef]">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={`Ask about "${title.slice(0, 30)}..."`}
                    disabled={isSending}
                    className="flex-1 rounded-xl bg-[#f5f8f7] px-3.5 py-2 text-xs outline-none ring-1 ring-[#d7e2dd] transition focus:ring-2 focus:ring-[#15c7a8]/40 disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isSending}
                    className="flex items-center justify-center rounded-xl bg-[#0b6b61] px-4 text-white transition hover:bg-[#08534b] disabled:opacity-50"
                  >
                    <Send className="size-3.5" />
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between border-t border-[#e4ebe8] bg-[#fbfdfc] px-6 py-4">
          <p className="text-xs text-[#64736f]">
            Viewing record ID: <code className="rounded bg-[#f0f4f2] px-1.5 py-0.5">{project.archived_project_id || "project_archive"}</code>
          </p>
          <button
            onClick={onClose}
            className="rounded-xl bg-[#17201d] px-5 py-2 text-xs font-semibold text-white transition hover:bg-[#2c3d35]"
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  );
}
