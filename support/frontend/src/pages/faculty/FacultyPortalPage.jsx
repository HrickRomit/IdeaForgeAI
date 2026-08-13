import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  BookOpenCheck,
  ClipboardList,
  Edit3,
  FileSearch,
  KeyRound,
  LayoutDashboard,
  PieChart as PieChartIcon,
  Save,
  Stamp,
  UserCircle,
  X,
} from "lucide-react";
import AnalyticsCharts from "../../components/faculty/AnalyticsCharts";
import ChatbotWidget from "../../components/common/ChatbotWidget";
import ProposalReviewPanel from "../../components/faculty/ProposalReviewPanel";
import ReviewQueue from "../../components/faculty/ReviewQueue";
import SimilarityDetailView from "../../components/faculty/SimilarityDetailView";
import { facultyMember, getAssignedProposals, initialProposals, statusStyles } from "../../components/faculty/facultyMockData";
import {
  getFacultyProfile,
  getFacultyProposal,
  getFacultyProposals,
  reviewFacultyProposal,
} from "../../api/facultyApi";
import { changePassword } from "../../api/authApi";

const apiStatusToViewStatus = {
  draft: "Draft",
  submitted: "Pending",
  approved: "Approved",
  changes_requested: "Changes",
  rejected: "Rejected",
};

const viewStatusToApiDecision = {
  Approved: "approved",
  Changes: "changes_requested",
  Rejected: "rejected",
};

function formatProposalDate(value) {
  if (!value) {
    return "Draft";
  }

  return new Intl.DateTimeFormat("en-CA").format(new Date(value));
}

function mapApiProposal(proposal, facultyId) {
  const similarity = proposal.similarity_score
    ? Math.round(proposal.similarity_score * 100)
    : 0;

  return {
    id: `PROP-${proposal.id}`,
    rawId: proposal.id,
    assignedFacultyId: facultyId,
    title: proposal.title,
    student: proposal.student_name || "Student",
    dept: proposal.department_code || "Unassigned",
    date: formatProposalDate(proposal.submitted_at),
    status: apiStatusToViewStatus[proposal.status] || "Draft",
    similarity,
    facultyComment: "",
    notifications: [],
    summary:
      proposal.abstract ||
      `${proposal.title} is assigned to this faculty account for review.`,
    problemStatement: proposal.problem_statement || "No problem statement provided.",
    objectives: proposal.objectives || "No objectives provided.",
    methodology: proposal.methodology || "No methodology provided.",
    technologyStack: proposal.technology_stack || "No technology stack provided.",
    matches: [],
  };
}

function mapApiProposalDetail(proposalDetail, facultyId) {
  const similarity = proposalDetail.similarity_score
    ? Math.round(proposalDetail.similarity_score * 100)
    : 0;

  const reviews = proposalDetail.reviews || [];
  const latestReview = reviews[reviews.length - 1];
  const facultyComment = latestReview?.comments || "";

  const matches = (proposalDetail.similarity_matches || []).map((match) => ({
    project: match.project || "Archived Project",
    percent: Math.round((match.similarity_score || 0) * 100),
    explanation: match.explanation || "",
    source:
      match.explanation ||
      (match.matched_sections ? JSON.stringify(match.matched_sections) : "No section preview"),
    submitted:
      proposalDetail.abstract || proposalDetail.problem_statement || "Submitted proposal text",
  }));

  const notifications = reviews.map((r) => {
    const decLabel =
      r.decision === "approved"
        ? "Approved"
        : r.decision === "changes_requested"
          ? "Revision requested"
          : "Rejected";
    return `Faculty Review (${decLabel}): ${r.comments}`;
  });

  return {
    id: `PROP-${proposalDetail.id}`,
    rawId: proposalDetail.id,
    assignedFacultyId: facultyId,
    title: proposalDetail.title,
    student: proposalDetail.student_name || "Student",
    dept: proposalDetail.department_code || "Unassigned",
    date: formatProposalDate(proposalDetail.submitted_at),
    status: apiStatusToViewStatus[proposalDetail.status] || "Draft",
    similarity,
    facultyComment,
    reviews,
    notifications,
    summary:
      proposalDetail.abstract ||
      `${proposalDetail.title} is assigned to this faculty account for review.`,
    problemStatement: proposalDetail.problem_statement || "No problem statement provided.",
    objectives: proposalDetail.objectives || "No objectives provided.",
    methodology: proposalDetail.methodology || "No methodology provided.",
    technologyStack: proposalDetail.technology_stack || "No technology stack provided.",
    documentPath: proposalDetail.document_path || null,
    matches,
  };
}

function FacultyOverview({ facultyInfo, proposals, pendingCount, averageSimilarity, onNavigate, onUpdateProfile }) {
  const [showProfile, setShowProfile] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileDraft, setProfileDraft] = useState({
    email: facultyInfo.email || "",
    username: facultyInfo.username || "",
    department: facultyInfo.department || "",
  });
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [passwordStatus, setPasswordStatus] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const approvedCount = proposals.filter((proposal) => proposal.status === "Approved").length;
  const rejectedCount = proposals.filter((proposal) => proposal.status === "Rejected").length;
  const latestPending = proposals.find((proposal) => proposal.status === "Pending");
  const username = facultyInfo.username || facultyInfo.email?.split("@")[0] || facultyInfo.id;

  useEffect(() => {
    setProfileDraft({
      email: facultyInfo.email || "",
      username: facultyInfo.username || "",
      department: facultyInfo.department || "",
    });
  }, [facultyInfo]);

  const saveProfile = () => {
    onUpdateProfile({
      email: profileDraft.email.trim(),
      username: profileDraft.username.trim(),
      department: profileDraft.department.trim(),
    });
    setIsEditingProfile(false);
  };

  const handlePasswordChange = (field, value) => {
    setPasswordForm((current) => ({ ...current, [field]: value }));
    setPasswordStatus("");
  };

  const submitPasswordChange = async (event) => {
    event.preventDefault();

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordStatus("New password and confirm password do not match.");
      return;
    }

    setIsChangingPassword(true);
    setPasswordStatus("");

    try {
      await changePassword(passwordForm);
      setPasswordForm({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
      setPasswordStatus("Password changed successfully.");
    } catch (error) {
      setPasswordStatus(error.response?.data?.detail || "Could not change password.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <section className="space-y-6">
      <article className="rounded-md border border-[#d9e1dc] bg-[#17201d] p-6 text-white shadow-sm">
        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#74ead7]">Welcome Back</p>
            <h3 className="mt-3 text-3xl font-bold tracking-normal sm:text-4xl">
              Hello, {facultyInfo.name}
            </h3>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/72">
              Your faculty workspace is ready for project monitoring, pending reviews, and review analytics.
            </p>
            {latestPending && (
              <button
                type="button"
                onClick={() => onNavigate("queue", latestPending.id)}
                className="mt-6 inline-flex h-11 items-center gap-2 rounded-md bg-[#15c7a8] px-4 text-sm font-bold text-[#071817] transition hover:bg-[#74ead7]"
              >
                Continue Latest Review
                <ArrowRight className="size-4" aria-hidden="true" />
              </button>
            )}
          </div>

          <div className="rounded-md border border-white/12 bg-white/7 p-5">
            <div className="flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-md bg-[#15c7a8] text-[#071817]">
                <UserCircle className="size-6" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-bold">{facultyInfo.name}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-white/62">
                  {facultyInfo.department} / {facultyInfo.id}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowProfile((current) => !current)}
              className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-white/16 bg-white/8 px-4 text-sm font-bold text-white transition hover:bg-white/14"
            >
              <UserCircle className="size-4" aria-hidden="true" />
              View Profile
            </button>
          </div>
        </div>
      </article>

      {showProfile && (
        <article className="rounded-md border border-[#d9e1dc] bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-md bg-[#e5f8f4] text-[#0b6b61]">
                <UserCircle className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#0b6b61]">Faculty Profile</p>
                <h3 className="mt-1 text-xl font-bold text-[#17201d]">{facultyInfo.name}</h3>
              </div>
            </div>
            <div>
              <button
                type="button"
                onClick={() => {
                  if (isEditingProfile) {
                    saveProfile();
                    return;
                  }
                  setIsEditingProfile(true);
                }}
                className="inline-flex h-10 items-center gap-2 rounded-md bg-[#15c7a8] px-4 text-sm font-bold text-[#071817] transition hover:bg-[#74ead7]"
              >
                {isEditingProfile ? <Save className="size-4" aria-hidden="true" /> : <Edit3 className="size-4" aria-hidden="true" />}
                {isEditingProfile ? "Save Profile" : "Edit Profile"}
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Faculty ID", facultyInfo.id],
              ["Email", isEditingProfile ? profileDraft.email : facultyInfo.email || "Email not set", "email"],
              ["Username", isEditingProfile ? profileDraft.username : username, "username"],
              ["Department", isEditingProfile ? profileDraft.department : facultyInfo.department || "Department not set", "department"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-md bg-[#f6f8f7] px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#64736f]">{label}</p>
                {isEditingProfile && label !== "Faculty ID" ? (
                  <input
                    value={value}
                    onChange={(event) =>
                      setProfileDraft((current) => ({
                        ...current,
                        [label.toLowerCase()]: event.target.value,
                      }))
                    }
                    className="mt-2 h-10 w-full rounded-md border border-[#cfdad5] bg-white px-3 text-sm font-bold text-[#17201d] outline-none"
                  />
                ) : (
                  <p className="mt-1 break-words text-sm font-bold text-[#17201d]">{value}</p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-5 border-t border-[#e4ebe8] pt-5">
            <button
              type="button"
              onClick={() => setShowPasswordSection((current) => !current)}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-[#cfdad5] bg-white px-4 text-sm font-bold text-[#17201d] transition hover:border-[#15c7a8] hover:bg-[#f2fffb]"
            >
              <KeyRound className="size-4" aria-hidden="true" />
              Change Password
            </button>

            {showPasswordSection && (
              <form onSubmit={submitPasswordChange} className="mt-4 rounded-md border border-[#d9e1dc] bg-[#fbfdfc] p-4">
                <div className="grid gap-3 lg:grid-cols-3">
                  {[
                    ["Current Password", "current_password", "current-password"],
                    ["New Password", "new_password", "new-password"],
                    ["Confirm Password", "confirm_password", "new-password"],
                  ].map(([label, field, autoComplete]) => (
                    <label key={field} className="block">
                      <span className="text-xs font-bold uppercase tracking-[0.08em] text-[#64736f]">{label}</span>
                      <input
                        type="password"
                        value={passwordForm[field]}
                        onChange={(event) => handlePasswordChange(field, event.target.value)}
                        autoComplete={autoComplete}
                        required
                        minLength={field === "current_password" ? 1 : 8}
                        className="mt-2 h-11 w-full rounded-md border border-[#cfdad5] bg-white px-3 text-sm outline-none transition focus:border-[#15c7a8] focus:ring-2 focus:ring-[#15c7a8]/20"
                      />
                    </label>
                  ))}
                </div>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  {passwordStatus && (
                    <p className={`text-sm font-semibold ${passwordStatus.includes("successfully") ? "text-[#12805c]" : "text-[#b42318]"}`}>
                      {passwordStatus}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#15c7a8] px-4 text-sm font-bold text-[#071817] transition hover:bg-[#74ead7] disabled:cursor-not-allowed disabled:opacity-60 sm:ml-auto"
                  >
                    {isChangingPassword ? "Changing..." : "Update Password"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </article>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Assigned", proposals.length],
          ["Pending", pendingCount],
          ["Approved", approvedCount],
          ["Rejected", rejectedCount],
        ].map(([label, value]) => (
          <div key={label} className="rounded-md border border-[#d9e1dc] bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#64736f]">{label}</p>
            <p className="mt-1 text-2xl font-bold text-[#0b6b61]">{value}</p>
          </div>
        ))}
      </div>

      <article className="rounded-md border border-[#d9e1dc] bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#0b6b61]">Workspace Snapshot</p>
            <h3 className="mt-1 text-2xl font-bold tracking-normal">Current review load</h3>
          </div>
          <div className="rounded-md bg-[#f6f8f7] px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#64736f]">Average Similarity</p>
            <p className="mt-1 text-2xl font-bold text-[#0b6b61]">{averageSimilarity}%</p>
          </div>
        </div>
      </article>
    </section>
  );
}

function ReviewOutcome({ proposal }) {
  const hasOutcome = proposal.status !== "Pending" && proposal.status !== "Draft";
  const hasRemarks = Boolean(proposal.facultyComment?.trim());

  return (
    <article className="rounded-md border border-[#d9e1dc] bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#0b6b61]">Faculty Review Record</p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#64736f]">Decision</p>
          <p className="mt-1 text-lg font-bold" style={{ color: statusStyles[proposal.status].color }}>
            {statusStyles[proposal.status].ink}
          </p>
        </div>
        {proposal.notifications?.[0] && (
          <p className="rounded-md bg-[#f6f8f7] px-3 py-2 text-sm font-semibold text-[#394842]">
            {proposal.notifications[0]}
          </p>
        )}
      </div>

      {hasRemarks ? (
        <div className="mt-4 rounded-md border border-[#d9e1dc] bg-[#f6f8f7] p-4">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#64736f]">Saved Remarks</p>
          <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[#394842]">{proposal.facultyComment}</p>
        </div>
      ) : (
        <p className="mt-4 rounded-md border border-[#d9e1dc] bg-[#f6f8f7] p-4 text-sm text-[#64736f]">
          {hasOutcome ? "No faculty remarks were recorded for this decision." : "No faculty decision or remarks have been recorded yet."}
        </p>
      )}
    </article>
  );
}

function ProjectDetail({ proposal, onBack, onDecision }) {
  const isActionable = proposal.status === "Pending" || proposal.status === "Changes";

  return (
    <section className="space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex h-10 items-center gap-2 rounded-md border border-[#cfdad5] bg-white px-4 text-sm font-bold text-[#17201d] transition hover:border-[#15c7a8] hover:bg-[#f2fffb]"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to Projects
      </button>

      <article className="rounded-md border border-[#d9e1dc] bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#0b6b61]">{proposal.id}</p>
            <h3 className="mt-2 text-3xl font-bold tracking-normal">{proposal.title}</h3>
            <p className="mt-2 text-sm text-[#64736f]">
              {proposal.student} / {proposal.dept} / {proposal.date}
            </p>
          </div>
          <div
            className="inline-flex items-center gap-2 rounded-md border px-4 py-3 text-sm font-bold uppercase tracking-[0.08em]"
            style={{
              borderColor: statusStyles[proposal.status].color,
              backgroundColor: statusStyles[proposal.status].bg,
              color: statusStyles[proposal.status].color,
            }}
          >
            <Stamp className="size-4" aria-hidden="true" />
            {statusStyles[proposal.status].ink}
          </div>
        </div>

        <div className="mt-5 rounded-md border border-[#d9e1dc] bg-[#f6f8f7] p-4">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#0b6b61]">
            <BookOpenCheck className="size-4" aria-hidden="true" />
            Summary
          </p>
          <p className="mt-3 whitespace-pre-line text-base leading-7 text-[#394842]">{proposal.summary}</p>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {[
            ["Problem Statement", proposal.problemStatement],
            ["Objectives", proposal.objectives],
            ["Methodology", proposal.methodology],
            ["Technology Stack", proposal.technologyStack],
          ].map(([label, value]) => (
            <div key={label} className="rounded-md border border-[#d9e1dc] bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#64736f]">{label}</p>
              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[#394842]">
                {value || `${label} was not provided.`}
              </p>
            </div>
          ))}
        </div>
      </article>

      <SimilarityDetailView proposal={proposal} />
      {isActionable ? (
        <ProposalReviewPanel proposal={proposal} onDecision={onDecision} />
      ) : (
        <ReviewOutcome proposal={proposal} />
      )}
    </section>
  );
}

function ProjectOverview({ proposals, selectedProjectId, onOpenProject, onCloseProject, onDecision }) {
  const selectedProject = proposals.find((proposal) => proposal.id === selectedProjectId);

  if (selectedProject) {
    return <ProjectDetail proposal={selectedProject} onBack={onCloseProject} onDecision={onDecision} />;
  }

  const statusOrder = ["Pending", "Approved", "Rejected", "Changes"];
  const visibleStatuses = statusOrder.filter((status) => proposals.some((proposal) => proposal.status === status));

  return (
    <section className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {visibleStatuses.map((status) => (
          <div key={status} className="rounded-md border border-[#d9e1dc] bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#64736f]">{status}</p>
            <p className="mt-1 text-2xl font-bold" style={{ color: statusStyles[status].color }}>
              {proposals.filter((proposal) => proposal.status === status).length}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {proposals.map((proposal) => (
          <button
            key={proposal.id}
            type="button"
            onClick={() => onOpenProject(proposal.id)}
            className="rounded-md border border-[#d9e1dc] bg-white p-5 text-left shadow-sm transition hover:border-[#15c7a8] hover:bg-[#f2fffb]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#0b6b61]">{proposal.id}</p>
                <h3 className="mt-2 text-xl font-bold leading-tight text-[#17201d]">{proposal.title}</h3>
                <p className="mt-2 text-sm text-[#64736f]">
                  {proposal.student} / {proposal.dept} / {proposal.date}
                </p>
              </div>
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
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-md bg-[#f6f8f7] px-3 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#64736f]">Similarity</p>
                <p className="mt-1 text-lg font-bold text-[#0b6b61]">{proposal.similarity}%</p>
              </div>
              <div className="rounded-md bg-[#f6f8f7] px-3 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#64736f]">Notifications</p>
                <p className="mt-1 text-lg font-bold text-[#0b6b61]">{proposal.notifications?.length || 0}</p>
              </div>
            </div>

            <p className="mt-4 line-clamp-2 text-sm leading-6 text-[#394842]">{proposal.summary}</p>

            <span className="mt-4 inline-flex h-10 items-center gap-2 rounded-md border border-[#cfdad5] px-4 text-sm font-bold text-[#17201d]">
              Open Project
              <ArrowRight className="size-4" aria-hidden="true" />
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

export default function FacultyPortalPage() {
  const [facultyInfo, setFacultyInfo] = useState(facultyMember);
  const [proposals, setProposals] = useState(initialProposals);
  const [selectedId, setSelectedId] = useState("CSE-26-014");
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState("");
  const [activeView, setActiveView] = useState("overview");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [isLiveBackend, setIsLiveBackend] = useState(false);

  useEffect(() => {
    let isMounted = true;

    Promise.all([getFacultyProfile(), getFacultyProposals()])
      .then(([profileResponse, proposalsResponse]) => {
        if (!isMounted) {
          return;
        }

        setIsLiveBackend(true);
        const profile = profileResponse.data;
        const liveFaculty = {
          id: profile.faculty_id || `FAC-${profile.id}`,
          name: profile.full_name || "Faculty",
          email: profile.email || "",
          username: profile.email?.split("@")[0] || profile.faculty_id || `faculty-${profile.id}`,
          department: profile.department_code || profile.department_name || "Unassigned",
        };
        const liveProposals = (proposalsResponse.data || []).map((proposal) =>
          mapApiProposal(proposal, liveFaculty.id),
        );

        setFacultyInfo(liveFaculty);
        setProposals(liveProposals);
        if (liveProposals.length > 0) {
          setSelectedId(liveProposals[0].id);
        }
      })
      .catch((error) => {
        if (isMounted) {
          setIsLiveBackend(false);
          setFacultyInfo(facultyMember);
          setProposals(initialProposals);
          setSelectedId("CSE-26-014");
          const msg =
            error.response?.status === 401
              ? "Not logged in as faculty. Operating in demo mode."
              : "Backend unavailable. Operating in demo mode.";
          setToast(msg);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const assignedProposals = useMemo(
    () => getAssignedProposals(proposals, facultyInfo.id),
    [facultyInfo.id, proposals],
  );

  const pendingProposals = useMemo(
    () =>
      assignedProposals.filter(
        (proposal) => proposal.status === "Pending" || proposal.status === "Changes",
      ),
    [assignedProposals],
  );

  const selected =
    pendingProposals.find((proposal) => proposal.id === selectedId) ||
    pendingProposals[0] ||
    assignedProposals[0];

  useEffect(() => {
    const activeViewId = selectedProjectId || selectedId;
    const targetProposal = proposals.find((p) => p.id === activeViewId);

    if (isLiveBackend && targetProposal?.rawId) {
      getFacultyProposal(targetProposal.rawId)
        .then((response) => {
          const detailed = mapApiProposalDetail(response.data, facultyInfo.id);
          setProposals((current) =>
            current.map((p) => (p.rawId === detailed.rawId ? { ...p, ...detailed } : p)),
          );
        })
        .catch((err) => {
          console.error("Could not fetch full proposal detail:", err);
        });
    }
  }, [selectedId, selectedProjectId, isLiveBackend, facultyInfo.id]);

  const pendingCount = assignedProposals.filter(
    (proposal) => proposal.status === "Pending" || proposal.status === "Changes",
  ).length;

  const averageSimilarity = Math.round(
    assignedProposals.reduce((sum, proposal) => sum + proposal.similarity, 0) /
      Math.max(assignedProposals.length, 1),
  );

  const viewTitle = {
    overview: "Overview",
    projects: "Projects",
    queue: "Review Queue",
    analytics: "Analytics",
  }[activeView];

  const handleSelectProposal = (proposalId) => {
    setSelectedId(proposalId);
  };

  const handleDecision = async (nextStatus, comment) => {
    if (!comment.trim()) {
      setToast("Add a review comment before sending a decision.");
      return;
    }

    const activeProposal =
      (activeView === "projects" && selectedProjectId
        ? proposals.find((p) => p.id === selectedProjectId)
        : selected) || selected;

    if (!activeProposal) {
      return;
    }

    if (activeProposal.rawId && viewStatusToApiDecision[nextStatus]) {
      try {
        await reviewFacultyProposal(activeProposal.rawId, {
          decision: viewStatusToApiDecision[nextStatus],
          comments: comment.trim(),
        });

        const detailRes = await getFacultyProposal(activeProposal.rawId);
        const detailed = mapApiProposalDetail(detailRes.data, facultyInfo.id);

        setProposals((current) =>
          current.map((p) => (p.rawId === detailed.rawId ? { ...p, ...detailed } : p)),
        );

        setToast(`${statusStyles[nextStatus].ink} decision recorded on ${activeProposal.id}.`);
      } catch (error) {
        setToast(error.response?.data?.detail || "Could not send the review decision.");
        return;
      }
    } else {
      setProposals((current) =>
        current.map((proposal) => {
          if (proposal.id !== activeProposal.id) {
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

      setToast(`${statusStyles[nextStatus].ink} decision recorded on ${activeProposal.id} (Demo mode).`);
    }
  };

  const handleNavigate = (view, proposalId) => {
    if (proposalId) {
      setSelectedId(proposalId);
    }
    if (view !== "projects") {
      setSelectedProjectId("");
    }
    setQuery("");
    setActiveView(view);
  };

  const activeProposal =
    (activeView === "projects" && selectedProjectId
      ? proposals.find((p) => p.id === selectedProjectId)
      : selected) || selected;

  return (
    <main className="min-h-screen bg-[#f6f8f7] text-[#17201d]">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="border-r border-[#d9e1dc] bg-[#17201d] px-5 py-6 text-white">
          <a href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#74ead7]">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Home
          </a>
          <div className="mt-10">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#74ead7]">
              Faculty Desk
            </p>
            <h1 className="mt-3 text-4xl font-bold leading-tight tracking-normal">
              Academic Review
            </h1>
            <p className="mt-4 text-sm leading-6 text-white/72">
              {facultyInfo.name} / {facultyInfo.department} / {facultyInfo.id}
            </p>
            {!isLiveBackend && (
              <span className="mt-3 inline-block rounded-md bg-[#fff4cf] px-2 py-1 text-[11px] font-bold text-[#8a5d00]">
                Demo Mode (Logged Out)
              </span>
            )}
          </div>
          <nav className="mt-10 space-y-2 text-sm font-semibold">
            {[
              [LayoutDashboard, "Overview", "overview"],
              [FileSearch, "Projects", "projects"],
              [ClipboardList, "Review Queue", "queue"],
              [PieChartIcon, "Analytics", "analytics"],
            ].map(([Icon, label, view]) => (
              <button
                key={label}
                type="button"
                onClick={() => setActiveView(view)}
                className={`flex w-full items-center gap-3 rounded-md px-3 py-3 text-left transition ${
                  activeView === view ? "bg-white/12 text-white" : "text-white/84 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="size-4 text-[#15c7a8]" aria-hidden="true" />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        <section className="px-4 py-5 sm:px-6 lg:px-8">
          {toast && (
            <div className="fixed right-4 top-4 z-20 flex max-w-sm items-start gap-3 rounded-md border border-[#d9e1dc] bg-white p-4 text-sm font-semibold text-[#17201d] shadow-lg">
              <Bell className="mt-0.5 size-4 text-[#0b6b61]" aria-hidden="true" />
              <span>{toast}</span>
              <button type="button" onClick={() => setToast("")} className="ml-auto text-[#52625d] transition hover:text-[#17201d]">
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
          )}

          <header className="flex flex-col gap-4 border-b border-[#d9e1dc] pb-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#0b6b61]">
                Spring 2026 Review Board
              </p>
              <h2 className="mt-2 text-4xl font-bold tracking-normal text-[#17201d]">
                {viewTitle}
              </h2>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                ["Assigned", assignedProposals.length],
                ["Pending", pendingCount],
                ["Avg Sim.", `${averageSimilarity}%`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-md border border-[#d9e1dc] bg-white px-4 py-3 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#64736f]">{label}</p>
                  <p className="mt-1 text-2xl font-bold text-[#0b6b61]">{value}</p>
                </div>
              ))}
            </div>
          </header>

          <div className="mt-6">
            {activeView === "overview" && (
              <FacultyOverview
                facultyInfo={facultyInfo}
                proposals={assignedProposals}
                pendingCount={pendingCount}
                averageSimilarity={averageSimilarity}
                onNavigate={handleNavigate}
                onUpdateProfile={(updates) =>
                  setFacultyInfo((current) => ({
                    ...current,
                    ...updates,
                  }))
                }
              />
            )}

            {activeView === "projects" && (
              <ProjectOverview
                proposals={assignedProposals}
                selectedProjectId={selectedProjectId}
                onOpenProject={setSelectedProjectId}
                onCloseProject={() => setSelectedProjectId("")}
                onDecision={handleDecision}
              />
            )}

            {activeView === "queue" && (
              <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
                <ReviewQueue
                  proposals={pendingProposals}
                  selectedId={selected?.id}
                  onSelectProposal={handleSelectProposal}
                  query={query}
                  onQueryChange={setQuery}
                  showFilters={false}
                  eyebrow="Pending Review Queue"
                  title="Projects Awaiting Decision"
                  emptyMessage="No pending projects are waiting for review."
                />

                {selected ? (
                  <section className="space-y-6">
                    <article className="rounded-md border border-[#d9e1dc] bg-white p-5 shadow-sm">
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#0b6b61]">
                            {selected.id}
                          </p>
                          <h3 className="mt-2 text-3xl font-bold tracking-normal">{selected.title}</h3>
                          <p className="mt-2 text-sm text-[#64736f]">
                            {selected.student} / {selected.dept} / {selected.date}
                          </p>
                        </div>
                        <div
                          className="inline-flex items-center gap-2 rounded-md border px-4 py-3 text-sm font-bold uppercase tracking-[0.08em]"
                          style={{
                            borderColor: statusStyles[selected.status].color,
                            backgroundColor: statusStyles[selected.status].bg,
                            color: statusStyles[selected.status].color,
                          }}
                        >
                          <Stamp className="size-4" aria-hidden="true" />
                          {statusStyles[selected.status].ink}
                        </div>
                      </div>

                      <div className="mt-5 rounded-md border border-[#d9e1dc] bg-[#f6f8f7] p-4">
                        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#0b6b61]">
                          <BookOpenCheck className="size-4" aria-hidden="true" />
                          Abstract & AI Summary
                        </p>
                        <p className="mt-3 whitespace-pre-line text-base leading-7 text-[#394842]">
                          {selected.summary}
                        </p>
                      </div>

                      <div className="mt-5 grid gap-5 sm:grid-cols-2">
                        <div className="rounded-md border border-[#d9e1dc] bg-white p-4">
                          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#64736f]">Problem Statement</p>
                          <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[#394842]">{selected.problemStatement}</p>
                        </div>
                        <div className="rounded-md border border-[#d9e1dc] bg-white p-4">
                          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#64736f]">Objectives</p>
                          <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[#394842]">{selected.objectives}</p>
                        </div>
                        <div className="rounded-md border border-[#d9e1dc] bg-white p-4">
                          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#64736f]">Methodology</p>
                          <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[#394842]">{selected.methodology}</p>
                        </div>
                        <div className="rounded-md border border-[#d9e1dc] bg-white p-4">
                          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#64736f]">Technology Stack</p>
                          <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[#394842]">{selected.technologyStack}</p>
                        </div>
                      </div>
                    </article>

                    <SimilarityDetailView proposal={selected} />
                    <ProposalReviewPanel proposal={selected} onDecision={handleDecision} />
                  </section>
                ) : (
                  <article className="rounded-md border border-[#d9e1dc] bg-white p-6 text-sm text-[#64736f] shadow-sm">
                    All assigned projects have already been reviewed.
                  </article>
                )}
              </div>
            )}

            {activeView === "analytics" && <AnalyticsCharts proposals={assignedProposals} />}
          </div>
        </section>
      </div>
      <ChatbotWidget proposal={activeProposal} />
    </main>
  );
}
