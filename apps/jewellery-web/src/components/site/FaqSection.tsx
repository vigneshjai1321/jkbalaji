type Item = { q: string; a: string };

export function FaqSection({ title, items }: { title: string; items: Item[] }) {
  return (
    <section id="faq" className="jw-section-inner bg-[#faf8f4]">
      <div className="jw-container max-w-3xl">
        <h1 className="jw-heading text-2xl font-semibold text-stone-900">{title}</h1>
        <div className="mt-5 space-y-2">
          {items.map((item) => (
            <details
              key={item.q}
              className="group rounded-xl border border-stone-200 bg-white p-4 open:border-amber-200/80 open:shadow-sm"
            >
              <summary className="cursor-pointer text-sm font-medium list-none flex justify-between items-center gap-3">
                {item.q}
                <span className="text-stone-400 group-open:rotate-45 transition-transform shrink-0">+</span>
              </summary>
              <p className="mt-2 text-sm text-stone-600 leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
