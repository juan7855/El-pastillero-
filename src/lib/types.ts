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
  acid: { label: "Lima Ácida", rgb: "214 255 26", swatch: "#d6ff1a" },
  ice: { label: "Hielo Cromado", rgb: "112 204 255", swatch: "#70ccff" },
  blood: { label: "Rojo Sangre", rgb: "255 62 72", swatch: "#ff3e48" },
  gold: { label: "Oro 24K", rgb: "255 197 44", swatch: "#ffc52c" },
  violet: { label: "Ultra Violeta", rgb: "186 124 255", swatch: "#ba7cff" },
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
  high: "crítico",
  mid: "media",
  low: "tranqui",
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
    { id: uid(), title: "Terminar las diapos que faltan", done: false, priority: "high", tag: "work", created: Date.now(), due: addDays(0) },
    { id: uid(), title: "Reponer aerosoles y fibrones", done: false, priority: "mid", tag: "errand", created: Date.now(), due: addDays(2) },
    { id: uid(), title: "30 min de skate / estirar", done: false, priority: "low", tag: "body", created: Date.now(), due: addDays(1) },
    { id: uid(), title: "Devolver la llamada del estudio", done: true, priority: "mid", tag: "work", created: Date.now(), due: addDays(-1) },
    { id: uid(), title: "Backupear los samples al disco", done: true, priority: "low", tag: "files", created: Date.now(), due: addDays(-2) },
  ],
  events: [
    { id: uid(), date: addDays(0), time: "09:30", title: "Reunión con la banda", tag: "crew" },
    { id: uid(), date: addDays(0), time: "20:00", title: "Micrófono abierto / set", tag: "show" },
    { id: uid(), date: addDays(1), time: "12:00", title: "Bloque de estudio", tag: "work" },
    { id: uid(), date: addDays(3), time: "18:30", title: "Inauguración de galería", tag: "art" },
    { id: uid(), date: addDays(6), time: "11:00", title: "Vuelta por la feria", tag: "life" },
  ],
  notes: [
    {
      id: uid(),
      title: "Idea de gancho — 140bpm",
      body: "Campana desafinada sobre kick roto. Voz chipmunk cortada en el 4to compás. Mantenerlo sucio, no cuantizar los hi-hats.",
      color: "acid",
      pinned: true,
      updated: Date.now(),
    },
    {
      id: uid(),
      title: "Bocetos para el mural",
      body: "Letra O tipo burbuja cromada. Subrayado de cadena. Fondo: asfalto mojado negro + salpicado lima.",
      color: "ice",
      pinned: false,
      updated: Date.now(),
    },
    {
      id: uid(),
      title: "Links para revisar",
      body: "Archivo de rave / temas bootleg de PSP / pdf de tipografías cromadas.",
      color: "violet",
      pinned: false,
      updated: Date.now(),
    },
  ],
  settings: {
    handle: "Juan not",
    status: "modo grindeo activado",
    accent: "acid",
    clock24: false,
    sfx: true,
    motion: true,
  },
});
