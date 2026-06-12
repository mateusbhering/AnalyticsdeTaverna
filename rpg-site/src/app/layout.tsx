import type { Metadata } from "next";
import { Cinzel_Decorative, Cinzel, Crimson_Pro, Geist_Mono } from "next/font/google";
import "./globals.css";

const cinzelDecorative = Cinzel_Decorative({
  weight: ["400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-cinzel-decorative",
  display: "swap",
});

const cinzel = Cinzel({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
});

const crimsonPro = Crimson_Pro({
  weight: ["300", "400", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-crimson-pro",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Analytics de Taverna",
  description: "Uma experiência interativa que transforma dados comportamentais em personagens de RPG únicos — com gamificação, IA e muito estilo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${cinzelDecorative.variable} ${cinzel.variable} ${crimsonPro.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0e0e0e] text-[#f4e4bc]">
        {children}
      </body>
    </html>
  );
}
