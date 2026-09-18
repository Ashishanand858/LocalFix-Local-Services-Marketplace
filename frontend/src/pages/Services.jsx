import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";
import ProviderCard from "../components/ProviderCard";
import MapView from "../components/MapView";

export default function Services() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState(params.get("q") || "");
  const [service, setService] = useState(params.get("service") || "");
  const [city, setCity] = useState("");

  useEffect(() => {
    api.get("/services").then((r) => setServices(r.data.data));
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      try {
        const payload = { q, service, city };

        if (params.get("lat")) {
          payload.lat = params.get("lat");
          payload.lng = params.get("lng");
        }

        const res = await api.get("/providers", {
          params: payload,
        });
        setProviders(res.data.data);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [service, city, q, params]);

  const useMyArea = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition((pos) => {
      const next = new URLSearchParams(params);
      next.set("lat", pos.coords.latitude);
      next.set("lng", pos.coords.longitude);
      navigate(`/services?${next.toString()}`);
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">
            Marketplace
          </p>
          <h1 className="mt-2 text-4xl font-black">
            Find a local professional
          </h1>
          <p className="mt-2 text-slate-500">
            Search verified providers by service, city or location.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1.2fr_1fr_1fr_auto]">
        <input
          className="input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search providers"
        />

        <select
          className="input"
          value={service}
          onChange={(e) => setService(e.target.value)}
        >
          <option value="">All services</option>
          {services.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>

        <input
          className="input"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="City"
        />

        <button className="btn-secondary" onClick={useMyArea}>
          Use my area
        </button>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.25fr_.75fr]">
        <div>
          {loading ? (
            <div className="py-20 text-center text-slate-500">
              Finding providers...
            </div>
          ) : providers.length ? (
            <div className="grid gap-5 md:grid-cols-2">
              {providers.map((provider) => (
                <ProviderCard provider={provider} key={provider._id} />
              ))}
            </div>
          ) : (
            <div className="card p-10 text-center">
              <div className="text-4xl">🛠️</div>
              <h2 className="mt-4 text-xl font-black">No providers found</h2>
              <p className="mt-2 text-sm text-slate-500">
                Try another service, city or search term.
              </p>
            </div>
          )}
        </div>

        <div className="lg:sticky lg:top-24 lg:h-fit">
          <MapView providers={providers} />
        </div>
      </div>
    </div>
  );
}
