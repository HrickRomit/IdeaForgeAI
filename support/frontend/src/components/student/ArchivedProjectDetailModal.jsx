import { useState, useMemo, useEffect } from "react";
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
  Users,
  Target,
  ShieldAlert,
  Terminal,
} from "lucide-react";
import { sendChatMessage } from "../../api/chatApi";
import { getArchivedProjectById } from "../../api/projectsApi";
import ChatMarkdownRenderer from "../common/ChatMarkdownRenderer.jsx";

export default function ArchivedProjectDetailModal({ project, similarityScore, onClose }) {
  const [activeTab, setActiveTab] = useState("details"); // 'details' | 'tech' | 'gap' | 'chatbot'
  const [detailedProject, setDetailedProject] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [isSending, setIsSending] = useState(false);

  // Fetch complete project details from backend if project ID is available
  useEffect(() => {
    if (!project) return;
    const targetId =
      project.project_id ||
      project.id ||
      project.archived_project_id ||
      project.metadata?.project_id;

    if (!targetId) return;

    let isMounted = true;
    setIsLoadingDetails(true);

    getArchivedProjectById(targetId)
      .then((data) => {
        if (isMounted && data) {
          setDetailedProject(data);
        }
      })
      .catch((err) => {
        console.warn("Could not fetch complete project details from backend", err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingDetails(false);
      });

    return () => {
      isMounted = false;
    };
  }, [project]);

  if (!project) return null;

  // Unified data access with fallback hierarchy
  const raw = detailedProject || project;
  const rawData = raw.raw_data || raw._normalized?.raw_data || raw;
  const metadata = project.metadata || raw.metadata || {};
  const basicInfo = rawData.basic_information || raw.basic_information || {};
  const academicInfo = rawData.academic_information || raw.academic_information || {};

  const recordId =
    rawData.project_id ||
    raw.project_id ||
    raw.id ||
    project.archived_project_id ||
    project.id ||
    "project_archive";

  const title =
    basicInfo.title ||
    raw.title ||
    metadata.title ||
    project.title ||
    "Archived Project";

  const abstract =
    rawData.abstract ||
    raw.abstract ||
    basicInfo.summary ||
    raw.summary ||
    metadata.abstract ||
    project.document_snippet ||
    project.abstract ||
    "No abstract available.";

  const problemStatement =
    rawData.problem_statement ||
    raw.problem_statement ||
    metadata.problem_statement ||
    metadata.problem ||
    project.problem_statement ||
    "No problem statement recorded.";

  const department =
    academicInfo.department ||
    raw.department ||
    metadata.department ||
    metadata.faculty ||
    project.department ||
    "Computer Science and Engineering";

  const year =
    academicInfo.academic_year ||
    raw.academic_year ||
    raw.year ||
    metadata.academic_year ||
    metadata.year ||
    project.year ||
    "2025-2026";

  const supervisor = (() => {
    const s = academicInfo.supervisor || raw.supervisor || metadata.supervisor || project.supervisor;
    if (typeof s === "object" && s !== null) return s.name || "Faculty Advisor";
    return s || "Faculty Advisor";
  })();

  const difficulty = (() => {
    const d = rawData.difficulty || raw.difficulty || metadata.difficulty || project.difficulty;
    if (typeof d === "object" && d !== null) return d.level ? String(d.level).toUpperCase() : "INTERMEDIATE";
    return d ? String(d).toUpperCase() : "INTERMEDIATE";
  })();

  const difficultyScore =
    rawData.difficulty?.score ||
    raw.difficultyScore ||
    raw.difficulty_score ||
    project.difficultyScore ||
    project.difficulty_score ||
    7;

  const researchArea = (() => {
    const r = rawData.research_area || raw.research_area || raw.domain || metadata.research_area || metadata.domain;
    if (typeof r === "object" && r !== null) return r.primary || "Academic Systems";
    return r || "Academic Systems";
  })();

  const authors = useMemo(() => {
    if (Array.isArray(academicInfo.authors)) return academicInfo.authors;
    if (Array.isArray(raw.authors)) return raw.authors;
    return [];
  }, [academicInfo.authors, raw.authors]);

  const objectives = useMemo(() => {
    const obj = rawData.objectives || raw.objectives;
    if (obj) {
      if (Array.isArray(obj.primary)) return obj.primary;
      if (Array.isArray(obj)) return obj;
    }
    return [];
  }, [rawData.objectives, raw.objectives]);

  const secondaryObjectives = useMemo(() => {
    const obj = rawData.objectives || raw.objectives;
    if (obj && Array.isArray(obj.secondary)) return obj.secondary;
    return [];
  }, [rawData.objectives, raw.objectives]);

  const scope = useMemo(() => {
    return rawData.scope || raw.scope || null;
  }, [rawData.scope, raw.scope]);

  const features = useMemo(() => {
    return rawData.features || raw.features || [];
  }, [rawData.features, raw.features]);

  const technologies = useMemo(() => {
    const techRaw = rawData.technologies || raw.technologies || metadata.technologies || project.technologies;
    if (Array.isArray(techRaw)) return techRaw;
    if (typeof techRaw === "object" && techRaw !== null) {
      const list = [];
      Object.values(techRaw).forEach((group) => {
        if (Array.isArray(group)) {
          group.forEach((item) => {
            if (typeof item === "string") list.push(item);
            else if (item?.name) list.push(item.name);
          });
        }
      });
      if (list.length > 0) return [...new Set(list)];
    }
    if (typeof techRaw === "string") return techRaw.split(",").map((s) => s.trim());
    return ["FastAPI", "React", "Tailwind CSS", "PostgreSQL"];
  }, [rawData.technologies, raw.technologies, metadata.technologies, project.technologies]);

  const keywords = useMemo(() => {
    const kw = rawData.keywords || raw.keywords || metadata.keywords || project.keywords;
    if (Array.isArray(kw)) return kw;
    if (typeof kw === "string") return kw.split(",").map((s) => s.trim());
    return ["archive", "project", "system"];
  }, [rawData.keywords, raw.keywords, metadata.keywords, project.keywords]);

  const outcomes = useMemo(() => {
    if (Array.isArray(rawData.expected_outcomes) && rawData.expected_outcomes.length > 0)
      return rawData.expected_outcomes;
    if (Array.isArray(raw.expected_outcomes) && raw.expected_outcomes.length > 0)
      return raw.expected_outcomes;
    if (Array.isArray(raw.outcomes) && raw.outcomes.length > 0) return raw.outcomes;
    if (Array.isArray(metadata.outcomes) && metadata.outcomes.length > 0) return metadata.outcomes;
    if (Array.isArray(project.outcomes) && project.outcomes.length > 0) return project.outcomes;
    if (objectives.length > 0) return objectives;
    return [
      "Role-based capstone tracking and evaluation",
      "Automated record cataloging and indexing",
      "High accuracy similarity and search detection",
    ];
  }, [rawData.expected_outcomes, raw.expected_outcomes, raw.outcomes, metadata.outcomes, project.outcomes, objectives]);

  const futureScopeList = useMemo(() => {
    const fs = rawData.future_scope || raw.future_scope || metadata.future_scope || raw.gap || metadata.gap || project.gap;
    if (Array.isArray(fs)) return fs;
    if (typeof fs === "string") return [fs];
    return ["Future scope includes domain-specific LLM fine-tuning, real-time collaboration, and predictive analytics."];
  }, [rawData.future_scope, raw.future_scope, metadata.future_scope, raw.gap, metadata.gap, project.gap]);

  const limitationsList = useMemo(() => {
    const lim = rawData.limitations || raw.limitations || metadata.limitations;
    if (Array.isArray(lim)) return lim;
    if (typeof lim === "string") return [lim];
    return [];
  }, [rawData.limitations, raw.limitations, metadata.limitations]);

  const scorePercent = similarityScore !== undefined && similarityScore !== null ? Math.round(similarityScore * 100) : null;

  const getScoreBadgeColor = (score) => {
    if (!score) return "bg-[#e5f8f4] text-[#0b6b61]";
    if (score < 35) return "bg-[#e5f8f4] text-[#0b6b61]";
    if (score < 65) return "bg-[#fef3c7] text-[#d97706]";
    return "bg-[#fee2e2] text-[#dc2626]";
  };

  useEffect(() => {
    if (title && (messages.length === 0 || messages[0]?.id === "welcome")) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: `Hello! I am your AI assistant for "${title}". Ask me anything about its problem statement, methodology, architecture, tech stack, or how to build upon its research gap!`,
        },
      ]);
    }
  }, [title]);

  const starterPrompts = [
    `How does my proposal differ from "${title.slice(0, 25)}..."?`,
    `What tech stack and architecture were used here?`,
    `What are the main research gaps & future scope?`,
    `Summarize the key problem and objectives.`,
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
      const contextPrompt = `[Context: Archived Project "${title}" | Problem: "${problemStatement.slice(0, 300)}" | Tech: ${technologies.slice(0, 6).join(", ")}] Question: ${query}`;
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
          content: "Sorry, I couldn't reach the AI assistant. Please make sure the backend server is running.",
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl transition-all">
        {/* Header */}
        <header className="border-b border-[#e4ebe8] bg-[#fbfdfc] px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#e5f8f4] px-3 py-1 text-xs font-bold text-[#0b6b61]">
                  <GraduationCap className="size-3.5" /> Archived Project
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#f1f5f3] px-2.5 py-0.5 text-xs font-semibold text-[#52625d]">
                  {difficulty} ({difficultyScore}/10)
                </span>
                {scorePercent !== null && (
                  <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${getScoreBadgeColor(scorePercent)}`}>
                    <Sparkles className="size-3.5" /> {scorePercent}% Similarity Match
                  </span>
                )}
                {isLoadingDetails && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0b6b61]">
                    <Loader2 className="size-3 animate-spin" /> Syncing full JSON...
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold leading-tight text-[#17201d] truncate">
                {title}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-[#64736f]">
                <span className="flex items-center gap-1">
                  <Building2 className="size-3.5 text-[#0b6b61]" /> {department}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="size-3.5 text-[#0b6b61]" /> {year}
                </span>
                <span className="flex items-center gap-1">
                  <User className="size-3.5 text-[#0b6b61]" /> Supervisor: {supervisor}
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
          <div className="mt-5 flex flex-wrap gap-2 border-t border-[#edf2ef] pt-4">
            <button
              onClick={() => setActiveTab("details")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === "details"
                  ? "bg-[#15c7a8] text-[#071817] shadow-sm font-extrabold"
                  : "bg-[#f4f7f5] text-[#52625d] hover:bg-[#e7eeeb]"
              }`}
            >
              <FileText className="size-4" /> Overview & Details
            </button>
            <button
              onClick={() => setActiveTab("tech")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === "tech"
                  ? "bg-[#15c7a8] text-[#071817] shadow-sm font-extrabold"
                  : "bg-[#f4f7f5] text-[#52625d] hover:bg-[#e7eeeb]"
              }`}
            >
              <Cpu className="size-4" /> Tech Stack & Scope
            </button>
            <button
              onClick={() => setActiveTab("gap")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === "gap"
                  ? "bg-[#15c7a8] text-[#071817] shadow-sm font-extrabold"
                  : "bg-[#f4f7f5] text-[#52625d] hover:bg-[#e7eeeb]"
              }`}
            >
              <Lightbulb className="size-4" /> Research Gap & Scope
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
          {/* TAB 1: OVERVIEW & DETAILS */}
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

              {objectives.length > 0 && (
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-bold text-[#0b6b61]">
                    <Target className="size-4" /> Project Objectives
                  </h3>
                  <div className="mt-2 space-y-2">
                    {objectives.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-[#43524d]">
                        <CheckCircle2 className="size-4 shrink-0 text-[#15c7a8] mt-0.5" />
                        <span className="leading-snug">{item}</span>
                      </div>
                    ))}
                    {secondaryObjectives.map((item, idx) => (
                      <div key={`sec-${idx}`} className="flex items-start gap-2.5 text-[#64736f]">
                        <span className="mt-1 size-1.5 shrink-0 rounded-full bg-[#94a3b8]" />
                        <span className="leading-snug">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="flex items-center gap-2 text-sm font-bold text-[#0b6b61]">
                  <CheckCircle2 className="size-4" /> Key Expected Outcomes & Deliverables
                </h3>
                <ul className="mt-2 space-y-2">
                  {outcomes.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-[#43524d]">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#15c7a8]" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {authors.length > 0 && (
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-bold text-[#0b6b61]">
                    <Users className="size-4" /> Project Authors & Team
                  </h3>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                    {authors.map((author, idx) => (
                      <div key={idx} className="rounded-xl border border-[#e4ebe8] bg-[#fcfdfe] p-3 text-xs">
                        <p className="font-bold text-[#17201d]">{author.name || "Student Author"}</p>
                        <p className="text-[#64736f]">{author.role || author.student_id || author.email}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TECH STACK & SCOPE */}
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

              {scope && (
                <div className="grid gap-4 md:grid-cols-2">
                  {Array.isArray(scope.included) && scope.included.length > 0 && (
                    <div className="rounded-2xl bg-[#f7faf8] p-4 border border-[#e4ebe8]">
                      <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#0b6b61]">
                        <CheckCircle2 className="size-3.5 text-[#15c7a8]" /> In Scope (Included)
                      </h4>
                      <ul className="mt-2.5 space-y-1.5 text-xs text-[#52625d]">
                        {scope.included.map((inc, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="mt-1 size-1 shrink-0 rounded-full bg-[#15c7a8]" />
                            <span>{inc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {Array.isArray(scope.excluded) && scope.excluded.length > 0 && (
                    <div className="rounded-2xl bg-[#fff7f7] p-4 border border-[#fee2e2]">
                      <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#b91c1c]">
                        <ShieldAlert className="size-3.5 text-[#ef4444]" /> Out of Scope (Excluded)
                      </h4>
                      <ul className="mt-2.5 space-y-1.5 text-xs text-[#7f1d1d]">
                        {scope.excluded.map((exc, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="mt-1 size-1 shrink-0 rounded-full bg-[#ef4444]" />
                            <span>{exc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {features.length > 0 && (
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-bold text-[#0b6b61]">
                    <Layers className="size-4" /> Core System Features
                  </h3>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {features.map((feat, idx) => (
                      <div key={idx} className="rounded-xl border border-[#e4ebe8] bg-[#f8faf9] p-3 text-xs">
                        <p className="font-bold text-[#17201d]">{feat.name}</p>
                        <p className="mt-1 text-[#52625d] leading-relaxed">{feat.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="flex items-center gap-2 text-sm font-bold text-[#0b6b61]">
                  <Tag className="size-4" /> Research Domain & Keywords
                </h3>
                <p className="mt-1 text-xs text-[#64736f]">
                  Research Domain: <strong>{researchArea}</strong> | Complexity: <strong>{difficulty}</strong>
                </p>
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

          {/* TAB 3: RESEARCH GAP */}
          {activeTab === "gap" && (
            <div className="space-y-6">
              <div>
                <h3 className="flex items-center gap-2 text-sm font-bold text-[#b45309]">
                  <Lightbulb className="size-4" /> Identified Research Gap & Future Scope
                </h3>
                <div className="mt-3 space-y-2.5">
                  {futureScopeList.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 rounded-2xl bg-[#fffbeb] p-4 text-xs leading-relaxed text-[#92400e] border border-[#fef3c7]">
                      <Lightbulb className="mt-0.5 size-4 shrink-0 text-[#d97706]" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {limitationsList.length > 0 && (
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-bold text-[#b91c1c]">
                    <ShieldAlert className="size-4" /> Noted Prototype Limitations
                  </h3>
                  <ul className="mt-3 space-y-2 text-xs text-[#64736f]">
                    {limitationsList.map((lim, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="mt-1 size-1.5 shrink-0 rounded-full bg-[#ef4444]" />
                        <span>{lim}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="rounded-2xl bg-[#f7faf8] p-4 border border-[#e4ebe8]">
                <h4 className="font-bold text-[#17201d]">How to make your proposal stand out:</h4>
                <p className="mt-1 text-xs leading-relaxed text-[#52625d]">
                  Use the limitations and future scope items above as your primary project motivation. By addressing unsolved bottlenecks in this archive record, your proposal achieves originality and clear academic justification.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: CHATBOT */}
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
                    AI Assistant is analyzing...
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
            Viewing record ID: <code className="rounded bg-[#f0f4f2] px-1.5 py-0.5">{recordId}</code>
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

