"use client";

import { Fragment, useMemo, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import clsx from "clsx";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import type { LandingCopy, LocaleKey, LotDetail, LotStatus } from "@/content/landing";
import { metricEvents, trackEvent } from "@/lib/metrics";

interface AvailabilityMapProps {
  locale: LocaleKey;
  copy: LandingCopy["availability"];
  lots: LotDetail[];
}

const statusStyles: Record<LotStatus, string> = {
  available: "bg-emerald-100 text-emerald-700 border-emerald-200",
  reserved: "bg-amber-100 text-amber-700 border-amber-200",
  sold: "bg-rose-100 text-rose-700 border-rose-200",
};

const localeLabels: Record<LocaleKey, {
  all: string;
  close: string;
  status: string;
  price: string;
  size: string;
  conditions: string;
}> = {
  pt: {
    all: "Todos",
    close: "Fechar",
    status: "Status",
    price: "Pre\u00e7o",
    size: "Metragem",
    conditions: "Condi\u00e7\u00f5es",
  },
  en: {
    all: "All",
    close: "Close",
    status: "Status",
    price: "Price",
    size: "Lot size",
    conditions: "Terms",
  },
  es: {
    all: "Todos",
    close: "Cerrar",
    status: "Estado",
    price: "Precio",
    size: "Metraje",
    conditions: "Condiciones",
  },
};

export function AvailabilityMap({ locale, copy, lots }: AvailabilityMapProps) {
  const [activeStatus, setActiveStatus] = useState<LotStatus | "all">("available");
  const [selectedLot, setSelectedLot] = useState<LotDetail | null>(null);

  const filtered = useMemo(() => {
    if (activeStatus === "all") return lots;
    return lots.filter((lot) => lot.status === activeStatus);
  }, [activeStatus, lots]);

  function openLot(lot: LotDetail) {
    setSelectedLot(lot);
    trackEvent(metricEvents.MAP_OPEN, { locale, lotId: lot.id, status: lot.status });
  }

  function closeModal() {
    setSelectedLot(null);
  }

  function handleCta(lot: LotDetail) {
    trackEvent(metricEvents.LOT_CTA_CLICK, { locale, lotId: lot.id });
    const form = document.getElementById("lead-form");
    if (form) {
      form.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    closeModal();
  }

  const hasLots = filtered.length > 0;

  return (
    <section id="availability" className="bg-white py-20" aria-labelledby="availability-title">
      <div className="container">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl space-y-4">
            <h2 id="availability-title" className="text-3xl font-bold text-brand-primary">
              {copy.title}
            </h2>
            <p className="text-neutral-600">{copy.description}</p>
          </div>
          <div className="flex gap-2">
            {(Object.keys(copy.filterLabels) as LotStatus[]).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setActiveStatus(status)}
                className={clsx(
                  "rounded-full border px-4 py-2 text-sm font-medium transition focus-ring",
                  activeStatus === status
                    ? "border-brand-accent bg-brand-accent text-white"
                    : "border-neutral-200 bg-white text-brand-primary hover:border-brand-accent hover:text-brand-accent"
                )}
              >
                {copy.filterLabels[status]}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setActiveStatus("all")}
              className={clsx(
                "rounded-full border px-4 py-2 text-sm font-medium transition focus-ring",
                activeStatus === "all"
                  ? "border-brand-primary bg-brand-primary text-white"
                  : "border-neutral-200 bg-white text-brand-primary/70 hover:border-brand-accent hover:text-brand-accent"
              )}
            >
              {localeLabels[locale].all}
            </button>
          </div>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-[1fr_minmax(220px,280px)]">
          <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
            {filtered.map((lot) => (
              <button
                key={lot.id}
                type="button"
                onClick={() => openLot(lot)}
                className={clsx(
                  "aspect-square rounded-xl border text-sm font-semibold transition focus-ring",
                  statusStyles[lot.status],
                  "hover:scale-[1.02]"
                )}
                aria-label={`${lot.id} - ${copy.legend[lot.status]}`}
              >
                {lot.id}
              </button>
            ))}
          </div>
          <div className="rounded-xl border border-neutral-200 bg-neutral-100/80 p-6">
            <p className="text-sm font-medium text-brand-primary">Legenda</p>
            <ul className="mt-4 space-y-3 text-sm text-neutral-600">
              {(Object.keys(copy.legend) as LotStatus[]).map((status) => (
                <li key={status} className="flex items-center gap-3">
                  <span
                    className={clsx("inline-block h-4 w-4 rounded-full border", statusStyles[status])}
                    aria-hidden
                  />
                  {copy.legend[status]}
                </li>
              ))}
            </ul>
            {!hasLots ? (
              <p className="mt-6 text-sm text-neutral-500">{copy.empty}</p>
            ) : null}
          </div>
        </div>

        <Transition show={selectedLot !== null} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={closeModal}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-brand-primary/60" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-200"
                  enterFrom="opacity-0 translate-y-4"
                  enterTo="opacity-100 translate-y-0"
                  leave="ease-in duration-150"
                  leaveFrom="opacity-100 translate-y-0"
                  leaveTo="opacity-0 translate-y-4"
                >
                  <Dialog.Panel className="w-full max-w-lg transform rounded-2xl bg-white p-8 text-left shadow-xl transition-all">
                    {selectedLot ? (
                      <div className="space-y-4">
                        <Dialog.Title className="text-2xl font-semibold text-brand-primary">
                          {copy.modal.title} - {selectedLot.id}
                        </Dialog.Title>
                        <div className="space-y-2 text-sm text-neutral-600">
                          <p>
                            <strong>{localeLabels[locale].status}:</strong> {copy.legend[selectedLot.status]}
                          </p>
                          <p>
                            <strong>{localeLabels[locale].price}:</strong> {selectedLot.price}
                          </p>
                          <p>
                            <strong>{localeLabels[locale].size}:</strong> {selectedLot.size}
                          </p>
                          <p>
                            <strong>{localeLabels[locale].conditions}:</strong> {selectedLot.conditions}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCta(selectedLot)}
                          className="inline-flex w-full items-center justify-center gap-3 rounded-xl bg-brand-accent px-6 py-3 text-base font-semibold text-white shadow-soft transition hover:bg-brand-accentLight focus-ring"
                        >
                          {copy.modal.callToAction}
                          <ArrowRightIcon className="h-5 w-5" aria-hidden />
                        </button>
                        <button
                          type="button"
                          onClick={closeModal}
                          className="w-full rounded-xl border border-neutral-200 px-6 py-3 text-sm font-medium text-neutral-500 transition hover:border-neutral-400 focus-ring"
                        >
                          {localeLabels[locale].close}
                        </button>
                      </div>
                    ) : null}
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      </div>
    </section>
  );
}

