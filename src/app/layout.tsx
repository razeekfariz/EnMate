import React from 'react';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WholeCursor from '../components/WholeCursor'; 

import '../styles/variables.css';
import '../styles/fonts.css';
import '../styles/base.css';
import '../styles/components.css';
import '../styles/animations.css';
import './globals.css';

const anokhaFont = localFont({
  src: '../../public/fonts/Anokha.ttf',
  variable: '--font-anokha',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://enmate.in'),
  title: 'EnMate Digital Marketing Agency | Based in Kottakkal, Serving Worldwide',
  description: 'EnMate is a premium digital marketing agency based in Kottakkal, Kerala, India, serving clients locally & worldwide. We specialize in custom web architecture, visual branding identity layouts, and global customer acquisition funnels.',
  alternates: {
    canonical: 'https://www.enmate.in',
  },
  verification: {
    google: 'aINPp6RgBJ0lMGuTU4JL70iCTkdnZZBlky7nQmGMjaQ',
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${anokhaFont.variable}`}>
      <head>
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" 
        />
      </head>
      <body className="bg-[#05030a] text-[var(--text-main)] antialiased min-h-screen flex flex-col justify-between">
        <WholeCursor />
        <Navbar />
        <div className="flex-grow">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
