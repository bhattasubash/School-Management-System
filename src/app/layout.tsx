import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'School ERP & Management System',
  description: 'Enterprise-grade multi-tenant school operating system for Indian K-12 schools',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-brand-subtle text-brand-dark antialiased">
        {children}
      </body>
    </html>
  );
}
