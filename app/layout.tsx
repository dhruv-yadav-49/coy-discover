import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Coy Discover | Privacy-First Discovery & Matches",
  description:
    "A modern, mobile-first swipe discovery application inspired by Tinder and Bumble, built with Next.js, TypeScript, Tailwind CSS, Framer Motion, and MongoDB.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="overflow-x-clip">
      <body className="min-h-screen bg-slate-50 flex flex-col selection:bg-purple-100 selection:text-purple-900 overflow-x-clip antialiased">
        <main className="flex-1 flex flex-col w-full">{children}</main>
      </body>
    </html>
  );
}
