'use client';

import Head from 'next/head';
import ProductsPageContent from '@/components/ProductsPageContent';

export default function ProductsPage() {
  return (
    <>
      <Head>
        <title>Konfydence Products</title>
      </Head>
      <ProductsPageContent />
    </>
  );
}
