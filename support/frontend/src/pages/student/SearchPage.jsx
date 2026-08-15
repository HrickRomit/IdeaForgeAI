import { useEffect, useMemo, useState } from "react";
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
import { getArchivedProjects } from "../../api/adminApi";
import ArchivedProjectDetailModal from "../../components/student/ArchivedProjectDetailModal.jsx";
import StudentNavbar from "../../components/student/StudentNavbar.jsx";

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
    title: "AI Project Archive Search & RAG Intelligence",
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
    title: "Student Capstone Research Assistant",
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
  {
    id: "project_0004",
    title: "Electronic Health Records (EHR) & Blockchain Prescription Verification",
    summary:
      "A decentralized medical record and smart contract verification system preventing prescription fraud and unauthorized medical tampering.",
    abstract:
      "Patient data is securely stored and medical prescriptions are tokenized on a blockchain network to ensure authenticity and immutability.",
    department: "Computer Science and Engineering",
    year: "2024-2025",
    semester: "Fall",
    difficulty: "Advanced",
    difficultyScore: 9,
    supervisor: "Dr. Tanvir Ahmed",
    domain: "Blockchain & Cybersecurity",
    technologies: ["Solidity", "TypeScript", "Next.js", "Hardhat", "IPFS"],
    keywords: ["blockchain", "EHR", "smart contracts", "prescription verification", "security"],
    outcomes: [
      "Immutable prescription issuance and verification",
      "Decentralized record storage using IPFS",
      "Cryptographic audit trails for pharmacy workflows",
    ],
    gap: "Future scope includes zero-knowledge proof verification without exposing patient data.",
  },
  {
    id: "project_0005",
    title: "Intelligent Traffic Management & Automated Congestion Analytics",
    summary:
      "A computer vision system for real-time intersection Monitoring, traffic signal timing optimization, and vehicle count analytics.",
    abstract:
      "Processes CCTV camera streams using YOLO object detection to dynamically adjust traffic light durations based on lane congestion.",
    department: "Electrical and Electronic Engineering",
    year: "2025",
    semester: "Spring",
    difficulty: "Advanced",
    difficultyScore: 8,
    supervisor: "Prof. Mahmud Hasan",
    domain: "Computer Vision & Smart Cities",
    technologies: ["Python", "YOLOv8", "OpenCV", "PyTorch", "Raspberry Pi"],
    keywords: ["traffic optimization", "computer vision", "YOLO", "smart traffic light", "congestion analytics"],
    outcomes: [
      "Real-time vehicle classification and counting",
      "Dynamic adaptive green-light duration calculation",
      "Emergency vehicle priority routing alert",
    ],
    gap: "Can be integrated with connected vehicle V2X communications for predictive corridor management.",
  },
  {
    id: "project_0006",
    title: "Decentralized Peer-to-Peer Renewable Energy Microgrid Trading",
    summary:
      "An IoT smart meter and micro-grid energy exchange system enabling residential solar owners to trade surplus power locally.",
    abstract:
      "Combines embedded power sensors with automated smart contract settlement to manage microgrid voltage stability and credit billing.",
    department: "Electrical and Electronic Engineering",
    year: "2026",
    semester: "Spring",
    difficulty: "Advanced",
    difficultyScore: 8,
    supervisor: "Dr. Suraia Parveen",
    domain: "Renewable Energy & IoT",
    technologies: ["ESP32", "MQTT", "Python", "Node.js", "InfluxDB"],
    keywords: ["renewable energy", "smart grid", "P2P trading", "solar microgrid", "IoT meter"],
    outcomes: [
      "Real-time power generation & load consumption tracking",
      "Automated P2P energy auction matching",
      "Microgrid voltage regulation dashboard",
    ],
    gap: "Needs battery storage degradation modeling and automated load shedding mechanisms.",
  },
  {
    id: "project_0007",
    title: "Autonomous Drone-Based Structural Defect Detection",
    summary:
      "An aerial inspection system that captures bridge and building imagery to automatically classify concrete cracks and rebar corrosion.",
    abstract:
      "Combines drone flight telemetry with deep learning semantic segmentation models to generate automated structural health reports.",
    department: "Civil and Environment Engineering",
    year: "2025",
    semester: "Fall",
    difficulty: "Intermediate",
    difficultyScore: 7,
    supervisor: "Dr. Tariqul Islam",
    domain: "Infrastructure & Inspection",
    technologies: ["Python", "TensorFlow", "OpenCV", "QGIS", "Flask"],
    keywords: ["drone inspection", "defect detection", "structural health", "concrete crack", "GIS"],
    outcomes: [
      "Automated crack width and depth estimation",
      "3D building defect heatmap generation",
      "Inspection PDF report generation",
    ],
    gap: "Can be extended with thermal imaging sensors to detect sub-surface voids.",
  },
  {
    id: "project_0008",
    title: "IoT Smart Water Quality & Pipeline Leakage Monitoring System",
    summary:
      "A wireless sensor network deployed across municipal water distribution pipes to detect turbidity, pH, contamination, and acoustic pressure leaks.",
    abstract:
      "Monitors real-time water purity metrics and uses differential pressure sensors to pinpoint pipe rupture locations within urban supply lines.",
    department: "Civil and Environment Engineering",
    year: "2024-2025",
    semester: "Summer",
    difficulty: "Intermediate",
    difficultyScore: 6,
    supervisor: "Engr. Rafiqul Alam",
    domain: "Environmental Monitoring",
    technologies: ["Arduino", "LoRaWAN", "Python", "ThingSpeak", "Grafana"],
    keywords: ["water quality", "leak detection", "sensor network", "LoRaWAN", "environmental monitoring"],
    outcomes: [
      "Continuous pH, turbidity, and total dissolved solids tracking",
      "Acoustic leak detection alerting",
      "Geographic map view for maintenance crews",
    ],
    gap: "Future scope includes bio-sensor integration for detecting specific bacterial contamination.",
  },
];

const filterOptions = {
  department: [
    "All Departments",
    "Computer Science and Engineering",
    "Electrical and Electronic Engineering",
    "Civil and Environment Engineering",
    "Mechanical Engineering",
  ],
  year: ["All Years", "2026", "2025-2026", "2025", "2024-2025"],
  difficulty: ["All Difficulties", "Intermediate", "Advanced"],
};

const popularQueries = [
  "Blockchain",
  "Smart Campus",
  "Traffic Management",
  "Drone",
  "Water Quality",
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
      ...(project.technologies || []),
      ...(project.keywords || []),
      ...(project.outcomes || []),
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
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [filters, setFilters] = useState({
    department: "All Departments",
    year: "All Years",
    difficulty: "All Difficulties",
  });
  const [dbArchiveProjects, setDbArchiveProjects] = useState([]);
  const [selectedId, setSelectedId] = useState(archivedProjects[0].id);
  const [apiResults, setApiResults] = useState([]);
  const [status, setStatus] = useState("local");
  const [error, setError] = useState("");
  const [activeModalProject, setActiveModalProject] = useState(null);

  useEffect(() => {
    async function loadBackendArchives() {
      try {
        const response = await getArchivedProjects();
        const data = response.data || [];
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((item) => ({
            id: `archive_${item.id}`,
            title: item.title,
            summary: item.abstract,
            abstract: item.abstract,
            department: item.department_name || item.department?.name || "Computer Science and Engineering",
            year: item.academic_year || "2025-2026",
            semester: "Fall",
            difficulty: "Intermediate",
            difficultyScore: 7,
            supervisor: item.supervisor_name || "Faculty Advisor",
            domain: "Academic Systems",
            technologies: Array.isArray(item.technology_stack)
              ? item.technology_stack
              : typeof item.technology_stack === "string"
              ? item.technology_stack.split(",").map((s) => s.trim())
              : ["Python", "FastAPI", "React"],
            keywords: Array.isArray(item.keywords)
              ? item.keywords
              : typeof item.keywords === "string"
              ? item.keywords.split(",").map((s) => s.trim())
              : ["archive", "project"],
            outcomes: [
              "Role-based capstone tracking and evaluation",
              "Automated record cataloging and indexing",
              "Semantic search and proposal discovery",
            ],
            gap: "Future scope notes potential for domain-specific LLM fine-tuning, real-time collaboration, and predictive analytics.",
          }));
          setDbArchiveProjects(mapped);
        }
      } catch {
        // Fall back gracefully to full sample catalog
      }
    }
    loadBackendArchives();
  }, []);

  const allProjects = useMemo(() => {
    const combined = [...dbArchiveProjects];
    archivedProjects.forEach((proj) => {
      if (!combined.some((item) => item.id === proj.id || item.title.toLowerCase() === proj.title.toLowerCase())) {
        combined.push(proj);
      }
    });
    return combined;
  }, [dbArchiveProjects]);

  const localResults = useMemo(() => {
    const q = submittedQuery.trim().toLowerCase();
    return allProjects
      .filter((project) => filters.department === "All Departments" || project.department === filters.department)
      .filter((project) => filters.year === "All Years" || project.year === filters.year)
      .filter((project) => filters.difficulty === "All Difficulties" || project.difficulty === filters.difficulty)
      .filter((project) => {
        if (!q) return true; // Show ALL projects when search box is empty
        // Search strictly in project title
        return String(project.title || "").toLowerCase().includes(q);
      });
  }, [allProjects, filters, submittedQuery]);

  const results = apiResults.length > 0 ? apiResults : localResults;
  const selected = results.find((project) => project.id === selectedId) || results[0] || localResults[0];

  const handleSearch = async (event) => {
    if (event) event.preventDefault();
    const nextQuery = query.trim();
    setSubmittedQuery(nextQuery);
    setError("");

    if (!nextQuery) {
      setApiResults([]);
      setStatus("local");
      return;
    }

    setStatus("loading");

    try {
      const response = await searchArchivedProjects({ query: nextQuery, filters, topK: 10 });
      const normalized = normalizeApiResults(response?.results || response);
      const titleFiltered = normalized.filter((item) =>
        String(item.title || "").toLowerCase().includes(nextQuery.toLowerCase())
      );

      if (titleFiltered.length > 0) {
        setApiResults(titleFiltered);
        setSelectedId(titleFiltered[0].id);
        setStatus("api");
        return;
      }

      setApiResults([]);
      setStatus("local");
    } catch {
      setApiResults([]);
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
      <StudentNavbar activeTab="archive" />
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
              Student Dashboard
              <ArrowRight className="size-4" aria-hidden="true" />
            </a>
          </div>


          <form onSubmit={handleSearch} className="grid gap-3 lg:grid-cols-[1fr_auto]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#0b6b61]" />
              <input
                value={query}
                onChange={(event) => {
                  const val = event.target.value;
                  setQuery(val);
                  if (!val.trim()) {
                    setSubmittedQuery("");
                    setApiResults([]);
                  }
                }}
                placeholder="Search by topic, technology, or leave empty to view full archive..."
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
                <div
                  key={project.id}
                  onClick={() => {
                    setSelectedId(project.id);
                    setActiveModalProject(project);
                  }}
                  className={`group cursor-pointer rounded-xl border bg-white p-5 text-left shadow-sm transition hover:border-[#15c7a8] hover:shadow-md ${
                    selected?.id === project.id
                      ? "border-[#15c7a8] ring-2 ring-[#15c7a8]/20"
                      : "border-[#d9e1dc]"
                  }`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="font-['IBM_Plex_Mono'] text-xs font-bold uppercase tracking-[0.08em] text-[#0b6b61]">
                        {project.id} / {project.department}
                      </p>
                      <h2 className="mt-2 text-xl font-bold tracking-normal text-[#17201d] transition group-hover:text-[#0b6b61]">
                        {project.title}
                      </h2>
                      <p className="mt-2.5 text-sm leading-6 text-[#52625d]">{project.summary}</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedId(project.id);
                        setActiveModalProject(project);
                      }}
                      className="shrink-0 rounded-xl bg-[#e5f8f4] px-3.5 py-2 text-xs font-bold text-[#0b6b61] transition hover:bg-[#15c7a8] hover:text-[#071817]"
                    >
                      View Details & Ask AI →
                    </button>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#edf2ef] pt-3">
                    {[project.year, project.difficulty, project.domain, ...project.keywords.slice(0, 3)].map((item) => (
                      <span key={item} className="rounded-md bg-[#f1f5f3] px-2.5 py-1 text-xs font-semibold text-[#52625d]">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
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

              <button
                type="button"
                onClick={() => setActiveModalProject(selected)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#15c7a8] py-3.5 text-sm font-bold text-[#071817] shadow-sm transition hover:bg-[#74ead7]"
              >
                <Bot className="size-4" /> Open Interactive Modal & Ask AI
              </button>
            </aside>
          ) : null}
        </section>
      </div>

      {activeModalProject && (
        <ArchivedProjectDetailModal
          project={activeModalProject}
          onClose={() => setActiveModalProject(null)}
        />
      )}
    </main>
  );
}
