import { useMemo, useState } from "react";
import { ArrowLeft, Bell, BookOpenCheck, ClipboardList, FileSearch, PieChart as PieChartIcon, Stamp, X } from "lucide-react";
import AnalyticsCharts from "../../components/faculty/AnalyticsCharts";
import ProposalReviewPanel from "../../components/faculty/ProposalReviewPanel";
import ReviewQueue from "../../components/faculty/ReviewQueue";
import SimilarityDetailView from "../../components/faculty/SimilarityDetailView";
import { facultyMember, getAssignedProposals, initialProposals, statusStyles } from "../../components/faculty/facultyMockData";

export default function FacultyPortalPage() {
  const [proposals, setProposals] = useState(initialProposals);
  const [selectedId, setSelectedId] = useState("CSE-26-014");
  const [statusFilter, setStatusFilter] = useState("Pending");
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState("");

  const assignedProposals = useMemo(
    () => getAssignedProposals(proposals, facultyMember.id),
    [proposals],
  );

  const selected =
    assignedProposals.find((proposal) => proposal.id === selectedId) ||
    assignedProposals.find((proposal) => proposal.status === "Pending") ||
    assignedProposals[0];

  const pendingCount = assignedProposals.filter((proposal) => proposal.status === "Pending").length;
  const averageSimilarity = Math.round(
    assignedProposals.reduce((sum, proposal) => sum + proposal.similarity, 0) / Math.max(assignedProposals.length, 1),
  );

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

  return (
    <main className="min-h-screen bg-[#f4efe2] text-[#1c2b45]">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="bg-[#12213a] px-5 py-6 text-[#f8efd9]">
          <a href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#f3c96b]">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Home
          </a>
          <div className="mt-10">
            <p className="font-['IBM_Plex_Mono'] text-xs uppercase tracking-[0.18em] text-[#b8c0aa]">
              Faculty Desk
            </p>
            <h1 className="mt-3 font-['Source_Serif_4'] text-4xl font-semibold leading-tight">
              Academic Review Dossiers
            </h1>
            <p className="mt-4 text-sm leading-6 text-[#cdd6c0]">
              {facultyMember.name} / {facultyMember.department} / {facultyMember.id}
            </p>
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
              <p className="font-['IBM_Plex_Mono'] text-xs uppercase tracking-[0.18em] text-[#8c4d3f]">
                Spring 2026 Review Board
              </p>
              <h2 className="mt-2 font-['Source_Serif_4'] text-4xl font-semibold text-[#17223a]">
                Faculty Portal
              </h2>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                ["Assigned", assignedProposals.length],
                ["Pending", pendingCount],
                ["Avg Sim.", `${averageSimilarity}%`],
              ].map(([label, value]) => (
                <div key={label} className="border-l-4 border-[#b8862f] bg-[#fffaf0] px-4 py-3 shadow-sm">
                  <p className="font-['IBM_Plex_Mono'] text-[11px] uppercase text-[#6f6a5d]">{label}</p>
                  <p className="mt-1 font-['Source_Serif_4'] text-2xl font-semibold">{value}</p>
                </div>
              ))}
            </div>
          </header>

          <div className="mt-6 grid gap-6 xl:grid-cols-[420px_1fr]">
            <ReviewQueue
              proposals={assignedProposals}
              selectedId={selected?.id}
              onSelectProposal={handleSelectProposal}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              query={query}
              onQueryChange={setQuery}
            />

            {selected && (
              <section className="space-y-6">
                <article className="rounded-md border border-[#d8ceb8] bg-[#fffaf0] p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="font-['IBM_Plex_Mono'] text-xs uppercase tracking-[0.14em] text-[#6f6a5d]">
                        {selected.id}
                      </p>
                      <h3 className="mt-2 font-['Source_Serif_4'] text-3xl font-semibold">{selected.title}</h3>
                      <p className="mt-2 text-sm text-[#5d5a4f]">
                        {selected.student} / {selected.dept} / {selected.date}
                      </p>
                    </div>
                    <div
                      className="inline-flex rotate-[-7deg] items-center gap-2 border-4 px-4 py-3 font-['IBM_Plex_Mono'] text-sm font-bold uppercase"
                      style={{
                        borderColor: statusStyles[selected.status].color,
                        color: statusStyles[selected.status].color,
                      }}
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
                    <p className="mt-3 font-['Source_Serif_4'] text-lg leading-7 text-[#2c2b25]">
                      {selected.summary}
                    </p>
                  </div>
                </article>

                <SimilarityDetailView proposal={selected} />
                <ProposalReviewPanel proposal={selected} onDecision={handleDecision} />
              </section>
            )}
          </div>

          <AnalyticsCharts proposals={assignedProposals} />
        </section>
      </div>
    </main>
  );
}
