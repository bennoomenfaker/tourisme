"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { apiFetch } from "@/lib/api";
import ImageUploader from "@/components/ImageUploader";
import SmartDatePicker from "@/components/SmartDatePicker";
import {
  ArrowLeft, ArrowRight, X, Plus, Trash2, Loader2, Check, MapPin, Leaf, Clock,
} from "lucide-react";
import {
  OFFER_CATEGORIES, PROJECT_TYPE_OFFERS, GUIDE_ALLOWED_OFFERS,
  CATEGORY_FORM_FIELDS, ITEM_TYPES_BY_CATEGORY, ROOM_SUB_TYPES, PRICING_UNITS,
} from "@/lib/offer-config";

const MapPicker = dynamic(() => import("@/components/map/MapPicker"), {
  ssr: false,
  loading: () => <div className="h-[268px] rounded-2xl bg-slate-100 animate-pulse" />,
});

interface Props {
  token: string;
  userRole: string;
  userProjectId?: string;
  userProjectType?: string;
  onClose: () => void;
  onSuccess: (offer: any) => void;
  editOffer?: any;
}

interface AvailabilityRule {
  availability_type: string;
  start_date: string | null;
  end_date: string | null;
  weekdays: number[] | null;
  start_time: string | null;
  end_time: string | null;
  recurrence_rule: string | null;
}

interface OfferItemForm {
  id?: string;
  name: string;
  description: string;
  item_type: string;
  room_sub_type: string;
  bed_count: string;
  tent_capacity: string;
  difficulty_level: string;
  duration_hours: string;
  distance_km: string;
  activity_custom_name: string;
  prices: { id?: string; label: string; price: string; currency: string; pricing_unit: string; is_default: boolean }[];
}

const ACTIVITY_GROUPS: Record<string, { label: string; types: { value: string; label: string }[] }[]> = {
  activity: [
    {
      label: "Outdoor",
      types: [
        { value: "randonnee", label: "Randonnée" },
        { value: "trekking", label: "Trekking" },
        { value: "vtt", label: "VTT" },
        { value: "escalade", label: "Escalade" },
        { value: "kayak", label: "Kayak" },
        { value: "paddle", label: "Paddle" },
        { value: "tyrolienne", label: "Tyrolienne" },
        { value: "speleologie", label: "Spéléologie" },
        { value: "equitation", label: "Équitation" },
      ],
    },
    {
      label: "Nature",
      types: [
        { value: "observation", label: "Observation" },
        { value: "astronomie", label: "Astronomie" },
        { value: "photographie", label: "Photographie" },
      ],
    },
    {
      label: "Culture & Bien-être",
      types: [
        { value: "yoga", label: "Yoga" },
        { value: "meditation", label: "Méditation" },
        { value: "poterie", label: "Poterie" },
        { value: "cuisine", label: "Cuisine" },
        { value: "musique", label: "Musique" },
      ],
    },
    {
      label: "Sport",
      types: [
        { value: "surfing", label: "Surf" },
        { value: "diving", label: "Plongée" },
        { value: "paragliding", label: "Parapente" },
      ],
    },
    {
      label: "Autre",
      types: [{ value: "other", label: "Autre activité" }],
    },
  ],
};

const STEP_LABELS = [
  "", "Catégorie", "Informations", "Activité", "Tarifs",
  "Calendrier", "Capacité", "Carte", "Images", "Aperçu",
];

const TOTAL_STEPS = 9;

const PROJECT_TYPE_MAP: Record<string, string> = {
  hebergement: 'accommodation', restauration: 'restaurant',
  artisanat: 'artisan', camping: 'camping', transport: 'transport',
  'centre activites': 'activity_center', 'espace evenementiel': 'event_space',
  'association tourisme': 'tourism_association', 'parc ecologique': 'eco_park',
  ferme: 'farm', accommodation: 'accommodation', restaurant: 'restaurant',
  artisan: 'artisan', activity_center: 'activity_center',
  event_space: 'event_space', tourism_association: 'tourism_association',
  eco_park: 'eco_park', farm: 'farm', cultural: 'activity_center',
  adventure: 'activity_center',
};

const OFFER_TYPE_MAP: Record<string, string> = {
  hebergement: 'accommodation', activite: 'activity',
  restauration: 'restaurant', artisanat: 'workshop',
  eco_tourisme: 'activity', autre: 'activity',
};

function hasDifficulty(itemType: string): boolean {
  return ["randonnee", "trekking", "vtt", "escalade", "kayak", "speleologie"].includes(itemType);
}

export default function GuidedOfferWizard({ token, userRole, userProjectId, userProjectType, onClose, onSuccess, editOffer }: Props) {
  const isEdit = !!editOffer;
  const [step, setStep] = useState<number>(isEdit ? 2 : 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const normalizedProjectType = userProjectType
    ? (PROJECT_TYPE_MAP[userProjectType.toLowerCase()] ?? userProjectType) : null;

  const allowedCategories = userRole === "guide"
    ? GUIDE_ALLOWED_OFFERS
    : normalizedProjectType && PROJECT_TYPE_OFFERS[normalizedProjectType]
      ? PROJECT_TYPE_OFFERS[normalizedProjectType]
      : OFFER_CATEGORIES.map(c => c.value);

  const availableCategories = OFFER_CATEGORIES.filter(c => allowedCategories.includes(c.value));

  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [description, setDescription] = useState("");
  const [region, setRegion] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [meetingPoint, setMeetingPoint] = useState("");
  const [meetingLat, setMeetingLat] = useState<number | null>(null);
  const [meetingLng, setMeetingLng] = useState<number | null>(null);
  const [confirmationMode, setConfirmationMode] = useState("automatic");
  const [minGroupSize, setMinGroupSize] = useState("");
  const [maxGroupSize, setMaxGroupSize] = useState("");
  const [minAge, setMinAge] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [inclusions, setInclusions] = useState("");
  const [cancellationPolicy, setCancellationPolicy] = useState("");
  const [items, setItems] = useState<OfferItemForm[]>([]);
  const [availabilityRules, setAvailabilityRules] = useState<AvailabilityRule[]>([]);

  const normalizedCategory = category ? (OFFER_TYPE_MAP[category] ?? category) : '';
  const itemTypes = normalizedCategory ? (ITEM_TYPES_BY_CATEGORY[normalizedCategory] ?? []) : [];
  const activityGroups = normalizedCategory === 'activity' ? ACTIVITY_GROUPS.activity : [];
  const formFields = normalizedCategory ? (CATEGORY_FORM_FIELDS[normalizedCategory] ?? []) : [];
  const isActivity = normalizedCategory === 'activity' || normalizedCategory === 'eco_tour';
  const isAccommodation = normalizedCategory === 'accommodation';
  const isEvent = normalizedCategory === 'event';
  const hasMeetingPoint = formFields.includes('meeting_point');

  const inputClass = "w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all";

  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = "0px";
    return () => { document.body.style.overflow = ""; document.body.style.paddingRight = ""; };
  }, []);

  useEffect(() => {
    if (!editOffer) return;
    setCategory(editOffer.offer_type || editOffer.category?.slug || "");
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
    setImages(editOffer.images || []);
    setInclusions(editOffer.inclusions || "");
    setCancellationPolicy(editOffer.cancellation_policy || "");

    if (editOffer.items?.length) {
      setItems(editOffer.items.map((it: any) => ({
        id: it.id,
        name: it.name || "",
        description: it.description || "",
        item_type: it.item_type || "",
        room_sub_type: it.details_json?.room_sub_type || "",
        bed_count: it.details_json?.bed_count?.toString() || "",
        tent_capacity: it.details_json?.tent_capacity?.toString() || "",
        difficulty_level: it.details_json?.difficulty_level || "",
        duration_hours: it.details_json?.duration_hours?.toString() || "",
        distance_km: it.details_json?.distance_km?.toString() || "",
        activity_custom_name: it.details_json?.activity_custom_name || "",
        prices: it.prices?.length
          ? it.prices.map((p: any) => ({ id: p.id, label: p.label || "", price: p.price?.toString() || "", currency: p.currency || "TND", pricing_unit: p.pricing_unit || "per_person", is_default: p.is_default ?? false }))
          : [{ label: "Plein tarif", price: "", currency: "TND", pricing_unit: "per_person", is_default: true }],
      })));
    }

    if (editOffer.items?.[0]?.availabilityRules?.length) {
      setAvailabilityRules(editOffer.items[0].availabilityRules.map((r: any) => ({
        availability_type: r.availability_type,
        start_date: r.start_date || null,
        end_date: r.end_date || null,
        weekdays: r.weekdays || null,
        start_time: r.start_time || null,
        end_time: r.end_time || null,
        recurrence_rule: r.recurrence_rule || null,
      })));
    }
  }, [editOffer]);

  useEffect(() => {
    if (category && items.length === 0 && !isEdit) {
      const autoName = itemTypes[0]?.label ?? "";
      setItems([{
        name: autoName,
        description: "",
        item_type: itemTypes[0]?.value ?? "",
        room_sub_type: "",
        bed_count: "",
        tent_capacity: "",
        difficulty_level: "",
        duration_hours: "",
        distance_km: "",
        activity_custom_name: "",
        prices: [{ label: "Plein tarif", price: "", currency: "TND", pricing_unit: "per_person", is_default: true }],
      }]);
    }
  }, [category]);

  const currentItemType = items[0]?.item_type ?? "";
  const isOtherActivity = currentItemType === "other";

  function updateFirstItem(field: keyof OfferItemForm, value: any) {
    const updated = [...items];
    (updated[0] as any)[field] = value;
    setItems(updated);
  }

  function handleItemTypeChange(value: string) {
    const typeInfo = itemTypes.find(t => t.value === value) ?? activityGroups.flatMap(g => g.types).find(t => t.value === value);
    const autoName = value === "other" ? "" : (typeInfo?.label ?? "");
    updateFirstItem("item_type", value);
    updateFirstItem("name", autoName);
    if (value !== "other") updateFirstItem("activity_custom_name", "");
    if (!hasDifficulty(value)) updateFirstItem("difficulty_level", "");
  }

  function addItemPrice() {
    const updated = [...items];
    updated[0].prices.push({ label: "", price: "", currency: "TND", pricing_unit: "per_person", is_default: false });
    setItems(updated);
  }

  function removeItemPrice(idx: number) {
    const updated = [...items];
    updated[0].prices = updated[0].prices.filter((_, i) => i !== idx);
    setItems(updated);
  }

  function updateItemPrice(idx: number, field: string, value: any) {
    const updated = [...items];
    (updated[0].prices[idx] as any)[field] = value;
    setItems(updated);
  }

  function buildDetailsJson(): Record<string, any> | undefined {
    const item = items[0];
    if (!item) return undefined;
    const details: Record<string, any> = {};

    if (isAccommodation) {
      if (item.item_type === 'room') {
        if (item.room_sub_type) details.room_sub_type = item.room_sub_type;
        if (item.bed_count) details.bed_count = Number(item.bed_count);
      } else if (item.item_type === 'camping_space') {
        if (item.tent_capacity) details.tent_capacity = Number(item.tent_capacity);
      }
    }

    if (isActivity || normalizedCategory === 'workshop') {
      if (item.duration_hours) details.duration_hours = Number(item.duration_hours);
      if (item.difficulty_level) details.difficulty_level = item.difficulty_level;
      if (item.distance_km) details.distance_km = Number(item.distance_km);
      if (isOtherActivity && item.activity_custom_name) details.activity_custom_name = item.activity_custom_name;
    }

    if (isEvent) {
      const activeRule = availabilityRules[0];
      if (activeRule?.start_date) details.event_start = activeRule.start_date;
      if (activeRule?.end_date) details.event_end = activeRule.end_date;
    }

    return Object.keys(details).length > 0 ? details : undefined;
  }

  function formatDuration(): string {
    const item = items[0];
    if (!item?.duration_hours) return "";
    const h = Number(item.duration_hours);
    if (h < 1) return `${Math.round(h * 60)} min`;
    if (h < 4) return `${h} h`;
    if (h <= 6) return "Demi-journée";
    if (h <= 10) return "Journée";
    return `${Math.round(h / 8)} jours`;
  }

  function getDefaultPricingUnit(): string {
    if (isAccommodation) return "per_night";
    if (normalizedCategory === 'transport') return "per_trip";
    if (normalizedCategory === 'restaurant') return "per_meal";
    if (normalizedCategory === 'craft') return "per_item";
    return "per_person";
  }

  function getDefaultPriceLabel(): string {
    if (isAccommodation) return "Par nuit";
    if (normalizedCategory === 'transport') return "Par trajet";
    if (normalizedCategory === 'restaurant') return "Par repas";
    return "Par personne";
  }

  async function handleSubmit() {
    if (!title.trim()) { setError("Le titre est obligatoire."); return; }
    if (!category) { setError("Choisissez une catégorie."); return; }

    setLoading(true);
    setError("");
    try {
      const defaultUnit = getDefaultPricingUnit();
      const defaultLabel = getDefaultPriceLabel();

      const offerData: any = {
        title: title.trim(),
        offer_type: category,
        description: description.trim() || shortDesc.trim() || undefined,
        region: region.trim() || undefined,
        address: address.trim() || undefined,
        latitude: lat ?? undefined,
        longitude: lng ?? undefined,
        meeting_point: meetingPoint.trim() || undefined,
        meeting_lat: meetingLat ?? undefined,
        meeting_lng: meetingLng ?? undefined,
        confirmation_mode: confirmationMode,
        min_group_size: minGroupSize ? Number(minGroupSize) : undefined,
        max_group_size: maxGroupSize ? Number(maxGroupSize) : undefined,
        min_age: minAge ? Number(minAge) : undefined,
        images: images.length > 0 ? images : undefined,
        inclusions: inclusions.trim() || undefined,
        cancellation_policy: cancellationPolicy.trim() || undefined,
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

      const item = items[0];
      if (item?.name.trim()) {
        const itemData: any = {
          name: isOtherActivity && item.activity_custom_name ? item.activity_custom_name : item.name,
          description: item.description.trim() || undefined,
          item_type: item.item_type || undefined,
          details_json: buildDetailsJson(),
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
            const pricePayload: any = {
              label: price.label || defaultLabel,
              price: Number(price.price),
              currency: price.currency || "TND",
              pricing_unit: price.pricing_unit || defaultUnit,
              is_default: price.is_default,
            };
            if (price.id) {
              await apiFetch(`/offers/items/prices/${price.id}`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` },
                body: JSON.stringify(pricePayload),
              }).catch(() => {});
            } else {
              await apiFetch(`/offers/items/${createdItem.id}/prices`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: JSON.stringify(pricePayload),
              }).catch(() => {});
            }
          }

          for (const rule of availabilityRules) {
            await apiFetch(`/offers/items/${createdItem.id}/availability`, {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
              body: JSON.stringify(rule),
            }).catch(() => {});
          }
        }
      }

      onSuccess(resultOffer);
    } catch (err: any) {
      setError(err.message || `Erreur lors de la ${isEdit ? "modification" : "création"}.`);
    } finally {
      setLoading(false);
    }
  }

  function goNext() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setError("");
    setStep(Math.min(step + 1, TOTAL_STEPS));
  }

  function goBack() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setError("");
    setStep(Math.max(step - 1, isEdit ? 2 : 1));
  }

  function renderPriceUnitSelect(value: string, onChange: (v: string) => void) {
    return (
      <select className={`${inputClass} text-[11px]`} value={value} onChange={(e) => onChange(e.target.value)}>
        {PRICING_UNITS.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
      </select>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center pt-[5vh] sm:pt-[8vh] px-4" onClick={onClose}>
      <div className="modal-content bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            {step > (isEdit ? 2 : 1) && (
              <button onClick={goBack} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                <ArrowLeft size={18} />
              </button>
            )}
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">{isEdit ? "Modifier l'offre" : "Nouvelle offre"}</h2>
              <p className="text-xs text-slate-400">Étape {isEdit ? step - 1 : step}/{isEdit ? TOTAL_STEPS - 1 : TOTAL_STEPS} — {STEP_LABELS[step]}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400"><X size={18} /></button>
        </div>

        {/* Progress */}
        <div className="px-6 pt-4">
          <div className="flex gap-2">
            {(isEdit ? [2,3,4,5,6,7,8,9] : [1,2,3,4,5,6,7,8,9]).map((s) => (
              <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? "bg-primary" : "bg-slate-100"}`} />
            ))}
          </div>
        </div>

        <div className="p-6">

          {/* STEP 1: Category */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800">Choisir la catégorie</h3>
              <div className="grid grid-cols-2 gap-3">
                {availableCategories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => { setCategory(cat.value); goNext(); }}
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

          {/* STEP 2: General Info (MINIMAL) */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800">Informations générales</h3>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Titre de l'offre *</label>
                <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Eco Lodge Sahara, Randonnée Jbel Zaghouan..." />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Description courte</label>
                <input className={inputClass} value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} placeholder="Un résumé en une phrase (160 caractères max)" maxLength={160} />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Description détaillée</label>
                <textarea className={`${inputClass} resize-none`} value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Décrivez l'expérience en détail..." />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Région</label>
                  <input className={inputClass} value={region} onChange={(e) => setRegion(e.target.value)} placeholder="Djerba, Tozeur, Tunis..." />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Adresse</label>
                  <input className={inputClass} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Adresse complète" />
                </div>
              </div>

              {/* Confirmation mode - moved here compact */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Mode de confirmation</label>
                <select className={inputClass} value={confirmationMode} onChange={(e) => setConfirmationMode(e.target.value)}>
                  <option value="automatic">Automatique (réservation instantanée)</option>
                  <option value="manual">Manuelle (je valide chaque réservation)</option>
                </select>
              </div>

              {error && <p className="text-sm text-red-500 font-semibold">{error}</p>}

              <div className="flex gap-3 pt-2">
                {!isEdit && <button onClick={goBack} className="flex-1 py-3 border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50">Retour</button>}
                <button onClick={() => { if (!title.trim()) { setError("Le titre est obligatoire."); return; } goNext(); }} className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-emerald-600 flex items-center justify-center gap-2">
                  Suivant <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Item intelligent */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800">
                {isActivity ? "Type d'activité" : isAccommodation ? "Type d'hébergement" : isEvent ? "Type d'événement" : "Élément réservable"}
              </h3>

              {/* Type selector with groups for activities */}
              {isActivity ? (
                <div className="space-y-3">
                  {activityGroups.map((group) => (
                    <div key={group.label}>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{group.label}</p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {group.types.map((t) => {
                          const active = currentItemType === t.value;
                          return (
                            <button
                              key={t.value}
                              type="button"
                              onClick={() => handleItemTypeChange(t.value)}
                              className={`px-3 py-2 rounded-xl text-xs font-bold border-2 text-left transition-all ${active ? "bg-primary/10 border-primary text-slate-900" : "border-slate-100 text-slate-600 hover:border-primary/30"}`}
                            >
                              {t.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {/* "Autre" → custom name */}
                  {isOtherActivity && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500">Nom de l'activité *</label>
                      <input className={inputClass} value={items[0]?.activity_custom_name ?? ""} onChange={(e) => updateFirstItem("activity_custom_name", e.target.value)} placeholder="Ex: Cours de calligraphie arabe" />
                    </div>
                  )}

                  {/* Difficulty */}
                  {hasDifficulty(currentItemType) && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500">Niveau de difficulté</label>
                      <div className="flex gap-2">
                        {["easy", "moderate", "hard", "expert"].map((level) => {
                          const active = items[0]?.difficulty_level === level;
                          return (
                            <button
                              key={level}
                              type="button"
                              onClick={() => updateFirstItem("difficulty_level", level)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${active ? "bg-primary/10 border-primary" : "border-slate-100 text-slate-500"}`}
                            >
                              {level === "easy" ? "Facile" : level === "moderate" ? "Modéré" : level === "hard" ? "Difficile" : "Expert"}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Duration hours */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500">Durée estimée (heures)</label>
                    <div className="flex gap-2 items-center">
                      {[0.5, 1, 2, 3, 4, 6, 8].map((h) => {
                        const active = items[0]?.duration_hours === h.toString();
                        return (
                          <button
                            key={h}
                            type="button"
                            onClick={() => updateFirstItem("duration_hours", h.toString())}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${active ? "bg-primary/10 border-primary" : "border-slate-100 text-slate-500"}`}
                          >
                            {h < 1 ? `${Math.round(h * 60)}min` : h >= 8 ? `${h / 8}j` : `${h}h`}
                          </button>
                        );
                      })}
                      <input type="number" min="0" step="0.5" className={`${inputClass} w-20`} value={items[0]?.duration_hours ?? ""}
                        onChange={(e) => updateFirstItem("duration_hours", e.target.value)} placeholder="Autre" />
                    </div>
                  </div>

                  {/* Distance (optional) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500">Distance (km, optionnel)</label>
                    <input type="number" min="0" className={`${inputClass} w-32`} value={items[0]?.distance_km ?? ""}
                      onChange={(e) => updateFirstItem("distance_km", e.target.value)} placeholder="5 km" />
                  </div>
                </div>
              ) : (
                /* Non-activity: standard item_type dropdown */
                <>
                  <select className={inputClass} value={currentItemType} onChange={(e) => handleItemTypeChange(e.target.value)}>
                    <option value="">Type d'élément</option>
                    {itemTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>

                  {isAccommodation && currentItemType === 'room' && (
                    <div className="grid grid-cols-2 gap-2">
                      <select className={inputClass} value={items[0]?.room_sub_type ?? ""} onChange={(e) => updateFirstItem("room_sub_type", e.target.value)}>
                        <option value="">Sous-type chambre</option>
                        {ROOM_SUB_TYPES.map((t) => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
                      </select>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400">Nombre de lits</label>
                        <input type="number" min="1" className={inputClass} value={items[0]?.bed_count ?? ""} onChange={(e) => updateFirstItem("bed_count", e.target.value)} placeholder="2" />
                      </div>
                    </div>
                  )}

                  {isAccommodation && currentItemType === 'camping_space' && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400">Capacité tente (pers.)</label>
                      <input type="number" min="1" className={`${inputClass} w-48`} value={items[0]?.tent_capacity ?? ""} onChange={(e) => updateFirstItem("tent_capacity", e.target.value)} placeholder="4" />
                    </div>
                  )}

                  {/* Item name - shown for non-activity or when auto-name is overridden */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500">Nom de l'élément</label>
                    <input className={inputClass} value={items[0]?.name ?? ""} onChange={(e) => updateFirstItem("name", e.target.value)} placeholder="Nom" />
                  </div>
                </>
              )}

              {/* Item description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Description de l'élément (optionnel)</label>
                <textarea className={`${inputClass} resize-none`} value={items[0]?.description ?? ""} onChange={(e) => updateFirstItem("description", e.target.value)} rows={2} placeholder="Précisions sur l'activité..." />
              </div>

              {error && <p className="text-sm text-red-500 font-semibold">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button onClick={goBack} className="flex-1 py-3 border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50">Retour</button>
                <button onClick={() => { if (!items[0]?.name.trim() && !isOtherActivity) { setError("Le nom de l'élément est obligatoire."); return; } if (isOtherActivity && !items[0]?.activity_custom_name.trim()) { setError("Le nom de l'activité est obligatoire."); return; } goNext(); }} className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-emerald-600 flex items-center justify-center gap-2">
                  Suivant <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Pricing */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800">Tarifs</h3>
              <p className="text-xs text-slate-400">Définissez le prix de base et les variations (adulte, enfant, étudiant...)</p>

              {items[0]?.prices.map((price, idx) => (
                <div key={idx} className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">Tarif {idx + 1}{price.is_default ? " (par défaut)" : ""}</span>
                    {items[0].prices.length > 1 && (
                      <button onClick={() => removeItemPrice(idx)} className="p-1 text-slate-400 hover:text-red-500"><Trash2 size={14} /></button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <input className={`${inputClass} flex-1`} value={price.label} onChange={(e) => updateItemPrice(idx, "label", e.target.value)}
                      placeholder="Ex: Plein tarif, Enfant (6-12)" />
                    <input type="number" min="0" step="0.5" className={`${inputClass} w-28`} value={price.price}
                      onChange={(e) => updateItemPrice(idx, "price", e.target.value)} placeholder="0" />
                    <span className="text-xs text-slate-400 font-bold">TND</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <select className={inputClass} value={price.pricing_unit} onChange={(e) => updateItemPrice(idx, "pricing_unit", e.target.value)}>
                      {PRICING_UNITS.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
                    </select>
                    <label className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                      <input type="checkbox" checked={price.is_default} onChange={(e) => updateItemPrice(idx, "is_default", e.target.checked)} className="rounded" />
                      Tarif par défaut
                    </label>
                  </div>
                </div>
              ))}

              <button onClick={addItemPrice} className="w-full py-2.5 border-2 border-dashed border-slate-200 rounded-xl text-xs font-bold text-slate-400 hover:border-primary/30 hover:text-primary transition-all flex items-center justify-center gap-1">
                <Plus size={14} /> Ajouter un tarif (enfant, étudiant, groupe...)
              </button>

              {error && <p className="text-sm text-red-500 font-semibold">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button onClick={goBack} className="flex-1 py-3 border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50">Retour</button>
                <button onClick={goNext} className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-emerald-600 flex items-center justify-center gap-2">
                  Suivant <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Smart Calendar */}
          {step === 5 && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800">Disponibilités et Calendrier</h3>
              <p className="text-xs text-slate-400">Définissez quand votre offre est disponible</p>

              <SmartDatePicker rules={availabilityRules} onChange={setAvailabilityRules} />

              {error && <p className="text-sm text-red-500 font-semibold">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button onClick={goBack} className="flex-1 py-3 border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50">Retour</button>
                <button onClick={goNext} className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-emerald-600 flex items-center justify-center gap-2">
                  Suivant <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: Capacity */}
          {step === 6 && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800">Capacité</h3>
              <p className="text-xs text-slate-400">Définissez les limites de participants</p>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Participants minimum</label>
                  <input type="number" min="1" className={inputClass} value={minGroupSize} onChange={(e) => setMinGroupSize(e.target.value)} placeholder="1" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Participants maximum</label>
                  <input type="number" min="1" className={inputClass} value={maxGroupSize} onChange={(e) => setMaxGroupSize(e.target.value)} placeholder="20" />
                </div>
              </div>

              {!isAccommodation && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Âge minimum</label>
                  <input type="number" min="0" className={`${inputClass} w-32`} value={minAge} onChange={(e) => setMinAge(e.target.value)} placeholder="0" />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Inclus dans l'offre</label>
                <textarea className={`${inputClass} resize-none`} value={inclusions} onChange={(e) => setInclusions(e.target.value)} rows={2} placeholder="Matériel, guide, repas, transport..." />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Politique d'annulation</label>
                <textarea className={`${inputClass} resize-none`} value={cancellationPolicy} onChange={(e) => setCancellationPolicy(e.target.value)} rows={2} placeholder="Remboursable 48h avant..." />
              </div>

              {error && <p className="text-sm text-red-500 font-semibold">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button onClick={goBack} className="flex-1 py-3 border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50">Retour</button>
                <button onClick={goNext} className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-emerald-600 flex items-center justify-center gap-2">
                  Suivant <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 7: Map (always visible) */}
          {step === 7 && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800">Localisation</h3>
              <p className="text-xs text-slate-400">Placez votre offre sur la carte</p>

              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <MapPicker
                  lat={lat ?? 33.8869}
                  lng={lng ?? 9.5375}
                  onPick={(la, ln) => { setLat(la); setLng(ln); }}
                />
              </div>

              {hasMeetingPoint && (
                <div className="space-y-3 border-t border-slate-100 pt-4">
                  <h4 className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                    <MapPin size={14} /> Point de rendez-vous
                  </h4>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500">Lieu de rendez-vous</label>
                    <input className={inputClass} value={meetingPoint} onChange={(e) => setMeetingPoint(e.target.value)} placeholder="Ex: Devant l'hôtel, place centrale..." />
                  </div>
                  <div className="overflow-hidden rounded-2xl border border-slate-200">
                    <MapPicker
                      lat={meetingLat ?? lat ?? 33.8869}
                      lng={meetingLng ?? lng ?? 9.5375}
                      onPick={(la, ln) => { setMeetingLat(la); setMeetingLng(ln); }}
                    />
                  </div>
                </div>
              )}

              {error && <p className="text-sm text-red-500 font-semibold">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button onClick={goBack} className="flex-1 py-3 border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50">Retour</button>
                <button onClick={goNext} className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-emerald-600 flex items-center justify-center gap-2">
                  Suivant <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 8: Images */}
          {step === 8 && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800">Images</h3>
              <p className="text-xs text-slate-400">Ajoutez au moins 3 photos pour mettre en valeur votre offre</p>

              <ImageUploader images={images} onChange={setImages} maxImages={10} label="Photos de l'offre" />

              {images.length > 0 && images.length < 3 && (
                <p className="text-[10px] text-amber-600 font-medium">💡 Ajoutez au moins 3 images pour un meilleur affichage</p>
              )}

              {error && <p className="text-sm text-red-500 font-semibold">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button onClick={goBack} className="flex-1 py-3 border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50">Retour</button>
                <button onClick={goNext} className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-emerald-600 flex items-center justify-center gap-2">
                  Suivant <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 9: Preview + Publish */}
          {step === 9 && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800">Aperçu et publication</h3>

              {/* Preview card */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                {images.length > 0 && (
                  <div className="h-40 bg-gradient-to-br from-emerald-100 to-teal-200">
                    <img src={images[0]} alt={title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-4 space-y-2">
                  <h4 className="font-bold text-slate-800 text-lg">{title || "Titre de l'offre"}</h4>
                  {region && <p className="text-xs text-slate-500 flex items-center gap-1"><MapPin size={12} /> {region}</p>}
                  <div className="flex flex-wrap gap-2">
                    {items[0]?.duration_hours && (
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Clock size={10} /> {formatDuration()}
                      </span>
                    )}
                    {items[0]?.difficulty_level && (
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                        {items[0].difficulty_level === "easy" ? "Facile" : items[0].difficulty_level === "moderate" ? "Modéré" : items[0].difficulty_level === "hard" ? "Difficile" : "Expert"}
                      </span>
                    )}
                    {minGroupSize && maxGroupSize && (
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                        👥 {minGroupSize}-{maxGroupSize} pers.
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    {items[0]?.prices?.[0]?.price ? (
                      <span className="font-bold text-emerald-600 text-sm">{Number(items[0].prices[0].price).toLocaleString()} TND <span className="text-[10px] font-medium text-slate-400">/{items[0].prices[0].pricing_unit?.replace('per_', '')}</span></span>
                    ) : (
                      <span className="text-xs text-slate-400">Prix non défini</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Options */}
              <div className="bg-slate-50 rounded-2xl p-4 space-y-2 text-sm">
                <label className="flex items-center gap-2 font-medium text-slate-700">
                  <input type="checkbox" defaultChecked className="rounded text-primary" />
                  Publier immédiatement (visible dans les résultats de recherche)
                </label>
                <label className="flex items-center gap-2 font-medium text-slate-700">
                  <input type="checkbox" className="rounded text-primary" />
                  Enregistrer comme brouillon (modifiable plus tard)
                </label>
              </div>

              {error && <p className="text-sm text-red-500 font-semibold">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button onClick={goBack} className="flex-1 py-3 border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50">Retour</button>
                <button onClick={handleSubmit} disabled={loading} className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-emerald-600 flex items-center justify-center gap-2 disabled:opacity-50">
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  {loading ? "Publication..." : (isEdit ? "Modifier l'offre" : "Publier l'offre")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}