'use client';

import { Suspense, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { MotionConfig } from 'framer-motion';
import { Navigation } from '@/app/components/shared/Navigation';
import { LoadingSkeleton } from '@/app/components/shared/LoadingSkeleton';
import { Hero } from '@/app/components/hero/Hero';
import { translations } from '@/app/lib/translations';
import { baseWhatsAppUrl } from '@/app/lib/constants';
import { useLocale } from '@/app/hooks/useLocale';

const Showcase = dynamic(() =>
  import('@/app/components/showcase/Showcase').then((module) => module.Showcase),
  { loading: () => <LoadingSkeleton /> }
);
const Location = dynamic(() =>
  import('@/app/components/location/Location').then((module) => module.Location),
  { loading: () => <LoadingSkeleton /> }
);
const Simulator = dynamic(() =>
  import('@/app/components/simulator/Simulator').then((module) => module.Simulator),
  { loading: () => <LoadingSkeleton /> }
);
const Progress = dynamic(() =>
  import('@/app/components/progress/Progress').then((module) => module.Progress),
  { loading: () => <LoadingSkeleton /> }
);
const FinalCta = dynamic(() =>
  import('@/app/components/cta/FinalCta').then((module) => module.FinalCta),
  { loading: () => <LoadingSkeleton /> }
);
const Contact = dynamic(() =>
  import('@/app/components/contact/Contact').then((module) => module.Contact),
  { loading: () => <LoadingSkeleton /> }
);

export default function HomePage() {
  const { locale, setLocale } = useLocale();
  const copy = translations[locale];
  const whatsappLink = useMemo(
    () => baseWhatsAppUrl + '?text=' + encodeURIComponent(copy.whatsappMessage),
    [copy.whatsappMessage]
  );

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
