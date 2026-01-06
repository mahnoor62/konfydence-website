'use client';

import { Container, Typography, Grid, Box, Chip, Button, Link, Stack, Tabs, Tab } from '@mui/material';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import NextLink from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import PaginationControls from '@/components/PaginationControls';
import ErrorDisplay from '@/components/ErrorDisplay';
import LoadingState from '@/components/LoadingState';
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

  const fetchProducts = useCallback(async (page, type, category) => {
    try {
      setLoading(true);
      setError(null);
      const ts = Date.now();
      const params = {
        page: page.toString(),
        limit: PRODUCTS_PER_PAGE.toString(),
        _t: ts, // cache breaker
      };

      if (type && type !== 'all') {
        params.type = type;
      }

      if (category && category !== 'all') {
        params.category = category;
      }

      const url = `${API_URL}/products`;
      console.log('📡 API: GET', url, params);
      const res = await axios.get(url, {
        headers: NO_CACHE_HEADERS,
        params,
      });
      
      setProducts(res.data.products || []);
      setMeta({
        total: res.data.total || 0,
        totalPages: res.data.totalPages || res.data.pages || 1,
        page: res.data.page || 1,
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
      fetchProducts(currentPage, selectedType, selectedCategory);
    }
  }, [currentPage, selectedType, selectedCategory, fetchProducts, router.isReady]);

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
                // B2C products: For families - prioritize targetAudience
                const b2cProducts = products.filter(p => {
                  if (p.targetAudience === 'private-users') return true;
                  if (p.targetAudience === 'schools' || p.targetAudience === 'businesses') return false;
                  if (!p.targetAudience) {
                    return p.category === 'private-users' ||
                           p.category === 'membership' ||
                           p.category === 'template' ||
                           p.category === 'guide' ||
                           p.category === 'toolkit' ||
                           p.category === 'digital-guide' ||
                           (p.name?.toLowerCase().includes('scam survival kit'));
                  }
                  return false;
                });
                
                // B2E products: For schools - prioritize targetAudience
                const b2eProducts = products.filter(p => {
                  if (p.targetAudience === 'schools') return true;
                  if (p.targetAudience === 'private-users' || p.targetAudience === 'businesses') return false;
                  if (!p.targetAudience) {
                    return p.category === 'schools';
                  }
                  return false;
                });
                
                // B2B products: For organizations - prioritize targetAudience
                const b2bProducts = products.filter(p => {
                  if (p.targetAudience === 'businesses') return true;
                  if (p.targetAudience === 'private-users' || p.targetAudience === 'schools') return false;
                  if (!p.targetAudience) {
                    return p.category === 'businesses';
                  }
                  return false;
                });
                
                // Remove duplicates
                const uniqueB2C = b2cProducts.filter(p => 
                  !b2bProducts.some(bp => bp._id === p._id) &&
                  !b2eProducts.some(ep => ep._id === p._id)
                );
                const uniqueB2B = b2bProducts.filter(p => 
                  !b2cProducts.some(cp => cp._id === p._id) &&
                  !b2eProducts.some(ep => ep._id === p._id)
                );
                const uniqueB2E = b2eProducts.filter(p => 
                  !b2cProducts.some(cp => cp._id === p._id) &&
                  !b2bProducts.some(bp => bp._id === p._id)
                );
                
                // Filter based on active tab
                let displayedProducts = [];
                let sectionContent = null;
                
                if (activeTab === 0) {
                  // For Families
                  displayedProducts = uniqueB2C;
                  sectionContent = {
                    headline: 'Build Lifelong Confidence at Home',
                    subheadline: 'Offline-first card game + optional digital challenges for ongoing practice. Perfect for dinner tables, car rides, or family discussions—no nagging required.',
                  };
                } else if (activeTab === 1) {
                  // For Schools & Universities
                  displayedProducts = uniqueB2E;
                  sectionContent = {
                    headline: 'Turn Students into Digital Leaders',
                    subheadline: 'Engaging activities that fit classrooms, clubs, or orientation weeks. Easy for teachers, proven to build pause habits early.',
                  };
                } else if (activeTab === 2) {
                  // For Businesses & Organizations
                  displayedProducts = uniqueB2B;
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
                          {/* Tactical Card Game Kit */}
                          <Grid item xs={12} md={4}>
                            <Box sx={{ height: '100%', p: 3, backgroundColor: 'white', borderRadius: 2, display: 'flex', flexDirection: 'column' }}>
                              <Typography variant="h4" sx={{ mb: 2, fontSize: { xs: '1.25rem', md: '1.5rem' }, fontWeight: 600, color: '#063C5E' }}>
                                Tactical Card Game Kit
                              </Typography>
                              <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary', lineHeight: 1.7, flexGrow: 1 }}>
                                80 premium cards with real-life scenarios. Spot H.A.C.K. tricks (Hurry, Authority, Comfort, Kill-Switch) and practice the 5-second pause. Includes no-blame Family Tech Contract.
                              </Typography>
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#063C5E', mb: 0.5 }}>
                                  Pricing Structure
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#063C5E', mb: 0.5 }}>
                                  Early bird: $49
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#063C5E' }}>
                                  Later: $59
                                </Typography>
                              </Box>
                              <Button
                                variant="contained"
                                href="/sskit-family"
                                component={NextLink}
                                sx={{
                                  backgroundColor: '#0B7897',
                                  color: 'white',
                                  '&:hover': {
                                    backgroundColor: '#063C5E',
                                  },
                                }}
                              >
                                Buy Physical Kit Now →
                              </Button>
                            </Box>
                          </Grid>

                          {/* Digital Extension */}
                          <Grid item xs={12} md={4}>
                            <Box sx={{ height: '100%', p: 3, backgroundColor: 'white', borderRadius: 2, display: 'flex', flexDirection: 'column' }}>
                              <Typography variant="h4" sx={{ mb: 2, fontSize: { xs: '1.25rem', md: '1.5rem' }, fontWeight: 600, color: '#063C5E' }}>
                                Digital Extension (App Access)
                              </Typography>
                              <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary', lineHeight: 1.7, flexGrow: 1 }}>
                                Monthly new scenarios, progress tracking, and solo/family challenges on your phone.
                              </Typography>
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#063C5E', mb: 0.5 }}>
                                  Pricing Structure
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#063C5E', mb: 0.5 }}>
                                  Early bird: $29/year
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#063C5E' }}>
                                  Later: $39/year
                                </Typography>
                              </Box>
                              <Button
                                variant="contained"
                                href="/sskit-family"
                                component={NextLink}
                                sx={{
                                  backgroundColor: '#0B7897',
                                  color: 'white',
                                  '&:hover': {
                                    backgroundColor: '#063C5E',
                                  },
                                }}
                              >
                                Subscribe to Digital →
                              </Button>
                            </Box>
                          </Grid>

                          {/* Best Value Bundle */}
                          <Grid item xs={12} md={4}>
                            <Box sx={{ height: '100%', p: 3, backgroundColor: 'white', borderRadius: 2, border: '2px solid #0B7897', display: 'flex', flexDirection: 'column' }}>
                              <Typography variant="h4" sx={{ mb: 2, fontSize: { xs: '1.25rem', md: '1.5rem' }, fontWeight: 600, color: '#063C5E' }}>
                                Best Value Bundle
                              </Typography>
                              <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary', lineHeight: 1.7, flexGrow: 1 }}>
                                Physical Kit + 1-Year Digital Access.
                              </Typography>
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#063C5E', mb: 0.5 }}>
                                  Pricing Structure
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#063C5E', mb: 0.5 }}>
                                  Early bird: $69
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#063C5E' }}>
                                  Later: $89
                                </Typography>
                              </Box>
                              <Button
                                variant="contained"
                                href="/sskit-family"
                                component={NextLink}
                                sx={{
                                  backgroundColor: '#0B7897',
                                  color: 'white',
                                  '&:hover': {
                                    backgroundColor: '#063C5E',
                                  },
                                }}
                              >
                                Get Bundle Now →
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
                            Konfydence for Kids: €1 per sale donated to initiatives that strengthen digital resilience for children and young people.
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
                                Download Free Pack →
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
                                Request Free Demo / Resources →
                              </Button>
                            </Box>
                          </Grid>
                        </Grid>
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
                              Request A Free Demo  →
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
                                Request A Custom Simulation →
                              </Button>
                            </Box>
                          </Grid>
                        </Grid>
                      </Box>
                    )}

                    {/* Products Grid with Pagination */}
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
                Scammers need rush. You need pause. Start building it today—with tools designed for real life.
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
                  <Box
                    sx={{
                      height: { xs: 'auto', md: '500px' },
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      borderRadius: 2,
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
                        borderRadius: 2,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      height: { xs: 'auto', md: '500px' },
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      borderRadius: 2,
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
                        borderRadius: 2,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }}
                    />
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
    </>
  );
}
