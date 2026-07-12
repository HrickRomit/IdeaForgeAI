import { useState } from "react";

const highlightWords = [
  "collects",
  "iot",
  "sensors",
  "recommends",
  "schedules",
  "historical",
  "predicts",
  "retail",
  "route",
  "distance",
  "capacity",
  "risk",
  "retrieves",
  "citations",
];

function highlightOverlap(text) {
  return text.split(/(\W+)/).map((part, index) => {
    const normalized = part.toLowerCase();
    return highlightWords.includes(normalized) ? (
      <mark key={`${part}-${index}`} className="rounded-sm bg-[#d7f7ed] px-1 text-[#0b6b61]">
        {part}
      </mark>
    ) : (
      part
    );
  });
}

export default function SimilarityDetailView({ proposal }) {
  const [expandedMatch, setExpandedMatch] = useState(0);
  const matches = proposal.matches || [];
  const activeMatch = matches[expandedMatch] || matches[0];

  return (
    <article id="similarity" className="rounded-md border border-[#d9e1dc] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#0b6b61]">
            Similarity Report
          </p>
          <h3 className="mt-1 text-2xl font-bold tracking-normal">Matched Archive Excerpts</h3>
        </div>
        <span className="text-2xl font-bold text-[#0b6b61]">{proposal.similarity}%</span>
      </div>

      <div className="mt-4 space-y-3">
        {matches.map((match, index) => (
          <button
            key={match.project}
            type="button"
            onClick={() => setExpandedMatch(index)}
            className={`w-full rounded-md border bg-[#fbfdfc] p-3 text-left transition hover:border-[#15c7a8] ${
              expandedMatch === index ? "border-[#15c7a8] ring-2 ring-[#15c7a8]/15" : "border-[#d9e1dc]"
            }`}
          >
            <span className="flex items-center justify-between gap-3">
              <span className="font-semibold text-[#17201d]">{match.project}</span>
              <span className="text-sm font-bold text-[#0b6b61]">{match.percent}%</span>
            </span>
            <span className="mt-2 block h-2 overflow-hidden rounded-full bg-[#e7eeeb]">
              <span
                className="block h-full"
                style={{ width: `${match.percent}%`, backgroundColor: match.percent > 40 ? "#b42318" : "#15c7a8" }}
              />
            </span>
          </button>
        ))}
      </div>

      {activeMatch ? (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {["Archived Source", "Submitted Proposal"].map((label, index) => (
            <div key={label} className="rounded-md border border-[#d9e1dc] bg-[#f6f8f7] p-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#64736f]">{label}</p>
              <p className="mt-3 min-h-24 text-sm leading-7 text-[#394842]">
                {highlightOverlap(index === 0 ? activeMatch.source : activeMatch.submitted)}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 rounded-md border border-[#d9e1dc] bg-[#f6f8f7] p-4 text-sm text-[#64736f]">
          No archived project matches were returned for this proposal.
        </p>
      )}
    </article>
  );
}
