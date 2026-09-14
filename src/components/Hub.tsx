import React from "react";
import { ChainLayer, RadialGrid } from "./HubDecor";
import { Orb } from "./Orb";
import { MascotHead } from "./Mascot";
import { IconCalendar, IconConfig, IconIdeas, IconTasks } from "./Icons";
import { clamp, useElementSize } from "../lib/useElementSize";
import { useStore } from "../lib/store";
import { ACCENTS, isoDay } from "../lib/types";
import { sfx } from "../lib/sfx";

export type ModuleId = "tasks" | "calendar" | "ideas" | "config";

const NODE_POS_WIDE: Record<ModuleId, { x: number; y: number }> = {
  tasks: { x: 18, y: 23 },
  calendar: { x: 81, y: 30 },
  ideas: { x: 25, y: 78 },
  config: { x: 79, y: 71 },
};

const NODE_POS_NARROW: Record<ModuleId, { x: number; y: number }> = {
  tasks: { x: 24, y: 19 },
  calendar: { x: 78, y: 21 },
  ideas: { x: 24, y: 81 },
  config: { x: 78, y: 79 },
};

const ORDER: ModuleId[] = ["tasks", "calendar", "ideas", "config"];

const QUIPS = [
  "SEGUÍ SUCIO",
  "SIN DÍAS DE DESCANSO",
  "FOCO BAÑADO EN CROMO",
  "GRINDEO > SUERTE",
  "PINTURA FRESCA SECANDO",
];

export const Hub: React.FC<{ onOpen: (id: ModuleId) => void; activeId: ModuleId | null }> = ({ onOpen, activeId }) => {
  const { state } = useStore();
  const { ref, size } = useElementSize<HTMLDivElement>();
  const [hover, setHover] = React.useState<ModuleId | null>(null);
  const [focus, setFocus] = React.useState<ModuleId | null>(null);
  const [quip, setQuip] = React.useState(QUIPS[0]);
  const [bump, setBump] = React.useState(false);

  const { w, h } = size;
  const base = Math.min(w, h) || 600;
  const narrow = w > 0 && w < 680;
  const centerR = clamp(base * (narrow ? 0.3 : 0.335), 130, 300);
  const orbR = clamp(base * (narrow ? 0.155 : 0.175), 46, 150);

  // Ancho máximo que puede tener la etiqueta de un nodo sin salirse de la
  // pantalla: el doble de la distancia (en px) hasta el borde más cercano.
  const labelWidth = (xPct: number) => {
    if (!w) return orbR * 3.4;
    const marginPx = (Math.min(xPct, 100 - xPct) / 100) * w;
    return clamp(Math.min(orbR * 3.4, marginPx * 2 - 12), 80, orbR * 3.4);
  };

  const iso = isoDay(new Date());
  const pending = state.tasks.filter((t) => !t.done).length;
  const todayCount = state.events.filter((e) => e.date === iso).length;
  const openNotes = state.notes.length;

  const stats: Record<ModuleId, string> = {
    tasks: `${String(pending).padStart(2, "0")} pendientes`,
    calendar: `${String(todayCount).padStart(2, "0")} hoy`,
    ideas: `${String(openNotes).padStart(2, "0")} guardadas`,
    config: ACCENTS[state.settings.accent].label,
  };

  const icons: Record<ModuleId, React.ReactNode> = {
    tasks: <IconTasks className="h-full w-full" />,
    calendar: <IconCalendar className="h-full w-full" />,
    ideas: <IconIdeas className="h-full w-full" />,
    config: <IconConfig className="h-full w-full" />,
  };

  const labels: Record<ModuleId, string> = {
    tasks: "tareas",
    calendar: "calendario",
    ideas: "ideas",
    config: "ajustes",
  };

  const positions = narrow ? NODE_POS_NARROW : NODE_POS_WIDE;

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (activeId) return;
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) return;
      const idx = focus ? ORDER.indexOf(focus) : -1;
      if (["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].includes(e.key)) {
        e.preventDefault();
        const next =
          idx === -1
            ? 0
            : e.key === "ArrowRight" || e.key === "ArrowDown"
              ? (idx + 1) % ORDER.length
              : (idx - 1 + ORDER.length) % ORDER.length;
        setFocus(ORDER[next]);
        sfx.hover();
      } else if ((e.key === "Enter" || e.key === " ") && focus) {
        e.preventDefault();
        sfx.open();
        onOpen(focus);
      } else if (/^[1-4]$/.test(e.key)) {
        const id = ORDER[Number(e.key) - 1];
        setFocus(id);
        sfx.open();
        onOpen(id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focus, activeId, onOpen]);

  const bumpMascot = () => {
    setBump(true);
    setQuip(QUIPS[Math.floor(Math.random() * QUIPS.length)]);
    sfx.click();
    window.setTimeout(() => setBump(false), 480);
  };

  const centerTop = 50;
  const centerLeft = 50;

  return (
    <div ref={ref} className="relative h-full w-full overflow-hidden select-none">
      {/* centre emblem */}
      <div
        className="absolute z-20"
        style={{ left: `${centerLeft}%`, top: `${centerTop}%`, transform: "translate(-50%,-50%)" }}
      >
        <button
          type="button"
          onClick={bumpMascot}
          aria-label="Estado del pastillero"
          className="group relative block cursor-pointer outline-none"
          style={{ width: centerR, height: centerR }}
        >
          <div
            className="absolute -inset-[12%] rounded-full opacity-70 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
            style={{ background: "radial-gradient(circle, rgb(var(--accent) / .28), transparent 68%)" }}
          />
          <div className="relative grid h-full w-full place-items-center">
            <div className={`absolute inset-[6%] rounded-full border border-white/10 ${state.settings.motion ? "spin-slow" : ""}`}>
              <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/70" />
              <span className="absolute bottom-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 translate-y-1/2 rounded-full bg-white/40" />
            </div>
            <MascotHead
              idSuffix="hub"
              className={`h-full w-full drop-shadow-[0_24px_40px_rgba(0,0,0,.85)] ${state.settings.motion ? "mascot-pulse" : ""} ${bump ? "pop-in" : ""}`}
            />
          </div>
        </button>
        <div
          className="pointer-events-none absolute left-1/2 top-full -translate-x-1/2 whitespace-nowrap pt-3 text-center"
          style={{ width: clamp(w * 0.9, 180, 260) }}
        >
          <p className="chrome-text font-display text-[13px] uppercase tracking-[0.34em] sm:text-[15px]">standard rules</p>
          <p className="accent-text mt-1 font-tech text-[10px] uppercase tracking-[0.28em]">{quip}</p>
        </div>
      </div>

      {/* chains + grid */}
      <div className="pointer-events-none absolute inset-0 z-10">
        <RadialGrid size={Math.max(w, h) * 1.05} />
        <ChainLayer
          w={w}
          h={h}
          center={{ x: centerLeft, y: centerTop }}
          nodes={ORDER.map((id) => ({ id, ...positions[id] }))}
          centerR={centerR}
          orbR={orbR}
          activeId={activeId}
          hoverId={hover}
        />
      </div>

      {/* satellite nodes */}
      {ORDER.map((id, i) => {
        const p = positions[id];
        const isFocus = focus === id;
        return (
          <div
            key={id}
            className="absolute z-30"
            style={{ left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%,-50%)" }}
          >
            <button
              type="button"
              onClick={() => {
                sfx.open();
                onOpen(id);
              }}
              onMouseEnter={() => {
                setHover(id);
                sfx.hover();
              }}
              onMouseLeave={() => setHover((cur) => (cur === id ? null : cur))}
              onFocus={() => setFocus(id)}
              onBlur={() => setFocus((cur) => (cur === id ? null : cur))}
              className={`orb-wrap group relative block cursor-pointer rounded-full outline-none ${isFocus ? "is-active" : ""} fade-up`}
              style={{ animationDelay: `${120 + i * 90}ms` }}
              aria-label={labels[id]}
            >
              <Orb size={orbR * 2} active={isFocus} float={state.settings.motion && i % 2 === 0}>
                <div style={{ width: "100%", height: "100%" }} className="grid place-items-center">
                  {icons[id]}
                </div>
              </Orb>
              <div
                className="pointer-events-none absolute left-1/2 top-full -translate-x-1/2 pt-3 text-center"
                style={{ width: labelWidth(p.x) }}
              >
                <p
                  className={`font-body text-base font-bold italic lowercase tracking-[0.16em] transition-all duration-300 sm:text-xl ${
                    hover === id || isFocus ? "chrome-text label-glow" : "text-white/55"
                  }`}
                >
                  {labels[id]}
                </p>
                <p className="mt-0.5 font-tech text-[9px] uppercase tracking-[0.2em] text-white/35 transition-colors duration-300 group-hover:text-[rgb(var(--accent))]">
                  {stats[id]}
                </p>
              </div>
            </button>
          </div>
        );
      })}

      {/* keyboard hint */}
      <div className="pointer-events-none absolute bottom-14 left-1/2 z-30 hidden -translate-x-1/2 items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-white/25 md:flex">
        <kbd className="rounded border border-white/15 bg-white/5 px-1.5 py-0.5">←→</kbd>
        <span>navegar</span>
        <kbd className="rounded border border-white/15 bg-white/5 px-1.5 py-0.5">enter</kbd>
        <span>abrir</span>
        <kbd className="rounded border border-white/15 bg-white/5 px-1.5 py-0.5">1-4</kbd>
        <span>salto rápido</span>
      </div>
    </div>
  );
};
