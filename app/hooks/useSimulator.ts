import { useEffect, useMemo, useRef, useState } from 'react';
import type { Locale, PresetKey, SimulatorResults, SimulatorValues } from '@/app/types';
import { buildPdf, formatCurrency } from '@/app/lib/utils';

type PdfCopy = {
  title: string;
  subtitle: string;
  propertyValue: string;
  dailyRate: string;
  occupancy: string;
  monthlyCosts: string;
  platformFee: string;
  grossMonthly: string;
  netMonthly: string;
  annualReturn: string;
  payback: string;
  paybackUnit: string;
};

type Options = {
  locale: Locale;
  reduceMotion: boolean;
  pdfCopy: PdfCopy;
};

export const useSimulator = ({ locale, reduceMotion, pdfCopy }: Options) => {
  const [values, setValues] = useState<SimulatorValues>({
    propertyValue: 250000,
    dailyRate: 250,
    occupancy: 55,
    monthlyCosts: 650,
    platformFee: 12,
  });
  const [activePreset, setActivePreset] = useState<PresetKey>('realistic');

  const results = useMemo<SimulatorResults>(() => {
    const nightsPerMonth = (30 * values.occupancy) / 100;
    const grossMonthly = nightsPerMonth * values.dailyRate;
    const platformFeeAmount = grossMonthly * (values.platformFee / 100);
    const netMonthly = grossMonthly - platformFeeAmount - values.monthlyCosts;
    const annualReturn =
      values.propertyValue > 0 ? (netMonthly * 12 * 100) / values.propertyValue : 0;
    const paybackYears = netMonthly > 0 ? values.propertyValue / (netMonthly * 12) : null;
    return {
      nightsPerMonth,
      grossMonthly,
      netMonthly,
      annualReturn,
      paybackYears,
    };
  }, [values]);

  const previousResults = useRef(results);
  const [animatedResults, setAnimatedResults] = useState(results);

  useEffect(() => {
    if (reduceMotion) {
      setAnimatedResults(results);
      previousResults.current = results;
      return;
    }
    const from = previousResults.current;
    const to = results;
    const start = performance.now();
    const duration = 420;
    let frame: number;

    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const lerp = (a: number, b: number) => a + (b - a) * progress;
      setAnimatedResults({
        nightsPerMonth: lerp(from.nightsPerMonth, to.nightsPerMonth),
        grossMonthly: lerp(from.grossMonthly, to.grossMonthly),
        netMonthly: lerp(from.netMonthly, to.netMonthly),
        annualReturn: lerp(from.annualReturn, to.annualReturn),
        paybackYears:
          to.paybackYears === null ? null : lerp(from.paybackYears ?? 0, to.paybackYears),
      });
      if (progress < 1) {
        frame = window.requestAnimationFrame(animate);
      } else {
        previousResults.current = to;
      }
    };

    frame = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frame);
  }, [reduceMotion, results]);

  const setValue = (field: keyof SimulatorValues, value: number) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const applyPreset = (presetValues: SimulatorValues, key: PresetKey) => {
    setValues(presetValues);
    setActivePreset(key);
  };

  const handleDownloadPdf = () => {
    const paybackLabel = results.paybackYears
      ? `${results.paybackYears.toFixed(1)} ${pdfCopy.paybackUnit}`
      : '-';
    const lines = [
      pdfCopy.title,
      pdfCopy.subtitle,
      '',
      `${pdfCopy.propertyValue}: ${formatCurrency(values.propertyValue, locale)}`,
      `${pdfCopy.dailyRate}: ${formatCurrency(values.dailyRate, locale)}`,
      `${pdfCopy.occupancy}: ${values.occupancy}%`,
      `${pdfCopy.monthlyCosts}: ${formatCurrency(values.monthlyCosts, locale)}`,
      `${pdfCopy.platformFee}: ${values.platformFee}%`,
      '',
      `${pdfCopy.grossMonthly}: ${formatCurrency(results.grossMonthly, locale)}`,
      `${pdfCopy.netMonthly}: ${formatCurrency(results.netMonthly, locale)}`,
      `${pdfCopy.annualReturn}: ${results.annualReturn.toFixed(1)}%`,
      `${pdfCopy.payback}: ${paybackLabel}`,
    ];
    const pdf = buildPdf(lines);
    const blob = new Blob([pdf], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'simulacao-bella-vista.pdf';
    link.click();
    URL.revokeObjectURL(url);
  };

  const formatCurrencyValue = (value: number) => formatCurrency(value, locale);

  return {
    values,
    setValue,
    activePreset,
    setActivePreset,
    applyPreset,
    results,
    animatedResults,
    handleDownloadPdf,
    formatCurrency: formatCurrencyValue,
  };
};
