import Head from 'next/head';
import { Inter, Poppins } from 'next/font/google';
import ThemeProvider from '@/components/ThemeProvider';
import AOSProvider from '@/components/AOSProvider';
import '../styles/globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Konfydence - Scam Prevention & Compliance Training</title>
        <meta
          name="description"
          content="Interactive training kits and digital learning for scam prevention and compliance."
        />
      </Head>
      <div className={`${inter.variable} ${poppins.variable}`}>
        <ThemeProvider>
          <AOSProvider>
            <Component {...pageProps} />
          </AOSProvider>
        </ThemeProvider>
      </div>
    </>
  );
}

