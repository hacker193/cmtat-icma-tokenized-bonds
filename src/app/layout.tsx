import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Tokenized Fixed Income Platform",
  description: "Professional-grade fixed income analytics and trading platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <MantineProvider>
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}