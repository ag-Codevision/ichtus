import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ToastProvider } from "@/components/ui/toast";
import { WhatsAppButton } from "@/components/layout/whatsapp-button";
import { MobileAppMenu } from "@/components/layout/mobile-app-menu";

export const metadata: Metadata = {
  title: "ICTHUS Soluções e Design | Comunicação Visual & Fachadas Premium",
  description:
    "Especialistas em fachadas comerciais em ACM, letreiros luminosos em LED, corte router CNC, impressão digital de grande formato e sinalização arquitetônica de elite.",
  keywords: [
    "comunicação visual",
    "fachadas comerciais",
    "ACM",
    "letreiro luminoso",
    "letras caixa",
    "corte laser router",
    "adesivagem frotas",
    "ICTHUS",
    "ICTHUS Soluções e Design",
  ],
  authors: [{ name: "ICTHUS Soluções e Design" }],
  openGraph: {
    title: "ICTHUS Soluções e Design | Comunicação Visual & Fachadas Premium",
    description:
      "Transformamos marcas em marcos arquitetônicos com design de elite, tecnologia de ponta e materiais industriais nobres.",
    locale: "pt_BR",
    type: "website",
  },
  icons: {
    icon: "/icon-web.png",
    shortcut: "/icon-web.png",
    apple: "/icon-web.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className="dark"
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Manrope:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('glessios-theme');
                  var theme = saved === 'light' ? 'light' : 'dark';
                  document.documentElement.classList.remove('dark', 'light');
                  document.documentElement.classList.add(theme);
                  document.documentElement.setAttribute('data-theme', theme);
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="bg-[#F8F9FA] dark:bg-glessios-black text-zinc-900 dark:text-glessios-text-body font-sans antialiased selection:bg-glessios-orange selection:text-white transition-colors duration-200">
        <ThemeProvider>
          <ToastProvider>
          {children}
          <WhatsAppButton />
          <MobileAppMenu />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
