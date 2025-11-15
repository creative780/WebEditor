import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import CursorKit from '../components/CursorKit';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Web-to-Print App',
  description: 'A modern web-to-print application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <CursorKit />
        {children}
      </body>
    </html>
  );
}
