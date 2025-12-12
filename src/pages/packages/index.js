'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { 
  Container, 
  Typography, 
  Grid, 
  Box, 
  Card, 
  CardContent, 
  Button, 
  Stack, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  Tabs,
  Tab
} from '@mui/material';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ErrorDisplay from '@/components/ErrorDisplay';
import LoadingState from '@/components/LoadingState';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_URL environment variable is missing!');
}
const API_URL = `${API_BASE_URL}/api`;
const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

export default function PackagesPage() {
  const router = useRouter();
  const { type, productId } = router.query; // Get product type and productId from query parameter
  const { user, requireAuth } = useAuth();
  
  const [packages, setPackages] = useState([]);
  const [allPackages, setAllPackages] = useState([]); // Store all packages
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [processingPurchase, setProcessingPurchase] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('organizations_schools'); // 'organizations_schools', 'families'
  const [hasB2BPackages, setHasB2BPackages] = useState(false); // Track if B2B/B2E packages exist
  const [requestForm, setRequestForm] = useState({
    organizationName: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    additionalNotes: '',
    seatLimit: '',
    customPricing: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Determine if we should show "Request Custom Package" button
  // Show only for B2B/B2E, not for B2C
  // If no type specified, default to showing all packages (backward compatibility)
  const showRequestCustomButton = type === 'B2B' || type === 'B2E' || type === 'B2B_B2E';

  const fetchPackages = useCallback(async (categoryOverride = null) => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        _t: Date.now(), // Timestamp to prevent caching - ensures fresh data on every call
      };

      // If type is specified in URL, use it (for backward compatibility)
      // if (type === 'B2B' || type === 'B2E') {
      //   params.targetAudience = 'B2B_B2E';
      // } else if (type === 'B2C') {
      //   params.targetAudience = 'B2C';
      // }
      if (type === 'B2B') params.targetAudience = 'B2B';
else if (type === 'B2E') params.targetAudience = 'B2E';
else if (type === 'B2B_B2E') params.targetAudience = 'B2B,B2E'; // only if backend supports CSV
else if (type === 'B2C') params.targetAudience = 'B2C';

      // If no type specified, fetch all packages

      const url = `${API_URL}/packages/public`;
      console.log('📡 API: GET', url, params, 'Headers:', NO_CACHE_HEADERS);
      const res = await axios.get(url, {
        headers: NO_CACHE_HEADERS,
        params,
      });
      const fetchedPackages = res.data || [];
      setAllPackages(fetchedPackages);
      
      // Determine which category to use for filtering
      let categoryToUse = categoryOverride || selectedCategory;
      if (type === 'B2C') {
        categoryToUse = 'families';
      } else if (type === 'B2B' || type === 'B2E') {
        categoryToUse = 'organizations_schools';
      }
      
      filterPackagesByCategory(fetchedPackages, categoryToUse);
    } catch (err) {
      console.error('❌ Error fetching packages:', {
        error: err.response?.data || err.message,
        status: err.response?.status,
      });
      setError(err);
      setPackages([]);
      setAllPackages([]);
    } finally {
      setLoading(false);
    }
  }, [type, selectedCategory]);

  useEffect(() => {
    if (router.isReady) {
      // If type is in URL, set category accordingly
      if (type === 'B2C') {
        setSelectedCategory('families');
      } else if (type === 'B2B' || type === 'B2E') {
        setSelectedCategory('organizations_schools');
      }
      fetchPackages();
    }
  }, [router.isReady, type, fetchPackages]);

  // Filter packages by category
  const filterPackagesByCategory = (packagesList, category) => {
    if (category === 'organizations_schools') {
      // Filter for B2B or B2E (organizations and schools)
      const filtered = packagesList.filter(pkg => {
        if (!pkg.targetAudiences || !Array.isArray(pkg.targetAudiences)) {
          return false;
        }
        return pkg.targetAudiences.includes('B2B') || pkg.targetAudiences.includes('B2E');
      });
      setPackages(filtered);
      // Check if there are any B2B or B2E packages
      setHasB2BPackages(filtered.length > 0);
    } else if (category === 'families') {
      // Filter for B2C (families)
      const filtered = packagesList.filter(pkg => {
        if (!pkg.targetAudiences || !Array.isArray(pkg.targetAudiences)) {
          return false;
        }
        return pkg.targetAudiences.includes('B2C');
      });
      setPackages(filtered);
      setHasB2BPackages(false); // No free trial for B2C
    } else {
      setPackages(packagesList);
      // Check if there are any B2B or B2E packages in all packages
      const hasB2B = packagesList.some(pkg => {
        if (!pkg.targetAudiences || !Array.isArray(pkg.targetAudiences)) {
          return false;
        }
        return pkg.targetAudiences.includes('B2B') || pkg.targetAudiences.includes('B2E');
      });
      setHasB2BPackages(hasB2B);
    }
  };

  // Handle category change
  const handleCategoryChange = (event, newValue) => {
    setSelectedCategory(newValue);
    // Re-fetch packages with new category to get fresh data
    fetchPackages(newValue);
  };

  // Handle free trial request
  const handleGetFreeTrial = async () => {
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`);
      return;
    }

    try {
      // Get auth token
      const token = localStorage.getItem('token');
      if (!token) {
        router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`);
        return;
      }

      // Get first B2B or B2E package for trial
      const b2bPackage = packages.find(pkg => {
        if (!pkg.targetAudiences || !Array.isArray(pkg.targetAudiences)) {
          return false;
        }
        return pkg.targetAudiences.includes('B2B') || pkg.targetAudiences.includes('B2E');
      });

      if (!b2bPackage) {
        setSnackbar({
          open: true,
          message: 'No package available for trial',
          severity: 'error',
        });
        return;
      }

      // Create free trial
      const response = await axios.post(
        `${API_URL}/free-trial/create`,
        { 
          packageId: b2bPackage._id,
          productId: productId ? productId : null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Redirect to trial success page with code
      router.push(`/trial-success?code=${response.data.trial.uniqueCode}`);
    } catch (error) {
      console.error('Error creating free trial:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Failed to create free trial',
        severity: 'error',
      });
    }
  };

  const getBillingTypeLabel = (billingType) => {
    const labels = {
      'one_time': 'One Time',
      'subscription': 'Subscription',
      'per_seat': 'Per Seat',
    };
    return labels[billingType] || billingType;
  };

  // Parse description into feature list (only split by line breaks)
  const parseDescriptionToFeatures = (description) => {
    if (!description) return [];
    const features = description.split(/\n/).map(f => f.trim()).filter(f => f.length > 0);
    if (features.length === 0) {
      return [description.trim()];
    }
    return features;
  };

  // Determine if package should be highlighted
  const isHighlighted = (index, total) => {
    if (total === 4) return index === 1;
    if (total === 3) return index === 1;
    if (total >= 5) return index === Math.floor(total / 2);
    return false;
  };

  const handleRequestCustomPackage = (pkg) => {
    setSelectedPackage(pkg);
    setRequestDialogOpen(true);
  };

  const handleCloseRequestDialog = () => {
    setRequestDialogOpen(false);
    setSelectedPackage(null);
    setRequestForm({
      organizationName: '',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      additionalNotes: '',
      seatLimit: '',
      customPricing: ''
    });
  };

  const handleBuyNow = async (pkg) => {
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`);
      return;
    }

    try {
      setProcessingPurchase(pkg._id);
      
      // Get auth token
      const token = localStorage.getItem('token');
      if (!token) {
        router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`);
        return;
      }

      // Create Stripe Checkout Session
      const response = await axios.post(
        `${API_URL}/payments/create-checkout-session`,
        { 
          packageId: pkg._id,
          productId: productId || null
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Redirect to Stripe Checkout
      if (response.data.url) {
        window.location.href = response.data.url;
      } else {
        setSnackbar({
          open: true,
          message: 'Failed to create checkout session',
          severity: 'error',
        });
        setProcessingPurchase(null);
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Failed to start checkout process',
        severity: 'error',
      });
      setProcessingPurchase(null);
    }
  };

  const handleSubmitRequest = async () => {
    if (!requestForm.organizationName || !requestForm.contactName || !requestForm.contactEmail) {
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields',
        severity: 'error'
      });
      return;
    }

    try {
      setSubmitting(true);
      const requestData = {
        basePackageId: selectedPackage._id,
        organizationName: requestForm.organizationName,
        contactName: requestForm.contactName,
        contactEmail: requestForm.contactEmail,
        contactPhone: requestForm.contactPhone,
        requestedModifications: {
          additionalNotes: requestForm.additionalNotes,
          seatLimit: requestForm.seatLimit ? parseInt(requestForm.seatLimit) : undefined,
          customPricing: requestForm.customPricing ? {
            notes: requestForm.customPricing
          } : undefined
        }
      };

      await axios.post(`${API_URL}/custom-package-requests`, requestData, {
        headers: NO_CACHE_HEADERS,
      });

      setSnackbar({
        open: true,
        message: 'Custom package request submitted successfully! We will contact you soon.',
        severity: 'success'
      });
      handleCloseRequestDialog();
    } catch (err) {
      console.error('Error submitting request:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.error || 'Failed to submit request. Please try again.',
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <Box component="main" sx={{ pt: { xs: 8, md: 10 }, minHeight: '80vh', backgroundColor: '#F5F8FB' }}>
        <Container
          maxWidth="xl"
          sx={{ py: { xs: 6, md: 12 } }}
          data-aos="zoom-in"
          data-aos-duration="800"
        >
          {/* Header Section - Moved to top */}
          <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
            <Typography
              variant="overline"
              sx={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'text.secondary',
                letterSpacing: 2,
                mb: 1,
              }}
            >
              PRICING PLAN
            </Typography>
            <Typography
              variant="h2"
              sx={{
                mb: 2,
                fontSize: { xs: '2rem', md: '3rem' },
                fontWeight: 700,
                color: '#063C5E',
                lineHeight: 1.2,
              }}
            >
              Packages
            </Typography>
          </Box>

          {/* Category Tabs - Only show when no type filter in URL */}
          {!type && (
            <Box sx={{ mb: 6, borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={selectedCategory}
                onChange={handleCategoryChange}
                aria-label="package categories"
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  '& .MuiTab-root': {
                    fontSize: { xs: '0.875rem', md: '1rem' },
                    fontWeight: 600,
                    textTransform: 'none',
                    minHeight: 48,
                    color: '#063C5E',
                    px: { xs: 2, md: 3 },
                    '&.Mui-selected': {
                      color: '#0B7897',
                    },
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: '#0B7897',
                    height: 3,
                  },
                }}
              >
                <Tab label="Organizations & Schools" value="organizations_schools" />
                <Tab label="For Families" value="families" />
              </Tabs>
            </Box>
          )}

          {/* Section Heading based on type */}
          {!loading && packages.length > 0 && type && (
            <Box sx={{ mb: { xs: 3, md: 4 }, textAlign: 'center' }}>
              <Typography
                variant="h3"
                sx={{
                  fontSize: { xs: '1.5rem', md: '2rem' },
                  fontWeight: 700,
                  color: '#063C5E',
                  mb: 1,
                }}
              >
                {type === 'B2C' 
                  ? 'For Families (B2C)'
                  : (type === 'B2B' || type === 'B2E' || type === 'B2B_B2E')
                  ? 'For Organizations & Schools (B2B & B2E)'
                  : 'Available Packages'}
              </Typography>
            </Box>
          )}

          {error ? (
            <ErrorDisplay error={error} title="Failed to Load Packages" />
          ) : loading ? (
            <LoadingState message="Loading packages..." />
          ) : packages.length === 0 ? (
            <Box textAlign="center" py={6}>
              <Typography variant="h6" color="text.secondary">
                No packages available at the moment. Please check back soon.
              </Typography>
            </Box>
          ) : (
            <Grid
              container
              spacing={3}
              sx={{ 
                alignItems: 'stretch',
                justifyContent: 'center',
                mb: 4 
              }}
            >
              {/* Free Trial Card - Show for Organizations & Schools when B2B/B2E packages exist */}
              {((!type && selectedCategory === 'organizations_schools') || type === 'B2B' || type === 'B2E') && hasB2BPackages && packages.length > 0 && (
                <Grid 
                  item 
                  xs={12} 
                  sm={6} 
                  md={6} 
                  lg={3}
                  sx={{
                    display: 'flex',
                  }}
                >
                  <Card
                    sx={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 3,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      position: 'relative',
                      overflow: 'visible',
                      border: '3px solid #FFD700',
                    }}
                  >
                    <CardContent 
                      sx={{ 
                        flexGrow: 1, 
                        display: 'flex', 
                        flexDirection: 'column',
                        p: 4,
                      }}
                    >
                      <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            backgroundColor: '#FFD700',
                            color: '#063C5E',
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            fontWeight: 700,
                            fontSize: '0.75rem',
                          }}
                        >
                          FREE TRIAL
                        </Typography>
                      </Box>

                      <Typography 
                        variant="h5" 
                        component="h3" 
                        sx={{ 
                          fontWeight: 700,
                          color: 'white',
                          mb: 2,
                          mt: 2,
                          fontSize: { xs: '1.25rem', md: '1.5rem' },
                        }}
                      >
                        7-Day Free Trial
                      </Typography>

                      <Box sx={{ mb: 3 }}>
                        <Typography
                          variant="h3"
                          sx={{
                            fontWeight: 700,
                            color: '#FFD700',
                            fontSize: { xs: '2rem', md: '2.5rem' },
                            lineHeight: 1,
                            mb: 0.5,
                          }}
                        >
                          FREE
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'rgba(255,255,255,0.9)',
                            fontSize: '0.875rem',
                          }}
                        >
                          2 Seats Available
                        </Typography>
                      </Box>

                      <Stack spacing={1.5} sx={{ flexGrow: 1, mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography sx={{ color: '#FFD700', fontSize: '1.2rem' }}>✓</Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                            7 Days Access
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography sx={{ color: '#FFD700', fontSize: '1.2rem' }}>✓</Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                            2 Demo Seats
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography sx={{ color: '#FFD700', fontSize: '1.2rem' }}>✓</Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                            Full Package Access
                          </Typography>
                        </Box>
                      </Stack>

                      <Button
                        variant="contained"
                        fullWidth
                        onClick={() => handleGetFreeTrial()}
                        sx={{
                          backgroundColor: 'white !important',
                          // background: 'linear-gradient(90deg, #00897B 0%, #4FC3F7 100%) !important',
                          // backgroundColor: 'transparent !important',
                          color: 'white !important',
                          fontWeight: 700,
                          py: 1.5,
                          '&:hover': {
                            // background: 'linear-gradient(90deg, #00695C 0%, #29B6F6 100%) !important',
                            // backgroundColor: 'transparent !important',
                            color: 'white !important',
                          },
                        }}
                      >
                        Get Free Trial
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {packages.map((pkg, index) => {
                const features = parseDescriptionToFeatures(pkg.description);
                const highlighted = isHighlighted(index, packages.length);
                
                return (
                  <Grid 
                    item 
                    xs={12} 
                    sm={6} 
                    md={6} 
                    lg={3} 
                    key={pkg._id}
                    sx={{
                      display: 'flex',
                    }}
                  >
                    <Card
                      data-aos="fade-up"
                      data-aos-duration="800"
                      data-aos-delay={index * 100}
                      sx={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 3,
                        boxShadow: highlighted 
                          ? '0 8px 32px rgba(0,0,0,0.15)' 
                          : '0 4px 20px rgba(0,0,0,0.1)',
                        backgroundColor: highlighted ? '#0B7897' : 'white',
                        color: highlighted ? 'white' : 'text.primary',
                        transition: 'all 0.3s ease-in-out',
                        transform: 'translateY(0)',
                        position: 'relative',
                        overflow: 'visible',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: highlighted 
                            ? '0 12px 40px rgba(11,120,151,0.3)' 
                            : '0 8px 32px rgba(0,0,0,0.15)',
                        },
                      }}
                    >
                      <CardContent 
                        sx={{ 
                          flexGrow: 1, 
                          display: 'flex', 
                          flexDirection: 'column',
                          p: 4,
                        }}
                      >
                        {/* Package Name */}
                        <Typography 
                          variant="h5" 
                          component="h3" 
                          sx={{ 
                            fontWeight: 700,
                            color: highlighted ? 'white' : '#063C5E',
                            mb: 2,
                            fontSize: { xs: '1.25rem', md: '1.5rem' },
                          }}
                        >
                          {pkg.name}
                        </Typography>

                        {/* Price */}
                        <Box sx={{ mb: 3 }}>
                          <Typography
                            variant="h3"
                            sx={{
                              fontWeight: 700,
                              color: '#FFD700',
                              fontSize: { xs: '2rem', md: '2.5rem' },
                              lineHeight: 1,
                              mb: 0.5,
                            }}
                          >
                            €{pkg.pricing?.amount || 0}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: highlighted ? 'rgba(255,255,255,0.8)' : 'text.secondary',
                              fontSize: '0.875rem',
                            }}
                          >
                            {getBillingTypeLabel(pkg.pricing?.billingType)}
                          </Typography>
                        </Box>

                        {/* Description List (one line = one bullet) */}
                        <Stack spacing={1.5} sx={{ flexGrow: 1, mb: 3 }}>
                          {features.length > 0 ? (
                            features.map((feature, idx) => (
                              <Box 
                                key={idx}
                                sx={{ 
                                  display: 'flex', 
                                  alignItems: 'flex-start', 
                                  gap: 1.5 
                                }}
                              >
                                <Box
                                  sx={{
                                    mt: 0.5,
                                    width: 20,
                                    height: 20,
                                    borderRadius: '50%',
                                    backgroundColor: highlighted ? '#FFD700' : '#FFD700',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                  }}
                                >
                                  <Box
                                    component="span"
                                    sx={{
                                      color: highlighted ? '#063C5E' : '#063C5E',
                                      fontSize: '0.75rem',
                                      fontWeight: 700,
                                    }}
                                  >
                                    ✓
                                  </Box>
                                </Box>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: highlighted ? '#FFD700' : 'text.primary',
                                    fontSize: { xs: '0.875rem', md: '0.9375rem' },
                                    lineHeight: 1.6,
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                    fontWeight: highlighted ? 500 : 400,
                                  }}
                                >
                                  {feature}
                                </Typography>
                              </Box>
                            ))
                          ) : (
                            <Typography
                              variant="body2"
                              sx={{
                                color: highlighted ? 'rgba(255,255,255,0.8)' : 'text.secondary',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                              }}
                            >
                              {pkg.description}
                            </Typography>
                          )}
                        </Stack>

                        {/* Max Seats & Cards Count */}
                        <Box sx={{ mb: 3 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              color: highlighted ? 'rgba(255,255,255,0.8)' : 'text.secondary',
                              fontSize: '0.875rem',
                              mb: pkg.includedCardIds?.length > 0 ? 1 : 0,
                            }}
                          >
                            Max Seats: <strong>{pkg.maxSeats || 5}</strong>
                          </Typography>
                          {pkg.expiryDate && (
                            <Typography
                              variant="body2"
                              sx={{
                                color: highlighted ? 'rgba(255,255,255,0.8)' : 'text.secondary',
                                fontSize: '0.875rem',
                                mb: pkg.includedCardIds?.length > 0 ? 1 : 0,
                              }}
                            >
                              Expires: <strong>{new Date(pkg.expiryDate).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                              })}</strong>
                            </Typography>
                          )}
                          {pkg.includedCardIds?.length > 0 && (
                            <Typography
                              variant="body2"
                              sx={{
                                color: highlighted ? 'rgba(255,255,255,0.8)' : 'text.secondary',
                                fontSize: '0.875rem',
                              }}
                            >
                              {pkg.includedCardIds.length} Card{pkg.includedCardIds.length !== 1 ? 's' : ''} Included
                            </Typography>
                          )}
                        </Box>

                        {/* CTA Buttons */}
                        <Stack spacing={1.5}>
                          {showRequestCustomButton && (
                            <Button
                              variant="contained"
                              fullWidth
                              onClick={() => handleRequestCustomPackage(pkg)}
                              sx={{
                                backgroundColor: '#0B7897',
                                color: 'white',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                borderRadius: 2,
                                py: 1.5,
                                fontSize: { xs: '0.875rem', md: '0.9375rem' },
                                '&:hover': {
                                  backgroundColor: '#063C5E',
                                  transform: 'scale(1.02)',
                                },
                                transition: 'all 0.2s ease',
                              }}
                            >
                              Request Custom Package
                            </Button>
                          )}
                          <Button
                            variant="outlined"
                            fullWidth
                            onClick={() => handleBuyNow(pkg)}
                            disabled={processingPurchase === pkg._id}
                            sx={{
                              borderColor: '#FFD700',
                              color: highlighted ? '#FFD700' : '#063C5E',
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              borderRadius: 2,
                              py: 1.5,
                              fontSize: { xs: '0.875rem', md: '0.9375rem' },
                              '&:hover': {
                                borderColor: '#FFC700',
                                backgroundColor: highlighted ? 'rgba(255,215,0,0.1)' : '#FFF9E6',
                              },
                              transition: 'all 0.2s ease',
                            }}
                          >
                            {processingPurchase === pkg._id ? 'Redirecting to Stripe...' : 'Buy Now'}
                          </Button>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Container>
      </Box>

      {/* Request Custom Package Dialog */}
      <Dialog 
        open={requestDialogOpen} 
        onClose={handleCloseRequestDialog} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          Request Custom Package
          {selectedPackage && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Based on: <strong>{selectedPackage.name}</strong>
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Organization Name *"
              value={requestForm.organizationName}
              onChange={(e) => setRequestForm({ ...requestForm, organizationName: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Contact Name *"
              value={requestForm.contactName}
              onChange={(e) => setRequestForm({ ...requestForm, contactName: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Email *"
              type="email"
              value={requestForm.contactEmail}
              onChange={(e) => setRequestForm({ ...requestForm, contactEmail: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Phone"
              value={requestForm.contactPhone}
              onChange={(e) => setRequestForm({ ...requestForm, contactPhone: e.target.value })}
            />
            <TextField
              fullWidth
              label="Number of Seats/Users"
              type="number"
              value={requestForm.seatLimit}
              onChange={(e) => setRequestForm({ ...requestForm, seatLimit: e.target.value })}
              helperText="How many users will need access?"
            />
            <TextField
              fullWidth
              label="Custom Pricing Requirements"
              value={requestForm.customPricing}
              onChange={(e) => setRequestForm({ ...requestForm, customPricing: e.target.value })}
              multiline
              rows={2}
              helperText="Describe your pricing needs (e.g., annual contract, volume discount)"
            />
            <TextField
              fullWidth
              label="Additional Requirements"
              value={requestForm.additionalNotes}
              onChange={(e) => setRequestForm({ ...requestForm, additionalNotes: e.target.value })}
              multiline
              rows={4}
              helperText="Tell us about any specific cards you'd like to add or remove, custom features, or other requirements"
            />
            <Alert severity="info">
              After submitting this request, our team will review your requirements and contact you within 1-2 business days with a custom quote.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRequestDialog} disabled={submitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitRequest} 
            variant="contained"
            disabled={submitting}
            sx={{ backgroundColor: '#0B7897', '&:hover': { backgroundColor: '#063C5E' } }}
          >
            {submitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Footer />
    </>
  );
}
