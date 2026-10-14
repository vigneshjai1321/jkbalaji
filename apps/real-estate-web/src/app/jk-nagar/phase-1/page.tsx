import type { Metadata } from 'next';
import { JkNagarPhasePage } from '@/components/realestate/JkNagarPhasePage';

export const metadata: Metadata = {
  title: 'JK Nagar Phase 1 | JK Balaji Real Estate',
  description: 'JK Nagar Phase 1 — Almost completed layout with plot enquiries through JK Balaji Real Estate, Cheyyar.',
  alternates: { canonical: 'https://jkbalaji.in/jk-nagar/phase-1' },
};

export default function Page() {
  return <JkNagarPhasePage phaseId="phase-1" />;
}
