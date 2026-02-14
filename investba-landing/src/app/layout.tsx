import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID;
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

export const metadata: Metadata = {
  metadataBase: new URL("https://www.investba.com.br"),
  title: {
    default: "InvestBA ? Onde vis?o encontra oportunidade",
    template: "%s | InvestBA",
  },
  description:
    "Empreendimentos com seguran?a jur?dica, infraestrutura em evolu??o e potencial de valoriza??o na Bahia.",
  alternates: {
    canonical: "/",
    languages: {
      "pt-BR": "/",
      "en-US": "/en",
      "es-ES": "/es",
    },
  },
  openGraph: {
    title: "InvestBA ? Onde vis?o encontra oportunidade",
    description:
      "Conhe?a empreendimentos estrat?gicos com governan?a, transpar?ncia e estudo de ROI completo.",
    type: "website",
    locale: "pt_BR",
    url: "https://www.investba.com.br/",
    siteName: "InvestBA",
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "InvestBA ? Onde vis?o encontra oportunidade",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "InvestBA ? Onde vis?o encontra oportunidade",
    description:
      "Empreendimentos com seguran?a jur?dica, infraestrutura em evolu??o e potencial de valoriza??o.",
    images: ["/og.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#0B132B",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {GTM_ID ? (
          <Script id="gtm-init" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`}
          </Script>
        ) : null}
        {GA4_ID ? (
          <>
            <Script
              id="ga4-loader"
              src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', '${GA4_ID}', { send_page_view: false });`}
            </Script>
          </>
        ) : null}
      </head>
      <body className="min-h-screen bg-neutral-100 font-sans antialiased">
        {GTM_ID ? (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
              title="gtm"
            />
          </noscript>
        ) : null}
        <LCPReporter />
        {children}
      </body>
    </html>
  );
}

function LCPReporter() {
  return (
    <Script id="lcp-reporter" strategy="afterInteractive">
      {`(function(){
if (typeof window === 'undefined') return;
try {
  const observer = new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries();
    const lastEntry = entries[entries.length - 1];
    if (!lastEntry) return;
    const lcp = lastEntry.renderTime || lastEntry.loadTime || lastEntry.startTime;
    if (!lcp) return;
    const detail = { event: 'lcp_report', value: Math.round(lcp) };
    if (window.gtag) {
      window.gtag('event', 'lcp_report', detail);
    }
    if (window.dataLayer) {
      window.dataLayer.push({ ...detail });
    }
    console.info('[metrics] lcp_report', detail);
    observer.disconnect();
  });
  observer.observe({ type: 'largest-contentful-paint', buffered: true });
} catch (error) {
  console.info('[metrics] lcp observer unavailable', error);
}
})();`}
    </Script>
  );
}
