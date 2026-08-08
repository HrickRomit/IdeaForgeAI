import { useEffect, useState } from "react";
import { BookOpenCheck, GraduationCap, LogOut, RefreshCw, UsersRound } from "lucide-react";
import { getAdminDashboardStats } from "../../api/adminApi";

const cards = [
  {
    key: "total_students",
    label: "Registered Students",
    icon: GraduationCap,
    color: "bg-[#e5f8f4] text-[#0b6b61]",
  },
  {
    key: "total_faculty",
    label: "Registered Faculty",
    icon: UsersRound,
    color: "bg-[#eef2ff] text-[#4338ca]",
  },
  {
    key: "total_archived_projects",
    label: "Projects in Archive",
    icon: BookOpenCheck,
    color: "bg-[#fff4e5] text-[#b45309]",
  },
];

function clearAdminSession() {
  [
    "ideaforge_access_token",
    "ideaforge_refresh_token",
    "ideaforge_user_role",
    "ideaforge_user_name",
    "ideaforge_user_email",
    "ideaforge_student_id",
    "ideaforge_department_code",
    "ideaforge_department_id",
  ].forEach((key) => localStorage.removeItem(key));
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadStats = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await getAdminDashboardStats();
      setStats(response.data);
    } catch (requestError) {
      setError(
        requestError.response?.data?.detail ||
          "Could not load dashboard statistics. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleLogout = () => {
    clearAdminSession();
    window.location.assign("/admin");
  };

  return (
    <main className="min-h-screen bg-[#f6f8f7] px-4 py-6 text-[#17201d] sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-5 border-b border-[#d9e1dc] pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#0b6b61]">
              IdeaForge AI
            </p>
            <h1 className="mt-2 text-3xl font-bold">Admin Dashboard</h1>
            <p className="mt-2 text-sm text-[#64736f]">
              Live totals from the IdeaForge AI database.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={loadStats}
              disabled={isLoading}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-[#cfdad5] bg-white px-4 text-sm font-bold transition hover:bg-[#f6f8f7] disabled:opacity-60"
            >
              <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex h-10 items-center gap-2 rounded-md bg-[#17201d] px-4 text-sm font-bold text-white transition hover:bg-[#2d3b36]"
            >
              <LogOut className="size-4" />
              Logout
            </button>
          </div>
        </header>

        {error && (
          <div className="mt-8 rounded-md border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {cards.map(({ key, label, icon: Icon, color }) => (
            <article key={key} className="rounded-md border border-[#d9e1dc] bg-white p-6 shadow-sm">
              <div className={`grid size-12 place-items-center rounded-md ${color}`}>
                <Icon className="size-6" />
              </div>
              <p className="mt-6 text-sm font-semibold text-[#64736f]">{label}</p>
              <p className="mt-2 text-4xl font-bold">
                {isLoading ? "—" : (stats?.[key] ?? 0)}
              </p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}