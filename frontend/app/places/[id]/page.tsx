"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import {
  MapPin, ArrowLeft, Heart, MessageCircle, Image as ImageIcon,
  ThumbsUp, ThumbsDown, Star, Share2, Clock, Tag, Leaf, Flame,
  Trophy, Check, X, Loader2, ChevronLeft, ChevronRight,
} from "lucide-react";
import AppNavbar from "@/components/nav/AppNavbar";
import BackToDashboard from "@/components/nav/BackToDashboard";

interface PlaceDetail {
  id: string;
  author_id: string;
  title: string;
  description: string | null;
  images: string[] | null;
  latitude: number | null;
  longitude: number | null;
  place_name: string | null;
  region: string | null;
  category: string | null;
  tags: string[] | null;
  popularity_score: number;
  status: string;
  created_at: string;
}

interface Photo {
  id: string;
  url: string;
  entity_type: string;
  entity_id: string;
  is_hero: boolean;
  score: number;
  uploaded_by: string;
  created_at: string;
}

interface Interactions {
  likes: number;
  commentsCount: number;
  liked: boolean;
}

export default function PlaceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [place, setPlace] = useState<PlaceDetail | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [interactions, setInteractions] = useState<Interactions | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [galleryIdx, setGalleryIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [showAddPhoto, setShowAddPhoto] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem("token");
    const u = localStorage.getItem("user");
    setToken(t);
    if (u) try { setUserId(JSON.parse(u).sub ?? JSON.parse(u).id); } catch {}
  }, []);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      apiFetch<PlaceDetail>(`/publications/${id}`).catch(() => null),
      apiFetch<Photo[]>(`/photos?entity_type=publication&entity_id=${id}`).catch(() => []),
      apiFetch<Interactions>(`/publications/${id}/interactions${userId ? `?viewer=${userId}` : ""}`).catch(() => null),
    ]).then(([placeData, photosData, interactionsData]) => {
      setPlace(placeData);
      setPhotos(photosData);
      setInteractions(interactionsData);
      setLoading(false);
    });
  }, [id, userId]);

  async function handleLike() {
    if (!token) return router.push(`/auth/login?redirect=/places/${id}`);
    const res = await apiFetch<{ liked: boolean; count: number }>(`/publications/${id}/like`, {
      method: "POST", headers: { Authorization: `Bearer ${token}` },
    });
    setInteractions((prev) => prev ? { ...prev, likes: res.count, liked: res.liked } : prev);
  }

  async function handleUpvote(photoId: string) {
    if (!token) return;
    await apiFetch(`/photos/${photoId}/upvote`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    const updated = await apiFetch<Photo[]>(`/photos?entity_type=publication&entity_id=${id}`);
    setPhotos(updated);
  }

  async function handleDownvote(photoId: string) {
    if (!token) return;
    await apiFetch(`/photos/${photoId}/downvote`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    const updated = await apiFetch<Photo[]>(`/photos?entity_type=publication&entity_id=${id}`);
    setPhotos(updated);
  }

  async function handleSetHero(photoId: string) {
    if (!token) return;
    await apiFetch(`/photos/${photoId}/hero`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    const updated = await apiFetch<Photo[]>(`/photos?entity_type=publication&entity_id=${id}`);
    setPhotos(updated);
  }

  async function handleUploadPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}/upload`, {
        method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd,
      });
      const { url } = await uploadRes.json();
      await apiFetch("/photos", {
        method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ url, entity_type: "publication", entity_id: id }),
      });
      const updated = await apiFetch<Photo[]>(`/photos?entity_type=publication&entity_id=${id}`);
      setPhotos(updated);
      setShowAddPhoto(false);
    } catch {} finally {
      setUploading(false);
    }
  }

  const allImages = [
    ...(place?.images?.map((url) => ({ url, from: "place" as const })) ?? []),
    ...photos.map((p) => ({ url: p.url, from: "photo" as const })),
  ];
  const sortedPhotos = [...photos].sort((a, b) => (b.is_hero ? 1 : 0) - (a.is_hero ? 1 : 0) || b.score - a.score);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!place) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center">
        <p className="text-slate-500">Lieu introuvable</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 pb-12">
      <AppNavbar title={place.title} />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <BackToDashboard />

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Gallery */}
          {allImages.length > 0 && (
            <div className="relative">
              <div className="h-64 sm:h-80 bg-slate-100 relative">
                <img
                  src={allImages[galleryIdx]?.url}
                  alt={place.title}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => setLightboxOpen(true)}
                />
                {allImages.length > 1 && (
                  <>
                    <button onClick={() => setGalleryIdx((i) => (i - 1 + allImages.length) % allImages.length)} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1.5 hover:bg-white">
                      <ChevronLeft size={18} />
                    </button>
                    <button onClick={() => setGalleryIdx((i) => (i + 1) % allImages.length)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1.5 hover:bg-white">
                      <ChevronRight size={18} />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {allImages.map((_, i) => (
                        <button key={i} onClick={() => setGalleryIdx(i)} className={`w-2 h-2 rounded-full transition-colors ${i === galleryIdx ? "bg-white" : "bg-white/50"}`} />
                      ))}
                    </div>
                  </>
                )}
              </div>
              <div className="flex gap-2 p-2 overflow-x-auto bg-slate-50">
                {allImages.map((img, i) => (
                  <button key={i} onClick={() => setGalleryIdx(i)} className={`shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-colors ${i === galleryIdx ? "border-primary" : "border-transparent"}`}>
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
                {token && (
                  <button onClick={() => setShowAddPhoto(true)} className="shrink-0 w-16 h-12 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:border-primary hover:text-primary transition-colors">
                    <ImageIcon size={16} />
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {place.category && (
                    <span className="text-[10px] font-semibold text-white bg-primary rounded-full px-2 py-0.5 flex items-center gap-1">
                      <Tag size={10} /> {place.category}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-xs font-semibold text-primary">
                    <Flame size={14} /> {place.popularity_score}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-slate-800">{place.title}</h1>
                {(place.place_name || place.region) && (
                  <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                    <MapPin size={14} /> {place.place_name}{place.place_name && place.region ? ", " : ""}{place.region}
                  </p>
                )}
              </div>
            </div>

            {place.description && (
              <p className="text-sm text-slate-600 mb-4 whitespace-pre-line">{place.description}</p>
            )}

            {place.tags && place.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {place.tags.map((tag) => (
                  <span key={tag} className="text-[11px] text-slate-500 bg-slate-100 rounded-full px-2 py-0.5">#{tag}</span>
                ))}
              </div>
            )}

            {/* Interactions bar */}
            {interactions && (
              <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-100">
                <button onClick={handleLike} className={`flex items-center gap-1.5 text-sm transition-colors ${interactions.liked ? "text-rose-500" : "text-slate-400 hover:text-rose-500"}`}>
                  <Heart size={16} fill={interactions.liked ? "currentColor" : "none"} /> {interactions.likes}
                </button>
                <span className="flex items-center gap-1.5 text-sm text-slate-400">
                  <MessageCircle size={16} /> {interactions.commentsCount}
                </span>
                {place.latitude && place.longitude && (
                  <a
                    href={`https://www.google.com/maps?q=${place.latitude},${place.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-blue-500 hover:text-blue-700 ml-auto"
                  >
                    <MapPin size={16} /> Voir sur Google Maps
                  </a>
                )}
              </div>
            )}

            {/* Photos section */}
            {sortedPhotos.length > 0 && (
              <div>
                <h3 className="font-bold text-slate-700 text-sm mb-3 flex items-center gap-1.5">
                  <ImageIcon size={16} /> Photos ({sortedPhotos.length})
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {sortedPhotos.map((photo) => (
                    <div key={photo.id} className="relative group rounded-xl overflow-hidden bg-slate-100 aspect-square">
                      <img src={photo.url} alt="" className="w-full h-full object-cover" />
                      {photo.is_hero && (
                        <span className="absolute top-2 left-2 bg-amber-400 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 flex items-center gap-0.5">
                          <Star size={10} /> Hero
                        </span>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-white text-xs font-semibold">{photo.score}</span>
                            <div className="flex gap-1">
                              <button onClick={() => handleUpvote(photo.id)} className="text-white/70 hover:text-green-400 transition-colors" title="Upvote">
                                <ThumbsUp size={12} />
                              </button>
                              <button onClick={() => handleDownvote(photo.id)} className="text-white/70 hover:text-red-400 transition-colors" title="Downvote">
                                <ThumbsDown size={12} />
                              </button>
                            </div>
                          </div>
                          {token && !photo.is_hero && (
                            <button onClick={() => handleSetHero(photo.id)} className="text-amber-300/70 hover:text-amber-400 transition-colors" title="Définir comme photo principale">
                              <Star size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add photo button (always visible with token) */}
            {token && !showAddPhoto && (
              <button onClick={() => setShowAddPhoto(true)} className="mt-4 w-full py-2.5 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 text-sm font-medium hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2">
                <ImageIcon size={16} /> Ajouter une photo
              </button>
            )}

            {showAddPhoto && (
              <div className="mt-4 p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">Ajouter une photo</span>
                  <button onClick={() => setShowAddPhoto(false)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
                </div>
                <label className="flex items-center justify-center gap-2 w-full py-6 rounded-xl border-2 border-dashed border-slate-300 cursor-pointer hover:border-primary hover:bg-white transition-colors">
                  <input type="file" accept="image/*" onChange={handleUploadPhoto} className="hidden" disabled={uploading} />
                  {uploading ? (
                    <Loader2 size={20} className="animate-spin text-primary" />
                  ) : (
                    <>
                      <ImageIcon size={20} className="text-slate-400" />
                      <span className="text-sm text-slate-500">Choisir un fichier</span>
                    </>
                  )}
                </label>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && allImages[galleryIdx] && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={() => setLightboxOpen(false)}>
          <button onClick={() => setLightboxOpen(false)} className="absolute top-4 right-4 text-white/70 hover:text-white"><X size={28} /></button>
          <img src={allImages[galleryIdx].url} alt="" className="max-w-[90vw] max-h-[90vh] object-contain" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
