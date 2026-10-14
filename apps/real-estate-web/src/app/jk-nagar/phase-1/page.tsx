import { JkNagarPhasePage } from '@/components/realestate/JkNagarPhasePage';
import { reStaticMetadata } from '@/lib/seo/metadata';

export const metadata = reStaticMetadata('jkNagarPhase1');

export default function Page() {
  return <JkNagarPhasePage phaseId="phase-1" />;
}
