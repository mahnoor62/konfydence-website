'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const API_URL = `${API_BASE_URL}/api`;

export default function VerifyEmailPage() {
  const router = useRouter();
  const { token } = router.query;
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (token) {
      verifyEmail();
    }
  }, [token]);

  const verifyEmail = async () => {
    try {
      setStatus('verifying');
      const response = await axios.get(`${API_URL}/auth/user/verify-email`, {
        params: { token },
      });

      setStatus('success');
      setMessage(response.data.message || 'Email verified successfully!');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.error || 'Verification failed. The link may have expired.');
    }
  };

  const handleResend = async () => {
    try {
      // You would need to get email from somewhere or ask user
      router.push('/resend-verification');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <>
      <Box
        component="main"
        sx={{
          pt: { xs: 8, md: 12 },
          minHeight: '100vh',
          height: '100%',
          backgroundColor: '#F5F8FB',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Container maxWidth="sm">
          <Card sx={{ boxShadow: '0 8px 32px rgba(0,0,0,0.1)', borderRadius: 3 }}>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              {status === 'verifying' && (
                <>
                  <CircularProgress sx={{ mb: 3, color: '#0B7897' }} />
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#063C5E', mb: 2 }}>
                    Verifying Email...
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Please wait while we verify your email address.
                  </Typography>
                </>
              )}

              {status === 'success' && (
                <>
                  <Alert severity="success" sx={{ mb: 3 }}>
                    {message}
                  </Alert>
                  <Typography variant="body2" color="text.secondary">
                    Redirecting to login page...
                  </Typography>
                </>
              )}

              {status === 'error' && (
                <>
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {message}
                  </Alert>
                  <Button
                    variant="contained"
                    onClick={handleResend}
                    sx={{
                      backgroundColor: '#0B7897',
                      '&:hover': { backgroundColor: '#063C5E' },
                    }}
                  >
                    Resend Verification Email
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </Container>
      </Box>
    </>
  );
}

