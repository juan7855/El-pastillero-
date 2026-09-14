let ctx: AudioContext | null = null;
let enabled = true;

export const setSfxEnabled = (v: boolean) => {
  enabled = v;
};

const getCtx = () => {
  if (!enabled) return null;
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
};

interface ToneOpts {
  freq: number;
  dur?: number;
  type?: OscillatorType;
  vol?: number;
  slideTo?: number;
  delay?: number;
}

const tone = ({ freq, dur = 0.12, type = "square", vol = 0.05, slideTo, delay = 0 }: ToneOpts) => {
  const ac = getCtx();
  if (!ac) return;
  const t0 = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(40, slideTo), t0 + dur);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
};

export const sfx = {
  hover: () => tone({ freq: 880, dur: 0.05, vol: 0.018, type: "triangle" }),
  click: () => {
    tone({ freq: 420, dur: 0.06, vol: 0.045, type: "square" });
    tone({ freq: 1180, dur: 0.09, vol: 0.03, type: "triangle", delay: 0.045 });
  },
  open: () => {
    tone({ freq: 300, slideTo: 900, dur: 0.22, vol: 0.05, type: "sawtooth" });
    tone({ freq: 1500, dur: 0.12, vol: 0.025, type: "sine", delay: 0.16 });
  },
  close: () => tone({ freq: 700, slideTo: 180, dur: 0.2, vol: 0.04, type: "sawtooth" }),
  done: () => {
    tone({ freq: 700, dur: 0.08, vol: 0.04, type: "square" });
    tone({ freq: 1050, dur: 0.14, vol: 0.04, type: "square", delay: 0.08 });
  },
  trash: () => tone({ freq: 220, slideTo: 70, dur: 0.22, vol: 0.05, type: "square" }),
  key: () => tone({ freq: 1500 + Math.random() * 500, dur: 0.02, vol: 0.012, type: "square" }),
};
