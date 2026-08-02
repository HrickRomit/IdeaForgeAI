import { ArrowLeft } from "lucide-react";

function AboutPage() {
  return (
    <main className="min-h-screen bg-[#f6f8f7] text-[#17201d] px-5 py-16 sm:px-8">
      <div className="mx-auto max-w-5xl rounded-3xl border border-[#d5ded7] bg-white p-8 shadow-sm sm:p-12">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#0b6b61] hover:text-[#0f7d68]"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to home
        </a>
        <h1 className="mt-6 text-4xl font-bold tracking-tight text-[#17201d] sm:text-5xl">
          About Us
        </h1>
        <p className="mt-6 max-w-3xl text-base leading-8 text-[#52625d] sm:text-lg">
          IdeaForge AI connects students, faculty, and academic resources with intelligent workflow tools.
          Our platform helps teams discover strong project ideas, streamline proposal review, and surface
          research-backed guidance across the project lifecycle.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <div className="rounded-3xl border border-[#e2ece7] bg-[#f8fbfa] p-6">
            <h2 className="text-xl font-bold text-[#0b6b61]">Student Success</h2>
            <p className="mt-3 text-sm leading-7 text-[#44524a]">
              We empower students to explore ideas, validate proposals, and find the best resources for academic success.
            </p>
          </div>
          <div className="rounded-3xl border border-[#e2ece7] bg-[#f8fbfa] p-6">
            <h2 className="text-xl font-bold text-[#0b6b61]">Faculty Collaboration</h2>
            <p className="mt-3 text-sm leading-7 text-[#44524a]">
              Faculty get smarter review tools, archive insights, and meaningful context for proposal decisions.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default AboutPage;
