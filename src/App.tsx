import React from "react";
import bg from "./assets/grunge.jpg";
import { AuthProvider } from "./lib/auth";
import { isSupabaseConfigured } from "./lib/supabase";
import { AuthGate, SetupNeeded } from "./components/AuthGate";
import { StoreProvider, useStore } from "./lib/store";
import { Hub, type ModuleId } from "./components/Hub";
import { CornerMarker, StatusCapsule, Ticker } from "./components/Chrome";
import { MascotHead } from "./components/Mascot";
import { TasksPanel } from "./components/TasksPanel";
import { CalendarPanel } from "./components/CalendarPanel";
import { NotesPanel } from "./components/NotesPanel";
import { ConfigPanel } from "./components/ConfigPanel";
import { isoDay } from "./lib/types";

const BootSplash: React.FC = () => (
  <div className="boot-screen pointer-events-none fixed inset-0 z-[60] grid place-items-center bg-[#060607]">
    <div className="w-[min(78vw,420px)] text-center">
      <MascotHead idSuffix="boot" className="mx-auto h-24 w-24 mascot-pulse" />
      <h1 className="chrome-text mt-5 font-display text-2xl uppercase tracking-tight sm:text-4xl">el pastillero</h1>
      <p className="mt-2 text-[9px] font-bold uppercase tracking-[0.42em] text-white/35">cargando assets de la calle</p>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-black/70 shadow-[inset_0_2px_6px_rgba(0,0,0,.9),0_0_0_1px_rgba(255,255,255,.12)]">
        <div
          className="boot-bar h-full rounded-full"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,.9), rgba(255,255,255,.15)), linear-gradient(90deg, rgb(var(--accent)/.4), rgb(var(--accent)))",
            boxShadow: "0 0 18px rgb(var(--accent) / .7)",
          }}
        />
      </div>
    </div>
  </div>
);

/** Se muestra cuando la primera lectura contra Supabase falla. */
const LoadFailed: React.FC<{ message: string | null; onRetry: () => void }> = ({ message, onRetry }) => (
  <div className="fixed inset-0 z-[60] grid place-items-center bg-[#060607] px-4">
    <div className="chrome-frame w-[min(88vw,26rem)] p-6 text-center">
      <MascotHead idSuffix="offline" className="mx-auto h-16 w-16" />
      <h2 className="chrome-text mt-4 font-display text-lg uppercase tracking-tight">sin conexión</h2>
      <p className="mt-3 text-sm leading-relaxed text-white/55">
        No pude traer tus datos del servidor.
      </p>
      {message && <p className="mt-2 text-xs text-[#ff8a90]">{message}</p>}
      <button onClick={onRetry} className="y2k-btn mt-5 w-full py-2.5 text-xs">
        reintentar
      </button>
    </div>
  </div>
);

/** Aviso discreto cuando una escritura falla pero la app sigue usable. */
const SyncToast: React.FC<{ message: string; onDismiss: () => void }> = ({ message, onDismiss }) => (
  <div className="fixed bottom-16 left-1/2 z-[55] w-[min(90vw,24rem)] -translate-x-1/2">
    <div className="chrome-pill flex items-center gap-3 rounded-2xl px-4 py-3">
      <span className="h-2 w-2 shrink-0 rounded-full bg-[#ff3e48] shadow-[0_0_10px_#ff3e48]" />
      <p className="min-w-0 flex-1 truncate text-xs text-white/70" title={message}>
        No se guardó: {message}
      </p>
      <button
        onClick={onDismiss}
        className="shrink-0 text-[9px] font-bold uppercase tracking-[0.2em] text-white/40 hover:text-white"
      >
        ok
      </button>
    </div>
  </div>
);

const Shell: React.FC = () => {
  const [active, setActive] = React.useState<ModuleId | null>(null);
  const [minSplash, setMinSplash] = React.useState(true);
  const { state, status, syncError, dismissError, retry } = useStore();
  const close = () => setActive(null);

  // El splash dura lo que tarde la carga, pero nunca menos que su animación.
  React.useEffect(() => {
    const t = window.setTimeout(() => setMinSplash(false), 1900);
    return () => window.clearTimeout(t);
  }, []);

  const booting = minSplash || status === "loading";

  const iso = isoDay(new Date());
  const pending = state.tasks.filter((t) => !t.done).length;
  const cleared = state.tasks.filter((t) => t.done).length;
  const today = state.events.filter((e) => e.date === iso).length;

  const ticker = [
    "el pastillero",
    `pendientes ${String(pending).padStart(2, "0")}`,
    `listas ${String(cleared).padStart(2, "0")}`,
    `hoy ${String(today).padStart(2, "0")}`,
    `notas ${String(state.notes.length).padStart(2, "0")}`,
    `operador ${state.settings.handle}`,
    state.settings.status,
    "mantené el cromo limpio",
  ];

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-[#060607]">
      {/* background stack */}
      <div className="stage-bg" style={{ backgroundImage: `url(${bg})` }} />
      <div className="vignette" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 45% at 50% 48%, rgb(var(--accent) / .07), transparent 70%), radial-gradient(40% 30% at 12% 8%, rgba(255,255,255,.06), transparent 70%)",
        }}
      />

      {/* ui */}
      <div className="relative z-20 flex h-full flex-col">
        <header className="flex items-start justify-between gap-3 px-4 pt-3 sm:px-7 sm:pt-5">
          <div className="flex items-center gap-3 sm:gap-5">
            <div className="hidden sm:block">
              <CornerMarker />
            </div>
            <div className="relative">
              <h1 className="chrome-text font-display text-lg uppercase leading-none tracking-tight sm:text-2xl">
                el pastillero
              </h1>
              <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.36em] text-white/35 sm:text-[9px]">
                sistema de productividad personal
              </p>
              <span className="blink absolute -right-3 -top-1 h-1.5 w-1.5 rounded-full bg-[rgb(var(--accent))] shadow-[0_0_10px_rgb(var(--accent))]" />
            </div>
          </div>
          <StatusCapsule />
        </header>

        <main className="relative min-h-0 flex-1">
          <Hub onOpen={(id) => setActive(id)} activeId={active} />
        </main>

        <footer className="relative z-30">
          <Ticker items={ticker} />
        </footer>
      </div>

      <div className="pointer-events-none absolute inset-0 z-40">
        <div className="scanlines" />
        <div className="grain" />
      </div>

      {active === "tasks" && <TasksPanel onClose={close} />}
      {active === "calendar" && <CalendarPanel onClose={close} />}
      {active === "ideas" && <NotesPanel onClose={close} />}
      {active === "config" && <ConfigPanel onClose={close} />}

      {syncError && status === "ready" && <SyncToast message={syncError} onDismiss={dismissError} />}
      {status === "error" && !booting && <LoadFailed message={syncError} onRetry={retry} />}
      {booting && <BootSplash />}
    </div>
  );
};

export default function App() {
  if (!isSupabaseConfigured) return <SetupNeeded />;

  return (
    <AuthProvider>
      <AuthGate>
        <StoreProvider>
          <Shell />
        </StoreProvider>
      </AuthGate>
    </AuthProvider>
  );
}
