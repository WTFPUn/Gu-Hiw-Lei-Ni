import PartySystemProvider from '@/contexts/party';
import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="application-name" content="Gu-Hiw" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Gu-Hiw" />
        <meta name="description" content="Gu-Hiw finds friend to eath with" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/icons/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#FAF5E4" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#FAF5E4" />
        <meta
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
          name="viewport"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </Head>
      <PartySystemProvider>
        <Component {...pageProps} />
      </PartySystemProvider>
    </>
  );
}
