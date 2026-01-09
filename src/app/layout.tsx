import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";
import { LayoutContent } from "@/components/layout/layout-content";
import { Suspense } from 'react';

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "THE COMMONS | Lodger Blog",
  description: "Exploring the intersection of community, space, and modern home life.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable} antialiased font-sans bg-white selection:bg-primary/20`}>
        <AuthProvider>
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center animate-pulse font-headline font-black uppercase tracking-widest text-xs text-muted-foreground/40">Loading The Commons...</div>}>
            <LayoutContent>{children}</LayoutContent>
          </Suspense>
        </AuthProvider>
      </body>
    </html>
  );
}
