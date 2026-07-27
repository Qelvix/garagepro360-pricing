"use client";

import { useMemo, useState } from "react";
import {
  GMS_TIERS,
  INTEGRATED_ADDONS,
  SMS_WHATSAPP_LEVELS,
  PAYMENT_GATEWAY_LEVELS,
  HRMS_PER_EMPLOYEE,
  formatInr,
  inrToUsd,
  type IntegratedAddOnLevel,
} from "@/lib/pricing-data";

type IntegratedState = Record<string, { enabled: boolean; level: string; extraGb: number }>;

function findLevel(levels: IntegratedAddOnLevel[], level: string) {
  return levels.find((l) => l.level === level) ?? levels[0];
}

// Approximate mid-range overage rates for SMS/WhatsApp (guide gives a range, not per-level exact figures)
const SMS_OVERAGE = 0.2;
const WA_UTIL_OVERAGE = 0.17;
const WA_MKT_OVERAGE = 1.0;

const DVI_OVERAGE_RATE: Record<string, number> = {
  Lite: 40,
  Standard: 35,
  Pro: 30,
  Scale: 25,
};

const PAYMENT_GATEWAY_META: Record<
  string,
  { txnFeePct: number; includedLakh: number | null; overagePct: number | null }
> = {
  Lite: { txnFeePct: 2.4, includedLakh: 2, overagePct: 2.4 },
  Standard: { txnFeePct: 2.0, includedLakh: 5, overagePct: 1.8 },
  Pro: { txnFeePct: 1.7, includedLakh: 15, overagePct: 1.5 },
  Enterprise: { txnFeePct: 1.35, includedLakh: null, overagePct: null },
};

export default function PricingCalculator() {
  const [tierId, setTierId] = useState(GMS_TIERS[1].id); // default to Accelerate (recommended)
  const tier = GMS_TIERS.find((t) => t.id === tierId)!;

  const [integrated, setIntegrated] = useState<IntegratedState>(() => {
    const initial: IntegratedState = {};
    INTEGRATED_ADDONS.forEach((a) => {
      initial[a.id] = { enabled: false, level: "Standard", extraGb: 0 };
    });
    return initial;
  });

  const [smsEnabled, setSmsEnabled] = useState(false);
  const [smsLevel, setSmsLevel] = useState("Standard");
  const [smsUsage, setSmsUsage] = useState({ sms: 0, waUtil: 0, waMkt: 0 });

  const [pgEnabled, setPgEnabled] = useState(false);
  const [pgLevel, setPgLevel] = useState("Standard");
  const [pgVolumeLakh, setPgVolumeLakh] = useState(0);

  const [hrmsEnabled, setHrmsEnabled] = useState(false);
  const [hrmsLevel, setHrmsLevel] = useState("Standard");
  const [employeeCount, setEmployeeCount] = useState(0);

  function setIntegratedField(id: string, patch: Partial<IntegratedState[string]>) {
    setIntegrated((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }

  const breakdown = useMemo(() => {
    const lines: { label: string; sub?: string; inr: number }[] = [];

    lines.push({ label: `GMS Subscription — ${tier.name}`, inr: tier.monthlyInr });

    INTEGRATED_ADDONS.forEach((addon) => {
      const state = integrated[addon.id];
      if (!state?.enabled) return;
      const levelData = findLevel(addon.levels, state.level);
      if (levelData.bundledInr == null) {
        lines.push({
          label: `${addon.name} — ${state.level}`,
          sub: "Custom Enterprise pricing (contact sales)",
          inr: 0,
        });
        return;
      }
      let cost = levelData.bundledInr;
      let sub = `${state.level} (bundled) · ${levelData.detail}`;
      if (addon.id === "dvi" && state.extraGb > 0) {
        const rate = DVI_OVERAGE_RATE[state.level] ?? 0;
        const overage = state.extraGb * rate;
        cost += overage;
        sub += ` + ${state.extraGb} GB overage @ ₹${rate}/GB`;
      }
      lines.push({ label: `${addon.name} — ${state.level}`, sub, inr: cost });
    });

    if (smsEnabled) {
      const levelData = SMS_WHATSAPP_LEVELS.find((l) => l.level === smsLevel)!;
      const [inclSms, inclWaUtil, inclWaMkt] = levelData.detail
        .split("·")
        .map((s) => parseInt(s.replace(/[^\d]/g, ""), 10) || 0);
      const overSms = Math.max(0, smsUsage.sms - inclSms) * SMS_OVERAGE;
      const overWaUtil = Math.max(0, smsUsage.waUtil - inclWaUtil) * WA_UTIL_OVERAGE;
      const overWaMkt = Math.max(0, smsUsage.waMkt - inclWaMkt) * WA_MKT_OVERAGE;
      const overageTotal = overSms + overWaUtil + overWaMkt;
      lines.push({
        label: `SMS & WhatsApp Suite — ${smsLevel}`,
        sub:
          overageTotal > 0
            ? `${levelData.detail} + est. overage`
            : levelData.detail,
        inr: levelData.feeInr + overageTotal,
      });
    }

    if (pgEnabled) {
      const meta = PAYMENT_GATEWAY_META[pgLevel];
      const levelData = PAYMENT_GATEWAY_LEVELS.find((l) => l.level === pgLevel)!;
      const volumeInr = pgVolumeLakh * 100000;
      let txnCost: number;
      let sub: string;
      if (meta.includedLakh == null || meta.overagePct == null) {
        txnCost = volumeInr * (meta.txnFeePct / 100);
        sub = `${levelData.detail} (custom volume)`;
      } else {
        const includedInr = meta.includedLakh * 100000;
        if (volumeInr <= includedInr) {
          txnCost = volumeInr * (meta.txnFeePct / 100);
        } else {
          txnCost =
            includedInr * (meta.txnFeePct / 100) +
            (volumeInr - includedInr) * (meta.overagePct / 100);
        }
        sub = levelData.detail;
      }
      lines.push({
        label: `Payment Gateway — ${pgLevel}`,
        sub,
        inr: levelData.feeInr + txnCost,
      });
    }

    if (hrmsEnabled) {
      const levelData = HRMS_PER_EMPLOYEE.find((l) => l.level === hrmsLevel)!;
      const computed = employeeCount * levelData.perEmployeeInr;
      const cost = Math.max(levelData.baseFeeInr, computed);
      lines.push({
        label: `HRMS & Payroll — ${hrmsLevel}`,
        sub: `${employeeCount} employees × ₹${levelData.perEmployeeInr} (₹${levelData.baseFeeInr} floor applies) · ${levelData.detail}`,
        inr: cost,
      });
    }

    const total = lines.reduce((sum, l) => sum + l.inr, 0);
    return { lines, total };
  }, [
    tier,
    integrated,
    smsEnabled,
    smsLevel,
    smsUsage,
    pgEnabled,
    pgLevel,
    pgVolumeLakh,
    hrmsEnabled,
    hrmsLevel,
    employeeCount,
  ]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
      <div className="space-y-10">
        {/* Tier selector */}
        <section id="tiers">
          <h2 className="text-xl font-semibold text-slate-900 mb-1">
            1. Choose your GMS subscription tier
          </h2>
          <p className="text-sm text-slate-500 mb-4">
            Every tier includes the complete job-card lifecycle. Higher tiers unlock
            deeper configuration, CRM/inventory, analytics, and faster support.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {GMS_TIERS.map((t) => {
              const active = t.id === tierId;
              return (
                <button
                  key={t.id}
                  onClick={() => setTierId(t.id)}
                  className={`text-left rounded-xl border p-4 transition cursor-pointer ${
                    active
                      ? "border-blue-600 bg-blue-50 ring-2 ring-blue-600"
                      : "border-slate-200 bg-white hover:border-blue-300"
                  }`}
                >
                  <div className="font-semibold text-slate-900">{t.name}</div>
                  <div className="text-lg font-bold text-blue-700 mt-1">
                    {formatInr(t.monthlyInr)}
                    {t.isCustom ? "+" : ""}
                    <span className="text-xs font-normal text-slate-500">/mo</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    ~${t.monthlyUsdApprox}
                    {t.isCustom ? "+" : ""}/mo
                  </div>
                  <div className="text-xs text-slate-600 mt-2 space-y-0.5">
                    <div>Users: {t.users}</div>
                    <div>Locations: {t.locations}</div>
                    <div>Job cards/mo: {t.jobCardsPerMonth}</div>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="mt-4 rounded-lg bg-white border border-slate-200 p-4">
            <div className="text-sm font-medium text-slate-900">{tier.name} includes:</div>
            <ul className="mt-2 text-sm text-slate-600 list-disc list-inside space-y-0.5">
              {tier.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
            <div className="text-xs text-slate-400 mt-2">Support: {tier.supportLevel}</div>
          </div>
        </section>

        {/* GMS-integrated add-ons */}
        <section id="integrated-addons">
          <h2 className="text-xl font-semibold text-slate-900 mb-1">
            2. GMS-integrated add-ons
          </h2>
          <p className="text-sm text-slate-500 mb-4">
            Bundled pricing gives an ~10% discount off standalone rates (~15% at
            Enterprise) as a loyalty benefit of your active GMS subscription.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {INTEGRATED_ADDONS.map((addon) => {
              const state = integrated[addon.id];
              const levelData = findLevel(addon.levels, state.level);
              return (
                <div
                  key={addon.id}
                  className={`rounded-xl border p-4 bg-white ${
                    state.enabled ? "border-blue-400" : "border-slate-200"
                  }`}
                >
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={state.enabled}
                      onChange={(e) =>
                        setIntegratedField(addon.id, { enabled: e.target.checked })
                      }
                      className="mt-1 h-4 w-4 accent-blue-600"
                    />
                    <div>
                      <div className="font-medium text-slate-900">{addon.name}</div>
                      <div className="text-xs text-slate-500">{addon.description}</div>
                    </div>
                  </label>

                  {state.enabled && (
                    <div className="mt-3 pl-7 space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {addon.levels.map((l) => (
                          <button
                            key={l.level}
                            onClick={() =>
                              setIntegratedField(addon.id, { level: l.level })
                            }
                            className={`text-xs rounded-full px-3 py-1 border cursor-pointer ${
                              state.level === l.level
                                ? "bg-blue-600 text-white border-blue-600"
                                : "border-slate-300 text-slate-600 hover:border-blue-400"
                            }`}
                          >
                            {l.level}
                          </button>
                        ))}
                      </div>
                      <div className="text-xs text-slate-500">{levelData.detail}</div>
                      <div className="text-sm">
                        {levelData.bundledInr == null ? (
                          <span className="text-amber-600 font-medium">
                            Custom Enterprise pricing — contact sales
                          </span>
                        ) : (
                          <>
                            <span className="font-semibold text-slate-900">
                              {formatInr(levelData.bundledInr)}/mo
                            </span>
                            <span className="text-slate-400 line-through ml-2">
                              {formatInr(levelData.standaloneInr!)}
                            </span>
                          </>
                        )}
                      </div>
                      {addon.id === "dvi" && levelData.bundledInr != null && (
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <span>Extra storage beyond included (GB):</span>
                          <input
                            type="number"
                            min={0}
                            value={state.extraGb}
                            onChange={(e) =>
                              setIntegratedField(addon.id, {
                                extraGb: Math.max(0, Number(e.target.value)),
                              })
                            }
                            className="w-20 rounded border border-slate-300 px-2 py-1"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Standalone add-ons */}
        <section id="standalone-addons">
          <h2 className="text-xl font-semibold text-slate-900 mb-1">
            3. Standalone add-ons
          </h2>
          <p className="text-sm text-slate-500 mb-4">
            Priced and billed independently of your GMS tier — no bundle discount, but
            no tier gating either.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* SMS & WhatsApp */}
            <div
              className={`rounded-xl border p-4 bg-white ${
                smsEnabled ? "border-blue-400" : "border-slate-200"
              }`}
            >
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={smsEnabled}
                  onChange={(e) => setSmsEnabled(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-blue-600"
                />
                <div>
                  <div className="font-medium text-slate-900">
                    SMS & WhatsApp Suite
                  </div>
                  <div className="text-xs text-slate-500">
                    Fixed fee + included message volume.
                  </div>
                </div>
              </label>
              {smsEnabled && (
                <div className="mt-3 pl-7 space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {SMS_WHATSAPP_LEVELS.map((l) => (
                      <button
                        key={l.level}
                        onClick={() => setSmsLevel(l.level)}
                        className={`text-xs rounded-full px-3 py-1 border cursor-pointer ${
                          smsLevel === l.level
                            ? "bg-blue-600 text-white border-blue-600"
                            : "border-slate-300 text-slate-600 hover:border-blue-400"
                        }`}
                      >
                        {l.level}
                      </button>
                    ))}
                  </div>
                  <div className="text-xs text-slate-500">
                    {SMS_WHATSAPP_LEVELS.find((l) => l.level === smsLevel)?.detail}
                  </div>
                  <div className="text-sm font-semibold text-slate-900">
                    {formatInr(
                      SMS_WHATSAPP_LEVELS.find((l) => l.level === smsLevel)!.feeInr
                    )}
                    /mo base
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-xs">
                    <label className="flex flex-col gap-1">
                      SMS/mo
                      <input
                        type="number"
                        min={0}
                        value={smsUsage.sms}
                        onChange={(e) =>
                          setSmsUsage((s) => ({ ...s, sms: Math.max(0, Number(e.target.value)) }))
                        }
                        className="w-full rounded border border-slate-300 px-1 py-1"
                      />
                    </label>
                    <label className="flex flex-col gap-1">
                      WA util
                      <input
                        type="number"
                        min={0}
                        value={smsUsage.waUtil}
                        onChange={(e) =>
                          setSmsUsage((s) => ({ ...s, waUtil: Math.max(0, Number(e.target.value)) }))
                        }
                        className="w-full rounded border border-slate-300 px-1 py-1"
                      />
                    </label>
                    <label className="flex flex-col gap-1">
                      WA mktg
                      <input
                        type="number"
                        min={0}
                        value={smsUsage.waMkt}
                        onChange={(e) =>
                          setSmsUsage((s) => ({ ...s, waMkt: Math.max(0, Number(e.target.value)) }))
                        }
                        className="w-full rounded border border-slate-300 px-1 py-1"
                      />
                    </label>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Overage estimated at approx. ₹0.20/SMS, ₹0.17/WA utility, ₹1.00/WA
                    marketing beyond included quota.
                  </div>
                </div>
              )}
            </div>

            {/* Payment Gateway */}
            <div
              className={`rounded-xl border p-4 bg-white ${
                pgEnabled ? "border-blue-400" : "border-slate-200"
              }`}
            >
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pgEnabled}
                  onChange={(e) => setPgEnabled(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-blue-600"
                />
                <div>
                  <div className="font-medium text-slate-900">
                    Payment Gateway Integration
                  </div>
                  <div className="text-xs text-slate-500">
                    Fixed fee + transaction percentage.
                  </div>
                </div>
              </label>
              {pgEnabled && (
                <div className="mt-3 pl-7 space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {PAYMENT_GATEWAY_LEVELS.map((l) => (
                      <button
                        key={l.level}
                        onClick={() => setPgLevel(l.level)}
                        className={`text-xs rounded-full px-3 py-1 border cursor-pointer ${
                          pgLevel === l.level
                            ? "bg-blue-600 text-white border-blue-600"
                            : "border-slate-300 text-slate-600 hover:border-blue-400"
                        }`}
                      >
                        {l.level}
                      </button>
                    ))}
                  </div>
                  <div className="text-xs text-slate-500">
                    {PAYMENT_GATEWAY_LEVELS.find((l) => l.level === pgLevel)?.detail}
                  </div>
                  <label className="flex flex-col gap-1 text-xs">
                    Monthly transaction volume (₹ lakh)
                    <input
                      type="number"
                      min={0}
                      step={0.5}
                      value={pgVolumeLakh}
                      onChange={(e) => setPgVolumeLakh(Math.max(0, Number(e.target.value)))}
                      className="w-full rounded border border-slate-300 px-2 py-1"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* HRMS */}
            <div
              className={`rounded-xl border p-4 bg-white ${
                hrmsEnabled ? "border-blue-400" : "border-slate-200"
              }`}
            >
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hrmsEnabled}
                  onChange={(e) => setHrmsEnabled(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-blue-600"
                />
                <div>
                  <div className="font-medium text-slate-900">HRMS & Payroll</div>
                  <div className="text-xs text-slate-500">
                    Base fee + per-employee rate (floor applies).
                  </div>
                </div>
              </label>
              {hrmsEnabled && (
                <div className="mt-3 pl-7 space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {HRMS_PER_EMPLOYEE.map((l) => (
                      <button
                        key={l.level}
                        onClick={() => setHrmsLevel(l.level)}
                        className={`text-xs rounded-full px-3 py-1 border cursor-pointer ${
                          hrmsLevel === l.level
                            ? "bg-blue-600 text-white border-blue-600"
                            : "border-slate-300 text-slate-600 hover:border-blue-400"
                        }`}
                      >
                        {l.level}
                      </button>
                    ))}
                  </div>
                  <div className="text-xs text-slate-500">
                    {HRMS_PER_EMPLOYEE.find((l) => l.level === hrmsLevel)?.detail}
                  </div>
                  <label className="flex flex-col gap-1 text-xs">
                    Number of employees
                    <input
                      type="number"
                      min={0}
                      value={employeeCount}
                      onChange={(e) => setEmployeeCount(Math.max(0, Number(e.target.value)))}
                      className="w-full rounded border border-slate-300 px-2 py-1"
                    />
                  </label>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Sticky summary panel */}
      <aside className="lg:sticky lg:top-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="font-semibold text-slate-900 mb-3">Your estimated monthly cost</h3>
        <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
          {breakdown.lines.map((line, i) => (
            <div key={i} className="text-sm border-b border-slate-100 pb-2">
              <div className="flex justify-between">
                <span className="text-slate-700">{line.label}</span>
                <span className="font-medium text-slate-900">
                  {line.inr > 0 ? formatInr(Math.round(line.inr)) : "—"}
                </span>
              </div>
              {line.sub && <div className="text-[11px] text-slate-400">{line.sub}</div>}
            </div>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t border-slate-200 flex items-baseline justify-between">
          <span className="font-semibold text-slate-900">Total / month</span>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-700">
              {formatInr(Math.round(breakdown.total))}
            </div>
            <div className="text-xs text-slate-400">
              ~${inrToUsd(breakdown.total).toLocaleString()}/mo
            </div>
          </div>
        </div>
        <p className="text-[11px] text-slate-400 mt-3">
          Estimate only. Custom/Enterprise line items are excluded from the total — contact
          sales for a negotiated quote.
        </p>
      </aside>
    </div>
  );
}
