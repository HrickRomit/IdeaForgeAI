import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Bot,
  Building2,
  CheckCircle2,
  FileSearch,
  GraduationCap,
  IdCard,
  Lightbulb,
  Loader2,
  LogOut,
  Mail,
  MessageSquareText,
  Save,
  Search,
  Send,
  UserCircle2,
} from "lucide-react";

import { getCurrentUser } from "../../api/authApi";
import {
  createProposalDraft,
  submitProposal,
  updateProposalDraft,
} from "../../api/proposalsApi";
import { searchArchivedProjects } from "../../api/projectsApi";

const recommendations = [
  "Make the problem statement more specific to one academic department.",
  "Add two or three measurable objectives before submitting.",
  "Search archived projects before finalizing the title.",
];

const similarProjects = [
  ["Smart Course Advisor", "72% theme match"],
  ["AI Project Archive Search", "64% theme match"],
  ["Student Research Helper", "58% theme match"],
];

const panelClass =
  "rounded-2xl bg-white p-6 shadow-[0_6px_20px_rgba(23,32,29,0.08)]";
const quietPanelClass =
  "rounded-2xl bg-[#f7faf8] p-4 shadow-[0_4px_16px_rgba(23,32,29,0.05)]";
const iconTileClass =
  "grid size-11 place-items-center rounded-2xl bg-[#e5f8f4] text-[#0b6b61]";
const inputClass =
  "mt-2 w-full rounded-2xl bg-[#fbfdfc] px-4 text-sm outline-none ring-1 ring-[#d7e2dd] transition focus:ring-2 focus:ring-[#15c7a8]/35";

function getErrorMessage(error, fallbackMessage) {
  if (!error.response) {
    return "Could not reach the backend. Make sure Docker is running.";
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
  const [proposal, setProposal] = useState({
    title: "AI-Based Project Idea Assistant",
    abstract:
      "A student-facing assistant that helps generate, refine, and validate final year project ideas using previous archived projects.",
    problem:
      "Students often struggle to find unique and feasible project ideas because previous project records are hard to search manually.",
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

  const [question, setQuestion] = useState("");
  const [aiReply, setAiReply] = useState(
    "Ask the assistant for idea suggestions, title improvements, research gaps, or technology stack advice.",
  );

  useEffect(() => {
    let isMounted = true;

    getCurrentUser()
      .then((response) => {
        if (!isMounted || !response.data) {
          return;
        }

        const user = response.data;

        setStudentProfile({
          full_name: user.full_name || "Student",
          email: user.email || "",
          role: user.role || "student",
          student_id: user.student_id || "",
          department_code: user.department_code || "",
          department_id: user.department_id || "",
        });

        localStorage.setItem("ideaforge_user_name", user.full_name || "Student");
        localStorage.setItem("ideaforge_user_role", user.role || "student");

        if (user.email) {
          localStorage.setItem("ideaforge_user_email", user.email);
        }

        if (user.student_id) {
          localStorage.setItem("ideaforge_student_id", user.student_id);
        }

        if (user.department_code) {
          localStorage.setItem("ideaforge_department_code", user.department_code);
        }

        if (user.department_id) {
          localStorage.setItem("ideaforge_department_id", String(user.department_id));
        }
      })
      .catch(() => {
        if (isMounted) {
          setStudentProfile(getStoredStudentProfile());
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const completeness = useMemo(() => {
    const filled = [
      proposal.title,
      proposal.abstract,
      proposal.problem,
      proposal.facultyInitial,
    ].filter((value) => value.trim()).length;

    return Math.round((filled / 4) * 100);
  }, [proposal]);

  const handleProposalChange = (field, value) => {
    setProposal((current) => ({
      ...current,
      [field]: value,
    }));
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
      faculty_initial: proposal.facultyInitial.trim() || null,
    };

    try {
      const response = draftId
        ? await updateProposalDraft(draftId, payload)
        : await createProposalDraft(payload);

      setDraftId(response.data.id);
      setSaveMessage("Draft saved successfully.");
    } catch (error) {
      setSaveMessage(
        getErrorMessage(error, "Could not save the draft. Try again."),
      );
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
      faculty_initial: proposal.facultyInitial.trim(),
    };

    try {
      const response = await submitProposal(payload);
      setDraftId(response.data.id);
      setSaveMessage("Proposal submitted to the selected faculty.");
    } catch (error) {
      setSaveMessage(
        getErrorMessage(error, "Could not submit the proposal. Try again."),
      );
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
      const response = await searchArchivedProjects({
        query,
        topK: 5,
      });

      const results = response.results || [];

      setArchiveResults(results);
      setSearchMessage(
        results.length
          ? `${results.length} archive project(s) found.`
          : "No archived projects found for this search.",
      );
    } catch (error) {
      setSearchMessage(
        getErrorMessage(error, "Archive search is unavailable."),
      );
    } finally {
      setIsSearching(false);
    }
  };

  const handleAskAi = (event) => {
    event.preventDefault();

    if (!question.trim()) {
      setAiReply("Write a question first, then I can help you shape the project idea.");
      return;
    }

    setAiReply(
      `Mock AI response: For "${question}", start by narrowing the scope, checking similar archived projects, and listing the main users, data sources, and expected output.`,
    );
    setQuestion("");
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
    {
      icon: Mail,
      label: studentProfile.email || "Email not set",
    },
    {
      icon: IdCard,
      label: studentProfile.student_id || "Student ID not set",
    },
    {
      icon: Building2,
      label: studentProfile.department_code
        ? `${studentProfile.department_code}${studentProfile.department_id ? ` / Dept ID ${studentProfile.department_id}` : ""}`
        : studentProfile.department_id
          ? `Dept ID ${studentProfile.department_id}`
        : "Department not set",
    },
  ];

  return (
    <main className="min-h-screen bg-[#f6f8f7] text-[#17201d]">
      <nav className="bg-white/[0.92] shadow-[0_4px_18px_rgba(23,32,29,0.06)]">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
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
                <span className="rounded-full bg-[#e5f8f4] px-3 py-1 text-xs font-bold capitalize text-[#0b6b61]">
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
                  className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-[#f7faf8] px-4 text-sm font-semibold text-[#394842] shadow-[0_3px_12px_rgba(23,32,29,0.04)]"
                >
                  <Icon className="size-4 shrink-0 text-[#0b6b61]" aria-hidden="true" />
                  <span className="truncate">{label}</span>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <a
                href="/student/search"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#f7faf8] px-4 text-sm font-bold text-[#17201d] shadow-[0_3px_12px_rgba(23,32,29,0.04)] transition hover:bg-[#eef7f3]"
              >
                <Search className="size-4" aria-hidden="true" />
                Search
              </a>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#17201d] px-4 text-sm font-bold text-white shadow-[0_5px_16px_rgba(23,32,29,0.16)] transition hover:bg-[#26332f]"
              >
                <LogOut className="size-4" aria-hidden="true" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <header className="flex flex-col gap-6 pb-2 md:flex-row md:items-center md:justify-between">
          <div>
            <a href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#0b6b61]">
              <ArrowLeft className="size-4" aria-hidden="true" />
              Home
            </a>
            <div className="mt-5 flex items-center gap-3">
              <span className="grid size-14 place-items-center rounded-2xl bg-[#dff7f1] text-[#0b6b61] shadow-[0_5px_14px_rgba(11,107,97,0.12)]">
                <GraduationCap className="size-6" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#0b6b61]">Student Workspace</p>
                <h1 className="text-3xl font-bold tracking-normal sm:text-4xl">Project Idea Portal</h1>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              [draftId ? "Saved" : "Draft", "Status"],
              [`${completeness}%`, "Complete"],
              ["3", "AI notes"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl bg-white px-5 py-4 shadow-[0_5px_16px_rgba(23,32,29,0.07)]">
                <p className="text-xl font-bold text-[#0b6b61]">{value}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#64736f]">{label}</p>
              </div>
            ))}
          </div>
        </header>

        <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <article className={panelClass}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#0b6b61]">Proposal Draft</p>
                <h2 className="mt-2 text-2xl font-bold">Describe your project idea</h2>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
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
                  {isSubmittingProposal ? "Submitting..." : "Submit"}
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
                  Enter the faculty ID/initial for the supervisor this project is under.
                </span>
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-[#26332f]">Abstract</span>
                <textarea
                  value={proposal.abstract}
                  onChange={(event) => handleProposalChange("abstract", event.target.value)}
                  rows={5}
                  className={`${inputClass} resize-none py-4 leading-6`}
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-[#26332f]">Problem statement</span>
                <textarea
                  value={proposal.problem}
                  onChange={(event) => handleProposalChange("problem", event.target.value)}
                  rows={4}
                  className={`${inputClass} resize-none py-4 leading-6`}
                />
              </label>
            </div>
          </article>

          <aside className="space-y-8">
            <article className={panelClass}>
              <div className="flex items-center gap-3">
                <span className={iconTileClass}>
                  <FileSearch className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-bold text-[#17201d]">Similarity Preview</p>
                  <p className="text-xs text-[#64736f]">Mock result until backend AI is connected</p>
                </div>
              </div>
              <div className="mt-5">
                <div className="flex items-end justify-between">
                  <span className="text-sm font-semibold text-[#52625d]">Estimated overlap</span>
                  <span className="text-3xl font-bold text-[#0b6b61]">28%</span>
                </div>
                <div className="mt-4 h-3 rounded-full bg-[#e7eeeb]">
                  <div className="h-3 w-[28%] rounded-full bg-[#15c7a8]" />
                </div>
              </div>
              <div className="mt-6 space-y-3">
                {similarProjects.map(([title, score]) => (
                  <div key={title} className="flex items-center justify-between gap-4 rounded-2xl bg-[#f6f8f7] px-4 py-3">
                    <span className="text-sm font-semibold">{title}</span>
                    <span className="text-xs font-bold text-[#0b6b61]">{score}</span>
                  </div>
                ))}
              </div>
            </article>

            <article className={panelClass}>
              <div className="flex items-center gap-3">
                <span className={iconTileClass}>
                  <Lightbulb className="size-5" aria-hidden="true" />
                </span>
                <h2 className="text-lg font-bold">Recommendations</h2>
              </div>
              <div className="mt-5 space-y-3">
                {recommendations.map((item) => (
                  <div key={item} className="flex gap-3 rounded-2xl bg-[#f6f8f7] p-4">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#0b6b61]" aria-hidden="true" />
                    <p className="text-sm leading-6 text-[#394842]">{item}</p>
                  </div>
                ))}
              </div>
            </article>
          </aside>
        </section>

        <section className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <article className={panelClass}>
            <div className="flex items-center gap-3">
              <span className={iconTileClass}>
                <Search className="size-5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-lg font-bold">Archived Project Search</h2>
                <p className="text-sm text-[#64736f]">Search previous projects using the live archive API.</p>
              </div>
            </div>

            <form onSubmit={handleArchiveSearch} className="mt-6 flex flex-col gap-3 sm:flex-row">
              <input
                value={archiveQuery}
                onChange={(event) => setArchiveQuery(event.target.value)}
                placeholder="Search previous projects..."
                className={`${inputClass} mt-0 h-12 min-w-0 flex-1`}
              />
              <button
                type="submit"
                disabled={isSearching}
                className="inline-flex h-12 items-center gap-2 rounded-2xl bg-white px-5 text-sm font-bold text-[#17201d] shadow-[0_4px_14px_rgba(23,32,29,0.07)] transition hover:bg-[#f2fffb] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSearching ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Search className="size-4" aria-hidden="true" />
                )}
                Search
              </button>
            </form>

            {searchMessage ? (
              <p className="mt-4 text-sm font-semibold text-[#394842]">
                {searchMessage}
              </p>
            ) : null}

            {archiveResults.length > 0 ? (
              <div className="mt-4 space-y-2">
                {archiveResults.map((result) => (
                  <div
                    key={result.project_id}
                    className={quietPanelClass}
                  >
                    <p className="text-sm font-bold text-[#17201d]">
                      {result.metadata?.title || "Archived project"}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#52625d]">
                      {result.document}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}
          </article>

          <article className="rounded-2xl bg-[#17201d] p-6 text-white shadow-[0_8px_24px_rgba(23,32,29,0.12)]">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-2xl bg-[#15c7a8] text-[#071817]">
                <Bot className="size-5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-lg font-bold">AI Brainstorming Assistant</h2>
                <p className="text-sm text-white/65">Mock chat now, real AI endpoint later.</p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-white/[0.08] p-5 shadow-[0_6px_18px_rgba(0,0,0,0.08)]">
              <p className="flex items-center gap-2 text-sm font-semibold text-[#d7f7ed]">
                <MessageSquareText className="size-4" aria-hidden="true" />
                Assistant response
              </p>
              <p className="mt-3 text-sm leading-6 text-white/82">{aiReply}</p>
            </div>

            <form onSubmit={handleAskAi} className="mt-5 flex flex-col gap-3 sm:flex-row">
              <input
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Ask for title ideas, research gaps, or tech stack suggestions..."
                className="h-12 min-w-0 flex-1 rounded-2xl bg-white px-4 text-sm text-[#17201d] outline-none ring-1 ring-white/20 transition focus:ring-2 focus:ring-[#15c7a8]/40"
              />
              <button
                type="submit"
                className="inline-flex h-12 items-center gap-2 rounded-2xl bg-[#15c7a8] px-5 text-sm font-bold text-[#071817] shadow-[0_5px_14px_rgba(21,199,168,0.18)] transition hover:bg-[#74ead7]"
              >
                <Send className="size-4" aria-hidden="true" />
                Ask
              </button>
            </form>
          </article>
        </section>
      </div>
    </main>
  );
}
