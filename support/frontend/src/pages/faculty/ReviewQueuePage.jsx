import { useMemo, useState } from "react";
import FacultyPortalPage from "./FacultyPortalPage";
import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  BookOpenCheck,
  Check,
  ClipboardList,
  FileSearch,
  Filter,
  MessageSquareText,
  PieChart as PieChartIcon,
  Search,
  Send,
  Stamp,
  X,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const statusStyles = {
  Pending: { color: "#b8862f", bg: "#fff4cf", ink: "PENDING REVIEW" },
  Approved: { color: "#6f8655", bg: "#eef5df", ink: "APPROVED" },
  Rejected: { color: "#9b3f31", bg: "#f8ded7", ink: "REJECTED" },
  Changes: { color: "#c06f2f", bg: "#fde8c9", ink: "REVISE" },
};

const initialProposals = [
  {
    id: "CSE-26-014",
    title: "Smart Campus Energy Optimizer",
    student: "Nadia Rahman",
    dept: "CSE",
    date: "2026-07-02",
    status: "Pending",
    similarity: 32,
    summary:
      "Strong applied systems proposal with measurable energy goals. Novelty depends on using adaptive schedules rather than a conventional dashboard-only IoT implementation.",
    matches: [
      {
        project: "IoT Based Energy Monitoring",
        percent: 32,
        source:
          "The system collects classroom energy usage through IoT sensors and recommends automated device schedules based on occupancy.",
        submitted:
          "The proposed platform collects campus energy data through IoT sensors and recommends adaptive schedules using occupancy and course routines.",
      },
      {
        project: "Green Building Analytics",
        percent: 21,
        source: "Historical utility data is analyzed to identify peak load patterns across academic buildings.",
        submitted: "Historical energy usage will be analyzed to identify inefficient rooms and recurring peak load windows.",
      },
    ],
  },
  {
    id: "EEE-26-009",
    title: "Low-Cost ECG Screening Kiosk",
    student: "Ariq Hossain",
    dept: "EEE",
    date: "2026-07-01",
    status: "Pending",
    similarity: 18,
    summary:
      "Feasible hardware-software integration with clear social value. The proposal should sharpen validation plans, especially how clinical feedback will be collected ethically.",
    matches: [
      {
        project: "Portable ECG Logger",
        percent: 18,
        source: "A portable ECG logger captures heart signals and forwards readings to a web dashboard for review.",
        submitted: "A kiosk captures ECG signals and forwards summarized readings to a review dashboard for screening.",
      },
    ],
  },
  {
    id: "BBA-26-022",
    title: "Retail Demand Forecasting for SMEs",
    student: "Samia Karim",
    dept: "BBA",
    date: "2026-06-29",
    status: "Changes",
    similarity: 45,
    summary:
      "Useful business analytics direction, but the current scope overlaps heavily with prior sales prediction work. Needs clearer SME-specific constraints and data acquisition detail.",
    matches: [
      {
        project: "Sales Forecasting Dashboard",
        percent: 45,
        source: "The dashboard predicts retail sales using seasonal trends, promotions, and historical transaction data.",
        submitted: "The system predicts retail demand using seasonal patterns, promotions, and historical transaction data.",
      },
      {
        project: "Inventory Planner",
        percent: 27,
        source: "Inventory reorder points are generated from weekly sales velocity and supplier lead time.",
        submitted: "Inventory suggestions will consider weekly sales velocity, supplier lead time, and stockout risk.",
      },
    ],
  },
  {
    id: "CSE-26-031",
    title: "Bangla Legal Aid Chatbot",
    student: "Mahir Chowdhury",
    dept: "CSE",
    date: "2026-06-27",
    status: "Approved",
    similarity: 14,
    summary:
      "Clear archive distinction and strong language-access angle. Approved with a recommendation to document retrieval sources and escalation boundaries.",
    matches: [
      {
        project: "Legal FAQ Assistant",
        percent: 14,
        source: "The assistant retrieves legal FAQ answers and shows citations for basic civil guidance.",
        submitted: "The chatbot retrieves Bangla legal aid answers with citations and guidance boundaries.",
      },
    ],
  },
  {
    id: "ARC-26-006",
    title: "Flood-Responsive Shelter Planner",
    student: "Tarin Ahmed",
    dept: "ARC",
    date: "2026-06-24",
    status: "Rejected",
    similarity: 61,
    summary:
      "The concept is valuable, but the submitted plan repeats prior flood shelter optimization work with limited new technical or design contribution.",
    matches: [
      {
        project: "Emergency Shelter Route Optimizer",
        percent: 61,
        source:
          "The model ranks flood shelters by route distance, crowd capacity, and water-level risk using GIS layers.",
        submitted:
          "The planner ranks flood shelters by route distance, capacity, and water-level risk using GIS data layers.",
      },
    ],
  },
];

const highlightWords = ["collects", "iot", "sensors", "recommends", "schedules", "historical", "predicts", "retail", "route", "distance", "capacity", "risk", "retrieves", "citations"];

function highlightOverlap(text) {
  return text.split(/(\W+)/).map((part, index) => {
    const normalized = part.toLowerCase();
    return highlightWords.includes(normalized) ? (
      <mark key={`${part}-${index}`} className="rounded-sm bg-[#f3c96b]/55 px-1 text-[#1c2b45]">
        {part}
      </mark>
    ) : (
      part
    );
  });
}

export default function ReviewQueuePage() {
  return <FacultyPortalPage />;
}

function LegacyReviewQueuePage() {
  const [proposals, setProposals] = useState(initialProposals);
  const [selectedId, setSelectedId] = useState(initialProposals[0].id);
  const [statusFilter, setStatusFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [expandedMatch, setExpandedMatch] = useState(0);
  const [comment, setComment] = useState("");
  const [toast, setToast] = useState("");

  const selected = proposals.find((proposal) => proposal.id === selectedId) || proposals[0];
  const filtered = proposals.filter((proposal) => {
    const matchesStatus = statusFilter === "All" || proposal.status === statusFilter;
    const text = `${proposal.id} ${proposal.title} ${proposal.student} ${proposal.dept}`.toLowerCase();
    return matchesStatus && text.includes(query.toLowerCase());
  });

  const analytics = useMemo(() => {
    const byStatus = Object.keys(statusStyles).map((status) => ({
      name: status,
      value: proposals.filter((proposal) => proposal.status === status).length,
      color: statusStyles[status].color,
    }));
    const byDept = [...new Set(proposals.map((proposal) => proposal.dept))].map((dept) => ({
      dept,
      proposals: proposals.filter((proposal) => proposal.dept === dept).length,
    }));
    const trend = proposals
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((proposal, index) => ({ date: proposal.date.slice(5), submissions: index + 1 }));
    return { byStatus, byDept, trend };
  }, [proposals]);

  const decide = (nextStatus) => {
    if (!comment.trim()) {
      setToast("Add a review comment before sending a decision.");
      return;
    }
    setProposals((current) =>
      current.map((proposal) => (proposal.id === selected.id ? { ...proposal, status: nextStatus } : proposal)),
    );
    setToast(`${statusStyles[nextStatus].ink} stamped on ${selected.id}. Student alert sent.`);
    setComment("");
  };

  return (
    <main className="min-h-screen bg-[#f4efe2] text-[#1c2b45]">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="bg-[#12213a] px-5 py-6 text-[#f8efd9]">
          <a href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#f3c96b]">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Home
          </a>
          <div className="mt-10">
            <p className="font-['IBM_Plex_Mono'] text-xs uppercase tracking-[0.18em] text-[#b8c0aa]">Faculty Desk</p>
            <h1 className="mt-3 font-['Source_Serif_4'] text-4xl font-semibold leading-tight">Academic Review Dossiers</h1>
          </div>
          <nav className="mt-10 space-y-2 text-sm font-semibold">
            {[
              [ClipboardList, "Review Queue", "#queue"],
              [FileSearch, "Similarity", "#similarity"],
              [PieChartIcon, "Analytics", "#analytics"],
            ].map(([Icon, label, href]) => (
              <a key={label} href={href} className="flex items-center gap-3 rounded-md px-3 py-3 text-[#f8efd9] hover:bg-white/10">
                <Icon className="size-4 text-[#f3c96b]" aria-hidden="true" />
                {label}
              </a>
            ))}
          </nav>
        </aside>

        <section className="px-4 py-5 sm:px-6 lg:px-8">
          {toast && (
            <div className="fixed right-4 top-4 z-20 flex max-w-sm items-start gap-3 rounded-md border border-[#d2ae67] bg-[#fff8e6] p-4 text-sm font-semibold shadow-lg">
              <Bell className="mt-0.5 size-4 text-[#b8862f]" aria-hidden="true" />
              <span>{toast}</span>
              <button type="button" onClick={() => setToast("")} className="ml-auto text-[#6c5a36]">
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
          )}

          <header className="flex flex-col gap-4 border-b border-[#d8ceb8] pb-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-['IBM_Plex_Mono'] text-xs uppercase tracking-[0.18em] text-[#8c4d3f]">Spring 2026 Review Board</p>
              <h2 className="mt-2 font-['Source_Serif_4'] text-4xl font-semibold text-[#17223a]">Proposal Review Desk</h2>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                ["Total", proposals.length],
                ["Pending", proposals.filter((p) => p.status === "Pending").length],
                ["Avg Sim.", `${Math.round(proposals.reduce((sum, p) => sum + p.similarity, 0) / proposals.length)}%`],
              ].map(([label, value]) => (
                <div key={label} className="border-l-4 border-[#b8862f] bg-[#fffaf0] px-4 py-3 shadow-sm">
                  <p className="font-['IBM_Plex_Mono'] text-[11px] uppercase text-[#6f6a5d]">{label}</p>
                  <p className="mt-1 font-['Source_Serif_4'] text-2xl font-semibold">{value}</p>
                </div>
              ))}
            </div>
          </header>

          <div className="mt-6 grid gap-6 xl:grid-cols-[420px_1fr]">
            <section id="queue" className="rounded-md border border-[#d8ceb8] bg-[#fffaf0]">
              <div className="border-b border-[#d8ceb8] p-4">
                <div className="flex items-center gap-2 rounded-md border border-[#d8ceb8] bg-white px-3 py-2">
                  <Search className="size-4 text-[#7b745f]" aria-hidden="true" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search dossier, student, department"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-[#8f8876]"
                  />
                </div>
                <div className="mt-3 flex items-center gap-2 overflow-x-auto">
                  <Filter className="size-4 shrink-0 text-[#8c4d3f]" aria-hidden="true" />
                  {["All", "Pending", "Approved", "Changes", "Rejected"].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setStatusFilter(status)}
                      className={`h-8 rounded-md border px-3 font-['IBM_Plex_Mono'] text-xs ${
                        statusFilter === status ? "border-[#1c2b45] bg-[#1c2b45] text-white" : "border-[#d8ceb8] bg-white"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div className="max-h-[690px] overflow-y-auto">
                {filtered.map((proposal) => (
                  <button
                    key={proposal.id}
                    type="button"
                    onClick={() => {
                      setSelectedId(proposal.id);
                      setExpandedMatch(0);
                    }}
                    className={`grid w-full grid-cols-[7px_1fr] border-b border-[#eadfc7] text-left transition hover:bg-[#fff5db] ${
                      proposal.id === selected.id ? "bg-[#fff1ca]" : "bg-transparent"
                    }`}
                  >
                    <span style={{ backgroundColor: statusStyles[proposal.status].color }} />
                    <span className="p-4">
                      <span className="flex items-start justify-between gap-3">
                        <span>
                          <span className="font-['IBM_Plex_Mono'] text-xs text-[#786f5a]">{proposal.id}</span>
                          <span className="mt-1 block font-['Source_Serif_4'] text-xl font-semibold leading-tight">{proposal.title}</span>
                        </span>
                        <span
                          className="rotate-[-6deg] border-2 px-2 py-1 font-['IBM_Plex_Mono'] text-[10px] font-bold uppercase"
                          style={{ borderColor: statusStyles[proposal.status].color, color: statusStyles[proposal.status].color }}
                        >
                          {statusStyles[proposal.status].ink}
                        </span>
                      </span>
                      <span className="mt-3 grid grid-cols-3 gap-2 font-['IBM_Plex_Mono'] text-[11px] text-[#6f6a5d]">
                        <span>{proposal.student}</span>
                        <span>{proposal.dept}</span>
                        <span>{proposal.date}</span>
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-6">
              <article className="rounded-md border border-[#d8ceb8] bg-[#fffaf0] p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-['IBM_Plex_Mono'] text-xs uppercase tracking-[0.14em] text-[#6f6a5d]">{selected.id}</p>
                    <h3 className="mt-2 font-['Source_Serif_4'] text-3xl font-semibold">{selected.title}</h3>
                    <p className="mt-2 text-sm text-[#5d5a4f]">{selected.student} · {selected.dept} · {selected.date}</p>
                  </div>
                  <div
                    className="inline-flex rotate-[-7deg] items-center gap-2 border-4 px-4 py-3 font-['IBM_Plex_Mono'] text-sm font-bold uppercase"
                    style={{ borderColor: statusStyles[selected.status].color, color: statusStyles[selected.status].color }}
                  >
                    <Stamp className="size-4" aria-hidden="true" />
                    {statusStyles[selected.status].ink}
                  </div>
                </div>

                <div className="mt-5 border-l-4 border-[#b8862f] bg-[#fff4cf] p-4">
                  <p className="flex items-center gap-2 font-['IBM_Plex_Mono'] text-xs font-bold uppercase text-[#745421]">
                    <BookOpenCheck className="size-4" aria-hidden="true" />
                    AI Summary Annotation
                  </p>
                  <p className="mt-3 font-['Source_Serif_4'] text-lg leading-7 text-[#2c2b25]">{selected.summary}</p>
                </div>
              </article>

              <article id="similarity" className="rounded-md border border-[#d8ceb8] bg-[#fffaf0] p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-['IBM_Plex_Mono'] text-xs uppercase tracking-[0.14em] text-[#8c4d3f]">Similarity Report</p>
                    <h3 className="mt-1 font-['Source_Serif_4'] text-2xl font-semibold">Matched Archive Excerpts</h3>
                  </div>
                  <span className="font-['IBM_Plex_Mono'] text-2xl font-bold text-[#9b3f31]">{selected.similarity}%</span>
                </div>

                <div className="mt-4 space-y-3">
                  {selected.matches.map((match, index) => (
                    <button
                      key={match.project}
                      type="button"
                      onClick={() => setExpandedMatch(index)}
                      className="w-full rounded-md border border-[#eadfc7] bg-white p-3 text-left hover:border-[#b8862f]"
                    >
                      <span className="flex items-center justify-between gap-3">
                        <span className="font-semibold">{match.project}</span>
                        <span className="font-['IBM_Plex_Mono'] text-sm font-bold">{match.percent}%</span>
                      </span>
                      <span className="mt-2 block h-2 overflow-hidden rounded-full bg-[#eee4cd]">
                        <span className="block h-full" style={{ width: `${match.percent}%`, backgroundColor: match.percent > 40 ? "#9b3f31" : "#b8862f" }} />
                      </span>
                    </button>
                  ))}
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {["Archived Source", "Submitted Proposal"].map((label, index) => {
                    const match = selected.matches[expandedMatch];
                    return (
                      <div key={label} className="rounded-md border border-[#d8ceb8] bg-[#fdf8ea] p-4">
                        <p className="font-['IBM_Plex_Mono'] text-xs font-bold uppercase text-[#6f6a5d]">{label}</p>
                        <p className="mt-3 min-h-24 text-sm leading-7">{highlightOverlap(index === 0 ? match.source : match.submitted)}</p>
                      </div>
                    );
                  })}
                </div>
              </article>

              <article className="rounded-md border border-[#d8ceb8] bg-[#fffaf0] p-5">
                <p className="font-['IBM_Plex_Mono'] text-xs uppercase tracking-[0.14em] text-[#8c4d3f]">Decision Panel</p>
                <textarea
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder="Required review comment for the student notification"
                  className="mt-3 min-h-28 w-full rounded-md border border-[#d8ceb8] bg-white p-3 text-sm outline-none focus:border-[#b8862f]"
                />
                <div className="mt-3 flex flex-wrap gap-3">
                  <button type="button" onClick={() => decide("Approved")} className="inline-flex h-10 items-center gap-2 rounded-md bg-[#6f8655] px-4 text-sm font-bold text-white">
                    <Check className="size-4" aria-hidden="true" />
                    Approve
                  </button>
                  <button type="button" onClick={() => decide("Changes")} className="inline-flex h-10 items-center gap-2 rounded-md bg-[#c06f2f] px-4 text-sm font-bold text-white">
                    <MessageSquareText className="size-4" aria-hidden="true" />
                    Request Changes
                  </button>
                  <button type="button" onClick={() => decide("Rejected")} className="inline-flex h-10 items-center gap-2 rounded-md bg-[#9b3f31] px-4 text-sm font-bold text-white">
                    <AlertTriangle className="size-4" aria-hidden="true" />
                    Reject
                  </button>
                  <span className="inline-flex items-center gap-2 font-['IBM_Plex_Mono'] text-xs text-[#6f6a5d]">
                    <Send className="size-4" aria-hidden="true" />
                    Student alert is simulated by toast
                  </span>
                </div>
              </article>
            </section>
          </div>

          <section id="analytics" className="mt-6 rounded-md border border-[#d8ceb8] bg-[#fffaf0] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-['IBM_Plex_Mono'] text-xs uppercase tracking-[0.14em] text-[#8c4d3f]">Analytics Dashboard</p>
                <h3 className="mt-1 font-['Source_Serif_4'] text-2xl font-semibold">Live Review Measures</h3>
              </div>
            </div>
            <div className="mt-5 grid gap-5 lg:grid-cols-3">
              <div className="h-72 rounded-md border border-[#eadfc7] bg-white p-4">
                <p className="font-['IBM_Plex_Mono'] text-xs font-bold uppercase text-[#6f6a5d]">Submission Trend</p>
                <ResponsiveContainer width="100%" height="88%">
                  <LineChart data={analytics.trend}>
                    <CartesianGrid stroke="#eee4cd" />
                    <XAxis dataKey="date" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="submissions" stroke="#b8862f" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="h-72 rounded-md border border-[#eadfc7] bg-white p-4">
                <p className="font-['IBM_Plex_Mono'] text-xs font-bold uppercase text-[#6f6a5d]">Status Breakdown</p>
                <ResponsiveContainer width="100%" height="88%">
                  <PieChart>
                    <Pie data={analytics.byStatus} dataKey="value" nameKey="name" innerRadius={48} outerRadius={82} label>
                      {analytics.byStatus.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="h-72 rounded-md border border-[#eadfc7] bg-white p-4">
                <p className="font-['IBM_Plex_Mono'] text-xs font-bold uppercase text-[#6f6a5d]">By Department</p>
                <ResponsiveContainer width="100%" height="88%">
                  <BarChart data={analytics.byDept}>
                    <CartesianGrid stroke="#eee4cd" />
                    <XAxis dataKey="dept" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="proposals" fill="#6f8655" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
