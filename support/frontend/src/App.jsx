import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  Bot,
  BrainCircuit,
  CheckCircle2,
  ClipboardCheck,
  Database,
  FileSearch,
  GraduationCap,
  Lightbulb,
  LibraryBig,
  LogIn,
  MessageSquareText,
  Search,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  UserCheck,
  UserPlus,
  UsersRound,
  Wrench,
} from "lucide-react";
import heroImage from "./assets/ideaforge-hero.png";
import FacultyPortalPage from "./pages/faculty/FacultyPortalPage.jsx";

const audiences = [
  {
    icon: GraduationCap,
    title: "Students",
    copy: "Discover feasible ideas, refine proposal direction, and track submission progress from one workspace.",
    actions: [
      ["Search Projects", "#student-actions"],
      ["Submit Proposal", "#student-actions"],
      ["Track Status", "#student-actions"],
    ],
  },
  {
    icon: UsersRound,
    title: "Faculty",
    copy: "Review proposals with similarity context, archive evidence, and clear decision support.",
    actions: [
      ["Review Queue", "/faculty"],
      ["Analytics", "/faculty#analytics"],
      ["Feedback", "/faculty"],
    ],
  },
  {
    icon: ShieldCheck,
    title: "Admins",
    copy: "Manage departments, users, archived projects, and project intelligence reports across the program.",
    actions: [
      ["Manage Users", "#admin-actions"],
      ["Project Archive", "#admin-actions"],
      ["System Reports", "#admin-actions"],
    ],
  },
];

const capabilities = [
  {
    icon: FileSearch,
    title: "Proposal Similarity",
    copy: "Compare new submissions against previous work before review bottlenecks appear.",
  },
  {
    icon: BrainCircuit,
    title: "Idea Discovery",
    copy: "Surface project themes, technology stacks, and research gaps from archived capstone data.",
  },
  {
    icon: MessageSquareText,
    title: "Project Q&A",
    copy: "Ask natural questions over the project archive with RAG-backed answers and source context.",
  },
  {
    icon: BarChart3,
    title: "Review Analytics",
    copy: "Spot trends in proposal quality, department activity, and faculty review flow.",
  },
];

const metrics = [
  ["3", "role-based portals"],
  ["AI", "assisted archive search"],
  ["RAG", "project knowledge layer"],
];

const primaryActions = [
  {
    icon: Search,
    label: "Search Previous Projects",
    href: "#student-actions",
  },
  {
    icon: Lightbulb,
    label: "Get Project Ideas",
    href: "#student-actions",
  },
  {
    icon: UploadCloud,
    label: "Upload Proposal",
    href: "#student-actions",
  },
  {
    icon: FileSearch,
    label: "Check Similarity",
    href: "#student-actions",
  },
  {
    icon: Bot,
    label: "Ask Project Chatbot",
    href: "#student-actions",
  },
  {
    icon: ClipboardCheck,
    label: "Review Proposals",
    href: "/faculty",
  },
  {
    icon: UserCheck,
    label: "Recommend Supervisor",
    href: "#student-actions",
  },
  {
    icon: Database,
    label: "Manage Archive",
    href: "#admin-actions",
  },
];

const actionGroups = [
  {
    id: "student-actions",
    eyebrow: "Student Buttons",
    title: "Student project workflow",
    copy: "Everything a student needs before and after submitting a capstone proposal.",
    items: [
      [Search, "Semantic Search", "Find previous academic projects using natural language."],
      [Lightbulb, "AI Project Suggestions", "Receive idea recommendations based on archived work."],
      [UploadCloud, "Upload Proposal", "Submit a proposal document for evaluation."],
      [FileSearch, "Similarity Score", "View overlap, novelty, and related previous projects."],
      [Wrench, "Technology Recommendations", "See suggested stacks and implementation approaches."],
      [UserCheck, "Supervisor Match", "Find faculty supervisors aligned with research interests."],
      [BarChart3, "Difficulty Estimate", "Understand project complexity before committing."],
      [MessageSquareText, "Status & Feedback", "Track review status and faculty comments."],
    ],
  },
  {
    id: "faculty-actions",
    eyebrow: "Faculty Buttons",
    title: "Faculty review workflow",
    copy: "Proposal intelligence and review controls for reducing manual comparison work.",
    items: [
      [ClipboardCheck, "Review Queue", "Open submitted proposals awaiting faculty action."],
      [BrainCircuit, "AI Summary", "Read concise AI-generated proposal summaries."],
      [FileSearch, "Similarity Report", "Inspect matching archived projects and novelty signals."],
      [CheckCircle2, "Approve / Reject", "Approve, reject, or request proposal modifications."],
      [UsersRound, "Student Progress", "Monitor student progress after proposal decisions."],
      [BarChart3, "Department Analytics", "View proposal and project trends across sessions."],
    ],
  },
  {
    id: "admin-actions",
    eyebrow: "Admin Buttons",
    title: "Administration controls",
    copy: "System-level controls for accounts, departments, archives, reports, and the AI knowledge base.",
    items: [
      [UserPlus, "Manage Accounts", "Create and maintain student and faculty users."],
      [LibraryBig, "Departments & Sessions", "Organize departments and academic sessions."],
      [Database, "Project Archives", "Maintain previous projects and proposal records."],
      [Bot, "AI Knowledge Base", "Manage the source material used by RAG features."],
      [BarChart3, "Reports", "Review system, department, and project intelligence reports."],
      [ShieldCheck, "System Maintenance", "Keep platform settings and operational data healthy."],
    ],
  },
];

function App() {
  if (window.location.pathname.startsWith("/faculty")) {
    return <FacultyPortalPage />;
  }

  return (
    <main className="min-h-screen bg-[#f6f8f7] text-[#17201d]">
      <section className="relative isolate min-h-[92svh] overflow-hidden">
        <img
          src={heroImage}
          alt="Academic team reviewing project intelligence dashboards"
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(8,20,24,0.92)_0%,rgba(8,20,24,0.74)_39%,rgba(8,20,24,0.28)_72%,rgba(8,20,24,0.12)_100%)]" />

        <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <a href="/" className="flex items-center gap-3 text-white">
            <span className="grid size-10 place-items-center rounded-md bg-white/12 ring-1 ring-white/20 backdrop-blur">
              <Sparkles className="size-5" aria-hidden="true" />
            </span>
            <span className="text-lg font-semibold tracking-normal">IdeaForge AI</span>
          </a>
          <nav className="hidden items-center gap-7 text-sm font-medium text-white/78 md:flex">
            <a href="#platform" className="transition hover:text-white">
              Platform
            </a>
            <a href="#workflow" className="transition hover:text-white">
              Workflow
            </a>
            <a href="#actions" className="transition hover:text-white">
              Buttons
            </a>
            <a href="#roles" className="transition hover:text-white">
              Roles
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <a
              href="/login"
              className="hidden h-10 items-center gap-2 rounded-md border border-white/20 bg-white/8 px-4 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/16 sm:inline-flex"
            >
              <LogIn className="size-4" aria-hidden="true" />
              Login
            </a>
            <a
              href="/register"
              className="inline-flex h-10 items-center gap-2 rounded-md bg-white px-4 text-sm font-semibold text-[#12312e] shadow-sm transition hover:bg-[#d7f7ed]"
            >
              Register
              <ArrowRight className="size-4" aria-hidden="true" />
            </a>
          </div>
        </header>

        <div className="mx-auto flex min-h-[calc(92svh-80px)] max-w-7xl items-center px-5 pb-20 pt-10 sm:px-8 lg:pb-24">
          <div className="max-w-3xl text-white">
            <p className="mb-5 inline-flex items-center gap-2 rounded-md border border-white/18 bg-white/10 px-3 py-2 text-sm font-medium text-[#d7f7ed] backdrop-blur">
              <BookOpenCheck className="size-4" aria-hidden="true" />
              Academic project intelligence for capstone teams
            </p>
            <h1 className="max-w-4xl text-5xl font-bold leading-[1.02] tracking-normal sm:text-6xl lg:text-7xl">
              IdeaForge AI
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/82 sm:text-xl">
              Discover stronger project ideas, detect proposal overlap, support faculty review, and ask smarter
              questions across the archived project knowledge base.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href="#actions"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[#15c7a8] px-6 text-sm font-bold text-[#071817] shadow-lg shadow-[#15c7a8]/20 transition hover:bg-[#74ead7]"
              >
                Explore Actions
                <ArrowRight className="size-4" aria-hidden="true" />
              </a>
              <a
                href="#student-actions"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-white/24 bg-white/8 px-6 text-sm font-bold text-white backdrop-blur transition hover:bg-white/16"
              >
                Start as Student
                <GraduationCap className="size-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="platform" className="border-b border-[#d9e1dc] bg-white">
        <div className="mx-auto grid max-w-7xl gap-5 px-5 py-7 sm:grid-cols-3 sm:px-8">
          {metrics.map(([value, label]) => (
            <div key={label} className="flex items-center gap-4">
              <span className="text-3xl font-bold text-[#0b6b61]">{value}</span>
              <span className="text-sm font-medium uppercase tracking-[0.08em] text-[#52625d]">{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="actions" className="bg-[#eef5f2] px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#0b6b61]">Proposal-Matched Actions</p>
              <h2 className="mt-3 text-3xl font-bold tracking-normal text-[#17201d] sm:text-4xl">
                The index page now exposes the project’s main buttons.
              </h2>
              <p className="mt-5 text-base leading-7 text-[#52625d]">
                These actions match the proposal scope: project discovery, proposal upload, similarity and novelty
                analysis, faculty review, archive management, and RAG-based project Q&A.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {primaryActions.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  className="inline-flex min-h-14 items-center justify-between gap-3 rounded-md border border-[#d3dfda] bg-white px-4 py-3 text-sm font-bold text-[#1d2a26] shadow-sm transition hover:border-[#15c7a8] hover:bg-[#f7fffc]"
                >
                  <span className="inline-flex items-center gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-md bg-[#e5f8f4] text-[#0b6b61]">
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    {label}
                  </span>
                  <ArrowRight className="size-4 shrink-0 text-[#0b6b61]" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8" id="workflow">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#0b6b61]">Core System</p>
            <h2 className="mt-3 text-3xl font-bold tracking-normal text-[#17201d] sm:text-4xl">
              Built around the real capstone lifecycle.
            </h2>
          </div>
          <p className="text-base leading-7 text-[#52625d]">
            IdeaForge AI connects idea exploration, proposal submission, similarity review, archive management, and
            RAG-based project Q&A into a single academic workflow.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {capabilities.map(({ icon: Icon, title, copy }) => (
            <article key={title} className="rounded-md border border-[#dbe4df] bg-white p-5 shadow-sm">
              <span className="grid size-11 place-items-center rounded-md bg-[#e5f8f4] text-[#0b6b61]">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-lg font-bold text-[#17201d]">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-[#52625d]">{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="roles" className="bg-[#17201d] px-5 py-20 text-white sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#74ead7]">Role-Based Access</p>
            <h2 className="mt-3 text-3xl font-bold tracking-normal sm:text-4xl">
              Separate portals, shared project intelligence.
            </h2>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {audiences.map(({ icon: Icon, title, copy }) => (
              <article key={title} className="rounded-md border border-white/12 bg-white/7 p-6">
                <div className="flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-md bg-[#15c7a8] text-[#071817]">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="text-xl font-bold">{title}</h3>
                </div>
                <p className="mt-5 text-sm leading-6 text-white/72">{copy}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {audiences
                    .find((audience) => audience.title === title)
                    .actions.map(([label, href]) => (
                      <a
                        key={label}
                        href={href}
                        className="inline-flex h-9 items-center rounded-md border border-white/14 bg-white/8 px-3 text-xs font-bold text-white/88 transition hover:bg-white/16"
                      >
                        {label}
                      </a>
                    ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-7xl space-y-12">
          {actionGroups.map(({ id, eyebrow, title, copy, items }) => (
            <div key={id} id={id} className="scroll-mt-8">
              <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#0b6b61]">{eyebrow}</p>
                  <h2 className="mt-3 text-2xl font-bold tracking-normal text-[#17201d] sm:text-3xl">{title}</h2>
                  <p className="mt-4 text-sm leading-6 text-[#52625d]">{copy}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map(([Icon, label, description]) => {
                    const facultyHref =
                      id === "faculty-actions" && ["Review Queue", "AI Summary", "Similarity Report", "Approve / Reject", "Department Analytics"].includes(label)
                        ? label === "Department Analytics"
                          ? "/faculty#analytics"
                          : "/faculty"
                        : null;
                    const ActionTag = facultyHref ? "a" : "button";

                    return (
                    <ActionTag
                      key={label}
                      type={facultyHref ? undefined : "button"}
                      href={facultyHref || undefined}
                      className="group min-h-32 rounded-md border border-[#dbe4df] bg-[#f9fbfa] p-4 text-left transition hover:border-[#15c7a8] hover:bg-[#f2fffb]"
                    >
                      <span className="grid size-10 place-items-center rounded-md bg-white text-[#0b6b61] shadow-sm ring-1 ring-[#dbe4df] transition group-hover:ring-[#15c7a8]">
                        <Icon className="size-5" aria-hidden="true" />
                      </span>
                      <span className="mt-4 block text-sm font-bold text-[#17201d]">{label}</span>
                      <span className="mt-2 block text-xs leading-5 text-[#52625d]">{description}</span>
                    </ActionTag>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#f6f8f7] px-5 py-20 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#0b6b61]">Ready For The Next Build</p>
            <h2 className="mt-3 text-3xl font-bold tracking-normal sm:text-4xl">
              A strong front door for the platform you are building.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#52625d]">
              The landing page now introduces the product direction while leaving room for authentication, dashboards,
              and real data flows as the backend grows.
            </p>
          </div>
          <div className="rounded-md border border-[#dbe4df] bg-white p-6 shadow-sm">
            {[
              "Student idea discovery and proposal submission",
              "Faculty review queue with similarity detail",
              "Admin archive and department oversight",
              "RAG chatbot for project archive questions",
            ].map((item) => (
              <div key={item} className="flex gap-3 border-b border-[#e8eeeb] py-4 last:border-b-0">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[#0b6b61]" aria-hidden="true" />
                <span className="text-sm font-semibold text-[#26332f]">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
