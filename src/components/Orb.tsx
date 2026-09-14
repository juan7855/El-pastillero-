import React from "react";

export const Orb: React.FC<{
  size: number;
  children: React.ReactNode;
  active?: boolean;
  className?: string;
  float?: boolean;
}> = ({ size, children, active, className, float }) => {
  return (
    <div
      className={`orb-wrap relative grid place-items-center ${active ? "is-active" : ""} ${className ?? ""}`}
      style={{ width: size, height: size }}
    >
      <div className="orb-glow" />
      <div className="orb-accent-ring" />
      <div className={`orb grid place-items-center ${float ? "float-mid" : ""}`} style={{ width: size, height: size }}>
        <div
          className="grid place-items-center rounded-full text-[#e4e8ed]"
          style={{
            width: size * 0.56,
            height: size * 0.56,
            filter: `drop-shadow(0 3px 6px rgba(0,0,0,.85))`,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
