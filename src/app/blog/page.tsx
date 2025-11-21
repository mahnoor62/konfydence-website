'use client';

import { Box, CircularProgress, Typography } from '@mui/material';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const BlogPageContent = dynamic(() => import('./BlogPageContent'), {
  ssr: false,
  loading: () => (
    <Box sx={{ py: 12, textAlign: 'center' }}>
      <CircularProgress />
      <Typography sx={{ mt: 2 }}>Loading blog...</Typography>
    </Box>
  ),
});

export default function BlogPage() {
  return (
    <Suspense fallback={<Box sx={{ py: 12, textAlign: 'center' }}>Loading blog...</Box>}>
      <BlogPageContent />
    </Suspense>
  );
}
