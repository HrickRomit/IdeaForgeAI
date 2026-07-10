import { useState } from "react";
import { ArrowLeft, LogIn } from "lucide-react";
import { loginUser } from "../../api/authApi";

function getErrorMessage(error) {
  if (!error.response) {
    return "Could not reach the backend server. Start the FastAPI backend on http://localhost:8000, then try again.";
  }

  const detail = error.response.data?.detail;

  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        const field = item.loc?.slice(1).join(".") || "field";
        return `${field}: ${item.msg}`;
      })
      .join(" ");
  }

  if (typeof detail === "object" && detail !== null) {
    return JSON.stringify(detail);
  }

  return detail || error.message || "Login failed.";
}

export default function LoginPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus("Checking login...");

    try {
      const response = await loginUser(form);
      const token = response.data?.access_token;
      const user = response.data?.user;

      if (token) {
        localStorage.setItem("ideaforge_access_token", token);
      }

      if (user) {
        localStorage.setItem("ideaforge_user_role", user.role);
        localStorage.setItem("ideaforge_user_name", user.full_name);
      }

      setStatus("Login successful. Redirecting...");

      // Redirect depending on user 
      if (user?.role === "student") {
        window.location.pathname = "/student";
      } else if (user?.role === "faculty") {
        window.location.pathname = "/faculty";
      } else {
        // Fallback for admin or other roles
        window.location.pathname = "/";
      }
    } catch (error) {
      setStatus(`Login failed: ${getErrorMessage(error)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-[#f6f8f7] px-4 py-10 text-[#17201d]">
      <section className="w-full max-w-md rounded-md border border-[#d9e1dc] bg-white p-6 shadow-sm">
        <a href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#0b6b61]">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Home
        </a>

        <div className="mt-8">
          <span className="grid size-12 place-items-center rounded-md bg-[#e5f8f4] text-[#0b6b61]">
            <LogIn className="size-6" aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-3xl font-bold">Login</h1>
          <p className="mt-2 text-sm leading-6 text-[#64736f]">
            Use this simple form to test the backend login endpoint.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-semibold">Email or username</span>
            <input
              type="text"
              value={form.email}
              onChange={(event) => handleChange("email", event.target.value)}
              required
              className="mt-2 h-11 w-full rounded-md border border-[#cfdad5] px-3 text-sm outline-none focus:border-[#15c7a8] focus:ring-2 focus:ring-[#15c7a8]/20"
              placeholder="student@example.com or student1"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold">Password</span>
            <input
              type="password"
              value={form.password}
              onChange={(event) => handleChange("password", event.target.value)}
              required
              className="mt-2 h-11 w-full rounded-md border border-[#cfdad5] px-3 text-sm outline-none focus:border-[#15c7a8] focus:ring-2 focus:ring-[#15c7a8]/20"
              placeholder="Any password"
            />
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#15c7a8] px-4 text-sm font-bold text-[#071817] transition hover:bg-[#74ead7] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogIn className="size-4" aria-hidden="true" />
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>

        {status && (
          <p className="mt-4 rounded-md border border-[#d9e1dc] bg-[#f6f8f7] p-3 text-sm font-semibold text-[#394842]">
            {status}
          </p>
        )}

        <p className="mt-5 text-sm text-[#64736f]">
          No account yet?{" "}
          <a href="/register" className="font-bold text-[#0b6b61]">
            Register here
          </a>
        </p>
      </section>
    </main>
  );
}
