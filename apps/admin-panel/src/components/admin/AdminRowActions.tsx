import Link from 'next/link';

export function AdminRowActions({
  base,
  id,
}: {
  base: string;
  id: string;
}) {
  return (
    <span className="inline-flex gap-2 text-xs">
      <Link href={`${base}/${id}`} className="text-emerald-500 hover:underline">
        View
      </Link>
      <Link href={`${base}/${id}/edit`} className="text-sky-400 hover:underline">
        Edit
      </Link>
    </span>
  );
}
