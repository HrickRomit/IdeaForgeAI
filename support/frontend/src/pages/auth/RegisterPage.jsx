import { useState } from "react";
import { ArrowLeft, UserPlus } from "lucide-react";
import { registerUser } from "../../api/authApi";

export default function RegisterPage() {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "student",
    student_id: "",
    department_id: "",
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
    setStatus("Creating account...");

    const payload = {
      ...form,
      department_id: form.department_id ? Number(form.department_id) : null,
    };

    try {
      await registerUser(payload);
      setStatus("Registration successful. You can now try logging in.");
    } catch (error) {
      const message = error.response?.data?.detail || error.message || "Registration failed.";
      setStatus(`Registration failed: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-[#f6f8f7] px-4 py-10 text-[#17201d]">
      <section className="w-full max-w-lg rounded-md border border-[#d9e1dc] bg-white p-6 shadow-sm">
        <a href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#0b6b61]">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Home
        </a>

        <div className="mt-8">
          <span className="grid size-12 place-items-center rounded-md bg-[#e5f8f4] text-[#0b6b61]">
            <UserPlus className="size-6" aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-3xl font-bold">Register</h1>
          <p className="mt-2 text-sm leading-6 text-[#64736f]">
            Create a student account and check whether the backend registration endpoint works.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="text-sm font-semibold">Full name</span>
            <input
              value={form.full_name}
              onChange={(event) => handleChange("full_name", event.target.value)}
              required
              className="mt-2 h-11 w-full rounded-md border border-[#cfdad5] px-3 text-sm outline-none focus:border-[#15c7a8] focus:ring-2 focus:ring-[#15c7a8]/20"
              placeholder="Ayesha Rahman"
            />
          </label>

          <label className="block sm:col-span-2">
            <span className="text-sm font-semibold">Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => handleChange("email", event.target.value)}
              required
              className="mt-2 h-11 w-full rounded-md border border-[#cfdad5] px-3 text-sm outline-none focus:border-[#15c7a8] focus:ring-2 focus:ring-[#15c7a8]/20"
              placeholder="student@example.com"
            />
          </label>

          <label className="block sm:col-span-2">
            <span className="text-sm font-semibold">Password</span>
            <input
              type="password"
              value={form.password}
              onChange={(event) => handleChange("password", event.target.value)}
              required
              minLength={6}
              className="mt-2 h-11 w-full rounded-md border border-[#cfdad5] px-3 text-sm outline-none focus:border-[#15c7a8] focus:ring-2 focus:ring-[#15c7a8]/20"
              placeholder="At least 6 characters"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold">Role</span>
            <select
              value={form.role}
              onChange={(event) => handleChange("role", event.target.value)}
              className="mt-2 h-11 w-full rounded-md border border-[#cfdad5] px-3 text-sm outline-none focus:border-[#15c7a8] focus:ring-2 focus:ring-[#15c7a8]/20"
            >
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="admin">Admin</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-semibold">Student ID</span>
            <input
              value={form.student_id}
              onChange={(event) => handleChange("student_id", event.target.value)}
              className="mt-2 h-11 w-full rounded-md border border-[#cfdad5] px-3 text-sm outline-none focus:border-[#15c7a8] focus:ring-2 focus:ring-[#15c7a8]/20"
              placeholder="CSE-2026-001"
            />
          </label>

          <label className="block sm:col-span-2">
            <span className="text-sm font-semibold">Department ID</span>
            <input
              type="number"
              value={form.department_id}
              onChange={(event) => handleChange("department_id", event.target.value)}
              className="mt-2 h-11 w-full rounded-md border border-[#cfdad5] px-3 text-sm outline-none focus:border-[#15c7a8] focus:ring-2 focus:ring-[#15c7a8]/20"
              placeholder="Optional, for example 1"
            />
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#15c7a8] px-4 text-sm font-bold text-[#071817] transition hover:bg-[#74ead7] disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2"
          >
            <UserPlus className="size-4" aria-hidden="true" />
            {isSubmitting ? "Creating account..." : "Register"}
          </button>
        </form>

        {status && (
          <p className="mt-4 rounded-md border border-[#d9e1dc] bg-[#f6f8f7] p-3 text-sm font-semibold text-[#394842]">
            {status}
          </p>
        )}

        <p className="mt-5 text-sm text-[#64736f]">
          Already have an account?{" "}
          <a href="/login" className="font-bold text-[#0b6b61]">
            Login here
          </a>
        </p>
      </section>
    </main>
  );
}
