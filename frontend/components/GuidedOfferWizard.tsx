"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { apiFetch } from "@/lib/api";
import ImageUploader from "@/components/ImageUploader";
import {
  ArrowLeft, ArrowRight, X, Plus, Trash2, Loader2, Check, MapPin, Upload,
} from "lucide-react";
import {
  PROJECT_TYPES, OFFER_CATEGORIES, PROJECT_TYPE_OFFERS, GUIDE_ALLOWED_OFFERS,
  CATEGORY_FORM_FIELDS, ACCOMMODATION_TYPES, ITEM_TYPES_BY_CATEGORY,
} from "@/lib/offer-config";

const MapPicker = dynamic(() => import("@/components/map/MapPicker"), { ssr: false });

interface Props {
  token: string;
  userRole: string;
  userProjectId?: string;
  userProjectType?: string;
  onClose: () => void;
  onSuccess: (offer: any) => void;
  editOffer?: any;
}

interface OfferItemForm {
  id?: string;
  name: string;
  description: string;
  item_type: string;
  room_type: string;
  bed_count: string;
  nights: string;
  tent_capacity: string;
  prices: { id?: string; label: string; price: string; currency: string; is_default: boolean }[];
}

export default function GuidedOfferWizard({ token, userRole, userProjectId, userProjectType, onClose, onSuccess, editOffer }: Props) {
  const router = useRouter();
  const isEdit = !!editOffer;
  const [step, setStep] = useState<1 | 2 | 3 | 4>(isEdit ? 2 : 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [region, setRegion] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [meetingPoint, setMeetingPoint] = useState("");
  const [confirmationMode, setConfirmationMode] = useState("automatic");
  const [minGroupSize, setMinGroupSize] = useState("");
  const [maxGroupSize, setMaxGroupSize] = useState("");
  const [minAge, setMinAge] = useState("");
  const [duration, setDuration] = useState("");
  const [images, setImages] = useState<string[]>([]);

  const [items, setItems] = useState<OfferItemForm[]>([]);
  const [sessions, setSessions] = useState<{ id?: string; date: string; start_time: string; end_time: string; capacity: string }[]>([]);

  useEffect(() => {
    if (!editOffer) return;
    setCategory(editOffer.offer_type || "");
    setTitle(editOffer.title || "");
    setDescription(editOffer.description || "");
    setRegion(editOffer.region || "");
    setAddress(editOffer.address || "");
    setLat(editOffer.latitude ?? null);
    setLng(editOffer.longitude ?? null);
    setMeetingPoint(editOffer.meeting_point || "");
    setConfirmationMode(editOffer.confirmation_mode || "automatic");
    setMinGroupSize(editOffer.min_group_size?.toString() || "");
    setMaxGroupSize(editOffer.max_group_size?.toString() || "");
    setMinAge(editOffer.min_age?.toString() || "");
    setDuration(editOffer.duration || "");
    setImages(editOffer.images || []);

    if (editOffer.items?.length) {
      setItems(editOffer.items.map((it: any) => ({
        id: it.id,
        name: it.name || "",
        description: it.description || "",
        item_type: it.item_type || "",
        room_type: it.room_type || "",
        bed_count: it.bed_count?.toString() || "",
        nights: it.nights?.toString() || "",
        tent_capacity: it.tent_capacity?.toString() || "",
        prices: it.prices?.length
          ? it.prices.map((p: any) => ({ id: p.id, label: p.label || "", price: p.price?.toString() || "", currency: p.currency || "TND", is_default: p.is_default ?? false }))
          : [{ label: "Plein tarif", price: "", currency: "TND", is_default: true }],
      })));
    }

    if (editOffer.items?.length && editOffer.items[0]?.sessions?.length) {
      setSessions(editOffer.items[0].sessions.map((s: any) => ({
        id: s.id,
        date: s.date || "",
        start_time: s.start_time || "",
        end_time: s.end_time || "",
        capacity: s.total_capacity?.toString() || "",
      })));
    }
  }, [editOffer]);

  const PROJECT_TYPE_MAP: Record<string, string> = {
    hebergement: 'accommodation',
    restauration: 'restaurant',
    artisanat: 'artisan',
    camping: 'camping',
    transport: 'transport',
    'centre activites': 'activity_center',
    'espace evenementiel': 'event_space',
    'association tourisme': 'tourism_association',
    'parc ecologique': 'eco_park',
    ferme: 'farm',
    accommodation: 'accommodation',
    restaurant: 'restaurant',
    artisan: 'artisan',
    activity_center: 'activity_center',
    event_space: 'event_space',
    tourism_association: 'tourism_association',
    eco_park: 'eco_park',
    farm: 'farm',
    cultural: 'activity_center',
    adventure: 'activity_center',
  };

  const normalizedProjectType = userProjectType
    ? (PROJECT_TYPE_MAP[userProjectType.toLowerCase()] ?? userProjectType)
    : null;

  const allowedCategories = userRole === "guide"
    ? GUIDE_ALLOWED_OFFERS
    : normalizedProjectType && PROJECT_TYPE_OFFERS[normalizedProjectType]
      ? PROJECT_TYPE_OFFERS[normalizedProjectType]
      : OFFER_CATEGORIES.map(c => c.value);

  const availableCategories = OFFER_CATEGORIES.filter(c => allowedCategories.includes(c.value));
  const currentItemTypes = category ? (ITEM_TYPES_BY_CATEGORY[category] ?? []) : [];
  const formFields = category ? (CATEGORY_FORM_FIELDS[category] ?? []) : [];

  const inputClass = "w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all";

  useEffect(() => {
    if (category && items.length === 0 && !isEdit) {
      addItem();
    }
  }, [category]);

  function addItem() {
    setItems([...items, {
      name: "",
      description: "",
      item_type: currentItemTypes[0]?.value ?? "",
      room_type: "",
      bed_count: "",
      nights: "",
      tent_capacity: "",
      prices: [{ label: "Plein tarif", price: "", currency: "TND", is_default: true }],
    }]);
  }

  function removeItem(idx: number) {
    setItems(items.filter((_, i) => i !== idx));
  }

  function updateItem(idx: number, field: keyof OfferItemForm, value: any) {
    const updated = [...items];
    (updated[idx] as any)[field] = value;
    setItems(updated);
  }

  function addItemPrice(itemIdx: number) {
    const updated = [...items];
    updated[itemIdx].prices.push({ label: "", price: "", currency: "TND", is_default: false });
    setItems(updated);
  }

  function removeItemPrice(itemIdx: number, priceIdx: number) {
    const updated = [...items];
    updated[itemIdx].prices = updated[itemIdx].prices.filter((_, i) => i !== priceIdx);
    setItems(updated);
  }

  function updateItemPrice(itemIdx: number, priceIdx: number, field: string, value: any) {
    const updated = [...items];
    (updated[itemIdx].prices[priceIdx] as any)[field] = value;
    setItems(updated);
  }

  function addSession() {
    setSessions([...sessions, { date: "", start_time: "", end_time: "", capacity: "" }]);
  }

  function removeSession(idx: number) {
    setSessions(sessions.filter((_, i) => i !== idx));
  }

  function updateSession(idx: number, field: string, value: string) {
    const updated = [...sessions];
    (updated[idx] as any)[field] = value;
    setSessions(updated);
  }

  async function handleSubmit() {
    if (!title.trim()) { setError("Le titre est obligatoire."); return; }
    if (!category) { setError("Choisissez une catégorie."); return; }
    if (items.length === 0 || !items[0].name.trim()) { setError("Ajoutez au moins un élément."); return; }

    setLoading(true);
    setError("");
    try {
      const offerData: any = {
        title: title.trim(),
        offer_type: category,
        description: description.trim() || undefined,
        region: region.trim() || undefined,
        address: address.trim() || undefined,
        latitude: lat ?? undefined,
        longitude: lng ?? undefined,
        meeting_point: meetingPoint.trim() || undefined,
        confirmation_mode: confirmationMode,
        duration: duration.trim() || undefined,
        min_group_size: minGroupSize ? Number(minGroupSize) : undefined,
        max_group_size: maxGroupSize ? Number(maxGroupSize) : undefined,
        min_age: minAge ? Number(minAge) : undefined,
        images: images.length > 0 ? images : undefined,
      };

      let resultOffer;
      if (isEdit) {
        await apiFetch<any>(`/offers/${editOffer.id}`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify(offerData),
        });
        resultOffer = await apiFetch<any>(`/offers/${editOffer.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        offerData.project_id = userProjectId || undefined;
        resultOffer = await apiFetch<any>("/offers", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify(offerData),
        });
      }

      for (const item of items) {
        if (!item.name.trim()) continue;
        const itemData: any = {
          name: item.name.trim(),
          description: item.description.trim() || undefined,
          item_type: item.item_type || undefined,
          room_type: category === 'accommodation' ? item.room_type || undefined : undefined,
          bed_count: category === 'accommodation' && item.bed_count ? Number(item.bed_count) : undefined,
          nights: category === 'accommodation' && item.nights ? Number(item.nights) : undefined,
          tent_capacity: category === 'accommodation' && item.tent_capacity ? Number(item.tent_capacity) : undefined,
          confirmation_mode: confirmationMode,
        };

        let createdItem;
        if (item.id) {
          createdItem = await apiFetch<any>(`/offers/items/${item.id}`, {
            method: "PATCH",
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(itemData),
          });
        } else {
          createdItem = await apiFetch<any>(`/offers/${resultOffer.id}/items`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(itemData),
          });
        }

        if (createdItem) {
          for (const price of item.prices) {
            if (!price.price) continue;
            if (price.id) {
              await apiFetch(`/offers/items/prices/${price.id}`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                  label: price.label || "Plein tarif",
                  price: Number(price.price),
                  currency: price.currency || "TND",
                  is_default: price.is_default,
                }),
              }).catch(() => {});
            } else {
              await apiFetch(`/offers/items/${createdItem.id}/prices`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                  label: price.label || "Plein tarif",
                  price: Number(price.price),
                  currency: price.currency || "TND",
                  is_default: price.is_default,
                }),
              }).catch(() => {});
            }
          }
        }
      }

      for (const session of sessions) {
        if (!session.date || !session.start_time || !session.end_time) continue;
        try {
          if (session.id) {
            await apiFetch(`/offers/items/sessions/${session.id}`, {
              method: "PATCH",
              headers: { Authorization: `Bearer ${token}` },
              body: JSON.stringify({
                date: session.date,
                start_time: session.start_time,
                end_time: session.end_time,
                total_capacity: session.capacity ? Number(session.capacity) : undefined,
              }),
            });
          } else {
            const itemList = await apiFetch<any[]>(`/offers/${resultOffer.id}/items`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (itemList?.length) {
              await apiFetch(`/offers/items/${itemList[0].id}/sessions`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                  date: session.date,
                  start_time: session.start_time,
                  end_time: session.end_time,
                  total_capacity: session.capacity ? Number(session.capacity) : undefined,
                }),
              });
            }
          }
        } catch {}
      }

      onSuccess(resultOffer);
    } catch (err: any) {
      setError(err.message || `Erreur lors de la ${isEdit ? "modification" : "création"}.`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            {step > (isEdit ? 2 : 1) && (
              <button onClick={() => setStep((step - 1) as any)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                <ArrowLeft size={18} />
              </button>
            )}
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">{isEdit ? "Modifier l'offre" : "Nouvelle offre"}</h2>
              <p className="text-xs text-slate-400">Étape {isEdit ? step - 1 : step}/4 — {step === 1 ? "Catégorie" : step === 2 ? "Informations" : step === 3 ? "Éléments" : "Sessions"}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400"><X size={18} /></button>
        </div>

        {/* Progress */}
        <div className="px-6 pt-4">
          <div className="flex gap-2">
            {[1, 2, 3, 4].filter(s => isEdit ? s > 1 : true).map((s) => (
              <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? "bg-primary" : "bg-slate-100"}`} />
            ))}
          </div>
        </div>

        <div className="p-6">

          {/* STEP 1: Category (create only) */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800">Choisir la catégorie</h3>
              <div className="grid grid-cols-2 gap-3">
                {availableCategories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => { setCategory(cat.value); setStep(2); }}
                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all hover:border-primary hover:bg-primary/5 ${category === cat.value ? "border-primary bg-primary/5" : "border-slate-100"}`}
                  >
                    <span className="text-2xl">{cat.icon}</span>
                    <div>
                      <p className="font-bold text-sm text-slate-800">{cat.label}</p>
                      <p className="text-xs text-slate-400">{cat.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Basic Info */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800">Informations générales</h3>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Titre *</label>
                <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Eco Lodge Sahara" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Description</label>
                <textarea className={`${inputClass} resize-none`} value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Décrivez votre offre..." />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Région</label>
                  <input className={inputClass} value={region} onChange={(e) => setRegion(e.target.value)} placeholder="Djerba, Tozeur..." />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Durée</label>
                  <input className={inputClass} value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="2h, 1 journée..." />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Adresse</label>
                <input className={inputClass} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Adresse complète" />
              </div>

              <ImageUploader images={images} onChange={setImages} maxImages={5} label="Images de l'offre" />

              {formFields.includes('gps') && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Localisation GPS</label>
                  <MapPicker lat={lat ?? 36.8065} lng={lng ?? 10.1815} onPick={(la: number, ln: number) => { setLat(la); setLng(ln); }} />
                </div>
              )}

              {formFields.includes('meeting_point') && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Point de rendez-vous</label>
                  <input className={inputClass} value={meetingPoint} onChange={(e) => setMeetingPoint(e.target.value)} placeholder="Lieu de rendez-vous" />
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Confirmation</label>
                  <select className={inputClass} value={confirmationMode} onChange={(e) => setConfirmationMode(e.target.value)}>
                    <option value="automatic">Automatique</option>
                    <option value="manual">Manuelle</option>
                  </select>
                </div>
                {formFields.includes('min_group_size') && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500">Min pers.</label>
                    <input type="number" min="1" className={inputClass} value={minGroupSize} onChange={(e) => setMinGroupSize(e.target.value)} placeholder="1" />
                  </div>
                )}
                {formFields.includes('max_group_size') && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500">Max pers.</label>
                    <input type="number" min="1" className={inputClass} value={maxGroupSize} onChange={(e) => setMaxGroupSize(e.target.value)} placeholder="20" />
                  </div>
                )}
              </div>

              {formFields.includes('min_age') && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Âge minimum</label>
                  <input type="number" min="0" className={`${inputClass} w-32`} value={minAge} onChange={(e) => setMinAge(e.target.value)} placeholder="0" />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(isEdit ? 2 : 1)} className="flex-1 py-3 border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50">Retour</button>
                <button onClick={() => { if (!title.trim()) { setError("Le titre est obligatoire."); return; } setError(""); setStep(3); }} className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-emerald-600 flex items-center justify-center gap-2">
                  Suivant <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Items */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800">Éléments réservables</h3>
                <button onClick={addItem} className="flex items-center gap-1 text-xs font-bold text-primary hover:text-emerald-700">
                  <Plus size={14} /> Ajouter
                </button>
              </div>

              {items.map((item, idx) => (
                <div key={idx} className="border border-slate-100 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">Élément {idx + 1}</span>
                    {items.length > 1 && (
                      <button onClick={() => removeItem(idx)} className="p-1 text-slate-400 hover:text-red-500"><Trash2 size={14} /></button>
                    )}
                  </div>

                  <input className={inputClass} value={item.name} onChange={(e) => updateItem(idx, "name", e.target.value)} placeholder="Nom de l'élément" />

                  <div className="grid grid-cols-2 gap-2">
                    <select className={inputClass} value={item.item_type} onChange={(e) => updateItem(idx, "item_type", e.target.value)}>
                      <option value="">Type</option>
                      {currentItemTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>

                    {category === 'accommodation' && (
                      <select className={inputClass} value={item.room_type} onChange={(e) => updateItem(idx, "room_type", e.target.value)}>
                        <option value="">Type chambre</option>
                        {ACCOMMODATION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
                      </select>
                    )}
                  </div>

                  {category === 'accommodation' && (
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400">Nombre de lits</label>
                        <input type="number" min="1" className={inputClass} value={item.bed_count} onChange={(e) => updateItem(idx, "bed_count", e.target.value)} placeholder="2" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400">Nombre de nuits</label>
                        <input type="number" min="1" className={inputClass} value={item.nights} onChange={(e) => updateItem(idx, "nights", e.target.value)} placeholder="1" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400">Capacité tente (pers.)</label>
                        <input type="number" min="1" className={inputClass} value={item.tent_capacity} onChange={(e) => updateItem(idx, "tent_capacity", e.target.value)} placeholder="4" />
                      </div>
                    </div>
                  )}

                  {/* Prices */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-500">Prix par personne</label>
                      <button onClick={() => addItemPrice(idx)} type="button" className="text-[10px] font-bold text-primary hover:underline">+ Ajouter un prix</button>
                    </div>
                    {item.prices.map((price, pIdx) => (
                      <div key={pIdx} className="flex items-center gap-2">
                        <input className={`${inputClass} flex-1`} value={price.label} onChange={(e) => updateItemPrice(idx, pIdx, "label", e.target.value)} placeholder="Ex: Plein tarif, Étudiant, Enfant..." />
                        <input type="number" min="0" step="0.5" className={`${inputClass} w-24`} value={price.price} onChange={(e) => updateItemPrice(idx, pIdx, "price", e.target.value)} placeholder="0" />
                        <span className="text-xs text-slate-400">TND</span>
                        {item.prices.length > 1 && (
                          <button onClick={() => removeItemPrice(idx, pIdx)} type="button" className="p-1 text-slate-400 hover:text-red-500"><Trash2 size={12} /></button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(2)} className="flex-1 py-3 border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50">Retour</button>
                <button onClick={() => setStep(4)} className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-emerald-600 flex items-center justify-center gap-2">
                  Suivant <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Sessions */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800">Créneaux horaires</h3>
                  <p className="text-xs text-slate-400">Définissez les heures de disponibilité (ex: 09h00-12h00)</p>
                </div>
                <button onClick={addSession} className="flex items-center gap-1 text-xs font-bold text-primary hover:text-emerald-700">
                  <Plus size={14} /> Ajouter
                </button>
              </div>

              {sessions.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-6">Aucun créneau. Vous pourrez en ajouter plus tard.</p>
              )}

              {sessions.map((session, idx) => (
                <div key={idx} className="border border-slate-100 rounded-xl p-3 flex items-center gap-2">
                  <input type="date" className={`${inputClass} flex-1`} value={session.date} onChange={(e) => updateSession(idx, "date", e.target.value)} />
                  <input type="time" className={`${inputClass} w-28`} value={session.start_time} onChange={(e) => updateSession(idx, "start_time", e.target.value)} />
                  <input type="time" className={`${inputClass} w-28`} value={session.end_time} onChange={(e) => updateSession(idx, "end_time", e.target.value)} />
                  <input type="number" min="1" className={`${inputClass} w-20`} value={session.capacity} onChange={(e) => updateSession(idx, "capacity", e.target.value)} placeholder="Cap." />
                  <button onClick={() => removeSession(idx)} className="p-1 text-slate-400 hover:text-red-500"><Trash2 size={14} /></button>
                </div>
              ))}

              {error && <p className="text-sm text-red-500 font-semibold">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(3)} className="flex-1 py-3 border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50">Retour</button>
                <button onClick={handleSubmit} disabled={loading} className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-emerald-600 flex items-center justify-center gap-2 disabled:opacity-50">
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  {loading ? (isEdit ? "Modification..." : "Création...") : (isEdit ? "Modifier l'offre" : "Créer l'offre")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
