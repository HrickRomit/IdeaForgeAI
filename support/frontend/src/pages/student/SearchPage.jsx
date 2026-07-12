import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  Bot,
  CalendarDays,
  Database,
  Filter,
  GraduationCap,
  Layers3,
  Lightbulb,
  Loader2,
  Search,
  SlidersHorizontal,
  Sparkles,
  Wrench,
} from "lucide-react";
import { searchArchivedProjects } from "../../api/projectsApi";

const archivedProjects = [
  {
    id: "project_0001",
    title: "Smart Campus Complaint and Maintenance Tracking System",
    summary:
      "A web platform for reporting campus facility issues, assigning them to maintenance teams, and tracking resolution progress with dashboards.",
    abstract:
      "The system centralizes complaint submission, assignment, status tracking, and administrative analytics for university maintenance workflows.",
    department: "Computer Science and Engineering",
    year: "2025-2026",
    semester: "Fall",
    difficulty: "Intermediate",
    difficultyScore: 6,
    supervisor: "Dr. Farhana Karim",
    domain: "Information Systems",
    technologies: ["FastAPI", "React", "Tailwind CSS", "SQLAlchemy", "PostgreSQL"],
    keywords: ["campus maintenance", "complaint management", "facility dashboard", "admin workflow"],
    outcomes: [
      "Role-based complaint reporting and tracking",
      "Assignment workflow for maintenance teams",
      "Analytics for categories, locations, overdue cases, and response time",
    ],
    gap:
      "The archive notes future scope for AI-based duplicate detection, priority recommendation, predictive analytics, and mobile reporting.",
  },
  {
    id: "project_0002",
    title: "AI Project Archive Search",
    summary:
      "A semantic archive search concept for helping students inspect previous capstone projects before finalizing a proposal.",
    abstract:
      "Students can search archived work using natural language, compare topics, inspect technologies, and identify research gaps.",
    department: "Computer Science and Engineering",
    year: "2026",
    semester: "Spring",
    difficulty: "Advanced",
    difficultyScore: 8,
    supervisor: "AI Research Group",
    domain: "Academic Project Intelligence",
    technologies: ["React", "FastAPI", "ChromaDB", "Gemini", "Sentence Transformers"],
    keywords: ["semantic search", "RAG", "project discovery", "similarity checking"],
    outcomes: [
      "Natural-language search over archived projects",
      "Similarity-aware proposal exploration",
      "Source-backed answers from project records",
    ],
    gap: "Can be extended with stronger ranking explanations, supervisor matching, and citation-level source previews.",
  },
  {
    id: "project_0003",
    title: "Student Research Helper",
    summary:
      "A guided assistant for refining student project ideas into problem statements, objectives, and feasible implementation plans.",
    abstract:
      "The assistant supports idea brainstorming, proposal drafting, technology recommendations, and difficulty estimation.",
    department: "Computer Science and Engineering",
    year: "2025",
    semester: "Summer",
    difficulty: "Intermediate",
    difficultyScore: 7,
    supervisor: "Software Engineering Lab",
    domain: "Learning Support Systems",
    technologies: ["React", "Python", "LLM API", "PostgreSQL"],
    keywords: ["idea generation", "proposal drafting", "technology recommendation", "student support"],
    outcomes: [
      "Structured proposal guidance",
      "Technology stack suggestions",
      "Project scope and feasibility feedback",
    ],
    gap: "Needs deeper grounding in institutional archive data to avoid generic recommendations.",
  },
];

const filterOptions = {
  department: [
    "All Departments",
    "Computer Science and Engineering",
    "Electrical and Electronic Engineering",
    "Civil and Environment Engineering",
    "Mechanical Engineering",
    "Chemical Engineering",
  ],
  year: ["All Years", "2026", "2025-2026", "2025"],
  difficulty: ["All Difficulties", "Intermediate", "Advanced"],
};

const popularQueries = [
  "campus maintenance analytics",
  "AI duplicate project detection",
  "student proposal assistant",
  "React FastAPI archive system",
];

function normalize(value) {
  return String(value || "").toLowerCase();
}

function scoreProject(project, query) {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  const haystack = normalize(
    [
      project.title,
      project.summary,
      project.abstract,
      project.department,
      project.domain,
      project.supervisor,
      project.technologies.join(" "),
      project.keywords.join(" "),
      project.outcomes.join(" "),
      project.gap,
    ].join(" "),
  );

  if (terms.length === 0) {
    return 72;
  }

  const directHits = terms.filter((term) => haystack.includes(term)).length;
  const phraseBoost = haystack.includes(normalize(query)) ? 18 : 0;
  return Math.min(96, Math.round(42 + (directHits / terms.length) * 40 + phraseBoost));
}

function normalizeApiResults(results) {
  if (!Array.isArray(results)) {
    return [];
  }

  return results.map((item, index) => {
    const metadata = item.metadata || item;

    return {
      id: item.project_id || metadata.project_id || `api_result_${index + 1}`,
      title: metadata.title || metadata.short_title || "Archived project",
      summary: item.document || metadata.summary || "Semantic search result from the archive.",
      abstract: metadata.abstract || item.document || "",
      department: metadata.department || "Department not specified",
      year: metadata.academic_year || metadata.year || "Year not specified",
      semester: metadata.semester || "Semester not specified",
      difficulty: metadata.difficulty || "Not rated",
      difficultyScore: metadata.difficulty_score || 0,
      supervisor: metadata.supervisor || "Supervisor not specified",
      domain: metadata.research_area || "Archive result",
      technologies: metadata.technologies || [],
      keywords: metadata.keywords || [],
      outcomes: metadata.outcomes || [],
      gap: metadata.gap || "Open the archived proposal for detailed research gaps and future scope.",
      match: item.distance_score ? Math.max(1, Math.round((1 - item.distance_score) * 100)) : 75,
      source: "api",
    };
  });
}

export default function SearchPage() {
  const [query, setQuery] = useState("campus maintenance analytics");
  const [submittedQuery, setSubmittedQuery] = useState("campus maintenance analytics");
  const [filters, setFilters] = useState({
    department: "All Departments",
    year: "All Years",
    difficulty: "All Difficulties",
  });
  const [selectedId, setSelectedId] = useState(archivedProjects[0].id);
  const [apiResults, setApiResults] = useState([]);
  const [status, setStatus] = useState("local");
  const [error, setError] = useState("");

  const localResults = useMemo(() => {
    return archivedProjects
      .filter((project) => filters.department === "All Departments" || project.department === filters.department)
      .filter((project) => filters.year === "All Years" || project.year === filters.year)
      .filter((project) => filters.difficulty === "All Difficulties" || project.difficulty === filters.difficulty)
      .map((project) => ({
        ...project,
        match: scoreProject(project, submittedQuery),
        source: "local",
      }))
      .sort((a, b) => b.match - a.match);
  }, [filters, submittedQuery]);

  const results = apiResults.length > 0 ? apiResults : localResults;
  const selected = results.find((project) => project.id === selectedId) || results[0] || localResults[0];

  const handleSearch = async (event) => {
    event.preventDefault();
    const nextQuery = query.trim();

    if (!nextQuery) {
      setError("Type a project theme, technology, problem domain, or research gap to search.");
      return;
    }

    setSubmittedQuery(nextQuery);
    setError("");
    setStatus("loading");

    try {
      const response = await searchArchivedProjects({ query: nextQuery, filters, topK: 6 });
      const normalized = normalizeApiResults(response?.results || response);

      if (normalized.length > 0) {
        setApiResults(normalized);
        setSelectedId(normalized[0].id);
        setStatus("api");
        return;
      }

      setApiResults([]);
      setSelectedId(localResults[0]?.id || archivedProjects[0].id);
      setStatus("local");
    } catch {
      setApiResults([]);
      setSelectedId(localResults[0]?.id || archivedProjects[0].id);
      setStatus("local");
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters((current) => ({
      ...current,
      [field]: value,
    }));
    setApiResults([]);
  };

  return (
    <main className="min-h-screen bg-[#f5f7f4] text-[#18221f]">
      <div className="border-b border-[#d9e1dc] bg-white">
        <header className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <a href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#0b6b61]">
                <ArrowLeft className="size-4" aria-hidden="true" />
                Home
              </a>
              <div className="mt-5 flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-md bg-[#e4f7f2] text-[#0b6b61]">
                  <Search className="size-6" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#0b6b61]">Student Archive Search</p>
                  <h1 className="text-3xl font-bold tracking-normal sm:text-4xl">Search Previous Projects</h1>
                </div>
              </div>
            </div>
            <a
              href="/student"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[#cfdad5] bg-white px-4 text-sm font-bold text-[#17201d] transition hover:border-[#15c7a8] hover:bg-[#f7fffc]"
            >
              Student Portal
              <ArrowRight className="size-4" aria-hidden="true" />
            </a>
          </div>

          <form onSubmit={handleSearch} className="grid gap-3 lg:grid-cols-[1fr_auto]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#0b6b61]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by topic, technology, problem domain, or research gap"
                className="h-14 w-full rounded-md border border-[#cfdad5] bg-[#fbfdfc] pl-12 pr-4 text-base outline-none transition focus:border-[#15c7a8] focus:ring-2 focus:ring-[#15c7a8]/20"
              />
            </label>
            <button
              type="submit"
              className="inline-flex h-14 items-center justify-center gap-2 rounded-md bg-[#15c7a8] px-6 text-sm font-bold text-[#071817] transition hover:bg-[#74ead7]"
            >
              {status === "loading" ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              Search Archive
            </button>
          </form>

          {error ? <p className="text-sm font-semibold text-[#9b3f31]">{error}</p> : null}

          <div className="flex flex-wrap gap-2">
            {popularQueries.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setQuery(item);
                  setSubmittedQuery(item);
                  setApiResults([]);
                }}
                className="rounded-md border border-[#d9e1dc] bg-[#f6f8f7] px-3 py-2 text-xs font-bold text-[#394842] transition hover:border-[#15c7a8] hover:bg-[#f2fffb]"
              >
                {item}
              </button>
            ))}
          </div>
        </header>
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[18rem_1fr] lg:px-8">
        <aside className="space-y-4">
          <section className="rounded-md border border-[#d9e1dc] bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="size-4 text-[#0b6b61]" aria-hidden="true" />
              <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-[#394842]">Filters</h2>
            </div>

            <div className="mt-4 space-y-4">
              {Object.entries(filterOptions).map(([field, options]) => (
                <label key={field} className="block">
                  <span className="text-xs font-bold uppercase tracking-[0.08em] text-[#64736f]">
                    {field}
                  </span>
                  <select
                    value={filters[field]}
                    onChange={(event) => handleFilterChange(field, event.target.value)}
                    className="mt-2 h-11 w-full rounded-md border border-[#cfdad5] bg-[#fbfdfc] px-3 text-sm font-semibold outline-none transition focus:border-[#15c7a8] focus:ring-2 focus:ring-[#15c7a8]/20"
                  >
                    {options.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-md border border-[#d9e1dc] bg-[#17201d] p-4 text-white shadow-sm">
            <div className="flex items-center gap-2">
              <Bot className="size-4 text-[#74ead7]" aria-hidden="true" />
              <h2 className="text-sm font-bold">Proposal-aligned search</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-white/72">
              This page supports the proposal goals: natural-language project discovery, similarity awareness, archive
              reuse, technology inspection, and RAG-ready source context.
            </p>
          </section>
        </aside>

        <section className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(22rem,0.65fr)]">
          <div className="min-w-0 space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                [Database, results.length, "matches"],
                [Filter, status === "api" ? "Live" : "Local", "source"],
                [BookOpenCheck, submittedQuery, "query"],
              ].map(([Icon, value, label]) => (
                <div key={label} className="rounded-md border border-[#d9e1dc] bg-white p-4 shadow-sm">
                  <Icon className="size-5 text-[#0b6b61]" aria-hidden="true" />
                  <p className="mt-3 truncate text-xl font-bold text-[#17201d]">{value}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.08em] text-[#64736f]">{label}</p>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              {results.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => setSelectedId(project.id)}
                  className={`w-full rounded-md border bg-white p-4 text-left shadow-sm transition ${
                    selected?.id === project.id
                      ? "border-[#15c7a8] ring-2 ring-[#15c7a8]/20"
                      : "border-[#d9e1dc] hover:border-[#15c7a8]"
                  }`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-['IBM_Plex_Mono'] text-xs font-bold uppercase tracking-[0.08em] text-[#64736f]">
                        {project.id} / {project.department}
                      </p>
                      <h2 className="mt-2 text-xl font-bold tracking-normal text-[#17201d]">{project.title}</h2>
                      <p className="mt-3 text-sm leading-6 text-[#52625d]">{project.summary}</p>
                    </div>
                    <div className="shrink-0 rounded-md bg-[#e5f8f4] px-3 py-2 text-center">
                      <p className="text-2xl font-bold text-[#0b6b61]">{project.match}%</p>
                      <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#52625d]">match</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {[project.year, project.difficulty, project.domain, ...project.keywords.slice(0, 3)].map((item) => (
                      <span key={item} className="rounded-md bg-[#f1f5f3] px-2.5 py-1 text-xs font-semibold text-[#52625d]">
                        {item}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {selected ? (
            <aside className="space-y-4">
              <article className="rounded-md border border-[#d9e1dc] bg-white p-5 shadow-sm">
                <p className="font-['IBM_Plex_Mono'] text-xs font-bold uppercase tracking-[0.08em] text-[#0b6b61]">
                  Selected archive record
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-normal">{selected.title}</h2>
                <p className="mt-4 text-sm leading-6 text-[#52625d]">{selected.abstract}</p>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {[
                    [CalendarDays, selected.year, selected.semester],
                    [GraduationCap, selected.department, selected.supervisor],
                    [Layers3, selected.difficulty, `${selected.difficultyScore || "-"} / 10 difficulty`],
                    [Wrench, selected.technologies.slice(0, 3).join(", ") || "Not specified", "core stack"],
                  ].map(([Icon, value, label]) => (
                    <div key={`${value}-${label}`} className="rounded-md bg-[#f6f8f7] p-3">
                      <Icon className="size-4 text-[#0b6b61]" aria-hidden="true" />
                      <p className="mt-2 text-sm font-bold text-[#17201d]">{value}</p>
                      <p className="mt-1 text-xs font-semibold text-[#64736f]">{label}</p>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-md border border-[#d9e1dc] bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <Lightbulb className="size-5 text-[#0b6b61]" aria-hidden="true" />
                  <h2 className="text-lg font-bold">Use this result</h2>
                </div>
                <div className="mt-4 space-y-3">
                  {selected.outcomes.map((item) => (
                    <p key={item} className="rounded-md bg-[#f6f8f7] p-3 text-sm font-semibold leading-6 text-[#394842]">
                      {item}
                    </p>
                  ))}
                </div>
              </article>

              <article className="rounded-md border border-[#d9e1dc] bg-[#fffaf0] p-5 shadow-sm">
                <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#9b6b1a]">Research gap</p>
                <p className="mt-3 text-sm leading-6 text-[#5c4c2f]">{selected.gap}</p>
              </article>
            </aside>
          ) : null}
        </section>
      </div>
    </main>
  );
}
