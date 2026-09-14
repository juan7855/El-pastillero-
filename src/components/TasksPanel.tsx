import React from "react";
import { PanelShell, Chip } from "./PanelShell";
import { useStore } from "../lib/store";
import { PRIORITY_LABEL, isoDay, type Priority, type Task } from "../lib/types";
import { IconCheck, IconPlus, IconTasks, IconTrash } from "./Icons";
import { sfx } from "../lib/sfx";

const PRIORITIES: { k: Priority; label: string; color: string }[] = [
  { k: "high", label: "crit", color: "#ff4b55" },
  { k: "mid", label: "mid", color: "#ffc52c" },
  { k: "low", label: "chill", color: "#7ee08a" },
];

const prioColor = (p: Priority) => PRIORITIES.find((x) => x.k === p)!.color;

type Filter = "all" | "pending" | "done";

export const TasksPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { state, addTask, toggleTask, removeTask, clearDone } = useStore();
  const [title, setTitle] = React.useState("");
  const [tag, setTag] = React.useState("work");
  const [due, setDue] = React.useState(isoDay(new Date()));
  const [priority, setPriority] = React.useState<Priority>("mid");
  const [filter, setFilter] = React.useState<Filter>("pending");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    addTask({ title: t, priority, tag: tag.trim() || "general", due: due || undefined });
    setTitle("");
    sfx.done();
  };

  const shown = state.tasks
    .filter((t) => (filter === "all" ? true : filter === "done" ? t.done : !t.done))
    .sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      const rank = { high: 0, mid: 1, low: 2 };
      if (rank[a.priority] !== rank[b.priority]) return rank[a.priority] - rank[b.priority];
      return (a.due ?? "9999").localeCompare(b.due ?? "9999");
    });

  const done = state.tasks.filter((t) => t.done).length;
  const total = state.tasks.length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <PanelShell
      title="pending"
      kicker="module 01 — tasks / pending"
      icon={<IconTasks className="h-full w-full" />}
      stat={`${String(total - done).padStart(2, "0")} open / ${String(done).padStart(2, "0")} cleared`}
      toolbar={
        <>
          {(["pending", "done", "all"] as Filter[]).map((f) => (
            <Chip key={f} active={filter === f} onClick={() => { sfx.click(); setFilter(f); }}>
              {f}
            </Chip>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <Chip onClick={() => { sfx.trash(); clearDone(); }}>wipe cleared</Chip>
          </div>
        </>
      }
      onClose={onClose}
    >
      <form onSubmit={submit} className="mb-6 grid gap-2 sm:grid-cols-[1fr_auto]">
        <input
          className="y2k-input"
          placeholder="what needs handlein'?"
          value={title}
          maxLength={90}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="flex gap-2">
          <button type="submit" className="y2k-btn flex items-center gap-2 px-4 py-2 text-[11px]">
            <IconPlus className="h-4 w-4" /> add
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
          <div className="flex items-center gap-1 rounded-xl bg-black/40 p-1 shadow-[inset_0_2px_8px_rgba(0,0,0,.8),0_0_0_1px_rgba(255,255,255,.1)]">
            {PRIORITIES.map((p) => (
              <button
                key={p.k}
                type="button"
                onClick={() => { sfx.hover(); setPriority(p.k); }}
                className="rounded-lg px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] transition-all"
                style={
                  priority === p.k
                    ? { background: p.color, color: "#0b0b0c", boxShadow: `0 0 18px ${p.color}66` }
                    : { color: "rgba(255,255,255,.5)" }
                }
              >
                {p.label}
              </button>
            ))}
          </div>
          <input className="y2k-input w-auto flex-1 min-w-[110px]" placeholder="tag" value={tag} onChange={(e) => setTag(e.target.value)} />
          <input type="date" className="y2k-input w-auto" value={due} onChange={(e) => setDue(e.target.value)} />
        </div>
      </form>

      <div className="mb-5">
        <div className="mb-1.5 flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-white/40">
          <span>progress</span>
          <span className="accent-text font-tech">{pct}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-black/60 shadow-[inset_0_2px_6px_rgba(0,0,0,.9),0_0_0_1px_rgba(255,255,255,.12)]">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              background: "linear-gradient(90deg, rgb(var(--accent) / .55), rgb(var(--accent))), linear-gradient(180deg, rgba(255,255,255,.85), rgba(255,255,255,.1))",
              boxShadow: "0 0 18px rgb(var(--accent) / .7)",
            }}
          />
        </div>
      </div>

      <ul className="space-y-2">
        {shown.map((t: Task, i) => (
          <li
            key={t.id}
            className="fade-up group flex items-center gap-3 rounded-2xl bg-gradient-to-b from-white/8 to-white/[0.02] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,.28),0_8px_20px_rgba(0,0,0,.5)] sm:px-4"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <button
              type="button"
              onClick={() => {
                if (!t.done) sfx.done();
                toggleTask(t.id);
              }}
              className={`grid h-8 w-8 shrink-0 place-items-center rounded-full transition-all ${
                t.done
                  ? "bg-[rgb(var(--accent))] text-black shadow-[0_0_18px_rgb(var(--accent)/.6)]"
                  : "bg-black/60 text-transparent shadow-[inset_0_2px_8px_rgba(0,0,0,.9),0_0_0_1px_rgba(255,255,255,.2)] hover:text-white/60"
              }`}
              aria-label={t.done ? "Mark pending" : "Mark done"}
            >
              <IconCheck className="h-4 w-4" />
            </button>

            <div className="min-w-0 flex-1">
              <p className={`truncate text-sm font-semibold sm:text-base ${t.done ? "text-white/35 line-through" : "text-white/90"}`}>
                {t.title}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.18em]">
                <span style={{ color: prioColor(t.priority) }}>{PRIORITY_LABEL[t.priority]}</span>
                <span className="text-white/35">#{t.tag}</span>
                {t.due && (
                  <span className={t.due < isoDay(new Date()) && !t.done ? "text-[#ff6b6b]" : "text-white/35"}>
                    due {t.due}
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => { sfx.trash(); removeTask(t.id); }}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-white/25 opacity-0 transition-all hover:bg-white/10 hover:text-[#ff5b60] group-hover:opacity-100"
              aria-label="Delete task"
            >
              <IconTrash className="h-4 w-4" />
            </button>
          </li>
        ))}
        {shown.length === 0 && (
          <li className="rounded-2xl border border-dashed border-white/12 py-14 text-center">
            <p className="font-display text-lg uppercase tracking-tight text-white/30">nothing here</p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.3em] text-white/20">add a task above</p>
          </li>
        )}
      </ul>
    </PanelShell>
  );
};
