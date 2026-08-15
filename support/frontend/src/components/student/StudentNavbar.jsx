import { useEffect, useState } from "react";
import {
  Building2,
  GraduationCap,
  IdCard,
  LayoutDashboard,
  LogOut,
  Mail,
  PlusCircle,
  Search,
  UserCircle2,
} from "lucide-react";
import { getCurrentUser } from "../../api/authApi";

function getStoredStudentProfile() {
  return {
    full_name: localStorage.getItem("ideaforge_user_name") || "Student",
    email: localStorage.getItem("ideaforge_user_email") || "",
    role: localStorage.getItem("ideaforge_user_role") || "student",
    student_id: localStorage.getItem("ideaforge_student_id") || "",
    department_code: localStorage.getItem("ideaforge_department_code") || "",
  };
}

export default function StudentNavbar({ activeTab = "dashboard", proposalCount = null, onTabChange }) {
  const [profile, setProfile] = useState(getStoredStudentProfile);

  useEffect(() => {
    let isMounted = true;
    getCurrentUser()
      .then((res) => {
        if (!isMounted || !res.data) return;
        const u = res.data;
        const updated = {
          full_name: u.full_name || "Student",
          email: u.email || "",
          role: u.role || "student",
          student_id: u.student_id || "",
          department_code: u.department_code || "",
        };
        setProfile(updated);
        localStorage.setItem("ideaforge_user_name", updated.full_name);
        localStorage.setItem("ideaforge_user_role", updated.role);
        if (updated.email) localStorage.setItem("ideaforge_user_email", updated.email);
        if (updated.student_id) localStorage.setItem("ideaforge_student_id", updated.student_id);
        if (updated.department_code) localStorage.setItem("ideaforge_department_code", updated.department_code);
      })
      .catch(() => {
        if (isMounted) setProfile(getStoredStudentProfile());
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("ideaforge_access_token");
    localStorage.removeItem("ideaforge_refresh_token");
    localStorage.removeItem("ideaforge_user_role");
    localStorage.removeItem("ideaforge_user_name");
    localStorage.removeItem("ideaforge_user_email");
    localStorage.removeItem("ideaforge_student_id");
    localStorage.removeItem("ideaforge_department_code");
    localStorage.removeItem("ideaforge_department_id");
    window.location.assign("/login");
  };

  const studentDetails = [
    { icon: Mail, label: profile.email || "Email not set" },
    { icon: IdCard, label: profile.student_id ? `ID: ${profile.student_id}` : "Student ID not set" },
    {
      icon: Building2,
      label: profile.department_code ? `Dept: ${profile.department_code}` : "Department not set",
    },
  ];

  const tabs = [
    [LayoutDashboard, "Dashboard & My Projects", "dashboard", proposalCount],
    [PlusCircle, "Submit New Proposal", "submit", null],
    [Search, "Archive Search & AI", "archive", null],
  ];

  const handleTabClick = (tabKey) => {
    if (onTabChange) {
      onTabChange(tabKey);
      return;
    }
    if (tabKey === "archive") {
      window.location.assign("/student/search");
    } else if (tabKey === "submit") {
      window.location.assign("/student?tab=submit");
    } else {
      window.location.assign("/student?tab=dashboard");
    }
  };

  return (
    <nav className="border-b border-[#d7e2dd] bg-white shadow-[0_4px_18px_rgba(23,32,29,0.06)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <a
            href="/"
            className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#e5f8f4] text-[#0b6b61] transition hover:bg-[#d7f7ed]"
            aria-label="Go to home"
          >
            <GraduationCap className="size-5" aria-hidden="true" />
          </a>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#0b6b61]">
              Student Portal
            </p>
            <div className="mt-1 flex min-w-0 items-center gap-2">
              <UserCircle2 className="size-5 shrink-0 text-[#64736f]" aria-hidden="true" />
              <h2 className="truncate text-lg font-bold text-[#17201d]">
                {profile.full_name}
              </h2>
              <span className="rounded-full bg-[#e5f8f4] px-3 py-0.5 text-xs font-bold capitalize text-[#0b6b61]">
                {profile.role}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="grid gap-2 sm:grid-cols-3 lg:flex">
            {studentDetails.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex min-h-10 items-center gap-2 rounded-2xl bg-[#f7faf8] px-3.5 text-sm font-semibold text-[#394842] shadow-[0_2px_8px_rgba(23,32,29,0.04)]"
              >
                <Icon className="size-4 shrink-0 text-[#0b6b61]" aria-hidden="true" />
                <span className="truncate">{label}</span>
              </span>
            ))}
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl bg-[#17201d] px-4 text-sm font-bold text-white shadow-[0_4px_14px_rgba(23,32,29,0.16)] transition hover:bg-[#26332f]"
          >
            <LogOut className="size-4" aria-hidden="true" />
            Logout
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mx-auto flex w-full max-w-7xl gap-2 px-4 sm:px-6 lg:px-8">
        {tabs.map(([Icon, label, tabKey, badge]) => (
          <button
            key={tabKey}
            type="button"
            onClick={() => handleTabClick(tabKey)}
            className={`inline-flex items-center gap-2.5 border-b-2 px-4 py-3 text-sm font-bold transition ${
              activeTab === tabKey
                ? "border-[#15c7a8] text-[#0b6b61]"
                : "border-transparent text-[#64736f] hover:border-[#cfdad5] hover:text-[#17201d]"
            }`}
          >
            <Icon className="size-4 text-[#15c7a8]" aria-hidden="true" />
            <span>{label}</span>
            {badge !== null && badge !== undefined && (
              <span className="rounded-full bg-[#e5f8f4] px-2 py-0.5 text-xs font-bold text-[#0b6b61]">
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
