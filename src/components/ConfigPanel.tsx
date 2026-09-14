import React from "react";
import { PanelShell, Chip } from "./PanelShell";
import { useStore } from "../lib/store";
import { useAuth } from "../lib/auth";
import { ACCENTS, type AccentKey } from "../lib/types";
import { MascotAvatar } from "./Mascot";
import { IconConfig, IconReset, IconSound, IconUser } from "./Icons";
import { sfx } from "../lib/sfx";

const Toggle: React.FC<{ label: string; hint: string; on: boolean; onChange: () => void }> = ({ label, hint, on, onChange }) => (
  <button
    type="button"
    onClick={onChange}
    className="group flex w-full items-center gap-3 rounded-2xl bg-gradient-to-b from-white/8 to-white/[0.02] p-3 text-left shadow-[inset_0_1px_0_rgba(255,255,255,.25)] transition-colors hover:from-white/14"
  >
    <div
      className={`relative h-7 w-12 shrink-0 rounded-full transition-all duration-300 ${
        on ? "bg-[rgb(var(--accent))] shadow-[0_0_18px_rgb(var(--accent)/.6)]" : "bg-black/70 shadow-[inset_0_2px_8px_rgba(0,0,0,.9),0_0_0_1px_rgba(255,255,255,.18)]"
      }`}
    >
      <span
        className={`absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-gradient-to-b from-white to-[#b9bfc7] shadow-[0_2px_6px_rgba(0,0,0,.7)] transition-all duration-300 ${on ? "left-[26px]" : "left-[3px]"}`}
      />
    </div>
    <div className="min-w-0">
      <p className="text-sm font-bold uppercase tracking-[0.16em] text-white/90">{label}</p>
      <p className="truncate text-[10px] uppercase tracking-[0.2em] text-white/35">{hint}</p>
    </div>
  </button>
);

export const ConfigPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { state, updateSettings, resetAll, syncing } = useStore();
  const { email, signOut } = useAuth();
  const s = state.settings;

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "y2k-street-hub-data.json";
    a.click();
    URL.revokeObjectURL(url);
    sfx.done();
  };

  const stats = [
    { k: "tasks", v: state.tasks.length },
    { k: "cleared", v: state.tasks.filter((t) => t.done).length },
    { k: "blocks", v: state.events.length },
    { k: "scratches", v: state.notes.length },
  ];

  return (
    <PanelShell
      title="config"
      kicker="module 04 — settings / system"
      icon={<IconConfig className="h-full w-full" />}
      stat={`accent: ${ACCENTS[s.accent].label}`}
      onClose={onClose}
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-4">
          <div className="chrome-frame rounded-2xl p-4">
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-black/70 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,.4),0_0_0_1px_rgba(255,255,255,.2)]">
                <MascotAvatar className="h-full w-full" />
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <label className="flex items-center gap-2 rounded-xl bg-black/50 px-3 py-2 shadow-[inset_0_2px_8px_rgba(0,0,0,.8),0_0_0_1px_rgba(255,255,255,.1)]">
                  <IconUser className="h-4 w-4 text-white/35" />
                  <input
                    className="w-full bg-transparent text-sm font-bold uppercase tracking-[0.16em] text-white outline-none"
                    value={s.handle}
                    maxLength={18}
                    onChange={(e) => updateSettings({ handle: e.target.value })}
                    placeholder="handle"
                  />
                </label>
                <input
                  className="y2k-input"
                  value={s.status}
                  maxLength={28}
                  onChange={(e) => updateSettings({ status: e.target.value })}
                  placeholder="status line"
                />
              </div>
            </div>
          </div>

          <div className="chrome-frame rounded-2xl p-4">
            <p className="mb-3 text-[10px] uppercase tracking-[0.34em] text-white/35">chrome tint</p>
            <div className="flex flex-wrap gap-3">
              {(Object.keys(ACCENTS) as AccentKey[]).map((k) => {
                const a = ACCENTS[k];
                const active = s.accent === k;
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => {
                      sfx.click();
                      updateSettings({ accent: k });
                    }}
                    className="group relative grid h-14 w-14 place-items-center rounded-full transition-transform hover:scale-110"
                    aria-label={a.label}
                  >
                    <span
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: `radial-gradient(60% 55% at 32% 26%, #fff, ${a.swatch} 38%, #0d0e05 100%)`,
                        boxShadow: active
                          ? `0 0 0 2px #fff, 0 0 26px ${a.swatch}`
                          : "inset 0 -8px 16px rgba(0,0,0,.7), 0 6px 14px rgba(0,0,0,.6)",
                      }}
                    />
                    {active && <span className="relative font-display text-[10px] text-black/80">on</span>}
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-[10px] uppercase tracking-[0.2em] text-white/30">{ACCENTS[s.accent].label}</p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <Toggle label="24h clock" hint={s.clock24 ? "military time" : "12 hour am/pm"} on={s.clock24} onChange={() => { sfx.click(); updateSettings({ clock24: !s.clock24 }); }} />
            <Toggle
              label="sfx"
              hint={s.sfx ? "click blips on" : "silent mode"}
              on={s.sfx}
              onChange={() => {
                updateSettings({ sfx: !s.sfx });
                if (!s.sfx) sfx.click();
              }}
            />
            <Toggle label="motion" hint={s.motion ? "float + spin on" : "static layout"} on={s.motion} onChange={() => { sfx.click(); updateSettings({ motion: !s.motion }); }} />
            <button
              type="button"
              onClick={exportJson}
              className="flex items-center gap-3 rounded-2xl bg-gradient-to-b from-white/8 to-white/[0.02] p-3 text-left shadow-[inset_0_1px_0_rgba(255,255,255,.25)] transition-colors hover:from-white/14"
            >
              <span className="grid h-7 w-12 shrink-0 place-items-center rounded-full bg-black/70 shadow-[inset_0_2px_8px_rgba(0,0,0,.9),0_0_0_1px_rgba(255,255,255,.18)]">
                <IconSound className="h-4 w-4 text-white/60" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-bold uppercase tracking-[0.16em] text-white/90">export</span>
                <span className="block truncate text-[10px] uppercase tracking-[0.2em] text-white/35">save .json backup</span>
              </span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="chrome-frame rounded-2xl p-4">
            <p className="mb-3 text-[10px] uppercase tracking-[0.34em] text-white/35">hub telemetry</p>
            <div className="grid grid-cols-2 gap-2">
              {stats.map((st) => (
                <div key={st.k} className="rounded-xl bg-black/45 p-3 shadow-[inset_0_2px_8px_rgba(0,0,0,.8),0_0_0_1px_rgba(255,255,255,.08)]">
                  <p className="font-tech text-3xl leading-none text-[rgb(var(--accent))]">{String(st.v).padStart(2, "0")}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.26em] text-white/40">{st.k}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="chrome-frame rounded-2xl p-4">
            <p className="mb-2 text-[10px] uppercase tracking-[0.34em] text-white/35">system info</p>
            <ul className="space-y-1.5 text-[11px] uppercase tracking-[0.2em] text-white/45">
              <li className="flex justify-between"><span>build</span><span className="text-white/75">y2k-street-hub v1.0</span></li>
              <li className="flex justify-between"><span>storage</span><span className="text-white/75">supabase / cloud</span></li>
              <li className="flex justify-between"><span>engine</span><span className="text-white/75">react + chrome</span></li>
              <li className="flex justify-between gap-3">
                <span>account</span>
                <span className="min-w-0 truncate normal-case tracking-normal text-white/75" title={email ?? ""}>{email ?? "—"}</span>
              </li>
              <li className="flex justify-between">
                <span>sync</span>
                <span className={syncing ? "text-[rgb(var(--accent))]" : "text-white/75"}>{syncing ? "saving…" : "up to date"}</span>
              </li>
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              <Chip
                onClick={() => {
                  sfx.trash();
                  resetAll();
                }}
              >
                <span className="flex items-center gap-1.5">
                  <IconReset className="h-3.5 w-3.5" /> factory reset
                </span>
              </Chip>
              <Chip
                onClick={() => {
                  sfx.click();
                  void signOut();
                }}
              >
                <span className="flex items-center gap-1.5">
                  <IconUser className="h-3.5 w-3.5" /> sign out
                </span>
              </Chip>
            </div>
            <p className="mt-3 text-[10px] leading-relaxed normal-case tracking-normal text-white/25">
              Factory reset wipes the tasks, blocks and scratches stored in your account and reloads the demo payload.
            </p>
          </div>
        </div>
      </div>
    </PanelShell>
  );
};
