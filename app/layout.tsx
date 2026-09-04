import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'like student — Code, ICT & AI for students',
  description: 'Explore clear learning paths, practical resources, and student projects across programming, ICT, and artificial intelligence.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
