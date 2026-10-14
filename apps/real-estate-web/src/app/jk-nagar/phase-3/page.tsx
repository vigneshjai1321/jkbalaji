import type { Metadata } from 'next';
import { JkNagarPhasePage } from '@/components/realestate/JkNagarPhasePage';

export const metadata: Metadata = {
  title: 'JK Nagar Phase 3 | JK Balaji Real Estate',
  description: 'JK Nagar Phase 3 — yet to be announced. Register interest with JK Balaji Real Estate.',
  alternates: { canonical: 'https://jkbalaji.in/jk-nagar/phase-3' },
};

export default function Page() {
  return <JkNagarPhasePage phaseId="phase-3" />;
}
