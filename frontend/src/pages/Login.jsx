import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await login(form.email, form.password);
      const rolePath =
        res.user.role === "admin"
          ? "/admin"
          : res.user.role === "provider"
            ? "/provider"
            : "/customer";
      navigate(location.state?.from || rolePath);
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-73px)] max-w-5xl items-center px-4 py-12">
      <div className="grid w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft lg:grid-cols-2">
        <div className="bg-slate-950 p-10 text-white">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">
            Welcome back
          </p>
          <h1 className="mt-4 text-4xl font-black">Sign in to LocalFix.</h1>
          <p className="mt-4 leading-7 text-slate-300">
            Manage bookings, discover nearby professionals, and stay updated in
            real time.
          </p>
        </div>
        <form onSubmit={submit} className="p-8 sm:p-10">
          <label className="text-sm font-semibold">
            Email
            <input
              className="input mt-2"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </label>
          <label className="mt-5 block text-sm font-semibold">
            Password
            <input
              className="input mt-2"
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </label>
          <button disabled={busy} className="btn-primary mt-7 w-full">
            {busy ? "Signing in..." : "Sign in"}
          </button>
          <p className="mt-6 text-center text-sm text-slate-500">
            New here?{" "}
            <Link className="font-bold text-slate-900" to="/register">
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
