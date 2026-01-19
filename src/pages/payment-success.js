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
  CircularProgress,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const API_URL = `${API_BASE_URL}/api`;

export default function PaymentSuccessPage() {
  const router = useRouter();
  const { session_id, uniqueCode, code } = router.query;
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(false);

  useEffect(() => {
    if (session_id) {
      // Stripe checkout session redirect
      fetchTransactionBySession();
    } else if (code) {
      // Direct code access
      fetchTransaction();
    } else {
      setLoading(false);
      setError('No transaction session or code provided');
    }
  }, [session_id, code]);

  // Poll transaction status if it doesn't exist yet (payment processing)
  useEffect(() => {
    if (!transaction && (session_id || code)) {
      setCheckingStatus(true);
      const interval = setInterval(async () => {
        try {
          const token = localStorage.getItem('token');
          let response;
          if (session_id) {
            response = await axios.get(`${API_URL}/payments/transaction-by-session/${session_id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
          } else if (code) {
            response = await axios.get(`${API_URL}/payments/transaction/${code}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
          }
          
          if (response && response.data) {
            // Check if transaction exists (not just processing status)
            if (response.data.status === 'paid' || (response.data._id && response.data.status !== 'processing')) {
              setTransaction(response.data);
              setCheckingStatus(false);
              clearInterval(interval);
            } else if (response.data.status === 'failed') {
              setError('Payment failed. Please try again.');
              setCheckingStatus(false);
              clearInterval(interval);
            }
          }
        } catch (err) {
          // Transaction not found yet, continue polling
          if (err.response?.status !== 404) {
            console.error('Error checking transaction status:', err);
          }
        }
      }, 3000); // Check every 3 seconds

      // Stop polling after 2 minutes
      const timeout = setTimeout(() => {
        clearInterval(interval);
        setCheckingStatus(false);
        if (!transaction) {
          setError('Payment is taking longer than expected. Please check your dashboard or contact support.');
        }
      }, 120000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [transaction, session_id, code]);

  const fetchTransaction = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/payments/transaction/${code}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTransaction(response.data);
    } catch (err) {
      console.error('Error fetching transaction:', err);
      setError('Transaction not found');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactionBySession = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/payments/transaction-by-session/${session_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // If transaction exists (has _id), set it
      if (response.data._id) {
        setTransaction(response.data);
        setLoading(false);
      } else if (response.data.paymentStatus === 'paid') {
        // Payment is successful but transaction not created yet
        // The endpoint will auto-create it, so set status and let polling handle it
        setTransaction({
          status: 'processing',
          paymentStatus: 'paid',
          uniqueCode: response.data.uniqueCode,
        });
        setLoading(false);
      } else {
        // Other statuses
        setTransaction(response.data);
        setLoading(false);
      }
    } catch (err) {
      console.error('Error fetching transaction:', err);
      if (err.response?.status === 404) {
        // Transaction not created yet (payment still processing)
        setLoading(false);
        // Will be handled by polling effect
      } else if (code) {
        fetchTransaction();
      } else {
        setError('Transaction not found');
        setLoading(false);
      }
    }
  };

  const handleCopyCode = () => {
    if (transaction?.uniqueCode && transaction.packageType !== 'physical') {
      navigator.clipboard.writeText(transaction.uniqueCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      // Save code to sessionStorage and route to game page (only for non-physical products)
      sessionStorage.setItem('codeType', 'purchase');
      sessionStorage.setItem('code', transaction.uniqueCode);
      sessionStorage.setItem('codeVerified', 'true');
      // Save transaction data for game page
      if (transaction.packageId) {
        const packageId = transaction.packageId._id || transaction.packageId;
        sessionStorage.setItem('packageId', packageId);
      }
      sessionStorage.setItem('transactionData', JSON.stringify(transaction));
      
      // Route to game page after copying
      router.push('/play');
    }
  };

  const handlePlayGame = () => {
    // Only allow play game for non-physical products (physical products don't have digital access)
    if (transaction?.packageType === 'physical') {
      // For physical products, don't navigate to play page
      return;
    }
    
    // Save code to sessionStorage for game page
    if (transaction?.uniqueCode) {
      sessionStorage.setItem('codeType', 'purchase');
      sessionStorage.setItem('code', transaction.uniqueCode);
      sessionStorage.setItem('codeVerified', 'true');
      // Save transaction data for game page
      if (transaction.packageId) {
        const packageId = transaction.packageId._id || transaction.packageId;
        sessionStorage.setItem('packageId', packageId);
      }
      sessionStorage.setItem('transactionData', JSON.stringify(transaction));
    }
    router.push('/play');
  };

  if (loading) {
    return (
      <>
        <Header />
        <Box sx={{ minHeight: '100vh', pt: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
        <Footer />
      </>
    );
  }

  // Show processing screen if transaction doesn't exist yet, is pending, or status is 'processing'
  // Show processing screen if transaction doesn't exist yet, is pending, or payment is paid but transaction not created
  if (!transaction || transaction.status === 'pending' || transaction.status === 'processing' || (transaction.paymentStatus === 'paid' && !transaction._id)) {
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
          <Container maxWidth="sm">
            <Card sx={{ boxShadow: '0 8px 32px rgba(0,0,0,0.1)', borderRadius: 3 }}>
              <CardContent sx={{ p: 2, textAlign: 'center' }}>
                <Stack spacing={1.5} alignItems="center">
                  <HourglassEmptyIcon
                    sx={{
                      fontSize: { xs: 40, sm: 50 },
                      color: '#FF9800',
                      animation: 'spin 2s linear infinite',
                      '@keyframes spin': {
                        '0%': { transform: 'rotate(0deg)' },
                        '100%': { transform: 'rotate(360deg)' },
                      },
                    }}
                  />

                  <Box>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        color: '#063C5E',
                        mb: 0.5,
                        fontSize: { xs: '1.2rem', sm: '1.4rem' },
                      }}
                    >
                      Payment in Processing...
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
                      We are verifying your payment. Please wait while we confirm your transaction.
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <CircularProgress size={20} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.85rem' } }}>
                      {checkingStatus ? 'Checking payment status...' : 'Waiting for confirmation...'}
                    </Typography>
                  </Box>

                  <Alert severity="info" sx={{ width: '100%', fontSize: { xs: '0.75rem', sm: '0.85rem' } }}>
                    This may take a few moments. Please do not close this page.
                  </Alert>
                </Stack>
              </CardContent>
            </Card>
          </Container>
        </Box>
        <Footer />
      </>
    );
  }

  // Show success screen only if transaction is paid and has _id (fully created)
  if (!transaction || !transaction._id || transaction.status !== 'paid') {
    // If payment is paid but transaction not created yet, keep showing processing
    if (transaction && transaction.paymentStatus === 'paid' && !transaction._id) {
      return null; // Will be caught by processing screen check above
    }
    
    return (
      <>
        <Header />
        <Box sx={{ minHeight: '100vh', pt: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Alert severity="warning">
            {transaction?.status === 'failed' || transaction?.paymentStatus === 'failed'
              ? 'Payment failed. Please try again.' 
              : transaction?.paymentStatus === 'paid'
              ? 'Payment successful. Processing transaction...'
              : 'Transaction status unknown. Please check your dashboard.'}
          </Alert>
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
        <Container maxWidth="sm">
          <Card sx={{ boxShadow: '0 8px 32px rgba(0,0,0,0.1)', borderRadius: 3 }}>
            <CardContent sx={{ p: 2, textAlign: 'center' }}>
              <Stack spacing={1.5} alignItems="center">
                {/* Success Icon */}
                <CheckCircleIcon
                  sx={{
                    fontSize: { xs: 40, sm: 50 },
                    color: '#4caf50',
                  }}
                />

                {/* Success Message */}
                <Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      color: '#063C5E',
                      mb: 0.5,
                      fontSize: { xs: '1.2rem', sm: '1.4rem' },
                    }}
                  >
                    Payment Successful!
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
                    Thank you for your purchase. Your order has been confirmed.
                  </Typography>
                </Box>

                {/* Unique Code - Only show for non-physical products */}
                {transaction.packageType !== 'physical' && transaction.uniqueCode && (
                  <>
                    <Box
                      sx={{
                        p: 1.5,
                        backgroundColor: '#F5F8FB',
                        borderRadius: 2,
                        border: '2px dashed #0B7897',
                        width: '100%',
                        maxWidth: 400,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: { xs: '0.75rem', sm: '0.85rem' } }}>
                        Your Unique Order Code (Send to you via email)
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 1,
                          mt: 0.5,
                        }}
                      >
                        <Typography
                          variant="h5"
                          sx={{
                            fontWeight: 700,
                            color: '#0B7897',
                            fontFamily: 'monospace',
                            letterSpacing: 1.5,
                            fontSize: { xs: '1.1rem', sm: '1.3rem' },
                          }}
                        >
                          {transaction.uniqueCode}
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
                          <ContentCopyIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                        </IconButton>
                      </Box>
                      {copied && (
                        <Alert severity="success" sx={{ mt: 1, fontSize: { xs: '0.75rem', sm: '0.85rem' } }}>
                          Code copied to clipboard!
                        </Alert>
                      )}
                    </Box>

                    {/* Important Instructions - Only for digital packages */}
                    <Alert 
                      severity="warning" 
                      sx={{ 
                        width: '100%', 
                        maxWidth: 400,
                        textAlign: 'left',
                        fontSize: { xs: '0.75rem', sm: '0.85rem' },
                        '& .MuiAlert-message': {
                          width: '100%'
                        }
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, fontSize: { xs: '0.75rem', sm: '0.85rem' } }}>
                        Important Instructions:
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>
                        You&apos;ll need it to play the game
                      </Typography>
                    </Alert>
                  </>
                )}

                {/* Physical Product Message - Removed as requested */}

                {/* Transaction Details */}
                <Box
                  sx={{
                    width: '100%',
                    textAlign: 'left',
                    p: 1.5,
                    backgroundColor: '#F5F8FB',
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.75, fontSize: { xs: '0.85rem', sm: '0.95rem' } }}>
                    Transaction Details
                  </Typography>
                  <Stack spacing={0.75}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.85rem' } }}>
                        Package:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.85rem' } }}>
                        {transaction.customPackageId ? 'Custom Package' : (transaction.packageId?.name || (transaction.packageType ? transaction.packageType.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'N/A'))}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.85rem' } }}>
                        Amount:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.85rem' } }}>
                        ${transaction.amount.toFixed(2)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.85rem' } }}>
                        Date:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.85rem' } }}>
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                    {/* Hide Expire Date for physical products */}
                    {transaction.contractPeriod?.endDate && transaction.packageType !== 'physical' && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.85rem' } }}>
                          Expire Date:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.85rem' } }}>
                          {new Date(transaction.contractPeriod.endDate).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            timeZone: 'UTC'
                          })}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </Box>

                {/* Action Buttons */}
                <Stack spacing={1} sx={{ width: '100%', maxWidth: 400 }}>
                  {/* Only show Play Game button for non-physical products */}
                  {transaction.packageType !== 'physical' && (
                    <Button
                      variant="contained"
                      fullWidth
                      size="medium"
                      onClick={handlePlayGame}
                      sx={{
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        fontWeight: 700,
                        py: 1,
                        fontSize: { xs: '0.85rem', sm: '0.95rem' },
                        '&:hover': {
                          backgroundColor: '#45a049',
                        },
                      }}
                    >
                      Play Game
                    </Button>
                  )}
                  <Button
                    variant="contained"
                    fullWidth
                    size="medium"
                    onClick={() => router.push('/dashboard')}
                    sx={{
                      backgroundColor: '#0B7897',
                      color: 'white',
                      fontWeight: 700,
                      py: 1,
                      fontSize: { xs: '0.85rem', sm: '0.95rem' },
                      '&:hover': {
                        backgroundColor: '#063C5E',
                      },
                    }}
                  >
                    Go to Dashboard
                  </Button>
                  {/* Hide Browse More Packages button for physical products */}
                  {transaction.packageType !== 'physical' && (
                    <Button
                      variant="outlined"
                      fullWidth
                      size="medium"
                      onClick={() => router.push('/packages')}
                      sx={{
                        borderColor: '#0B7897',
                        color: '#0B7897',
                        fontSize: { xs: '0.85rem', sm: '0.95rem' },
                        py: 1,
                        '&:hover': {
                          borderColor: '#063C5E',
                          color: '#063C5E',
                          backgroundColor: 'rgba(11, 120, 151, 0.1)',
                        },
                      }}
                    >
                      Browse More Packages
                    </Button>
                  )}
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Container>
      </Box>
      <Footer />
    </>
  );
}
