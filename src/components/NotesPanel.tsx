import React from "react";
import { PanelShell, Chip } from "./PanelShell";
import { useStore } from "../lib/store";
import { NOTE_COLORS, type Note, type NoteColor } from "../lib/types";
import { IconIdeas, IconPin, IconPlus, IconSearch, IconTrash } from "./Icons";
import { sfx } from "../lib/sfx";

const COLORS = Object.keys(NOTE_COLORS) as NoteColor[];

const rot = (i: number) => [-1.4, 1.1, -0.7, 1.6, -1.1, 0.8][i % 6];

export const NotesPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { state, addNote, updateNote, removeNote } = useStore();
  const [q, setQ] = React.useState("");

  const notes = state.notes
    .filter((n) => (n.title + " " + n.body).toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updated - a.updated);

  return (
    <PanelShell
      title="ideas"
      kicker="módulo 03 — ideas / notas"
      icon={<IconIdeas className="h-full w-full" />}
      stat={`${state.notes.filter((n) => n.pinned).length} fijadas / ${state.notes.length} total`}
      toolbar={
        <>
          <div className="relative min-w-[180px] flex-1">
            <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <input
              className="y2k-input pl-9"
              placeholder="buscar en el archivo"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <Chip
            onClick={() => {
              sfx.click();
              addNote();
            }}
          >
            <span className="flex items-center gap-1.5">
              <IconPlus className="h-3.5 w-3.5" /> nota nueva
            </span>
          </Chip>
        </>
      }
      onClose={onClose}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {notes.map((n: Note, i) => {
          const c = NOTE_COLORS[n.color];
          return (
            <article
              key={n.id}
              className="note-card fade-up group relative flex flex-col rounded-[18px] p-4 shadow-[0_18px_36px_rgba(0,0,0,.6),inset_0_2px_0_rgba(255,255,255,.5)]"
              style={
                {
                  background: `linear-gradient(165deg, ${c.face} 0%, ${c.face} 55%, rgba(0,0,0,.18) 100%)`,
                  color: c.ink,
                  "--rot": `${rot(i)}deg`,
                } as React.CSSProperties
              }
            >
              <div className="pointer-events-none absolute inset-x-4 top-0 h-6 rounded-b-full bg-white/25 blur-md" />
              <div className="mb-2 flex items-center gap-2">
                <input
                  value={n.title}
                  onChange={(e) => updateNote(n.id, { title: e.target.value })}
                  placeholder="título de la nota"
                  className="min-w-0 flex-1 bg-transparent font-display text-base uppercase leading-tight tracking-tight outline-none placeholder:opacity-40"
                  style={{ color: c.ink }}
                />
                <button
                  type="button"
                  onClick={() => {
                    sfx.click();
                    updateNote(n.id, { pinned: !n.pinned });
                  }}
                  className={`grid h-7 w-7 place-items-center rounded-full transition-colors ${n.pinned ? "opacity-100" : "opacity-30 hover:opacity-70"}`}
                  style={{ background: n.pinned ? c.ink : "transparent", color: n.pinned ? c.face : c.ink }}
                  aria-label="Fijar nota"
                >
                  <IconPin className="h-3.5 w-3.5" />
                </button>
              </div>
              <textarea
                value={n.body}
                onChange={(e) => updateNote(n.id, { body: e.target.value })}
                placeholder="escribilo antes de que se te vaya..."
                rows={6}
                className="y2k-scroll min-h-[130px] flex-1 resize-none bg-transparent text-[13px] font-medium leading-snug outline-none placeholder:opacity-40"
                style={{ color: c.ink }}
              />
              <div className="mt-3 flex items-center gap-2 border-t border-black/15 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    sfx.hover();
                    const next = COLORS[(COLORS.indexOf(n.color) + 1) % COLORS.length];
                    updateNote(n.id, { color: next });
                  }}
                  className="rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-[0.22em]"
                  style={{ background: `${c.ink}22` }}
                >
                  recolorear
                </button>
                <span className="ml-auto font-tech text-[9px] uppercase tracking-[0.2em] opacity-45">
                  {new Date(n.updated).toLocaleDateString("es-ES", { month: "short", day: "numeric" })}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    sfx.trash();
                    removeNote(n.id);
                  }}
                  className="grid h-7 w-7 place-items-center rounded-full opacity-30 transition-opacity hover:opacity-90"
                  aria-label="Eliminar nota"
                >
                  <IconTrash className="h-4 w-4" />
                </button>
              </div>
            </article>
          );
        })}

        <button
          type="button"
          onClick={() => {
            sfx.click();
            addNote();
          }}
          className="grid min-h-[220px] place-items-center rounded-[18px] border border-dashed border-white/15 bg-white/[0.02] transition-colors hover:border-[rgb(var(--accent)/.6)] hover:bg-white/[0.05]"
        >
          <div className="text-center">
            <IconPlus className="mx-auto h-8 w-8 text-white/30" />
            <p className="mt-2 text-[10px] uppercase tracking-[0.32em] text-white/30">nota nueva</p>
          </div>
        </button>
      </div>
    </PanelShell>
  );
};
