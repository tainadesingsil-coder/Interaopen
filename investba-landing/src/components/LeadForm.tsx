"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { CalendarIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";
import type { LandingCopy, LeadFormField, LocaleKey } from "@/content/landing";
import { metricEvents, trackEvent } from "@/lib/metrics";

interface LeadFormProps {
  copy: LandingCopy["leadForm"];
  locale: LocaleKey;
}

type FormState = Record<string, string>;

export function LeadForm({ copy, locale }: LeadFormProps) {
  const router = useRouter();
  const [formState, setFormState] = useState<FormState>(() =>
    copy.fields.reduce((acc, field) => {
      acc[field.name] = "";
      return acc;
    }, {} as FormState)
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [started, setStarted] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [scheduleConfirmed, setScheduleConfirmed] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (scheduleConfirmed && selectedSlot) {
      trackEvent(metricEvents.SCHEDULE_SUBMIT, { locale, slot: selectedSlot });
    }
  }, [scheduleConfirmed, selectedSlot, locale]);

  const scheduleSlots = useMemo(() => copy.calendar.timeSlots, [copy.calendar.timeSlots]);
  const errorMessage = useMemo(() => {
    if (locale === "en") {
      return "Something went wrong. Please try again shortly.";
    }
    if (locale === "es") {
      return "Ocurrio un error. Intentalo de nuevo.";
    }
    return "Algo deu errado. Tente novamente em instantes.";
  }, [locale]);

  const submittingLabel = useMemo(() => {
    if (locale === "en") {
      return "Sending...";
    }
    if (locale === "es") {
      return "Enviando...";
    }
    return "Enviando...";
  }, [locale]);

  function validateField(field: LeadFormField, value: string) {
    if (!value) {
      return copy.errors.required;
    }
    if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return copy.errors.email;
    }
    return "";
  }

  function handleChange(field: LeadFormField, value: string) {
    if (!started) {
      setStarted(true);
      trackEvent(metricEvents.FORM_START, { locale, field: field.name });
    }
    setFormState((prev) => ({ ...prev, [field.name]: value }));
    setErrors((prev) => ({ ...prev, [field.name]: "" }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const newErrors: Record<string, string> = {};

    copy.fields.forEach((field) => {
      const error = validateField(field, formState[field.name]);
      if (error) {
        newErrors[field.name] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    const payload = {
      ...formState,
      locale,
      scheduledSlot: scheduleConfirmed ? selectedSlot : null,
      timestamp: new Date().toISOString(),
    };

    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      trackEvent(metricEvents.FORM_SUBMIT, { locale, ...payload });
      if (scheduleConfirmed && selectedSlot) {
        trackEvent(metricEvents.SCHEDULE_SUBMIT, { locale, slot: selectedSlot });
      }

      setFeedback(copy.successMessage);
      const thankYouPath = locale === "pt" ? "/thank-you" : `/thank-you?lang=${locale}`;
      setTimeout(() => {
        router.push(thankYouPath);
      }, 600);
    } catch (error) {
      console.error(error);
      setFeedback(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  function toggleSchedule() {
    setScheduleOpen((prev) => !prev);
    if (scheduleOpen) {
      setSelectedSlot(null);
      setScheduleConfirmed(false);
    }
  }

  function confirmSchedule() {
    if (selectedSlot) {
      setScheduleConfirmed(true);
      trackEvent(metricEvents.CTA_CLICK, {
        variant: "schedule",
        from: "lead_form",
        locale,
        slot: selectedSlot,
      });
    }
  }

  const showScheduleConfirmation = scheduleOpen && selectedSlot && !scheduleConfirmed;

  return (
    <section id="lead-form" className="bg-neutral-900 py-20 text-white" aria-labelledby="lead-form-title">
      <div className="container grid gap-10 lg:grid-cols-[1fr_minmax(320px,420px)]">
        <div className="space-y-4">
          <h2 id="lead-form-title" className="text-3xl font-bold">
            {copy.title}
          </h2>
          <p className="text-neutral-300">{copy.description}</p>
          <button
            type="button"
            onClick={toggleSchedule}
            className={clsx(
              "inline-flex items-center gap-3 rounded-full border px-4 py-2 text-sm font-semibold focus-ring",
              scheduleOpen
                ? "border-brand-accent bg-brand-accent text-white"
                : "border-white/40 text-white hover:border-brand-accent"
            )}
            aria-expanded={scheduleOpen}
          >
            <CalendarIcon className="h-5 w-5" aria-hidden />
            {copy.scheduleLabel}
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-soft backdrop-blur"
        >
          <div className="grid gap-4">
            {copy.fields.map((field) => (
              <div key={field.name} className="space-y-2">
                <label htmlFor={field.name} className="text-sm font-semibold text-neutral-200">
                  {field.label}
                </label>
                {field.type === "select" ? (
                  <select
                    id={field.name}
                    name={field.name}
                    value={formState[field.name]}
                    onChange={(event) => handleChange(field, event.target.value)}
                    className="w-full rounded-xl border border-white/20 bg-neutral-900/60 px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent"
                    aria-invalid={Boolean(errors[field.name])}
                  >
                    <option value="" disabled>
                      {field.placeholder ?? "Selecione"}
                    </option>
                    {field.options?.map((option) => (
                      <option key={option.value} value={option.value} className="text-neutral-900">
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={field.name}
                    name={field.name}
                    type={field.type}
                    value={formState[field.name]}
                    onChange={(event) => handleChange(field, event.target.value)}
                    placeholder={field.placeholder}
                    className="w-full rounded-xl border border-white/20 bg-neutral-900/60 px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent"
                    aria-invalid={Boolean(errors[field.name])}
                  />
                )}
                {errors[field.name] ? (
                  <p className="text-xs text-rose-300" role="alert">
                    {errors[field.name]}
                  </p>
                ) : null}
              </div>
            ))}
          </div>

          {scheduleOpen ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-white">{copy.calendar.title}</p>
                <p className="text-xs text-neutral-300">{copy.calendar.subtitle}</p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {scheduleSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => {
                      setSelectedSlot(slot);
                      setScheduleConfirmed(false);
                    }}
                    className={clsx(
                      "rounded-xl border px-3 py-2 text-sm font-semibold focus-ring",
                      selectedSlot === slot
                        ? "border-brand-accent bg-brand-accent text-white"
                        : "border-white/20 text-white hover:border-brand-accent"
                    )}
                  >
                    {slot}
                  </button>
                ))}
              </div>
              {showScheduleConfirmation ? (
                <button
                  type="button"
                  onClick={confirmSchedule}
                  className="mt-4 w-full rounded-xl bg-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-accent focus-ring"
                >
                  {copy.calendar.confirmLabel}
                </button>
              ) : null}
              {scheduleConfirmed && selectedSlot ? (
                <p className="mt-3 text-xs text-emerald-200">
                  {copy.scheduleNote} - {selectedSlot}
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="space-y-3">
            <label className="flex items-start gap-3 text-xs text-neutral-300">
              <input
                type="checkbox"
                required
                className="mt-1 h-4 w-4 rounded border-white/30 bg-transparent text-brand-accent focus:ring-brand-accent"
              />
              <span>{copy.lgpd}</span>
            </label>
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-3 rounded-xl bg-brand-accent px-6 py-3 text-base font-semibold text-white shadow-soft transition hover:bg-brand-accentLight focus-ring disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting}
              onClick={() => trackEvent(metricEvents.CTA_CLICK, { variant: "primary", from: "lead_form", locale })}
            >
              <PaperAirplaneIcon className="h-5 w-5" aria-hidden />
              {isSubmitting ? submittingLabel : copy.submitLabel}
            </button>
            {feedback ? <p className="text-sm text-neutral-200">{feedback}</p> : null}
          </div>
        </form>
      </div>
    </section>
  );
}

