import type {Metadata, Viewport} from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { MobileNav } from '@/components/layout/MobileNav';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export const metadata: Metadata = {
  title: 'Quub Vault | Premium Zero-Knowledge Cloud Storage',
  description: 'Store, manage, and share your files securely in a beautiful, high-performance cloud vault with built-in encryption and sharing options.',
  keywords: ['cloud storage', 'zero-knowledge storage', 'file sharing', 'secure backup', 'Quub Vault', 'premium file manager'],
  authors: [{ name: 'Quub Vault Team' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Poppins:wght@600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen bg-background selection:bg-primary/20 selection:text-primary">
        <FirebaseClientProvider>
          <ErrorBoundary>
            <Navbar />
            <main className="relative">{children}</main>
            <MobileNav />
            <Toaster />
          </ErrorBoundary>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
