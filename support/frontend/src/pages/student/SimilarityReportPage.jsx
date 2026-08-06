import { useEffect, useState, useMemo } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  FileSearch,
  Loader2,
  GraduationCap,
} from "lucide-react";
import { checkProposalSimilarity } from "../../api/proposalsApi";

const panelClass = "rounded-2xl bg-white p-6 shadow-[0_6px_20px_rgba(23,32,29,0.08)]";
const iconTileClass = "grid size-11 place-items-center rounded-2xl bg-[#e5f8f4] text-[#0b6b61]";
const quietPanelClass = "rounded-2xl bg-[#f7faf8] p-4 shadow-[0_4px_16px_rgba(23,32,29,0.05)]";

function getErrorMessage(error, fallbackMessage) {
  if (!error.response) {
    return "Could not reach the backend. Make sure Docker is running.";
  }
  const detail = error.response.data?.detail;
  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg).join(" ");
  }
  return detail || fallbackMessage;
}

export default function SimilarityReportPage() {
  const [similarityData, setSimilarityData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const searchParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const title = searchParams.get("title") || "";
  const abstract = searchParams.get("abstract") || "";
  const problem = searchParams.get("problem") || "";

  useEffect(() => {
    let isMounted = true;

    if (!title) {
      setErrorMessage("No title provided. Please go back and provide at least a project title.");
      setIsLoading(false);
      return;
    }

    checkProposalSimilarity({
      title,
      abstract,
      problem_statement: problem,
      top_k: 5,
    })
      .then((response) => {
        if (isMounted) {
          setSimilarityData(response.data);
          setIsLoading(false);
        }
      })
      .catch((error) => {
        if (isMounted) {
          setErrorMessage(getErrorMessage(error, "Failed to check similarity."));
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [title, abstract, problem]);

  const getScoreColor = (score) => {
    if (score < 0.35) return "text-[#0b6b61]"; // Green
    if (score < 0.65) return "text-[#d97706]"; // Orange
    return "text-[#dc2626]"; // Red
  };

  const getBarColor = (score) => {
    if (score < 0.35) return "bg-[#15c7a8]"; // Green
    if (score < 0.65) return "bg-[#fbbf24]"; // Orange
    return "bg-[#ef4444]"; // Red
  };

  const overallScorePercent = similarityData
    ? Math.round(similarityData.overall_similarity_score * 100)
    : 0;

  return (
    <main className="min-h-screen bg-[#f6f8f7] text-[#17201d]">
      <nav className="bg-white/[0.92] shadow-[0_4px_18px_rgba(23,32,29,0.06)] px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-3">
          <a
            href="/"
            className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#e5f8f4] text-[#0b6b61] transition hover:bg-[#d7f7ed]"
          >
            <GraduationCap className="size-5" />
          </a>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#0b6b61]">
              Student Portal
            </p>
            <h2 className="text-lg font-bold text-[#17201d]">Similarity Report</h2>
          </div>
        </div>
      </nav>

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <header className="flex flex-col gap-6 pb-2">
          <a
            href="/student"
            className="inline-flex items-center gap-2 w-fit text-sm font-semibold text-[#0b6b61] hover:underline"
          >
            <ArrowLeft className="size-4" />
            Back to Draft
          </a>
          <div>
            <h1 className="text-3xl font-bold tracking-normal sm:text-4xl">Compare with Past Projects</h1>
            <p className="mt-2 text-sm text-[#64736f]">AI-driven similarity check against the project archive</p>
          </div>
        </header>

        {isLoading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-4">
            <Loader2 className="size-8 animate-spin text-[#15c7a8]" />
            <p className="text-sm font-bold text-[#64736f]">Analyzing your proposal against the archive...</p>
          </div>
        ) : errorMessage ? (
          <div className="rounded-2xl bg-[#fee2e2] p-6 text-sm font-semibold text-[#b91c1c]">
            {errorMessage}
          </div>
        ) : (
          <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <article className={panelClass}>
              <div className="flex items-center gap-3">
                <span className={iconTileClass}>
                  <FileSearch className="size-5" />
                </span>
                <div>
                  <h2 className="text-lg font-bold">Matched Projects</h2>
                  <p className="text-sm text-[#64736f]">Projects in the archive sharing similar themes.</p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {similarityData?.matches?.length > 0 ? (
                  similarityData.matches.map((match, idx) => (
                    <div key={idx} className={quietPanelClass}>
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="font-bold text-[#17201d]">{match.title}</h3>
                        <span className={`text-lg font-bold ${getScoreColor(match.similarity_score)}`}>
                          {Math.round(match.similarity_score * 100)}%
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[#52625d]">{match.document_snippet}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm font-medium text-[#64736f]">No highly similar projects found. This is great for originality!</p>
                )}
              </div>
            </article>

            <aside className="space-y-8">
              <article className={panelClass}>
                <h2 className="text-lg font-bold">Overall Similarity</h2>
                <div className="mt-5">
                  <div className="flex items-end justify-between">
                    <span className="text-sm font-semibold text-[#52625d]">Estimated overlap</span>
                    <span className={`text-3xl font-bold ${getScoreColor(similarityData?.overall_similarity_score)}`}>
                      {overallScorePercent}%
                    </span>
                  </div>
                  <div className="mt-4 h-3 rounded-full bg-[#e7eeeb]">
                    <div
                      className={`h-3 rounded-full transition-all duration-1000 ${getBarColor(similarityData?.overall_similarity_score)}`}
                      style={{ width: `${overallScorePercent}%` }}
                    />
                  </div>
                </div>
              </article>

              <article className={panelClass}>
                <h2 className="text-lg font-bold">AI Recommendations</h2>
                <div className="mt-5 space-y-3">
                  {overallScorePercent > 60 ? (
                    <div className="flex gap-3 rounded-2xl bg-[#fffbeb] p-4 text-[#b45309]">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                      <p className="text-sm leading-6">High overlap detected. Consider narrowing your problem statement to a more specific domain.</p>
                    </div>
                  ) : overallScorePercent > 35 ? (
                    <div className="flex gap-3 rounded-2xl bg-[#f6f8f7] p-4">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#0b6b61]" />
                      <p className="text-sm leading-6">Moderate similarity. Ensure your methodology has a distinct angle compared to the matched projects.</p>
                    </div>
                  ) : (
                    <div className="flex gap-3 rounded-2xl bg-[#f0fdf4] p-4 text-[#15803d]">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                      <p className="text-sm leading-6">Low overlap. Your idea looks highly original!</p>
                    </div>
                  )}
                </div>
              </article>
            </aside>
          </section>
        )}
      </div>
    </main>
  );
}
