import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  ACCENTS,
  seedState,
  uid,
  type HubState,
  type Note,
  type NoteColor,
  type Priority,
  type Settings,
  type Task,
} from "./types";
import { setSfxEnabled } from "./sfx";
import { useAuth } from "./auth";
import * as remote from "./remote";

/** Clave del localStorage de la versión anterior, sin backend. */
const LEGACY_KEY = "y2k-street-hub-v1";

/** Espera antes de mandar cambios de texto, para no escribir en cada tecla. */
const TYPING_FLUSH_MS = 700;

/**
 * Estado inicial de una cuenta nueva. Si el navegador todavía guarda datos de
 * la versión local, se migran en vez de sembrar el contenido de ejemplo.
 */
const initialStateForNewAccount = (): HubState => {
  const seed = seedState();
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return seed;
    const parsed = JSON.parse(raw) as Partial<HubState>;
    return {
      tasks: parsed.tasks ?? seed.tasks,
      events: parsed.events ?? seed.events,
      notes: parsed.notes ?? seed.notes,
      settings: { ...seed.settings, ...(parsed.settings ?? {}) },
    };
  } catch {
    return seed;
  }
};

export type SyncStatus = "loading" | "ready" | "error";

interface Store {
  state: HubState;
  /** "loading" hasta la primera lectura; "error" si esa lectura falló. */
  status: SyncStatus;
  /** true mientras haya escrituras en vuelo. */
  syncing: boolean;
  /** Mensaje de la última escritura fallida, o null. */
  syncError: string | null;
  dismissError: () => void;
  retry: () => void;
  addTask: (t: { title: string; priority: Priority; tag: string; due?: string }) => void;
  toggleTask: (id: string) => void;
  removeTask: (id: string) => void;
  clearDone: () => void;
  addEvent: (e: { date: string; time: string; title: string; tag: string }) => void;
  removeEvent: (id: string) => void;
  addNote: () => string;
  updateNote: (id: string, patch: Partial<Note>) => void;
  removeNote: (id: string) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  resetAll: () => void;
}

const Ctx = createContext<Store | null>(null);

const EMPTY: HubState = { tasks: [], events: [], notes: [], settings: seedState().settings };

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userId } = useAuth();
  const [state, setState] = useState<HubState>(EMPTY);
  const [status, setStatus] = useState<SyncStatus>("loading");
  const [inFlight, setInFlight] = useState(0);
  const [syncError, setSyncError] = useState<string | null>(null);

  /* ---------------- escrituras ---------------- */

  // El id del usuario en un ref: las escrituras diferidas pueden dispararse
  // después de que el componente que las originó se desmontó.
  const uidRef = useRef<string | null>(userId);
  uidRef.current = userId;

  /** Lanza una escritura, contabiliza que está en vuelo y captura el error. */
  const run = useCallback((fn: (userId: string) => Promise<unknown>) => {
    const id = uidRef.current;
    if (!id) return;
    setInFlight((n) => n + 1);
    fn(id)
      .then(() => setSyncError(null))
      .catch((e: unknown) => {
        console.error("[hub] fallo al guardar", e);
        setSyncError(e instanceof Error ? e.message : "No se pudo guardar el cambio");
      })
      .finally(() => setInFlight((n) => n - 1));
  }, []);

  /* ------- escrituras diferidas (campos de texto) ------- */

  const pendingNotes = useRef(new Map<string, Note>());
  const pendingSettings = useRef<Settings | null>(null);
  const flushTimer = useRef<number | null>(null);

  const flush = useCallback(() => {
    if (flushTimer.current !== null) {
      window.clearTimeout(flushTimer.current);
      flushTimer.current = null;
    }
    const notes = [...pendingNotes.current.values()];
    pendingNotes.current.clear();
    notes.forEach((n) => run((u) => remote.saveNote(u, n)));

    const settings = pendingSettings.current;
    pendingSettings.current = null;
    if (settings) run((u) => remote.saveSettings(u, settings));
  }, [run]);

  const scheduleFlush = useCallback(() => {
    if (flushTimer.current !== null) window.clearTimeout(flushTimer.current);
    flushTimer.current = window.setTimeout(flush, TYPING_FLUSH_MS);
  }, [flush]);

  // Nada de cambios perdidos al cerrar la pestaña o al desmontar.
  useEffect(() => {
    const onHide = () => flush();
    window.addEventListener("beforeunload", onHide);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      window.removeEventListener("beforeunload", onHide);
      document.removeEventListener("visibilitychange", onHide);
      flush();
    };
  }, [flush]);

  /* ---------------- carga inicial ---------------- */

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!userId) {
      setState(EMPTY);
      setStatus("loading");
      return;
    }
    let alive = true;
    setStatus("loading");

    (async () => {
      try {
        let next = await remote.fetchAll(userId);
        if (!next) {
          // Cuenta nueva: sembrar, o migrar lo que quedó en el navegador.
          next = initialStateForNewAccount();
          await remote.pushAll(userId, next);
        }
        if (!alive) return;
        setState(next);
        setStatus("ready");
        setSyncError(null);
      } catch (e) {
        console.error("[hub] fallo al cargar", e);
        if (!alive) return;
        setSyncError(e instanceof Error ? e.message : "No se pudieron cargar los datos");
        setStatus("error");
      }
    })();

    return () => {
      alive = false;
    };
  }, [userId, reloadKey]);

  /* ---------------- efectos de presentación ---------------- */

  const { accent, sfx } = state.settings;

  useEffect(() => {
    const a = ACCENTS[accent] ?? ACCENTS.acid;
    document.documentElement.style.setProperty("--accent", a.rgb);
  }, [accent]);

  useEffect(() => {
    setSfxEnabled(sfx);
  }, [sfx]);

  /* ---------------- acciones ---------------- */

  const addTask: Store["addTask"] = useCallback(
    (t) => {
      const task: Task = {
        id: uid(),
        title: t.title,
        done: false,
        priority: t.priority,
        tag: t.tag,
        created: Date.now(),
        ...(t.due ? { due: t.due } : {}),
      };
      setState((s) => ({ ...s, tasks: [task, ...s.tasks] }));
      run((u) => remote.insertTask(u, task));
    },
    [run],
  );

  const toggleTask: Store["toggleTask"] = useCallback(
    (id) => {
      setState((s) => {
        const next = s.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
        const changed = next.find((t) => t.id === id);
        if (changed) run((u) => remote.saveTask(u, changed));
        return { ...s, tasks: next };
      });
    },
    [run],
  );

  const removeTask: Store["removeTask"] = useCallback(
    (id) => {
      setState((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== id) }));
      run((u) => remote.deleteTask(u, id));
    },
    [run],
  );

  const clearDone: Store["clearDone"] = useCallback(() => {
    setState((s) => ({ ...s, tasks: s.tasks.filter((t) => !t.done) }));
    run((u) => remote.deleteDoneTasks(u));
  }, [run]);

  const addEvent: Store["addEvent"] = useCallback(
    (e) => {
      const ev = { id: uid(), ...e };
      setState((s) => ({ ...s, events: [...s.events, ev] }));
      run((u) => remote.insertEvent(u, ev));
    },
    [run],
  );

  const removeEvent: Store["removeEvent"] = useCallback(
    (id) => {
      setState((s) => ({ ...s, events: s.events.filter((e) => e.id !== id) }));
      run((u) => remote.deleteEvent(u, id));
    },
    [run],
  );

  const addNote: Store["addNote"] = useCallback(() => {
    const palette: NoteColor[] = ["acid", "ice", "gold", "violet", "blood", "bone"];
    const note: Note = {
      id: uid(),
      title: "New scratch",
      body: "",
      color: palette[Math.floor(Math.random() * palette.length)],
      pinned: false,
      updated: Date.now(),
    };
    setState((s) => ({ ...s, notes: [note, ...s.notes] }));
    run((u) => remote.insertNote(u, note));
    return note.id;
  }, [run]);

  const updateNote: Store["updateNote"] = useCallback(
    (id, patch) => {
      setState((s) => {
        const next = s.notes.map((n) => (n.id === id ? { ...n, ...patch, updated: Date.now() } : n));
        const changed = next.find((n) => n.id === id);
        if (changed) {
          // Título y cuerpo cambian en cada tecla: la escritura se difiere.
          pendingNotes.current.set(id, changed);
          scheduleFlush();
        }
        return { ...s, notes: next };
      });
    },
    [scheduleFlush],
  );

  const removeNote: Store["removeNote"] = useCallback(
    (id) => {
      // Descartar la escritura diferida, o el upsert reviviría la nota.
      pendingNotes.current.delete(id);
      setState((s) => ({ ...s, notes: s.notes.filter((n) => n.id !== id) }));
      run((u) => remote.deleteNote(u, id));
    },
    [run],
  );

  const updateSettings: Store["updateSettings"] = useCallback(
    (patch) => {
      setState((s) => {
        const settings = { ...s.settings, ...patch };
        pendingSettings.current = settings;
        scheduleFlush();
        return { ...s, settings };
      });
    },
    [scheduleFlush],
  );

  const resetAll: Store["resetAll"] = useCallback(() => {
    pendingNotes.current.clear();
    pendingSettings.current = null;
    const fresh = seedState();
    setState(fresh);
    run(async (u) => {
      await remote.wipeAll(u);
      await remote.pushAll(u, fresh);
    });
  }, [run]);

  const retry: Store["retry"] = useCallback(() => {
    setSyncError(null);
    setReloadKey((n) => n + 1);
  }, []);

  const dismissError: Store["dismissError"] = useCallback(() => setSyncError(null), []);

  const value = useMemo<Store>(
    () => ({
      state,
      status,
      syncing: inFlight > 0,
      syncError,
      dismissError,
      retry,
      addTask,
      toggleTask,
      removeTask,
      clearDone,
      addEvent,
      removeEvent,
      addNote,
      updateNote,
      removeNote,
      updateSettings,
      resetAll,
    }),
    [
      state,
      status,
      inFlight,
      syncError,
      dismissError,
      retry,
      addTask,
      toggleTask,
      removeTask,
      clearDone,
      addEvent,
      removeEvent,
      addNote,
      updateNote,
      removeNote,
      updateSettings,
      resetAll,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useStore = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStore must be used inside StoreProvider");
  return v;
};
