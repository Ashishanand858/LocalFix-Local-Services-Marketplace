import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const slots = [
  "09:00 - 10:00",
  "10:00 - 11:00",
  "11:00 - 12:00",
  "14:00 - 15:00",
  "15:00 - 16:00",
  "17:00 - 18:00",
];

export default function Booking() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({
    serviceId: "",
    bookingDate: "",
    timeSlot: "",
    address: "",
    notes: "",
  });
  const [coords, setCoords] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    Promise.all([api.get(`/providers/${id}`), api.get("/services")])
      .then(([p, s]) => {
        setProvider(p.data.data);
        setServices(p.data.data.services || s.data.data);
        if (p.data.data.services?.[0]?._id) {
          setForm((f) => ({
            ...f,
            serviceId: p.data.data.services[0]._id,
          }));
        }
      })
      .catch((e) =>
        toast.error(e.response?.data?.message || "Unable to load provider"),
      );
  }, [id]);

  const useLocation = () => {
    if (!navigator.geolocation) {
      return toast.error("Geolocation is not supported");
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords([pos.coords.longitude, pos.coords.latitude]),
      () => toast.error("Location permission denied"),
    );
  };

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await api.post("/bookings", {
        providerId: id,
        ...form,
        bookingDate: new Date(form.bookingDate).toISOString(),
        coordinates: coords,
      });
      navigate(`/customer?pay=${res.data.data._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Booking failed");
    } finally {
      setBusy(false);
    }
  }

  if (!provider) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center text-slate-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 lg:px-8">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">
        New booking
      </p>
      <h1 className="mt-2 text-4xl font-black">Book {provider.businessName}</h1>

      <div className="mt-8 grid gap-7 lg:grid-cols-[1fr_320px]">
        <form onSubmit={submit} className="card p-7">
          <label className="block text-sm font-semibold">
            Service
            <select
              className="input mt-2"
              required
              value={form.serviceId}
              onChange={(e) =>
                setForm({
                  ...form,
                  serviceId: e.target.value,
                })
              }
            >
              {services.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} — from ₹{s.basePrice}
                </option>
              ))}
            </select>
          </label>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-semibold">
              Date
              <input
                className="input mt-2"
                type="date"
                required
                min={new Date().toISOString().split("T")[0]}
                value={form.bookingDate}
                onChange={(e) =>
                  setForm({
                    ...form,
                    bookingDate: e.target.value,
                  })
                }
              />
            </label>

            <label className="text-sm font-semibold">
              Time slot
              <select
                className="input mt-2"
                required
                value={form.timeSlot}
                onChange={(e) =>
                  setForm({
                    ...form,
                    timeSlot: e.target.value,
                  })
                }
              >
                <option value="">Select slot</option>
                {slots.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="mt-5 block text-sm font-semibold">
            Service address
            <textarea
              className="input mt-2 min-h-24"
              required
              value={form.address}
              onChange={(e) =>
                setForm({
                  ...form,
                  address: e.target.value,
                })
              }
              placeholder="House no., street, locality, city"
            />
          </label>

          <button
            type="button"
            className="btn-secondary mt-3"
            onClick={useLocation}
          >
            {coords ? "Location captured ✓" : "Use my current location"}
          </button>

          <label className="mt-5 block text-sm font-semibold">
            Notes (optional)
            <textarea
              className="input mt-2 min-h-24"
              value={form.notes}
              onChange={(e) =>
                setForm({
                  ...form,
                  notes: e.target.value,
                })
              }
              placeholder="Describe the issue or special instructions"
            />
          </label>

          <button disabled={busy} className="btn-primary mt-7 w-full">
            {busy ? "Creating booking..." : "Create booking & pay"}
          </button>
        </form>

        <aside className="card h-fit p-6">
          <div className="text-sm font-bold text-slate-500">Provider</div>
          <h2 className="mt-2 text-xl font-black">{provider.businessName}</h2>
          <p className="mt-1 text-sm text-slate-500">
            ⭐ {provider.rating.toFixed(1)} · {provider.totalReviews} reviews
          </p>

          <div className="mt-5 border-t border-slate-100 pt-5">
            <div className="text-sm text-slate-500">Starting visit</div>
            <div className="mt-1 text-3xl font-black">
              ₹{provider.pricePerVisit}
            </div>
            <div className="mt-4 flex justify-between text-sm">
              <span>Platform fee</span>
              <span>5%</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
