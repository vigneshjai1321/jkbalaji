import type { Metadata } from 'next';
import { JkNagarPhasePage } from '@/components/realestate/JkNagarPhasePage';

export const metadata: Metadata = {
  title: 'JK Nagar Phase 2 | JK Balaji Real Estate',
  description: 'JK Nagar Phase 2 — ongoing development. Contact JK Balaji for current plot enquiry and site visits.',
  alternates: { canonical: 'https://jkbalaji.in/jk-nagar/phase-2' },
};

export default function Page() {
  return <JkNagarPhasePage phaseId="phase-2" />;
}
