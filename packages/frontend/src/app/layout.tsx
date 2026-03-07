import type { Metadata } from "next";
import { Playfair_Display, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "AutoDev - AI-Powered Codebase Onboarding",
  description:
    "Understand any codebase in minutes. AI-powered architecture maps, walkthroughs, and Q&A.",
};

import { ClerkProvider } from '@clerk/nextjs'

const clerkAppearance = {
  variables: {
    colorBackground: "#1E1D1C",
    colorText: "#F0EEE6",
    colorTextSecondary: "#8A8480",
    colorPrimary: "#E25A34",
    colorInputBackground: "#111110",
    colorInputText: "#F0EEE6",
    colorNeutral: "#8A8480",
    borderRadius: "0px",
    fontFamily: "JetBrains Mono, monospace",
    fontSize: "13px",
  },
  elements: {
    card: { background: "#1E1D1C", border: "1px solid #2A2726", borderRadius: "0px", boxShadow: "0 20px 60px rgba(0,0,0,0.7)" },
    headerTitle: { color: "#F0EEE6", fontFamily: "Georgia, serif", fontSize: "18px", fontWeight: "600" },
    headerSubtitle: { color: "#8A8480", fontFamily: "JetBrains Mono, monospace", fontSize: "12px" },
    socialButtonsBlockButton: { background: "#111110", border: "1px solid #2A2726", borderRadius: "0px", color: "#F0EEE6" },
    socialButtonsBlockButtonText: { color: "#F0EEE6", fontFamily: "JetBrains Mono, monospace", fontSize: "13px" },
    dividerLine: { background: "#2A2726" },
    dividerText: { color: "#8A8480", fontFamily: "JetBrains Mono, monospace", fontSize: "11px" },
    formFieldLabel: { color: "#8A8480", fontFamily: "JetBrains Mono, monospace", fontSize: "11px", textTransform: "uppercase" as const, letterSpacing: "0.05em" },
    formFieldInput: { background: "#111110", border: "1px solid #2A2726", borderRadius: "0px", color: "#F0EEE6", fontFamily: "JetBrains Mono, monospace", fontSize: "13px" },
    formButtonPrimary: { background: "#E25A34", color: "#111110", borderRadius: "0px", fontFamily: "JetBrains Mono, monospace", fontWeight: "600", boxShadow: "none" },
    footer: { background: "#111110", borderTop: "1px solid #2A2726", borderRadius: "0px" },
    footerAction: { background: "#111110" },
    footerActionText: { color: "#8A8480", fontFamily: "JetBrains Mono, monospace", fontSize: "12px" },
    footerActionLink: { color: "#E25A34", fontFamily: "JetBrains Mono, monospace", fontSize: "12px" },
    footerPages: { background: "#111110", borderTop: "1px solid #2A2726" },
    footerPagesLink: { color: "#8A8480", fontFamily: "JetBrains Mono, monospace", fontSize: "11px" },
    identityPreviewText: { color: "#F0EEE6", fontFamily: "JetBrains Mono, monospace" },
    identityPreviewEditButton: { color: "#E25A34" },
    alert: { background: "#1A1918", border: "1px solid #2A2726", borderRadius: "0px" },
    alertText: { color: "#8A8480", fontFamily: "JetBrains Mono, monospace", fontSize: "12px" },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider appearance={clerkAppearance}>
      <html lang="en" className={`${playfairDisplay.variable} ${inter.variable} ${jetbrainsMono.variable} dark`}>
        <body className="bg-brand-bg text-brand-text min-h-screen font-body antialiased selection:bg-brand/30 selection:text-white">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
