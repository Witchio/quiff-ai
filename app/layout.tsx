import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'A simple sign in page',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
