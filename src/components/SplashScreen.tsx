import { useEffect, useMemo, useRef, useState } from 'react';
import { Atom } from 'lucide-react';

type Props = { exiting?: boolean };

export default function SplashScreen({ exiting = false }: Props) {
  const [percent, setPercent] = useState(0);
  const rafRef = useRef<number | null>(null);

  // Smoothly increment percentage until exiting; then complete to 100
  useEffect(() => {
    let start: number | null = null;
    const duration = 1400; // ms until near-complete
    const targetBeforeExit = 0.97; // 97%

    const step = (ts: number) => {
      if (start == null) start = ts;
      const t = Math.min(1, (ts - start) / duration);
      const next = Math.floor((exiting ? 1 : targetBeforeExit) * 100 * t);
      setPercent((p) => (next > p ? next : p));
      if (t < 1 && !exiting) {
        rafRef.current = requestAnimationFrame(step);
      } else if (exiting) {
        setPercent(100);
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [exiting]);

  const rootClasses = useMemo(
    () =>
      `fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-background-start to-background-end overflow-hidden ${
        exiting ? 'animate-[fadeOut_420ms_ease-out_forwards]' : ''
      }`,
    [exiting]
  );

  return (
    <div role="status" aria-live="polite" className={rootClasses}>
      {/* Subtle animated background accents */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full blur-3xl opacity-30 bg-[radial-gradient(circle_at_center,rgba(0,245,212,0.35),transparent_60%)] animate-float motion-reduce:animate-none" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full blur-3xl opacity-30 bg-[radial-gradient(circle_at_center,rgba(0,138,255,0.35),transparent_60%)] animate-float motion-reduce:animate-none" />

      <div className="text-center animate-fade-in">
        {/* Icon tile with orbit rings */}
        <div className="relative mx-auto w-28 h-28">
          {/* Outer orbit ring */}
          <div className="absolute inset-0 rounded-3xl border border-white/10" />
          <div className="absolute -inset-2 rounded-[28px] opacity-60 bg-[conic-gradient(from_0deg,rgba(0,245,212,0.0),rgba(0,245,212,0.25),rgba(0,138,255,0.25),rgba(0,245,212,0.0))] blur-[2px] animate-[spin_6s_linear_infinite]" />
          {/* Inner content */}
          <div className="relative z-10 w-full h-full rounded-3xl bg-gradient-to-br from-[rgba(0,245,212,0.15)] to-[rgba(0,138,255,0.15)] backdrop-blur-md border border-white/10 shadow-glow flex items-center justify-center animate-scale-in motion-reduce:animate-none">
            <Atom size={36} className="text-white drop-shadow" />
          </div>
          {/* Rotating tracer around the tile */}
          <div className="pointer-events-none absolute -inset-3 rounded-[30px] border-t-2 border-[rgba(0,245,212,0.35)] opacity-70 animate-[spin_3.5s_linear_infinite] motion-reduce:animate-none" />
        </div>

        <h1 className="mt-6 text-3xl sm:text-4xl font-heading font-extrabold text-white">
          Xovaxy
          <span className="relative inline-block align-baseline">
            <span className="text-gradient">Labs</span>
            {/* Shimmer overlay */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent [background-size:200%_100%] animate-[shine_2s_linear_infinite] mix-blend-screen rounded-sm" aria-hidden="true" />
          </span>
        </h1>
        <p className="mt-2 text-text-secondary text-sm">Loading your lab experience… {percent}%</p>

        {/* Animated loading bar */}
        <div className="mx-auto mt-5 h-1.5 w-44 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-gradient-to-r from-accent-primary to-accent-secondary transition-[width] duration-200"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Keyframes for fade-out and shimmer */}
      <style>{`
        @keyframes fadeOut { from { opacity: 1 } to { opacity: 0 } }
        @keyframes shine { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }
      `}</style>
    </div>
  );
}
