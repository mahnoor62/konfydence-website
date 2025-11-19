import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import ThemeProvider from '@/components/ThemeProvider';
import AOSProvider from '@/components/AOSProvider';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'Konfydence - Scam Prevention & Compliance Training',
  description: 'Interactive training kits and digital learning for scam prevention and compliance.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${poppins.variable}`}>
        <ThemeProvider>
          <AOSProvider>
            {children}
          </AOSProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

