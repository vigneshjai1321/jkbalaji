import type { LucideIcon } from 'lucide-react';
import { Building2, ClipboardList, Globe2, Home, MessageSquare } from 'lucide-react';
import { RE_ROUTES } from '@/lib/site-routes';

export type RealEstateService = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  enquiryHref: string;
  enquiryLabel: string;
};

export const REAL_ESTATE_SERVICES: RealEstateService[] = [
  {
    id: 'plots',
    title: 'Residential Plots & Developments',
    description: 'Explore residential plot opportunities across our projects.',
    icon: Home,
    enquiryHref: `${RE_ROUTES.home}#property-enquiry`,
    enquiryLabel: 'Enquire',
  },
  {
    id: 'consultancy',
    title: 'Real Estate Consultancy',
    description: 'Guidance on property options, locations, documentation, and purchase procedures.',
    icon: ClipboardList,
    enquiryHref: RE_ROUTES.contact,
    enquiryLabel: 'Contact team',
  },
  {
    id: 'management',
    title: 'Property Management',
    description: 'Enquire about assistance with property management and coordination.',
    icon: Building2,
    enquiryHref: RE_ROUTES.contact,
    enquiryLabel: 'Enquire',
  },
  {
    id: 'nri',
    title: 'NRI Property Management & Assistance',
    description:
      'Property-related assistance for non-resident Indians who need support managing property in India, subject to services offered by our team.',
    icon: Globe2,
    enquiryHref: RE_ROUTES.contact,
    enquiryLabel: 'Enquire',
  },
  {
    id: 'guidance',
    title: 'Property Enquiries & Guidance',
    description: 'Share your requirements for relevant details, pricing, availability, and next steps.',
    icon: MessageSquare,
    enquiryHref: `${RE_ROUTES.home}#property-enquiry`,
    enquiryLabel: 'Share requirements',
  },
];
