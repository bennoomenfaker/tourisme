"use client";

import { useEffect, useRef } from "react";
import { MapPin } from "lucide-react";

type PlaceMapProps = {
  lat: number;
  lng: number;
  title?: string;
};

export default function PlaceMap({ lat, lng, title }: PlaceMapProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const bboxLon = 0.02;
  const bboxLat = 0.02;

  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - bboxLon}%2C${lat - bboxLat}%2C${lng + bboxLon}%2C${lat + bboxLat}&layer=mapnik&marker=${lat}%2C${lng}`;

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden bg-slate-100">
      {lat && lng ? (
        <iframe
          ref={iframeRef}
          title={title || "Carte"}
          width="100%"
          height="100%"
          frameBorder="0"
          src={src}
          className="rounded-xl"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="flex items-center justify-center h-full text-slate-400 text-sm">
          <MapPin size={24} className="mr-2" />
          Position non disponible
        </div>
      )}
    </div>
  );
}
