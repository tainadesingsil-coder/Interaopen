'use client';

import { Suspense } from 'react';
import { MotionConfig } from 'framer-motion';
import { Navigation } from '@/app/components/shared/Navigation';
import { LoadingSkeleton } from '@/app/components/shared/LoadingSkeleton';
import { Hero } from '@/app/components/hero/Hero';
import { Showcase } from '@/app/components/showcase/Showcase';
import { Location } from '@/app/components/location/Location';
import { Simulator } from '@/app/components/simulator/Simulator';
import { Progress } from '@/app/components/progress/Progress';
import { FinalCta } from '@/app/components/cta/FinalCta';
import { Contact } from '@/app/components/contact/Contact';
import { translations } from '@/app/lib/translations';
import { baseWhatsAppUrl } from '@/app/lib/constants';
import { useLocale } from '@/app/hooks/useLocale';

export default function HomePage() {
  const { locale, setLocale } = useLocale();
  const copy = translations[locale];
  const whatsappLink =
    baseWhatsAppUrl + '?text=' + encodeURIComponent(copy.whatsappMessage);

  return (
    <MotionConfig reducedMotion='user'>
      <div className='bg-[var(--bg-0)] text-[var(--text)]'>
        <Navigation
          labels={copy.nav}
          whatsappLink={whatsappLink}
          menuLabel={copy.nav.menu}
          menuAria={copy.nav.menuAria}
          locale={locale}
          onLocaleChange={setLocale}
        />
        <main id='main-content'>
          <Hero copy={copy.hero} whatsappLink={whatsappLink} />
          <Showcase copy={copy.showcase} />
          <Location copy={copy.location} mapTitle={copy.map.title} />
          <Suspense fallback={<LoadingSkeleton />}>
            <Simulator
              locale={locale}
              copy={copy.simulator}
              pdfCopy={copy.pdf}
              whatsappLink={whatsappLink}
            />
          </Suspense>
          <Progress copy={copy.progress} />
          <FinalCta copy={copy.finalCta} whatsappLink={whatsappLink} />
          <Contact copy={copy.contact} whatsappLink={whatsappLink} />
        </main>
      </div>
    </MotionConfig>
  );
}
