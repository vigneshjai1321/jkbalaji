export function MapEmbed({ title }: { title: string }) {
  return (
    <section id="map" className="mx-auto max-w-6xl px-4 py-12">
      <h2 className="text-2xl font-bold reveal">{title}</h2>
      <div className="mt-6 reveal rounded-2xl overflow-hidden border shadow-sm aspect-video max-h-[420px]">
        <iframe
          title="Office location on Google Maps"
          className="w-full h-full min-h-[280px]"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3890.2!2d79.285!3d12.661!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a54c5c8c8c8c8c9%3A0x0!2sCheyyar%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1"
        />
      </div>
    </section>
  );
}
