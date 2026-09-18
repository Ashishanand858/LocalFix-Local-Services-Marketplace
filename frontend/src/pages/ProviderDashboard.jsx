import { useEffect, useState } from "react";
import api from "../services/api";
import StatusBadge from "../components/StatusBadge";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function ProviderDashboard() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [bookings, setBookings] = useState([]);
  const [profile, setProfile] = useState(null);
  const [services, setServices] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [form, setForm] = useState({
    day: "Monday",
    startTime: "09:00",
    endTime: "19:00",
    isAvailable: true,
  });
  const [profileForm, setProfileForm] = useState({
    businessName: "",
    description: "",
    experience: 0,
    pricePerVisit: 299,
    address: "",
    city: "",
    latitude: "",
    longitude: "",
    services: [],
  });

  const load = async () => {
    const [b, p, a, s] = await Promise.all([
      api.get("/bookings/my"),
      api.get("/providers/profile/me"),
      api.get("/availability/me"),
      api.get("/services"),
    ]);

    setBookings(b.data.data);
    setProfile(p.data.data);
    setServices(s.data.data);
    setAvailability(a.data.data);

    if (p.data.data) {
      setProfileForm((f) => ({
        ...f,
        ...p.data.data,
        services: p.data.data.services?.map((x) => x._id) || [],
      }));
    }
  };

  useEffect(() => {
    load().catch((e) =>
      toast.error(
        e.response?.data?.message || "Could not load provider dashboard",
      ),
    );
  }, []);

  useEffect(() => {
    if (!socket) return;

    const refresh = () => load();

    socket.on("new_notification", refresh);

    return () => socket.off("new_notification", refresh);
  }, [socket]);

  async function update(id, status) {
    try {
      await api.put(`/bookings/${id}/status`, { status });
      toast.success(`Booking ${status.replace("_", " ")}`);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Update failed");
    }
  }

  async function saveAvailability(e) {
    e.preventDefault();

    try {
      await api.post("/availability", form);
      toast.success("Availability saved");
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Could not save availability");
    }
  }

  async function saveProfile(e) {
    e.preventDefault();

    try {
      await api.post("/providers/profile", profileForm);
      toast.success("Provider profile saved");
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Could not save profile");
    }
  }

  function toggleService(id) {
    setProfileForm((f) => ({
      ...f,
      services: f.services.includes(id)
        ? f.services.filter((x) => x !== id)
        : [...f.services, id],
    }));
  }

  const revenue = bookings
    .filter((b) => b.paymentStatus === "paid")
    .reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">
        Provider dashboard
      </p>
      <h1 className="mt-2 text-4xl font-black">
        Manage your local service business
      </h1>
      <p className="mt-2 text-slate-500">
        {user?.name}, keep your profile and availability current so customers
        can book you.
      </p>

      <div className="mt-8 grid gap-5 md:grid-cols-4">
        <div className="card p-5">
          <div className="text-sm text-slate-500">Requests</div>
          <div className="mt-2 text-3xl font-black">
            {bookings.filter((b) => b.status === "pending").length}
          </div>
        </div>

        <div className="card p-5">
          <div className="text-sm text-slate-500">Accepted</div>
          <div className="mt-2 text-3xl font-black">
            {bookings.filter((b) => b.status === "accepted").length}
          </div>
        </div>

        <div className="card p-5">
          <div className="text-sm text-slate-500">Completed</div>
          <div className="mt-2 text-3xl font-black">
            {bookings.filter((b) => b.status === "completed").length}
          </div>
        </div>

        <div className="card p-5">
          <div className="text-sm text-slate-500">Paid earnings</div>
          <div className="mt-2 text-3xl font-black">₹{revenue}</div>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <section className="card overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-5 font-black">
            Incoming and recent jobs
          </div>

          <div className="divide-y divide-slate-100">
            {bookings.map((b) => (
              <div
                key={b._id}
                className="grid gap-3 px-6 py-5 md:grid-cols-[1.4fr_.7fr_auto]"
              >
                <div>
                  <div className="font-bold">{b.service?.name}</div>
                  <div className="mt-1 text-sm text-slate-500">
                    {b.customer?.name} ·{" "}
                    {new Date(b.bookingDate).toLocaleDateString()} ·{" "}
                    {b.timeSlot}
                  </div>
                  <div className="mt-1 text-xs text-slate-400">
                    ₹{b.amount} · Payment {b.paymentStatus}
                  </div>
                </div>

                <StatusBadge status={b.status} />

                <div className="flex flex-wrap gap-2">
                  {b.status === "pending" && (
                    <>
                      <button
                        className="btn-primary text-xs"
                        onClick={() => update(b._id, "accepted")}
                      >
                        Accept
                      </button>
                      <button
                        className="btn-secondary text-xs"
                        onClick={() => update(b._id, "rejected")}
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {b.status === "accepted" && (
                    <button
                      className="btn-primary text-xs"
                      onClick={() => update(b._id, "in_progress")}
                    >
                      Start
                    </button>
                  )}

                  {b.status === "in_progress" && (
                    <button
                      className="btn-primary text-xs"
                      onClick={() => update(b._id, "completed")}
                    >
                      Complete
                    </button>
                  )}
                </div>
              </div>
            ))}

            {!bookings.length && (
              <div className="p-10 text-center text-slate-500">
                No bookings yet.
              </div>
            )}
          </div>
        </section>

        <aside className="space-y-5">
          <section className="card p-6">
            <h2 className="font-black">Provider profile</h2>

            <form onSubmit={saveProfile} className="mt-4 space-y-3">
              <input
                className="input"
                placeholder="Business name"
                value={profileForm.businessName}
                onChange={(e) =>
                  setProfileForm({
                    ...profileForm,
                    businessName: e.target.value,
                  })
                }
                required
              />

              <textarea
                className="input min-h-20"
                placeholder="Describe your service"
                value={profileForm.description}
                onChange={(e) =>
                  setProfileForm({
                    ...profileForm,
                    description: e.target.value,
                  })
                }
              />

              <div className="grid grid-cols-2 gap-3">
                <input
                  className="input"
                  type="number"
                  min="0"
                  placeholder="Experience"
                  value={profileForm.experience}
                  onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      experience: e.target.value,
                    })
                  }
                />

                <input
                  className="input"
                  type="number"
                  min="0"
                  placeholder="Visit price"
                  value={profileForm.pricePerVisit}
                  onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      pricePerVisit: e.target.value,
                    })
                  }
                />
              </div>

              <input
                className="input"
                placeholder="Address"
                value={profileForm.address}
                onChange={(e) =>
                  setProfileForm({
                    ...profileForm,
                    address: e.target.value,
                  })
                }
              />

              <input
                className="input"
                placeholder="City"
                value={profileForm.city}
                onChange={(e) =>
                  setProfileForm({
                    ...profileForm,
                    city: e.target.value,
                  })
                }
              />

              <div className="grid grid-cols-2 gap-3">
                <input
                  className="input"
                  placeholder="Latitude"
                  value={profileForm.latitude}
                  onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      latitude: e.target.value,
                    })
                  }
                />

                <input
                  className="input"
                  placeholder="Longitude"
                  value={profileForm.longitude}
                  onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      longitude: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Services offered
                </div>

                <div className="flex flex-wrap gap-2">
                  {services.map((s) => (
                    <button
                      type="button"
                      key={s._id}
                      onClick={() => toggleService(s._id)}
                      className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                        profileForm.services.includes(s._id)
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>

              <button className="btn-primary w-full">
                {profile ? "Update profile" : "Create profile"}
              </button>
            </form>

            <div className="mt-4 text-xs text-slate-400">
              Status:{" "}
              {profile?.isVerified ? "Verified" : "Pending admin verification"}
            </div>
          </section>

          <section className="card p-6">
            <h2 className="font-black">Availability</h2>

            <form onSubmit={saveAvailability} className="mt-4 space-y-3">
              <select
                className="input"
                value={form.day}
                onChange={(e) =>
                  setForm({
                    ...form,
                    day: e.target.value,
                  })
                }
              >
                {days.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>

              <div className="grid grid-cols-2 gap-3">
                <input
                  className="input"
                  type="time"
                  value={form.startTime}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      startTime: e.target.value,
                    })
                  }
                />

                <input
                  className="input"
                  type="time"
                  value={form.endTime}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      endTime: e.target.value,
                    })
                  }
                />
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isAvailable}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      isAvailable: e.target.checked,
                    })
                  }
                />
                Available
              </label>

              <button className="btn-primary w-full">Save availability</button>
            </form>

            <div className="mt-5 space-y-2">
              {availability.map((a) => (
                <div
                  className="flex justify-between rounded-xl bg-slate-50 p-3 text-xs"
                  key={a._id}
                >
                  <span className="font-bold">{a.day}</span>
                  <span>
                    {a.startTime}-{a.endTime}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
