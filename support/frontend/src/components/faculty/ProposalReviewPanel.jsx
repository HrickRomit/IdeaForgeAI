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
    <article className="rounded-md border border-[#d8ceb8] bg-[#fffaf0] p-5">
      <p className="font-['IBM_Plex_Mono'] text-xs uppercase tracking-[0.14em] text-[#8c4d3f]">Decision Panel</p>
      <textarea
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        placeholder="Required review comment for the student notification"
        className="mt-3 min-h-28 w-full rounded-md border border-[#d8ceb8] bg-white p-3 text-sm outline-none focus:border-[#b8862f]"
      />
      <div className="mt-3 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => submitDecision("Approved")}
          className="inline-flex h-10 items-center gap-2 rounded-md bg-[#6f8655] px-4 text-sm font-bold text-white"
        >
          <Check className="size-4" aria-hidden="true" />
          Approve
        </button>
        <button
          type="button"
          onClick={() => submitDecision("Changes")}
          className="inline-flex h-10 items-center gap-2 rounded-md bg-[#c06f2f] px-4 text-sm font-bold text-white"
        >
          <MessageSquareText className="size-4" aria-hidden="true" />
          Request Changes
        </button>
        <button
          type="button"
          onClick={() => submitDecision("Rejected")}
          className="inline-flex h-10 items-center gap-2 rounded-md bg-[#9b3f31] px-4 text-sm font-bold text-white"
        >
          <AlertTriangle className="size-4" aria-hidden="true" />
          Reject
        </button>
        <span className="inline-flex items-center gap-2 font-['IBM_Plex_Mono'] text-xs text-[#6f6a5d]">
          <Send className="size-4" aria-hidden="true" />
          Student alert is recorded immediately
        </span>
      </div>

      {proposal.facultyComment && (
        <div className="mt-4 rounded-md border border-[#eadfc7] bg-white p-4">
          <p className="font-['IBM_Plex_Mono'] text-xs font-bold uppercase text-[#6f6a5d]">Saved Faculty Comment</p>
          <p className="mt-2 text-sm leading-6 text-[#2c2b25]">{proposal.facultyComment}</p>
        </div>
      )}

      {proposal.notifications?.length > 0 && (
        <div className="mt-3 rounded-md border border-[#eadfc7] bg-[#fdf8ea] p-4">
          <p className="font-['IBM_Plex_Mono'] text-xs font-bold uppercase text-[#6f6a5d]">Student Notifications</p>
          <ul className="mt-2 space-y-1 text-sm text-[#2c2b25]">
            {proposal.notifications.map((notification) => (
              <li key={notification}>{notification}</li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}
