import { ContactLeadForm } from '@/components/ContactLeadForm';
import { jwStaticMetadata } from '@/lib/seo/metadata';
import { JewelleryPageShell } from '@/components/jewellery/JewelleryPageShell';
import { JwPageHeader } from '@/components/jewellery/inner/JwInnerBlocks';
import { SRI_BALAJI } from '@/lib/jewellery-business';

export const metadata = jwStaticMetadata('contact');

export default function ContactPage() {
  return (
    <JewelleryPageShell>
      <JwPageHeader eyebrow="Contact" title="Contact Us" description="Call, message, or send an enquiry — we respond during showroom hours." />
      <section className="jw-section-inner pt-0">
        <div className="jw-container grid lg:grid-cols-2 gap-8">
          <div>
            <p className="text-sm text-stone-600">{SRI_BALAJI.addressLine}</p>
            <p className="mt-2 text-sm">
              Phone:{' '}
              <a href={`tel:${SRI_BALAJI.phoneE164}`} className="text-amber-900 font-medium">
                {SRI_BALAJI.phoneDisplay}
              </a>
            </p>
            <a href={SRI_BALAJI.directionsUrl} className="mt-2 inline-block text-sm text-amber-900 underline">
              Get directions
            </a>
            <div className="mt-6">
              <ContactLeadForm sourcePage="/contact" />
            </div>
          </div>
          <div className="text-sm text-stone-600 space-y-1.5">
            <p>{SRI_BALAJI.hours.open}</p>
            <p>{SRI_BALAJI.hours.closed}</p>
            <p className="pt-2">{SRI_BALAJI.gstNote}</p>
          </div>
        </div>
      </section>
    </JewelleryPageShell>
  );
}
