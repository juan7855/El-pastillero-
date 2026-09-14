import React from "react";

interface Props {
  className?: string;
  teeth?: boolean;
  angry?: boolean;
  idSuffix?: string;
}

/** Chrome bubble head with the grinning grill — the hub's mascot. */
export const MascotHead: React.FC<Props> = ({ className, teeth = true, angry = true, idSuffix = "m" }) => {
  const gid = `mg-${idSuffix}`;
  const mouthPath = "M28 116 A 76 66 0 0 0 172 116 Z";
  return (
    <svg viewBox="0 0 200 200" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={`${gid}-sphere`} cx="34%" cy="26%" r="82%">
          <stop offset="0%" style={{ stopColor: "#ffffff" }} />
          <stop offset="16%" style={{ stopColor: "rgb(var(--accent))" }} />
          <stop offset="46%" style={{ stopColor: "rgb(var(--accent))" }} />
          <stop offset="72%" style={{ stopColor: "#4c5014" }} />
          <stop offset="100%" style={{ stopColor: "#0d0e05" }} />
        </radialGradient>
        <linearGradient id={`${gid}-grill`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" style={{ stopColor: "#ffffff" }} />
          <stop offset="42%" style={{ stopColor: "#c9ced6" }} />
          <stop offset="55%" style={{ stopColor: "#7d838c" }} />
          <stop offset="100%" style={{ stopColor: "#e8ecf1" }} />
        </linearGradient>
        <linearGradient id={`${gid}-gloss`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" style={{ stopColor: "#ffffff", stopOpacity: 0.95 }} />
          <stop offset="100%" style={{ stopColor: "#ffffff", stopOpacity: 0 }} />
        </linearGradient>
        <clipPath id={`${gid}-clip`}>
          <path d={mouthPath} />
        </clipPath>
        <clipPath id={`${gid}-ball`}>
          <circle cx="100" cy="100" r="94" />
        </clipPath>
      </defs>

      <circle cx="100" cy="100" r="95" fill={`url(#${gid}-sphere)`} stroke="#08090a" strokeWidth="7" />

      <g clipPath={`url(#${gid}-ball)`}>
        <ellipse cx="70" cy="52" rx="58" ry="34" fill={`url(#${gid}-gloss)`} opacity="0.75" transform="rotate(-18 70 52)" />
        <ellipse cx="146" cy="164" rx="52" ry="26" fill="#ffffff" opacity="0.12" />
      </g>

      {angry && (
        <g stroke="#0b0c0a" strokeLinecap="round" fill="none">
          <path d="M40 76 L84 97" strokeWidth="12" />
          <path d="M160 76 L116 97" strokeWidth="12" />
        </g>
      )}
      <g fill="#0b0c0a">
        <rect x="66" y="103" width="9" height="21" rx="4.5" />
        <rect x="125" y="103" width="9" height="21" rx="4.5" />
      </g>

      <path d={mouthPath} fill={`url(#${gid}-grill)`} stroke="#0b0c0a" strokeWidth="7" strokeLinejoin="round" />
      {teeth && (
        <g clipPath={`url(#${gid}-clip)`} stroke="#111310" strokeWidth="7">
          {[46, 63, 80, 100, 120, 137, 154].map((x) => (
            <line key={x} x1={x} y1="108" x2={x} y2="196" />
          ))}
        </g>
      )}
      <path d="M28 116 A 76 66 0 0 0 172 116" fill="none" stroke="#0b0c0a" strokeWidth="7" strokeLinecap="round" />
    </svg>
  );
};

/** Mini chrome badge version used in the status capsule + avatars. */
export const MascotAvatar: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg viewBox="0 0 200 200" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="av-sphere" cx="34%" cy="26%" r="80%">
          <stop offset="0%" style={{ stopColor: "#ffffff" }} />
          <stop offset="20%" style={{ stopColor: "rgb(var(--accent))" }} />
          <stop offset="62%" style={{ stopColor: "rgb(var(--accent))" }} />
          <stop offset="100%" style={{ stopColor: "#0d0e05" }} />
        </radialGradient>
        <linearGradient id="av-grill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" style={{ stopColor: "#ffffff" }} />
          <stop offset="60%" style={{ stopColor: "#9aa0a8" }} />
          <stop offset="100%" style={{ stopColor: "#eef1f5" }} />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="94" fill="url(#av-sphere)" stroke="#08090a" strokeWidth="8" />
      <g stroke="#0b0c0a" strokeWidth="13" strokeLinecap="round" fill="none">
        <path d="M44 74 L86 96" />
        <path d="M156 74 L114 96" />
      </g>
      <path d="M32 118 A 72 62 0 0 0 168 118 Z" fill="url(#av-grill)" stroke="#0b0c0a" strokeWidth="8" />
      <g stroke="#111310" strokeWidth="8">
        {[52, 74, 100, 126, 148].map((x) => (
          <line key={x} x1={x} y1="110" x2={x} y2="190" />
        ))}
      </g>
    </svg>
  );
};
