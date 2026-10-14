export function VideoSection() {
  return (
    <section id="video" className="mx-auto max-w-6xl px-4 py-16">
      <h2 className="text-2xl md:text-3xl font-bold text-emerald-900 reveal">Experience Our Developments</h2>
      <p className="mt-2 text-slate-600 max-w-2xl reveal">
        Walk through premium layouts, infrastructure, and Tamil Nadu investment opportunities with JK Balaji.
      </p>
      <div className="mt-8 reveal rounded-2xl overflow-hidden border border-emerald-100 shadow-xl aspect-video bg-slate-900">
        <iframe
          className="w-full h-full min-h-[280px]"
          title="JK Balaji real estate overview video"
          src="https://www.youtube.com/embed/ee17UmsQgSU?rel=0&modestbranding=1"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>
    </section>
  );
}
