import React from "react";

const Avatar: React.FC<{ size: number }> = ({ size }) => (
  <div
    className="rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 overflow-hidden"
    style={{ width: size, height: size }}
  >
    <img
      src="/images/avatar-hero.png"
      alt="Mike Taylor"
      className="w-full h-full object-cover"
      decoding="async"
    />
  </div>
);

/**
 * Three parallel particle streams along different wave curves.
 * Each stream has its own set of dots with varied sizes/speeds.
 */
const ParticleStream: React.FC<{
  paths: string[];
  idPrefix: string;
}> = ({ paths, idPrefix }) => {
  // Different particle configs per stream for organic variety
  const streamConfigs = [
    [
      { r: 3.5, o: 0.6, dur: "2.6s", delay: "0s" },
      { r: 2.5, o: 0.35, dur: "3.2s", delay: "0.8s" },
      { r: 4, o: 0.5, dur: "2.9s", delay: "1.6s" },
      { r: 2, o: 0.25, dur: "3.5s", delay: "2.2s" },
      { r: 3, o: 0.45, dur: "3.1s", delay: "0.4s" },
    ],
    [
      { r: 3, o: 0.5, dur: "3s", delay: "0.3s" },
      { r: 4, o: 0.4, dur: "2.7s", delay: "1.1s" },
      { r: 2.5, o: 0.3, dur: "3.4s", delay: "1.9s" },
      { r: 3.5, o: 0.55, dur: "2.8s", delay: "0.7s" },
    ],
    [
      { r: 2.5, o: 0.4, dur: "3.3s", delay: "0.5s" },
      { r: 3.5, o: 0.5, dur: "2.5s", delay: "1.3s" },
      { r: 3, o: 0.35, dur: "3.1s", delay: "2s" },
      { r: 4.5, o: 0.45, dur: "2.8s", delay: "0.1s" },
    ],
  ];

  return (
    <>
      {paths.map((path, streamIdx) => {
        const id = `${idPrefix}-${streamIdx}`;
        const particles = streamConfigs[streamIdx] || streamConfigs[0];
        return (
          <React.Fragment key={id}>
            <defs>
              <path id={id} d={path} />
            </defs>
            {/* Faint trail line */}
            <use
              href={`#${id}`}
              fill="none"
              stroke="#DBEAFE"
              strokeWidth="1"
              opacity="0.5"
            />
            {/* Flowing dots */}
            {particles.map((p, i) => (
              <circle key={i} r={p.r} fill="#60A5FA" opacity={0}>
                <animateMotion
                  dur={p.dur}
                  begin={p.delay}
                  repeatCount="indefinite"
                >
                  <mpath href={`#${id}`} />
                </animateMotion>
                <animate
                  attributeName="opacity"
                  values={`0;${p.o};${p.o};0`}
                  keyTimes="0;0.1;0.8;1"
                  dur={p.dur}
                  begin={p.delay}
                  repeatCount="indefinite"
                />
              </circle>
            ))}
          </React.Fragment>
        );
      })}
    </>
  );
};

export const HeroIllustration: React.FC = () => {
  return (
    <div className="relative w-full max-w-[1200px] mx-auto group/hero">

      {/* Particle streams (desktop only) */}
      <svg
        className="hidden md:block absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 1 }}
        viewBox="0 0 1200 520"
        preserveAspectRatio="xMidYMid meet"
        fill="none"
      >
        {/* Left → Middle: 3 streams with different wave curves */}
        <ParticleStream
          idPrefix="lm"
          paths={[
            "M 185,240 C 210,210 230,190 260,185 C 290,180 310,190 340,210 C 370,230 390,240 420,235",
            "M 185,270 C 215,270 240,255 270,250 C 300,245 330,250 360,260 C 390,270 410,270 430,265",
            "M 185,300 C 210,310 235,320 265,315 C 295,310 320,295 350,290 C 380,285 400,290 430,295",
          ]}
        />
        {/* Middle → Right: 3 streams with different wave curves */}
        <ParticleStream
          idPrefix="mr"
          paths={[
            "M 770,220 C 800,200 825,190 855,188 C 885,186 910,195 935,210 C 960,225 975,230 1000,225",
            "M 770,255 C 800,250 830,240 860,242 C 890,244 915,255 940,260 C 965,265 985,262 1010,255",
            "M 770,290 C 800,300 830,308 860,305 C 890,302 910,290 935,285 C 960,280 980,285 1010,290",
          ]}
        />
      </svg>

      {/* Cards grid — wider gaps for stream visibility */}
      <div className="relative grid grid-cols-1 md:grid-cols-[175px_1fr_300px] gap-4 md:gap-16 items-start" style={{ zIndex: 2 }}>

        {/* ===== LEFT: Detect ===== */}
        <div className="md:mt-14 transition-transform duration-500 ease-out group-hover/hero:translate-y-[-2px]" style={{ zIndex: 3 }}>
          <p className="text-[10px] font-semibold text-slate-300 uppercase tracking-[0.12em] mb-2 md:ml-1">Detect</p>
          <div className="hero-card-detect bg-white rounded-2xl border border-slate-100 p-4 transition-transform duration-300 ease-out hover:translate-y-[-6px] cursor-default">
            <div className="flex items-center gap-1.5 mb-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-medium text-emerald-600">Just now</span>
            </div>
            <p className="text-[13px] font-semibold text-slate-900 mb-3">New user signed up</p>
            <div className="flex items-center gap-2.5 bg-slate-50/80 rounded-lg p-2.5">
              <Avatar size={32} />
              <div className="min-w-0 text-left">
                <p className="text-[12px] font-medium text-slate-800">Mike Taylor</p>
                <p className="text-[10px] text-slate-400">Acme Analytics</p>
              </div>
            </div>
            <div className="mt-2.5">
              <span className="text-[9px] font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">user.signed_up</span>
            </div>
          </div>
        </div>

        {/* ===== MIDDLE: Track (anchor) ===== */}
        <div className="transition-transform duration-500 ease-out group-hover/hero:translate-y-[-3px]" style={{ zIndex: 5 }}>
          <p className="text-[10px] font-semibold text-slate-300 uppercase tracking-[0.12em] mb-2 text-center">Track</p>
          <div className="hero-card-track bg-white rounded-2xl border border-slate-100 p-6 transition-transform duration-300 ease-out hover:scale-[1.015] cursor-default">
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
              <Avatar size={40} />
              <div className="text-left">
                <p className="text-[14px] font-semibold text-slate-900">Mike Taylor</p>
                <p className="text-[12px] text-slate-400">Acme Analytics</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-[11px] font-medium text-slate-500">Day 4 of trial</p>
                <p className="text-[10px] text-slate-400">Free plan</p>
              </div>
            </div>

            <div className="space-y-0">
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[12px] shadow-sm shadow-emerald-200">&#10003;</div>
                  <div className="w-px h-5 bg-emerald-200" />
                </div>
                <div className="pt-1.5 flex-1 flex items-center justify-between">
                  <span className="text-[13px] font-medium text-slate-800 whitespace-nowrap">Signed up</span>
                  <span className="text-[10px] text-slate-400 ml-4 whitespace-nowrap">Day 1</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[12px] shadow-sm shadow-emerald-200">&#10003;</div>
                  <div className="w-px h-5 bg-slate-200" />
                </div>
                <div className="pt-1.5 flex-1 flex items-center justify-between">
                  <span className="text-[13px] font-medium text-slate-800 whitespace-nowrap">Created first dashboard</span>
                  <span className="text-[10px] text-slate-400 ml-4 whitespace-nowrap">Day 2</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-amber-50 border-2 border-amber-400 flex items-center justify-center text-amber-600 text-[13px] font-bold">!</div>
                  <div className="w-px h-5 bg-slate-200" />
                </div>
                <div className="pt-1.5 flex-1 flex items-center justify-between">
                  <span className="text-[13px] font-medium text-slate-800 whitespace-nowrap">Didn't invite a teammate</span>
                  <span className="text-[10px] text-slate-400 ml-4 whitespace-nowrap">Day 4</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-300 text-[12px]">4</div>
                </div>
                <div className="pt-1.5 flex-1 flex items-center justify-between">
                  <span className="text-[13px] text-slate-300 whitespace-nowrap">Upgrade to paid</span>
                  <span className="text-[10px] text-slate-300 ml-4 whitespace-nowrap">Day 7</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[11px] text-primary font-medium">DigiStorms is sending an email...</span>
            </div>
          </div>
        </div>

        {/* ===== RIGHT: Engage ===== */}
        <div className="md:mt-10 transition-transform duration-500 ease-out group-hover/hero:translate-y-[-2px]" style={{ zIndex: 4 }}>
          <p className="text-[10px] font-semibold text-slate-300 uppercase tracking-[0.12em] mb-2 text-center">Engage</p>
          <div className="hero-card-engage bg-white rounded-2xl border border-slate-100 p-4 transition-transform duration-300 ease-out hover:translate-y-[-6px] cursor-default">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="text-[10px] font-medium text-primary">Email sent</span>
              </div>
              <span className="text-[9px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">Auto-triggered</span>
            </div>

            <div className="bg-slate-50/60 rounded-lg p-3.5 border border-slate-100/80 text-left">
              <p className="text-[10px] text-slate-400 mb-1 text-left">To: mike@acmeanalytics.com</p>
              <p className="text-[11px] font-semibold text-slate-700 mb-2.5 pb-2 border-b border-slate-100 text-left">
                Quick tip: invite your team to get more from Acme
              </p>
              <div className="space-y-2 text-[11px] text-slate-700 leading-[1.6] text-left">
                <p>Hey Mike,</p>
                <p>
                  I noticed you created your first dashboard
                  (nice!) but haven't invited any teammates yet.
                </p>
                <p>
                  Teams that collaborate see 3x more insights
                  in their first week. Just hit "Invite" in your
                  settings.
                </p>
                <p className="pt-1">
                  I'm here if you need anything.<br />
                  Just reply to this email.
                </p>
                <p>
                  Josh
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
