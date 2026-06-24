"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import HeatmapLayer from "@/components/map/HeatmapLayer";

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const circuitIcon = L.divIcon({
  className: "",
  html: `<div style="background:#7c3aed;color:#fff;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 2px 6px rgba(0,0,0,0.3);">⚡</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

interface MarkerData {
  lat: number;
  lng: number;
  label: string;
  type?: "offer" | "circuit";
}

function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 13);
  }, [lat, lng, map]);
  return null;
}

interface MapViewProps {
  lat: number;
  lng: number;
  markers?: MarkerData[];
  className?: string;
  height?: string;
  showHeatmap?: boolean;
}

export default function MapView({ lat, lng, markers, className, height = "220px", showHeatmap = false }: MapViewProps) {
  const [cssReady, setCssReady] = useState(false);

  useEffect(() => {
    if (document.querySelector('link[href*="leaflet.css"]')) {
      setCssReady(true);
      return;
    }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    link.onload = () => setCssReady(true);
    document.head.appendChild(link);
  }, []);

  if (!cssReady) return <div className={`bg-slate-100 animate-pulse rounded-2xl ${className}`} style={{ height }} />;

  const allMarkers = markers?.length
    ? markers
    : [{ lat, lng, label: "", type: "offer" as const }];

  const mapKey = `${lat}-${lng}-${allMarkers.length}-${allMarkers.map(m => `${m.lat},${m.lng}`).join(";")}`;

  return (
    <MapContainer
      key={mapKey}
      center={[lat, lng]}
      zoom={markers && markers.length > 1 ? 11 : 13}
      scrollWheelZoom={true}
      style={{ height, width: "100%", borderRadius: "1rem" }}
      zoomControl={true}
      className={className}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {showHeatmap && <HeatmapLayer />}
      {allMarkers.map((m, i) => (
        <Marker
          key={`${m.lat}-${m.lng}-${i}`}
          position={[m.lat, m.lng]}
          icon={m.type === "circuit" ? circuitIcon : defaultIcon}
        >
          {m.label && <Popup><span className="text-sm font-bold">{m.label}</span></Popup>}
        </Marker>
      ))}
      <Recenter lat={lat} lng={lng} />
    </MapContainer>
  );
}
