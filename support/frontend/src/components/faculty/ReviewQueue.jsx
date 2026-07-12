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
    <section id="queue" className="rounded-md border border-[#d9e1dc] bg-white shadow-sm">
      <div className="border-b border-[#d9e1dc] p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#0b6b61]">
              Proposal Review Queue
            </p>
            <h3 className="mt-1 text-2xl font-bold tracking-normal">Assigned Proposals</h3>
          </div>
          <div className="text-right text-xs font-semibold uppercase tracking-[0.08em] text-[#64736f]">
            <p>{proposals.length} assigned</p>
            <p>{pendingCount} pending</p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-md border border-[#cfdad5] bg-[#fbfdfc] px-3 py-2 transition focus-within:border-[#15c7a8] focus-within:ring-2 focus-within:ring-[#15c7a8]/20">
          <Search className="size-4 text-[#0b6b61]" aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search proposal, student, department"
            className="w-full bg-transparent text-sm outline-none placeholder:text-[#8a9994]"
          />
        </div>

        <div className="mt-3 flex items-center gap-2 overflow-x-auto">
          <Filter className="size-4 shrink-0 text-[#0b6b61]" aria-hidden="true" />
          {["All", "Pending", "Approved", "Changes", "Rejected"].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => onStatusFilterChange(status)}
              className={`h-8 rounded-md border px-3 text-xs font-bold transition ${
                statusFilter === status ? "border-[#0b6b61] bg-[#0b6b61] text-white" : "border-[#d9e1dc] bg-white text-[#394842] hover:border-[#15c7a8]"
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
            className={`grid w-full grid-cols-[7px_1fr] border-b border-[#e8eeeb] text-left transition hover:bg-[#f2fffb] ${
              proposal.id === selectedId ? "bg-[#e5f8f4]" : "bg-transparent"
            }`}
          >
            <span style={{ backgroundColor: statusStyles[proposal.status].color }} />
            <span className="p-4">
              <span className="flex items-start justify-between gap-3">
                <span>
                  <span className="text-xs font-bold uppercase tracking-[0.08em] text-[#64736f]">{proposal.id}</span>
                  <span className="mt-1 block text-lg font-bold leading-tight text-[#17201d]">
                    {proposal.title}
                  </span>
                </span>
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
              </span>
              <span className="mt-3 grid grid-cols-3 gap-2 text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64736f]">
                <span>{proposal.student}</span>
                <span>{proposal.dept}</span>
                <span>{proposal.date}</span>
              </span>
            </span>
          </button>
        ))}

        {filtered.length === 0 && (
          <div className="p-6 text-sm text-[#64736f]">No assigned proposals match the current filters.</div>
        )}
      </div>
    </section>
  );
}
