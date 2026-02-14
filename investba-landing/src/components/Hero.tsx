"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowDownTrayIcon,
  MapIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { metricEvents, trackEvent } from "@/lib/metrics";
import type { LandingCopy, LocaleKey } from "@/content/landing";

interface HeroProps {
  copy: LandingCopy["hero"];
  locale: LocaleKey;
}

export function Hero({ copy, locale }: HeroProps) {
  useEffect(() => {
    trackEvent(metricEvents.VIEW_HERO, { locale });
  }, [locale]);

  function handlePrimaryClick() {
    trackEvent(metricEvents.CTA_CLICK, {
      variant: "primary",
      from: "hero",
      locale,
    });
    trackEvent(metricEvents.FILE_DOWNLOAD, {
      locale,
      label: copy.pdfLabel,
      position: "hero",
    });
  }

  function handleSecondaryClick() {
    trackEvent(metricEvents.CTA_CLICK, {
      variant: "secondary",
      from: "hero",
      locale,
    });
  }

  return (
    <section
      id="inicio"
      className="relative overflow-hidden bg-gradient-to-br from-brand-primary via-brand-primary to-neutral-900 text-white"
    >
      <div className="absolute inset-0 opacity-20">
        <Image
          src="/images/hero-pattern.png"
          alt="Fundo InvestBA"
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
      </div>
      <div className="container relative z-10 flex flex-col gap-12 py-20 md:flex-row md:items-center">
        <div className="flex-1 space-y-8">
          <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/"
              aria-label="InvestBA"
              className="flex items-center gap-3 text-white/90 transition hover:text-white"
            >
              <Image src="/logo.svg" alt="InvestBA" width={160} height={44} priority />
            </Link>
            <LanguageSwitcher currentLocale={locale} />
          </header>
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium uppercase tracking-wide text-white/90 backdrop-blur">
            <ShieldCheckIcon className="h-5 w-5" aria-hidden />
            {copy.eyebrow}
          </p>
          <div className="space-y-6">
            <h1 className="max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">
              {copy.headline}
            </h1>
            <p className="max-w-2xl text-lg text-white/80 sm:text-xl">{copy.subheadline}</p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            <a
              href="/investba-roi-study.pdf"
              download
              className="inline-flex items-center justify-center gap-3 rounded-xl bg-brand-accent px-6 py-3 text-base font-semibold text-white shadow-soft transition hover:bg-brand-accentLight focus-ring"
              onClick={handlePrimaryClick}
            >
              <ArrowDownTrayIcon className="h-5 w-5" aria-hidden />
              {copy.primaryCta}
            </a>
            <a
              href="#availability"
              className="inline-flex items-center justify-center gap-3 rounded-xl border border-white/20 px-6 py-3 text-base font-semibold text-white/90 transition hover:border-white hover:text-white focus-ring"
              onClick={handleSecondaryClick}
            >
              <MapIcon className="h-5 w-5" aria-hidden />
              {copy.secondaryCta}
            </a>
          </div>
          <ul className="flex flex-wrap items-center gap-3 text-sm text-white/80">
            {copy.microSeals.map((seal) => (
              <li
                key={seal}
                className="rounded-full border border-white/20 px-4 py-2 text-xs font-medium uppercase tracking-wide"
              >
                {seal}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex-1">
          <div className="relative mx-auto max-w-lg rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur shadow-soft">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
              <Image
                src="/images/hero-visual.webp"
                alt="Masterplan InvestBA"
                fill
                sizes="(min-width: 768px) 45vw, 90vw"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

