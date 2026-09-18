import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";
import StatusBadge from "../components/StatusBadge";
import PaymentBox from "../components/PaymentBox";
import toast from "react-hot-toast";
import { useSocket } from "../context/SocketContext";

export default function CustomerDashboard() {
  const [bookings, setBookings] = useState([]);
  const [reviewing, setReviewing] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: "",
  });
  const [params] = useSearchParams();
  const { socket } = useSocket();
  const payId = params.get("pay");
  const mode = params.get("mode") || "demo";

  const load = () =>
    api.get("/bookings/my").then((r) => setBookings(r.data.data));

  useEffect(() => {
    load().catch(() => {});
  }, []);

  useEffect(() => {
    if (!socket) return;

    const onUpdate = () => load();

    socket.on("booking_accepted", onUpdate);
    socket.on("booking_rejected", onUpdate);
    socket.on("booking_completed", onUpdate);

    return () => {
      socket.off("booking_accepted", onUpdate);
      socket.off("booking_rejected", onUpdate);
      socket.off("booking_completed", onUpdate);
    };
  }, [socket]);

  async function submitReview(e) {
    e.preventDefault();

    try {
      await api.post("/reviews", {
        bookingId: reviewing._id,
        ...reviewForm,
      });
      toast.success("Review submitted");
      setReviewing(null);
      setReviewForm({ rating: 5, comment: "" });
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Review failed");
    }
  }

  async function update(id, status) {
    try {
      await api.put(`/bookings/${id}/status`, { status });
      toast.success(`Booking ${status.replace("_", " ")}`);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Update failed");
    }
  }

  const active = bookings.filter(
    (b) => !["completed", "cancelled", "rejected"].includes(b.status),
  );
  const target = bookings.find((b) => b._id === payId);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">
          Customer dashboard
        </p>
        <h1 className="mt-2 text-4xl font-black">Your bookings</h1>
        <p className="mt-2 text-slate-500">
          Track requests, payments and completed services.
        </p>
      </div>

      {target && target.paymentStatus !== "paid" && (
        <div className="mt-8">
          <PaymentBox bookingId={target._id} mode={mode} onPaid={load} />
        </div>
      )}

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        <div className="card p-5">
          <div className="text-sm text-slate-500">Active bookings</div>
          <div className="mt-2 text-3xl font-black">{active.length}</div>
        </div>

        <div className="card p-5">
          <div className="text-sm text-slate-500">Completed</div>
          <div className="mt-2 text-3xl font-black">
            {bookings.filter((b) => b.status === "completed").length}
          </div>
        </div>

        <div className="card p-5">
          <div className="text-sm text-slate-500">Total spent</div>
          <div className="mt-2 text-3xl font-black">
            ₹
            {bookings
              .filter((b) => b.paymentStatus === "paid")
              .reduce((sum, b) => sum + b.amount + b.platformFee, 0)}
          </div>
        </div>
      </div>

      <section className="mt-8 card overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-5 font-black">
          Booking history
        </div>

        <div className="divide-y divide-slate-100">
          {bookings.map((b) => (
            <div
              className="grid gap-4 px-6 py-5 md:grid-cols-[1.3fr_.9fr_.8fr_auto] md:items-center"
              key={b._id}
            >
              <div>
                <div className="font-bold">{b.service?.name}</div>
                <div className="mt-1 text-sm text-slate-500">
                  {b.provider?.user?.name || "Provider"} ·{" "}
                  {new Date(b.bookingDate).toLocaleDateString()} · {b.timeSlot}
                </div>
              </div>

              <div className="text-sm text-slate-600">
                ₹{b.amount + b.platformFee}
                <br />
                <span className="text-xs">Payment: {b.paymentStatus}</span>
              </div>

              <StatusBadge status={b.status} />

              <div className="flex gap-2">
                {b.status === "pending" && (
                  <button
                    className="btn-secondary text-xs"
                    onClick={() => update(b._id, "cancelled")}
                  >
                    Cancel
                  </button>
                )}

                {b.status === "completed" && (
                  <button
                    className="btn-primary text-xs"
                    onClick={() => setReviewing(b)}
                  >
                    Review
                  </button>
                )}
              </div>
            </div>
          ))}

          {!bookings.length && (
            <div className="p-10 text-center text-slate-500">
              No bookings yet. Head to Services to book a professional.
            </div>
          )}
        </div>
      </section>

      {reviewing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4">
          <form onSubmit={submitReview} className="card w-full max-w-md p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black">Review service</h2>
              <button
                type="button"
                className="text-slate-400"
                onClick={() => setReviewing(null)}
              >
                ✕
              </button>
            </div>

            <p className="mt-2 text-sm text-slate-500">
              {reviewing.service?.name} · {reviewing.provider?.user?.name}
            </p>

            <select
              className="input mt-5"
              value={reviewForm.rating}
              onChange={(e) =>
                setReviewForm({
                  ...reviewForm,
                  rating: Number(e.target.value),
                })
              }
            >
              <option value="5">5 — Excellent</option>
              <option value="4">4 — Good</option>
              <option value="3">3 — Average</option>
              <option value="2">2 — Poor</option>
              <option value="1">1 — Bad</option>
            </select>

            <textarea
              className="input mt-3 min-h-28"
              placeholder="Tell other customers about the service"
              value={reviewForm.comment}
              onChange={(e) =>
                setReviewForm({
                  ...reviewForm,
                  comment: e.target.value,
                })
              }
            />

            <button className="btn-primary mt-4 w-full">Submit review</button>
          </form>
        </div>
      )}
    </div>
  );
}
