const partners = ['TNHB Partner', 'DTCP Approved', 'RERA Ready', 'Bank Loan Tie-ups', 'Legal Advisory', 'Site Engineers'];

export function PartnerBrands() {
  return (
    <div className="flex flex-wrap justify-center gap-3 md:gap-4">
      {partners.map((p) => (
        <span
          key={p}
          className="px-4 py-2 rounded-full text-xs md:text-sm font-semibold tracking-wide uppercase bg-white/80 border border-emerald-100 text-emerald-900 shadow-sm hover:shadow-md transition-shadow"
        >
          {p}
        </span>
      ))}
    </div>
  );
}
