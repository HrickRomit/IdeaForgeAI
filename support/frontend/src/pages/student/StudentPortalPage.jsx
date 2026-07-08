import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  FileSearch,
  GraduationCap,
  Lightbulb,
  MessageSquareText,
  Save,
  Search,
  Send,
} from "lucide-react";

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

export default function StudentPortalPage() {
  const [proposal, setProposal] = useState({
    title: "AI-Based Project Idea Assistant",
    abstract:
      "A student-facing assistant that helps generate, refine, and validate final year project ideas using previous archived projects.",
    problem:
      "Students often struggle to find unique and feasible project ideas because previous project records are hard to search manually.",
  });
  const [question, setQuestion] = useState("");
  const [aiReply, setAiReply] = useState(
    "Ask the assistant for idea suggestions, title improvements, research gaps, or technology stack advice.",
  );

  const completeness = useMemo(() => {
    const filled = [proposal.title, proposal.abstract, proposal.problem].filter((value) => value.trim()).length;
    return Math.round((filled / 3) * 100);
  }, [proposal]);

  const handleProposalChange = (field, value) => {
    setProposal((current) => ({
      ...current,
      [field]: value,
    }));
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

  return (
    <main className="min-h-screen bg-[#f6f8f7] text-[#17201d]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-[#d9e1dc] pb-5 md:flex-row md:items-center md:justify-between">
          <div>
            <a href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#0b6b61]">
              <ArrowLeft className="size-4" aria-hidden="true" />
              Home
            </a>
            <div className="mt-5 flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-md bg-[#dff7f1] text-[#0b6b61]">
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
              ["Draft", "Status"],
              [`${completeness}%`, "Complete"],
              ["3", "AI notes"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-md border border-[#d9e1dc] bg-white px-4 py-3 shadow-sm">
                <p className="text-xl font-bold text-[#0b6b61]">{value}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#64736f]">{label}</p>
              </div>
            ))}
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-md border border-[#d9e1dc] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#0b6b61]">Proposal Draft</p>
                <h2 className="mt-2 text-2xl font-bold">Describe your project idea</h2>
              </div>
              <button
                type="button"
                className="inline-flex h-10 items-center gap-2 rounded-md bg-[#15c7a8] px-4 text-sm font-bold text-[#071817] transition hover:bg-[#74ead7]"
              >
                <Save className="size-4" aria-hidden="true" />
                Save Draft
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="text-sm font-semibold text-[#26332f]">Project title</span>
                <input
                  value={proposal.title}
                  onChange={(event) => handleProposalChange("title", event.target.value)}
                  className="mt-2 h-11 w-full rounded-md border border-[#cfdad5] bg-[#fbfdfc] px-3 text-sm outline-none transition focus:border-[#15c7a8] focus:ring-2 focus:ring-[#15c7a8]/20"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-[#26332f]">Abstract</span>
                <textarea
                  value={proposal.abstract}
                  onChange={(event) => handleProposalChange("abstract", event.target.value)}
                  rows={5}
                  className="mt-2 w-full resize-none rounded-md border border-[#cfdad5] bg-[#fbfdfc] px-3 py-3 text-sm leading-6 outline-none transition focus:border-[#15c7a8] focus:ring-2 focus:ring-[#15c7a8]/20"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-[#26332f]">Problem statement</span>
                <textarea
                  value={proposal.problem}
                  onChange={(event) => handleProposalChange("problem", event.target.value)}
                  rows={4}
                  className="mt-2 w-full resize-none rounded-md border border-[#cfdad5] bg-[#fbfdfc] px-3 py-3 text-sm leading-6 outline-none transition focus:border-[#15c7a8] focus:ring-2 focus:ring-[#15c7a8]/20"
                />
              </label>
            </div>
          </article>

          <aside className="space-y-6">
            <article className="rounded-md border border-[#d9e1dc] bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-md bg-[#e5f8f4] text-[#0b6b61]">
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
                <div className="mt-3 h-2 rounded-full bg-[#e7eeeb]">
                  <div className="h-2 w-[28%] rounded-full bg-[#15c7a8]" />
                </div>
              </div>
              <div className="mt-5 space-y-2">
                {similarProjects.map(([title, score]) => (
                  <div key={title} className="flex items-center justify-between rounded-md bg-[#f6f8f7] px-3 py-2">
                    <span className="text-sm font-semibold">{title}</span>
                    <span className="text-xs font-bold text-[#0b6b61]">{score}</span>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-md border border-[#d9e1dc] bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-md bg-[#e5f8f4] text-[#0b6b61]">
                  <Lightbulb className="size-5" aria-hidden="true" />
                </span>
                <h2 className="text-lg font-bold">Recommendations</h2>
              </div>
              <div className="mt-4 space-y-3">
                {recommendations.map((item) => (
                  <div key={item} className="flex gap-3 rounded-md bg-[#f6f8f7] p-3">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#0b6b61]" aria-hidden="true" />
                    <p className="text-sm leading-6 text-[#394842]">{item}</p>
                  </div>
                ))}
              </div>
            </article>
          </aside>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <article className="rounded-md border border-[#d9e1dc] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-md bg-[#e5f8f4] text-[#0b6b61]">
                <Search className="size-5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-lg font-bold">Archived Project Search</h2>
                <p className="text-sm text-[#64736f]">Search UI placeholder for the future RAG/archive API.</p>
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <input
                placeholder="Search previous projects..."
                className="h-11 min-w-0 flex-1 rounded-md border border-[#cfdad5] bg-[#fbfdfc] px-3 text-sm outline-none transition focus:border-[#15c7a8] focus:ring-2 focus:ring-[#15c7a8]/20"
              />
              <button
                type="button"
                className="inline-flex h-11 items-center gap-2 rounded-md border border-[#cfdad5] bg-white px-4 text-sm font-bold text-[#17201d] transition hover:border-[#15c7a8]"
              >
                <Search className="size-4" aria-hidden="true" />
                Search
              </button>
            </div>
          </article>

          <article className="rounded-md border border-[#d9e1dc] bg-[#17201d] p-5 text-white shadow-sm">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-md bg-[#15c7a8] text-[#071817]">
                <Bot className="size-5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-lg font-bold">AI Brainstorming Assistant</h2>
                <p className="text-sm text-white/65">Mock chat now, real AI endpoint later.</p>
              </div>
            </div>

            <div className="mt-5 rounded-md border border-white/10 bg-white/8 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-[#d7f7ed]">
                <MessageSquareText className="size-4" aria-hidden="true" />
                Assistant response
              </p>
              <p className="mt-3 text-sm leading-6 text-white/82">{aiReply}</p>
            </div>

            <form onSubmit={handleAskAi} className="mt-4 flex gap-2">
              <input
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Ask for title ideas, research gaps, or tech stack suggestions..."
                className="h-11 min-w-0 flex-1 rounded-md border border-white/14 bg-white px-3 text-sm text-[#17201d] outline-none"
              />
              <button
                type="submit"
                className="inline-flex h-11 items-center gap-2 rounded-md bg-[#15c7a8] px-4 text-sm font-bold text-[#071817] transition hover:bg-[#74ead7]"
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
