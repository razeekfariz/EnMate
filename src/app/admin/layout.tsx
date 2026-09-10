import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'EnMate Management Portal | Team Operations Studio',
  description: 'Enterprise Content Management, AI Package Architecture, and SEO Studio for EnMate Team.',
  manifest: '/admin-manifest.webmanifest',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'EnMate Admin',
  },
};

export const viewport: Viewport = {
  themeColor: '#090515',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-portal-wrapper min-h-screen bg-[#040208]">
      {children}
    </div>
  );
}
