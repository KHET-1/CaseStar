import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Stars } from "@/components/ui/Stars";
import { SettingsProvider } from '@/context/SettingsContext';
import { AdminPanel } from '@/components/AdminPanel';
import { Toaster } from 'sonner';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CaseStar - AI-Powered Legal Case Management",
  description: "Intelligent legal case management with AI-powered document analysis and vector search",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-[var(--bg)] text-[var(--text)] antialiased overflow-x-hidden`}
      >
        <SettingsProvider>
          <Stars />
          <div className="relative z-10">
            <AdminPanel />
            {children}
          </div>
          <Toaster theme="dark" position="top-center" richColors />
        </SettingsProvider>
      </body>
    </html>
  );
}
