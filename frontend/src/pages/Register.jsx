import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "customer",
  });
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);

    try {
      const res = await register(form);
      navigate(res.user.role === "provider" ? "/provider" : "/customer");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-73px)] max-w-5xl items-center px-4 py-12">
      <div className="grid w-full rounded-3xl border border-slate-200 bg-white shadow-soft lg:grid-cols-[.8fr_1.2fr]">
        <div className="hidden bg-slate-950 p-10 text-white lg:block">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">
            Join the network
          </p>
          <h1 className="mt-4 text-4xl font-black">
            Local help, one booking away.
          </h1>
          <p className="mt-4 leading-7 text-slate-300">
            Customers get dependable home services. Providers get a simple way
            to manage jobs and grow their business.
          </p>
        </div>

        <form onSubmit={submit} className="p-8 sm:p-10">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-semibold">
              Full name
              <input
                className="input mt-2"
                required
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
              />
            </label>

            <label className="text-sm font-semibold">
              Phone
              <input
                className="input mt-2"
                required
                value={form.phone}
                onChange={(e) =>
                  setForm({
                    ...form,
                    phone: e.target.value,
                  })
                }
              />
            </label>
          </div>

          <label className="mt-5 block text-sm font-semibold">
            Email
            <input
              className="input mt-2"
              type="email"
              required
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value,
                })
              }
            />
          </label>

          <label className="mt-5 block text-sm font-semibold">
            Password
            <input
              className="input mt-2"
              type="password"
              minLength="8"
              required
              value={form.password}
              onChange={(e) =>
                setForm({
                  ...form,
                  password: e.target.value,
                })
              }
            />
          </label>

          <div className="mt-5">
            <div className="text-sm font-semibold">I want to join as</div>

            <div className="mt-2 grid grid-cols-2 gap-3">
              {["customer", "provider"].map((role) => (
                <button
                  type="button"
                  key={role}
                  onClick={() =>
                    setForm({
                      ...form,
                      role,
                    })
                  }
                  className={`rounded-xl border p-3 text-sm font-bold ${
                    form.role === role
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200"
                  }`}
                >
                  {role === "customer" ? "Customer" : "Service Provider"}
                </button>
              ))}
            </div>
          </div>

          <button disabled={busy} className="btn-primary mt-7 w-full">
            {busy ? "Creating account..." : "Create account"}
          </button>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already registered?{" "}
            <Link className="font-bold text-slate-900" to="/login">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
