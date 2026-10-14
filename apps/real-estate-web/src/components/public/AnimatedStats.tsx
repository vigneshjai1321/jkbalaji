'use client';

import { useEffect, useRef, useState } from 'react';

function useCountUp(target: number, active: boolean) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = 0;
    const steps = 40;
    const inc = target / steps;
    const t = setInterval(() => {
      start += inc;
      if (start >= target) {
        setVal(target);
        clearInterval(t);
      } else setVal(Math.floor(start));
    }, 30);
    return () => clearInterval(t);
  }, [target, active]);
  return val;
}

const stats = [
  { n: 15, suffix: '+', l: 'Years trust' },
  { n: 50, suffix: '+', l: 'Projects' },
  { n: 1000, suffix: '+', l: 'Happy clients' },
  { n: 32, suffix: '', l: 'TN districts' },
];

export function AnimatedStats() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e?.isIntersecting && setVisible(true), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="mx-auto max-w-6xl px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
      {stats.map((s) => (
        <StatCell key={s.l} target={s.n} suffix={s.suffix} label={s.l} active={visible} />
      ))}
    </div>
  );
}

function StatCell({ target, suffix, label, active }: { target: number; suffix: string; label: string; active: boolean }) {
  const n = useCountUp(target, active);
  return (
    <div>
      <p className="text-3xl md:text-4xl font-bold tabular-nums">
        {n}
        {suffix}
      </p>
      <p className="text-sm text-emerald-100 mt-1">{label}</p>
    </div>
  );
}
