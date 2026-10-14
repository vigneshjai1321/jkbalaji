type Item = { q: string; a: string };

export function FaqSection({ title, items, compact }: { title: string; items: Item[]; compact?: boolean }) {
  return (
    <section id="faq" className={compact ? 're-faq-compact re-section' : 're-section'}>
      <div className="re-container max-w-3xl">
        <h2 className={`re-heading ${compact ? 'text-left text-xl md:text-2xl' : 'text-center'}`}>{title}</h2>
        <div className={`space-y-2 ${compact ? 'mt-5' : 'mt-10'}`}>
          {items.map((item) => (
            <details
              key={item.q}
              className="group rounded-xl border border-slate-200 bg-white p-4 open:shadow-sm open:border-emerald-100 transition-shadow"
            >
              <summary className="cursor-pointer text-sm font-medium list-none flex justify-between items-center gap-3">
                {item.q}
                <span className="text-slate-400 group-open:rotate-45 transition-transform shrink-0">+</span>
              </summary>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
