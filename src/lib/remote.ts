import { getSupabase } from "./supabase";
import type { CalEvent, HubState, Note, Settings, Task } from "./types";

/* ------------------------------------------------------------------ *
 *  Filas tal como viven en Postgres
 * ------------------------------------------------------------------ */

interface TaskRow {
  id: string;
  user_id: string;
  title: string;
  done: boolean;
  priority: Task["priority"];
  tag: string;
  created: number;
  due: string | null;
}

interface EventRow {
  id: string;
  user_id: string;
  date: string;
  time: string;
  title: string;
  tag: string;
}

interface NoteRow {
  id: string;
  user_id: string;
  title: string;
  body: string;
  color: Note["color"];
  pinned: boolean;
  updated: number;
}

interface SettingsRow extends Settings {
  user_id: string;
}

/* ------------------------------------------------------------------ *
 *  Mapeo fila <-> modelo
 *  La única diferencia real es `due`: opcional en TS, nullable en SQL.
 * ------------------------------------------------------------------ */

const taskToRow = (t: Task, userId: string): TaskRow => ({
  id: t.id,
  user_id: userId,
  title: t.title,
  done: t.done,
  priority: t.priority,
  tag: t.tag,
  created: t.created,
  due: t.due ? t.due : null,
});

const rowToTask = (r: TaskRow): Task => ({
  id: r.id,
  title: r.title,
  done: r.done,
  priority: r.priority,
  tag: r.tag,
  created: Number(r.created),
  ...(r.due ? { due: r.due } : {}),
});

const eventToRow = (e: CalEvent, userId: string): EventRow => ({ ...e, user_id: userId });
const rowToEvent = ({ user_id: _u, ...e }: EventRow): CalEvent => e;

const noteToRow = (n: Note, userId: string): NoteRow => ({ ...n, user_id: userId });
const rowToNote = ({ user_id: _u, ...n }: NoteRow): Note => ({ ...n, updated: Number(n.updated) });

/* ------------------------------------------------------------------ *
 *  Lectura
 * ------------------------------------------------------------------ */

/**
 * Trae el estado completo del usuario.
 * Devuelve `null` si todavía no tiene fila en `settings`, que es como
 * detectamos una cuenta nueva y disparamos el sembrado inicial.
 */
export async function fetchAll(userId: string): Promise<HubState | null> {
  const supabase = getSupabase();

  const [tasks, events, notes, settings] = await Promise.all([
    supabase.from("tasks").select("*").eq("user_id", userId).order("created", { ascending: false }),
    supabase.from("events").select("*").eq("user_id", userId),
    supabase.from("notes").select("*").eq("user_id", userId).order("updated", { ascending: false }),
    supabase.from("settings").select("*").eq("user_id", userId).maybeSingle(),
  ]);

  for (const r of [tasks, events, notes, settings]) {
    if (r.error) throw r.error;
  }
  if (!settings.data) return null;

  const { user_id: _u, ...s } = settings.data as SettingsRow;
  return {
    tasks: (tasks.data as TaskRow[]).map(rowToTask),
    events: (events.data as EventRow[]).map(rowToEvent),
    notes: (notes.data as NoteRow[]).map(rowToNote),
    settings: s,
  };
}

/* ------------------------------------------------------------------ *
 *  Escritura
 * ------------------------------------------------------------------ */

const check = ({ error }: { error: unknown }) => {
  if (error) throw error;
};

/** Vuelca un estado entero: se usa al sembrar una cuenta nueva y al resetear. */
export async function pushAll(userId: string, state: HubState): Promise<void> {
  const supabase = getSupabase();

  check(await supabase.from("settings").upsert({ ...state.settings, user_id: userId }));

  if (state.tasks.length) {
    check(await supabase.from("tasks").upsert(state.tasks.map((t) => taskToRow(t, userId))));
  }
  if (state.events.length) {
    check(await supabase.from("events").upsert(state.events.map((e) => eventToRow(e, userId))));
  }
  if (state.notes.length) {
    check(await supabase.from("notes").upsert(state.notes.map((n) => noteToRow(n, userId))));
  }
}

/** Borra todo lo del usuario. Las settings se conservan (las pisa `pushAll`). */
export async function wipeAll(userId: string): Promise<void> {
  const supabase = getSupabase();
  for (const table of ["tasks", "events", "notes"] as const) {
    check(await supabase.from(table).delete().eq("user_id", userId));
  }
}

export const insertTask = async (userId: string, t: Task) =>
  check(await getSupabase().from("tasks").insert(taskToRow(t, userId)));

/** `upsert` y no `update`: así una escritura diferida que llegue antes que su
 *  insert no se pierde, sin depender del orden de las peticiones. */
export const saveTask = async (userId: string, t: Task) =>
  check(await getSupabase().from("tasks").upsert(taskToRow(t, userId)));

export const deleteTask = async (userId: string, id: string) =>
  check(await getSupabase().from("tasks").delete().eq("id", id).eq("user_id", userId));

export const deleteDoneTasks = async (userId: string) =>
  check(await getSupabase().from("tasks").delete().eq("user_id", userId).eq("done", true));

export const insertEvent = async (userId: string, e: CalEvent) =>
  check(await getSupabase().from("events").insert(eventToRow(e, userId)));

export const deleteEvent = async (userId: string, id: string) =>
  check(await getSupabase().from("events").delete().eq("id", id).eq("user_id", userId));

export const insertNote = async (userId: string, n: Note) =>
  check(await getSupabase().from("notes").insert(noteToRow(n, userId)));

export const saveNote = async (userId: string, n: Note) =>
  check(await getSupabase().from("notes").upsert(noteToRow(n, userId)));

export const deleteNote = async (userId: string, id: string) =>
  check(await getSupabase().from("notes").delete().eq("id", id).eq("user_id", userId));

export const saveSettings = async (userId: string, s: Settings) =>
  check(await getSupabase().from("settings").upsert({ ...s, user_id: userId }));
