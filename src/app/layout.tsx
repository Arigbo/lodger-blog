import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";
import { LayoutContent } from "@/components/layout/layout-content";
import { Suspense } from 'react';

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: {
    default: "THE COMMONS | Lodger Blog",
    template: "%s | The Commons",
  },
  description: "Exploring the intersection of community, space, and modern home life.",
  metadataBase: new URL('https://blog.lodger.app'),
  keywords: ["student living", "community", "lodger", "blog", "guides"],
  openGraph: {
    title: "The Commons - Lodger Blog",
    description: "Stories about student life, community, and modern living.",
    url: "https://blog.lodger.app",
    siteName: "The Commons",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Commons - Lodger Blog",
    description: "Stories about student life, community, and modern living.",
    images: ["/og-image.jpg"],
  },
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
