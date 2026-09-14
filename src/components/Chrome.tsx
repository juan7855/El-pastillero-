import React from "react";
import { MascotAvatar } from "./Mascot";
import { useStore } from "../lib/store";

const pad = (n: number) => String(n).padStart(2, "0");

export const useClock = (clock24: boolean) => {
  const [now, setNow] = React.useState(() => new Date());
  React.useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 1000 * 20);
    return () => window.clearInterval(t);
  }, []);
  let h = now.getHours();
  const suffix = h >= 12 ? "PM" : "AM";
  if (!clock24) {
    h = h % 12 || 12;
    return `${h}:${pad(now.getMinutes())}${suffix}`;
  }
  return `${pad(h)}:${pad(now.getMinutes())}`;
};

export const StatusCapsule: React.FC = () => {
  const { state } = useStore();
  const { handle, status, clock24 } = state.settings;
  const time = useClock(clock24);
  return (
    <div className="chrome-pill flex items-center gap-3 rounded-full py-2 pl-2 pr-5">
      <div className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full bg-black/70 p-[3px] shadow-[inset_0_1px_0_rgba(255,255,255,.4),0_0_0_1px_rgba(255,255,255,.25)]">
        <MascotAvatar className="h-full w-full" />
      </div>
      <div className="hidden min-w-0 sm:block">
        <p className="truncate text-[13px] font-bold leading-tight tracking-wide text-white">{handle}</p>
        <p className="truncate text-[10px] uppercase tracking-[0.22em] text-white/45">{status}</p>
      </div>
      <div className="h-6 w-px bg-white/15" />
      <p className="font-tech text-lg leading-none tracking-tight text-white/90">{time}</p>
    </div>
  );
};

/** Chrome arrow marker, top-left — pure Y2K decoration. */
export const CornerMarker: React.FC = () => (
  <svg viewBox="0 0 120 90" className="h-16 w-24 opacity-80">
    <defs>
      <linearGradient id="tri-chrome" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" style={{ stopColor: "#ffffff" }} />
        <stop offset="40%" style={{ stopColor: "#c3c9d1" }} />
        <stop offset="55%" style={{ stopColor: "#6a7078" }} />
        <stop offset="100%" style={{ stopColor: "#eef1f5" }} />
      </linearGradient>
    </defs>
    <path d="M60 8 L108 74 H12 Z" fill="url(#tri-chrome)" stroke="#0a0b0c" strokeWidth="4" strokeLinejoin="round" />
    <path d="M60 22 L92 66 H28 Z" fill="#0a0b0c" opacity="0.55" />
  </svg>
);

export const Ticker: React.FC<{ items: string[] }> = ({ items }) => {
  const line = items.join("   ///   ") + "   ///   ";
  return (
    <div className="pointer-events-none relative w-full overflow-hidden border-y border-white/10 bg-black/40 py-1.5">
      <div className="marquee-track flex w-max whitespace-nowrap">
        {[0, 1].map((k) => (
          <span
            key={k}
            className="px-4 text-[11px] font-semibold uppercase tracking-[0.4em] text-white/45"
          >
            {line}
          </span>
        ))}
      </div>
    </div>
  );
};

export const SectionTitle: React.FC<{ kicker?: string; children: React.ReactNode }> = ({ kicker, children }) => (
  <div>
    {kicker && <p className="text-[10px] font-bold uppercase tracking-[0.42em] text-white/40">{kicker}</p>}
    <h2 className="chrome-text font-display text-2xl uppercase leading-none tracking-tight sm:text-3xl">{children}</h2>
  </div>
);
