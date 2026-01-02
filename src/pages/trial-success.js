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
          pt: { xs: 12, sm: 14, md: 12 },
          minHeight: '100vh',
          height: '100%',
          backgroundColor: '#F5F8FB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: { xs: 4, sm: 6, md: 4 },
          px: { xs: 2, sm: 3, md: 2 },
        }}
      >
        <Container 
          maxWidth="sm"
          sx={{
            width: { xs: '100%', sm: '500px', md: '450px' },
            maxWidth: { xs: '100%', sm: '500px', md: '450px' },
          }}
        >
          <Card 
            sx={{ 
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)', 
              borderRadius: 3,
              width: '100%',
              maxWidth: { xs: '100%', sm: '500px', md: '450px' },
            }}
          >
            <CardContent 
              sx={{ 
                p: { xs: 3, sm: 4, md: 3.5 },
                textAlign: 'center',
              }}
            >
              <Stack spacing={2.5} alignItems="center">
                <CheckCircleIcon
                  sx={{
                    fontSize: { xs: 50, sm: 60, md: 55 },
                    color: '#4caf50',
                  }}
                />

                <Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      color: '#063C5E',
                      mb: 1,
                      fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.4rem' },
                    }}
                  >
                    Free Trial Activated!
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.875rem', sm: '0.9rem', md: '0.875rem' } }}
                  >
                    Your 14-day free trial has been activated. Use the code below to access the game.
                  </Typography>
                </Box>

                <Box
                  sx={{
                    p: { xs: 2, sm: 2.5, md: 2 },
                    backgroundColor: '#F5F8FB',
                    borderRadius: 2,
                    border: '2px dashed #0B7897',
                    width: '100%',
                    maxWidth: { xs: '100%', sm: '400px', md: '380px' },
                  }}
                >
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    gutterBottom
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.75rem' } }}
                  >
                    Your Trial Code
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1.5,
                      mt: 1,
                    }}
                  >
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        color: '#0B7897',
                        fontFamily: 'monospace',
                        letterSpacing: 1.5,
                        fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.4rem' },
                      }}
                    >
                      {code}
                    </Typography>
                    <IconButton
                      onClick={handleCopyCode}
                      size="small"
                      sx={{
                        color: '#0B7897',
                        '&:hover': {
                          backgroundColor: 'rgba(11, 120, 151, 0.1)',
                        },
                      }}
                    >
                      <ContentCopyIcon sx={{ fontSize: { xs: 18, sm: 20, md: 19 } }} />
                    </IconButton>
                  </Box>
                  {copied && (
                    <Alert severity="success" sx={{ mt: 1.5, fontSize: { xs: '0.75rem', sm: '0.8rem' } }}>
                      Code copied to clipboard!
                    </Alert>
                  )}
                </Box>

                {trialData && (
                  <Box
                    sx={{
                      width: '100%',
                      textAlign: 'left',
                      p: { xs: 1.5, sm: 2, md: 1.5 },
                      backgroundColor: '#F5F8FB',
                      borderRadius: 2,
                    }}
                  >
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        fontWeight: 600, 
                        mb: 0.5,
                        fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.8rem' }
                      }}
                    >
                      Trial Details
                    </Typography>
                    <Stack spacing={0.5}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.75rem' } }}
                        >
                          Seats Available:
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 600,
                            fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.75rem' }
                          }}
                        >
                          {trialData.remainingSeats} / 2
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.75rem' } }}
                        >
                          Expires:
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 600,
                            fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.75rem' }
                          }}
                        >
                          {new Date(trialData.expiresAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                )}

                <Alert 
                  severity="info" 
                  sx={{ 
                    width: '100%',
                    fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.75rem' },
                    '& .MuiAlert-message': {
                      fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.75rem' },
                    }
                  }}
                >
                  {copied 
                    ? 'Code copied! Redirecting to game page...' 
                    : 'Click the copy button to copy the code and access the game. You can share this code with 1 person. They can use it to access the demo trial for 14 days.'}
                </Alert>

                {!copied && (
                  <Stack spacing={1.5} sx={{ width: '100%', maxWidth: { xs: '100%', sm: '350px', md: '320px' } }}>
                    <Button
                      variant="contained"
                      fullWidth
                      size="medium"
                      onClick={handleCopyCode}
                      sx={{
                        backgroundColor: '#0B7897',
                        color: 'white',
                        fontWeight: 700,
                        py: { xs: 1, sm: 1.25, md: 1.1 },
                        fontSize: { xs: '0.875rem', sm: '0.9rem', md: '0.875rem' },
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
                      size="medium"
                      onClick={() => router.push('/packages')}
                      sx={{
                        borderColor: '#0B7897',
                        color: '#0B7897',
                        fontSize: { xs: '0.875rem', sm: '0.9rem', md: '0.875rem' },
                        py: { xs: 1, sm: 1.25, md: 1.1 },
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

