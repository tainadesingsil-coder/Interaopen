"use client";

import { useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { localeConfig, type LocaleKey } from "@/content/landing";

interface LanguageSwitcherProps {
  currentLocale: LocaleKey;
  className?: string;
}

export function LanguageSwitcher({ currentLocale, className }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const normalizedPath = pathname ?? "/";
  const pathWithoutLocale = normalizedPath.replace(/^\/(en|es)(?=\/|$)/, "");

  function resolveTargetPath(locale: LocaleKey) {
    if (locale === "pt") {
      return pathWithoutLocale === "" ? "/" : pathWithoutLocale;
    }
    const basePath = localeConfig[locale].path;
    return `${basePath}${pathWithoutLocale}`.replace(/\/$/, "");
  }

  function handleSwitch(locale: LocaleKey) {
    if (locale === currentLocale) return;
    const target = resolveTargetPath(locale);
    startTransition(() => {
      const search = typeof window !== "undefined" ? window.location.search : "";
      const hash = typeof window !== "undefined" ? window.location.hash : "";
      router.push(`${target}${search}${hash}`);
    });
  }

  return (
    <div className={clsx("flex items-center gap-1 rounded-full bg-white/60 p-1 shadow-sm", className)}>
      {(Object.keys(localeConfig) as LocaleKey[]).map((locale) => {
        const config = localeConfig[locale];
        const isActive = locale === currentLocale;
        return (
          <button
            key={locale}
            type="button"
            onClick={() => handleSwitch(locale)}
            disabled={isPending || isActive}
            className={clsx(
              "px-3 py-1 text-sm font-medium transition-all focus-ring",
              isActive
                ? "bg-brand-primary text-white shadow-soft"
                : "text-brand-primary/80 hover:text-brand-primary",
              isPending && !isActive && "opacity-60"
            )}
            aria-pressed={isActive}
          >
            {config.label}
          </button>
        );
      })}
    </div>
  );
}

