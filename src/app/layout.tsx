
import type { Metadata } from 'next';
import { Inter, Outfit, Playfair_Display, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' });

export const metadata: Metadata = {
  title: 'The Commons | Lodger',
  description: 'A collection of stories, guides, and insights for the modern housing community.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={cn(
        inter.variable,
        outfit.variable,
        playfair.variable,
        spaceGrotesk.variable,
        "font-body bg-background text-foreground antialiased selection:bg-primary/20"
      )}>
        {children}
      </body>
    </html>
  );
}
