"use client";

import { useEffect, useState } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";
import { apiFetch } from "@/lib/api";

interface HeatPoint {
  lat: number;
  lng: number;
  weight: number;
}

export default function HeatmapLayer() {
  const map = useMap();
  const [points, setPoints] = useState<HeatPoint[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    apiFetch<{ lat: number; lng: number; weight: number }[]>("/offers/popular-locations")
      .then((data) => {
        if (Array.isArray(data)) {
          setPoints(data.map((p) => ({ lat: p.lat, lng: p.lng, weight: Math.min(p.weight, 1) })));
        }
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (!loaded || points.length === 0) return;

    const heat = (L as any).heatLayer(
      points.map((p) => [p.lat, p.lng, p.weight]),
      {
        radius: 25,
        blur: 15,
        maxZoom: 17,
        max: 1.0,
        gradient: { 0.4: "#13ec49", 0.6: "#fbbf24", 0.8: "#f97316", 1.0: "#ef4444" },
      }
    );

    heat.addTo(map);

    return () => {
      map.removeLayer(heat);
    };
  }, [map, points, loaded]);

  return null;
}
