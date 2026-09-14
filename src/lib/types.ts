export type Priority = "low" | "mid" | "high";

export interface Task {
  id: string;
  title: string;
  done: boolean;
  priority: Priority;
  tag: string;
  created: number;
  due?: string; // YYYY-MM-DD
}

export interface CalEvent {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  title: string;
  tag: string;
}

export type NoteColor = "acid" | "ice" | "blood" | "gold" | "violet" | "bone";

export interface Note {
  id: string;
  title: string;
  body: string;
  color: NoteColor;
  pinned: boolean;
  updated: number;
}

export type AccentKey = "acid" | "ice" | "blood" | "gold" | "violet";

export interface Settings {
  handle: string;
  status: string;
  accent: AccentKey;
  clock24: boolean;
  sfx: boolean;
  motion: boolean;
}

export interface HubState {
  tasks: Task[];
  events: CalEvent[];
  notes: Note[];
  settings: Settings;
}

export const ACCENTS: Record<AccentKey, { label: string; rgb: string; swatch: string }> = {
  acid: { label: "Acid Lime", rgb: "214 255 26", swatch: "#d6ff1a" },
  ice: { label: "Chrome Ice", rgb: "112 204 255", swatch: "#70ccff" },
  blood: { label: "Blood Red", rgb: "255 62 72", swatch: "#ff3e48" },
  gold: { label: "24K Gold", rgb: "255 197 44", swatch: "#ffc52c" },
  violet: { label: "Ultra Violet", rgb: "186 124 255", swatch: "#ba7cff" },
};

export const NOTE_COLORS: Record<NoteColor, { label: string; face: string; ink: string }> = {
  acid: { label: "acid", face: "#d6ff1a", ink: "#141602" },
  ice: { label: "ice", face: "#8fdcff", ink: "#04202c" },
  blood: { label: "blood", face: "#ff5b60", ink: "#2b0406" },
  gold: { label: "gold", face: "#ffc94a", ink: "#2b1c00" },
  violet: { label: "violet", face: "#c79bff", ink: "#1e0a35" },
  bone: { label: "bone", face: "#e7e3d8", ink: "#1a1a18" },
};

export const PRIORITY_LABEL: Record<Priority, string> = {
  high: "critical",
  mid: "mid",
  low: "chill",
};

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

export const isoDay = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const addDays = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return isoDay(d);
};

export const seedState = (): HubState => ({
  tasks: [
    { id: uid(), title: "Bomb the missing deck slides", done: false, priority: "high", tag: "work", created: Date.now(), due: addDays(0) },
    { id: uid(), title: "Restock spray caps + markers", done: false, priority: "mid", tag: "errand", created: Date.now(), due: addDays(2) },
    { id: uid(), title: "30 min skate / stretch", done: false, priority: "low", tag: "body", created: Date.now(), due: addDays(1) },
    { id: uid(), title: "Call back the studio guy", done: true, priority: "mid", tag: "work", created: Date.now(), due: addDays(-1) },
    { id: uid(), title: "Back up sample pack to drive", done: true, priority: "low", tag: "files", created: Date.now(), due: addDays(-2) },
  ],
  events: [
    { id: uid(), date: addDays(0), time: "09:30", title: "Crew check-in", tag: "crew" },
    { id: uid(), date: addDays(0), time: "20:00", title: "Open mic / set", tag: "show" },
    { id: uid(), date: addDays(1), time: "12:00", title: "Studio block", tag: "work" },
    { id: uid(), date: addDays(3), time: "18:30", title: "Gallery hang", tag: "art" },
    { id: uid(), date: addDays(6), time: "11:00", title: "Flea market run", tag: "life" },
  ],
  notes: [
    {
      id: uid(),
      title: "Hook idea — 140bpm",
      body: "Detuned bell over broken kick. Chipmunk vocal chop on the 4th bar. Keep it grimy, don't quantize the hats.",
      color: "acid",
      pinned: true,
      updated: Date.now(),
    },
    {
      id: uid(),
      title: "Mural sketch notes",
      body: "Chrome bubble letter O. Chain link underline. Background: wet asphalt black + lime bleed.",
      color: "ice",
      pinned: false,
      updated: Date.now(),
    },
    {
      id: uid(),
      title: "Links to peep",
      body: "Rave archive site / bootleg PSP themes / chrome type specimen pdf.",
      color: "violet",
      pinned: false,
      updated: Date.now(),
    },
  ],
  settings: {
    handle: "Hengrphcs",
    status: "on grindex mode",
    accent: "acid",
    clock24: false,
    sfx: true,
    motion: true,
  },
});
