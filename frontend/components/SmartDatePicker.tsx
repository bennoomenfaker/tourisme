"use client";

import { useState } from "react";
import { Calendar, Clock, Repeat, X, Plus } from "lucide-react";

interface AvailabilityRule {
  availability_type: string;
  start_date: string | null;
  end_date: string | null;
  weekdays: number[] | null;
  start_time: string | null;
  end_time: string | null;
  recurrence_rule: string | null;
}

interface SmartDatePickerProps {
  rules: AvailabilityRule[];
  onChange: (rules: AvailabilityRule[]) => void;
}

const WEEKDAY_NAMES = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

const PRESETS = [
  { label: "Date unique", icon: "📅", type: "single" },
  { label: "Plusieurs dates", icon: "📆", type: "multiple" },
  { label: "Chaque semaine", icon: "🔄", type: "weekly" },
  { label: "Période saisonnière", icon: "🌊", type: "seasonal" },
  { label: "Chaque année", icon: "🎉", type: "yearly" },
  { label: "Personnalisé", icon: "⚙️", type: "custom" },
] as const;

type PresetType = typeof PRESETS[number]["type"];

function DateRangePicker({ rule, onChange }: { rule: AvailabilityRule; onChange: (r: AvailabilityRule) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <div>
        <label className="text-[10px] text-slate-400 mb-0.5 block">Du</label>
        <input
          type="date"
          value={rule.start_date ?? ""}
          onChange={(e) => onChange({ ...rule, start_date: e.target.value || null })}
          className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-300"
        />
      </div>
      <div>
        <label className="text-[10px] text-slate-400 mb-0.5 block">Au</label>
        <input
          type="date"
          value={rule.end_date ?? ""}
          onChange={(e) => onChange({ ...rule, end_date: e.target.value || null })}
          className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-300"
        />
      </div>
    </div>
  );
}

function WeekdayPicker({ rule, onChange }: { rule: AvailabilityRule; onChange: (r: AvailabilityRule) => void }) {
  const selected = rule.weekdays ?? [];
  const toggle = (day: number) => {
    const next = selected.includes(day) ? selected.filter((d) => d !== day) : [...selected, day].sort();
    onChange({ ...rule, weekdays: next.length ? next : null });
  };

  return (
    <div className="flex gap-1">
      {WEEKDAY_NAMES.map((name, i) => (
        <button
          key={i}
          type="button"
          onClick={() => toggle(i)}
          className={`w-8 h-8 rounded-lg text-[10px] font-bold transition-colors ${
            selected.includes(i)
              ? "bg-primary text-white"
              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
          }`}
        >
          {name}
        </button>
      ))}
    </div>
  );
}

function TimeRangePicker({ rule, onChange }: { rule: AvailabilityRule; onChange: (r: AvailabilityRule) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <div>
        <label className="text-[10px] text-slate-400 mb-0.5 flex items-center gap-1"><Clock size={10} /> Début</label>
        <input
          type="time"
          value={rule.start_time ?? ""}
          onChange={(e) => onChange({ ...rule, start_time: e.target.value || null })}
          className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-300"
        />
      </div>
      <div>
        <label className="text-[10px] text-slate-400 mb-0.5 flex items-center gap-1"><Clock size={10} /> Fin</label>
        <input
          type="time"
          value={rule.end_time ?? ""}
          onChange={(e) => onChange({ ...rule, end_time: e.target.value || null })}
          className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-300"
        />
      </div>
    </div>
  );
}

function SingleDatePicker({ rule, onChange }: { rule: AvailabilityRule; onChange: (r: AvailabilityRule) => void }) {
  return (
    <div className="space-y-2">
      <div>
        <label className="text-[10px] text-slate-400 mb-0.5 block">Date</label>
        <input
          type="date"
          value={rule.start_date ?? ""}
          onChange={(e) => onChange({ ...rule, start_date: e.target.value || null, end_date: e.target.value || null })}
          className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-300"
        />
      </div>
      <TimeRangePicker rule={rule} onChange={onChange} />
    </div>
  );
}

function SeasonalPicker({ rule, onChange }: { rule: AvailabilityRule; onChange: (r: AvailabilityRule) => void }) {
  return (
    <div className="space-y-2">
      <DateRangePicker rule={rule} onChange={onChange} />
      <div className="space-y-1">
        <label className="text-[10px] text-slate-400 block">Jours disponibles</label>
        <WeekdayPicker rule={rule} onChange={onChange} />
      </div>
      <TimeRangePicker rule={rule} onChange={onChange} />
    </div>
  );
}

function YearlyPicker({ rule, onChange }: { rule: AvailabilityRule; onChange: (r: AvailabilityRule) => void }) {
  return (
    <div className="space-y-2">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
        <p className="text-[10px] text-amber-700 font-medium">
          📅 Chaque année — Les dates seront répétées automatiquement
        </p>
      </div>
      <DateRangePicker rule={rule} onChange={onChange} />
      <TimeRangePicker rule={rule} onChange={onChange} />
    </div>
  );
}

export default function SmartDatePicker({ rules, onChange }: SmartDatePickerProps) {
  const [activePreset, setActivePreset] = useState<PresetType>("single");
  const [showPresets, setShowPresets] = useState(true);

  const createRule = (type: PresetType): AvailabilityRule => {
    const now = new Date().toISOString().split("T")[0];
    const base: AvailabilityRule = {
      availability_type: "custom",
      start_date: null,
      end_date: null,
      weekdays: null,
      start_time: null,
      end_time: null,
      recurrence_rule: null,
    };

    switch (type) {
      case "single":
        return { ...base, availability_type: "date_range", start_date: now, end_date: now };
      case "multiple":
        return { ...base, availability_type: "date_range", start_date: now, end_date: now };
      case "weekly":
        return { ...base, availability_type: "weekly", weekdays: [6], start_time: "09:00", end_time: "17:00" };
      case "seasonal":
        return { ...base, availability_type: "date_range", start_date: now, end_date: now, weekdays: [6, 0], start_time: "08:00", end_time: "18:00" };
      case "yearly":
        return { ...base, availability_type: "yearly", start_date: now, end_date: now, recurrence_rule: "FREQ=YEARLY" };
      default:
        return base;
    }
  };

  const handlePresetSelect = (type: PresetType) => {
    setActivePreset(type);
    if (type === "multiple") {
      onChange([createRule("single")]);
    } else {
      onChange([createRule(type)]);
    }
    setShowPresets(false);
  };

  const handleUpdateRule = (index: number, updated: AvailabilityRule) => {
    const next = [...rules];
    next[index] = updated;
    onChange(next);
  };

  const addRule = () => {
    onChange([...rules, createRule("single")]);
  };

  const removeRule = (index: number) => {
    if (rules.length <= 1) return;
    onChange(rules.filter((_, i) => i !== index));
  };

  const getPresetLabel = (rule: AvailabilityRule): string => {
    switch (rule.availability_type) {
      case "weekly": return "🔄 Hebdomadaire";
      case "yearly": return "🎉 Annuel";
      case "date_range":
        if (rule.weekdays?.length) return "🌊 Saisonnière";
        if (rule.start_date === rule.end_date) return "📅 Date unique";
        return "📆 Période";
      default: return "⚙️ Personnalisé";
    }
  };

  if (showPresets) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
          <Calendar size={14} /> Disponibilité
        </label>
        <div className="grid grid-cols-3 gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.type}
              type="button"
              onClick={() => handlePresetSelect(p.type)}
              className="flex flex-col items-center gap-1 p-3 rounded-xl border border-slate-200 hover:border-primary hover:bg-primary/5 transition-all text-center"
            >
              <span className="text-lg">{p.icon}</span>
              <span className="text-[10px] font-semibold text-slate-600">{p.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
          <Calendar size={14} /> Disponibilité
        </label>
        <button
          type="button"
          onClick={() => setShowPresets(true)}
          className="text-[10px] text-primary hover:text-emerald-700 font-medium"
        >
          Changer le type
        </button>
      </div>

      {rules.map((rule, idx) => (
        <div key={idx} className="bg-slate-50 rounded-xl p-3 space-y-2 border border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500">
              {getPresetLabel(rule)} {rules.length > 1 ? `#${idx + 1}` : ""}
            </span>
            {rules.length > 1 && (
              <button type="button" onClick={() => removeRule(idx)} className="text-slate-400 hover:text-red-500">
                <X size={12} />
              </button>
            )}
          </div>

          {(activePreset === "single" || rule.availability_type === "date_range" && rule.start_date === rule.end_date) && (
            <SingleDatePicker rule={rule} onChange={(r) => handleUpdateRule(idx, r)} />
          )}

          {activePreset === "seasonal" && (
            <SeasonalPicker rule={rule} onChange={(r) => handleUpdateRule(idx, r)} />
          )}

          {activePreset === "weekly" && (
            <div className="space-y-2">
              <WeekdayPicker rule={rule} onChange={(r) => handleUpdateRule(idx, r)} />
              <TimeRangePicker rule={rule} onChange={(r) => handleUpdateRule(idx, r)} />
            </div>
          )}

          {activePreset === "yearly" && (
            <YearlyPicker rule={rule} onChange={(r) => handleUpdateRule(idx, r)} />
          )}

          {(activePreset === "custom" || activePreset === "multiple") && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 mb-0.5 block">Type</label>
                  <select
                    value={rule.availability_type}
                    onChange={(e) => handleUpdateRule(idx, { ...rule, availability_type: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  >
                    <option value="date_range">Période</option>
                    <option value="weekly">Hebdomadaire</option>
                    <option value="daily">Quotidien</option>
                    <option value="weekend_only">Weekends</option>
                    <option value="yearly">Annuel</option>
                    <option value="custom">Personnalisé</option>
                  </select>
                </div>
                <div />
              </div>
              <DateRangePicker rule={rule} onChange={(r) => handleUpdateRule(idx, r)} />
              <WeekdayPicker rule={rule} onChange={(r) => handleUpdateRule(idx, r)} />
              <TimeRangePicker rule={rule} onChange={(r) => handleUpdateRule(idx, r)} />
            </div>
          )}
        </div>
      ))}

      {activePreset === "multiple" && (
        <button
          type="button"
          onClick={addRule}
          className="flex items-center gap-1 text-xs text-primary hover:text-emerald-700 font-medium"
        >
          <Plus size={12} /> Ajouter une date
        </button>
      )}
    </div>
  );
}
