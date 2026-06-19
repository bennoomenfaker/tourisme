"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import {
  ArrowLeft, Leaf, Calendar, Plus, Trash2, MapPin, Clock,
  Search, X, Loader2, Check, AlertCircle, Tag, Share2,
} from "lucide-react";
import AppNavbar from "@/components/nav/AppNavbar";
import BackToDashboard from "@/components/nav/BackToDashboard";

const TripMap = dynamic(() => import("@/components/map/TripMap"), { ssr: false });
const MapPicker = dynamic(() => import("@/components/map/MapPicker"), { ssr: false });

interface TripPlan {
  id: string;
  title: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  status: string;
  created_at: string;
  items: TripPlanItem[];
}

interface TripPlanItem {
  id: string;
  day_number: number | null;
  sort_order: number;
  notes: string | null;
  created_at: string;
  offerItem: OfferItem | null;
}

interface OfferItem {
  id: string;
  name: string;
  description: string | null;
  item_type: string | null;
  bed_count: number | null;
  nights: number | null;
  tent_capacity: number | null;
  room_type: string | null;
  status: string;
  prices: OfferItemPrice[];
  offer: OfferBrief | null;
}

interface OfferItemPrice {
  id: string;
  label: string;
  price: number;
  currency: string;
  is_default: boolean;
}

interface OfferBrief {
  id: string;
  title: string;
  region: string | null;
  images: string[] | null;
  latitude: number | null;
  longitude: number | null;
}

interface OfferListItem {
  id: string;
  title: string;
  region: string | null;
  offer_type: string | null;
  images: string[] | null;
}

interface OfferFull extends OfferListItem {
  items: OfferItemFull[];
}

interface OfferItemFull {
  id: string;
  name: string;
  description: string | null;
  item_type: string | null;
  bed_count: number | null;
  nights: number | null;
  tent_capacity: number | null;
  room_type: string | null;
  status: string;
  prices: OfferItemPrice[];
}

interface Participant {
  full_name: string;
  age: number | null;
  document_type: string;
  document_number: string;
  is_group_leader: boolean;
}

const STATUS_LABELS: Record<string, string> = {
  draft: "Brouillon",
  planning: "En planification",
  confirmed: "Confirmé",
  completed: "Terminé",
  cancelled: "Annulé",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600",
  planning: "bg-blue-100 text-blue-700",
  confirmed: "bg-emerald-100 text-emerald-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-600",
};

export default function TripPlanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [plan, setPlan] = useState<TripPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showBook, setShowBook] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [savingTitle, setSavingTitle] = useState(false);

  const loadPlan = useCallback(() => {
    setLoading(true);
    apiFetch<TripPlan>(`/trip-plans/${id}`)
      .then((data) => { setPlan(data); setEditTitle(data.title); })
      .catch(() => router.push("/trip-plans"))
      .finally(() => setLoading(false));
  }, [id, router]);

  useEffect(() => {
    if (!localStorage.getItem("access_token")) { router.push("/auth/login"); return; }
    loadPlan();
  }, [loadPlan, router]);

  const handleSaveTitle = async () => {
    if (!editTitle.trim() || !plan) return;
    setSavingTitle(true);
    try {
      const updated = await apiFetch<TripPlan>(`/trip-plans/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ title: editTitle.trim() }),
      });
      setPlan(updated);
      setEditingTitle(false);
    } catch (e: any) { alert(e.message); }
    setSavingTitle(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 pb-12">
      <AppNavbar title="Trip Plan" />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-4">
          <BackToDashboard />
          <button
            onClick={() => router.push("/trip-plans")}
            className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ArrowLeft size={16} /> Mes plans
          </button>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 animate-pulse space-y-3">
            <div className="h-8 bg-slate-100 rounded w-1/2" />
            <div className="h-4 bg-slate-100 rounded w-3/4" />
          </div>
        ) : !plan ? (
          <div className="text-center py-20 text-slate-400">
            <Leaf size={40} className="mx-auto mb-2 opacity-30" />
            Plan introuvable
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {editingTitle ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="flex-1 text-xl font-bold border-b-2 border-emerald-300 bg-transparent focus:outline-none py-0.5"
                        autoFocus
                        onKeyDown={(e) => { if (e.key === "Enter") handleSaveTitle(); if (e.key === "Escape") setEditingTitle(false); }}
                      />
                      <button onClick={handleSaveTitle} disabled={savingTitle} className="text-primary hover:text-emerald-700">
                        {savingTitle ? <Loader2 size={16} className="animate-spin" /> : <Check size={18} />}
                      </button>
                      <button onClick={() => setEditingTitle(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
                    </div>
                  ) : (
                    <h1
                      className="text-2xl font-bold text-slate-800 cursor-pointer hover:text-primary transition-colors"
                      onClick={() => setEditingTitle(true)}
                      title="Cliquer pour modifier"
                    >
                      {plan.title}
                    </h1>
                  )}
                  {plan.description && <p className="text-slate-500 mt-1">{plan.description}</p>}
                  <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-slate-400">
                    {plan.start_date && (
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(plan.start_date).toLocaleDateString("fr-FR")}
                        {plan.end_date && ` — ${new Date(plan.end_date).toLocaleDateString("fr-FR")}`}
                      </span>
                    )}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${STATUS_COLORS[plan.status] ?? "bg-slate-100 text-slate-500"}`}>
                      {STATUS_LABELS[plan.status] ?? plan.status}
                    </span>
                    <span className="flex items-center gap-1">
                      <Tag size={14} />
                      {plan.items?.length ?? 0} élément{(plan.items?.length ?? 0) !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setShowBook(true)}
                    disabled={!plan.items?.length}
                    className="px-4 py-2 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                  >
                    <Check size={16} /> Réserver
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/trip-plans/${plan.id}`;
                      const text = `Découvrez mon plan de voyage: ${plan.title} ${url}`;
                      router.push(`/messagerie?share=${encodeURIComponent(text)}`);
                    }}
                    className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-primary hover:border-emerald-200 transition-colors"
                  >
                    <Share2 size={16} />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-slate-800 text-lg">Activités</h2>
                <button
                  onClick={() => setShowAddItem(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-medium text-sm hover:bg-slate-200 transition-colors"
                >
                  <Plus size={16} /> Ajouter
                </button>
              </div>

              {!plan.items?.length ? (
                <div className="text-center py-12 text-slate-400">
                  <MapPin size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="font-medium">Aucune activité dans ce plan</p>
                  <p className="text-sm mt-1">Ajoutez des offres depuis le catalogue pour commencer</p>
                  <button
                    onClick={() => setShowAddItem(true)}
                    className="mt-3 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-emerald-600"
                  >
                    Ajouter une activité
                  </button>
                </div>
              ) : (
                <>
                  <TripMap
                    className="mb-4"
                    items={plan.items
                      .filter((item) => item.offerItem?.offer?.latitude && item.offerItem?.offer?.longitude)
                      .map((item) => ({
                        label: item.offerItem?.name ?? item.offerItem?.offer?.title ?? "",
                        lat: Number(item.offerItem!.offer!.latitude),
                        lng: Number(item.offerItem!.offer!.longitude),
                        day_number: item.day_number,
                      }))}
                  />
                  <div className="space-y-3">
                  {plan.items.map((item) => (
                    <div key={item.id} className="border border-slate-100 rounded-xl p-4 hover:border-slate-200 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h4 className="font-semibold text-slate-800">
                              {item.offerItem?.name ?? "Élément supprimé"}
                            </h4>
                            {item.offerItem?.item_type && (
                              <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">
                                {item.offerItem.item_type}
                              </span>
                            )}
                            {item.day_number && (
                              <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">
                                Jour {item.day_number}
                              </span>
                            )}
                          </div>
                          {item.offerItem?.offer && (
                            <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                              <MapPin size={10} />
                              {item.offerItem.offer.title}
                              {item.offerItem.offer.region && ` — ${item.offerItem.offer.region}`}
                            </p>
                          )}
                          {(item.offerItem?.bed_count || item.offerItem?.nights || item.offerItem?.tent_capacity || item.offerItem?.room_type) && (
                            <div className="flex flex-wrap gap-2 mt-1.5">
                              {item.offerItem.room_type && (
                                <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-full">
                                  {item.offerItem.room_type === 'shared_dormitory' ? '🛏 Dortoir' :
                                   item.offerItem.room_type === 'private' ? '🏠 Privé' :
                                   item.offerItem.room_type === 'double' ? '👫 Double' :
                                   item.offerItem.room_type === 'family' ? '👨‍👩‍👧‍👦 Famille' :
                                   item.offerItem.room_type === 'tent' ? '⛺ Tente' :
                                   item.offerItem.room_type}
                                </span>
                              )}
                              {item.offerItem.bed_count != null && (
                                <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-full">
                                  🛏 {item.offerItem.bed_count} lit{item.offerItem.bed_count > 1 ? 's' : ''}
                                </span>
                              )}
                              {item.offerItem.nights != null && (
                                <span className="text-[10px] bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded-full">
                                  🌙 {item.offerItem.nights} nuit{item.offerItem.nights > 1 ? 's' : ''}
                                </span>
                              )}
                              {item.offerItem.tent_capacity != null && (
                                <span className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded-full">
                                  ⛺ {item.offerItem.tent_capacity} pers.
                                </span>
                              )}
                            </div>
                          )}
                          {item.notes && (
                            <p className="text-xs text-slate-500 mt-1 italic">{item.notes}</p>
                          )}
                          {item.offerItem?.prices && item.offerItem.prices.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {item.offerItem.prices.filter((p) => p.is_default || item.offerItem!.prices.length === 1).map((p) => (
                                <span key={p.id} className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full">
                                  {Number(p.price).toLocaleString()} {p.currency}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={async () => {
                            if (!confirm("Retirer cette activité du plan ?")) return;
                            try {
                              await apiFetch(`/trip-plans/${id}/items/${item.id}`, { method: "DELETE" });
                              loadPlan();
                            } catch (e: any) { alert(e.message); }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 shrink-0"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {showAddItem && plan && <AddItemModal planId={id} onClose={() => setShowAddItem(false)} onAdded={loadPlan} />}
      {showBook && plan && <BookModal planId={id} plan={plan} onClose={() => setShowBook(false)} onBooked={() => { loadPlan(); setShowBook(false); }} />}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-lg p-6 mx-4 max-w-sm w-full">
            <h3 className="font-bold text-slate-800 mb-2">Supprimer le plan ?</h3>
            <p className="text-sm text-slate-500 mb-4">Cette action est irréversible.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600">Annuler</button>
              <button
                onClick={async () => {
                  try { await apiFetch(`/trip-plans/${id}`, { method: "DELETE" }); router.push("/trip-plans"); }
                  catch (e: any) { alert(e.message); }
                }}
                className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AddItemModal({ planId, onClose, onAdded }: { planId: string; onClose: () => void; onAdded: () => void }) {
  const [offers, setOffers] = useState<OfferListItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedOffer, setSelectedOffer] = useState<OfferFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState<string | null>(null);
  const [dayNumber, setDayNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [mapLat, setMapLat] = useState<number | null>(null);
  const [mapLng, setMapLng] = useState<number | null>(null);

  useEffect(() => {
    apiFetch<OfferListItem[]>("/offers")
      .then(setOffers)
      .finally(() => setLoading(false));
  }, []);

  const filtered = search.trim()
    ? offers.filter((o) => o.title.toLowerCase().includes(search.toLowerCase()) || (o.region && o.region.toLowerCase().includes(search.toLowerCase())))
    : offers;

  const handleSelectOffer = async (offerId: string) => {
    try {
      const full = await apiFetch<OfferFull>(`/offers/${offerId}`);
      setSelectedOffer(full);
    } catch { /* ignore */ }
  };

  const handleAddItem = async (offerItemId: string) => {
    setAdding(offerItemId);
    try {
      await apiFetch(`/trip-plans/${planId}/items`, {
        method: "POST",
        body: JSON.stringify({
          offer_item_id: offerItemId,
          day_number: dayNumber ? parseInt(dayNumber) : undefined,
          notes: notes.trim() || undefined,
        }),
      });
      onAdded();
      onClose();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setAdding(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 bg-black/30 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-lg mx-4 w-full max-w-lg mb-12">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">Ajouter une activité</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"><X size={18} /></button>
        </div>

        <div className="p-4">
          {selectedOffer ? (
            <div>
              <button onClick={() => setSelectedOffer(null)} className="text-sm text-primary hover:underline mb-3 flex items-center gap-1">
                <ArrowLeft size={14} /> Retour aux offres
              </button>
              <h4 className="font-bold text-slate-800 mb-1">{selectedOffer.title}</h4>
              <p className="text-xs text-slate-400 mb-3">{selectedOffer.region}</p>

              <div className="mt-3 grid grid-cols-2 gap-2 mb-3">
                <input type="number" placeholder="Jour (optionnel)" value={dayNumber} onChange={(e) => setDayNumber(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" />
                <input type="text" placeholder="Note (optionnelle)" value={notes} onChange={(e) => setNotes(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" />
              </div>

              <div className="mb-3">
                <label className="text-xs font-medium text-slate-500 mb-1 block">Localisation (optionnel)</label>
                <div className="h-48 rounded-xl overflow-hidden">
                  <MapPicker
                    lat={mapLat ?? 36.8065}
                    lng={mapLng ?? 10.1815}
                    onPick={(lat, lng) => { setMapLat(lat); setMapLng(lng); }}
                  />
                </div>
                {mapLat && mapLng && (
                  <p className="text-[10px] text-slate-400 mt-1">📍 {mapLat.toFixed(5)}, {mapLng.toFixed(5)}</p>
                )}
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {selectedOffer.items
                  .filter((i) => i.status === "active")
                  .map((item) => (
                    <div key={item.id} className="border border-slate-100 rounded-xl p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-slate-800">{item.name}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.item_type && <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">{item.item_type}</span>}
                            {item.room_type && <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">{item.room_type}</span>}
                            {item.bed_count != null && <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">🛏 {item.bed_count} lit(s)</span>}
                            {item.nights != null && <span className="text-[10px] text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-full">🌙 {item.nights} nuit(s)</span>}
                            {item.tent_capacity != null && <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">⛺ {item.tent_capacity} pers.</span>}
                          </div>
                          {item.prices.length > 0 && (
                            <p className="text-xs text-primary font-semibold mt-1">
                              {Number(item.prices.find((p) => p.is_default)?.price ?? item.prices[0].price).toLocaleString()} {item.prices[0].currency}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleAddItem(item.id)}
                          disabled={adding === item.id}
                          className="shrink-0 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-medium hover:bg-emerald-600 disabled:opacity-50 flex items-center gap-1"
                        >
                          {adding === item.id ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                          Ajouter
                        </button>
                      </div>
                    </div>
                  ))}
                {selectedOffer.items.filter((i) => i.status === "active").length === 0 && (
                  <div className="text-center py-6">
                    <p className="text-sm text-slate-400 mb-2">Aucun élément actif dans cette offre</p>
                    <p className="text-xs text-slate-300">Le prestataire n&apos;a pas encore ajouté d&apos;activités à cette offre.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <div className="relative mb-3">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher une offre..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                />
              </div>

              {loading ? (
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => <div key={i} className="h-12 rounded-xl bg-slate-100 animate-pulse" />)}
                </div>
              ) : (
                <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
                  {filtered.map((offer) => (
                    <button
                      key={offer.id}
                      onClick={() => handleSelectOffer(offer.id)}
                      className="w-full text-left p-3 rounded-xl hover:bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-colors"
                    >
                      <p className="font-medium text-sm text-slate-800">{offer.title}</p>
                      {offer.region && <p className="text-xs text-slate-400">{offer.region}</p>}
                    </button>
                  ))}
                  {filtered.length === 0 && <p className="text-sm text-slate-400 text-center py-4">Aucune offre trouvée</p>}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BookModal({ planId, plan, onClose, onBooked }: { planId: string; plan: TripPlan; onClose: () => void; onBooked: () => void }) {
  const [participants, setParticipants] = useState<Participant[]>([
    { full_name: "", age: null, document_type: "none", document_number: "", is_group_leader: true },
  ]);
  const [specialRequests, setSpecialRequests] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const addParticipant = () => {
    setParticipants([...participants, { full_name: "", age: null, document_type: "none", document_number: "", is_group_leader: false }]);
  };

  const removeParticipant = (index: number) => {
    if (participants.length <= 1) return;
    setParticipants(participants.filter((_, i) => i !== index));
  };

  const updateParticipant = (index: number, field: keyof Participant, value: string | number | boolean | null) => {
    const updated = [...participants];
    (updated[index] as any)[field] = value;
    setParticipants(updated);
  };

  const handleSubmit = async () => {
    if (!participants[0].full_name.trim()) {
      setError("Veuillez remplir le nom du participant principal.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await apiFetch(`/trip-plans/${planId}/book`, {
        method: "POST",
        body: JSON.stringify({
          participants: participants.filter((p) => p.full_name.trim()),
          special_requests: specialRequests || undefined,
        }),
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const itemCount = plan.items?.length ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 bg-black/30 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-lg mx-4 w-full max-w-md mb-12">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">Réserver le plan</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"><X size={18} /></button>
        </div>

        <div className="p-4">
          {success ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check size={28} className="text-primary" />
              </div>
              <h4 className="font-bold text-slate-800 mb-1">Réservation effectuée !</h4>
              <p className="text-sm text-slate-500 mb-4">{itemCount} réservation{itemCount !== 1 ? "s" : ""} créée{itemCount !== 1 ? "s" : ""}</p>
              <button onClick={onBooked} className="px-5 py-2 rounded-xl bg-primary text-white font-medium text-sm">Terminé</button>
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-500 mb-4">
                {itemCount} activité{itemCount !== 1 ? "s" : ""} du plan seront réservée{itemCount !== 1 ? "s" : ""} en une fois.
              </p>

              {error && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-4 text-sm text-red-600 flex items-start gap-2">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">Participants</label>
                {participants.map((p, i) => (
                  <div key={i} className="bg-slate-50 rounded-xl p-3 mb-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-500">Participant {i + 1}{p.is_group_leader ? " (responsable)" : ""}</span>
                      {i > 0 && <button onClick={() => removeParticipant(i)} className="text-xs text-red-400 hover:text-red-600">Supprimer</button>}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" placeholder="Nom complet *" value={p.full_name} onChange={(e) => updateParticipant(i, "full_name", e.target.value)} className="col-span-2 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-300" />
                      <input type="number" placeholder="Âge" value={p.age ?? ""} onChange={(e) => updateParticipant(i, "age", e.target.value ? parseInt(e.target.value) : null)} className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-300" />
                      <select value={p.document_type} onChange={(e) => updateParticipant(i, "document_type", e.target.value)} className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-300">
                        <option value="none">Aucun document</option>
                        <option value="passport">Passeport</option>
                        <option value="id_card">Carte d&apos;identité</option>
                      </select>
                      {p.document_type !== "none" && (
                        <input type="text" placeholder="N° document" value={p.document_number} onChange={(e) => updateParticipant(i, "document_number", e.target.value)} className="col-span-2 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-300" />
                      )}
                    </div>
                  </div>
                ))}
                <button onClick={addParticipant} className="text-sm text-primary hover:text-emerald-700 font-medium">+ Ajouter un participant</button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Demandes spéciales</label>
                <textarea value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)} placeholder="Allergies, préférences..." rows={2} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-300 resize-none" />
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-primary text-white font-semibold hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <><Loader2 size={18} className="animate-spin" /> Réservation en cours…</>
                ) : (
                  <><Check size={18} /> Réserver le plan</>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
