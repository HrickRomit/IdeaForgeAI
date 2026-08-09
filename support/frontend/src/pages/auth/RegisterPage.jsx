import { useState } from "react";
import { ArrowLeft, UserPlus } from "lucide-react";
import { registerUser } from "../../api/authApi";

const departmentOptions = [
  { code: "CSE", name: "Computer Science and Engineering" },
  { code: "EEE", name: "Electrical and Electronic Engineering" },
  { code: "ME", name: "Mechanical Engineering" },
];

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

  return detail || error.message || "Registration failed.";
}

export default function RegisterPage({ accountType = "student" }) {
  const isFaculty = accountType === "faculty";
  const identifierLabel = isFaculty ? "Faculty ID" : "Student ID";
  const oppositeRegisterHref = isFaculty ? "/register" : "/faculty/register";
  const oppositeRegisterLabel = isFaculty ? "Student registration" : "Faculty registration";

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
    identifier: "",
    department_code: "CSE",
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

    if (form.password !== form.confirm_password) {
      setStatus("Registration failed: Password and confirm password do not match.");
      return;
    }

    setIsSubmitting(true);
    setStatus("Creating account...");

    const payload = {
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      password: form.password,
      role: accountType,
      student_id: isFaculty ? null : form.identifier.trim(),
      faculty_id: isFaculty ? form.identifier.trim() : null,
      department_code: form.department_code,
      department_id: null,
      research_interests: null,
    };

    try {
      await registerUser(payload);
      setStatus("Registration successful. You can now try logging in.");
    } catch (error) {
      setStatus(`Registration failed: ${getErrorMessage(error)}`);
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
          <h1 className="mt-4 text-3xl font-bold">
            {isFaculty ? "Faculty Registration" : "Student Registration"}
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#64736f]">
            Create your {isFaculty ? "faculty" : "student"} account for IdeaForge AI.
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
              placeholder={isFaculty ? "faculty@example.com" : "student@example.com"}
            />
          </label>

          <label className="block sm:col-span-2">
            <span className="text-sm font-semibold">{identifierLabel}</span>
            <input
              value={form.identifier}
              onChange={(event) => handleChange("identifier", event.target.value)}
              className="mt-2 h-11 w-full rounded-md border border-[#cfdad5] px-3 text-sm outline-none focus:border-[#15c7a8] focus:ring-2 focus:ring-[#15c7a8]/20"
              placeholder={isFaculty ? "FAC-CSE-104" : "CSE-2026-001"}
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold">Password</span>
            <input
              type="password"
              value={form.password}
              onChange={(event) => handleChange("password", event.target.value)}
              required
              minLength={8}
              className="mt-2 h-11 w-full rounded-md border border-[#cfdad5] px-3 text-sm outline-none focus:border-[#15c7a8] focus:ring-2 focus:ring-[#15c7a8]/20"
              placeholder="At least 8 characters"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold">Confirm password</span>
            <input
              type="password"
              value={form.confirm_password}
              onChange={(event) => handleChange("confirm_password", event.target.value)}
              required
              minLength={8}
              className="mt-2 h-11 w-full rounded-md border border-[#cfdad5] px-3 text-sm outline-none focus:border-[#15c7a8] focus:ring-2 focus:ring-[#15c7a8]/20"
              placeholder="Repeat password"
            />
          </label>

          <label className="block sm:col-span-2">
            <span className="text-sm font-semibold">Department</span>
            <select
              value={form.department_code}
              onChange={(event) => handleChange("department_code", event.target.value)}
              className="mt-2 h-11 w-full rounded-md border border-[#cfdad5] px-3 text-sm outline-none focus:border-[#15c7a8] focus:ring-2 focus:ring-[#15c7a8]/20"
              required
            >
              {departmentOptions.map((department) => (
                <option key={department.code} value={department.code}>
                  {department.code} - {department.name}
                </option>
              ))}
            </select>
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
          <span className="mx-2 text-[#a3afaa]">/</span>
          <a href={oppositeRegisterHref} className="font-bold text-[#0b6b61]">
            {oppositeRegisterLabel}
          </a>
        </p>
      </section>
    </main>
  );
}
