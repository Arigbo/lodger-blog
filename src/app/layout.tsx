import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { AuthProvider } from "@/components/providers/auth-provider";
import { AuthModal } from "@/components/auth/auth-modal";
import { useSearchParams } from 'next/navigation';
import { useAuth } from "@/components/providers/auth-provider";
import { AlertCircle, ExternalLink } from "lucide-react";
import { useEffect } from 'react';

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
          <LayoutContent>{children}</LayoutContent>
        </AuthProvider>
      </body>
    </html>
  );
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { openAuthModal, user } = useAuth();
  const searchParams = useSearchParams();

  useEffect(() => {
    const authAction = searchParams.get('auth');
    if (authAction === 'login') openAuthModal('login');
    if (authAction === 'signup') openAuthModal('signup');
  }, [searchParams, openAuthModal]);

  return (
    <div className="flex flex-col min-h-screen">
      {user?.isIncomplete && (
        <div className="bg-primary text-white py-3 px-6 text-center text-[10px] font-black uppercase tracking-[0.2em] relative z-[60] flex items-center justify-center gap-4 animate-in slide-in-from-top duration-500">
          <AlertCircle className="h-3 w-3" />
          <span>Your Lodger profile is incomplete. Finish it to unlock all features.</span>
          <a href="https://lodger.co/profile" className="flex items-center gap-1.5 hover:underline decoration-2 underline-offset-4">
            Complete Now <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}
      <SiteHeader />
      <main className="flex-grow pt-32 pb-20">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
