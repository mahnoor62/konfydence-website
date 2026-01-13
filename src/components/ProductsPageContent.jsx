'use client';

import { Container, Typography, Grid, Box, Chip, Button, Link, Stack, Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, TextField, Select, MenuItem, FormControl, InputLabel, Alert } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import NextLink from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import PaginationControls from '@/components/PaginationControls';
import ErrorDisplay from '@/components/ErrorDisplay';
import LoadingState from '@/components/LoadingState';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const API_URL = `${API_BASE_URL}/api`;
const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

console.log('🔗 Products Page API URL:', API_URL);

const PRODUCTS_PER_PAGE = 12;

// Product Category filters
const PRODUCT_CATEGORIES = [
  'Membership',
  'Template',
  'Course',
  'Guide',
  'Toolkit',
  'Digital Guide',
];

// Use Case / Type filters
const USE_CASE_TYPES = [
  'Leadership',
  'OnCall',
  'Community',
  'Starter',
  'Bundle',
];

const CATEGORY_COLORS = {
  'Membership': '#063C5E',
  'Template': '#0B7897',
  'Course': '#00A4E8',
  'Guide': '#5FA8BA',
  'Toolkit': '#7FC7D9',
  'Digital Guide': '#9FC9D9',
};

const TYPE_COLORS = {
  'Leadership': '#063C5E',
  'OnCall': '#0B7897',
  'Community': '#00A4E8',
  'Starter': '#FF725E',
  'Bundle': '#0B7897',
};

export default function ProductsPageContent() {
  const router = useRouter();
  const pageParam = router.query.page;
  const typeParam = router.query.type || 'all';
  const categoryParam = router.query.category || 'all';
  const { user } = useAuth();

  const currentPage = Math.max(parseInt(pageParam || '1', 10) || 1, 1);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1, page: 1 });
  const [selectedType, setSelectedType] = useState(typeParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0); // 0: Families, 1: Schools/Uni, 2: Businesses
  const [cardPage, setCardPage] = useState(1);
  const CARDS_PER_PAGE = 6; // 2 rows of 3 cards = 6 cards per page
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [processingPurchase, setProcessingPurchase] = useState(false);
  const [schoolsDemoModalOpen, setSchoolsDemoModalOpen] = useState(false);
  const [businessesDemoModalOpen, setBusinessesDemoModalOpen] = useState(false);
  const [customPackageRequestDialogOpen, setCustomPackageRequestDialogOpen] = useState(false);
  const [requestForm, setRequestForm] = useState({
    entityType: '',
    organizationName: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    additionalNotes: '',
    seatLimit: '',
    customPricing: ''
  });
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestSnackbar, setRequestSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchProducts = useCallback(async (page, type, category, targetAudience) => {
    try {
      setLoading(true);
      setError(null);
      const ts = Date.now();
      const params = {
        all: 'true', // Fetch all products without pagination for filtering
        _t: ts, // cache breaker
      };

      if (targetAudience) {
        params.targetAudience = targetAudience;
      }

      const url = `${API_URL}/products`;
      console.log('📡 API: GET', url, params);
      const res = await axios.get(url, {
        headers: NO_CACHE_HEADERS,
        params,
      });
      
      // Handle both array response and paginated response
      const fetchedProducts = Array.isArray(res.data) ? res.data : (res.data.products || []);
      setProducts(fetchedProducts);
      setMeta({
        total: fetchedProducts.length,
        totalPages: 1,
        page: 1,
      });
    } catch (err) {
      console.error('❌ Error fetching products:', {
        url: `${API_URL}/products`,
        error: err.response?.data || err.message,
        status: err.response?.status,
      });
      setError(err);
      setProducts([]);
      setMeta({ total: 0, totalPages: 1, page: 1 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const typeFromUrl = router.query.type || 'all';
    const categoryFromUrl = router.query.category || 'all';
    setSelectedType(typeFromUrl);
    setSelectedCategory(categoryFromUrl);
  }, [router.query]);

  useEffect(() => {
    if (router.isReady) {
      // Map activeTab to targetAudience
      const targetAudienceMap = {
        0: 'private-users', // Families - B2C
        1: 'schools', // Schools - B2E
        2: 'businesses', // Business - B2B
      };
      const targetAudience = targetAudienceMap[activeTab];
      fetchProducts(currentPage, selectedType, selectedCategory, targetAudience);
    }
  }, [currentPage, selectedType, selectedCategory, activeTab, fetchProducts, router.isReady]);

  // Reset card page when tab changes
  useEffect(() => {
    setCardPage(1);
  }, [activeTab]);

  // Initialize AOS animations
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('aos').then((AOS) => {
        AOS.default.init({
          duration: 800,
          easing: 'ease-in-out',
          once: true,
          offset: 100,
        });
      });
    }
  }, []);

  const handleTypeChange = (type) => {
    setSelectedType(type);
    const params = new URLSearchParams();
    if (type !== 'all') {
      params.set('type', type);
    }
    if (selectedCategory !== 'all') {
      params.set('category', selectedCategory);
    }
    params.set('page', '1');
    router.push(`/products?${params.toString()}`);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    const params = new URLSearchParams();
    if (selectedType !== 'all') {
      params.set('type', selectedType);
    }
    if (category !== 'all') {
      params.set('category', category);
    }
    params.set('page', '1');
    router.push(`/products?${params.toString()}`);
  };

  const showingFrom = meta.total === 0 ? 0 : (meta.page - 1) * PRODUCTS_PER_PAGE + 1;
  const showingTo = meta.total === 0 ? 0 : showingFrom + products.length - 1;

  return (
    <>
      <Header />
      <Box component="main">
        {/* Hero Section */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #063C5E 0%, #0B7897 100%)',
            color: 'white',
            position: 'relative',
            width: '100%',
            py: { xs: 12, md: 18 },
            minHeight: { xs: '90vh', md: '80vh' },
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Container
            maxWidth="lg"
            sx={{ position: 'relative', zIndex: 2 }}
            data-aos="zoom-in"
            data-aos-duration="800"
          >
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                variant="h1"
                // component="h1"
                sx={{
                  mb: 3,
                  fontSize: { xs: '2rem', md: '2rem' },
                  fontWeight: 700,
                  color: 'white',
                  lineHeight: 1.2,
                }}
              >
              Tools That Train the Pause — Before the Click
              </Typography>
              
              <Typography 
                variant="body1" 
                sx={{ 
                  mb: 3,
                  fontSize: { xs: '1rem', md: '1.125rem' },
                  color: 'rgba(255, 255, 255, 0.9)',
                  maxWidth: '900px',
                  mx: 'auto',
                  lineHeight: 1.7,
                }}
              >
               Fun, science-backed simulations that train the one habit that stops scams: a five-second pause under pressure.
               From family game nights to classrooms and enterprise compliance.
              </Typography>

              <Box sx={{ mb: 4 }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontSize: { xs: '0.9rem', md: '1rem' },
                    color: 'rgba(255, 255, 255, 0.85)',
                  }}
                >
                  Learn the science behind it →{' '}
                  <Box
                    component="a"
                    href="/pdfs/the-limbic-hijack.pdf" 
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ 
                      color: 'white',
                      fontWeight: 600,
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      '&:hover': {
                        opacity: 0.8,
                      },
                    }}
                  >
                    Understand the Limbic Hijack
                  </Box>
                </Typography>
              </Box>

            {/* CTA Buttons */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent="center"
              alignItems="center"
              sx={{ mt: 4 }}
            >
              <Button
                size="large"
                href="/sskit-family"
                component={NextLink}
                sx={{
                  backgroundColor: '#FFFFFF',
                  color: '#0B7897',
                  border: '1px solid transparent',
                  px: { xs: 4, md: 5 },
                  py: 1.5,
                  fontSize: { xs: '0.95rem', md: '1rem' },
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: '#F5F5F5',
                    color: '#0B7897',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  },
                }}
              >
                Families → Shop Kits
              </Button>
              
              <Button
                size="large"
                href="/free-resources"
                component={NextLink}
                sx={{
                  backgroundColor: '#FFFFFF',
                  color: '#0B7897',
                  border: '1px solid transparent',
                  px: { xs: 4, md: 5 },
                  py: 1.5,
                  fontSize: { xs: '0.95rem', md: '1rem' },
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: '#F5F5F5',
                    color: '#0B7897',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  },
                }}
              >
                Schools/Uni → Free Resources
              </Button>
              
              <Button
                size="large"
                href="/contact"
                component={NextLink}
                sx={{
                  backgroundColor: '#FFFFFF',
                  color: '#0B7897',
                  border: '1px solid transparent',
                  px: { xs: 4, md: 5 },
                  py: 1.5,
                  fontSize: { xs: '0.95rem', md: '1rem' },
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: '#F5F5F5',
                    color: '#0B7897',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  },
                }}
              >
                Business → Request Demo
              </Button>
            </Stack>
            </Box>
          </Container>
        </Box>

        {/* Products Section */}
        <Box sx={{ backgroundColor: '#E9F4FF', py: 8 }}>
          <Container
            maxWidth="lg"
          >
            {/* Tabs */}
            <Box sx={{ mb: 4, borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={activeTab}
                onChange={(e, newValue) => setActiveTab(newValue)}
                centered
                sx={{
                  '& .MuiTab-root': {
                    fontSize: { xs: '0.9rem', md: '1rem' },
                    fontWeight: 600,
                    textTransform: 'none',
                    minHeight: 60,
                    color: '#063C5E',
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
                <Tab label="For Families" />
                <Tab label="For Schools & Universities" />
                <Tab label="For Businesses & Organizations" />
              </Tabs>
            </Box>

          {error ? (
            <ErrorDisplay error={error} title="Failed to Load Products" />
          ) : loading ? (
            <LoadingState message="Loading products..." />
          ) : products.length === 0 ? (
            <Box textAlign="center" py={6}>
              <Typography variant="h6" color="text.secondary">
                {selectedType !== 'all' || selectedCategory !== 'all'
                  ? 'No products found matching your filters. Try adjusting your selection.'
                  : 'No products available right now. Please check back later.'}
              </Typography>
            </Box>
          ) : (
            <>
              {/* Filter products based on active tab */}
              {(() => {
                // Filter products by targetAudience (handle both array and string)
                const filteredProducts = products.filter(p => {
                  const targetAudiences = Array.isArray(p.targetAudience) ? p.targetAudience : (p.targetAudience ? [p.targetAudience] : []);
                  
                  if (activeTab === 0) {
                    // Families - B2C (private-users)
                    return targetAudiences.includes('private-users');
                  } else if (activeTab === 1) {
                    // Schools - B2E (schools)
                    return targetAudiences.includes('schools');
                  } else if (activeTab === 2) {
                    // Business - B2B (businesses)
                    return targetAudiences.includes('businesses');
                  }
                  return false;
                });
                
                // Filter based on active tab
                let displayedProducts = filteredProducts;
                let sectionContent = null;
                
                // Find specific products for Families tab
                let physicalProduct = null;
                let digitalProduct = null;
                let bundleProduct = null;
                
                if (activeTab === 0) {
                  // Find physical, digital, and bundle products
                  physicalProduct = filteredProducts.find(p => 
                    p.title?.toLowerCase().includes('tactical') || 
                    p.title?.toLowerCase().includes('physical') ||
                    p.name?.toLowerCase().includes('tactical') ||
                    p.name?.toLowerCase().includes('physical')
                  );
                  
                  digitalProduct = filteredProducts.find(p => 
                    p.title?.toLowerCase().includes('digital') || 
                    p.name?.toLowerCase().includes('digital')
                  );
                  
                  bundleProduct = filteredProducts.find(p => 
                    p.title?.toLowerCase().includes('bundle') || 
                    p.title?.toLowerCase().includes('best value') ||
                    p.name?.toLowerCase().includes('bundle') ||
                    p.name?.toLowerCase().includes('best value')
                  );
                  
                  // If not found by title, use first 3 products
                  if (!physicalProduct && filteredProducts.length > 0) physicalProduct = filteredProducts[0];
                  if (!digitalProduct && filteredProducts.length > 1) digitalProduct = filteredProducts[1];
                  if (!bundleProduct && filteredProducts.length > 2) bundleProduct = filteredProducts[2];
                  
                  sectionContent = {
                    headline: 'Build Lifelong Confidence at Home',
                    subheadline: 'Offline-first card game + optional digital challenges for ongoing practice. Perfect for dinner tables, car rides, or family discussions—no nagging required.',
                  };
                } else if (activeTab === 1) {
                  sectionContent = {
                    headline: 'Turn Students into Digital Leaders',
                    subheadline: 'Engaging activities that fit classrooms, clubs, or orientation weeks. Easy for teachers, proven to build pause habits early.',
                  };
                } else if (activeTab === 2) {
                  sectionContent = {
                    headline: 'Compliance That Proves Real Risk Reduction',
                    subheadline: 'Beyond quizzes—fun simulations with auditor-ready reports on pause behavior under pressure. NIS2-ready and ISO-aligned.',
                  };
                }
                
                return (
                  <>
                    {/* Section Headline and Subheadline */}
                    <Box sx={{ mb: 5, textAlign: 'center' }}>
                      <Typography
                        variant="h2"
                        sx={{
                          mb: 2,
                          fontSize: { xs: '1.75rem', md: '2.5rem' },
                          fontWeight: 700,
                          color: '#063C5E',
                        }}
                      >
                        {sectionContent?.headline}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          fontSize: { xs: '1rem', md: '1.125rem' },
                          color: 'text.secondary',
                          maxWidth: '800px',
                          mx: 'auto',
                          lineHeight: 1.7,
                          mb: 4,
                        }}
                      >
                        {sectionContent?.subheadline}
                      </Typography>
                    </Box>

                    {/* Section-Specific Content */}
                    {activeTab === 0 && (
                      <Box sx={{ mb: 5 }}>
                        <Grid container spacing={4} sx={{ mb: 4 }}>
                          {/* Tactical Card Game Kit - Physical Product */}
                          <Grid item xs={12} md={4}>
                            <Box sx={{ height: '100%', p: 3, backgroundColor: 'white', borderRadius: 2, display: 'flex', flexDirection: 'column' }}>
                              {physicalProduct?.imageUrl && (
                                <Box
                                  component="img"
                                  src={physicalProduct.imageUrl.startsWith('http') 
                                    ? physicalProduct.imageUrl 
                                    : `${API_BASE_URL}${physicalProduct.imageUrl.startsWith('/') ? physicalProduct.imageUrl : `/${physicalProduct.imageUrl}`}`}
                                  alt={physicalProduct.title}
                                  onClick={() => {
                                    const imageUrl = physicalProduct.imageUrl.startsWith('http') 
                                      ? physicalProduct.imageUrl 
                                      : `${API_BASE_URL}${physicalProduct.imageUrl.startsWith('/') ? physicalProduct.imageUrl : `/${physicalProduct.imageUrl}`}`;
                                    setSelectedImage(imageUrl);
                                    setImageModalOpen(true);
                                  }}
                                  sx={{
                                    width: '100%',
                                    height: '200px',
                                    objectFit: 'contain',
                                    mb: 2,
                                    borderRadius: 1,
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s, opacity 0.2s',
                                    '&:hover': {
                                      transform: 'scale(1.02)',
                                      opacity: 0.9,
                                    },
                                  }}
                                />
                              )}
                              <Typography variant="h4" sx={{ mb: 2, fontSize: { xs: '1.25rem', md: '1.5rem' }, fontWeight: 600, color: '#063C5E' }}>
                              {physicalProduct.title}
                              </Typography>
                              <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary', lineHeight: 1.7, flexGrow: 1 }}>
                                {physicalProduct?.description ? physicalProduct.description.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : '90 premium cards with real-life scenarios. Spot H.A.C.K. tricks (Hurry, Authority, Comfort, Kill-Switch) and practice the 5-second pause. Includes no-blame Family Tech Contract.'}
                              </Typography>
                              <Box sx={{ mb: 2 }}>
                                {physicalProduct?.price && (
                                  <>
                                    <Typography variant="body2" sx={{ color: '#063C5E', mb: 0.5 }}>
                                      <b>Early bird: ${physicalProduct.price}</b>
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#063C5E' }}>
                                      <b>Later: $59</b>
                                    </Typography>
                                  </>
                                )}
                              </Box>
                              <Button
                                variant="contained"
                                onClick={async () => {
                                  if (!user) {
                                    router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`);
                                    return;
                                  }
                                  
                                  if (processingPurchase) return;
                                  setProcessingPurchase(true);
                                  
                                  try {
                                    if (!physicalProduct?._id) {
                                      alert('Product not found. Please try again.');
                                      setProcessingPurchase(false);
                                      return;
                                    }
                                    
                                    // Get auth token
                                    const token = localStorage.getItem('token');
                                    if (!token) {
                                      router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`);
                                      setProcessingPurchase(false);
                                      return;
                                    }
                                    
                                    // Create Stripe Checkout Session - Direct product purchase (no package needed)
                                    const checkoutResponse = await axios.post(
                                      `${API_URL}/payments/create-checkout-session`,
                                      {
                                        productId: physicalProduct._id,
                                        urlType: 'B2C',
                                        directProductPurchase: true, // Flag for direct product purchase
                                      },
                                      {
                                        headers: {
                                          Authorization: `Bearer ${token}`,
                                        },
                                      }
                                    );
                                    
                                    // Redirect to Stripe Checkout
                                    if (checkoutResponse.data.url) {
                                      window.location.href = checkoutResponse.data.url;
                                    } else {
                                      alert('Failed to create checkout session');
                                      setProcessingPurchase(false);
                                    }
                                  } catch (error) {
                                    console.error('Error purchasing physical product:', error);
                                    alert(error.response?.data?.error || 'Failed to start checkout process');
                                    setProcessingPurchase(false);
                                  }
                                }}
                                disabled={processingPurchase}
                                sx={{
                                  backgroundColor: '#0B7897',
                                  color: 'white',
                                  '&:hover': {
                                    backgroundColor: '#063C5E',
                                  },
                                }}
                              >
                                {processingPurchase ? 'Redirecting to Stripe...' : 'Buy Physical Kit Now'}
                              </Button>
                            </Box>
                          </Grid>

                          {/* Digital Extension - Digital Product */}
                          <Grid item xs={12} md={4}>
                            <Box sx={{ height: '100%', p: 3, backgroundColor: 'white', borderRadius: 2, display: 'flex', flexDirection: 'column' }}>
                              {digitalProduct?.imageUrl && (
                                <Box
                                  component="img"
                                  src={digitalProduct.imageUrl.startsWith('http') 
                                    ? digitalProduct.imageUrl 
                                    : `${API_BASE_URL}${digitalProduct.imageUrl.startsWith('/') ? digitalProduct.imageUrl : `/${digitalProduct.imageUrl}`}`}
                                  alt={digitalProduct.title || digitalProduct.name}
                                  onClick={() => {
                                    const imageUrl = digitalProduct.imageUrl.startsWith('http') 
                                      ? digitalProduct.imageUrl 
                                      : `${API_BASE_URL}${digitalProduct.imageUrl.startsWith('/') ? digitalProduct.imageUrl : `/${digitalProduct.imageUrl}`}`;
                                    setSelectedImage(imageUrl);
                                    setImageModalOpen(true);
                                  }}
                                  sx={{
                                    width: '100%',
                                    height: '200px',
                                    objectFit: 'contain',
                                    mb: 2,
                                    borderRadius: 1,
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s, opacity 0.2s',
                                    '&:hover': {
                                      transform: 'scale(1.02)',
                                      opacity: 0.9,
                                    },
                                  }}
                                />
                              )}
                              <Typography variant="h4" sx={{ mb: 2, fontSize: { xs: '1.25rem', md: '1.5rem' }, fontWeight: 600, color: '#063C5E' }}>
                              {digitalProduct.title}
                              </Typography>
                              <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary', lineHeight: 1.7, flexGrow: 1 }}>
                                {digitalProduct?.description ? digitalProduct.description.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : 'Monthly new scenarios, progress tracking, and solo/family challenges on your phone.'}
                              </Typography>
                              <Box sx={{ mb: 2 }}>
                                {digitalProduct?.price ? (
                                  <>
                                    <Typography variant="body2" sx={{ color: '#063C5E', mb: 0.5 }}>
                                      <b>Early bird: ${digitalProduct.price}/year</b>
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#063C5E' }}>
                                      <b>Later: $39/year</b>
                                    </Typography>
                                  </>
                                ) : (
                                  <Typography variant="body2" sx={{ color: '#063C5E', mb: 0.5 }}>
                                    <b>Early bird: ${digitalProduct?.price || 'N/A'}/year</b>
                                  </Typography>
                                )}
                              </Box>
                              <Button
                                variant="contained"
                                href={digitalProduct?._id ? `/packages?type=B2C&productId=${digitalProduct._id}` : '/packages?type=B2C'}
                                component={NextLink}
                                sx={{
                                  backgroundColor: '#0B7897',
                                  color: 'white',
                                  '&:hover': {
                                    backgroundColor: '#063C5E',
                                  },
                                }}
                              >
                                Subscribe to Digital
                              </Button>
                            </Box>
                          </Grid>

                          {/* Best Value Bundle - Bundle Product */}
                          <Grid item xs={12} md={4}>
                            <Box sx={{ height: '100%', p: 3, backgroundColor: '#0B7897', borderRadius: 2, display: 'flex', flexDirection: 'column' }}>
                              {bundleProduct?.imageUrl && (
                                <Box
                                  component="img"
                                  src={bundleProduct.imageUrl.startsWith('http') 
                                    ? bundleProduct.imageUrl 
                                    : `${API_BASE_URL}${bundleProduct.imageUrl.startsWith('/') ? bundleProduct.imageUrl : `/${bundleProduct.imageUrl}`}`}
                                  alt={bundleProduct.title || bundleProduct.name}
                                  onClick={() => {
                                    const imageUrl = bundleProduct.imageUrl.startsWith('http') 
                                      ? bundleProduct.imageUrl 
                                      : `${API_BASE_URL}${bundleProduct.imageUrl.startsWith('/') ? bundleProduct.imageUrl : `/${bundleProduct.imageUrl}`}`;
                                    setSelectedImage(imageUrl);
                                    setImageModalOpen(true);
                                  }}
                                  sx={{
                                    width: '100%',
                                    height: '200px',
                                    objectFit: 'contain',
                                    mb: 2,
                                    borderRadius: 1,
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s, opacity 0.2s',
                                    '&:hover': {
                                      transform: 'scale(1.02)',
                                      opacity: 0.9,
                                    },
                                  }}
                                />
                              )}
                              <Typography variant="h4" sx={{ mb: 2, fontSize: { xs: '1.25rem', md: '1.5rem' }, fontWeight: 600, color: 'white' }}>
                                Best Value Bundle
                              </Typography>
                              <Typography variant="body1" sx={{ mb: 2, color: 'white', lineHeight: 1.7, flexGrow: 1 }}>
                                {bundleProduct?.description ? bundleProduct.description.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : 'Physical Kit + 1-Year Digital Access.'}
                              </Typography>
                              <Box sx={{ mb: 2, display: 'inline-flex', alignSelf: 'flex-start' }}>
                                <Chip
                                  label="Digital Extension"
                                  sx={{
                                    backgroundColor: '#5FA8BA',
                                    color: 'white',
                                    fontWeight: 600,
                                    fontSize: { xs: '0.875rem', md: '0.95rem' },
                                    px: 1,
                                    py: 2,
                                  }}
                                />
                              </Box>
                              <Box sx={{ mb: 2 }}>
                                {bundleProduct?.price && (
                                  <>
                                    <Typography variant="body2" sx={{ color: 'white', mb: 0.5 }}>
                                      <b>Early bird: ${bundleProduct.price}</b>
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'white' }}>
                                      <b>Later: $89</b>
                                    </Typography>
                                  </>
                                )}
                              </Box>
                              <Button
                                variant="outlined"
                                href={bundleProduct?._id ? `/packages?type=B2C&productId=${bundleProduct._id}` : '/packages?type=B2C'}
                                component={NextLink}
                                sx={{
                                  backgroundColor: 'transparent',
                                  color: 'white',
                                  borderColor: 'white',
                                  border: '2px solid white',
                                  '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                    borderColor: 'white',
                                  },
                                }}
                              >
                                Get Bundle Now
                              </Button>
                            </Box>
                          </Grid>
                        </Grid>

                        {/* Images Section */}
                        <Box sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap' }}>
                          <Box
                            component="img"
                            src="/images/1Bank.png"
                            alt="Bank"
                            sx={{
                              maxWidth:'300px' ,
                              height: 'auto',
                              borderRadius: 2,
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            }}
                          />
                          <Box
                            component="img"
                            src="/images/1.png"
                            alt="Product"
                            sx={{
                              maxWidth:'300px' ,
                              height: 'auto',
                              borderRadius: 2,
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            }}
                          />
                        </Box>

                        {/* Additional Notes */}
                        <Box sx={{ mt: 4, textAlign: 'center' }}>
                          <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary', fontStyle: 'italic' }}>
                            Engineered in Germany – Premium quality cards built to last.
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary', fontStyle: 'italic' }}>
                            Konfydence for Kids: $1 per sale donated to initiatives that strengthen digital resilience for children and young people.
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                            A simple, no-blame agreement to start open conversations about online safety. Builds trust, sets boundaries, and reinforces the pause habit.
                          </Typography>
                        </Box>
                      </Box>
                    )}

                    {activeTab === 1 && (
                      <Box sx={{ mb: 5 }}>
                        <Grid container spacing={4} sx={{ mb: 4 }}>
                          {/* Free Lesson Pack */}
                          <Grid item xs={12} md={6}>
                            <Box sx={{ height: '100%', p: 3, backgroundColor: 'white', borderRadius: 2, display: 'flex', flexDirection: 'column' }}>
                              <Typography variant="h4" sx={{ mb: 2, fontSize: { xs: '1.25rem', md: '1.5rem' }, fontWeight: 600, color: '#063C5E' }}>
                                Free Lesson Pack
                              </Typography>
                              <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary', lineHeight: 1.7, flexGrow: 1 }}>
                                Downloadable activities, workshop guides, and card game adaptations. Teach H.A.C.K. framework and pause drills—no cost to start.
                              </Typography>
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#063C5E', mb: 0.5 }}>
                                  Pricing: Free
                                </Typography>
                              </Box>
                              <Button
                                variant="contained"
                                href="/free-resources"
                                component={NextLink}
                                sx={{
                                  backgroundColor: '#0B7897',
                                  color: 'white',
                                  '&:hover': {
                                    backgroundColor: '#063C5E',
                                  },
                                }}
                              >
                                Download Free Pack
                              </Button>
                            </Box>
                          </Grid>

                          {/* Full Student Program */}
                          <Grid item xs={12} md={6}>
                            <Box sx={{ height: '100%', p: 3, backgroundColor: 'white', borderRadius: 2, display: 'flex', flexDirection: 'column' }}>
                              <Typography variant="h4" sx={{ mb: 2, fontSize: { xs: '1.25rem', md: '1.5rem' }, fontWeight: 600, color: '#063C5E' }}>
                                Full Student Program (CoMaSi Education Edition)
                              </Typography>
                              <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary', lineHeight: 1.7, flexGrow: 1 }}>
                                Unlimited access for students/staff: simulations, habit tracking, facilitator reports. Per-seat annual subscription with optional onboarding support. NIS2-aligned for EU institutions.
                              </Typography>
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#063C5E', mb: 0.5 }}>
                                  Privacy-First By Design <br/>
                                  Pricing: Custom per-seat licensing – request a free pilot to see fit.
                                </Typography>
                              </Box>
                              <Button
                                variant="contained"
                                onClick={() => setSchoolsDemoModalOpen(true)}
                                sx={{
                                  backgroundColor: '#0B7897',
                                  color: 'white',
                                  '&:hover': {
                                    backgroundColor: '#063C5E',
                                  },
                                }}
                              >
                                Request Free Demo / Resources 
                              </Button>
                            </Box>
                          </Grid>
                        </Grid>

                        {/* Images Section for Schools */}
                        <Box sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap' }}>
                          <Box
                            component="img"
                            src="/images/lucrative.png"
                            alt="School Product"
                            sx={{
                              maxWidth: '300px',
                              height: 'auto',
                              borderRadius: 2,
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            }}
                          />
                          <Box
                            component="img"
                            src="/images/lucrative-back.png"
                            alt="School Product 2"
                            sx={{
                              maxWidth: '300px',
                              height: 'auto',
                              borderRadius: 2,
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            }}
                          />
                        </Box>
                      </Box>
                    )}

                    {activeTab === 2 && (
                      <Box sx={{ mb: 5 }}>
                        <Grid container spacing={4} sx={{ mb: 4 }}>
                          {/* Compliance Made Simple */}
                          <Grid item xs={12} md={6}>
                            <Box sx={{ height: '100%', p: 3, backgroundColor: 'white', borderRadius: 2, display: 'flex', flexDirection: 'column' }}>
                              <Typography variant="h4" sx={{ mb: 2, fontSize: { xs: '1.25rem', md: '1.5rem' }, fontWeight: 600, color: '#063C5E' }}>
                                Compliance Made Simple (CoMaSi)
                              </Typography>
                              <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary', lineHeight: 1.7, flexGrow: 1 }}>
                                Unlimited simulations, team dashboards, progress reports, and custom scenarios. Annual per-seat subscription with optional onboarding fee for setup/training.
                              </Typography>
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#063C5E', mb: 0.5 }}>
                                  Pricing: Custom per-seat licensing tailored to your team size – includes volume discounts.
                                </Typography>
                              </Box>
                              <Button
                                variant="contained"
                                href="/contact"
                                component={NextLink}
                                sx={{
                                  backgroundColor: '#0B7897',
                                  color: 'white',
                                  '&:hover': {
                                    backgroundColor: '#063C5E',
                                  },
                                }}
                              >
                              Request A Free Demo
                              </Button>
                            </Box>
                          </Grid>

                          {/* Add-On: Custom Simulations */}
                          <Grid item xs={12} md={6}>
                            <Box sx={{ height: '100%', p: 3, backgroundColor: 'white', borderRadius: 2, display: 'flex', flexDirection: 'column' }}>
                              <Typography variant="h4" sx={{ mb: 2, fontSize: { xs: '1.25rem', md: '1.5rem' }, fontWeight: 600, color: '#063C5E' }}>
                                Add-On: Custom Simulations
                              </Typography>
                              <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary', lineHeight: 1.7, flexGrow: 1 }}>
                                Industry-specific pressure drills (e.g., executive impersonation, supply chain tricks).
                              </Typography>
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#063C5E', mb: 0.5 }}>
                                  Pricing: Custom Pricing
                                </Typography>
                              </Box>
                              <Button
                                variant="contained"
                                onClick={() => {
                                  if (!user) {
                                    router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`);
                                    return;
                                  }
                                  setCustomPackageRequestDialogOpen(true);
                                }}
                                sx={{
                                  backgroundColor: '#0B7897',
                                  color: 'white',
                                  '&:hover': {
                                    backgroundColor: '#063C5E',
                                  },
                                }}
                              >
                                Request A Custom Simulation
                              </Button>
                            </Box>
                          </Grid>
                        </Grid>

                        {/* Images Section for Business */}
                        <Box sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap' }}>
                          <Box
                            component="img"
                            src="/images/vendor.png"
                            alt="Business Product"
                            sx={{
                              maxWidth: '300px',
                              height: 'auto',
                              borderRadius: 2,
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            }}
                          />
                          <Box
                            component="img"
                            src="/images/vendor-back.png"
                            alt="Business Product 2"
                            sx={{
                              maxWidth: '300px',
                              height: 'auto',
                              borderRadius: 2,
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            }}
                          />
                        </Box>
                      </Box>
                    )}

                    {/* Products Grid with Pagination - Hidden for Families, Schools, and Businesses tabs */}
                    {activeTab !== 0 && activeTab !== 1 && activeTab !== 2 && (
                      <>
                        {displayedProducts.length === 0 ? (
                          <Box textAlign="center" py={6}>
                            <Typography variant="h6" color="text.secondary">
                              No products found in this category.
                            </Typography>
                          </Box>
                        ) : (
                          <>
                            {(() => {
                              // Calculate pagination for cards
                              const totalCardPages = Math.ceil(displayedProducts.length / CARDS_PER_PAGE);
                              const startIndex = (cardPage - 1) * CARDS_PER_PAGE;
                              const endIndex = startIndex + CARDS_PER_PAGE;
                              const paginatedProducts = displayedProducts.slice(startIndex, endIndex);

                              return (
                                <>
                                  <Grid
                                    data-aos="zoom-in"
                                    data-aos-duration="800"
                                    data-aos-delay="100"
                                    container
                                    spacing={4}
                                    sx={{ alignItems: 'stretch', mb: 4 }}
                                  >
                                    {paginatedProducts.map((product, index) => (
                                      <Grid item xs={12} sm={6} md={4} key={product._id}>
                                        <ProductCard product={product} delay={index * 100} />
                                      </Grid>
                                    ))}
                                  </Grid>

                                  {/* Card Pagination */}
                                  {totalCardPages > 1 && (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
                                      <Stack direction="row" spacing={1} alignItems="center">
                                        <Button
                                          onClick={() => setCardPage(p => Math.max(1, p - 1))}
                                          disabled={cardPage === 1}
                                          sx={{ minWidth: 100 }}
                                        >
                                          Previous
                                        </Button>
                                        <Typography variant="body2" sx={{ px: 2 }}>
                                          Page {cardPage} of {totalCardPages}
                                        </Typography>
                                        <Button
                                          onClick={() => setCardPage(p => Math.min(totalCardPages, p + 1))}
                                          disabled={cardPage === totalCardPages}
                                          sx={{ minWidth: 100 }}
                                        >
                                          Next
                                        </Button>
                                      </Stack>
                                    </Box>
                                  )}

                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    textAlign="center"
                                    sx={{ mb: 3 }}
                                  >
                                    Showing {startIndex + 1}–{Math.min(endIndex, displayedProducts.length)} of {displayedProducts.length} {displayedProducts.length === 1 ? 'product' : 'products'}
                                  </Typography>
                                </>
                              );
                            })()}
                          </>
                        )}
                      </>
                    )}
                  </>
                );
              })()}
            </>
          )}

          {/* Pagination - Always shown after product grid */}
          {meta.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <PaginationControls
                page={meta.page}
                totalPages={meta.totalPages}
                basePath={`/products${selectedType !== 'all' || selectedCategory !== 'all' ? `?${new URLSearchParams({
                  ...(selectedType !== 'all' && { type: selectedType }),
                  ...(selectedCategory !== 'all' && { category: selectedCategory }),
                }).toString()}` : ''}`}
              />
            </Box>
          )}
          </Container>
        </Box>

        {/* Bottom Motivational Close Section */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #063C5E 0%, #0B7897 100%)',
            color: 'white',
            py: { xs: 8, md: 12 },
            position: 'relative',
            overflow: 'hidden',
          }}
          data-aos="fade-up"
          data-aos-duration="800"
        >
          <Container maxWidth="lg">
            <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
              <Typography
                variant="h2"
                component="h2"
                sx={{
                  mb: 3,
                  fontSize: { xs: '2rem', md: '3rem' },
                  fontWeight: 700,
                  color: 'white',
                  lineHeight: 1.2,
                }}
              >
                One Habit Changes Everything
              </Typography>
              
              <Typography
                variant="body1"
                sx={{
                  mb: 5,
                  fontSize: { xs: '1rem', md: '1.25rem' },
                  color: 'rgba(255, 255, 255, 0.9)',
                  maxWidth: '700px',
                  mx: 'auto',
                  lineHeight: 1.7,
                }}
              >
                Scammers rely on rush. You rely on pause. Start building it today—with tools designed for real life.
              </Typography>

              {/* CTA Buttons */}
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                justifyContent="center"
                alignItems="center"
                sx={{ mb: 4 }}
              >
                <Button
                  size="large"
                  href="/sskit-family"
                  component={NextLink}
                  sx={{
                    backgroundColor: '#FFFFFF',
                    color: '#0B7897',
                    px: { xs: 4, md: 5 },
                    py: 1.5,
                    fontSize: { xs: '0.95rem', md: '1rem' },
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: 2,
                    border: '1px solid transparent',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: '#F5F5F5',
                      color: '#0B7897',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    },
                  }}
                >
                  Home → Shop Family Kits
                </Button>
                
                <Button
                  size="large"
                  href="/free-resources"
                  component={NextLink}
                  sx={{
                    backgroundColor: '#FFFFFF',
                    color: '#0B7897',
                    px: { xs: 4, md: 5 },
                    py: 1.5,
                    fontSize: { xs: '0.95rem', md: '1rem' },
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: 2,
                    border: '1px solid transparent',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: '#F5F5F5',
                      color: '#0B7897',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    },
                  }}
                >
                  School/Uni → Free Resources
                </Button>
                
                <Button
                  size="large"
                  href="/contact"
                  component={NextLink}
                  sx={{
                    backgroundColor: '#FFFFFF',
                    color: '#0B7897',
                    px: { xs: 4, md: 5 },
                    py: 1.5,
                    fontSize: { xs: '0.95rem', md: '1rem' },
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: 2,
                    border: '1px solid transparent',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: '#F5F5F5',
                      color: '#0B7897',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    },
                  }}
                >
                  Work → Request Demo
                </Button>
              </Stack>

              {/* Trust Note */}
              <Typography
                variant="body2"
                sx={{
                  fontSize: { xs: '0.85rem', md: '0.95rem' },
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontStyle: 'italic',
                }}
              >
                Join thousands already training smarter. Backed by behavioral science.
              </Typography>
            </Box>
          </Container>
        </Box>

        {/* Gallery Section - Hidden */}
        {false && (
        <Box
          sx={{
            py: { xs: 6, md: 8 },
            backgroundColor: '#ffffff',
            display: 'none',
          }}
          data-aos="fade-up"
          data-aos-duration="800"
        >
          <Container maxWidth="lg">
            <Grid container spacing={3}>
              {['p1', 'p2', 'p3', 'p4', 'p5', 'p6'].map((imageName) => (
                <Grid item xs={12} md={4} key={imageName}>
                  <Box
                    sx={{
                      borderRadius: 2,
                      overflow: 'hidden',
                      height: { xs: 300, md: 350 },
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#ffffff',
                      border: '1px solid #e0e0e0',
                      '&:hover': {
                        transform: 'scale(1.02)',
                        transition: 'transform 0.3s ease',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      },
                    }}
                  >
                    <Box
                      component="img"
                      src={`/images/${imageName}.jpeg`}
                      alt={`Gallery image ${imageName}`}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                      onError={(e) => {
                        // Fallback to placeholder if image doesn't exist
                        e.target.style.display = 'none';
                      }}
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
            
            {/* Gallery Note */}
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography
                variant="body2"
                sx={{
                  fontSize: { xs: '0.85rem', md: '0.95rem' },
                  color: 'text.secondary',
                  fontStyle: 'italic',
                }}
              >
                Emulation detection - Everything you need to know - Build38
              </Typography>
            </Box>
          </Container>
        </Box>
        )}

        {/* Bottom Section - Start Building the Pause Habit */}
        <Box
          sx={{
            py: { xs: 8, md: 12 },
            backgroundColor: '#ffffff',
          }}
          data-aos="fade-up"
          data-aos-duration="800"
        >
          <Container maxWidth="lg">
            <Box sx={{ textAlign: 'center', mb: 5 }}>
              <Typography
                variant="h2"
                component="h2"
                sx={{
                  mb: 3,
                  fontSize: { xs: '2rem', md: '3rem' },
                  fontWeight: 700,
                  color: '#063C5E',
                  lineHeight: 1.2,
                }}
              >
                Start Building the Pause Habit Today
              </Typography>
              
              <Typography
                variant="body1"
                sx={{
                  mb: 5,
                  fontSize: { xs: '1rem', md: '1.25rem' },
                  color: 'text.secondary',
                  maxWidth: '700px',
                  mx: 'auto',
                  lineHeight: 1.7,
                }}
              >
                One simple habit stops most scams: Pause for five seconds when pressure hits. Choose the right tool for your world.
              </Typography>

              {/* Images in 2 Columns */}
              <Grid container spacing={4} sx={{ mb: 6, alignItems: 'stretch' }}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Typography
                      variant="h5"
                      sx={{
                        mb: 2,
                        // fontSize: { xs: '1.5rem', md: '2rem' },
                        fontWeight: 700,
                        color: '#063C5E',
                        textAlign: 'center',
                      }}
                    >
                      How scammers hack your Biology
                    </Typography>
                    <Box
                      sx={{
                        height: { xs: 'auto', md: '500px' },
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        borderRadius: 2,
                        flex: 1,
                      }}
                    >
                      <Box
                        component="img"
                        src="/images/hurry.JPG"
                        alt="Hurry visual"
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          display: 'block',
                        }}
                      />
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Typography
                      variant="h5"
                      sx={{
                        mb: 2,
                        // fontSize: { xs: '1.5rem', md: '2rem' },
                        fontWeight: 700,
                        color: '#063C5E',
                        textAlign: 'center',
                      }}
                    >
                      How you respond: The 5 Seconds Pause
                    </Typography>
                    <Box
                      sx={{
                        height: { xs: 'auto', md: '500px' },
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        borderRadius: 2,
                        flex: 1,
                      }}
                    >
                      <Box
                        component="img"
                        src="/images/5SecondsDefense2.jpg"
                        alt="Five seconds pause habit visual"
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          display: 'block',
                        }}
                      />
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              {/* CTA Buttons */}
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                justifyContent="center"
                alignItems="center"
                sx={{ mb: 6 }}
              >
                <Button
                  size="large"
                  href="/sskit-family"
                  component={NextLink}
                  sx={{
                    backgroundColor: '#0B7897',
                    color: 'white',
                    px: { xs: 4, md: 5 },
                    py: 1.5,
                    fontSize: { xs: '0.95rem', md: '1rem' },
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: '#063C5E',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    },
                  }}
                >
                  Get Family Kit
                </Button>
                
                <Button
                  size="large"
                  href="/free-resources"
                  component={NextLink}
                  sx={{
                    backgroundColor: '#0B7897',
                    color: 'white',
                    px: { xs: 4, md: 5 },
                    py: 1.5,
                    fontSize: { xs: '0.95rem', md: '1rem' },
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: '#063C5E',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    },
                  }}
                >
                  Free School Resources
                </Button>
                
                <Button
                  size="large"
                  href="/comasi#demo-form"
                  component={NextLink}
                  sx={{
                    backgroundColor: '#0B7897',
                    color: 'white',
                    px: { xs: 4, md: 5 },
                    py: 1.5,
                    fontSize: { xs: '0.95rem', md: '1rem' },
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: '#063C5E',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    },
                  }}
                >
                  Business Demo
                </Button>
              </Stack>

              {/* Trust Note and Testimonials */}
              <Typography
                variant="body1"
                sx={{
                  mb: 4,
                  fontSize: { xs: '1rem', md: '1.125rem' },
                  fontWeight: 600,
                  color: '#063C5E',
                }}
              >
                Join thousands already training smarter
              </Typography>

              {/* Testimonials */}
              <Grid container spacing={4} sx={{ mt: 2 }}>
                <Grid item xs={12} md={4}>
                  <Box
                    sx={{
                      p: 4,
                      height: '100%',
                      backgroundColor: 'white',
                      borderRadius: 3,
                      boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Box sx={{ display: 'flex', gap: 0.5, mb: 2 }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Box
                          key={star}
                          component="span"
                          sx={{
                            color: '#FFB800',
                            fontSize: '1.2rem',
                          }}
                        >
                          ★
                        </Box>
                      ))}
                    </Box>
                    <Typography
                      variant="body1"
                      sx={{
                        mb: 3,
                        fontSize: { xs: '0.95rem', md: '1rem' },
                        lineHeight: 1.7,
                        flexGrow: 1,
                        fontStyle: 'italic',
                        color: 'text.secondary',
                      }}
                    >
                      &ldquo;My daughter and I played through the scenarios together — she now spots scam attempts instantly.&rdquo;
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: '#063C5E',
                        fontSize: { xs: '0.9rem', md: '1rem' },
                      }}
                    >
                      — Parent, Toronto
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box
                    sx={{
                      p: 4,
                      height: '100%',
                      backgroundColor: 'white',
                      borderRadius: 3,
                      boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Box sx={{ display: 'flex', gap: 0.5, mb: 2 }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Box
                          key={star}
                          component="span"
                          sx={{
                            color: '#FFB800',
                            fontSize: '1.2rem',
                          }}
                        >
                          ★
                        </Box>
                      ))}
                    </Box>
                    <Typography
                      variant="body1"
                      sx={{
                        mb: 3,
                        fontSize: { xs: '0.95rem', md: '1rem' },
                        lineHeight: 1.7,
                        flexGrow: 1,
                        fontStyle: 'italic',
                        color: 'text.secondary',
                      }}
                    >
                      &ldquo;Finally a game that teaches digital safety in a fun, practical way.&rdquo;
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: '#063C5E',
                        fontSize: { xs: '0.9rem', md: '1rem' },
                      }}
                    >
                      — Family of Four, London
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box
                    sx={{
                      p: 4,
                      height: '100%',
                      backgroundColor: 'white',
                      borderRadius: 3,
                      boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Box sx={{ display: 'flex', gap: 0.5, mb: 2 }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Box
                          key={star}
                          component="span"
                          sx={{
                            color: '#FFB800',
                            fontSize: '1.2rem',
                          }}
                        >
                          ★
                        </Box>
                      ))}
                    </Box>
                    <Typography
                      variant="body1"
                      sx={{
                        mb: 3,
                        fontSize: { xs: '0.95rem', md: '1rem' },
                        lineHeight: 1.7,
                        flexGrow: 1,
                        fontStyle: 'italic',
                        color: 'text.secondary',
                      }}
                    >
                      &ldquo;Our team reported stronger awareness within weeks.&rdquo;
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: '#063C5E',
                        fontSize: { xs: '0.9rem', md: '1rem' },
                      }}
                    >
                      — Compliance Officer, New York
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Container>
        </Box>
      </Box>
      <Footer />
      
      {/* Image Modal Dialog */}
      <Dialog
        open={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        maxWidth={false}
        PaperProps={{
          sx: {
            backgroundColor: 'transparent',
            boxShadow: 'none',
            maxWidth: 'fit-content',
            margin: 'auto',
          },
        }}
      >
        <Box sx={{ position: 'relative', display: 'inline-block', p: 2 }}>
          <IconButton
            onClick={() => setImageModalOpen(false)}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              color: '#063C5E',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 1)',
              },
              zIndex: 1,
            }}
          >
            <CloseIcon />
          </IconButton>
          {selectedImage && (
            <Box
              component="img"
              src={selectedImage}
              alt="Product Image"
              sx={{
                width: 'auto',
                height: 'auto',
                maxWidth: '90vw',
                maxHeight: '90vh',
                objectFit: 'contain',
                borderRadius: 1,
                display: 'block',
              }}
            />
          )}
        </Box>
      </Dialog>

      {/* Schools Demo Modal */}
      <Dialog
        open={schoolsDemoModalOpen}
        onClose={() => setSchoolsDemoModalOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            p: 3,
          },
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <IconButton
            onClick={() => setSchoolsDemoModalOpen(false)}
            sx={{
              position: 'absolute',
              top: -8,
              right: -8,
              color: '#063C5E',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 1)',
              },
              zIndex: 1,
            }}
          >
            <CloseIcon />
          </IconButton>
          
          <Typography variant="h4" sx={{ mb: 3, fontWeight: 700, color: '#063C5E', textAlign: 'center' }}>
            Get Early Access
          </Typography>
          
          <Grid container spacing={3}>
            {(() => {
              // Get first 3 products for schools
              const schoolsProducts = products.filter(p => {
                const targetAudiences = Array.isArray(p.targetAudience) ? p.targetAudience : (p.targetAudience ? [p.targetAudience] : []);
                return targetAudiences.includes('schools');
              }).slice(0, 3);
              
              return schoolsProducts.map((product, index) => {
                // Check if product is physical (Tactical Card Game Kit)
                const isPhysical = product.title?.toLowerCase().includes('tactical') || 
                                   product.title?.toLowerCase().includes('physical') ||
                                   product.name?.toLowerCase().includes('tactical') ||
                                   product.name?.toLowerCase().includes('physical');
                
                // Center card (index 1) should have blue background
                const isCenterCard = index === 1;
                
                return (
                  <Grid item xs={12} md={4} key={product._id || index}>
                    <Box sx={{ 
                      height: '100%', 
                      p: 0, 
                      backgroundColor: isCenterCard ? '#0B7897' : 'white', 
                      borderRadius: 3, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)', 
                      overflow: 'hidden' 
                    }}>
                      {/* Image Section */}
                      <Box
                        sx={{
                          position: 'relative',
                          width: '100%',
                          paddingTop: '66.67%',
                          backgroundColor: isCenterCard ? '#0B7897' : '#FFFFFF',
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {product.imageUrl && (
                          <Box
                            component="img"
                            src={product.imageUrl.startsWith('http') 
                              ? product.imageUrl 
                              : `${API_BASE_URL}${product.imageUrl.startsWith('/') ? product.imageUrl : `/${product.imageUrl}`}`}
                            alt={product.title || product.name}
                            sx={{
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                              width: 'auto',
                              height: 'auto',
                              maxWidth: isCenterCard ? '95%' : '85%',
                              maxHeight: isCenterCard ? '95%' : '85%',
                              objectFit: 'contain',
                            }}
                          />
                        )}
                      </Box>
                      
                      {/* Content Section */}
                      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                        <Typography variant="h6" sx={{ 
                          mb: 1, 
                          fontWeight: 700, 
                          color: isCenterCard ? 'white' : '#063C5E', 
                          fontSize: '1.1rem' 
                        }}>
                          {product.title || product.name || 'Product'}
                        </Typography>
                        
                        {/* Price Display */}
                        {product.price && (
                          <Typography variant="h5" sx={{ 
                            mb: 2, 
                            fontWeight: 700, 
                            color: isCenterCard ? '#FFD700' : '#0B7897', 
                            fontSize: '1.5rem' 
                          }}>
                           Early Bird: ${product.price}
                          </Typography>
                        )}
                        
                        {/* Buy Now Button for Physical / Get Early Access for Others */}
                        {isPhysical ? (
                          <Button
                            variant="contained"
                            fullWidth
                            disabled={processingPurchase}
                            onClick={async (e) => {
                              e.stopPropagation();
                              
                              if (processingPurchase) return;
                              setProcessingPurchase(true);

                              try {
                                if (!product?._id) {
                                  alert('Product not found. Please try again.');
                                  setProcessingPurchase(false);
                                  return;
                                }
                                
                                // Get auth token
                                const token = localStorage.getItem('token');
                                if (!token) {
                                  router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`);
                                  setProcessingPurchase(false);
                                  return;
                                }

                                // Determine product type for unique code generation
                                const productTitle = (product.title || product.name || '').toLowerCase();
                                const isDigitalProduct = productTitle.includes('digital') || productTitle.includes('extension');
                                const isBundleProduct = productTitle.includes('bundle') || productTitle.includes('full');
                                const isPhysicalProduct = productTitle.includes('physical') || productTitle.includes('tactical');
                                
                                let packageType = 'physical';
                                let maxSeats = 0;
                                
                                if (isDigitalProduct) {
                                  packageType = 'digital';
                                  maxSeats = 1;
                                } else if (isBundleProduct) {
                                  packageType = 'digital_physical';
                                  maxSeats = 1;
                                } else if (isPhysicalProduct) {
                                  packageType = 'physical';
                                  maxSeats = 0;
                                }

                                // Create Stripe checkout session for direct product purchase
                                const checkoutResponse = await axios.post(
                                  `${API_URL}/payments/create-checkout-session`,
                                  {
                                    productId: product._id,
                                    urlType: 'B2E',
                                    directProductPurchase: true, // Flag for direct product purchase
                                    packageType: packageType, // Pass package type for unique code generation
                                    maxSeats: maxSeats, // Pass max seats
                                  },
                                  {
                                    headers: {
                                      Authorization: `Bearer ${token}`,
                                    },
                                  }
                                );
                                
                                // Redirect to Stripe Checkout
                                if (checkoutResponse.data.url) {
                                  window.location.href = checkoutResponse.data.url;
                                } else {
                                  throw new Error('No checkout URL received');
                                }
                              } catch (error) {
                                console.error('Error creating checkout session:', error);
                                alert(error.response?.data?.error || 'Failed to initiate purchase. Please try again.');
                                setProcessingPurchase(false);
                              }
                            }}
                            sx={{
                              backgroundColor: isCenterCard ? '#FFFFFF' : '#0B7897',
                              color: isCenterCard ? '#0B7897' : 'white',
                              fontWeight: 600,
                              borderRadius: 2,
                              py: 1,
                              mt: 'auto',
                              border: 'none',
                              '&:hover': {
                                backgroundColor: isCenterCard ? '#F5F5F5' : '#063C5E',
                                color: isCenterCard ? '#063C5E' : 'white',
                              },
                              '&:disabled': {
                                backgroundColor: '#ccc',
                                color: '#666',
                              },
                            }}
                          >
                            {processingPurchase ? 'Redirecting to Stripe...' : 'Buy Now'}
                          </Button>
                        ) : (
                          <Button
                            variant={isCenterCard ? "outlined" : "contained"}
                            fullWidth
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/packages?type=B2E&productId=${product._id}`);
                              setSchoolsDemoModalOpen(false);
                            }}
                            sx={{
                              backgroundColor: isCenterCard ? '#FFFFFF !important' : '#0B7897 !important',
                              color: isCenterCard ? '#0B7897 !important' : 'white !important',
                              fontWeight: 600,
                              borderRadius: 2,
                              py: 1,
                              mt: 'auto',
                              border: isCenterCard ? '1px solid #FFFFFF' : 'none',
                              boxShadow: 'none !important',
                              '&:hover': {
                                backgroundColor: isCenterCard ? '#F5F5F5 !important' : '#063C5E !important',
                                color: isCenterCard ? '#063C5E !important' : 'white !important',
                                borderColor: isCenterCard ? '#FFFFFF' : 'transparent',
                                boxShadow: 'none !important',
                              },
                            }}
                          >
                            Get Early Access
                          </Button>
                        )}
                      </Box>
                    </Box>
                  </Grid>
                );
              });
            })()}
          </Grid>
        </Box>
      </Dialog>

      {/* Businesses Demo Modal - Commented out, redirecting to packages page instead */}
      {false && (
      <Dialog
        open={businessesDemoModalOpen}
        onClose={() => setBusinessesDemoModalOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            p: 3,
          },
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <IconButton
            onClick={() => setBusinessesDemoModalOpen(false)}
            sx={{
              position: 'absolute',
              top: -8,
              right: -8,
              color: '#063C5E',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 1)',
              },
              zIndex: 1,
            }}
          >
            <CloseIcon />
          </IconButton>
          
          <Typography variant="h4" sx={{ mb: 3, fontWeight: 700, color: '#063C5E', textAlign: 'center' }}>
            Get Early Access
          </Typography>
          
          <Grid container spacing={3}>
            {(() => {
              // Get first 3 products for businesses
              const businessesProducts = products.filter(p => {
                const targetAudiences = Array.isArray(p.targetAudience) ? p.targetAudience : (p.targetAudience ? [p.targetAudience] : []);
                return targetAudiences.includes('businesses');
              }).slice(0, 3);
              
              return businessesProducts.map((product, index) => {
                // Check if product is physical (Tactical Card Game Kit)
                const isPhysical = product.title?.toLowerCase().includes('tactical') || 
                                   product.title?.toLowerCase().includes('physical') ||
                                   product.name?.toLowerCase().includes('tactical') ||
                                   product.name?.toLowerCase().includes('physical');
                
                // Center card (index 1) should have blue background
                const isCenterCard = index === 1;
                
                return (
                  <Grid item xs={12} md={4} key={product._id || index}>
                    <Box sx={{ 
                      height: '100%', 
                      p: 0, 
                      backgroundColor: isCenterCard ? '#0B7897' : 'white', 
                      borderRadius: 3, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)', 
                      overflow: 'hidden' 
                    }}>
                      {/* Image Section */}
                      <Box
                        sx={{
                          position: 'relative',
                          width: '100%',
                          paddingTop: '66.67%',
                          backgroundColor: isCenterCard ? '#0B7897' : '#FFFFFF',
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {product.imageUrl && (
                          <Box
                            component="img"
                            src={product.imageUrl.startsWith('http') 
                              ? product.imageUrl 
                              : `${API_BASE_URL}${product.imageUrl.startsWith('/') ? product.imageUrl : `/${product.imageUrl}`}`}
                            alt={product.title || product.name}
                            sx={{
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                              width: 'auto',
                              height: 'auto',
                              maxWidth: isCenterCard ? '95%' : '85%',
                              maxHeight: isCenterCard ? '95%' : '85%',
                              objectFit: 'contain',
                            }}
                          />
                        )}
                      </Box>
                      
                      {/* Content Section */}
                      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                        <Typography variant="h6" sx={{ 
                          mb: 1, 
                          fontWeight: 700, 
                          color: isCenterCard ? 'white' : '#063C5E', 
                          fontSize: '1.1rem' 
                        }}>
                          {product.title || product.name || 'Product'}
                        </Typography>
                        
                        {/* Price Display */}
                        {product.price && (
                          <Typography variant="h5" sx={{ 
                            mb: 2, 
                            fontWeight: 700, 
                            color: isCenterCard ? '#FFD700' : '#0B7897', 
                            fontSize: '1.5rem' 
                          }}>
                           Early Bird: ${product.price}
                          </Typography>
                        )}
                        
                        {/* Buy Now Button for Physical / Get Early Access for Others */}
                        {isPhysical ? (
                          <Button
                            variant="contained"
                            fullWidth
                            disabled={processingPurchase}
                            onClick={async (e) => {
                              e.stopPropagation();
                              
                              if (processingPurchase) return;
                              setProcessingPurchase(true);

                              try {
                                if (!product?._id) {
                                  alert('Product not found. Please try again.');
                                  setProcessingPurchase(false);
                                  return;
                                }
                                
                                // Get auth token
                                const token = localStorage.getItem('token');
                                if (!token) {
                                  router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`);
                                  setProcessingPurchase(false);
                                  return;
                                }

                                // Determine product type for unique code generation
                                const productTitle = (product.title || product.name || '').toLowerCase();
                                const isDigitalProduct = productTitle.includes('digital') || productTitle.includes('extension');
                                const isBundleProduct = productTitle.includes('bundle') || productTitle.includes('full');
                                const isPhysicalProduct = productTitle.includes('physical') || productTitle.includes('tactical');
                                
                                let packageType = 'physical';
                                let maxSeats = 0;
                                
                                if (isDigitalProduct) {
                                  packageType = 'digital';
                                  maxSeats = 1;
                                } else if (isBundleProduct) {
                                  packageType = 'digital_physical';
                                  maxSeats = 1;
                                } else if (isPhysicalProduct) {
                                  packageType = 'physical';
                                  maxSeats = 0;
                                }

                                // Create Stripe checkout session for direct product purchase - B2B for businesses
                                const checkoutResponse = await axios.post(
                                  `${API_URL}/payments/create-checkout-session`,
                                  {
                                    productId: product._id,
                                    urlType: 'B2B', // B2B for businesses tab
                                    directProductPurchase: true,
                                    packageType: packageType, // Pass package type for unique code generation
                                    maxSeats: maxSeats, // Pass max seats
                                  },
                                  {
                                    headers: {
                                      Authorization: `Bearer ${token}`,
                                    },
                                  }
                                );
                                
                                // Redirect to Stripe Checkout
                                if (checkoutResponse.data.url) {
                                  window.location.href = checkoutResponse.data.url;
                                } else {
                                  throw new Error('No checkout URL received');
                                }
                              } catch (error) {
                                console.error('Error creating checkout session:', error);
                                alert(error.response?.data?.error || 'Failed to initiate purchase. Please try again.');
                                setProcessingPurchase(false);
                              }
                            }}
                            sx={{
                              backgroundColor: isCenterCard ? '#FFFFFF' : '#0B7897',
                              color: isCenterCard ? '#0B7897' : 'white',
                              fontWeight: 600,
                              borderRadius: 2,
                              py: 1,
                              mt: 'auto',
                              border: 'none',
                              '&:hover': {
                                backgroundColor: isCenterCard ? '#F5F5F5' : '#063C5E',
                                color: isCenterCard ? '#063C5E' : 'white',
                              },
                              '&:disabled': {
                                backgroundColor: '#ccc',
                                color: '#666',
                              },
                            }}
                          >
                            {processingPurchase ? 'Redirecting to Stripe...' : 'Buy Now'}
                          </Button>
                        ) : (
                          <Button
                            variant={isCenterCard ? "outlined" : "contained"}
                            fullWidth
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/packages?type=B2B&productId=${product._id}`); // B2B for businesses
                              setBusinessesDemoModalOpen(false);
                            }}
                            sx={{
                              backgroundColor: isCenterCard ? '#FFFFFF !important' : '#0B7897 !important',
                              color: isCenterCard ? '#0B7897 !important' : 'white !important',
                              fontWeight: 600,
                              borderRadius: 2,
                              py: 1,
                              mt: 'auto',
                              border: isCenterCard ? '1px solid #FFFFFF' : 'none',
                              boxShadow: 'none !important',
                              '&:hover': {
                                backgroundColor: isCenterCard ? '#F5F5F5 !important' : '#063C5E !important',
                                color: isCenterCard ? '#063C5E !important' : 'white !important',
                                borderColor: isCenterCard ? '#FFFFFF' : 'transparent',
                                boxShadow: 'none !important',
                              },
                            }}
                          >
                            Get Early Access
                          </Button>
                        )}
                      </Box>
                    </Box>
                  </Grid>
                );
              });
            })()}
          </Grid>
        </Box>
      </Dialog>
      )}

      {/* Custom Package Request Dialog */}
      <Dialog 
        open={customPackageRequestDialogOpen} 
        onClose={() => {
          setCustomPackageRequestDialogOpen(false);
          setRequestForm({
            entityType: '',
            organizationName: '',
            contactName: '',
            contactEmail: '',
            contactPhone: '',
            additionalNotes: '',
            seatLimit: '',
            customPricing: ''
          });
        }} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          Request Custom Package
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <FormControl fullWidth required>
              <InputLabel>Entity Type</InputLabel>
              <Select
                value={requestForm.entityType}
                label="Entity Type"
                onChange={(e) => setRequestForm({ ...requestForm, entityType: e.target.value })}
              >
                <MenuItem value="">Select Type</MenuItem>
                <MenuItem value="organization">Organization</MenuItem>
                <MenuItem value="institute">Institute</MenuItem>
              </Select>
            </FormControl>
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
          <Button 
            onClick={() => {
              setCustomPackageRequestDialogOpen(false);
              setRequestForm({
                entityType: '',
                organizationName: '',
                contactName: '',
                contactEmail: '',
                contactPhone: '',
                additionalNotes: '',
                seatLimit: '',
                customPricing: ''
              });
            }} 
            disabled={submittingRequest}
          >
            Cancel
          </Button>
          <Button 
            onClick={async () => {
              if (!requestForm.entityType || !requestForm.organizationName || !requestForm.contactName || !requestForm.contactEmail) {
                setRequestSnackbar({
                  open: true,
                  message: 'Please fill in all required fields',
                  severity: 'error'
                });
                return;
              }

              try {
                setSubmittingRequest(true);
                
                let authHeaders = { ...NO_CACHE_HEADERS };
                let token = null;
                try {
                  if (typeof window !== 'undefined') {
                    token = localStorage.getItem('token') || sessionStorage.getItem('token');
                  }
                  if (token) {
                    authHeaders.Authorization = `Bearer ${token}`;
                  }
                } catch (e) {
                  console.log('No auth token available');
                }
                
                const requestedModifications = {
                  cardsToAdd: [],
                  cardsToRemove: []
                };
                
                if (requestForm.seatLimit && requestForm.seatLimit.toString().trim() !== '') {
                  const seatLimitNum = parseInt(requestForm.seatLimit.toString().trim(), 10);
                  if (!isNaN(seatLimitNum)) {
                    requestedModifications.seatLimit = seatLimitNum;
                  }
                }
                
                requestedModifications.additionalNotes = requestForm.additionalNotes 
                  ? String(requestForm.additionalNotes).trim() 
                  : '';
                
                requestedModifications.customPricing = {
                  notes: requestForm.customPricing 
                    ? String(requestForm.customPricing).trim() 
                    : '',
                  currency: 'USD'
                };
                
                const requestData = {
                  entityType: requestForm.entityType || undefined,
                  organizationName: requestForm.organizationName,
                  contactName: requestForm.contactName,
                  contactEmail: requestForm.contactEmail,
                  contactPhone: requestForm.contactPhone || '',
                  requestedModifications: requestedModifications
                };

                await axios.post(`${API_URL}/custom-package-requests`, requestData, {
                  headers: authHeaders,
                });

                setRequestSnackbar({
                  open: true,
                  message: 'Custom package request submitted successfully! We will contact you soon.',
                  severity: 'success'
                });
                setCustomPackageRequestDialogOpen(false);
                setRequestForm({
                  entityType: '',
                  organizationName: '',
                  contactName: '',
                  contactEmail: '',
                  contactPhone: '',
                  additionalNotes: '',
                  seatLimit: '',
                  customPricing: ''
                });
              } catch (err) {
                console.error('Error submitting request:', err);
                setRequestSnackbar({
                  open: true,
                  message: err.response?.data?.error || 'Failed to submit request. Please try again.',
                  severity: 'error'
                });
              } finally {
                setSubmittingRequest(false);
              }
            }}
            variant="contained"
            disabled={submittingRequest}
            sx={{ backgroundColor: '#0B7897', '&:hover': { backgroundColor: '#063C5E' } }}
          >
            {submittingRequest ? 'Submitting...' : 'Submit Request'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Request Snackbar */}
      {requestSnackbar.open && (
        <Alert
          severity={requestSnackbar.severity}
          onClose={() => setRequestSnackbar({ ...requestSnackbar, open: false })}
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 9999,
          }}
        >
          {requestSnackbar.message}
        </Alert>
      )}
    </>
  );
}
