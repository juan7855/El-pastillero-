import React from "react";
import { IconX } from "./Icons";
import { sfx } from "../lib/sfx";

export const PanelShell: React.FC<{
  title: string;
  kicker: string;
  icon: React.ReactNode;
  stat?: string;
  onClose: () => void;
  children: React.ReactNode;
  toolbar?: React.ReactNode;
}> = ({ title, kicker, icon, stat, onClose, children, toolbar }) => {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        sfx.close();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="safe-top safe-bottom safe-x fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      <div
        className="absolute inset-0 bg-black/72 backdrop-blur-md"
        onClick={() => {
          sfx.close();
          onClose();
        }}
      />
      <div className="chrome-frame fade-up relative flex max-h-[94dvh] w-full max-w-5xl flex-col overflow-hidden">
        {/* header */}
        <div className="relative flex items-center gap-3 border-b border-white/10 bg-gradient-to-b from-white/12 to-transparent px-4 py-3 sm:gap-4 sm:px-6 sm:py-4">
          <div className="orb grid h-12 w-12 shrink-0 place-items-center rounded-full sm:h-14 sm:w-14">
            <div className="grid h-7 w-7 place-items-center text-[#e4e8ed] sm:h-8 sm:w-8">{icon}</div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[9px] font-bold uppercase tracking-[0.42em] text-white/40">{kicker}</p>
            <h2 className="chrome-text truncate font-display text-xl uppercase leading-none tracking-tight sm:text-3xl">
              {title}
            </h2>
          </div>
          {stat && (
            <div className="chrome-pill hidden rounded-full px-4 py-1.5 md:block">
              <p className="font-tech text-xs tracking-[0.16em] text-[rgb(var(--accent))]">{stat}</p>
            </div>
          )}
          <button
            type="button"
            onClick={() => {
              sfx.close();
              onClose();
            }}
            className="y2k-btn grid h-10 w-10 shrink-0 place-items-center rounded-full"
            aria-label="Cerrar módulo"
          >
            <IconX className="h-5 w-5" />
          </button>
        </div>

        {toolbar && <div className="flex flex-wrap items-center gap-2 border-b border-white/10 bg-black/25 px-4 py-3 sm:px-6">{toolbar}</div>}

        <div className="y2k-scroll flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">{children}</div>

        <div className="pointer-events-none absolute inset-x-0 top-0 h-px shimmer opacity-40" />
      </div>
    </div>
  );
};

export const Chip: React.FC<{
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  title?: string;
}> = ({ active, onClick, children, title }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className={`y2k-btn px-3 py-1.5 text-[10px] tracking-[0.2em] ${active ? "text-[rgb(var(--accent))] shadow-[inset_0_2px_10px_rgba(0,0,0,.8),0_0_0_1px_rgb(var(--accent)/.6),0_0_20px_rgb(var(--accent)/.3)]" : ""}`}
  >
    {children}
  </button>
);
