'use client';

import { useEffect, useState } from 'react';

const defaultItems = [
  { n: 'Ramesh K.', t: 'Clear documentation and smooth plot booking in Cheyyar.', role: 'Plot buyer' },
  { n: 'Priya M.', t: 'Professional team — helped us choose the right investment layout.', role: 'Investor' },
  { n: 'Arun V.', t: 'Transparent pricing and timely site visits across Tamil Nadu.', role: 'NRI client' },
  { n: 'Lakshmi S.', t: 'DTCP approval verified before we paid — highly recommend JK Balaji.', role: 'Home buyer' },
];

export function TestimonialsCarousel({ items = defaultItems }: { items?: typeof defaultItems }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % items.length), 5000);
    return () => clearInterval(t);
  }, [items.length]);

  const item = items[i]!;

  return (
    <div className="relative max-w-3xl mx-auto">
      <blockquote className="glass-panel-light rounded-2xl border border-emerald-100 p-8 text-center shadow-lg min-h-[180px] flex flex-col justify-center">
        <p className="text-lg text-slate-700 leading-relaxed">&ldquo;{item.t}&rdquo;</p>
        <footer className="mt-4">
          <p className="font-semibold text-emerald-900">{item.n}</p>
          <p className="text-xs text-slate-500 mt-1">{item.role}</p>
        </footer>
      </blockquote>
      <div className="flex justify-center gap-2 mt-4">
        {items.map((_, idx) => (
          <button
            key={idx}
            type="button"
            aria-label={`Testimonial ${idx + 1}`}
            onClick={() => setI(idx)}
            className={`h-2 rounded-full transition-all ${idx === i ? 'w-6 bg-emerald-700' : 'w-2 bg-emerald-200'}`}
          />
        ))}
      </div>
    </div>
  );
}
