'use client';

import { useEffect, useState } from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import { useRouter } from 'next/router';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function NotFound() {
  const router = useRouter();
  const [referrer, setReferrer] = useState('');

  useEffect(() => {
    // Get referrer from browser
    if (typeof window !== 'undefined') {
      const referrerUrl = document.referrer;
      if (referrerUrl) {
        try {
          const url = new URL(referrerUrl);
          const pathname = url.pathname;
          setReferrer(pathname);
        } catch (e) {
          console.error('Error parsing referrer:', e);
        }
      }
    }
  }, []);

  const handleBack = () => {
    // Check if we came from resources page
    if (referrer && referrer.includes('/resources')) {
      router.push('/resources');
      return;
    }
    
    // If there's a valid referrer and it's not the current 404 page, go to referrer
    if (referrer && referrer !== router.asPath && referrer !== '/') {
      router.push(referrer);
      return;
    }
    
    // Use browser back if history exists
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      // Fallback to home
      router.push('/');
    }
  };

  return (
    <>
      <Header />
      <Box component="main" sx={{ pt: { xs: 8, md: 10 }, minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h1" gutterBottom>
            404
          </Typography>
          <Typography variant="h4" gutterBottom>
            Page Not Found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            The page you&apos;re looking for doesn&apos;t exist.
          </Typography>
          <Button 
            variant="contained" 
            onClick={handleBack}
            size="large"
            startIcon={<ArrowBackIcon />}
          >
            Back
          </Button>
        </Container>
      </Box>
      <Footer />
    </>
  );
}

