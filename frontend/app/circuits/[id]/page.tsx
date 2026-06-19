"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import {
  ArrowLeft, Leaf, MapPin, Clock, Users, Calendar,
  Check, DollarSign, Info, Plus, Trash2, Edit, X, Share2, Copy,
} from "lucide-react";
import AppNavbar from "@/components/nav/AppNavbar";
import BackToDashboard from "@/components/nav/BackToDashboard";
import CircuitMap from "@/components/map/CircuitMap";
import ImageUploader from "@/components/ImageUploader";

const MapPicker = dynamic(() => import("@/components/map/MapPicker"), { ssr: false });

interface CircuitProgramItem {
  id: string;
  title: string;
  description: string | null;
  start_time: string | null;
  end_time: string | null;
  is_included: boolean;
  is_required: boolean;
}

interface CircuitDay {
  id: string;
  day_number: number;
  title: string;
  description: string | null;
  date: string | null;
  lat: number | null;
  lng: number | null;
  location_name: string | null;
  programItems?: CircuitProgramItem[];
}

interface CircuitOption {
  id: string;
  option_group: string | null;
  option_type: string;
  extra_price: number | null;
  is_included: boolean;
  is_required: boolean;
  status: string;
}

interface CircuitDetails {
  id: string;
  author_id: string;
  title: string;
  description: string | null;
  base_price: number | null;
  start_date: string | null;
  end_date: string | null;
  duration_days: number | null;
  duration_nights: number | null;
  region: string | null;
  max_participants: number | null;
  booking_deadline_days: number | null;
  confirmation_mode: string | null;
  inclusions: string | null;
  exclusions: string | null;
  lat: number | null;
  lng: number | null;
  address: string | null;
  status: string;
  currency: string;
  images: string[] | null;
  days: CircuitDay[];
  options: CircuitOption[];
}

interface StoredUser {
  sub?: string;
  id?: string;
  role: string;
  full_name?: string;
}

export default function CircuitDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [circuit, setCircuit] = useState<CircuitDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<StoredUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);

  const [showEdit, setShowEdit] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editRegion, setEditRegion] = useState("");
  const [editDays, setEditDays] = useState("");
  const [editNights, setEditNights] = useState("");
  const [editMax, setEditMax] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [editLat, setEditLat] = useState<number | null>(null);
  const [editLng, setEditLng] = useState<number | null>(null);
  const [editAddress, setEditAddress] = useState("");
  const [editImages, setEditImages] = useState<string[]>([]);

  const [showAddDay, setShowAddDay] = useState(false);
  const [dayTitle, setDayTitle] = useState("");
  const [dayDesc, setDayDesc] = useState("");
  const [dayNum, setDayNum] = useState("");
  const [dayDate, setDayDate] = useState("");
  const [dayLat, setDayLat] = useState<number | null>(null);
  const [dayLng, setDayLng] = useState<number | null>(null);
  const [dayLocationName, setDayLocationName] = useState("");

  const [showAddOption, setShowAddOption] = useState(false);
  const [optType, setOptType] = useState("single_choice");
  const [optGroup, setOptGroup] = useState("");
  const [optPrice, setOptPrice] = useState("");
  const [optIncluded, setOptIncluded] = useState(false);
  const [optRequired, setOptRequired] = useState(false);

  const [showAddProgram, setShowAddProgram] = useState<string | null>(null);
  const [progTitle, setProgTitle] = useState("");
  const [progDesc, setProgDesc] = useState("");
  const [progStart, setProgStart] = useState("");
  const [progEnd, setProgEnd] = useState("");

  const [showReserve, setShowReserve] = useState(false);
  const [galleryIdx, setGalleryIdx] = useState(0);
  const [reserveParticipants, setReserveParticipants] = useState(1);
  const [reserveSubmitting, setReserveSubmitting] = useState(false);
  const [reserveError, setReserveError] = useState<string | null>(null);
  const [reserveSuccess, setReserveSuccess] = useState(false);

  const [myReservation, setMyReservation] = useState<any>(null);
  const [showModifyReservation, setShowModifyReservation] = useState(false);
  const [modifyParticipants, setModifyParticipants] = useState(1);
  const [modifySubmitting, setModifySubmitting] = useState(false);

  const loadCircuit = () => {
    apiFetch<CircuitDetails>(`/circuits/${id}`)
      .then(setCircuit)
      .catch(() => setCircuit(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const t = localStorage.getItem("access_token");
    if (stored) setUser(JSON.parse(stored));
    if (t) setToken(t);
    loadCircuit();
  }, [id]);

  useEffect(() => {
    if (!token || !id) return;
    apiFetch<any[]>(`/circuits/reservations/incoming`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((reservations) => {
        const mine = reservations.find((r: any) => r.circuit_id === id && r.user_id === (user?.sub ?? user?.id) && r.status !== "cancelled");
        if (mine) {
          setMyReservation(mine);
          setModifyParticipants(mine.participants_count || 1);
        }
      })
      .catch(() => {});
  }, [token, id, user]);

  const userId = user?.sub ?? user?.id;
  const isAuthor = !!circuit && !!userId && circuit.author_id === userId;
  const canReserve = user?.role === "eco_traveler";
  const effectivePrice = circuit?.base_price ?? 0;
  const availableOptions = circuit?.options?.filter((o) => o.status === "active" && !o.is_included) ?? [];

  function handleOptionToggle(optionId: string, optionType: string) {
    if (optionType === "multiple_choice") {
      setSelectedOptionIds((prev) =>
        prev.includes(optionId)
          ? prev.filter((id) => id !== optionId)
          : [...prev, optionId]
      );
    } else {
      setSelectedOptionIds((prev) =>
        prev.includes(optionId) ? [] : [optionId]
      );
    }
  }

  async function handleReserve() {
    if (!token) return;
    setReserveSubmitting(true);
    setReserveError(null);
    try {
      const selectedOpts = circuit?.options
        ?.filter((o) => selectedOptionIds.includes(o.id) && o.status === "active")
        .map((o) => ({
          circuit_option_id: o.id,
          quantity: 1,
          unit_price: Number(o.extra_price) || 0,
        })) ?? [];

      const result = await apiFetch<any>(`/circuits/${id}/reserve`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          participants_count: reserveParticipants,
          base_total: effectivePrice * reserveParticipants,
          options: selectedOpts.length > 0 ? selectedOpts : undefined,
        }),
      });
      setMyReservation(result);
      setReserveSuccess(true);
      setShowReserve(false);
    } catch (err: any) {
      setReserveError(err.message || "Erreur lors de la réservation");
    } finally {
      setReserveSubmitting(false);
    }
  }

  async function handleModifyReservation() {
    if (!token || !myReservation) return;
    setModifySubmitting(true);
    try {
      await apiFetch(`/circuits/reservations/${myReservation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          participants_count: modifyParticipants,
          base_total: effectivePrice * modifyParticipants,
        }),
      });
      setMyReservation((prev: any) => ({ ...prev, participants_count: modifyParticipants, final_total: effectivePrice * modifyParticipants }));
      setShowModifyReservation(false);
    } catch (err: any) {
      alert(err.message || "Erreur lors de la modification");
    } finally {
      setModifySubmitting(false);
    }
  }

  async function handleCancelReservation() {
    if (!token || !myReservation) return;
    if (!confirm("Annuler cette réservation ?")) return;
    try {
      await apiFetch(`/circuits/reservations/${myReservation.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyReservation(null);
    } catch (err: any) {
      alert(err.message || "Erreur lors de l'annulation");
    }
  }

  const sortedDays = [...(circuit?.days ?? [])].sort((a, b) => a.day_number - b.day_number);

  async function handleEdit() {
    if (!token) return;
    const body: Record<string, any> = {};
    if (editTitle) body.title = editTitle;
    if (editDesc) body.description = editDesc;
    if (editPrice) body.base_price = Number(editPrice);
    if (editRegion) body.region = editRegion;
    if (editDays) body.duration_days = Number(editDays);
    if (editNights) body.duration_nights = Number(editNights);
    if (editMax) body.max_participants = Number(editMax);
    if (editStartDate) body.start_date = editStartDate;
    if (editEndDate) body.end_date = editEndDate;
    if (editLat !== null) body.lat = editLat;
    if (editLng !== null) body.lng = editLng;
    if (editAddress) body.address = editAddress;
    if (editImages.length > 0) body.images = editImages;
    try {
      await apiFetch(`/circuits/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      setShowEdit(false);
      loadCircuit();
    } catch { alert("Erreur lors de la modification"); }
  }

  async function handleDelete() {
    if (!token || !confirm("Supprimer ce circuit définitivement ?")) return;
    try {
      await apiFetch(`/circuits/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      router.push("/dashboard");
    } catch { alert("Erreur lors de la suppression"); }
  }

  async function handleAddDay() {
    if (!token || !dayTitle || !dayNum) return;
    try {
      await apiFetch(`/circuits/${id}/days`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          day_number: Number(dayNum),
          title: dayTitle,
          description: dayDesc || undefined,
          date: dayDate || undefined,
          lat: dayLat ?? undefined,
          lng: dayLng ?? undefined,
          location_name: dayLocationName || undefined,
        }),
      });
      setShowAddDay(false);
      setDayTitle(""); setDayDesc(""); setDayNum(""); setDayDate(""); setDayLat(null); setDayLng(null); setDayLocationName("");
      loadCircuit();
    } catch { alert("Erreur lors de l'ajout du jour"); }
  }

  async function handleAddOption() {
    if (!token) return;
    try {
      await apiFetch(`/circuits/${id}/options`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          option_type: optType,
          option_group: optGroup || undefined,
          extra_price: optPrice ? Number(optPrice) : undefined,
          is_included: optIncluded,
          is_required: optRequired,
        }),
      });
      setShowAddOption(false);
      setOptType("single_choice"); setOptGroup(""); setOptPrice(""); setOptIncluded(false); setOptRequired(false);
      loadCircuit();
    } catch { alert("Erreur lors de l'ajout de l'option"); }
  }

  async function handleAddProgram(dayId: string) {
    if (!token || !progTitle) return;
    try {
      await apiFetch(`/circuits/${id}/days/${dayId}/program`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: progTitle,
          description: progDesc || undefined,
          start_time: progStart || undefined,
          end_time: progEnd || undefined,
        }),
      });
      setShowAddProgram(null);
      setProgTitle(""); setProgDesc(""); setProgStart(""); setProgEnd("");
      loadCircuit();
    } catch { alert("Erreur lors de l'ajout du programme"); }
  }

  function handleShare() {
    const url = `${window.location.origin}/circuits/${id}`;
    const text = `Découvrez ce circuit: ${circuit?.title} ${url}`;
    router.push(`/messagerie?share=${encodeURIComponent(text)}`);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!circuit) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center">
        <p className="text-slate-500">Circuit introuvable</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 pb-12">
      <AppNavbar title={circuit.title} />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-4">
          <BackToDashboard />
          <button
            onClick={() => router.push("/circuits")}
            className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ArrowLeft size={16} /> Tous les circuits
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {circuit.images && circuit.images.length > 0 ? (
            <div className="relative h-64 bg-slate-900">
              <img src={circuit.images[galleryIdx]} alt={circuit.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              {circuit.images.length > 1 && (
                <>
                  <button onClick={() => setGalleryIdx((i) => (i - 1 + circuit.images!.length) % circuit.images!.length)} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70"><ArrowLeft size={18} /></button>
                  <button onClick={() => setGalleryIdx((i) => (i + 1) % circuit.images!.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70"><ArrowLeft size={18} className="rotate-180" /></button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {circuit.images.map((_, i) => (
                      <button key={i} onClick={() => setGalleryIdx(i)} className={`w-2 h-2 rounded-full transition-all ${i === galleryIdx ? "bg-white scale-125" : "bg-white/50"}`} />
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="h-48 bg-gradient-to-br from-emerald-100 to-teal-200 flex items-center justify-center">
              <Leaf size={48} className="text-emerald-400 opacity-50" />
            </div>
          )}

          <div className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <h1 className="text-2xl font-bold text-slate-800">{circuit.title}</h1>
              {circuit.base_price !== null && (
                <div className="text-primary font-bold text-2xl flex items-center gap-1">
                  <DollarSign size={22} />
                  {Number(effectivePrice).toLocaleString()} <span className="text-sm font-normal text-slate-400">{circuit.currency}</span>
                </div>
              )}
            </div>

            {isAuthor && (
              <div className="flex flex-wrap gap-2 mb-4">
                <button onClick={() => { setEditTitle(circuit.title); setEditDesc(circuit.description ?? ""); setEditPrice(String(circuit.base_price ?? "")); setEditRegion(circuit.region ?? ""); setEditDays(String(circuit.duration_days ?? "")); setEditNights(String(circuit.duration_nights ?? "")); setEditMax(String(circuit.max_participants ?? "")); setEditStartDate(circuit.start_date?.slice(0, 10) ?? ""); setEditEndDate(circuit.end_date?.slice(0, 10) ?? ""); setEditLat(circuit.lat ? Number(circuit.lat) : null); setEditLng(circuit.lng ? Number(circuit.lng) : null); setEditAddress(circuit.address ?? ""); setEditImages(circuit.images ?? []); setShowEdit(true); }} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100">
                  <Edit size={14} /> Modifier
                </button>
                <button onClick={() => setShowAddDay(true)} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-emerald-50 text-primary border border-emerald-200 hover:bg-emerald-100">
                  <Plus size={14} /> Ajouter un jour
                </button>
                <button onClick={handleDelete} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100">
                  <Trash2 size={14} /> Supprimer
                </button>
              </div>
            )}

            <div className="flex flex-wrap gap-2 mb-4">
              <button onClick={handleShare} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100">
                <Share2 size={14} /> Partager
              </button>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-slate-500 mb-4">
              {circuit.region && <span className="flex items-center gap-1"><MapPin size={14} /> {circuit.region}</span>}
              {circuit.duration_days && (
                <span className="flex items-center gap-1">
                  <Clock size={14} /> {circuit.duration_days} jour{circuit.duration_days > 1 ? "s" : ""}
                  {circuit.duration_nights ? ` / ${circuit.duration_nights} nuit${circuit.duration_nights > 1 ? "s" : ""}` : ""}
                </span>
              )}
              {circuit.max_participants && (
                <span className="flex items-center gap-1">
                  <Users size={14} /> Max {circuit.max_participants} pers.
                </span>
              )}
              {circuit.confirmation_mode === "automatic" ? (
                <span className="inline-flex items-center gap-1 text-xs text-primary bg-emerald-50 rounded-full px-2 py-0.5">
                  <Check size={12} /> Confirmation instantanée
                </span>
              ) : circuit.confirmation_mode === "manual" ? (
                <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-50 rounded-full px-2 py-0.5">
                  <Info size={12} /> Sur demande
                </span>
              ) : null}
            </div>

            {circuit.description && (
              <p className="text-slate-600 leading-relaxed mb-4 whitespace-pre-line">{circuit.description}</p>
            )}

            {circuit.inclusions && (
              <div className="bg-emerald-50 rounded-xl p-3 mb-4 text-sm">
                <span className="font-medium text-emerald-600">Inclus :</span>
                <p className="text-primary mt-1 whitespace-pre-line">{circuit.inclusions}</p>
              </div>
            )}

            {circuit.exclusions && (
              <div className="bg-amber-50 rounded-xl p-3 mb-4 text-sm">
                <span className="font-medium text-amber-700">Non inclus :</span>
                <p className="text-amber-600 mt-1 whitespace-pre-line">{circuit.exclusions}</p>
              </div>
            )}

            {(circuit.lat || sortedDays.some((d) => d.lat)) && (
              <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <MapPin size={20} className="text-primary" /> Carte de l&apos;itinéraire
                </h2>
                <CircuitMap
                  circuitLat={circuit.lat ? Number(circuit.lat) : null}
                  circuitLng={circuit.lng ? Number(circuit.lng) : null}
                  days={sortedDays.map((d) => ({
                    day_number: d.day_number,
                    title: d.title,
                    lat: d.lat ? Number(d.lat) : null,
                    lng: d.lng ? Number(d.lng) : null,
                    location_name: d.location_name,
                  }))}
                />
              </div>
            )}

            {sortedDays.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <Calendar size={20} className="text-primary" /> Itinéraire
                </h2>
                <div className="space-y-3">
                  {sortedDays.map((day) => (
                    <div key={day.id} className="border border-slate-100 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-primary">{day.day_number}</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-800">{day.title}</h3>
                          {day.description && (
                            <p className="text-sm text-slate-500 mt-1">{day.description}</p>
                          )}
                          {day.programItems && day.programItems.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {day.programItems.map((item) => (
                                <div key={item.id} className="flex items-start gap-2 text-sm text-slate-500">
                                  {item.start_time && (
                                    <span className="text-xs font-medium text-primary bg-emerald-50 rounded px-1.5 py-0.5 shrink-0">
                                      {item.start_time}
                                    </span>
                                  )}
                                  <span>{item.title}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          {isAuthor && (
                            <button
                              onClick={() => { setShowAddProgram(day.id); setProgTitle(""); setProgDesc(""); setProgStart(""); setProgEnd(""); }}
                              className="mt-2 text-xs text-primary hover:text-primary flex items-center gap-1"
                            >
                              <Plus size={12} /> Ajouter une activité
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {availableOptions.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-800 mb-3">Options disponibles</h2>
                <div className="space-y-2">
                  {availableOptions.map((option) => (
                    <label
                      key={option.id}
                      className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 has-[:checked]:border-emerald-400 has-[:checked]:bg-emerald-50 transition-all"
                    >
                      <input
                        type={option.option_type === "multiple_choice" ? "checkbox" : "radio"}
                        name="circuit-option"
                        checked={selectedOptionIds.includes(option.id)}
                        onChange={() => handleOptionToggle(option.id, option.option_type)}
                        className="accent-primary"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm text-slate-800">
                            {option.option_group ?? "Option"}
                            {option.is_required && <span className="ml-1 text-xs text-amber-500">(Requis)</span>}
                          </span>
                          {option.extra_price !== null && option.extra_price > 0 && (
                            <span className="text-sm font-semibold text-primary">
                              +{Number(option.extra_price).toLocaleString()} {circuit.currency}
                            </span>
                          )}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {!user && !reserveSuccess && (
              <button
                onClick={() => router.push(`/auth/login?redirect=/circuits/${id}`)}
                className="w-full py-3 rounded-xl bg-primary text-white font-semibold hover:bg-emerald-600 flex items-center justify-center gap-2 transition-colors"
              >
                <Check size={18} /> Réserver ce circuit
              </button>
            )}

            {canReserve && myReservation && !reserveSuccess && (
              <div className="space-y-2">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <p className="text-emerald-700 font-semibold text-sm">Déjà réservé</p>
                  <p className="text-emerald-600 text-xs mt-1">
                    {myReservation.participants_count} participant{myReservation.participants_count > 1 ? "s" : ""} &mdash; {Number(myReservation.final_total).toLocaleString()} {circuit?.currency || "TND"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 capitalize">Statut : {myReservation.status}</p>
                </div>
                {myReservation.status === "pending" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowModifyReservation(true)}
                      className="flex-1 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-emerald-600 transition-colors"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={handleCancelReservation}
                      className="py-2.5 px-4 rounded-xl bg-red-50 text-red-600 font-semibold text-sm hover:bg-red-100 transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                )}
              </div>
            )}

            {canReserve && !myReservation && !reserveSuccess && (
              <button
                onClick={() => setShowReserve(true)}
                className="w-full py-3 rounded-xl bg-primary text-white font-semibold hover:bg-emerald-600 flex items-center justify-center gap-2 transition-colors"
              >
                <Check size={18} /> Réserver ce circuit
              </button>
            )}
            {reserveSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                <p className="text-emerald-600 font-semibold">Réservation confirmée !</p>
                <p className="text-primary text-sm mt-1">Vous recevrez une notification de confirmation.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Modal Édition ─────────────────────────────── */}
      {showEdit && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setShowEdit(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">Modifier le circuit</h2>
              <button onClick={() => setShowEdit(false)}><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-3">
              <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Titre" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
              <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} placeholder="Description" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" rows={3} />
              <div className="grid grid-cols-2 gap-3">
                <input value={editPrice} onChange={(e) => setEditPrice(e.target.value)} placeholder="Prix" type="number" min={0} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
                <input value={editRegion} onChange={(e) => setEditRegion(e.target.value)} placeholder="Région" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
                <input value={editDays} onChange={(e) => setEditDays(e.target.value)} placeholder="Jours" type="number" min={1} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
                <input value={editNights} onChange={(e) => setEditNights(e.target.value)} placeholder="Nuits" type="number" min={0} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
                <input value={editMax} onChange={(e) => setEditMax(e.target.value)} placeholder="Max participants" type="number" min={1} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Date de début</label>
                  <input type="date" value={editStartDate} onChange={(e) => setEditStartDate(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Date de fin</label>
                  <input type="date" value={editEndDate} onChange={(e) => setEditEndDate(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
                </div>
              </div>

              <ImageUploader images={editImages} onChange={setEditImages} maxImages={5} label="Images du circuit" />

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Localisation du circuit</label>
                {editAddress && <p className="text-xs text-slate-400 mb-1 truncate">{editAddress}</p>}
                <MapPicker
                  lat={editLat}
                  lng={editLng}
                  onPick={(lat, lng, address) => { setEditLat(lat); setEditLng(lng); setEditAddress(address); }}
                />
              </div>

              <button onClick={handleEdit} className="w-full py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-emerald-600">
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal Ajouter Jour ────────────────────────── */}
      {showAddDay && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setShowAddDay(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">Ajouter un jour</h2>
              <button onClick={() => setShowAddDay(false)}><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-3">
              <input value={dayNum} onChange={(e) => setDayNum(e.target.value)} placeholder="Numéro du jour (ex: 1)" type="number" min={1} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
              <input value={dayTitle} onChange={(e) => setDayTitle(e.target.value)} placeholder="Titre (ex: Arrivée)" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Date (optionnel)</label>
                <input type="date" value={dayDate} onChange={(e) => setDayDate(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
              </div>
              <textarea value={dayDesc} onChange={(e) => setDayDesc(e.target.value)} placeholder="Description" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" rows={2} />
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Lieu de la journée (optionnel)</label>
                <MapPicker
                  lat={dayLat}
                  lng={dayLng}
                  onPick={(lat, lng, name) => { setDayLat(lat); setDayLng(lng); setDayLocationName(name); }}
                />
              </div>
              <button onClick={handleAddDay} disabled={!dayTitle || !dayNum} className="w-full py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-emerald-600 disabled:opacity-50">
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal Ajouter Activité ────────────────────── */}
      {showAddProgram && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setShowAddProgram(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">Ajouter une activité</h2>
              <button onClick={() => setShowAddProgram(null)}><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-3">
              <input value={progTitle} onChange={(e) => setProgTitle(e.target.value)} placeholder="Titre (ex: Randonnée)" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
              <textarea value={progDesc} onChange={(e) => setProgDesc(e.target.value)} placeholder="Description" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" rows={2} />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Heure de début</label>
                  <input type="time" value={progStart} onChange={(e) => setProgStart(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Heure de fin</label>
                  <input type="time" value={progEnd} onChange={(e) => setProgEnd(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
                </div>
              </div>
              <button onClick={() => handleAddProgram(showAddProgram)} disabled={!progTitle} className="w-full py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-emerald-600 disabled:opacity-50">
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal Modifier Réservation ──────────────────── */}
      {showModifyReservation && myReservation && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setShowModifyReservation(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">Modifier la réservation</h2>
              <button onClick={() => setShowModifyReservation(false)}><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Nombre de participants</label>
                <input
                  type="number"
                  min={1}
                  max={circuit?.max_participants || 99}
                  value={modifyParticipants}
                  onChange={(e) => setModifyParticipants(Math.max(1, Number(e.target.value)))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm"
                />
              </div>
              <p className="text-sm text-slate-600">
                Total : <span className="font-bold text-primary">{Number(effectivePrice * modifyParticipants).toLocaleString()} {circuit?.currency || "TND"}</span>
              </p>
              <button
                onClick={handleModifyReservation}
                disabled={modifySubmitting}
                className="w-full py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-emerald-600 disabled:opacity-50"
              >
                {modifySubmitting ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal Réservation Circuit ──────────────────── */}
      {showReserve && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setShowReserve(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">Réserver ce circuit</h2>
              <button onClick={() => setShowReserve(false)}><X size={20} className="text-slate-400" /></button>
            </div>
            {reserveError && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-3 text-sm text-red-600">{reserveError}</div>
            )}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Nombre de participants</label>
                <input
                  type="number"
                  min={1}
                  max={circuit?.max_participants ?? 50}
                  value={reserveParticipants}
                  onChange={(e) => setReserveParticipants(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm"
                />
                {circuit?.max_participants && (
                  <p className="text-xs text-slate-400 mt-1">Max {circuit.max_participants} participants</p>
                )}
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Prix de base × {reserveParticipants}</span>
                  <span className="font-semibold text-primary">{(effectivePrice * reserveParticipants).toLocaleString()} {circuit?.currency}</span>
                </div>
                {selectedOptionIds.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-slate-200">
                    {circuit?.options
                      ?.filter((o) => selectedOptionIds.includes(o.id) && o.status === "active")
                      .map((o) => (
                        <div key={o.id} className="flex justify-between text-xs text-slate-500">
                          <span>{o.option_group ?? "Option"}</span>
                          <span>+{Number(o.extra_price ?? 0).toLocaleString()} {circuit?.currency}</span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
              <button
                onClick={handleReserve}
                disabled={reserveSubmitting}
                className="w-full py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-emerald-600 disabled:opacity-50"
              >
                {reserveSubmitting ? "Réservation en cours..." : "Confirmer la réservation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
