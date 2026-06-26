"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { apiFetch } from "@/lib/api";
import {
  MapPin, ArrowLeft, Heart, MessageCircle, Image as ImageIcon,
  ThumbsUp, ThumbsDown, Star, Share2, Tag, Leaf, Flame,
  Check, X, Loader2, ChevronLeft, ChevronRight, Copy, Link2, Send,
} from "lucide-react";
import AppNavbar from "@/components/nav/AppNavbar";
import BackToDashboard from "@/components/nav/BackToDashboard";
import PubInteractions from "@/components/PubInteractions";

const PlaceMap = dynamic(() => import("@/components/map/PlaceMap"), {
  ssr: false,
  loading: () => <div className="h-48 bg-slate-100 animate-pulse rounded-xl flex items-center justify-center"><Loader2 size={20} className="animate-spin text-slate-300" /></div>,
});

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

interface Review {
  id: string;
  author_id: string;
  target_type: string;
  target_id: string;
  rating: number;
  comment: string | null;
  photos: string[] | null;
  created_at: string;
  author: {
    id: string;
    full_name: string;
    email: string;
    photo: string | null;
    role: string;
  };
}

interface AvgRating {
  average: number;
  count: number;
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

function avatarUrl(photo: string | null, name: string) {
  return photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "?")}&background=d1fae5&color=065f46&bold=true&size=64`;
}

const ROLE_LABEL: Record<string, string> = {
  eco_traveler: "Éco-Voyageur", guide: "Guide", project_owner: "Propriétaire", admin: "Admin",
};

export default function PlaceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [place, setPlace] = useState<PlaceDetail | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [galleryIdx, setGalleryIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [showAddPhoto, setShowAddPhoto] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState<AvgRating | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [sendingReview, setSendingReview] = useState(false);

  const [shareDropdown, setShareDropdown] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);

  const [votedPhotos, setVotedPhotos] = useState<Set<string>>(new Set());

  useEffect(() => {
    const t = localStorage.getItem("token") || localStorage.getItem("access_token");
    const u = localStorage.getItem("user");
    setToken(t);
    if (u) try { setUserId(JSON.parse(u).sub ?? JSON.parse(u).id); } catch {}
  }, []);

  useEffect(() => {
    if (!shareDropdown) return;
    function onClickOutside(e: MouseEvent) {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) setShareDropdown(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [shareDropdown]);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      apiFetch<PlaceDetail>(`/publications/${id}`).catch(() => null),
      apiFetch<Photo[]>(`/photos?entity_type=publication&entity_id=${id}`).catch(() => []),
      apiFetch<Review[]>(`/reviews/target/publication/${id}`).catch(() => {
        console.warn("Impossible de charger les avis (backend indisponible ?)");
        return [];
      }),
      apiFetch<AvgRating>(`/reviews/average/publication/${id}`).catch(() => null),
    ]).then(([placeData, photosData, reviewsData, avgData]) => {
      setPlace(placeData);
      setPhotos(photosData);
      setReviews(reviewsData as Review[]);
      setAvgRating(avgData as AvgRating);
      setLoading(false);
    });
  }, [id]);

  async function handleUpvote(photoId: string) {
    if (!token) return router.push(`/auth/login?redirect=/places/${id}`);
    if (votedPhotos.has(photoId)) return;
    setVotedPhotos((prev) => new Set(prev).add(photoId));
    await apiFetch(`/photos/${photoId}/upvote`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    const updated = await apiFetch<Photo[]>(`/photos?entity_type=publication&entity_id=${id}`);
    setPhotos(updated);
  }

  async function handleDownvote(photoId: string) {
    if (!token) return router.push(`/auth/login?redirect=/places/${id}`);
    if (votedPhotos.has(photoId)) return;
    setVotedPhotos((prev) => new Set(prev).add(photoId));
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

  async function sendReview() {
    if (!token || !reviewComment.trim()) return;
    setSendingReview(true);
    try {
      await apiFetch("/reviews", {
        method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ target_type: "publication", target_id: id, rating: reviewRating, comment: reviewComment.trim() }),
      });
      const [updatedReviews, updatedAvg] = await Promise.all([
        apiFetch<Review[]>(`/reviews/target/publication/${id}`),
        apiFetch<AvgRating>(`/reviews/average/publication/${id}`),
      ]);
      setReviews(updatedReviews);
      setAvgRating(updatedAvg);
      setReviewComment("");
      setReviewRating(5);
      setReviewOpen(false);
    } catch (err: any) {
      if (err?.message?.includes("déjà")) alert("Vous avez déjà laissé un avis sur ce lieu.");
      else alert("Erreur lors de l'envoi de l'avis. Vérifiez que le backend est lancé.");
    } finally {
      setSendingReview(false);
    }
  }

  async function handleDeleteReview(reviewId: string) {
    if (!token) return;
    if (!confirm("Supprimer cet avis ?")) return;
    try {
      await apiFetch(`/reviews/${reviewId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      const avg = await apiFetch<AvgRating>(`/reviews/average/publication/${id}`);
      setAvgRating(avg);
    } catch {}
  }

  function handleCopyLink() {
    setShareDropdown(false);
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
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
          <div className="relative">
            {allImages.length > 0 && (
              <>
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
                </div>
              </>
            )}
            {allImages.length === 0 && (
              <div className="h-48 bg-slate-100 flex items-center justify-center">
                <div className="text-center text-slate-400">
                  <ImageIcon size={40} className="mx-auto mb-2" />
                  <p className="text-sm">Aucune photo pour ce lieu</p>
                </div>
              </div>
            )}
            {token && (
              <div className="absolute top-3 right-3 z-10 flex gap-2">
                <button onClick={() => setShowAddPhoto(true)} className="bg-white/90 hover:bg-white rounded-full p-2 shadow-sm transition-colors" title="Ajouter une photo">
                  <ImageIcon size={18} className="text-slate-600" />
                </button>
              </div>
            )}
          </div>

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
                  {avgRating && avgRating.count > 0 && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-amber-500 ml-1">
                      <Star size={12} fill="currentColor" /> {avgRating.average} ({avgRating.count})
                    </span>
                  )}
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

            {/* Share */}
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
              <div ref={shareRef} className="relative">
                <button
                  onClick={() => setShareDropdown(!shareDropdown)}
                  className={`flex items-center gap-1.5 text-sm transition-colors ${copied ? "text-primary" : "text-slate-400 hover:text-primary"}`}
                >
                  {copied ? <Check size={16} /> : <Share2 size={16} />}
                  {copied ? "Copié !" : "Partager"}
                </button>
                {shareDropdown && (
                  <div className="absolute top-full mt-1 left-0 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-10">
                    <button onClick={handleCopyLink} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                      <Link2 size={14} className="text-slate-400 shrink-0" />
                      Copier le lien
                    </button>
                    <button
                      onClick={() => {
                        setShareDropdown(false);
                        const text = `Découvre ${place.title} sur Éco-Voyage !`;
                        if (navigator.share) {
                          navigator.share({ title: text, url: window.location.href }).catch(() => {});
                        } else {
                          navigator.clipboard.writeText(`${text}\n${window.location.href}`).then(() => {
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          });
                        }
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors border-t border-slate-50"
                    >
                      <Send size={14} className="text-blue-400 shrink-0" />
                      Partager sur...
                    </button>
                  </div>
                )}
              </div>

              {place.latitude && place.longitude && (
                <a
                  href={`https://www.google.com/maps?q=${place.latitude},${place.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-blue-500 hover:text-blue-700 ml-auto"
                >
                  <MapPin size={16} /> Google Maps
                </a>
              )}
            </div>

            {/* Carte du lieu */}
            {place.latitude && place.longitude && (
              <div className="mb-6 rounded-xl overflow-hidden border border-slate-100 h-48">
                <Suspense fallback={<div className="h-full bg-slate-100 animate-pulse" />}>
                  <PlaceMap lat={place.latitude} lng={place.longitude} title={place.title} />
                </Suspense>
              </div>
            )}

            {/* Photos section */}
            {sortedPhotos.length > 0 && (
              <div className="mb-6">
                <h3 className="font-bold text-slate-700 text-sm mb-3 flex items-center gap-1.5">
                  <ImageIcon size={16} /> Photos ({sortedPhotos.length})
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {sortedPhotos.map((photo) => (
                    <div key={photo.id} className="relative group rounded-xl overflow-hidden bg-slate-100 aspect-square">
                      <img
                        src={photo.url}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/400x300/e2e8f0/94a3b8?text=Photo`; }}
                      />
                      {photo.is_hero && (
                        <span className="absolute top-2 left-2 bg-amber-400 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 flex items-center gap-0.5 shadow">
                          <Star size={10} /> Photo principale
                        </span>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-0 left-0 right-0 p-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="text-white text-xs font-bold">{photo.score}</span>
                              <span className="text-[10px] text-white/60">pts</span>
                              <div className="flex gap-1 ml-1">
                                <button
                                  onClick={() => handleUpvote(photo.id)}
                                  disabled={votedPhotos.has(photo.id)}
                                  className={`p-1 rounded-full transition-all ${votedPhotos.has(photo.id) ? "bg-green-500 text-white" : "bg-white/20 text-white hover:bg-green-500/80"}`}
                                  title="J'aime cette photo"
                                >
                                  <ThumbsUp size={10} />
                                </button>
                                <button
                                  onClick={() => handleDownvote(photo.id)}
                                  disabled={votedPhotos.has(photo.id)}
                                  className={`p-1 rounded-full transition-all ${votedPhotos.has(photo.id) ? "bg-red-500 text-white" : "bg-white/20 text-white hover:bg-red-500/80"}`}
                                  title="Je n'aime pas cette photo"
                                >
                                  <ThumbsDown size={10} />
                                </button>
                              </div>
                            </div>
                            {token && !photo.is_hero && (
                              <button onClick={() => handleSetHero(photo.id)} className="p-1 rounded-full bg-white/20 text-white hover:bg-amber-400/80 transition-all" title="Définir comme photo principale">
                                <Star size={10} />
                              </button>
                            )}
                          </div>
                          <p className="text-[9px] text-white/50 mt-1">Votez pour les photos</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add photo */}
            {token && !showAddPhoto && (
              <button onClick={() => setShowAddPhoto(true)} className="w-full py-2.5 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 text-sm font-medium hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2 mb-6">
                <ImageIcon size={16} /> Ajouter une photo
              </button>
            )}

            {showAddPhoto && (
              <div className="p-4 bg-slate-50 rounded-xl mb-6">
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

            {/* Commentaires (via PubInteractions) - visible pour tous */}
            <div className="mb-6">
              <PubInteractions
                pubId={id}
                token={token || ""}
                viewerId={userId || ""}
                shareUrl={window.location.href}
                pubTitle={place.title}
              />
            </div>

            {/* Reviews / Avis Section */}
            <div className="border-t border-slate-100 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Star size={16} /> Avis
                  {avgRating && avgRating.count > 0 && (
                    <span className="text-sm font-normal text-slate-400 ml-1">
                      ({avgRating.average} · {avgRating.count} avis)
                    </span>
                  )}
                </h3>
                {token ? (
                  <button
                    onClick={() => setReviewOpen(!reviewOpen)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-colors ${
                      reviewOpen ? "bg-slate-100 text-slate-500" : "bg-primary text-white hover:bg-emerald-600"
                    }`}
                  >
                    {reviewOpen ? "Annuler" : "Donner mon avis"}
                  </button>
                ) : (
                  <button
                    onClick={() => router.push(`/auth/login?redirect=/places/${id}`)}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    Connectez-vous pour donner votre avis
                  </button>
                )}
              </div>

              {reviewOpen && (
                <div className="mb-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} onClick={() => setReviewRating(star)} className="transition-colors">
                        <Star size={18} className={star <= reviewRating ? "text-amber-400 fill-amber-400" : "text-slate-200"} />
                      </button>
                    ))}
                    <span className="text-xs text-slate-400 ml-2">{reviewRating}/5</span>
                  </div>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Partagez votre expérience dans ce lieu..."
                    rows={3}
                    maxLength={1000}
                    className="w-full text-sm bg-white border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary/40 transition-colors resize-none"
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={sendReview}
                      disabled={!reviewComment.trim() || sendingReview}
                      className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-emerald-600 disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {sendingReview ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                      Publier mon avis
                    </button>
                  </div>
                </div>
              )}

              {reviews.length === 0 && !reviewOpen && (
                <p className="text-xs text-slate-400 text-center py-6">
                  Aucun avis pour ce lieu. {token ? "Soyez le premier !" : "Connectez-vous pour donner votre avis."}
                </p>
              )}

              <div className="space-y-3">
                {reviews.map((review) => (
                  <div key={review.id} className="flex gap-3 p-3 rounded-xl bg-slate-50/50 border border-slate-50">
                    <img
                      src={avatarUrl(review.author?.photo, review.author?.full_name)}
                      alt={review.author?.full_name}
                      className="w-9 h-9 rounded-full object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-bold text-slate-800">{review.author?.full_name}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{ROLE_LABEL[review.author?.role] || review.author?.role}</span>
                        <span className="text-[10px] text-slate-300">·</span>
                        <span className="text-[10px] text-slate-400">{fmtDate(review.created_at)}</span>
                      </div>
                      <div className="flex gap-0.5 mb-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} size={11} className={star <= review.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"} />
                        ))}
                      </div>
                      {review.comment && (
                        <p className="text-sm text-slate-600 leading-relaxed">{review.comment}</p>
                      )}
                      {/* Seul l'auteur peut supprimer */}
                      {token && review.author_id === userId && (
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          className="mt-1 text-[11px] font-bold text-slate-300 hover:text-rose-400 transition-colors"
                        >
                          Supprimer
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
