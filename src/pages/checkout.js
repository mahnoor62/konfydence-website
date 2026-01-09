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
  Stack,
  CircularProgress,
} from '@mui/material';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoadingState from '@/components/LoadingState';
import ErrorDisplay from '@/components/ErrorDisplay';
import { useAuth } from '@/contexts/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const API_URL = `${API_BASE_URL}/api`;

// Checkout Form Component
function CheckoutForm({ packageData, packageId, clientSecret, uniqueCode, paymentIntentId }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setProcessing(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message);
      setProcessing(false);
      return;
    }

    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success?code=${uniqueCode}&paymentIntentId=${paymentIntentId}`,
      },
      redirect: 'if_required',
    });

    if (confirmError) {
      setError(confirmError.message);
      setProcessing(false);
    } else if (paymentIntent) {
      // Always redirect to payment success page, which will check status and show appropriate screen
      // If status is pending, it will show "Payment in Processing..." screen
      router.push(`/payment-success?code=${uniqueCode}&paymentIntentId=${paymentIntentId}`);
    } else {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={3}>
        {error && (
          <Alert severity="error">{error}</Alert>
        )}

        <PaymentElement />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          disabled={!stripe || !elements || processing}
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
          {processing ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={20} sx={{ color: 'white' }} />
              Processing...
            </Box>
          ) : (
            `Pay $${packageData.pricing?.amount || 0}`
          )}
        </Button>

        <Button
          variant="outlined"
          fullWidth
          onClick={() => router.back()}
          disabled={processing}
          sx={{
            borderColor: '#0B7897',
            color: '#0B7897',
            '&:hover': {
              borderColor: '#063C5E',
              backgroundColor: 'rgba(11, 120, 151, 0.1)',
            },
          }}
        >
          Cancel
        </Button>
      </Stack>
    </form>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { packageId } = router.query;
  const { user, getAuthToken } = useAuth();
  const [packageData, setPackageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [paymentIntentId, setPaymentIntentId] = useState(null);
  const [uniqueCode, setUniqueCode] = useState(null);
  const [loadingPayment, setLoadingPayment] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`);
      return;
    }
    if (packageId) {
      fetchPackage();
    }
  }, [packageId, user]);

  const fetchPackage = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/packages/${packageId}`);
      setPackageData(response.data);
      
      // Create payment intent after package is loaded
      await createPaymentIntent(response.data);
    } catch (err) {
      console.error('Error fetching package:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const createPaymentIntent = async (packageData) => {
    try {
      setLoadingPayment(true);
      const token = getAuthToken();
      const response = await axios.post(
        `${API_URL}/payments/create-payment-intent`,
        { packageId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setClientSecret(response.data.clientSecret);
      setPaymentIntentId(response.data.paymentIntentId);
      setUniqueCode(response.data.uniqueCode);
    } catch (err) {
      console.error('Error creating payment intent:', err);
      setError(err.response?.data?.error || 'Failed to initialize payment');
    } finally {
      setLoadingPayment(false);
    }
  };

  if (!user) {
    return (
      <>
        <Header />
        <Box sx={{ minHeight: '80vh', pt: 8 }}>
          <LoadingState message="Redirecting to login..." />
        </Box>
        <Footer />
      </>
    );
  }

  if (loading || loadingPayment) {
    return (
      <>
        <Header />
        <Box sx={{ minHeight: '80vh', pt: 8 }}>
          <LoadingState message={loading ? "Loading package..." : "Initializing payment..."} />
        </Box>
        <Footer />
      </>
    );
  }

  if (error || !packageData) {
    return (
      <>
        <Header />
        <Box sx={{ minHeight: '80vh', pt: 8 }}>
          <ErrorDisplay error={error} title="Failed to Load Package" />
        </Box>
        <Footer />
      </>
    );
  }

  if (!clientSecret) {
    return (
      <>
        <Header />
        <Box sx={{ minHeight: '80vh', pt: 8 }}>
          <LoadingState message="Initializing payment..." />
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
          pt: { xs: 8, md: 10 },
          minHeight: '80vh',
          backgroundColor: '#F5F8FB',
          py: 8,
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: '#063C5E',
              mb: 4,
              textAlign: 'center',
            }}
          >
            Checkout
          </Typography>

          <Card sx={{ boxShadow: '0 8px 32px rgba(0,0,0,0.1)', borderRadius: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#063C5E', mb: 1 }}>
                    {packageData.name}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {packageData.description}
                  </Typography>
                </Box>

                <Box sx={{ p: 2, backgroundColor: '#F5F8FB', borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Price
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      color: '#0B7897',
                    }}
                  >
                    ${packageData.pricing?.amount || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {packageData.pricing?.billingType === 'one_time'
                      ? 'One-time payment'
                      : packageData.pricing?.billingType === 'subscription'
                      ? 'Annual subscription'
                      : 'Per seat'}
                  </Typography>
                </Box>

                {packageData.includedCardIds && packageData.includedCardIds.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      Includes {packageData.includedCardIds.length} Card
                      {packageData.includedCardIds.length !== 1 ? 's' : ''}
                    </Typography>
                  </Box>
                )}

                <Alert severity="info">
                  Secure payment powered by Stripe. Your payment information is encrypted and secure.
                </Alert>

                {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? (
                  <Elements
                    stripe={stripePromise}
                    options={{
                      clientSecret: clientSecret,
                      appearance: {
                        theme: 'stripe',
                        variables: {
                          colorPrimary: '#0B7897',
                          colorBackground: '#ffffff',
                          colorText: '#063C5E',
                        },
                      },
                    }}
                  >
                    <CheckoutForm
                      packageData={packageData}
                      packageId={packageId}
                      clientSecret={clientSecret}
                      uniqueCode={uniqueCode}
                      paymentIntentId={paymentIntentId}
                    />
                  </Elements>
                ) : (
                  <Alert severity="warning">
                    Stripe is not configured. Please set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in your environment variables.
                  </Alert>
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
