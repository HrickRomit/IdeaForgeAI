import { useState } from "react";
import { AlertTriangle, Check, MessageSquareText, Send } from "lucide-react";

export default function ProposalReviewPanel({ proposal, onDecision }) {
  const [comment, setComment] = useState("");

  const submitDecision = (status) => {
    const trimmed = comment.trim();
    if (!trimmed) {
      onDecision(status, "");
      return;
    }

    onDecision(status, trimmed);
    setComment("");
  };

  return (
    <article className="rounded-md border border-[#d9e1dc] bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#0b6b61]">Decision Panel</p>
      <textarea
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        placeholder="Required review comment for the student notification"
        className="mt-3 min-h-28 w-full rounded-md border border-[#cfdad5] bg-[#fbfdfc] p-3 text-sm outline-none transition focus:border-[#15c7a8] focus:ring-2 focus:ring-[#15c7a8]/20"
      />
      <div className="mt-3 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => submitDecision("Approved")}
          className="inline-flex h-10 items-center gap-2 rounded-md bg-[#12805c] px-4 text-sm font-bold text-white transition hover:bg-[#0b6b61]"
        >
          <Check className="size-4" aria-hidden="true" />
          Approve
        </button>
        <button
          type="button"
          onClick={() => submitDecision("Changes")}
          className="inline-flex h-10 items-center gap-2 rounded-md bg-[#fff3d6] px-4 text-sm font-bold text-[#7a4a00] ring-1 ring-[#ffd78a] transition hover:bg-[#ffe7ad]"
        >
          <MessageSquareText className="size-4" aria-hidden="true" />
          Request Changes
        </button>
        <button
          type="button"
          onClick={() => submitDecision("Rejected")}
          className="inline-flex h-10 items-center gap-2 rounded-md bg-[#b42318] px-4 text-sm font-bold text-white transition hover:bg-[#8f1d14]"
        >
          <AlertTriangle className="size-4" aria-hidden="true" />
          Reject
        </button>
        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#64736f]">
          <Send className="size-4" aria-hidden="true" />
          Student alert is recorded immediately
        </span>
      </div>

      {proposal.facultyComment && (
        <div className="mt-4 rounded-md border border-[#d9e1dc] bg-[#f6f8f7] p-4">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#64736f]">Saved Faculty Comment</p>
          <p className="mt-2 text-sm leading-6 text-[#394842]">{proposal.facultyComment}</p>
        </div>
      )}

      {proposal.notifications?.length > 0 && (
        <div className="mt-3 rounded-md border border-[#d9e1dc] bg-[#f6f8f7] p-4">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#64736f]">Student Notifications</p>
          <ul className="mt-2 space-y-1 text-sm text-[#394842]">
            {proposal.notifications.map((notification) => (
              <li key={notification}>{notification}</li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}
