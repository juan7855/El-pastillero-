import React from "react";

type P = { className?: string; strokeWidth?: number };

const base = (className?: string) => `shrink-0 ${className ?? "h-6 w-6"}`;

export const IconTasks: React.FC<P> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={base(className)}>
    <path d="M9 4h6a1 1 0 0 1 1 1v1H8V5a1 1 0 0 1 1-1Z" fill="currentColor" stroke="none" />
    <rect x="4.5" y="4.5" width="15" height="16" rx="2.5" />
    <path d="m7.5 11.5 2.2 2.2 4.3-4.4" strokeWidth={2.4} />
    <path d="M7.5 17h8" strokeWidth={2.2} />
  </svg>
);

export const IconCalendar: React.FC<P> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={base(className)}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
    <path d="M3.5 9.8h17" strokeWidth={2.2} />
    <path d="M8 3v4M16 3v4" strokeWidth={2.4} />
    <rect x="7" y="12.6" width="4" height="3.4" rx="1" fill="currentColor" stroke="none" />
    <rect x="13" y="12.6" width="4" height="3.4" rx="1" fill="currentColor" stroke="none" opacity="0.55" />
  </svg>
);

export const IconIdeas: React.FC<P> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={base(className)}>
    <path d="M12 2.6 6.4 12.4h4.3L9.6 21.4 17.8 10.4h-4.6L15.4 2.6Z" fill="currentColor" stroke="none" />
  </svg>
);

export const IconConfig: React.FC<P> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={base(className)}>
    <path d="M10.2 2.4h3.6l.5 2.3 1.6.7 2-1.2 2.5 2.5-1.2 2 .7 1.6 2.3.5v3.6l-2.3.5-.7 1.6 1.2 2-2.5 2.5-2-1.2-1.6.7-.5 2.3h-3.6l-.5-2.3-1.6-.7-2 1.2L3.6 18.9l1.2-2-.7-1.6-2.3-.5v-3.6l2.3-.5.7-1.6-1.2-2 2.5-2.5 2 1.2 1.6-.7Zm1.8 6.1a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" />
    <circle cx="18.4" cy="4.6" r="2.4" />
  </svg>
);

export const IconPlus: React.FC<P> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" className={base(className)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const IconX: React.FC<P> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" className={base(className)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const IconCheck: React.FC<P> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className={base(className)}>
    <path d="m4.5 12.5 5 5 10-11" />
  </svg>
);

export const IconTrash: React.FC<P> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={base(className)}>
    <path d="M4 7h16M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13" />
  </svg>
);

export const IconSearch: React.FC<P> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" className={base(className)}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4.5 4.5" />
  </svg>
);

export const IconPin: React.FC<P> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={base(className)}>
    <path d="M14.5 2.5 21.5 9.5l-3 1-2.6 5.9-6.4-6.4L15.4 5.5ZM8.2 12.6 3 20.9l8.3-5.2Z" />
  </svg>
);

export const IconChevron: React.FC<P & { dir?: "left" | "right" }> = ({ className, dir = "left" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.6}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={base(className)}
    style={{ transform: dir === "right" ? "scaleX(-1)" : undefined }}
  >
    <path d="m14.5 5-7 7 7 7" />
  </svg>
);

export const IconBolt: React.FC<P> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={base(className)}>
    <path d="M13.5 2 5 13.5h5L9 22l9.5-12.5h-5.4Z" />
  </svg>
);

export const IconSound: React.FC<P & { off?: boolean }> = ({ className, off }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round" className={base(className)}>
    <path d="M4 9.5h3.5L12.5 5v14L7.5 14.5H4Z" fill="currentColor" />
    {off ? (
      <path d="m16 9.5 5 5m0-5-5 5" />
    ) : (
      <>
        <path d="M16 9c1.6 1.8 1.6 4.2 0 6" />
        <path d="M18.8 6.4c3 3.2 3 8 0 11.2" />
      </>
    )}
  </svg>
);

export const IconReset: React.FC<P> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className={base(className)}>
    <path d="M20 12a8 8 0 1 1-2.4-5.7" />
    <path d="M20 3.5V8h-4.5" />
  </svg>
);

export const IconUser: React.FC<P> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={base(className)}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20.5c0-3.9 3.6-6.3 8-6.3s8 2.4 8 6.3Z" />
  </svg>
);

export const IconClock: React.FC<P> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.1} strokeLinecap="round" className={base(className)}>
    <circle cx="12" cy="12" r="8.6" />
    <path d="M12 7.2V12l3.6 2.2" />
  </svg>
);

export const IconSpark: React.FC<P> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={base(className)}>
    <path d="M12 2.5l1.7 6.1 6.1 1.7-6.1 1.7L12 18.1l-1.7-6.1L4.2 10.3l6.1-1.7Z" />
  </svg>
);
