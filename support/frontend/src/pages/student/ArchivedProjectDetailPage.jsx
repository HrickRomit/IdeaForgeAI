import { useState, useMemo, useEffect } from "react";
import {
  ArrowLeft,
  Bot,
  Send,
  Loader2,
  BookOpen,
  Sparkles,
  Cpu,
  CheckCircle2,
  FileText,
  Lightbulb,
  Tag,
  GraduationCap,
  User,
  Calendar,
  Building2,
  HelpCircle,
  MessageSquareText,
  Layers3,
  Search,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { sendChatMessage } from "../../api/chatApi";
import { getArchivedProjectById } from "../../api/projectsApi";
import ChatMarkdownRenderer from "../../components/common/ChatMarkdownRenderer";
import StudentNavbar from "../../components/student/StudentNavbar.jsx";

const defaultArchivedProjects = {

  project_0001: {
    title: "Smart Campus Complaint and Maintenance Tracking System",
    abstract:
      "A web platform for reporting campus facility issues, assigning them to maintenance teams, and tracking resolution progress with dashboards.",
    problem_statement:
      "University facility maintenance is often handled through informal phone calls, paper registers, or scattered messaging channels, which makes issue tracking slow and difficult to audit.",
    department: "Computer Science & Engineering",
    academic_year: "2025-2026",
    supervisor: "Dr. Farhana Karim",
    difficulty: "Intermediate",
    research_area: "Information Systems",
    technologies: ["FastAPI", "React", "Tailwind CSS", "SQLAlchemy", "PostgreSQL"],
    keywords: ["campus maintenance", "complaint management", "facility dashboard", "admin workflow"],
    outcomes: [
      "Role-based complaint reporting and tracking",
      "Assignment workflow for maintenance teams",
      "Analytics for categories, locations, overdue cases, and response time",
    ],
    gap: "The archive notes future scope for AI-based duplicate detection, priority recommendation, predictive analytics, and mobile reporting.",
  },
  project_0002: {
    title: "AI Medical Imaging Classification & Diagnostic Assistance",
    abstract:
      "A deep learning framework for classifying medical images (X-rays and MRIs) to assist radiologists in early anomaly detection.",
    problem_statement:
      "Radiologists face overwhelming caseloads leading to diagnostic delays and cognitive fatigue in identifying subtle anomalies in medical scans.",
    department: "Bioinformatics & CSE",
    academic_year: "2024-2025",
    supervisor: "Dr. Alan Turing",
    difficulty: "Advanced",
    research_area: "Artificial Intelligence in Medicine",
    technologies: ["PyTorch", "Python", "React", "FastAPI", "PostgreSQL", "Docker"],
    keywords: ["deep learning", "medical imaging", "computer vision", "CNN", "healthcare"],
    outcomes: [
      "CNN-based multi-class scan classification with >92% accuracy",
      "Explainable heatmaps overlaid on medical images",
      "Web dashboard for clinicians and diagnostic logs",
    ],
    gap: "Requires expansion to 3D CT scan analysis, hospital PACS system integration, and federated learning for privacy.",
  },
  project_0003: {
    title: "Student Research Helper and Idea Feasibility Assistant",
    abstract:
      "A guided assistant for refining student project ideas into problem statements, objectives, and feasible implementation plans.",
    problem_statement:
      "Students often struggle to formulate original capstone ideas and align them with departmental feasibility standards.",
    department: "Computer Science & Engineering",
    academic_year: "2025-2026",
    supervisor: "Software Engineering Lab",
    difficulty: "Intermediate",
    research_area: "Learning Support Systems",
    technologies: ["React", "Python", "LLM API", "ChromaDB", "PostgreSQL"],
    keywords: ["idea generation", "proposal drafting", "technology recommendation", "student support"],
    outcomes: [
      "Structured proposal drafting guidance",
      "Technology stack suggestions based on domain",
      "Feasibility feedback and complexity evaluation",
    ],
    gap: "Needs deeper integration with live university project repositories to provide citation-backed literature reviews.",
  },
};

const panelClass = "rounded-2xl bg-white p-6 shadow-[0_6px_20px_rgba(23,32,29,0.08)]";
const iconTileClass = "grid size-11 place-items-center rounded-2xl bg-[#e5f8f4] text-[#0b6b61]";

export default function ArchivedProjectDetailPage() {
  const [projectData, setProjectData] = useState(null);
  const [similarityScore, setSimilarityScore] = useState(null);
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'overview' | 'tech' | 'gap'

  const [studentProposal, setStudentProposal] = useState(null);
  const [showPrompts, setShowPrompts] = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    // 1. Try loading archived project from sessionStorage
    const storedStr = sessionStorage.getItem("selected_archived_project");
    let storedObj = null;
    if (storedStr) {
      try {
        storedObj = JSON.parse(storedStr);
      } catch (e) {
        console.error("Failed to parse stored project", e);
      }
    }

    // 2. Try loading student proposal draft from sessionStorage
    const storedDraftStr = sessionStorage.getItem("student_proposal_draft");
    if (storedDraftStr) {
      try {
        setStudentProposal(JSON.parse(storedDraftStr));
      } catch (e) {
        console.error("Failed to parse stored proposal draft", e);
      }
    }

    // 3. Read query params
    const searchParams = new URLSearchParams(window.location.search);
    const projectId = searchParams.get("id") || storedObj?.archived_project_id || storedObj?.id || "project_0001";
    const simParam = searchParams.get("similarity");

    if (simParam) {
      setSimilarityScore(parseInt(simParam, 10));
    } else if (storedObj?.similarity_score !== undefined) {
      setSimilarityScore(Math.round(storedObj.similarity_score * 100));
    } else {
      setSimilarityScore(66);
    }

    // 4. Initial fallback or merge project metadata
    const fallback = defaultArchivedProjects[projectId] || defaultArchivedProjects["project_0001"];

    if (storedObj) {
      const meta = storedObj.metadata || storedObj;
      setProjectData({
        archived_project_id: projectId,
        title: storedObj.title || meta.title || fallback.title,
        abstract: meta.abstract || storedObj.document_snippet || fallback.abstract,
        problem_statement: meta.problem_statement || meta.problem || fallback.problem_statement,
        department: meta.department || meta.faculty || fallback.department,
        academic_year: meta.academic_year || meta.year || fallback.academic_year,
        supervisor: meta.supervisor || fallback.supervisor,
        difficulty: meta.difficulty || fallback.difficulty,
        research_area: meta.research_area || meta.domain || fallback.research_area,
        technologies: meta.technologies || fallback.technologies,
        keywords: meta.keywords || fallback.keywords,
        outcomes: meta.outcomes || fallback.outcomes,
        gap: meta.gap || meta.future_scope || fallback.gap,
      });
    } else {
      setProjectData({
        archived_project_id: projectId,
        ...fallback,
      });
    }

    // 5. Fetch complete rich project.json from backend API
    getArchivedProjectById(projectId)
      .then((data) => {
        if (!data) return;
        const norm = data._normalized || {};
        const basic = data.basic_information || {};
        const academic = data.academic_information || {};
        const diff = data.difficulty || {};
        const resArea = data.research_area || {};

        let techList = [];
        if (Array.isArray(norm.technologies)) techList = norm.technologies;
        else if (data.technologies && typeof data.technologies === "object") {
          Object.values(data.technologies).forEach((group) => {
            if (Array.isArray(group)) {
              group.forEach((item) => {
                if (typeof item === "string") techList.push(item);
                else if (item?.name) techList.push(item.name);
              });
            }
          });
        }

        setProjectData({
          archived_project_id: data.project_id || projectId,
          title: basic.title || data.title || norm.title || fallback.title,
          abstract: data.abstract || basic.summary || norm.abstract || fallback.abstract,
          problem_statement: data.problem_statement || norm.problem_statement || fallback.problem_statement,
          department: academic.department || norm.department || fallback.department,
          academic_year: academic.academic_year || norm.year || fallback.academic_year,
          supervisor: (typeof academic.supervisor === "object" ? academic.supervisor?.name : academic.supervisor) || norm.supervisor || fallback.supervisor,
          difficulty: (typeof diff === "object" ? diff.level : diff) || norm.difficulty || fallback.difficulty,
          difficultyScore: (typeof diff === "object" ? diff.score : diff) || norm.difficultyScore || 7,
          research_area: (typeof resArea === "object" ? resArea.primary : resArea) || norm.domain || fallback.research_area,
          technologies: techList.length > 0 ? [...new Set(techList)] : fallback.technologies,
          keywords: data.keywords || norm.keywords || fallback.keywords,
          outcomes: data.expected_outcomes || norm.outcomes || fallback.outcomes,
          gap: Array.isArray(data.future_scope) ? data.future_scope.join(" ") : data.future_scope || norm.gap || fallback.gap,
          future_scope: data.future_scope || fallback.gap,
          limitations: data.limitations || [],
          scope: data.scope || null,
          features: data.features || [],
          modules: data.modules || [],
          authors: academic.authors || [],
        });
      })
      .catch((err) => {
        console.warn("Could not load rich project from backend API, using cached data", err);
      });
  }, []);

  const title = projectData?.title || "Archived Project";

  useEffect(() => {
    if (projectData?.title && (messages.length === 0 || messages[0]?.id === "welcome")) {
      const proposalText = studentProposal?.title ? ` regarding your proposal idea "${studentProposal.title}"` : "";
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: `Hi! I am your AI assistant${proposalText}. Ask me how your idea compares with "${title}", what technologies were used, or what research gaps you can explore!`,
        },
      ]);
    }
  }, [projectData?.title, studentProposal]);

  const technologies = useMemo(() => {
    if (!projectData) return [];
    if (Array.isArray(projectData.technologies)) return projectData.technologies;
    if (typeof projectData.technologies === "string")
      return projectData.technologies.split(",").map((s) => s.trim());
    return ["FastAPI", "React", "Python", "PostgreSQL"];
  }, [projectData]);

  const keywords = useMemo(() => {
    if (!projectData) return [];
    if (Array.isArray(projectData.keywords)) return projectData.keywords;
    if (typeof projectData.keywords === "string")
      return projectData.keywords.split(",").map((s) => s.trim());
    return ["semantic search", "archive", "project assistant"];
  }, [projectData]);

  const outcomes = useMemo(() => {
    if (!projectData) return [];
    if (Array.isArray(projectData.outcomes)) return projectData.outcomes;
    return [
      "Automated record cataloging and indexing",
      "Role-based workflow for faculty and students",
      "High accuracy similarity and search detection",
    ];
  }, [projectData]);

  const starterPrompts = [
    `Make my proposal idea unique & different from this project`,
    `How does my proposal compare with "${title}"?`,
    `What open research gaps from this project can I solve?`,
    `What tech stack or domain shift would lower my similarity score?`,
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
      let contextPrompt = `[Context: Archived Project "${title}"]`;
      if (studentProposal?.title) {
        contextPrompt += ` [Context: Student Proposal Idea - Title: "${studentProposal.title}", Abstract: "${studentProposal.abstract || ""}", Problem: "${studentProposal.problem || ""}"]`;
      }
      contextPrompt += ` Question: ${query}`;

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
          sources: data.sources || [],
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

  const getScoreBadgeColor = (score) => {
    if (score === null || score === undefined) return "bg-[#e5f8f4] text-[#0b6b61]";
    if (score < 35) return "bg-[#e5f8f4] text-[#0b6b61]";
    if (score < 65) return "bg-[#fef3c7] text-[#d97706]";
    return "bg-[#fee2e2] text-[#dc2626]";
  };

  if (!projectData) {
    return (
      <main className="flex h-screen items-center justify-center bg-[#f6f8f7]">
        <Loader2 className="size-8 animate-spin text-[#15c7a8]" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f8f7] text-[#17201d]">
      <StudentNavbar activeTab="archive" />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {/* Top Header & Breadcrumb */}
        <header className="flex flex-col gap-4 pb-2">
          <button
            type="button"
            onClick={() => {
              if (window.history.length > 1) {
                window.history.back();
              } else {
                window.location.assign("/student?tab=submit");
              }
            }}
            className="inline-flex items-center gap-2 w-fit text-sm font-bold text-[#0b6b61] hover:underline"
          >
            <ArrowLeft className="size-4" />
            Back to Comparison / Proposal
          </button>


          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#e5f8f4] px-3 py-1 text-xs font-semibold text-[#0b6b61]">
              <GraduationCap className="size-3.5" /> Archived Project Record
            </span>
            {similarityScore !== null && (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${getScoreBadgeColor(
                  similarityScore
                )}`}
              >
                <Sparkles className="size-3.5" /> {similarityScore}% Similarity Match
              </span>
            )}
          </div>

          <h1 className="text-2xl font-bold tracking-normal sm:text-3xl text-[#17201d] leading-tight">
            {projectData.title}
          </h1>

          <div className="flex flex-wrap items-center gap-5 text-xs font-medium text-[#64736f]">
            <span className="flex items-center gap-1.5">
              <Building2 className="size-4 text-[#0b6b61]" /> {projectData.department}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="size-4 text-[#0b6b61]" /> Academic Year {projectData.academic_year}
            </span>
            <span className="flex items-center gap-1.5">
              <User className="size-4 text-[#0b6b61]" /> Advisor: {projectData.supervisor}
            </span>
            <span className="flex items-center gap-1.5">
              <Layers3 className="size-4 text-[#0b6b61]" /> Domain: {projectData.research_area}
            </span>
          </div>
        </header>

        {/* Main 2-Column Content Grid */}
        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          {/* Left Column: Comprehensive Project Documentation */}
          <div className="space-y-6">
            {/* Abstract Section */}
            <article className={panelClass}>
              <div className="flex items-center gap-3">
                <span className={iconTileClass}>
                  <BookOpen className="size-5" />
                </span>
                <div>
                  <h2 className="text-lg font-bold">Abstract & Summary</h2>
                  <p className="text-sm text-[#64736f]">Project overview and problem scope.</p>
                </div>
              </div>
              <p className="mt-5 rounded-2xl bg-[#f8faf9] p-5 leading-relaxed text-[#3d4c47] text-sm">
                {projectData.abstract}
              </p>
            </article>

            {/* Problem Statement */}
            {projectData.problem_statement && (
              <article className={panelClass}>
                <div className="flex items-center gap-3">
                  <span className={iconTileClass}>
                    <HelpCircle className="size-5" />
                  </span>
                  <div>
                    <h2 className="text-lg font-bold">Problem Statement</h2>
                    <p className="text-sm text-[#64736f]">Core motivation behind the research.</p>
                  </div>
                </div>
                <p className="mt-5 rounded-2xl bg-[#f8faf9] p-5 leading-relaxed text-[#3d4c47] text-sm">
                  {projectData.problem_statement}
                </p>
              </article>
            )}

            {/* Outcomes & Features */}
            <article className={panelClass}>
              <div className="flex items-center gap-3">
                <span className={iconTileClass}>
                  <CheckCircle2 className="size-5" />
                </span>
                <div>
                  <h2 className="text-lg font-bold">Key Outcomes & Deliverables</h2>
                  <p className="text-sm text-[#64736f]">Implemented features and project outputs.</p>
                </div>
              </div>
              <ul className="mt-5 space-y-3">
                {outcomes.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-[#3d4c47]">
                    <span className="mt-1.5 size-2 shrink-0 rounded-full bg-[#15c7a8]" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </article>

            {/* Tech Stack & Keywords */}
            <article className={panelClass}>
              <div className="flex items-center gap-3">
                <span className={iconTileClass}>
                  <Cpu className="size-5" />
                </span>
                <div>
                  <h2 className="text-lg font-bold">Technology Stack & Keywords</h2>
                  <p className="text-sm text-[#64736f]">Frameworks, tools, and topics.</p>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#64736f]">
                    Technologies Used
                  </h3>
                  <div className="mt-2.5 flex flex-wrap gap-2">
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
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#64736f]">
                    Keywords
                  </h3>
                  <div className="mt-2.5 flex flex-wrap gap-2">
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
            </article>

            {/* Research Gap & Future Scope */}
            <article className={panelClass}>
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-2xl bg-[#fef3c7] text-[#b45309]">
                  <Lightbulb className="size-5" />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-[#92400e]">Research Gap & Future Scope</h2>
                  <p className="text-sm text-[#b45309]">How to extend or differentiate from this work.</p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-[#fffbeb] p-5 text-sm leading-relaxed text-[#92400e]">
                {projectData.gap}
              </div>
            </article>
          </div>

          {/* Right Column: Interactive AI Project Chatbot */}
          <aside className="space-y-6">
            <article className="sticky top-6 flex h-[38rem] flex-col overflow-hidden rounded-3xl bg-white shadow-[0_6px_20px_rgba(23,32,29,0.08)] border border-[#e4ebe8]">
              {/* Chatbot Header */}
              <header className="flex items-center justify-between border-b border-[#e4ebe8] bg-[#17201d] px-5 py-4 text-white">
                <div className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-xl bg-[#15c7a8] text-[#071817]">
                    <Bot className="size-5" />
                  </span>
                  <div>
                    <h2 className="text-sm font-bold">Ask Project Chatbot</h2>
                    <p className="text-[11px] text-[#a3b8b0]">AI assistant for this project</p>
                  </div>
                </div>
              </header>

              {/* Chat Messages Container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#fcfdfe]">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col gap-1.5 ${msg.role === "user" ? "items-end" : "items-start"
                      }`}
                  >
                    {/* Role Badge */}
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#64736f] px-1">
                      {msg.role === "user" ? (
                        <>
                          <span>You</span>
                          <span className="grid size-4 place-items-center rounded-full bg-[#17201d] text-white text-[9px]">
                            👤
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="grid size-4 place-items-center rounded-full bg-[#15c7a8] text-[#071817]">
                            🤖
                          </span>
                          <span className="font-bold text-[#0b6b61]">IdeaForge AI</span>
                          <span className="size-1.5 rounded-full bg-[#15c7a8] animate-pulse" />
                        </>
                      )}
                    </div>

                    {/* Message Bubble Body */}
                    <div
                      className={`max-w-[92%] rounded-2xl p-4 text-xs shadow-xs transition-all ${msg.role === "user"
                          ? "bg-[#17201d] text-white rounded-tr-xs"
                          : "bg-white border border-[#e4ebe8] text-[#17201d] rounded-tl-xs"
                        }`}
                    >
                      {msg.role === "user" ? (
                        <p className="leading-relaxed font-medium">{msg.content}</p>
                      ) : (
                        <>
                          <ChatMarkdownRenderer content={msg.content} />

                          {/* Retrieved Sources Card */}
                          {msg.sources && msg.sources.length > 0 && (
                            <div className="mt-3.5 border-t border-[#edf2ef] pt-3">
                              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#0b6b61]">
                                <BookOpen className="size-3" /> Retrieved Sources ({msg.sources.length})
                              </p>
                              <div className="mt-2 space-y-1.5">
                                {msg.sources.map((src, i) => (
                                  <div
                                    key={i}
                                    className="flex items-center justify-between gap-2 rounded-xl bg-[#f5f9f7] px-3 py-2 text-[11px] text-[#17201d] border border-[#e2eae6]"
                                  >
                                    <span className="font-semibold text-[#0b6b61] truncate">{src.title}</span>
                                    <span className="shrink-0 text-[9px] font-bold text-[#64736f] bg-white px-2 py-0.5 rounded-md border border-[#d9e3df]">
                                      Source #{i + 1}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}

                {/* Typing / Streaming Loading State */}
                {isSending && (
                  <div className="flex flex-col items-start gap-1.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#64736f] px-1">
                      <span className="grid size-4 place-items-center rounded-full bg-[#15c7a8] text-[#071817]">
                        🤖
                      </span>
                      <span className="font-bold text-[#0b6b61]">IdeaForge AI</span>
                    </div>
                    <div className="rounded-2xl rounded-tl-xs bg-white border border-[#e4ebe8] p-3.5 shadow-xs flex items-center gap-2 text-xs text-[#64736f]">
                      <span className="font-medium text-[#0b6b61]">Generating response</span>
                      <span className="flex items-center gap-1">
                        <span className="size-1.5 rounded-full bg-[#15c7a8] animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="size-1.5 rounded-full bg-[#15c7a8] animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="size-1.5 rounded-full bg-[#15c7a8] animate-bounce" style={{ animationDelay: "300ms" }} />
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Starter Prompt Chips */}
              <div className="border-t border-[#edf2ef] bg-[#f8faf9] p-3">
                <div className="flex items-center justify-between px-1 pb-1.5">
                  <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#64736f]">
                    <Sparkles className="size-3 text-[#15c7a8]" /> Suggested Questions
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowPrompts((prev) => !prev)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-[#0b6b61] hover:underline"
                    aria-label={showPrompts ? "Hide suggested questions" : "Show suggested questions"}
                  >
                    {showPrompts ? (
                      <>
                        <span>Hide</span>
                        <ChevronUp className="size-3.5" />
                      </>
                    ) : (
                      <>
                        <span>Show ({starterPrompts.length})</span>
                        <ChevronDown className="size-3.5" />
                      </>
                    )}
                  </button>
                </div>

                {showPrompts && (
                  <div className="flex flex-wrap gap-1.5 pb-2 transition-all duration-200">
                    {starterPrompts.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(prompt)}
                        disabled={isSending}
                        className="rounded-xl bg-white px-2.5 py-1.5 text-[11px] font-medium text-[#0b6b61] border border-[#dce6e2] transition hover:bg-[#e5f8f4] hover:border-[#15c7a8] disabled:opacity-50 text-left"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                )}

                {/* Input Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex gap-2 pt-2 border-t border-[#edf2ef]"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about this project..."
                    disabled={isSending}
                    className="flex-1 rounded-xl bg-white px-3.5 py-2.5 text-xs outline-none ring-1 ring-[#d7e2dd] transition focus:ring-2 focus:ring-[#15c7a8]/40 disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isSending}
                    className="flex items-center justify-center rounded-xl bg-[#0b6b61] px-4 text-white transition hover:bg-[#08534b] disabled:opacity-50"
                  >
                    <Send className="size-4" />
                  </button>
                </form>
              </div>
            </article>
          </aside>
        </div>
      </div>
    </main>
  );
}
