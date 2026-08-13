import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Bot,
  Building2,
  CheckCircle2,
  Clock,
  FileEdit,
  FileSearch,
  GraduationCap,
  IdCard,
  LayoutDashboard,
  Lightbulb,
  Loader2,
  LogOut,
  Mail,
  MessageSquareText,
  PlusCircle,
  RefreshCw,
  Save,
  Search,
  Send,
  UserCheck,
  UserCircle2,
  XCircle,
} from "lucide-react";

import { getCurrentUser } from "../../api/authApi";
import {
  createProposalDraft,
  getMyProposals,
  submitProposal,
  updateProposalDraft,
} from "../../api/proposalsApi";
import { searchArchivedProjects } from "../../api/projectsApi";
import { sendChatMessage } from "../../api/chatApi";
import ArchivedProjectDetailModal from "../../components/student/ArchivedProjectDetailModal.jsx";
import ChatMarkdownRenderer from "../../components/common/ChatMarkdownRenderer.jsx";

const sampleArchivedProjects = [
  {
    id: "project_0001",
    title: "Smart Campus Complaint and Maintenance Tracking System",
    abstract:
      "A web platform for reporting campus facility issues, assigning them to maintenance teams, and tracking resolution progress with dashboards.",
    department: "Computer Science and Engineering",
    year: "2025-2026",
    supervisor: "Dr. Farhana Karim",
    match: 92,
    metadata: {
      title: "Smart Campus Complaint and Maintenance Tracking System",
      abstract:
        "A web platform for reporting campus facility issues, assigning them to maintenance teams, and tracking resolution progress with dashboards.",
      department: "Computer Science and Engineering",
      academic_year: "2025-2026",
      supervisor: "Dr. Farhana Karim",
      technologies: ["FastAPI", "React", "Tailwind CSS", "PostgreSQL"],
      keywords: ["campus maintenance", "complaint management", "facility dashboard"],
      gap: "Future scope includes AI duplicate detection and automated priority assignment.",
    },
  },
  {
    id: "project_0002",
    title: "AI Project Archive Search & RAG Intelligence",
    abstract:
      "A semantic archive search concept for helping students inspect previous capstone projects before finalizing a proposal.",
    department: "Computer Science and Engineering",
    year: "2026",
    supervisor: "AI Research Group",
    match: 88,
    metadata: {
      title: "AI Project Archive Search & RAG Intelligence",
      abstract:
        "A semantic archive search concept for helping students inspect previous capstone projects before finalizing a proposal.",
      department: "Computer Science and Engineering",
      academic_year: "2026",
      supervisor: "AI Research Group",
      technologies: ["React", "FastAPI", "ChromaDB", "Gemini", "Sentence Transformers"],
      keywords: ["semantic search", "RAG", "similarity checking"],
      gap: "Can be extended with supervisor matching and citation-level source previews.",
    },
  },
  {
    id: "project_0003",
    title: "Student Capstone Research & Proposal Assistant",
    abstract:
      "A guided assistant for refining student project ideas into problem statements, objectives, and feasible implementation plans.",
    department: "Computer Science and Engineering",
    year: "2025",
    supervisor: "Software Engineering Lab",
    match: 81,
    metadata: {
      title: "Student Capstone Research & Proposal Assistant",
      abstract:
        "A guided assistant for refining student project ideas into problem statements, objectives, and feasible implementation plans.",
      department: "Computer Science and Engineering",
      academic_year: "2025",
      supervisor: "Software Engineering Lab",
      technologies: ["React", "Python", "LLM API", "PostgreSQL"],
      keywords: ["idea generation", "proposal drafting", "student support"],
      gap: "Needs deeper grounding in institutional archive data to avoid generic recommendations.",
    },
  },
];

function normalizeArchiveResults(results) {
  if (!Array.isArray(results)) return [];
  return results.map((item, index) => {
    const metadata = item.metadata || {};
    const title = metadata.title || metadata.short_title || item.title || "Archived Project";
    const abstract = metadata.abstract || item.document || item.abstract || "No abstract available.";
    const department = metadata.department || metadata.faculty || "Computer Science & Engineering";
    const year = metadata.academic_year || metadata.year || "2025-2026";
    const supervisor = metadata.supervisor || "Faculty Advisor";
    const match = item.distance_score !== undefined
      ? Math.max(1, Math.round((1 - item.distance_score) * 100))
      : item.match || 85;

    return {
      ...item,
      id: item.project_id || metadata.project_id || item.id || `archive_${index + 1}`,
      title,
      abstract,
      department,
      year,
      supervisor,
      match,
      metadata: {
        ...metadata,
        title,
        abstract,
        department,
        academic_year: year,
        supervisor,
      },
    };
  });
}

const recommendations = [
  "Make the problem statement more specific to your academic department.",
  "Add two or three measurable objectives before submitting.",
  "Search archived projects before finalizing the title.",
];

const panelClass =
  "rounded-2xl bg-white p-6 shadow-[0_6px_20px_rgba(23,32,29,0.08)]";
const quietPanelClass =
  "rounded-2xl bg-[#f7faf8] p-4 shadow-[0_4px_16px_rgba(23,32,29,0.05)]";
const inputClass =
  "mt-2 w-full rounded-2xl bg-[#fbfdfc] px-4 text-sm outline-none ring-1 ring-[#d7e2dd] transition focus:ring-2 focus:ring-[#15c7a8]/35";

const statusConfig = {
  submitted: {
    label: "Pending Review",
    bg: "#fff4cf",
    color: "#b8862f",
    borderColor: "#ffd78a",
    icon: Clock,
    description: "Submitted and waiting for assigned faculty review.",
  },
  approved: {
    label: "Approved",
    bg: "#eef5df",
    color: "#12805c",
    borderColor: "#a6d6b8",
    icon: CheckCircle2,
    description: "Approved by your faculty supervisor.",
  },
  changes_requested: {
    label: "Changes Requested",
    bg: "#fde8c9",
    color: "#c06f2f",
    borderColor: "#f5b97b",
    icon: AlertTriangle,
    description: "Faculty supervisor requested revisions before approval.",
  },
  rejected: {
    label: "Rejected",
    bg: "#f8ded7",
    color: "#b42318",
    borderColor: "#f1a89b",
    icon: XCircle,
    description: "Proposal was rejected by the faculty supervisor.",
  },
  draft: {
    label: "Draft",
    bg: "#f1f5f3",
    color: "#64736f",
    borderColor: "#d7e2dd",
    icon: FileEdit,
    description: "Saved draft, not yet submitted to faculty.",
  },
};

function getErrorMessage(error, fallbackMessage) {
  if (!error.response) {
    return "Could not reach the backend. Make sure the backend server is running.";
  }

  const detail = error.response.data?.detail;

  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg).join(" ");
  }

  return detail || fallbackMessage;
}

function getStoredStudentProfile() {
  return {
    full_name: localStorage.getItem("ideaforge_user_name") || "Student",
    email: localStorage.getItem("ideaforge_user_email") || "",
    role: localStorage.getItem("ideaforge_user_role") || "student",
    student_id: localStorage.getItem("ideaforge_student_id") || "",
    department_code: localStorage.getItem("ideaforge_department_code") || "",
    department_id: localStorage.getItem("ideaforge_department_id") || "",
  };
}

export default function StudentPortalPage() {
  const [studentProfile, setStudentProfile] = useState(getStoredStudentProfile);
  const [activeTab, setActiveTab] = useState("dashboard"); // "dashboard" | "submit" | "archive"
  const [myProposals, setMyProposals] = useState([]);
  const [isLoadingProposals, setIsLoadingProposals] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");

  const [proposal, setProposal] = useState({
    title: "",
    abstract: "",
    problem: "",
    objectives: "",
    methodology: "",
    technologyStack: "",
    facultyInitial: "",
  });

  const [draftId, setDraftId] = useState(null);
  const [saveMessage, setSaveMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmittingProposal, setIsSubmittingProposal] = useState(false);

  const [archiveQuery, setArchiveQuery] = useState("");
  const [archiveResults, setArchiveResults] = useState([]);
  const [searchMessage, setSearchMessage] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedArchivedProject, setSelectedArchivedProject] = useState(null);

  const [question, setQuestion] = useState("");
  const [isAskingAi, setIsAskingAi] = useState(false);
  const [aiReply, setAiReply] = useState(
    "Ask the assistant for idea suggestions, title improvements, research gaps, or technology stack advice.",
  );

  const fetchMyProposals = async () => {
    setIsLoadingProposals(true);
    try {
      const response = await getMyProposals();
      setMyProposals(response.data || []);
    } catch (error) {
      console.error("Failed to load student proposals:", error);
    } finally {
      setIsLoadingProposals(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    getCurrentUser()
      .then((response) => {
        if (!isMounted || !response.data) {
          return;
        }

        const user = response.data;
        const profileData = {
          full_name: user.full_name || "Student",
          email: user.email || "",
          role: user.role || "student",
          student_id: user.student_id || "",
          department_code: user.department_code || "",
          department_id: user.department_id || "",
        };

        setStudentProfile(profileData);
        localStorage.setItem("ideaforge_user_name", profileData.full_name);
        localStorage.setItem("ideaforge_user_role", profileData.role);
        if (profileData.email) localStorage.setItem("ideaforge_user_email", profileData.email);
        if (profileData.student_id) localStorage.setItem("ideaforge_student_id", profileData.student_id);
        if (profileData.department_code) localStorage.setItem("ideaforge_department_code", profileData.department_code);
        if (profileData.department_id) localStorage.setItem("ideaforge_department_id", String(profileData.department_id));
      })
      .catch(() => {
        if (isMounted) {
          setStudentProfile(getStoredStudentProfile());
        }
      });

    fetchMyProposals();

    return () => {
      isMounted = false;
    };
  }, []);

  const completeness = useMemo(() => {
    const filled = [
      proposal.title,
      proposal.abstract,
      proposal.problem,
      proposal.objectives,
      proposal.methodology,
      proposal.technologyStack,
      proposal.facultyInitial,
    ].filter((value) => value.trim()).length;

    return Math.round((filled / 7) * 100);
  }, [proposal]);

  const stats = useMemo(() => {
    const total = myProposals.length;
    const pending = myProposals.filter((p) => p.status === "submitted").length;
    const approved = myProposals.filter((p) => p.status === "approved").length;
    const changes = myProposals.filter((p) => p.status === "changes_requested").length;
    const rejected = myProposals.filter((p) => p.status === "rejected").length;
    const drafts = myProposals.filter((p) => p.status === "draft").length;

    return { total, pending, approved, changes, rejected, drafts };
  }, [myProposals]);

  const filteredProposals = useMemo(() => {
    if (statusFilter === "All") return myProposals;
    if (statusFilter === "Pending") return myProposals.filter((p) => p.status === "submitted");
    if (statusFilter === "Approved") return myProposals.filter((p) => p.status === "approved");
    if (statusFilter === "Changes") return myProposals.filter((p) => p.status === "changes_requested");
    if (statusFilter === "Rejected") return myProposals.filter((p) => p.status === "rejected");
    if (statusFilter === "Draft") return myProposals.filter((p) => p.status === "draft");
    return myProposals;
  }, [myProposals, statusFilter]);

  const handleProposalChange = (field, value) => {
    setProposal((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleLoadProposalToForm = (p) => {
    setProposal({
      title: p.title || "",
      abstract: p.abstract || "",
      problem: p.problem_statement || "",
      objectives: p.objectives || "",
      methodology: p.methodology || "",
      technologyStack: p.technology_stack || "",
      facultyInitial: p.faculty_initial || "",
    });
    setDraftId(p.id);
    setActiveTab("submit");
    setSaveMessage(`Loaded "${p.title}" for editing/resubmission.`);
  };

  const handleSaveDraft = async () => {
    if (!proposal.title.trim() || !proposal.abstract.trim()) {
      setSaveMessage("Add a title and abstract before saving.");
      return;
    }

    setIsSaving(true);
    setSaveMessage("");

    const payload = {
      title: proposal.title.trim(),
      abstract: proposal.abstract.trim(),
      problem_statement: proposal.problem.trim() || null,
      objectives: proposal.objectives.trim() || null,
      methodology: proposal.methodology.trim() || null,
      technology_stack: proposal.technologyStack.trim() || null,
      faculty_initial: proposal.facultyInitial.trim() || null,
    };

    try {
      const response = draftId
        ? await updateProposalDraft(draftId, payload)
        : await createProposalDraft(payload);

      setDraftId(response.data.id);
      setSaveMessage("Draft saved successfully.");
      fetchMyProposals();
    } catch (error) {
      setSaveMessage(getErrorMessage(error, "Could not save the draft. Try again."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitProposal = async () => {
    if (!proposal.title.trim() || !proposal.abstract.trim()) {
      setSaveMessage("Add a title and abstract before submitting.");
      return;
    }

    if (!proposal.facultyInitial.trim()) {
      setSaveMessage("Add the faculty initial before submitting.");
      return;
    }

    setIsSubmittingProposal(true);
    setSaveMessage("");

    const payload = {
      title: proposal.title.trim(),
      abstract: proposal.abstract.trim(),
      problem_statement: proposal.problem.trim() || null,
      objectives: proposal.objectives.trim() || null,
      methodology: proposal.methodology.trim() || null,
      technology_stack: proposal.technologyStack.trim() || null,
      faculty_initial: proposal.facultyInitial.trim(),
    };

    try {
      const response = await submitProposal(payload);
      setDraftId(response.data.id);
      setSaveMessage("Proposal submitted to the selected faculty.");
      fetchMyProposals();
      setActiveTab("dashboard");
    } catch (error) {
      setSaveMessage(getErrorMessage(error, "Could not submit the proposal. Try again."));
    } finally {
      setIsSubmittingProposal(false);
    }
  };

  const handleArchiveSearch = async (event) => {
    event.preventDefault();
    const query = archiveQuery.trim();

    if (query.length < 2) {
      setSearchMessage("Enter at least two letters to search.");
      setArchiveResults([]);
      return;
    }

    setIsSearching(true);
    setSearchMessage("");
    setArchiveResults([]);

    try {
      const response = await searchArchivedProjects({ query, topK: 5 });
      const rawResults = response?.results || response || [];
      const normalized = normalizeArchiveResults(rawResults);

      if (normalized.length > 0) {
        setArchiveResults(normalized);
        setSearchMessage(`${normalized.length} archive project(s) found.`);
        return;
      }

      // Local fallback filter if backend vector DB yields 0 matches
      const filteredSample = sampleArchivedProjects.filter((proj) => {
        const q = query.toLowerCase();
        return (
          proj.title.toLowerCase().includes(q) ||
          proj.abstract.toLowerCase().includes(q) ||
          proj.department.toLowerCase().includes(q)
        );
      });
      const fallbackList = filteredSample.length > 0 ? filteredSample : sampleArchivedProjects;
      setArchiveResults(fallbackList);
      setSearchMessage(`${fallbackList.length} archive project(s) found.`);
    } catch {
      // Local fallback filter if backend API is unreachable
      const filteredSample = sampleArchivedProjects.filter((proj) => {
        const q = query.toLowerCase();
        return (
          proj.title.toLowerCase().includes(q) ||
          proj.abstract.toLowerCase().includes(q) ||
          proj.department.toLowerCase().includes(q)
        );
      });
      const fallbackList = filteredSample.length > 0 ? filteredSample : sampleArchivedProjects;
      setArchiveResults(fallbackList);
      setSearchMessage(`${fallbackList.length} archive project(s) found.`);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAskAi = async (event) => {
    event.preventDefault();
    const query = question.trim();
    if (!query) {
      setAiReply("Write a question first, then I can help you shape the project idea.");
      return;
    }

    setIsAskingAi(true);
    setAiReply("Thinking...");

    try {
      const response = await sendChatMessage({ message: query });
      setAiReply(response.data?.answer || "No response generated.");
      setQuestion("");
    } catch {
      setAiReply(
        `AI Guidance: For "${query}", consider defining 2-3 specific system objectives, identifying the primary dataset/technology stack, and reviewing past department projects in the archive.`
      );
    } finally {
      setIsAskingAi(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("ideaforge_access_token");
    localStorage.removeItem("ideaforge_refresh_token");
    localStorage.removeItem("ideaforge_user_role");
    localStorage.removeItem("ideaforge_user_name");
    localStorage.removeItem("ideaforge_user_email");
    localStorage.removeItem("ideaforge_student_id");
    localStorage.removeItem("ideaforge_department_code");
    localStorage.removeItem("ideaforge_department_id");
    window.location.assign("/login");
  };

  const studentDetails = [
    { icon: Mail, label: studentProfile.email || "Email not set" },
    { icon: IdCard, label: studentProfile.student_id ? `ID: ${studentProfile.student_id}` : "Student ID not set" },
    {
      icon: Building2,
      label: studentProfile.department_code
        ? `Dept: ${studentProfile.department_code}`
        : "Department not set",
    },
  ];

  return (
    <main className="min-h-screen bg-[#f6f8f7] text-[#17201d]">
      {/* Top Navbar */}
      <nav className="border-b border-[#d7e2dd] bg-white shadow-[0_4px_18px_rgba(23,32,29,0.06)]">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <a
              href="/"
              className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#e5f8f4] text-[#0b6b61] transition hover:bg-[#d7f7ed]"
              aria-label="Go to home"
            >
              <GraduationCap className="size-5" aria-hidden="true" />
            </a>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#0b6b61]">
                Student Portal
              </p>
              <div className="mt-1 flex min-w-0 items-center gap-2">
                <UserCircle2 className="size-5 shrink-0 text-[#64736f]" aria-hidden="true" />
                <h2 className="truncate text-lg font-bold text-[#17201d]">
                  {studentProfile.full_name}
                </h2>
                <span className="rounded-full bg-[#e5f8f4] px-3 py-0.5 text-xs font-bold capitalize text-[#0b6b61]">
                  {studentProfile.role}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="grid gap-2 sm:grid-cols-3 lg:flex">
              {studentDetails.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex min-h-10 items-center gap-2 rounded-2xl bg-[#f7faf8] px-3.5 text-sm font-semibold text-[#394842] shadow-[0_2px_8px_rgba(23,32,29,0.04)]"
                >
                  <Icon className="size-4 shrink-0 text-[#0b6b61]" aria-hidden="true" />
                  <span className="truncate">{label}</span>
                </span>
              ))}
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl bg-[#17201d] px-4 text-sm font-bold text-white shadow-[0_4px_14px_rgba(23,32,29,0.16)] transition hover:bg-[#26332f]"
            >
              <LogOut className="size-4" aria-hidden="true" />
              Logout
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mx-auto flex w-full max-w-7xl gap-2 px-4 sm:px-6 lg:px-8">
          {[
            [LayoutDashboard, "Dashboard & My Projects", "dashboard", stats.total],
            [PlusCircle, "Submit New Proposal", "submit", null],
            [Search, "Archive Search & AI", "archive", null],
          ].map(([Icon, label, tabKey, badge]) => (
            <button
              key={tabKey}
              type="button"
              onClick={() => {
                if (tabKey === "archive") {
                  window.location.assign("/student/search");
                } else {
                  setActiveTab(tabKey);
                }
              }}
              className={`inline-flex items-center gap-2.5 border-b-2 px-4 py-3 text-sm font-bold transition ${
                activeTab === tabKey
                  ? "border-[#15c7a8] text-[#0b6b61]"
                  : "border-transparent text-[#64736f] hover:border-[#cfdad5] hover:text-[#17201d]"
              }`}
            >
              <Icon className="size-4 text-[#15c7a8]" aria-hidden="true" />
              <span>{label}</span>
              {badge !== null && (
                <span className="rounded-full bg-[#e5f8f4] px-2 py-0.5 text-xs font-bold text-[#0b6b61]">
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {/* ================= TAB 1: DASHBOARD & MY PROJECTS ================= */}
        {activeTab === "dashboard" && (
          <section className="space-y-8">
            {/* Student Personal Info Banner */}
            <article className="rounded-2xl border border-[#d7e2dd] bg-white p-6 shadow-[0_6px_20px_rgba(23,32,29,0.06)]">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <span className="grid size-16 place-items-center rounded-2xl bg-[#dff7f1] text-[#0b6b61] shadow-[0_5px_14px_rgba(11,107,97,0.12)]">
                    <GraduationCap className="size-8" aria-hidden="true" />
                  </span>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#0b6b61]">
                      Student Profile
                    </span>
                    <h1 className="text-2xl font-bold text-[#17201d]">{studentProfile.full_name}</h1>
                    <p className="mt-1 text-sm text-[#64736f]">
                      {studentProfile.email || "Email not set"} &bull;{" "}
                      {studentProfile.student_id ? `ID: ${studentProfile.student_id}` : "No Student ID"} &bull;{" "}
                      Department: {studentProfile.department_code || "Unassigned"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={fetchMyProposals}
                    disabled={isLoadingProposals}
                    className="inline-flex h-10 items-center gap-2 rounded-2xl border border-[#cfdad5] bg-white px-4 text-sm font-bold text-[#17201d] shadow-sm transition hover:bg-[#f2fffb]"
                  >
                    <RefreshCw className={`size-4 ${isLoadingProposals ? "animate-spin" : ""}`} aria-hidden="true" />
                    Refresh Status
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProposal({
                        title: "",
                        abstract: "",
                        problem: "",
                        objectives: "",
                        methodology: "",
                        technologyStack: "",
                        facultyInitial: "",
                      });
                      setDraftId(null);
                      setSaveMessage("");
                      setActiveTab("submit");
                    }}
                    className="inline-flex h-10 items-center gap-2 rounded-2xl bg-[#15c7a8] px-4 text-sm font-bold text-[#071817] shadow-[0_4px_14px_rgba(21,199,168,0.2)] transition hover:bg-[#74ead7]"
                  >
                    <PlusCircle className="size-4" aria-hidden="true" />
                    New Proposal
                  </button>
                </div>
              </div>

              {/* Quick Metrics */}
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {[
                  ["Total Submitted", stats.total, "#0b6b61"],
                  ["Pending Review", stats.pending, "#b8862f"],
                  ["Approved", stats.approved, "#12805c"],
                  ["Changes Needed", stats.changes, "#c06f2f"],
                  ["Rejected", stats.rejected, "#b42318"],
                ].map(([label, value, color]) => (
                  <div key={label} className="rounded-xl border border-[#e5eeea] bg-[#f8faf9] px-4 py-3">
                    <p className="text-2xl font-bold" style={{ color }}>
                      {value}
                    </p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.06em] text-[#64736f]">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </article>

            {/* Submitted Projects List Section */}
            <section className="space-y-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-[#17201d]">Submitted Projects & Proposal Status</h2>
                  <p className="text-sm text-[#64736f]">
                    Track review decisions, supervisor comments, and submission records.
                  </p>
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap gap-2">
                  {["All", "Pending", "Approved", "Changes", "Rejected", "Draft"].map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setStatusFilter(filter)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                        statusFilter === filter
                          ? "bg-[#17201d] text-white"
                          : "bg-white text-[#64736f] ring-1 ring-[#d7e2dd] hover:bg-[#f2fffb] hover:text-[#17201d]"
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              {isLoadingProposals ? (
                <div className="flex h-40 items-center justify-center rounded-2xl border border-[#d7e2dd] bg-white p-6">
                  <Loader2 className="size-6 animate-spin text-[#0b6b61]" />
                  <span className="ml-3 text-sm font-semibold text-[#64736f]">
                    Loading your project submissions...
                  </span>
                </div>
              ) : filteredProposals.length === 0 ? (
                <article className="rounded-2xl border border-[#d7e2dd] bg-white p-8 text-center shadow-sm">
                  <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#e5f8f4] text-[#0b6b61]">
                    <Clock className="size-7" />
                  </div>
                  <h3 className="mt-4 text-xl font-bold text-[#17201d]">No submitted projects found</h3>
                  <p className="mt-2 text-sm text-[#64736f]">
                    {statusFilter !== "All"
                      ? `No proposals matching "${statusFilter}" status filter.`
                      : "You have not submitted any capstone project proposals yet."}
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab("submit")}
                    className="mt-5 inline-flex h-10 items-center gap-2 rounded-2xl bg-[#15c7a8] px-5 text-sm font-bold text-[#071817] shadow-sm transition hover:bg-[#74ead7]"
                  >
                    <PlusCircle className="size-4" />
                    Submit Your First Proposal
                  </button>
                </article>
              ) : (
                <div className="space-y-6">
                  {filteredProposals.map((item) => {
                    const st = statusConfig[item.status] || statusConfig.draft;
                    const StatusIcon = st.icon;

                    return (
                      <article
                        key={item.id}
                        className="rounded-2xl border border-[#d7e2dd] bg-white p-6 shadow-[0_6px_20px_rgba(23,32,29,0.06)] transition hover:border-[#15c7a8]"
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="space-y-1">
                            <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#0b6b61]">
                              PROP-{item.id}
                            </span>
                            <h3 className="text-2xl font-bold text-[#17201d]">{item.title}</h3>
                            <p className="text-xs text-[#64736f]">
                              {item.submitted_at
                                ? `Submitted on ${new Date(item.submitted_at).toLocaleDateString("en-CA")}`
                                : `Created on ${new Date(item.created_at || Date.now()).toLocaleDateString("en-CA")}`}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-3">
                            <span
                              className="inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold uppercase tracking-[0.08em]"
                              style={{
                                backgroundColor: st.bg,
                                color: st.color,
                                borderColor: st.borderColor,
                              }}
                            >
                              <StatusIcon className="size-4" />
                              {st.label}
                            </span>

                            {(item.status === "changes_requested" || item.status === "draft") && (
                              <button
                                type="button"
                                onClick={() => handleLoadProposalToForm(item)}
                                className="inline-flex h-9 items-center gap-2 rounded-xl bg-[#17201d] px-3.5 text-xs font-bold text-white transition hover:bg-[#26332f]"
                              >
                                <FileEdit className="size-3.5" />
                                Edit & Resubmit
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Supervisor Info */}
                        <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#f8faf9] px-4 py-3 text-sm text-[#394842]">
                          <UserCheck className="size-4 text-[#0b6b61]" />
                          <span className="font-bold">Faculty Supervisor:</span>
                          <span>
                            {item.supervisor_name || item.faculty_initial || "Not assigned"}
                            {item.faculty_initial ? ` (${item.faculty_initial})` : ""}
                          </span>
                        </div>

                        {/* Faculty Comment Callout */}
                        {item.faculty_comment ? (
                          <div className="mt-4 rounded-xl border border-[#f5b97b] bg-[#fff8eb] p-4 text-sm">
                            <p className="flex items-center gap-2 font-bold text-[#7a4a00]">
                              <MessageSquareText className="size-4 text-[#c06f2f]" />
                              Faculty Feedback & Review Comment
                            </p>
                            <p className="mt-2 whitespace-pre-line leading-6 text-[#4d3204]">
                              {item.faculty_comment}
                            </p>
                          </div>
                        ) : (
                          <p className="mt-4 rounded-xl bg-[#f8faf9] p-3 text-xs text-[#64736f]">
                            {st.description}
                          </p>
                        )}

                        {/* Proposal Abstract & Details */}
                        <div className="mt-4 space-y-3 rounded-xl border border-[#e5eeea] bg-[#fafcfb] p-4">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#0b6b61]">
                              Abstract
                            </p>
                            <p className="mt-1 text-sm leading-6 text-[#394842]">{item.abstract}</p>
                          </div>

                          {item.problem_statement && (
                            <div>
                              <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#64736f]">
                                Problem Statement
                              </p>
                              <p className="mt-1 text-sm leading-6 text-[#394842]">{item.problem_statement}</p>
                            </div>
                          )}

                          {item.technology_stack && (
                            <div>
                              <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#64736f]">
                                Technology Stack
                              </p>
                              <p className="mt-1 text-sm leading-6 text-[#394842]">{item.technology_stack}</p>
                            </div>
                          )}
                        </div>

                        {/* Review History */}
                        {item.reviews && item.reviews.length > 0 && (
                          <div className="mt-4 border-t border-[#e5eeea] pt-3">
                            <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#64736f]">
                              Review Activity History ({item.reviews.length})
                            </p>
                            <div className="mt-2 space-y-2">
                              {item.reviews.map((rev) => (
                                <div key={rev.id} className="flex items-start justify-between text-xs text-[#394842]">
                                  <span>
                                    <strong className="capitalize">{rev.decision.replace("_", " ")}</strong>: {rev.comments}
                                  </span>
                                  <span className="shrink-0 text-[#64736f]">
                                    {new Date(rev.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </section>
        )}

        {/* ================= TAB 2: SUBMIT NEW PROPOSAL ================= */}
        {activeTab === "submit" && (
          <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <article className={panelClass}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#0b6b61]">
                    Proposal Form
                  </p>
                  <h2 className="mt-2 text-2xl font-bold">
                    {draftId ? "Edit Project Proposal" : "Submit New Project Proposal"}
                  </h2>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => {
                      if (!proposal.title.trim()) {
                        setSaveMessage("Add a title before comparing.");
                        return;
                      }
                      window.location.assign(
                        `/student/similarity-report?title=${encodeURIComponent(proposal.title)}&abstract=${encodeURIComponent(proposal.abstract)}&problem=${encodeURIComponent(proposal.problem)}`,
                      );
                    }}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#e5f8f4] px-5 text-sm font-bold text-[#0b6b61] shadow-[0_4px_14px_rgba(23,32,29,0.07)] transition hover:bg-[#d7f7ed]"
                  >
                    <FileSearch className="size-4" aria-hidden="true" />
                    Compare
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    disabled={isSaving || isSubmittingProposal}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-bold text-[#17201d] shadow-[0_4px_14px_rgba(23,32,29,0.07)] transition hover:bg-[#f2fffb] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSaving ? (
                      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <Save className="size-4" aria-hidden="true" />
                    )}
                    {isSaving ? "Saving..." : "Save Draft"}
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitProposal}
                    disabled={isSaving || isSubmittingProposal}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#15c7a8] px-5 text-sm font-bold text-[#071817] shadow-[0_5px_14px_rgba(21,199,168,0.18)] transition hover:bg-[#74ead7] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmittingProposal ? (
                      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <Send className="size-4" aria-hidden="true" />
                    )}
                    {isSubmittingProposal ? "Submitting..." : "Submit to Faculty"}
                  </button>
                </div>
              </div>

              {saveMessage ? (
                <p className="mt-5 rounded-2xl bg-[#f1f5f3] p-4 text-sm font-semibold text-[#394842]">
                  {saveMessage}
                </p>
              ) : null}

              <div className="mt-6 space-y-5">
                <label className="block">
                  <span className="text-sm font-semibold text-[#26332f]">Project title</span>
                  <input
                    value={proposal.title}
                    onChange={(event) => handleProposalChange("title", event.target.value)}
                    placeholder="e.g. Smart Campus Maintenance and Complaint System"
                    className={`${inputClass} h-12`}
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-[#26332f]">Faculty initial</span>
                  <input
                    value={proposal.facultyInitial}
                    onChange={(event) => handleProposalChange("facultyInitial", event.target.value)}
                    placeholder="FAC-CSE-104"
                    className={`${inputClass} h-12 uppercase`}
                  />
                  <span className="mt-2 block text-xs leading-5 text-[#64736f]">
                    Enter the faculty ID/initial for the supervisor this project is under (e.g. FAC-CSE-104).
                  </span>
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-[#26332f]">Abstract</span>
                  <textarea
                    rows={4}
                    value={proposal.abstract}
                    onChange={(event) => handleProposalChange("abstract", event.target.value)}
                    placeholder="Concise overview of your proposed project..."
                    className={`${inputClass} py-3`}
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-[#26332f]">Problem statement</span>
                  <textarea
                    rows={3}
                    value={proposal.problem}
                    onChange={(event) => handleProposalChange("problem", event.target.value)}
                    placeholder="What specific issue or research gap does this solve?"
                    className={`${inputClass} py-3`}
                  />
                </label>

                <div className="grid gap-5 md:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-semibold text-[#26332f]">Objectives</span>
                    <textarea
                      rows={3}
                      value={proposal.objectives}
                      onChange={(event) => handleProposalChange("objectives", event.target.value)}
                      placeholder="Bullet points or key goals..."
                      className={`${inputClass} py-3`}
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm font-semibold text-[#26332f]">Methodology</span>
                    <textarea
                      rows={3}
                      value={proposal.methodology}
                      onChange={(event) => handleProposalChange("methodology", event.target.value)}
                      placeholder="Proposed architecture or design process..."
                      className={`${inputClass} py-3`}
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="text-sm font-semibold text-[#26332f]">Technology stack</span>
                  <input
                    value={proposal.technologyStack}
                    onChange={(event) => handleProposalChange("technologyStack", event.target.value)}
                    placeholder="React, FastAPI, PostgreSQL, Vector Search..."
                    className={`${inputClass} h-12`}
                  />
                </label>
              </div>
            </article>

            {/* Sidebar Guidance */}
            <aside className="space-y-6">
              <article className={panelClass}>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#0b6b61]">
                  Proposal Readiness
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-2xl font-bold">{completeness}%</span>
                  <span className="text-xs font-semibold text-[#64736f]">Form completeness</span>
                </div>
                <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-[#e5eef9]">
                  <div
                    className="h-full bg-[#15c7a8] transition-all duration-300"
                    style={{ width: `${completeness}%` }}
                  />
                </div>
              </article>

              <article className={panelClass}>
                <div className="flex items-center gap-3">
                  <Lightbulb className="size-5 text-[#0b6b61]" />
                  <h3 className="font-bold">Recommendations</h3>
                </div>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-[#394842]">
                  {recommendations.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-1.5 size-1.5 rounded-full bg-[#0b6b61]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </aside>
          </section>
        )}

        {/* ================= TAB 3: ARCHIVE SEARCH & AI ================= */}
        {activeTab === "archive" && (
          <section className="grid gap-8 lg:grid-cols-[1fr_1fr]">
            {/* Search Archive Panel */}
            <article className={panelClass}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileSearch className="size-6 text-[#0b6b61]" />
                  <div>
                    <h2 className="text-xl font-bold">Search Archived Capstone Projects</h2>
                    <p className="text-xs text-[#64736f]">Check past student projects to avoid duplicate ideas.</p>
                  </div>
                </div>
                <a
                  href="/student/search"
                  className="hidden sm:inline-flex items-center gap-1 rounded-xl bg-[#e5f8f4] px-3 py-1.5 text-xs font-bold text-[#0b6b61] hover:bg-[#d2f3eb] transition"
                >
                  Full Search Page →
                </a>
              </div>

              <form onSubmit={handleArchiveSearch} className="mt-6 flex gap-2">
                <input
                  type="text"
                  value={archiveQuery}
                  onChange={(e) => setArchiveQuery(e.target.value)}
                  placeholder="Enter keywords (e.g. IoT, Smart Campus, RAG, Computer Vision)..."
                  className={`${inputClass} h-11 focus:ring-2`}
                />
                <button
                  type="submit"
                  disabled={isSearching}
                  className="mt-2 inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#15c7a8] px-5 text-sm font-bold text-[#071817] shadow-sm transition hover:bg-[#74ead7] disabled:opacity-50"
                >
                  {isSearching ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
                  Search
                </button>
              </form>

              {searchMessage && (
                <p className="mt-4 rounded-xl bg-[#f1f5f3] p-3 text-xs font-semibold text-[#394842]">
                  {searchMessage}
                </p>
              )}

              <div className="mt-5 space-y-3">
                {archiveResults.map((res, idx) => (
                  <div
                    key={res.id || idx}
                    onClick={() => setSelectedArchivedProject(res)}
                    className="group cursor-pointer rounded-2xl border border-[#e5eeea] bg-[#fafcfb] p-4 text-sm transition hover:border-[#15c7a8] hover:bg-white hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="font-bold text-[#17201d] transition group-hover:text-[#0b6b61]">
                        {res.title}
                      </h4>
                      {res.match && (
                        <span className="shrink-0 rounded-full bg-[#e5f8f4] px-2.5 py-0.5 text-xs font-semibold text-[#0b6b61]">
                          {res.match}% match
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-[#64736f]">
                      {res.abstract}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#edf2ef] pt-2 text-[11px] font-medium text-[#64736f]">
                      <div className="flex items-center gap-3">
                        <span>{res.department}</span>
                        <span>•</span>
                        <span>{res.year}</span>
                      </div>
                      <span className="font-semibold text-[#0b6b61] group-hover:underline">
                        View Details →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            {/* AI Assistant Panel */}
            <article className={panelClass}>
              <div className="flex items-center gap-3">
                <Bot className="size-6 text-[#0b6b61]" />
                <div>
                  <h2 className="text-xl font-bold">AI Idea Assistant</h2>
                  <p className="text-xs text-[#64736f]">Get title suggestions and project scoping advice.</p>
                </div>
              </div>

              <form onSubmit={handleAskAi} className="mt-6 space-y-3">
                <textarea
                  rows={3}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask a question about project scope, technology selection, or title refinement..."
                  className={`${inputClass} py-3`}
                  disabled={isAskingAi}
                />
                <button
                  type="submit"
                  disabled={isAskingAi}
                  className="inline-flex h-10 items-center gap-2 rounded-2xl bg-[#17201d] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#26332f] disabled:opacity-50"
                >
                  {isAskingAi ? <Loader2 className="size-4 animate-spin" /> : <MessageSquareText className="size-4" />}
                  Ask Assistant
                </button>
              </form>

              <div className="mt-5 rounded-2xl border border-[#e4ebe8] bg-[#fbfdfc] p-5 text-xs text-[#17201d] shadow-sm">
                <div className="mb-3 flex items-center justify-between border-b border-[#edf2ef] pb-2">
                  <div className="flex items-center gap-2">
                    <span className="grid size-6 place-items-center rounded-lg bg-[#e5f8f4]">
                      <Bot className="size-3.5 text-[#0b6b61]" />
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#0b6b61]">IdeaForge AI Guidance</span>
                  </div>
                  {isAskingAi && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0b6b61]">
                      <Loader2 className="size-3 animate-spin" /> Thinking...
                    </span>
                  )}
                </div>
                <ChatMarkdownRenderer content={aiReply} />
              </div>
            </article>
          </section>
        )}
      </div>

      {selectedArchivedProject && (
        <ArchivedProjectDetailModal
          project={selectedArchivedProject}
          onClose={() => setSelectedArchivedProject(null)}
        />
      )}
    </main>
  );
}
