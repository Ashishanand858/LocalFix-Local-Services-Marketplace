import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const MapView = ({ providers = [], latitude, longitude }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  const token = import.meta.env.VITE_MAPBOX_TOKEN;

  useEffect(() => {
    if (!token || !mapContainerRef.current || mapRef.current) {
      return;
    }

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [Number(longitude) || 85.1376, Number(latitude) || 25.5941],
      zoom: 11,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [token, latitude, longitude]);

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    // Remove old markers
    markersRef.current.forEach((marker) => {
      marker.remove();
    });

    markersRef.current = [];

    providers.forEach((provider) => {
      if (
        !provider?.location?.coordinates ||
        provider.location.coordinates.length !== 2
      ) {
        return;
      }

      // MongoDB format = [longitude, latitude]
      const [lng, lat] = provider.location.coordinates;

      const popupContent = `
        <div style="min-width:220px">
          <h3 style="font-weight:700;margin-bottom:6px;">
            ${provider.businessName || "Service Provider"}
          </h3>

          <p style="margin:4px 0;">
            ⭐ ${provider.rating ?? "New"}
          </p>

          <p style="margin:4px 0;">
            📍 ${provider.city || "Local Service Provider"}
          </p>

          <p style="margin:4px 0;">
            ₹${provider.pricePerVisit ?? "N/A"} / visit
          </p>
        </div>
      `;

      const marker = new mapboxgl.Marker()
        .setLngLat([lng, lat])
        .setPopup(
          new mapboxgl.Popup({
            offset: 25,
          }).setHTML(popupContent),
        )
        .addTo(mapRef.current);

      markersRef.current.push(marker);
    });
  }, [providers]);

  if (!token) {
    return (
      <div className="grid min-h-64 place-items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
        <div>
          <div className="text-3xl">🗺️</div>

          <p className="mt-2 font-semibold text-slate-700">
            Mapbox token is missing
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Add VITE_MAPBOX_TOKEN to frontend/.env
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mapContainerRef}
      className="h-[400px] w-full overflow-hidden rounded-2xl border border-slate-200"
    />
  );
};

export default MapView;
