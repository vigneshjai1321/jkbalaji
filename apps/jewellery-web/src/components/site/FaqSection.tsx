type Item = { q: string; a: string };

export function FaqSection({ title, items }: { title: string; items: Item[] }) {
  return (
    <section id="faq" className="re-section">
      <div className="re-container max-w-3xl">
      <h2 className="re-heading text-center reveal">{title}</h2>
      <div className="mt-10 space-y-3">
        {items.map((item) => (
          <details key={item.q} className="reveal group rounded-2xl border border-slate-200 bg-white p-5 open:shadow-md open:border-emerald-100 transition-shadow">
            <summary className="cursor-pointer font-medium list-none flex justify-between items-center">
              {item.q}
              <span className="text-slate-400 group-open:rotate-45 transition-transform">+</span>
            </summary>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">{item.a}</p>
          </details>
        ))}
      </div>
      </div>
    </section>
  );
}
