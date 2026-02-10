import type { NormalizedLeadInput } from "@/lib/hookflow/types";

const sanitizeNumber = (value: string) => value.replace(/\D/g, "");

export const buildPersonalizedWhatsAppMessage = (
  lead: Pick<NormalizedLeadInput, "fullName">,
  strategy: string
) => {
  const firstName = lead.fullName?.split(" ")[0] ?? "tudo bem";
  return `Oi ${firstName}, tudo bem? ${strategy}`;
};

export const buildWhatsAppUrl = (phone: string | null | undefined, message: string) => {
  const fallback = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
  const normalizedPhone = sanitizeNumber(phone ?? fallback);
  if (!normalizedPhone) {
    return "#";
  }

  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
};
