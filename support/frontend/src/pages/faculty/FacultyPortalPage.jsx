import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  BookOpenCheck,
  ClipboardList,
  FileSearch,
  LayoutDashboard,
  PieChart as PieChartIcon,
  Stamp,
  UserCircle,
  X,
} from "lucide-react";
import AnalyticsCharts from "../../components/faculty/AnalyticsCharts";
import ProposalReviewPanel from "../../components/faculty/ProposalReviewPanel";
import ReviewQueue from "../../components/faculty/ReviewQueue";
import SimilarityDetailView from "../../components/faculty/SimilarityDetailView";
import { facultyMember, getAssignedProposals, initialProposals, statusStyles } from "../../components/faculty/facultyMockData";

function FacultyOverview({ proposals, pendingCount, averageSimilarity, onNavigate }) {
  const [showProfile, setShowProfile] = useState(false);
  const approvedCount = proposals.filter((proposal) => proposal.status === "Approved").length;
  const rejectedCount = proposals.filter((proposal) => proposal.status === "Rejected").length;
  const latestPending = proposals.find((proposal) => proposal.status === "Pending");

  const actions = [
    {
      icon: FileSearch,
      title: "View Projects",
      copy: "See every assigned project grouped by review status.",
      view: "projects",
    },
    {
      icon: ClipboardList,
      title: "Open Review Queue",
      copy: "Review pending projects and send decisions to students.",
      view: "queue",
    },
    {
      icon: PieChartIcon,
      title: "Check Analytics",
      copy: "Track approval rate, rejection rate, departments, and submission trends.",
      view: "analytics",
    },
  ];

  return (
    <section className="space-y-6">
      <article className="rounded-md border border-[#d9e1dc] bg-[#17201d] p-6 text-white shadow-sm">
        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#74ead7]">Welcome Back</p>
            <h3 className="mt-3 text-3xl font-bold tracking-normal sm:text-4xl">
              Hello, {facultyMember.name}
            </h3>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/72">
              Your faculty workspace is ready for project monitoring, pending reviews, and review analytics.
            </p>
            {latestPending && (
              <button
                type="button"
                onClick={() => onNavigate("queue", latestPending.id)}
                className="mt-6 inline-flex h-11 items-center gap-2 rounded-md bg-[#15c7a8] px-4 text-sm font-bold text-[#071817] transition hover:bg-[#74ead7]"
              >
                Continue Latest Review
                <ArrowRight className="size-4" aria-hidden="true" />
              </button>
            )}
          </div>

          <div className="rounded-md border border-white/12 bg-white/7 p-5">
            <div className="flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-md bg-[#15c7a8] text-[#071817]">
                <UserCircle className="size-6" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-bold">{facultyMember.name}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-white/62">
                  {facultyMember.department} / {facultyMember.id}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowProfile((current) => !current)}
              className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-white/16 bg-white/8 px-4 text-sm font-bold text-white transition hover:bg-white/14"
            >
              <UserCircle className="size-4" aria-hidden="true" />
              View Profile
            </button>
          </div>
        </div>
      </article>

      {showProfile && (
        <article className="rounded-md border border-[#d9e1dc] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-md bg-[#e5f8f4] text-[#0b6b61]">
              <UserCircle className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#0b6b61]">Faculty Profile</p>
              <h3 className="mt-1 text-xl font-bold text-[#17201d]">{facultyMember.name}</h3>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              ["Faculty ID", facultyMember.id],
              ["Department", facultyMember.department],
              ["Assigned Projects", proposals.length],
            ].map(([label, value]) => (
              <div key={label} className="rounded-md bg-[#f6f8f7] px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#64736f]">{label}</p>
                <p className="mt-1 text-sm font-bold text-[#17201d]">{value}</p>
              </div>
            ))}
          </div>
        </article>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Assigned", proposals.length],
          ["Pending", pendingCount],
          ["Approved", approvedCount],
          ["Rejected", rejectedCount],
        ].map(([label, value]) => (
          <div key={label} className="rounded-md border border-[#d9e1dc] bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#64736f]">{label}</p>
            <p className="mt-1 text-2xl font-bold text-[#0b6b61]">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {actions.map(({ icon: Icon, title, copy, view }) => (
          <button
            key={title}
            type="button"
            onClick={() => onNavigate(view)}
            className="group rounded-md border border-[#d9e1dc] bg-white p-5 text-left shadow-sm transition hover:border-[#15c7a8] hover:bg-[#f2fffb]"
          >
            <span className="grid size-11 place-items-center rounded-md bg-[#e5f8f4] text-[#0b6b61] transition group-hover:bg-[#15c7a8] group-hover:text-[#071817]">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <span className="mt-5 block text-lg font-bold text-[#17201d]">{title}</span>
            <span className="mt-2 block text-sm leading-6 text-[#52625d]">{copy}</span>
          </button>
        ))}
      </div>

      <article className="rounded-md border border-[#d9e1dc] bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#0b6b61]">Workspace Snapshot</p>
            <h3 className="mt-1 text-2xl font-bold tracking-normal">Current review load</h3>
          </div>
          <div className="rounded-md bg-[#f6f8f7] px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#64736f]">Average Similarity</p>
            <p className="mt-1 text-2xl font-bold text-[#0b6b61]">{averageSimilarity}%</p>
          </div>
        </div>
      </article>
    </section>
  );
}

function ProjectOverview({ proposals, onReviewProject }) {
  const statusOrder = ["Pending", "Approved", "Rejected", "Changes"];
  const visibleStatuses = statusOrder.filter((status) => proposals.some((proposal) => proposal.status === status));

  return (
    <section className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {visibleStatuses.map((status) => (
          <div key={status} className="rounded-md border border-[#d9e1dc] bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#64736f]">{status}</p>
            <p className="mt-1 text-2xl font-bold" style={{ color: statusStyles[status].color }}>
              {proposals.filter((proposal) => proposal.status === status).length}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {proposals.map((proposal) => (
          <article key={proposal.id} className="rounded-md border border-[#d9e1dc] bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#0b6b61]">{proposal.id}</p>
                <h3 className="mt-2 text-xl font-bold leading-tight text-[#17201d]">{proposal.title}</h3>
                <p className="mt-2 text-sm text-[#64736f]">
                  {proposal.student} / {proposal.dept} / {proposal.date}
                </p>
              </div>
              <span
                className="rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em]"
                style={{
                  borderColor: statusStyles[proposal.status].color,
                  backgroundColor: statusStyles[proposal.status].bg,
                  color: statusStyles[proposal.status].color,
                }}
              >
                {statusStyles[proposal.status].ink}
              </span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-md bg-[#f6f8f7] px-3 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#64736f]">Similarity</p>
                <p className="mt-1 text-lg font-bold text-[#0b6b61]">{proposal.similarity}%</p>
              </div>
              <div className="rounded-md bg-[#f6f8f7] px-3 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#64736f]">Notifications</p>
                <p className="mt-1 text-lg font-bold text-[#0b6b61]">{proposal.notifications?.length || 0}</p>
              </div>
            </div>

            <p className="mt-4 line-clamp-2 text-sm leading-6 text-[#394842]">{proposal.summary}</p>

            {proposal.status === "Pending" && (
              <button
                type="button"
                onClick={() => onReviewProject(proposal.id)}
                className="mt-4 inline-flex h-10 items-center gap-2 rounded-md bg-[#15c7a8] px-4 text-sm font-bold text-[#071817] transition hover:bg-[#74ead7]"
              >
                Open Review
                <ArrowRight className="size-4" aria-hidden="true" />
              </button>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

export default function FacultyPortalPage() {
  const [proposals, setProposals] = useState(initialProposals);
  const [selectedId, setSelectedId] = useState("CSE-26-014");
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState("");
  const [activeView, setActiveView] = useState("overview");

  const assignedProposals = useMemo(
    () => getAssignedProposals(proposals, facultyMember.id),
    [proposals],
  );

  const pendingProposals = useMemo(
    () => assignedProposals.filter((proposal) => proposal.status === "Pending"),
    [assignedProposals],
  );

  const selected =
    pendingProposals.find((proposal) => proposal.id === selectedId) ||
    pendingProposals[0];

  const pendingCount = assignedProposals.filter((proposal) => proposal.status === "Pending").length;
  const averageSimilarity = Math.round(
    assignedProposals.reduce((sum, proposal) => sum + proposal.similarity, 0) / Math.max(assignedProposals.length, 1),
  );

  const viewTitle = {
    overview: "Overview",
    projects: "Projects",
    queue: "Review Queue",
    analytics: "Analytics",
  }[activeView];

  const handleSelectProposal = (proposalId) => {
    setSelectedId(proposalId);
  };

  const handleDecision = (nextStatus, comment) => {
    if (!comment.trim()) {
      setToast("Add a review comment before sending a decision.");
      return;
    }

    setProposals((current) =>
      current.map((proposal) => {
        if (proposal.id !== selected.id) {
          return proposal;
        }

        const notification =
          nextStatus === "Approved"
            ? `Approval sent to ${proposal.student}.`
            : nextStatus === "Rejected"
              ? `Rejection sent to ${proposal.student}.`
              : `Revision request sent to ${proposal.student}.`;

        return {
          ...proposal,
          status: nextStatus,
          facultyComment: comment,
          notifications: [notification, ...(proposal.notifications || [])],
        };
      }),
    );

    setToast(`${statusStyles[nextStatus].ink} stamped on ${selected.id}. Student notification saved.`);
  };

  const openReviewQueue = (proposalId) => {
    setSelectedId(proposalId);
    setQuery("");
    setActiveView("queue");
  };

  const handleNavigate = (view, proposalId) => {
    if (proposalId) {
      setSelectedId(proposalId);
    }
    setQuery("");
    setActiveView(view);
  };

  return (
    <main className="min-h-screen bg-[#f6f8f7] text-[#17201d]">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="border-r border-[#d9e1dc] bg-[#17201d] px-5 py-6 text-white">
          <a href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#74ead7]">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Home
          </a>
          <div className="mt-10">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#74ead7]">
              Faculty Desk
            </p>
            <h1 className="mt-3 text-4xl font-bold leading-tight tracking-normal">
              Academic Review
            </h1>
            <p className="mt-4 text-sm leading-6 text-white/72">
              {facultyMember.name} / {facultyMember.department} / {facultyMember.id}
            </p>
          </div>
          <nav className="mt-10 space-y-2 text-sm font-semibold">
            {[
              [LayoutDashboard, "Overview", "overview"],
              [FileSearch, "Projects", "projects"],
              [ClipboardList, "Review Queue", "queue"],
              [PieChartIcon, "Analytics", "analytics"],
            ].map(([Icon, label, view]) => (
              <button
                key={label}
                type="button"
                onClick={() => setActiveView(view)}
                className={`flex w-full items-center gap-3 rounded-md px-3 py-3 text-left transition ${
                  activeView === view ? "bg-white/12 text-white" : "text-white/84 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="size-4 text-[#15c7a8]" aria-hidden="true" />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        <section className="px-4 py-5 sm:px-6 lg:px-8">
          {toast && (
            <div className="fixed right-4 top-4 z-20 flex max-w-sm items-start gap-3 rounded-md border border-[#d9e1dc] bg-white p-4 text-sm font-semibold text-[#17201d] shadow-lg">
              <Bell className="mt-0.5 size-4 text-[#0b6b61]" aria-hidden="true" />
              <span>{toast}</span>
              <button type="button" onClick={() => setToast("")} className="ml-auto text-[#52625d] transition hover:text-[#17201d]">
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
          )}

          <header className="flex flex-col gap-4 border-b border-[#d9e1dc] pb-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#0b6b61]">
                Spring 2026 Review Board
              </p>
              <h2 className="mt-2 text-4xl font-bold tracking-normal text-[#17201d]">
                {viewTitle}
              </h2>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                ["Assigned", assignedProposals.length],
                ["Pending", pendingCount],
                ["Avg Sim.", `${averageSimilarity}%`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-md border border-[#d9e1dc] bg-white px-4 py-3 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#64736f]">{label}</p>
                  <p className="mt-1 text-2xl font-bold text-[#0b6b61]">{value}</p>
                </div>
              ))}
            </div>
          </header>

          <div className="mt-6">
            {activeView === "overview" && (
              <FacultyOverview
                proposals={assignedProposals}
                pendingCount={pendingCount}
                averageSimilarity={averageSimilarity}
                onNavigate={handleNavigate}
              />
            )}

            {activeView === "projects" && (
              <ProjectOverview proposals={assignedProposals} onReviewProject={openReviewQueue} />
            )}

            {activeView === "queue" && (
              <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
                <ReviewQueue
                  proposals={pendingProposals}
                  selectedId={selected?.id}
                  onSelectProposal={handleSelectProposal}
                  query={query}
                  onQueryChange={setQuery}
                  showFilters={false}
                  eyebrow="Pending Review Queue"
                  title="Projects Awaiting Decision"
                  emptyMessage="No pending projects are waiting for review."
                />

                {selected ? (
                  <section className="space-y-6">
                    <article className="rounded-md border border-[#d9e1dc] bg-white p-5 shadow-sm">
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#0b6b61]">
                            {selected.id}
                          </p>
                          <h3 className="mt-2 text-3xl font-bold tracking-normal">{selected.title}</h3>
                          <p className="mt-2 text-sm text-[#64736f]">
                            {selected.student} / {selected.dept} / {selected.date}
                          </p>
                        </div>
                        <div
                          className="inline-flex items-center gap-2 rounded-md border px-4 py-3 text-sm font-bold uppercase tracking-[0.08em]"
                          style={{
                            borderColor: statusStyles[selected.status].color,
                            backgroundColor: statusStyles[selected.status].bg,
                            color: statusStyles[selected.status].color,
                          }}
                        >
                          <Stamp className="size-4" aria-hidden="true" />
                          {statusStyles[selected.status].ink}
                        </div>
                      </div>

                      <div className="mt-5 rounded-md border border-[#d9e1dc] bg-[#f6f8f7] p-4">
                        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#0b6b61]">
                          <BookOpenCheck className="size-4" aria-hidden="true" />
                          AI Summary Annotation
                        </p>
                        <p className="mt-3 text-base leading-7 text-[#394842]">
                          {selected.summary}
                        </p>
                      </div>
                    </article>

                    <SimilarityDetailView proposal={selected} />
                    <ProposalReviewPanel proposal={selected} onDecision={handleDecision} />
                  </section>
                ) : (
                  <article className="rounded-md border border-[#d9e1dc] bg-white p-6 text-sm text-[#64736f] shadow-sm">
                    All assigned projects have already been reviewed.
                  </article>
                )}
              </div>
            )}

            {activeView === "analytics" && <AnalyticsCharts proposals={assignedProposals} />}
          </div>
        </section>
      </div>
    </main>
  );
}
