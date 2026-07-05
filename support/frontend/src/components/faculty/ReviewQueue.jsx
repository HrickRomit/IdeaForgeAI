import { Filter, Search } from "lucide-react";
import { statusStyles } from "./facultyMockData";

export default function ReviewQueue({
  proposals,
  selectedId,
  onSelectProposal,
  statusFilter,
  onStatusFilterChange,
  query,
  onQueryChange,
}) {
  const filtered = proposals.filter((proposal) => {
    const matchesStatus = statusFilter === "All" || proposal.status === statusFilter;
    const text = `${proposal.id} ${proposal.title} ${proposal.student} ${proposal.dept}`.toLowerCase();
    return matchesStatus && text.includes(query.toLowerCase());
  });

  const pendingCount = proposals.filter((proposal) => proposal.status === "Pending").length;

  return (
    <section id="queue" className="rounded-md border border-[#d8ceb8] bg-[#fffaf0]">
      <div className="border-b border-[#d8ceb8] p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-['IBM_Plex_Mono'] text-xs uppercase tracking-[0.14em] text-[#8c4d3f]">
              Proposal Review Queue
            </p>
            <h3 className="mt-1 font-['Source_Serif_4'] text-2xl font-semibold">Assigned Dossiers</h3>
          </div>
          <div className="text-right font-['IBM_Plex_Mono'] text-xs text-[#6f6a5d]">
            <p>{proposals.length} assigned</p>
            <p>{pendingCount} pending</p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-md border border-[#d8ceb8] bg-white px-3 py-2">
          <Search className="size-4 text-[#7b745f]" aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
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
              onClick={() => onStatusFilterChange(status)}
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
            onClick={() => onSelectProposal(proposal.id)}
            className={`grid w-full grid-cols-[7px_1fr] border-b border-[#eadfc7] text-left transition hover:bg-[#fff5db] ${
              proposal.id === selectedId ? "bg-[#fff1ca]" : "bg-transparent"
            }`}
          >
            <span style={{ backgroundColor: statusStyles[proposal.status].color }} />
            <span className="p-4">
              <span className="flex items-start justify-between gap-3">
                <span>
                  <span className="font-['IBM_Plex_Mono'] text-xs text-[#786f5a]">{proposal.id}</span>
                  <span className="mt-1 block font-['Source_Serif_4'] text-xl font-semibold leading-tight">
                    {proposal.title}
                  </span>
                </span>
                <span
                  className="rotate-[-6deg] border-2 px-2 py-1 font-['IBM_Plex_Mono'] text-[10px] font-bold uppercase"
                  style={{
                    borderColor: statusStyles[proposal.status].color,
                    color: statusStyles[proposal.status].color,
                  }}
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

        {filtered.length === 0 && (
          <div className="p-6 text-sm text-[#6f6a5d]">No assigned proposals match the current filters.</div>
        )}
      </div>
    </section>
  );
}
