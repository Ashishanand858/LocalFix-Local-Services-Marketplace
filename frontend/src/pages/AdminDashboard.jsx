import { useEffect, useState } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [providers, setProviders] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [serviceForm, setServiceForm] = useState({
    name: "",
    description: "",
    basePrice: 299,
  });

  const load = async () => {
    const [s, u, p, b, sv] = await Promise.all([
      api.get("/admin/dashboard"),
      api.get("/admin/users"),
      api.get("/providers/all"),
      api.get("/bookings/admin/all"),
      api.get("/services"),
    ]);
    setStats(s.data.data);
    setUsers(u.data.data);
    setProviders(p.data.data);
    setBookings(b.data.data);
    setServices(sv.data.data);
  };

  useEffect(() => {
    load().catch((e) =>
      toast.error(e.response?.data?.message || "Could not load admin data"),
    );
  }, []);

  async function toggleUser(id) {
    try {
      await api.put(`/admin/users/${id}/toggle`);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Update failed");
    }
  }

  async function createService(e) {
    e.preventDefault();
    try {
      await api.post("/services", serviceForm);
      toast.success("Service created");
      setServiceForm({ name: "", description: "", basePrice: 299 });
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Could not create service");
    }
  }

  async function deactivateService(id) {
    try {
      await api.delete(`/services/${id}`);
      toast.success("Service deactivated");
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Could not update service");
    }
  }

  async function verify(id) {
    try {
      await api.put(`/providers/${id}/verify`);
      toast.success("Provider verified");
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Verification failed");
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">
        Administration
      </p>
      <h1 className="mt-2 text-4xl font-black">LocalFix control center</h1>

      {stats && (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
          {[
            ["Users", stats.users],
            ["Providers", stats.providers],
            ["Bookings", stats.bookings],
            ["Completed", stats.completed],
            ["Revenue", `₹${stats.revenue}`],
            ["Reviews", stats.reviews],
          ].map(([label, value]) => (
            <div className="card p-5" key={label}>
              <div className="text-xs font-semibold text-slate-400">
                {label}
              </div>
              <div className="mt-2 text-2xl font-black">{value}</div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section className="card overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-5 font-black">
            Provider verification
          </div>
          <div className="max-h-[520px] divide-y divide-slate-100 overflow-auto">
            {providers.map((p) => (
              <div
                className="flex items-center justify-between gap-4 px-6 py-4"
                key={p._id}
              >
                <div>
                  <div className="font-bold">{p.businessName}</div>
                  <div className="text-xs text-slate-500">
                    {p.user?.email} · {p.city}
                  </div>
                </div>
                {p.isVerified ? (
                  <span className="pill">Verified</span>
                ) : (
                  <button
                    className="btn-primary text-xs"
                    onClick={() => verify(p._id)}
                  >
                    Verify
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="card overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-5 font-black">
            Users
          </div>
          <div className="max-h-[520px] divide-y divide-slate-100 overflow-auto">
            {users.map((u) => (
              <div
                className="flex items-center justify-between gap-4 px-6 py-4"
                key={u._id}
              >
                <div>
                  <div className="font-bold">{u.name}</div>
                  <div className="text-xs text-slate-500">
                    {u.email} · {u.role}
                  </div>
                </div>
                {u.role === "admin" ? (
                  <span className="pill">Admin</span>
                ) : (
                  <button
                    className="btn-secondary text-xs"
                    onClick={() => toggleUser(u._id)}
                  >
                    {u.isActive ? "Disable" : "Enable"}
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-8 grid gap-8 lg:grid-cols-[.8fr_1.2fr]">
        <section className="card p-6">
          <h2 className="font-black">Add service category</h2>
          <form onSubmit={createService} className="mt-4 space-y-3">
            <input
              className="input"
              placeholder="Service name"
              required
              value={serviceForm.name}
              onChange={(e) =>
                setServiceForm({
                  ...serviceForm,
                  name: e.target.value,
                })
              }
            />
            <textarea
              className="input min-h-20"
              placeholder="Description"
              value={serviceForm.description}
              onChange={(e) =>
                setServiceForm({
                  ...serviceForm,
                  description: e.target.value,
                })
              }
            />
            <input
              className="input"
              type="number"
              min="0"
              placeholder="Base price"
              value={serviceForm.basePrice}
              onChange={(e) =>
                setServiceForm({
                  ...serviceForm,
                  basePrice: Number(e.target.value),
                })
              }
            />
            <button className="btn-primary w-full">Create service</button>
          </form>
        </section>

        <section className="card overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-5 font-black">
            Service categories
          </div>
          <div className="divide-y divide-slate-100">
            {services.map((s) => (
              <div
                className="flex items-center justify-between gap-4 px-6 py-4"
                key={s._id}
              >
                <div>
                  <div className="font-bold">{s.name}</div>
                  <div className="text-xs text-slate-500">
                    ₹{s.basePrice} · {s.isActive ? "Active" : "Inactive"}
                  </div>
                </div>
                {s.isActive && (
                  <button
                    className="btn-secondary text-xs"
                    onClick={() => deactivateService(s._id)}
                  >
                    Deactivate
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      </section>

      <section className="mt-8 card overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-5 font-black">
          Recent bookings
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-6 py-3">Service</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Provider</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.slice(0, 30).map((b) => (
                <tr key={b._id}>
                  <td className="px-6 py-3 font-semibold">{b.service?.name}</td>
                  <td className="px-6 py-3">{b.customer?.name}</td>
                  <td className="px-6 py-3">{b.provider?.user?.name}</td>
                  <td className="px-6 py-3">{b.status}</td>
                  <td className="px-6 py-3">₹{b.amount + b.platformFee}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
