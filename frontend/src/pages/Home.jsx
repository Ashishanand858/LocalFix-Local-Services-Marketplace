import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import ProviderCard from "../components/ProviderCard";
import MapView from "../components/MapView";

const fallbackServices = [
  { name: "Electrician", slug: "electrician", basePrice: 299 },
  { name: "Plumber", slug: "plumber", basePrice: 249 },
  { name: "Carpenter", slug: "carpenter", basePrice: 399 },
  { name: "AC Repair", slug: "ac-repair", basePrice: 499 },
  { name: "House Cleaning", slug: "house-cleaning", basePrice: 699 },
  { name: "Painter", slug: "painter", basePrice: 599 },
  {
    name: "Appliance Repair",
    slug: "appliance-repair",
    basePrice: 349,
  },
  { name: "Maid", slug: "maid", basePrice: 299 },
];

export default function Home() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [providers, setProviders] = useState([]);
  const [query, setQuery] = useState("");
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    api
      .get("/services")
      .then((r) => setServices(r.data.data))
      .catch(() => setServices(fallbackServices));

    api
      .get("/providers")
      .then((r) => setProviders(r.data.data))
      .catch(() => setProviders([]));
  }, []);

  const findNearby = () => {
    if (!navigator.geolocation) {
      return navigate(`/providers?q=${encodeURIComponent(query)}`);
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ latitude, longitude });
        navigate(
          `/services?q=${encodeURIComponent(
            query,
          )}&lat=${latitude}&lng=${longitude}`,
        );
      },
      () => navigate(`/services?q=${encodeURIComponent(query)}`),
    );
  };

  return (
    <div>
      <section className="bg-slate-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:py-28">
          <div>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-slate-300">
              Trusted help, nearby
            </span>
            <h1 className="mt-6 text-5xl font-black tracking-tight sm:text-6xl">
              Fix it. Book it. <span className="text-slate-300">Done.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              LocalFix connects customers with verified local professionals for
              everyday home services—from electricians and plumbers to cleaning,
              AC repair and carpentry.
            </p>

            <div className="mt-8 rounded-2xl bg-white p-2 shadow-2xl">
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && findNearby()}
                  className="min-w-0 flex-1 rounded-xl px-4 py-3 text-slate-900 outline-none"
                  placeholder="What service do you need?"
                />
                <button
                  onClick={findNearby}
                  className="rounded-xl bg-slate-900 px-6 py-3 font-bold text-white"
                >
                  Find providers
                </button>
              </div>
            </div>

            {coords && (
              <p className="mt-3 text-xs text-slate-400">
                Using your current coordinates for nearby-provider search.
              </p>
            )}
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl">
            <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-7">
              <div className="text-sm font-semibold text-slate-400">
                How LocalFix works
              </div>

              <div className="mt-7 space-y-5">
                {[
                  ["01", "Search", "Choose a service and location."],
                  [
                    "02",
                    "Compare",
                    "Check price, rating, experience and availability.",
                  ],
                  ["03", "Book", "Pick a slot and pay securely."],
                  ["04", "Relax", "Track status and review after completion."],
                ].map(([n, title, text]) => (
                  <div className="flex gap-4" key={n}>
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-xs font-black text-slate-900">
                      {n}
                    </span>
                    <div>
                      <div className="font-bold">{title}</div>
                      <div className="text-sm text-slate-400">{text}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">
              Explore
            </p>
            <h2 className="mt-2 text-3xl font-black">Popular services</h2>
          </div>
          <Link to="/services" className="text-sm font-bold text-slate-600">
            View all →
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {(services.length ? services : fallbackServices).map((s) => (
            <Link
              to={`/services?service=${s._id || s.slug}`}
              key={s._id || s.slug}
              className="card p-5 transition hover:-translate-y-1"
            >
              <div className="text-2xl">
                {s.slug?.includes("electric")
                  ? "⚡"
                  : s.slug?.includes("plumb")
                    ? "🔧"
                    : s.slug?.includes("clean") || s.slug === "maid"
                      ? "🧹"
                      : s.slug?.includes("paint")
                        ? "🎨"
                        : s.slug?.includes("ac")
                          ? "❄️"
                          : "🛠️"}
              </div>
              <div className="mt-4 font-bold">{s.name}</div>
              <div className="mt-1 text-sm text-slate-500">
                From ₹{s.basePrice}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">
                Nearby
              </p>
              <h2 className="mt-2 text-3xl font-black">
                Verified professionals
              </h2>
            </div>
            <Link to="/register" className="btn-secondary text-sm">
              Become a provider
            </Link>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {providers.slice(0, 3).map((p) => (
              <ProviderCard key={p._id} provider={p} />
            ))}
          </div>

          {!providers.length && (
            <div className="card mt-8 p-8 text-center text-slate-500">
              No providers seeded yet. Run{" "}
              <code className="font-mono">npm run seed --prefix backend</code>{" "}
              after starting MongoDB.
            </div>
          )}

          <div className="mt-8">
            <MapView
              providers={providers}
              latitude={coords?.latitude}
              longitude={coords?.longitude}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
