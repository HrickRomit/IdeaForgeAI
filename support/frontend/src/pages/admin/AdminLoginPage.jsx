import { useState } from "react";
import { ArrowLeft, LockKeyhole, LogIn } from "lucide-react";
import { loginAdmin } from "../../api/authApi";

function saveSession(responseData) {
  const { access_token, refresh_token, user } = responseData;

  localStorage.setItem("ideaforge_access_token", access_token);
  localStorage.setItem("ideaforge_refresh_token", refresh_token);
  localStorage.setItem("ideaforge_user_role", user.role);
  localStorage.setItem("ideaforge_user_name", user.full_name);
  localStorage.setItem("ideaforge_user_email", user.email || "");
  localStorage.setItem("ideaforge_student_id", user.student_id || "");
  localStorage.setItem("ideaforge_department_code", user.department_code || "");
  localStorage.setItem(
    "ideaforge_department_id",
    user.department_id ? String(user.department_id) : "",
  );
}

export default function AdminLoginPage() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await loginAdmin(form);
      saveSession(response.data);
      window.location.assign("/admin");
    } catch (error) {
      setMessage(
        error.response?.data?.detail ||
          "Could not sign in. Please check the credentials and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-[#f6f8f7] px-4 py-10 text-[#17201d]">
      <section className="w-full max-w-md rounded-md border border-[#d9e1dc] bg-white p-6 shadow-sm">
        <a href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#0b6b61]">
          <ArrowLeft className="size-4" />
          Home
        </a>

        <div className="mt-8">
          <span className="grid size-12 place-items-center rounded-md bg-[#e5f8f4] text-[#0b6b61]">
            <LockKeyhole className="size-6" />
          </span>
          <h1 className="mt-4 text-3xl font-bold">Admin Login</h1>
          <p className="mt-2 text-sm leading-6 text-[#64736f]">
            Sign in to view IdeaForge AI system statistics.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-semibold">Username</span>
            <input
              type="text"
              value={form.username}
              onChange={(event) =>
                setForm((current) => ({ ...current, username: event.target.value }))
              }
              required
              autoComplete="username"
              className="mt-2 h-11 w-full rounded-md border border-[#cfdad5] px-3 text-sm outline-none focus:border-[#15c7a8] focus:ring-2 focus:ring-[#15c7a8]/20"
              placeholder="Enter username"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold">Password</span>
            <input
              type="password"
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({ ...current, password: event.target.value }))
              }
              required
              autoComplete="current-password"
              className="mt-2 h-11 w-full rounded-md border border-[#cfdad5] px-3 text-sm outline-none focus:border-[#15c7a8] focus:ring-2 focus:ring-[#15c7a8]/20"
              placeholder="Enter password"
            />
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#15c7a8] px-4 text-sm font-bold text-[#071817] transition hover:bg-[#74ead7] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogIn className="size-4" />
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {message && (
          <p className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
            {message}
          </p>
        )}
      </section>
    </main>
  );
}