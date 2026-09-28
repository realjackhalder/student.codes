import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Student + Codes — Code, ICT & AI for students',
  description: 'Explore clear learning paths, practical resources, and student projects across programming, ICT, and artificial intelligence.',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32' },
    ],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
