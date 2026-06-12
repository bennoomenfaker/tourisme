"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  MapPin, Leaf, ArrowLeft, Globe, UserCheck, UserPlus,
  Clock, Check, X, Quote, Mountain, MoreVertical, Send,
  UserMinus, ShieldBan, Flag, ChevronLeft, ChevronRight,
} from "lucide-react";
import dynamic from "next/dynamic";
import { apiFetch } from "@/lib/api";
import PubInteractions from "@/components/PubInteractions";

const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
  loading: () => <div className="h-[200px] rounded-xl bg-slate-100 animate-pulse" />,
});

function PubMap({ lat, lng, address }: { lat: number | null; lng: number | null; address: string }) {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    lat && lng ? { lat: Number(lat), lng: Number(lng) } : null
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (coords || !address.trim()) return;
    setLoading(true);
    fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1&accept-language=fr`)
      .then((r) => r.json())
      .then((d) => { if (d.length) setCoords({ lat: parseFloat(d[0].lat), lng: parseFloat(d[0].lon) }); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [address]);

  if (loading) return <div className="h-[200px] rounded-xl bg-slate-100 animate-pulse" />;
  if (!coords) return null;
  return (
    <div>
      <MapView lat={coords.lat} lng={coords.lng} />
      <a href={`https://www.openstreetmap.org/?mlat=${coords.lat}&mlon=${coords.lng}#map=14/${coords.lat}/${coords.lng}`}
        target="_blank" rel="noopener noreferrer"
        className="mt-1.5 flex justify-end text-[10px] font-black text-primary uppercase tracking-wider hover:underline">
        Ouvrir dans la carte ↗
      </a>
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

type PublicProfile = {
  user_id: string;
  full_name: string;
  bio: string | null;
  photo: string | null;
  cover_photo: string | null;
  country: string | null;
  sustainability_score: number | null;
  traveler_types: string[] | null;
  publications: Publication[];
  friend_status: "none" | "pending_sent" | "pending_received" | "accepted";
  friendship_id: string | null;
};

type Publication = {
  id: string;
  type: "place" | "experience";
  title: string;
  description: string | null;
  images: string[] | null;
  place_name: string | null;
  region: string | null;
  created_at: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const COUNTRY_LABELS: Record<string, string> = {
  TN: "Tunisie", MA: "Maroc", DZ: "Algérie", FR: "France",
  DE: "Allemagne", IT: "Italie", ES: "Espagne", GB: "Royaume-Uni", OTHER: "Autre",
};

const TRAVELER_TYPE_LABELS: Record<string, string> = {
  aventurier: "Aventurier", culturel: "Culturel", eco_conscient: "Éco-Conscient",
  famille: "Famille", groupe: "Groupe", group: "Groupe",
  solo: "Voyageur solo", digital_nomad: "Digital Nomad",
};

const REPORT_REASONS = [
  "Contenu inapproprié", "Faux profil", "Harcèlement ou spam",
  "Informations trompeuses", "Autre",
];

function scoreLabel(score: number | null) {
  if (score === null) return "Éco-Voyageur";
  if (score >= 80) return "Ambassadeur Éco Voyage";
  if (score >= 60) return "Voyageur Éco-Responsable";
  if (score >= 40) return "Voyageur Engagé";
  return "Voyageur Sensibilisé";
}

function scoreColor(score: number) {
  if (score >= 80) return { text: "text-primary", bar: "bg-primary" };
  if (score >= 60) return { text: "text-emerald-600", bar: "bg-emerald-500" };
  if (score >= 40) return { text: "text-teal-600", bar: "bg-teal-500" };
  return { text: "text-blue-600", bar: "bg-blue-500" };
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

// ─── PubRow ───────────────────────────────────────────────────────────────────

function PubRow({ pub }: { pub: Publication }) {
  const isExp = pub.type === "experience";
  const img = pub.images?.find((s) => s.startsWith("http"));

  return (
    <div className="flex gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-colors group">
      {/* Thumbnail */}
      <div className={`w-20 h-20 rounded-xl overflow-hidden shrink-0 flex items-center justify-center ${!img ? (isExp ? "bg-gradient-to-br from-teal-400 to-emerald-300" : "bg-gradient-to-br from-blue-400 to-cyan-300") : ""}`}>
        {img
          ? <img src={img} alt={pub.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          : <span className="material-symbols-outlined text-white/70" style={{ fontSize: 32 }}>{isExp ? "hiking" : "location_on"}</span>
        }
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full ${isExp ? "bg-teal-50 text-teal-700" : "bg-blue-50 text-blue-700"}`}>
            {isExp ? "Expérience" : "Lieu"}
          </span>
          <span className="text-[11px] text-slate-400 font-medium">{formatDate(pub.created_at)}</span>
        </div>
        <h4 className="font-extrabold text-slate-800 text-sm leading-snug mb-1 line-clamp-1">{pub.title}</h4>
        {(pub.place_name || pub.region) && (
          <div className="flex items-center gap-1 text-xs text-slate-400 font-medium mb-1">
            <MapPin size={10} className="text-primary shrink-0" />
            {[pub.place_name, pub.region].filter(Boolean).join(" — ")}
          </div>
        )}
        {pub.description && (
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{pub.description}</p>
        )}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function PublicEcoTravelerProfile() {
  const { userId } = useParams<{ userId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const highlightedPubId = searchParams.get("pub");
  const menuRef = useRef<HTMLDivElement>(null);

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const [viewerRole, setViewerRole] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);

  const [tab, setTab] = useState<"all" | "places" | "experiences">("all");
  const [selectedPub, setSelectedPub] = useState<Publication | null>(null);
  const [sliderIdx, setSliderIdx] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportSent, setReportSent] = useState(false);
  const [blockConfirm, setBlockConfirm] = useState(false);
  const [removeConfirm, setRemoveConfirm] = useState(false);
  const [blocked, setBlocked] = useState(false);
  type SocialUser = { user_id: string; full_name: string | null; photo: string | null; country?: string | null };
  const [theirFriends, setTheirFriends] = useState<SocialUser[]>([]);
  const [myFriendIds,  setMyFriendIds]  = useState<Set<string>>(new Set());
  const [viewerId,     setViewerId]     = useState("");
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [isFollower, setIsFollower] = useState(false);
  const pubRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Scroll to highlighted publication from ?pub= query param
  useEffect(() => {
    if (!highlightedPubId || !profile) return;
    const el = pubRefs.current[highlightedPubId];
    if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "center" }), 400);
  }, [highlightedPubId, profile]);

  useEffect(() => {
    const tkn = localStorage.getItem("access_token") || localStorage.getItem("token") || "";
    if (!tkn) { router.push("/auth/login"); return; }
    setToken(tkn);
    let role = ""; let vid = "";
    try { const p = JSON.parse(atob(tkn.split(".")[1])); role = p.role ?? ""; vid = p.sub ?? ""; setViewerRole(role); setViewerId(vid); } catch {}
    apiFetch<PublicProfile>(`/eco-traveler/profile/${userId}`, {
      headers: { Authorization: `Bearer ${tkn}` },
    }).then(setProfile).catch((e: Error) => setError(e.message)).finally(() => setLoading(false));
    // Load their friends + my connections for mutual detection
    apiFetch<SocialUser[]>(`/eco-traveler/friends/public/${userId}`, { headers: { Authorization: `Bearer ${tkn}` } })
      .then(setTheirFriends).catch(() => {});
    if (role === "eco_traveler") {
      apiFetch<SocialUser[]>("/eco-traveler/friends", { headers: { Authorization: `Bearer ${tkn}` } })
        .then((list) => setMyFriendIds(new Set(list.map((f) => f.user_id)))).catch(() => {});
    }
    if (role === "guide" || role === "project_owner") {
      apiFetch<{ user_id: string }[]>("/follows/followers/profiles", { headers: { Authorization: `Bearer ${tkn}` } })
        .then((list) => setIsFollower(list.some((f) => f.user_id === userId)))
        .catch(() => {});
    }
  }, [userId]);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  async function sendRequest() {
    if (!token || !profile) return;
    setActionLoading(true);
    try {
      const f = await apiFetch<{ id: string }>(`/eco-traveler/friends/request/${userId}`, {
        method: "POST", headers: { Authorization: `Bearer ${token}` },
      });
      setProfile((p) => p ? { ...p, friend_status: "pending_sent", friendship_id: f.id } : p);
    } finally { setActionLoading(false); }
  }

  async function cancelRequest() {
    if (!token || !profile?.friendship_id) return;
    setActionLoading(true);
    try {
      await apiFetch(`/eco-traveler/friends/${profile.friendship_id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` },
      });
      setProfile((p) => p ? { ...p, friend_status: "none", friendship_id: null } : p);
    } finally { setActionLoading(false); }
  }

  async function acceptRequest() {
    if (!token || !profile?.friendship_id) return;
    setActionLoading(true);
    try {
      await apiFetch(`/eco-traveler/friends/accept/${profile.friendship_id}`, {
        method: "PATCH", headers: { Authorization: `Bearer ${token}` },
      });
      setProfile((p) => p ? { ...p, friend_status: "accepted" } : p);
    } finally { setActionLoading(false); }
  }

  async function removeFriend() {
    if (!token || !profile?.friendship_id) return;
    setActionLoading(true);
    try {
      await apiFetch(`/eco-traveler/friends/${profile.friendship_id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` },
      });
      setProfile((p) => p ? { ...p, friend_status: "none", friendship_id: null } : p);
      setRemoveConfirm(false);
    } finally { setActionLoading(false); }
  }

  function handleContact() {
    const name = encodeURIComponent(profile?.full_name ?? "");
    router.push(`/messagerie?recipient=${userId}&name=${name}&role=eco_traveler`);
  }

  async function blockUser() {
    if (!token) return;
    setActionLoading(true);
    try {
      await apiFetch(`/eco-traveler/block/${userId}`, {
        method: "POST", headers: { Authorization: `Bearer ${token}` },
      });
      setBlocked(true); setBlockConfirm(false);
    } finally { setActionLoading(false); }
  }

  async function reportUser() {
    if (!token || !reportReason) return;
    setActionLoading(true);
    try {
      await apiFetch(`/reports`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reported_id: userId, reason: reportReason }),
      });
      setReportSent(true);
    } finally { setActionLoading(false); }
  }

  // ── States ─────────────────────────────────────────────────────────────────

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
    </div>
  );

  if (error || !profile || blocked) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
      {blocked
        ? <><ShieldBan size={48} className="text-slate-300" /><p className="text-slate-500 font-semibold">Utilisateur bloqué.</p></>
        : <><Mountain size={48} className="text-slate-300" /><p className="text-slate-500 font-semibold">Profil introuvable.</p></>
      }
      <button onClick={() => router.back()} className="flex items-center gap-2 text-primary font-bold text-sm hover:underline">
        <ArrowLeft size={14} /> Retour
      </button>
    </div>
  );

  const sc = profile.sustainability_score !== null ? scoreColor(profile.sustainability_score) : null;
  const places = profile.publications.filter((p) => p.type === "place");
  const experiences = profile.publications.filter((p) => p.type === "experience");
  const visiblePubs = tab === "places" ? places : tab === "experiences" ? experiences : profile.publications;

  return (
    <>
    <div className="min-h-screen bg-slate-100 pb-16">

      {/* ── Nav ── */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 py-3.5 flex items-center justify-between max-w-full">
        <button onClick={() => router.back()}
          className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors shrink-0">
          <ArrowLeft size={18} className="text-slate-600" />
        </button>
        <span className="font-extrabold text-slate-900 text-base">{profile.full_name}</span>
        <div className="w-9 h-9" />
      </div>

      {/* ── Cover ── */}
      <div className="relative h-64 md:h-80 bg-gradient-to-br from-emerald-300 via-teal-200 to-cyan-200 overflow-hidden">
        {profile.cover_photo && (
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${profile.cover_photo}')` }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
      </div>

      {/* ── Main layout ── */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 -mt-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── LEFT: Profile card ── */}
          <div className="lg:col-span-1 space-y-4">

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100">
              {/* Avatar */}
              <div className="flex flex-col items-center pt-2 px-6 pb-6">
                <div className="w-28 h-28 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-gradient-to-br from-primary/20 to-emerald-100 flex items-center justify-center mb-4">
                  {profile.photo
                    ? <img src={profile.photo} alt={profile.full_name} className="w-full h-full object-cover" />
                    : <span className="material-symbols-outlined text-primary" style={{ fontSize: 56 }}>person</span>
                  }
                </div>

                <h1 className="text-xl font-black text-slate-900 text-center leading-tight">{profile.full_name}</h1>
                <p className="text-sm font-semibold text-primary mt-1 text-center">
                  {scoreLabel(profile.sustainability_score)}
                </p>

                {profile.bio && (
                  <p className="text-sm text-slate-500 leading-relaxed mt-3 text-center">{profile.bio}</p>
                )}

                {/* Meta */}
                <div className="flex flex-wrap justify-center gap-3 mt-4">
                  {profile.country && (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                      <Globe size={13} className="text-primary" /> {COUNTRY_LABELS[profile.country] ?? profile.country}
                    </span>
                  )}
                  {profile.publications.length > 0 && (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                      <Leaf size={13} className="text-primary" />
                      {profile.publications.length} publication{profile.publications.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                {/* Types */}
                {(profile.traveler_types?.length ?? 0) > 0 && (
                  <div className="flex flex-wrap justify-center gap-1.5 mt-3">
                    {profile.traveler_types!.map((t) => (
                      <span key={t} className="px-3 py-1 bg-primary/10 text-primary text-[11px] font-bold rounded-full">
                        {TRAVELER_TYPE_LABELS[t] ?? t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Friend button + menu 3 points */}
                <div className="mt-5 w-full flex items-center gap-2">
                  {viewerRole === "eco_traveler" && (
                    <div className="flex-1">
                      {profile.friend_status === "none" && (
                        <button onClick={sendRequest} disabled={actionLoading}
                          className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-slate-900 font-extrabold rounded-2xl text-sm hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-60">
                          <UserPlus size={15} /> Ajouter en ami
                        </button>
                      )}
                      {profile.friend_status === "pending_sent" && (
                        <div className="w-full flex items-center justify-center gap-2 py-3 border-2 border-slate-200 text-slate-500 font-bold rounded-2xl text-sm">
                          <Clock size={14} /> Demande envoyée
                        </div>
                      )}
                      {profile.friend_status === "pending_received" && (
                        <div className="flex gap-2">
                          <button onClick={acceptRequest} disabled={actionLoading}
                            className="flex-1 flex items-center justify-center gap-1.5 py-3 bg-primary text-slate-900 font-extrabold rounded-2xl text-sm hover:bg-primary/90 transition-all">
                            <Check size={14} /> Accepter
                          </button>
                          <button onClick={cancelRequest} disabled={actionLoading}
                            className="w-12 flex items-center justify-center border-2 border-slate-200 text-slate-500 rounded-2xl hover:border-red-300 hover:text-red-500 transition-all">
                            <X size={14} />
                          </button>
                        </div>
                      )}
                      {profile.friend_status === "accepted" && (
                        <button onClick={handleContact} 
                          className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-slate-900 font-extrabold rounded-2xl text-sm hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-60">
                          <Send size={15} /> Contacter
                        </button>
                      )}
                    </div>
                  )}
                  {(viewerRole === "guide" || viewerRole === "project_owner") && isFollower && (
                    <button onClick={async () => {
                      try {
                        await apiFetch(`/follows/follower/${userId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
                        setIsFollower(false);
                      } catch {}
                    }}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-50 border-2 border-red-200 text-red-600 font-extrabold rounded-2xl text-sm hover:bg-red-600 hover:text-white active:scale-95 transition-all">
                      <UserMinus size={15} /> Supprimer
                    </button>
                  )}
                  <div className="relative" ref={menuRef}>
                    <button onClick={() => setMenuOpen((v) => !v)}
                      className="w-11 h-11 rounded-2xl border-2 border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-500 transition-colors shrink-0">
                      <MoreVertical size={17} />
                    </button>
                    {menuOpen && (
                      <div className="absolute right-0 w-52 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 py-1" style={{ top: "3rem" }}>
                        {viewerRole === "eco_traveler" && profile.friend_status === "accepted" && (
                          <button onClick={() => { setMenuOpen(false); setRemoveConfirm(true); }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                            <UserMinus size={15} className="text-slate-400" /> Retirer l'ami
                          </button>
                        )}
                        <button onClick={() => { setMenuOpen(false); setBlockConfirm(true); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-orange-600 hover:bg-orange-50 transition-colors">
                          <ShieldBan size={15} /> Bloquer
                        </button>
                        <div className="border-t border-slate-100 my-1" />
                        <button onClick={() => { setMenuOpen(false); setReportOpen(true); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors">
                          <Flag size={15} /> Signaler
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sustainability score */}
            {profile.sustainability_score !== null && sc && (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">🌿 Score de durabilité</p>
                <div className="flex items-end gap-2 mb-2">
                  <span className={`text-4xl font-black ${sc.text}`}>{profile.sustainability_score}</span>
                  <span className="text-slate-400 font-bold text-base mb-1">/100</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mb-2">
                  <div className={`h-full ${sc.bar} rounded-full transition-all duration-700`} style={{ width: `${profile.sustainability_score}%` }} />
                </div>
                <span className={`text-xs font-bold ${sc.text}`}>{scoreLabel(profile.sustainability_score)}</span>
              </div>
            )}

            {/* Amis */}
            {theirFriends.length > 0 && (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                    👥 Amis de {profile.full_name.split(" ")[0]}
                  </p>
                  <span className="text-[11px] font-black text-slate-400">{theirFriends.length}</span>
                </div>
                <div className="space-y-2.5">
                  {theirFriends.slice(0, 3).map((f) => {
                    const isCommon = myFriendIds.has(f.user_id) && f.user_id !== viewerId;
                    const dest = f.user_id === viewerId ? "/profile/ecovoyageur" : `/profile/ecovoyageur/${f.user_id}`;
                    return (
                      <button key={f.user_id} onClick={() => router.push(dest)}
                        className="w-full flex items-center gap-3 hover:bg-slate-50 rounded-xl px-2 py-1.5 transition-colors text-left">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center shrink-0">
                          {f.photo ? <img src={f.photo} alt={f.full_name ?? ""} className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-slate-400 text-base">person</span>}
                        </div>
                        <p className="text-sm font-extrabold text-slate-800 truncate flex-1">{f.full_name ?? "—"}</p>
                        {isCommon && (
                          <span className="shrink-0 text-[10px] font-black px-2 py-0.5 rounded-full bg-primary/10 text-primary">En commun</span>
                        )}
                      </button>
                    );
                  })}
                </div>
                {theirFriends.length > 3 && (
                  <button onClick={() => setShowFriendsModal(true)}
                    className="mt-3 w-full text-xs font-bold text-primary hover:underline text-center">
                    Voir tout ({theirFriends.length})
                  </button>
                )}
              </div>
            )}

          </div>

          {/* ── RIGHT: Publications ── */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="text-base font-extrabold text-slate-800">Publications</h2>
                  {profile.publications.length > 0 && (
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      {profile.publications.length} publication{profile.publications.length > 1 ? "s" : ""}
                    </p>
                  )}
                </div>
                {profile.publications.length > 0 && (
                  <div className="flex bg-slate-100 p-1 rounded-xl gap-1 shrink-0">
                    {[
                      { key: "all",         label: `Tout (${profile.publications.length})` },
                      { key: "places",      label: `Lieux (${places.length})` },
                      { key: "experiences", label: `Expériences (${experiences.length})` },
                    ].map(({ key, label }) => (
                      <button key={key} onClick={() => setTab(key as typeof tab)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${tab === key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {profile.publications.length === 0 ? (
                <div className="py-16 text-center">
                  <Leaf size={40} className="text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-400 font-semibold text-sm">Aucune publication pour l'instant.</p>
                </div>
              ) : visiblePubs.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-slate-400 font-medium text-sm">Aucune publication dans cette catégorie.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {visiblePubs.map((pub) => {
                    const isHighlighted = pub.id === highlightedPubId;
                    return (
                      <div
                        key={pub.id}
                        ref={(el) => { pubRefs.current[pub.id] = el; }}
                        className={`rounded-2xl transition-all duration-700 ${isHighlighted ? "ring-2 ring-primary ring-offset-2 bg-primary/5" : ""}`}
                      >
                        <div onClick={() => { setSelectedPub(pub); setSliderIdx(0); }} className="cursor-pointer">
                          <PubRow pub={pub} />
                        </div>
                        <PubInteractions
                          pubId={pub.id}
                          token={token}
                          viewerId={viewerId}
                          shareUrl={typeof window !== "undefined" ? `${window.location.origin}/profile/ecovoyageur/${userId}?pub=${pub.id}` : `/profile/ecovoyageur/${userId}?pub=${pub.id}`}
                          pubTitle={pub.title}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ── Confirm remove ── */}
      {removeConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setRemoveConfirm(false)}>
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <UserMinus size={22} className="text-slate-500" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 text-center mb-1">Supprimer l'ami ?</h3>
            <p className="text-sm text-slate-500 text-center mb-6">{profile.full_name} sera retiré de votre liste d'amis.</p>
            <div className="flex gap-3">
              <button onClick={() => setRemoveConfirm(false)} className="flex-1 py-3 border-2 border-slate-200 text-slate-600 font-bold rounded-2xl text-sm hover:bg-slate-50">Annuler</button>
              <button onClick={removeFriend} disabled={actionLoading} className="flex-1 py-3 bg-slate-800 text-white font-extrabold rounded-2xl text-sm hover:bg-slate-900 disabled:opacity-60">
                {actionLoading ? "…" : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm block ── */}
      {blockConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setBlockConfirm(false)}>
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-4">
              <ShieldBan size={22} className="text-orange-500" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 text-center mb-1">Bloquer {profile.full_name} ?</h3>
            <p className="text-sm text-slate-500 text-center mb-6">Il ne pourra plus voir votre profil ni vous contacter.</p>
            <div className="flex gap-3">
              <button onClick={() => setBlockConfirm(false)} className="flex-1 py-3 border-2 border-slate-200 text-slate-600 font-bold rounded-2xl text-sm hover:bg-slate-50">Annuler</button>
              <button onClick={blockUser} disabled={actionLoading} className="flex-1 py-3 bg-orange-500 text-white font-extrabold rounded-2xl text-sm hover:bg-orange-600 disabled:opacity-60">
                {actionLoading ? "…" : "Bloquer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Report modal ── */}
      {reportOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => { if (!reportSent) setReportOpen(false); }}>
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {reportSent ? (
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                  <Check size={24} className="text-emerald-500" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 mb-2">Signalement envoyé</h3>
                <p className="text-sm text-slate-500 mb-5">Notre équipe examinera ce profil dans les plus brefs délais.</p>
                <button onClick={() => { setReportOpen(false); setReportSent(false); setReportReason(""); }}
                  className="w-full py-3 bg-primary text-slate-900 font-extrabold rounded-2xl text-sm hover:bg-primary/90">
                  Fermer
                </button>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
                  <Flag size={22} className="text-red-500" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 text-center mb-1">Signaler ce profil</h3>
                <p className="text-sm text-slate-500 text-center mb-5">Choisissez un motif de signalement</p>
                <div className="space-y-2 mb-5">
                  {REPORT_REASONS.map((r) => (
                    <button key={r} onClick={() => setReportReason(r)}
                      className={`w-full text-left px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${reportReason === r ? "border-red-400 bg-red-50 text-red-700" : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"}`}>
                      {r}
                    </button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setReportOpen(false)} className="flex-1 py-3 border-2 border-slate-200 text-slate-600 font-bold rounded-2xl text-sm hover:bg-slate-50">Annuler</button>
                  <button onClick={reportUser} disabled={!reportReason || actionLoading}
                    className="flex-1 py-3 bg-red-500 text-white font-extrabold rounded-2xl text-sm hover:bg-red-600 disabled:opacity-50">
                    {actionLoading ? "Envoi…" : "Signaler"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Publication detail modal ── */}
      {selectedPub && (() => {
        const isExp = selectedPub.type === "experience";
        const imgs = selectedPub.images?.filter((s) => s.startsWith("http")) ?? [];
        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedPub(null)}>
            <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}>

              {/* Image slider */}
              {imgs.length > 0 ? (
                <div className="relative h-64 shrink-0 overflow-hidden rounded-t-3xl bg-slate-900">
                  <div className="absolute inset-0 bg-cover bg-center transition-all duration-500"
                    style={{ backgroundImage: `url('${imgs[sliderIdx]}')` }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  {imgs.length > 1 && (
                    <>
                      <button onClick={() => setSliderIdx((i) => (i - 1 + imgs.length) % imgs.length)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70">
                        <ChevronLeft size={18} />
                      </button>
                      <button onClick={() => setSliderIdx((i) => (i + 1) % imgs.length)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70">
                        <ChevronRight size={18} />
                      </button>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {imgs.map((_, i) => (
                          <button key={i} onClick={() => setSliderIdx(i)}
                            className={`w-2 h-2 rounded-full transition-all ${i === sliderIdx ? "bg-white scale-125" : "bg-white/50"}`} />
                        ))}
                      </div>
                    </>
                  )}
                  <button onClick={() => setSelectedPub(null)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className={`relative h-28 shrink-0 rounded-t-3xl flex items-center justify-center ${isExp ? "bg-gradient-to-br from-teal-500 to-emerald-400" : "bg-gradient-to-br from-blue-500 to-cyan-400"}`}>
                  <span className="material-symbols-outlined text-white/40" style={{ fontSize: 56 }}>{isExp ? "hiking" : "location_on"}</span>
                  <button onClick={() => setSelectedPub(null)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/30 flex items-center justify-center text-white hover:bg-black/50">
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* Content */}
              <div className="px-6 py-5 space-y-4">
                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-xl ${isExp ? "bg-teal-50 text-teal-700 border border-teal-100" : "bg-blue-50 text-blue-700 border border-blue-100"}`}>
                  {isExp ? "Expérience" : "Lieu recommandé"}
                </span>
                <h2 className="text-xl font-extrabold text-slate-800 leading-snug">{selectedPub.title}</h2>

                {(selectedPub.place_name || selectedPub.region) && (
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-500">
                    <MapPin size={14} className="text-primary shrink-0" />
                    {[selectedPub.place_name, selectedPub.region].filter(Boolean).join(" — ")}
                  </div>
                )}

                <PubMap
                  lat={(selectedPub as any).latitude ?? null}
                  lng={(selectedPub as any).longitude ?? null}
                  address={isExp ? (selectedPub.region ?? "") : [selectedPub.place_name, selectedPub.region].filter(Boolean).join(", ")}
                />

                {selectedPub.description && (
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1.5">{isExp ? "Récit" : "Description"}</p>
                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{selectedPub.description}</p>
                  </div>
                )}

                <p className="text-[11px] text-slate-400 font-medium">
                  Publié le {formatDate(selectedPub.created_at)}
                </p>
              </div>
            </div>
          </div>
        );
      })()}

    </div>

      {/* Friends Modal */}
      {showFriendsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowFriendsModal(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
              <p className="text-sm font-extrabold text-slate-800">
                👥 Amis de {profile?.full_name?.split(" ")[0]}
                <span className="ml-2 text-slate-400 font-bold text-xs">({theirFriends.length})</span>
              </p>
              <button onClick={() => setShowFriendsModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="overflow-y-auto p-3 space-y-1">
              {theirFriends.map((f) => {
                const isCommon = myFriendIds.has(f.user_id) && f.user_id !== viewerId;
                const dest = f.user_id === viewerId ? "/profile/ecovoyageur" : `/profile/ecovoyageur/${f.user_id}`;
                return (
                  <button key={f.user_id} onClick={() => { setShowFriendsModal(false); router.push(dest); }}
                    className="w-full flex items-center gap-3 hover:bg-slate-50 rounded-xl px-3 py-2 transition-colors text-left">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center shrink-0">
                      {f.photo ? <img src={f.photo} alt={f.full_name ?? ""} className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-slate-400 text-base">person</span>}
                    </div>
                    <p className="text-sm font-extrabold text-slate-800 truncate flex-1">{f.full_name ?? "—"}</p>
                    {isCommon && (
                      <span className="shrink-0 text-[10px] font-black px-2 py-0.5 rounded-full bg-primary/10 text-primary">En commun</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
