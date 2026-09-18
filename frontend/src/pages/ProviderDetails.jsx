import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import MapView from "../components/MapView";

export default function ProviderDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);
  const [availability, setAvailability] = useState([]);

  useEffect(() => {
    Promise.all([api.get(`/providers/${id}`), api.get(`/availability/${id}`)])
      .then(([p, a]) => {
        setProvider(p.data.data);
        setAvailability(a.data.data);
      })
      .catch((e) =>
        toast.error(e.response?.data?.message || "Provider not found"),
      );
  }, [id]);

  if (!provider) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center text-slate-500">
        Loading provider...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <Link to="/services" className="text-sm font-bold text-slate-500">
        ← Back to search
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
        <main className="space-y-6">
          <section className="card p-7">
            <div className="flex flex-col gap-5 sm:flex-row">
              <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-3xl bg-slate-100 text-3xl font-black">
                {provider.profileImage ? (
                  <img
                    className="h-full w-full object-cover"
                    src={provider.profileImage}
                    alt=""
                  />
                ) : (
                  provider.businessName[0]
                )}
              </div>

              <div>
                <div className="flex flex-wrap gap-2">
                  <span className="pill">⭐ {provider.rating.toFixed(1)}</span>
                  {provider.isVerified && (
                    <span className="pill">Verified</span>
                  )}
                </div>

                <h1 className="mt-2 text-3xl font-black">
                  {provider.businessName}
                </h1>
                <p className="mt-1 text-slate-500">
                  {provider.city || provider.address}
                </p>
                <p className="mt-4 max-w-2xl leading-7 text-slate-600">
                  {provider.description}
                </p>
              </div>
            </div>

            <div className="mt-7 grid grid-cols-3 gap-3 border-t border-slate-100 pt-5 text-center">
              <div>
                <div className="font-black">{provider.experience} yrs</div>
                <div className="text-xs text-slate-400">Experience</div>
              </div>

              <div>
                <div className="font-black">{provider.totalReviews}</div>
                <div className="text-xs text-slate-400">Reviews</div>
              </div>

              <div>
                <div className="font-black">₹{provider.pricePerVisit}</div>
                <div className="text-xs text-slate-400">Starting visit</div>
              </div>
            </div>
          </section>

          <section className="card p-7">
            <h2 className="text-xl font-black">Services</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {provider.services.map((s) => (
                <span
                  key={s._id}
                  className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-bold"
                >
                  {s.name} · ₹{s.basePrice}
                </span>
              ))}
            </div>
          </section>

          <section className="card p-7">
            <h2 className="text-xl font-black">Availability</h2>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {availability.map((a) => (
                <div
                  className="flex justify-between rounded-xl bg-slate-50 p-3 text-sm"
                  key={a._id}
                >
                  <span className="font-semibold">{a.day}</span>
                  <span className="text-slate-500">
                    {a.isAvailable
                      ? `${a.startTime} – ${a.endTime}`
                      : "Unavailable"}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="card p-7">
            <h2 className="text-xl font-black">Customer reviews</h2>

            <div className="mt-5 space-y-5">
              {provider.reviews?.length ? (
                provider.reviews.map((review) => (
                  <div
                    key={review._id}
                    className="border-b border-slate-100 pb-5 last:border-0"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold">
                        {review.customer?.name || "Customer"}
                      </div>
                      <div>⭐ {review.rating}</div>
                    </div>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {review.comment || "No comment."}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No reviews yet.</p>
              )}
            </div>
          </section>
        </main>

        <aside className="space-y-5">
          <section className="card p-6">
            <h2 className="text-xl font-black">Book this provider</h2>
            <p className="mt-2 text-sm text-slate-500">
              Choose a service and time slot, then complete payment.
            </p>

            <button
              className="btn-primary mt-5 w-full"
              onClick={() =>
                user
                  ? navigate(`/book/${provider._id}`)
                  : navigate("/login", {
                      state: {
                        from: `/book/${provider._id}`,
                      },
                    })
              }
            >
              Book service
            </button>
          </section>

          <MapView providers={[provider]} />
        </aside>
      </div>
    </div>
  );
}
