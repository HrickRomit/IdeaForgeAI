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
      <mark key={`${part}-${index}`} className="rounded-sm bg-[#f3c96b]/55 px-1 text-[#1c2b45]">
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
    <article id="similarity" className="rounded-md border border-[#d8ceb8] bg-[#fffaf0] p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-['IBM_Plex_Mono'] text-xs uppercase tracking-[0.14em] text-[#8c4d3f]">
            Similarity Report
          </p>
          <h3 className="mt-1 font-['Source_Serif_4'] text-2xl font-semibold">Matched Archive Excerpts</h3>
        </div>
        <span className="font-['IBM_Plex_Mono'] text-2xl font-bold text-[#9b3f31]">{proposal.similarity}%</span>
      </div>

      <div className="mt-4 space-y-3">
        {matches.map((match, index) => (
          <button
            key={match.project}
            type="button"
            onClick={() => setExpandedMatch(index)}
            className={`w-full rounded-md border bg-white p-3 text-left transition hover:border-[#b8862f] ${
              expandedMatch === index ? "border-[#b8862f]" : "border-[#eadfc7]"
            }`}
          >
            <span className="flex items-center justify-between gap-3">
              <span className="font-semibold">{match.project}</span>
              <span className="font-['IBM_Plex_Mono'] text-sm font-bold">{match.percent}%</span>
            </span>
            <span className="mt-2 block h-2 overflow-hidden rounded-full bg-[#eee4cd]">
              <span
                className="block h-full"
                style={{ width: `${match.percent}%`, backgroundColor: match.percent > 40 ? "#9b3f31" : "#b8862f" }}
              />
            </span>
          </button>
        ))}
      </div>

      {activeMatch ? (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {["Archived Source", "Submitted Proposal"].map((label, index) => (
            <div key={label} className="rounded-md border border-[#d8ceb8] bg-[#fdf8ea] p-4">
              <p className="font-['IBM_Plex_Mono'] text-xs font-bold uppercase text-[#6f6a5d]">{label}</p>
              <p className="mt-3 min-h-24 text-sm leading-7">
                {highlightOverlap(index === 0 ? activeMatch.source : activeMatch.submitted)}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 rounded-md border border-[#eadfc7] bg-white p-4 text-sm text-[#6f6a5d]">
          No archived project matches were returned for this proposal.
        </p>
      )}
    </article>
  );
}
