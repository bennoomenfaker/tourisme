"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { apiFetch } from "@/lib/api";
import ImageUploader from "@/components/ImageUploader";
import { Search, ArrowLeft, ArrowRight, X, Plus, Trash2, Check, MapPin, Clock, Calendar, DollarSign, Users, Info, Loader2 } from "lucide-react";

const PolylineDrawer = dynamic(() => import("@/components/map/PolylineDrawer"), { ssr: false, loading: () => <div className="h-[300px] bg-slate-100 animate-pulse rounded-xl" /> });
const MapPicker = dynamic(() => import("@/components/map/MapPicker"), { ssr: false, loading: () => <div className="h-[200px] bg-slate-100 animate-pulse rounded-xl" /> });

interface CircuitBuilderProps {
  token: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface DayForm {
  id: string; day_number: number; title: string; description: string; date: string;
  lat: number | null; lng: number | null; location_name: string;
  programItems: ProgramItemForm[];
}

interface ProgramItemForm {
  id: string; title: string; description: string; start_time: string; end_time: string;
  is_included: boolean; is_required: boolean; linked_offer_item_id: string | null;
  emoji: string; duration_minutes: string; distance_km: string; transport_mode: string;
  guide_id: string | null; guide_name: string;
}

interface OptionForm {
  id: string; option_group: string; option_type: string; extra_price: string;
  is_included: boolean; is_required: boolean;
}

interface MyOfferItem {
  id: string; name: string; item_type: string | null; offer_id: string; offer_title: string;
}

const EMOJIS_LIST = ["📍", "🚐", "🥾", "🛶", "🏛️", "🍽️", "🏕️", "🌅", "📸", "🎒", "🚲", "🐪", "🦅", "🌿", "🏊", "🧗", "🎶", "🎨", "🛒", "⛺", "🚗", "🐴", "🚌", "✈️", "🚣"];

const TRANSPORTS_LIST = [{ value: "", label: "Aucun" }, { value: "Van", label: "🚐 Van" }, { value: "À pied", label: "🥾 À pied" }, { value: "Vélo", label: "🚲 Vélo" }, { value: "Chameau", label: "🐪 Chameau" }, { value: "Voiture", label: "🚗 Voiture" }, { value: "Kayak", label: "🛶 Kayak" }, { value: "Cheval", label: "🐴 Cheval" }, { value: "Bus", label: "🚌 Bus" }, { value: "Vol", label: "✈️ Vol" }, { value: "Barque", label: "🚣 Barque" }];

const STEP_LABELS = ["", "Général", "Jours", "Activités", "Itinéraire", "Tarifs & Options", "Aperçu"];
const TOTAL_STEPS = 6;

const OPTION_GROUPS = [
  { value: "transport", label: "Transport" }, { value: "accommodation", label: "Hébergement" },
  { value: "equipment", label: "Équipement" }, { value: "activity", label: "Activité" }, { value: "food", label: "Repas" },
];

const TUNISIA_REGIONS = [
  "Tunis", "Ariana", "Ben Arous", "Manouba", "Nabeul", "Hammamet", "Sousse",
  "Monastir", "Mahdia", "Kairouan", "Bizerte", "Béja", "Jendouba", "Kef",
  "Siliana", "Zaghouan", "Sfax", "Gabès", "Médenine", "Tataouine", "Gafsa",
  "Tozeur", "Kébili", "Douz", "Djerba", "Zarzis", "Tabarka", "Aïn Draham",
];

function genId() { return Math.random().toString(36).substring(2, 10); }

function GuideSearchInline({ onSelect, dayDate, dayLat, dayLng, dayLocation }: {
  onSelect: (id: string, name: string) => void;
  dayDate?: string;
  dayLat?: number | null;
  dayLng?: number | null;
  dayLocation?: string;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  async function doSearch(q: string, immediate?: boolean) {
    if (!q.trim()) { setResults([]); setHasSearched(false); return; }
    setLoading(true); setHasSearched(true);
    try {
      const params = new URLSearchParams();
      params.set("q", q.trim());
      if (dayDate) params.set("date", dayDate);
      if (dayLat != null && dayLng != null) {
        params.set("lat", String(dayLat));
        params.set("lng", String(dayLng));
      }
      const res = await apiFetch<any[]>(`/guide/search?${params.toString()}`);
      setResults(res || []);
    } catch { setResults([]); }
    setLoading(false);
  }

  function handleChange(val: string) {
    setQuery(val);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => doSearch(val), 300);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") { e.preventDefault(); doSearch(query, true); }
  }

  return (
    <div className="flex items-center gap-1">
      <input value={query} onChange={(e) => handleChange(e.target.value)} onKeyDown={handleKeyDown}
        placeholder="Chercher un guide..." className="w-36 text-[11px] border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary" />
      <button type="button" onClick={() => doSearch(query, true)} className="p-1 text-primary hover:bg-primary/10 rounded-lg">
        <Search size={14} />
      </button>
      {loading && <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary" />}
      {!loading && hasSearched && results.length === 0 && (
        <span className="text-[10px] text-slate-400">Aucun guide disponible</span>
      )}
      {results.length > 0 && (
        <div className="absolute z-20 top-full left-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-100 p-1 w-72 max-h-64 overflow-y-auto">
          {results.map((g: any) => (
            <button key={g.user_id} type="button" onClick={() => { onSelect(g.user_id, g.full_name); setResults([]); setQuery(""); }}
              className="w-full flex items-start gap-2 px-2 py-2 rounded-lg hover:bg-primary/5 text-left border-b border-slate-50 last:border-0">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[10px] font-bold text-primary">{g.full_name?.charAt(0) || "G"}</span>
              </div>
              <div className="min-w-0">
                <div className="text-xs font-medium text-slate-700">{g.full_name}</div>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {g.zone && <span className="text-[10px] text-slate-400 bg-slate-50 rounded px-1">{g.zone}</span>}
                  {g.offerings?.[0]?.languages && (
                    <span className="text-[10px] text-slate-400">{g.offerings[0].languages}</span>
                  )}
                  {g.offerings?.[0]?.price != null && (
                    <span className="text-[10px] font-medium text-primary">{Number(g.offerings[0].price).toLocaleString()} TND</span>
                  )}
                  {g.offerings?.[0]?.radius_km && (
                    <span className="text-[10px] text-slate-400">Rayon {g.offerings[0].radius_km}km</span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

async function searchPlace(query: string): Promise<{ lat: number; lng: number; display_name: string } | null> {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&accept-language=fr`);
    const data = await res.json();
    if (!data.length) return null;
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), display_name: data[0].display_name };
  } catch { return null; }
}

function LocationSearch({ onPick, placeholder }: { onPick: (lat: number, lng: number, name: string) => void; placeholder?: string }) {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch() {
    if (!query.trim()) return;
    setSearching(true); setError("");
    const result = await searchPlace(query.trim());
    setSearching(false);
    if (!result) { setError("Lieu introuvable"); return; }
    onPick(result.lat, result.lng, result.display_name);
    setQuery(result.display_name.split(",")[0]);
  }

  return (
    <div className="flex gap-1.5">
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={placeholder || "Rechercher un lieu..."} className="flex-1 text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSearch(); } }} />
      <button type="button" onClick={handleSearch} disabled={searching} className="px-2.5 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-emerald-600 disabled:opacity-50 shrink-0">
        {searching ? <Loader2 size={12} className="animate-spin" /> : <Search size={12} />}
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export default function CircuitBuilderWizard({ token, onClose, onSuccess }: CircuitBuilderProps) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [region, setRegion] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [durationDays, setDurationDays] = useState("3");
  const [durationNights, setDurationNights] = useState("2");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [difficultyLevel, setDifficultyLevel] = useState("moderate");

  const [days, setDays] = useState<DayForm[]>([]);
  const [offerItems, setOfferItems] = useState<MyOfferItem[]>([]);
  const [waypoints, setWaypoints] = useState<[number, number][]>([]);
  const [circuitLat, setCircuitLat] = useState<number | null>(null);
  const [circuitLng, setCircuitLng] = useState<number | null>(null);
  const [circuitAddress, setCircuitAddress] = useState("");

  const [basePrice, setBasePrice] = useState("");
  const [currency, setCurrency] = useState("TND");
  const [maxParticipants, setMaxParticipants] = useState("");
  const [bookingDeadlineDays, setBookingDeadlineDays] = useState("");
  const [confirmationMode, setConfirmationMode] = useState("automatic");
  const [inclusions, setInclusions] = useState("");
  const [exclusions, setExclusions] = useState("");
  const [options, setOptions] = useState<OptionForm[]>([]);

  const [showDayMap, setShowDayMap] = useState<string | null>(null);
  const [daySearchDayId, setDaySearchDayId] = useState<string | null>(null);

  useEffect(() => {
    if (days.length === 0) {
      const nd = Math.max(1, Number(durationDays) || 1);
      setDays(Array.from({ length: nd }, (_, i) => ({
        id: genId(), day_number: i + 1, title: `Jour ${i + 1}`, description: "", date: "",
        lat: null, lng: null, location_name: "", programItems: [],
      })));
    }
  }, []);

  useEffect(() => {
    const nd = Number(durationDays) || 1;
    if (nd > days.length) {
      setDays((prev) => [...prev, ...Array.from({ length: nd - prev.length }, (_, i) => ({
        id: genId(), day_number: prev.length + i + 1, title: `Jour ${prev.length + i + 1}`, description: "", date: "",
        lat: null, lng: null, location_name: "", programItems: [],
      }))].map((d, idx) => ({ ...d, day_number: idx + 1 })));
    } else if (nd < days.length) {
      setDays((prev) => prev.slice(0, nd).map((d, idx) => ({ ...d, day_number: idx + 1 })));
    }
  }, [durationDays]);

  useEffect(() => {
    if (token) {
      apiFetch<MyOfferItem[]>("/offers/items/mine", { headers: { Authorization: `Bearer ${token}` } })
        .then((items) => setOfferItems(Array.isArray(items) ? items : []))
        .catch(() => {});
    }
  }, [token]);

  const sortedDays = [...days].sort((a, b) => a.day_number - b.day_number);
  const goNext = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  const goBack = () => setStep((s) => Math.max(s - 1, 1));

  function handleDurationDaysChange(val: string) {
    const n = parseInt(val) || 1;
    setDurationDays(String(n));
    setDurationNights(String(Math.max(0, n - 1)));
  }

  function addDay() {
    const n = days.length + 1;
    setDays((prev) => [...prev, { id: genId(), day_number: n, title: `Jour ${n}`, description: "", date: "", lat: null, lng: null, location_name: "", programItems: [] }]);
    setDurationDays(String(n));
    setDurationNights(String(n - 1));
  }

  function removeDay(dayId: string) {
    setDays((prev) => prev.filter((d) => d.id !== dayId).map((d, idx) => ({ ...d, day_number: idx + 1 })));
    setDurationDays(String(Math.max(1, days.length - 1)));
    setDurationNights(String(Math.max(0, days.length - 2)));
  }

  function updateDay(dayId: string, updates: Partial<DayForm>) {
    setDays((prev) => prev.map((d) => (d.id === dayId ? { ...d, ...updates } : d)));
  }

  function handleDayLocationPick(dayId: string, lat: number, lng: number, name: string) {
    updateDay(dayId, { lat, lng, location_name: name });
    setShowDayMap(null);
  }

  function addProgramItem(dayId: string) {
    setDays((prev) => prev.map((d) => d.id !== dayId ? d : { ...d, programItems: [...d.programItems, { id: genId(), title: "", description: "", start_time: "", end_time: "", is_included: true, is_required: false, linked_offer_item_id: null, emoji: "📍", duration_minutes: "", distance_km: "", transport_mode: "", guide_id: null, guide_name: "" }] }));
  }

  function removeProgramItem(dayId: string, itemId: string) {
    setDays((prev) => prev.map((d) => d.id !== dayId ? d : { ...d, programItems: d.programItems.filter((p) => p.id !== itemId) }));
  }

  function updateProgramItem(dayId: string, itemId: string, updates: Partial<ProgramItemForm>) {
    setDays((prev) => prev.map((d) => d.id !== dayId ? d : { ...d, programItems: d.programItems.map((p) => p.id === itemId ? { ...p, ...updates } : p) }));
  }

  function addOption() {
    setOptions((prev) => [...prev, { id: genId(), option_group: "activity", option_type: "single_choice", extra_price: "", is_included: false, is_required: false }]);
  }

  function removeOption(optId: string) {
    setOptions((prev) => prev.filter((o) => o.id !== optId));
  }

  function updateOption(optId: string, updates: Partial<OptionForm>) {
    setOptions((prev) => prev.map((o) => (o.id === optId ? { ...o, ...updates } : o)));
  }

  function getWaypointFromDays(): [number, number][] {
    const pts: [number, number][] = [];
    if (circuitLat !== null && circuitLng !== null) pts.push([circuitLat, circuitLng]);
    for (const d of sortedDays) { if (d.lat !== null && d.lng !== null) pts.push([d.lat, d.lng]); }
    return pts;
  }

  const handleSubmit = async () => {
    if (!title.trim()) { setError("Le titre est requis."); return; }
    setSubmitting(true); setError(null);
    try {
      const finalWaypoints = waypoints.length > 0 ? waypoints : getWaypointFromDays();
      const mainLat = finalWaypoints.length > 0 ? finalWaypoints[0][0] : circuitLat;
      const mainLng = finalWaypoints.length > 0 ? finalWaypoints[0][1] : circuitLng;
      const circuit = await apiFetch<any>("/circuits", {
        method: "POST", headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: title.trim(), description: description.trim() || undefined, region: region || undefined,
          duration_days: Number(durationDays) || undefined, duration_nights: Number(durationNights) || undefined,
          base_price: basePrice ? Number(basePrice) : undefined, currency,
          max_participants: maxParticipants ? Number(maxParticipants) : undefined,
          booking_deadline_days: bookingDeadlineDays ? Number(bookingDeadlineDays) : undefined,
          confirmation_mode: confirmationMode, difficulty_level: difficultyLevel,
          inclusions: inclusions || undefined, exclusions: exclusions || undefined,
          images: images.length > 0 ? images : undefined, lat: mainLat, lng: mainLng,
          address: circuitAddress || undefined, start_date: startDate || undefined, end_date: endDate || undefined,
          waypoints: finalWaypoints.length > 0 ? JSON.stringify(finalWaypoints) : undefined,
        }),
      });
      const circuitId = circuit.id;
      for (const day of sortedDays) {
        if (!day.title.trim()) continue;
        const createdDay = await apiFetch<any>(`/circuits/${circuitId}/days`, {
          method: "POST", headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify({ day_number: day.day_number, title: day.title.trim(), description: day.description || undefined, date: day.date || undefined, lat: day.lat ?? undefined, lng: day.lng ?? undefined, location_name: day.location_name || undefined }),
        });
        for (const prog of day.programItems) {
          if (!prog.title.trim()) continue;
          await apiFetch(`/circuits/${circuitId}/days/${createdDay.id}/program`, {
            method: "POST", headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify({ title: prog.title.trim(), description: prog.description || undefined, start_time: prog.start_time || undefined, end_time: prog.end_time || undefined, is_included: prog.is_included, is_required: prog.is_required, linked_offer_item_id: prog.linked_offer_item_id || undefined, emoji: prog.emoji || undefined, duration_minutes: prog.duration_minutes ? Number(prog.duration_minutes) : undefined, distance_km: prog.distance_km ? Number(prog.distance_km) : undefined, transport_mode: prog.transport_mode || undefined, guide_id: prog.guide_id || undefined }),
          });
        }
      }
      for (const opt of options) {
        await apiFetch(`/circuits/${circuitId}/options`, {
          method: "POST", headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify({ option_group: opt.option_group || undefined, option_type: opt.option_type, extra_price: opt.extra_price ? Number(opt.extra_price) : undefined, is_included: opt.is_included, is_required: opt.is_required }),
        });
      }
      onSuccess(); onClose();
    } catch (e: any) {
      setError(e.message || "Erreur lors de la création du circuit");
    } finally { setSubmitting(false); }
  };

  function renderStepIndicator() {
    return (
      <div className="flex items-center gap-1 mb-6">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((s) => (
          <div key={s} className="flex items-center gap-1 flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${s === step ? "bg-primary text-white scale-110 shadow-md shadow-emerald-200" : s < step ? "bg-emerald-100 text-primary" : "bg-slate-100 text-slate-400"}`}>
              {s < step ? <Check size={14} /> : s}
            </div>
            {s < TOTAL_STEPS && <div className={`flex-1 h-0.5 ${s < step ? "bg-emerald-300" : "bg-slate-200"}`} />}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[2vh] sm:pt-[4vh] px-2">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[94vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {step > 1 && <button onClick={goBack} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><ArrowLeft size={18} /></button>}
            <h2 className="text-lg font-bold text-slate-800">{STEP_LABELS[step]}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><X size={20} /></button>
        </div>
        <div className="px-6 py-4">
          {renderStepIndicator()}
          {error && <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-4 text-sm text-red-600">{error}</div>}

          {/* ─── Step 1: General Info ─────────────────────── */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Titre du circuit *</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Circuit découverte du Sud Tunisien" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Décrivez le circuit..." rows={3} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Région</label>
                  <select value={region} onChange={(e) => setRegion(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="">Sélectionner une région</option>
                    {TUNISIA_REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Devise</label>
                  <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="TND">TND (Dinar Tunisien)</option>
                    <option value="EUR">EUR (Euro)</option><option value="USD">USD (Dollar)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Durée (jours) *</label>
                  <input type="number" min={1} max={90} value={durationDays} onChange={(e) => handleDurationDaysChange(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Durée (nuits)</label>
                  <input type="number" min={0} max={89} value={durationNights} onChange={(e) => setDurationNights(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Date de début</label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Date de fin</label>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Niveau de difficulté</label>
                <select value={difficultyLevel} onChange={(e) => setDifficultyLevel(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="easy">🟢 Facile</option>
                  <option value="moderate">🟡 Modéré</option>
                  <option value="hard">🔴 Difficile</option>
                  <option value="expert">⚫ Expert</option>
                </select>
              </div>
              <div>
                <ImageUploader images={images} onChange={setImages} maxImages={10} label="Images du circuit" />
              </div>
            </div>
          )}

          {/* ─── Step 2: Days Timeline ─────────────────────── */}
          {step === 2 && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400 mb-3">Organisez les {sortedDays.length} jour{sortedDays.length > 1 ? "s" : ""} de votre circuit.</p>
              <div className="space-y-3">
                {sortedDays.map((day) => (
                  <div key={day.id} className="group border border-slate-200 rounded-xl p-4 hover:border-emerald-200 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-sm font-bold text-white">{day.day_number}</span>
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="grid grid-cols-3 gap-2">
                          <div className="col-span-2">
                            <input value={day.title} onChange={(e) => updateDay(day.id, { title: e.target.value })} placeholder={`Jour ${day.day_number}`} className="w-full text-sm font-medium text-slate-800 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary" />
                          </div>
                          <div>
                            <input type="date" value={day.date} onChange={(e) => updateDay(day.id, { date: e.target.value })} className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary" />
                          </div>
                        </div>
                        <textarea value={day.description} onChange={(e) => updateDay(day.id, { description: e.target.value })} placeholder="Description du jour..." rows={2} className="w-full text-sm text-slate-600 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary resize-none" />

                        {/* Location search + map */}
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1">Lieu du jour</label>
                          <LocationSearch
                            onPick={(lat, lng, name) => handleDayLocationPick(day.id, lat, lng, name)}
                            placeholder="Ex: Sidi Fathallah, Jabljloud, Tunis..."
                          />
                          {day.location_name && (
                            <div className="flex items-center justify-between mt-1">
                              <p className="text-xs text-slate-500 truncate"><MapPin size={10} className="inline mr-1" />{day.location_name}</p>
                              <button type="button" onClick={() => setShowDayMap(showDayMap === day.id ? null : day.id)} className="text-[10px] text-primary font-medium hover:underline">
                                {showDayMap === day.id ? "Masquer la carte" : "Choisir sur la carte"}
                              </button>
                            </div>
                          )}
                          {showDayMap === day.id && (
                            <div className="mt-2 overflow-hidden rounded-xl">
                              <MapPicker lat={day.lat} lng={day.lng} onPick={(lat, lng, addr) => handleDayLocationPick(day.id, lat, lng, addr)} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-end mt-2 gap-1">
                      <span className="text-xs text-slate-400">{day.programItems.length} activité{day.programItems.length !== 1 ? "s" : ""}</span>
                      {sortedDays.length > 1 && (
                        <button type="button" onClick={() => removeDay(day.id)} className="p-1 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <button type="button" onClick={addDay} className="w-full py-2.5 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 text-sm font-medium hover:border-primary hover:text-primary flex items-center justify-center gap-2">
                <Plus size={16} /> Ajouter un jour
              </button>
            </div>
          )}

          {/* ─── Step 3: Program Items ─────────────────────── */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">Ajoutez des activités pour chaque jour. Vous pouvez les lier à vos offres existantes.</p>
              {offerItems.length === 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
                  Vous n&apos;avez pas encore d&apos;activités. Créez d&apos;abord des offres dans le tableau de bord, ou ajoutez des activités libres ci-dessous.
                </div>
              )}
              {sortedDays.map((day) => (
                <div key={day.id} className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-sm text-slate-700 flex items-center gap-2">
                      <span className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs font-bold text-white">{day.day_number}</span>
                      {day.title}
                    </h3>
                    <span className="text-xs text-slate-400">{day.programItems.length} activité{day.programItems.length !== 1 ? "s" : ""}</span>
                  </div>
                  {day.programItems.length === 0 && <p className="text-xs text-slate-400 text-center py-3">Aucune activité pour ce jour</p>}
                  <div className="space-y-2">
                    {day.programItems.map((prog) => (
                      <div key={prog.id} className="bg-white border border-slate-200 rounded-xl p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <select value={prog.emoji} onChange={(e) => updateProgramItem(day.id, prog.id, { emoji: e.target.value })} className="text-lg border border-slate-200 rounded-lg px-1.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary">
                                {EMOJIS_LIST.map((e) => <option key={e} value={e}>{e}</option>)}
                              </select>
                              <input value={prog.title} onChange={(e) => updateProgramItem(day.id, prog.id, { title: e.target.value })} placeholder="Titre de l'activité" className="flex-1 text-sm font-medium text-slate-800 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary" />
                              <select value={prog.linked_offer_item_id ?? ""} onChange={(e) => updateProgramItem(day.id, prog.id, { linked_offer_item_id: e.target.value || null })} className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary">
                                <option value="">Sans offre liée</option>
                                {offerItems.map((item) => (
                                  <option key={item.id} value={item.id}>{item.name}</option>
                                ))}
                              </select>
                              {offerItems.length > 0 && (
                                <a href="/dashboard?tab=offers" target="_blank" className="text-[10px] text-primary font-medium hover:underline whitespace-nowrap">+ Nouvelle</a>
                              )}
                            </div>
                            <textarea value={prog.description} onChange={(e) => updateProgramItem(day.id, prog.id, { description: e.target.value })} placeholder="Description" rows={1} className="w-full text-xs text-slate-500 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
                            <div className="grid grid-cols-4 gap-2">
                              <div>
                                <label className="block text-[10px] font-medium text-slate-400 mb-0.5">Début</label>
                                <input type="time" value={prog.start_time} onChange={(e) => updateProgramItem(day.id, prog.id, { start_time: e.target.value })} className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary" />
                              </div>
                              <div>
                                <label className="block text-[10px] font-medium text-slate-400 mb-0.5">Fin</label>
                                <input type="time" value={prog.end_time} onChange={(e) => updateProgramItem(day.id, prog.id, { end_time: e.target.value })} className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary" />
                              </div>
                              <div>
                                <label className="block text-[10px] font-medium text-slate-400 mb-0.5">Durée (min)</label>
                                <input type="number" min="0" value={prog.duration_minutes} onChange={(e) => updateProgramItem(day.id, prog.id, { duration_minutes: e.target.value })} className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="ex: 120" />
                              </div>
                              <div>
                                <label className="block text-[10px] font-medium text-slate-400 mb-0.5">Distance (km)</label>
                                <input type="number" min="0" step="0.1" value={prog.distance_km} onChange={(e) => updateProgramItem(day.id, prog.id, { distance_km: e.target.value })} className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="ex: 5" />
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <label className="text-[10px] font-medium text-slate-400 shrink-0">Transport</label>
                              <select value={prog.transport_mode} onChange={(e) => updateProgramItem(day.id, prog.id, { transport_mode: e.target.value })} className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary">
                                {TRANSPORTS_LIST.map((t) => (
                                  <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                              </select>
                            </div>
                            {/* Guide search per activity */}
                            <div className="flex items-center gap-2">
                              <label className="text-[10px] font-medium text-slate-400 shrink-0">Guide</label>
                              {prog.guide_id ? (
                                <div className="flex items-center gap-1.5 bg-primary/5 rounded-lg px-2 py-1">
                                  <span className="text-[11px] font-medium text-primary">{prog.guide_name}</span>
                                  <button type="button" onClick={() => updateProgramItem(day.id, prog.id, { guide_id: null, guide_name: "" })} className="text-red-400 hover:text-red-600 p-0.5"><X size={12} /></button>
                                </div>
                              ) : (
                                <div className="relative">
                                  <GuideSearchInline
                                    onSelect={(id, name) => updateProgramItem(day.id, prog.id, { guide_id: id, guide_name: name })}
                                    dayDate={day.date || undefined}
                                    dayLat={day.lat}
                                    dayLng={day.lng}
                                    dayLocation={day.location_name}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                          <button type="button" onClick={() => removeProgramItem(day.id, prog.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg shrink-0 mt-1"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={() => addProgramItem(day.id)} className="mt-2 w-full py-1.5 rounded-lg border border-dashed border-slate-300 text-xs text-slate-400 hover:border-primary hover:text-primary flex items-center justify-center gap-1">
                    <Plus size={12} /> Ajouter une activité
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ─── Step 4: Map & Route ───────────────────────── */}
          {step === 4 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">Tracez l&apos;itinéraire sur la carte. Cliquez pour ajouter des points ou utilisez la recherche.</p>

              {/* Search to add waypoint */}
              <div className="bg-slate-50 rounded-xl p-3">
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Ajouter une étape par recherche</label>
                <LocationSearch
                  onPick={(lat, lng, name) => {
                    setWaypoints((prev) => [...prev, [lat, lng]]);
                  }}
                  placeholder="Ex: Matmata, Gabès..."
                />
              </div>

              <PolylineDrawer waypoints={waypoints} onChange={setWaypoints} />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Adresse du point de départ</label>
                  <input value={circuitAddress} onChange={(e) => setCircuitAddress(e.target.value)} placeholder="Adresse du circuit" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Latitude</label>
                    <input type="number" step="any" value={circuitLat ?? ""} onChange={(e) => setCircuitLat(e.target.value ? Number(e.target.value) : null)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" readOnly />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Longitude</label>
                    <input type="number" step="any" value={circuitLng ?? ""} onChange={(e) => setCircuitLng(e.target.value ? Number(e.target.value) : null)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" readOnly />
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-slate-400">Les champs Lat/Lng sont remplis automatiquement quand vous cliquez sur la carte ou utilisez la recherche.</p>
            </div>
          )}

          {/* ─── Step 5: Options & Pricing ─────────────────── */}
          {step === 5 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-slate-700">Tarification</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Prix de base</label>
                  <input type="number" min={0} step={0.01} value={basePrice} onChange={(e) => setBasePrice(e.target.value)} placeholder="Ex: 500" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Participants max</label>
                  <input type="number" min={1} value={maxParticipants} onChange={(e) => setMaxParticipants(e.target.value)} placeholder="Ex: 15" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Délai réservation (jours)</label>
                  <input type="number" min={0} value={bookingDeadlineDays} onChange={(e) => setBookingDeadlineDays(e.target.value)} placeholder="Ex: 3" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Confirmation</label>
                  <select value={confirmationMode} onChange={(e) => setConfirmationMode(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="automatic">Automatique</option><option value="manual">Manuelle</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Inclus</label>
                <textarea value={inclusions} onChange={(e) => setInclusions(e.target.value)} placeholder="Ex: Transport, hébergement, guide..." rows={2} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Non inclus</label>
                <textarea value={exclusions} onChange={(e) => setExclusions(e.target.value)} placeholder="Ex: Repas du soir, activités optionnelles..." rows={2} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
              </div>

              <h3 className="font-semibold text-sm text-slate-700 pt-2 border-t border-slate-100">Options supplémentaires</h3>
              <div className="space-y-2">
                {options.length === 0 && <p className="text-xs text-slate-400 text-center py-2">Aucune option ajoutée</p>}
                {options.map((opt) => (
                  <div key={opt.id} className="bg-slate-50 rounded-xl p-3 grid grid-cols-5 gap-2 items-end">
                    <div>
                      <label className="block text-[10px] font-medium text-slate-400 mb-0.5">Groupe</label>
                      <select value={opt.option_group} onChange={(e) => updateOption(opt.id, { option_group: e.target.value })} className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary">
                        {OPTION_GROUPS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-slate-400 mb-0.5">Type</label>
                      <select value={opt.option_type} onChange={(e) => updateOption(opt.id, { option_type: e.target.value })} className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary">
                        <option value="single_choice">Choix unique</option><option value="multiple_choice">Choix multiple</option><option value="quantity">Quantité</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-slate-400 mb-0.5">Prix</label>
                      <input type="number" min={0} step={0.01} value={opt.extra_price} onChange={(e) => updateOption(opt.id, { extra_price: e.target.value })} placeholder="0" className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div className="flex gap-1">
                      <label className="text-[10px] text-slate-500 cursor-pointer flex items-center gap-0.5">
                        <input type="checkbox" checked={opt.is_included} onChange={(e) => updateOption(opt.id, { is_included: e.target.checked })} className="accent-primary w-3 h-3" /> Inclus
                      </label>
                      <label className="text-[10px] text-slate-500 cursor-pointer flex items-center gap-0.5">
                        <input type="checkbox" checked={opt.is_required} onChange={(e) => updateOption(opt.id, { is_required: e.target.checked })} className="accent-primary w-3 h-3" /> Requis
                      </label>
                    </div>
                    <button type="button" onClick={() => removeOption(opt.id)} className="p-1 text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                  </div>
                ))}
                <button type="button" onClick={addOption} className="w-full py-2 rounded-xl border-2 border-dashed border-slate-200 text-xs text-slate-400 hover:border-primary hover:text-primary flex items-center justify-center gap-1">
                  <Plus size={14} /> Ajouter une option
                </button>
              </div>
            </div>
          )}

          {/* ─── Step 6: Preview ───────────────────────────── */}
          {step === 6 && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                {images.length > 0 && (
                  <div className="relative h-48 bg-slate-200"><img src={images[0]} alt={title} className="w-full h-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" /></div>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h3 className="text-lg font-bold text-slate-800">{title || "Titre du circuit"}</h3>
                    {basePrice && <span className="text-primary font-bold text-lg">{Number(basePrice).toLocaleString()} {currency}</span>}
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-slate-500 mb-3">
                    {region && <span className="flex items-center gap-1"><MapPin size={12} /> {region}</span>}
                    {durationDays && <span className="flex items-center gap-1"><Clock size={12} /> {durationDays} jour{durationDays !== "1" ? "s" : ""}</span>}
                    {maxParticipants && <span className="flex items-center gap-1"><Users size={12} /> Max {maxParticipants} pers.</span>}
                    {confirmationMode === "automatic" ? <span className="flex items-center gap-1 text-primary"><Check size={12} /> Confirmation instantanée</span> : <span className="flex items-center gap-1 text-amber-600"><Info size={12} /> Sur demande</span>}
                  </div>
                  {description && <p className="text-sm text-slate-600 leading-relaxed mb-3 line-clamp-3">{description}</p>}
                  {sortedDays.length > 0 && (
                    <>
                      <h4 className="font-semibold text-sm text-slate-700 flex items-center gap-1 mb-2"><Calendar size={14} /> Itinéraire</h4>
                      {sortedDays.map((day) => (
                        <div key={day.id} className="flex items-start gap-2 text-xs text-slate-600 mb-1.5">
                          <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center shrink-0 mt-0.5"><span className="text-[10px] font-bold text-primary">{day.day_number}</span></div>
                          <div className="flex-1">
                            <span className="font-medium text-slate-700">{day.title}</span>
                            {day.location_name && <span className="text-[10px] text-slate-400 ml-1">— {day.location_name}</span>}
                            {day.programItems.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-0.5">
                                {day.programItems.map((p) => <span key={p.id} className="bg-slate-100 rounded px-1.5 py-0.5 text-[10px] text-slate-500">{p.start_time || ""} {p.title}</span>)}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                  {options.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <h4 className="font-semibold text-xs text-slate-700 mb-1">{options.length} option{options.length > 1 ? "s" : ""}</h4>
                      <div className="flex flex-wrap gap-1">{options.map((opt) => <span key={opt.id} className="text-[10px] bg-slate-100 rounded px-1.5 py-0.5 text-slate-500">{OPTION_GROUPS.find((g) => g.value === opt.option_group)?.label || opt.option_group}{opt.extra_price ? ` (+${Number(opt.extra_price).toLocaleString()} ${currency})` : ""}</span>)}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
            <div>{step > 1 && <button onClick={goBack} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 px-4 py-2 rounded-xl hover:bg-slate-50"><ArrowLeft size={16} /> Retour</button>}</div>
            <div className="flex items-center gap-2">
              <button onClick={onClose} className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 rounded-xl hover:bg-slate-50">Annuler</button>
              {step < TOTAL_STEPS ? (
                <button onClick={goNext} className="flex items-center gap-1 px-5 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-emerald-600">Suivant <ArrowRight size={16} /></button>
              ) : (
                <button onClick={handleSubmit} disabled={submitting} className="flex items-center gap-2 px-5 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-emerald-600 disabled:opacity-50">
                  {submitting ? <><span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Création...</> : <><Check size={16} /> Publier le circuit</>}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
