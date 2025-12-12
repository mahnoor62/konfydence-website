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
  Stack,
  IconButton,
  Alert,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const API_URL = `${API_BASE_URL}/api`;

export default function TrialSuccessPage() {
  const router = useRouter();
  const { code } = router.query;
  const [copied, setCopied] = useState(false);
  const [trialData, setTrialData] = useState(null);

  useEffect(() => {
    if (code) {
      fetchTrialData();
    }
  }, [code]);

  const fetchTrialData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/free-trial/check-code/${code}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.valid) {
        setTrialData(response.data.trial);
      }
    } catch (err) {
      console.error('Error fetching trial data:', err);
    }
  };

  const handleCopyCode = async () => {
    if (code) {
      try {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        // Redirect to game page after copying (without code in URL)
        setTimeout(() => {
          router.push('/game');
        }, 1000);
      } catch (err) {
        console.error('Failed to copy code:', err);
        // Even if copy fails, still redirect
        setTimeout(() => {
          router.push('/game');
        }, 1000);
      }
    }
  };

  if (!code) {
    return (
      <>
        <Header />
        <Box sx={{ minHeight: '100vh', pt: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Alert severity="error">No trial code provided</Alert>
        </Box>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <Box
        component="main"
        sx={{
          pt: { xs: 20, md: 20 },
          minHeight: '100vh',
          height: '100%',
          backgroundColor: '#F5F8FB',
          display: 'flex',
          alignItems: 'center',
          py: 8,
        }}
      >
        <Container maxWidth="md">
          <Card sx={{ boxShadow: '0 8px 32px rgba(0,0,0,0.1)', borderRadius: 3 }}>
            <CardContent sx={{ p: 6, textAlign: 'center' }}>
              <Stack spacing={4} alignItems="center">
                <CheckCircleIcon
                  sx={{
                    fontSize: 80,
                    color: '#4caf50',
                  }}
                />

                <Box>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      color: '#063C5E',
                      mb: 2,
                    }}
                  >
                    Free Trial Activated!
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Your 7-day free trial has been activated. Use the code below to access the game.
                  </Typography>
                </Box>

                <Box
                  sx={{
                    p: 3,
                    backgroundColor: '#F5F8FB',
                    borderRadius: 2,
                    border: '2px dashed #0B7897',
                    width: '100%',
                    maxWidth: 500,
                  }}
                >
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Your Trial Code
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 2,
                      mt: 1,
                    }}
                  >
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 700,
                        color: '#0B7897',
                        fontFamily: 'monospace',
                        letterSpacing: 2,
                      }}
                    >
                      {code}
                    </Typography>
                    <IconButton
                      onClick={handleCopyCode}
                      sx={{
                        color: '#0B7897',
                        '&:hover': {
                          backgroundColor: 'rgba(11, 120, 151, 0.1)',
                        },
                      }}
                    >
                      <ContentCopyIcon />
                    </IconButton>
                  </Box>
                  {copied && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                      Code copied to clipboard!
                    </Alert>
                  )}
                </Box>

                {trialData && (
                  <Box
                    sx={{
                      width: '100%',
                      textAlign: 'left',
                      p: 2,
                      backgroundColor: '#F5F8FB',
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      Trial Details
                    </Typography>
                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          Seats Available:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {trialData.remainingSeats} / 2
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          Expires:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {new Date(trialData.expiresAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                )}

                <Alert severity="info" sx={{ width: '100%' }}>
                  {copied 
                    ? 'Code copied! Redirecting to game page...' 
                    : 'Click the copy button to copy the code and access the game. Share this code with up to 2 people. They can use it to access the demo trial for 7 days.'}
                </Alert>

                {!copied && (
                  <Stack spacing={2} sx={{ width: '100%', maxWidth: 400 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      size="large"
                      onClick={handleCopyCode}
                      sx={{
                        backgroundColor: '#0B7897',
                        color: 'white',
                        fontWeight: 700,
                        py: 1.5,
                        '&:hover': {
                          backgroundColor: '#063C5E',
                        },
                      }}
                    >
                      Copy Code & Go to Game
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => router.push('/packages')}
                      sx={{
                        borderColor: '#0B7897',
                        color: '#0B7897',
                        '&:hover': {
                          borderColor: '#063C5E',
                          backgroundColor: 'rgba(11, 120, 151, 0.1)',
                        },
                      }}
                    >
                      Back to Packages
                    </Button>
                  </Stack>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Container>
      </Box>
      <Footer />
    </>
  );
}

