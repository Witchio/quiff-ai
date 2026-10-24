import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Create your account',
  description: 'Sign up with a username, email address, and password.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
