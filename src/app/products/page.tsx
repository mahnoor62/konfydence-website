'use client';

import { Box, CircularProgress, Typography } from '@mui/material';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const ProductsPageContent = dynamic(() => import('./ProductsPageContent'), {
  ssr: false,
  loading: () => (
    <Box sx={{ py: 12, textAlign: 'center' }}>
      <CircularProgress />
      <Typography sx={{ mt: 2 }}>Loading products...</Typography>
    </Box>
  ),
});

export default function ProductsPage() {
  return (
    <Suspense fallback={<Box sx={{ py: 12, textAlign: 'center' }}>Loading products...</Box>}>
      <ProductsPageContent />
    </Suspense>
  );
}

