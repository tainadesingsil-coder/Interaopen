import type { Locale } from '@/app/types';

export const createCurrencyFormatter = (locale: Locale) =>
  new Intl.NumberFormat(
    locale === 'en' ? 'en-US' : locale === 'it' ? 'it-IT' : 'pt-BR',
    {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }
  );

export const formatCurrency = (value: number, locale: Locale) => {
  const formatter = createCurrencyFormatter(locale);
  return formatter.format(Math.round(value));
};

export const sanitizePdfText = (value: string) =>
  value.replace(/[^\x20-\x7E]/g, ' ');

export const escapePdfText = (value: string) =>
  sanitizePdfText(value).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

export const buildPdf = (lines: string[]) => {
  const content = lines
    .map((line, index) => {
      const y = 760 - index * 18;
      return `BT /F1 12 Tf 60 ${y} Td (${escapePdfText(line)}) Tj ET`;
    })
    .join('\n');
  let pdf = '%PDF-1.3\n';
  const offsets: number[] = [0];
  const addObject = (obj: string) => {
    offsets.push(pdf.length);
    pdf += `${obj}\n`;
  };
  addObject('1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj');
  addObject('2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj');
  addObject(
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj'
  );
  addObject(`4 0 obj << /Length ${content.length} >> stream\n${content}\nendstream\nendobj`);
  addObject('5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj');
  const xrefStart = pdf.length;
  pdf += 'xref\n0 6\n0000000000 65535 f \n';
  for (let i = 1; i <= 5; i += 1) {
    pdf += `${offsets[i].toString().padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer << /Size 6 /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return pdf;
};
