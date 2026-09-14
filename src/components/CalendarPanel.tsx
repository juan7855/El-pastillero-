import React from "react";
import { PanelShell, Chip } from "./PanelShell";
import { useStore } from "../lib/store";
import { isoDay } from "../lib/types";
import { IconCalendar, IconChevron, IconPlus, IconTrash } from "./Icons";
import { sfx } from "../lib/sfx";

const WD = ["do", "lu", "ma", "mi", "ju", "vi", "sá"];
const MONTHS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

const TAG_TINT: Record<string, string> = {
  work: "#70ccff",
  crew: "#d6ff1a",
  show: "#ff5bd0",
  art: "#ba7cff",
  life: "#ffc52c",
  health: "#7ee08a",
};

const tint = (t: string) => TAG_TINT[t] ?? "#e7e3d8";

export const CalendarPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { state, addEvent, removeEvent } = useStore();
  const today = isoDay(new Date());
  const [cursor, setCursor] = React.useState(() => new Date());
  const [selected, setSelected] = React.useState(today);
  const [title, setTitle] = React.useState("");
  const [time, setTime] = React.useState("12:00");
  const [tag, setTag] = React.useState("work");

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const first = new Date(year, month, 1);
  const offset = first.getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(offset).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];

  const byDate = React.useMemo(() => {
    const m = new Map<string, typeof state.events>();
    state.events.forEach((e) => {
      const arr = m.get(e.date) ?? [];
      arr.push(e);
      m.set(e.date, arr);
    });
    m.forEach((arr) => arr.sort((a, b) => a.time.localeCompare(b.time)));
    return m;
  }, [state.events]);

  const dayEvents = byDate.get(selected) ?? [];
  const upcoming = [...state.events].filter((e) => e.date >= today).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)).slice(0, 6);

  const shift = (n: number) => {
    sfx.hover();
    setCursor(new Date(year, month + n, 1));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    addEvent({ date: selected, time: time || "12:00", title: t, tag: tag.trim() || "life" });
    setTitle("");
    sfx.done();
  };

  return (
    <PanelShell
      title="agenda"
      kicker="módulo 02 — calendario / agenda"
      icon={<IconCalendar className="h-full w-full" />}
      stat={`${byDate.get(today)?.length ?? 0} hoy`}
      toolbar={
        <div className="flex w-full items-center gap-2">
          <button type="button" className="y2k-btn grid h-8 w-8 place-items-center rounded-full" onClick={() => shift(-1)} aria-label="Mes anterior">
            <IconChevron className="h-4 w-4" />
          </button>
          <p className="chrome-text min-w-[190px] flex-1 text-center font-display text-lg uppercase tracking-tight sm:text-2xl">
            {MONTHS[month]} <span className="text-white/35">{year}</span>
          </p>
          <button type="button" className="y2k-btn grid h-8 w-8 place-items-center rounded-full" onClick={() => shift(1)} aria-label="Mes siguiente">
            <IconChevron dir="right" className="h-4 w-4" />
          </button>
          <Chip
            onClick={() => {
              sfx.click();
              setCursor(new Date());
              setSelected(today);
            }}
          >
            hoy
          </Chip>
        </div>
      }
      onClose={onClose}
    >
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[10px] uppercase tracking-[0.2em] text-white/35">
            {WD.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {cells.map((d, i) => {
              if (d === null) return <div key={`e${i}`} />;
              const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
              const evs = byDate.get(iso) ?? [];
              const isToday = iso === today;
              const isSel = iso === selected;
              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => {
                    sfx.hover();
                    setSelected(iso);
                  }}
                  className={`relative aspect-square rounded-xl text-sm transition-all duration-200 ${
                    isSel
                      ? "bg-[rgb(var(--accent))] font-bold text-black shadow-[0_0_24px_rgb(var(--accent)/.6)]"
                      : "bg-gradient-to-b from-white/8 to-white/[0.02] text-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,.22)] hover:from-white/16"
                  }`}
                >
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">{d}</span>
                  {isToday && !isSel && <span className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/40" />}
                  {evs.length > 0 && (
                    <span className="absolute bottom-1 left-1/2 flex -translate-x-1/2 gap-[3px]">
                      {evs.slice(0, 3).map((e) => (
                        <span key={e.id} className="h-1.5 w-1.5 rounded-full" style={{ background: tint(e.tag), boxShadow: `0 0 6px ${tint(e.tag)}` }} />
                      ))}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-4">
            <p className="mb-2 text-[10px] uppercase tracking-[0.32em] text-white/35">lo próximo</p>
            <ul className="space-y-1.5">
              {upcoming.map((e) => (
                <li key={e.id} className="flex items-center gap-3 text-xs">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: tint(e.tag), boxShadow: `0 0 8px ${tint(e.tag)}` }} />
                  <span className="font-tech text-white/60">{e.date.slice(5)}</span>
                  <span className="text-white/45">{e.time}</span>
                  <span className="truncate font-semibold text-white/80">{e.title}</span>
                </li>
              ))}
              {upcoming.length === 0 && <li className="text-xs uppercase tracking-[0.2em] text-white/25">calendario vacío</li>}
            </ul>
          </div>
        </div>

        <div>
          <div className="chrome-frame rounded-2xl p-4">
            <p className="chrome-text font-display text-xl uppercase tracking-tight">
              {new Date(selected + "T12:00:00").toLocaleDateString("es-ES", { weekday: "long", month: "short", day: "numeric" })}
            </p>
            <p className="mt-0.5 text-[10px] uppercase tracking-[0.32em] text-white/35">{dayEvents.length} bloque(s) agendado(s)</p>

            <form onSubmit={submit} className="mt-4 grid gap-2">
              <input className="y2k-input" placeholder="nombre del bloque" value={title} maxLength={70} onChange={(e) => setTitle(e.target.value)} />
              <div className="flex gap-2">
                <input type="time" className="y2k-input w-auto" value={time} onChange={(e) => setTime(e.target.value)} />
                <input className="y2k-input flex-1" placeholder="etiqueta" value={tag} onChange={(e) => setTag(e.target.value)} />
                <button type="submit" className="y2k-btn grid w-11 place-items-center rounded-xl" aria-label="Agregar bloque">
                  <IconPlus className="h-4 w-4" />
                </button>
              </div>
            </form>

            <ul className="y2k-scroll mt-4 max-h-[38vh] space-y-2 overflow-y-auto pr-1">
              {dayEvents.map((e) => (
                <li
                  key={e.id}
                  className="fade-up group flex items-center gap-3 rounded-xl bg-gradient-to-b from-white/10 to-white/[0.02] px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,.25)]"
                  style={{ borderLeft: `3px solid ${tint(e.tag)}` }}
                >
                  <span className="font-tech text-sm text-white/70">{e.time}</span>
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold text-white/90">{e.title}</span>
                  <span className="hidden text-[10px] uppercase tracking-[0.2em] text-white/35 sm:inline">#{e.tag}</span>
                  <button
                    type="button"
                    onClick={() => {
                      sfx.trash();
                      removeEvent(e.id);
                    }}
                    className="grid h-7 w-7 place-items-center rounded-full text-white/25 transition-colors hover:text-[#ff5b60]"
                    aria-label="Quitar bloque"
                  >
                    <IconTrash className="h-4 w-4" />
                  </button>
                </li>
              ))}
              {dayEvents.length === 0 && (
                <li className="rounded-xl border border-dashed border-white/12 py-8 text-center text-[11px] uppercase tracking-[0.3em] text-white/25">
                  libre — salí un rato
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </PanelShell>
  );
};
