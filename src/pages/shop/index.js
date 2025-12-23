'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Container, Typography, Grid, Box, Chip } from '@mui/material';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import ErrorDisplay from '@/components/ErrorDisplay';
import LoadingState from '@/components/LoadingState';
import axios from 'axios';
import PaginationControls from '@/components/PaginationControls';

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

console.log('🔗 Shop Page API URL:', API_URL);

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

export default function ShopPage() {
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

  const fetchProducts = useCallback(async (page, type, category) => {
    try {
      setLoading(true);
      setError(null);
      // const params = {
      //   page: page.toString(),
      //   limit: PRODUCTS_PER_PAGE.toString(),
      // };
      const ts = Date.now();
const params = {
  page: page.toString(),
  limit: PRODUCTS_PER_PAGE.toString(),
  _t: ts, // 🔥 cache breaker
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
      
      // const res = await axios.get(url, { params });
      setProducts(res.data.products);
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
    router.push(`/shop?${params.toString()}`);
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
    router.push(`/shop?${params.toString()}`);
  };

  const showingFrom = meta.total === 0 ? 0 : (meta.page - 1) * PRODUCTS_PER_PAGE + 1;
  const showingTo = meta.total === 0 ? 0 : showingFrom + products.length - 1;

  return (
    <>
      <Header />
      <Box component="main" sx={{ pt: { xs: 8, md: 10 }, minHeight: '80vh', backgroundColor: '#E9F4FF' }}>
        <Container
          maxWidth="lg"
          sx={{ py: 12 }}
          data-aos="zoom-in"
          data-aos-duration="800"
        >
          {/* Page Title and Intro Text */}
          <Box sx={{ mb: 6 }}>
            <Typography
              variant="h1"
              component="h1"
              textAlign="center"
              sx={{
                mb: 2,
                fontSize: { xs: '2rem', md: '3rem' },
                fontWeight: 700,
                color: '#063C5E',
              }}
            >
              Shop
            </Typography>
            <Typography 
              variant="body1" 
              textAlign="center" 
              color="text.secondary" 
              sx={{ 
                mb: 4,
                fontSize: { xs: '1rem', md: '1.1rem' },
              }}
            >
              Browse our selection of scam prevention products
            </Typography>
          </Box>

          {/* Product Category Filter */}
          <Box sx={{ mb: 3 }}>
            {/* <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 600, color: '#063C5E', textAlign: 'center' }}>
              Product Categorys
            </Typography> */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'center' }}>
              <Chip
                label="All"
                onClick={() => handleCategoryChange('all')}
                sx={{
                  backgroundColor: selectedCategory === 'all' ? '#0B7897' : 'white',
                  color: selectedCategory === 'all' ? 'white' : '#052A42',
                  fontWeight: selectedCategory === 'all' ? 600 : 400,
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: selectedCategory === 'all' ? '#063C5E' : '#E8F4F8',
                  },
                  transition: 'all 0.3s ease',
                }}
              />
              {PRODUCT_CATEGORIES.map((category) => {
                const categoryValue = category.toLowerCase().replace(/\s+/g, '-');
                return (
                  <Chip
                    key={category}
                    label={category}
                    onClick={() => handleCategoryChange(categoryValue)}
                    sx={{
                      backgroundColor: selectedCategory === categoryValue 
                        ? CATEGORY_COLORS[category] || '#0B7897' 
                        : 'white',
                      color: selectedCategory === categoryValue ? 'white' : '#052A42',
                      fontWeight: selectedCategory === categoryValue ? 600 : 400,
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: selectedCategory === categoryValue
                          ? CATEGORY_COLORS[category] || '#063C5E'
                          : '#E8F4F8',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  />
                );
              })}
            </Box>
          </Box>

          {/* Use Case / Type Filter */}
          <Box sx={{ mb: 4 }}>
            {/* <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 600, color: '#063C5E', textAlign: 'center' }}>
            Product Type
            </Typography> */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'center' }}>
              <Chip
                label="All"
                onClick={() => handleTypeChange('all')}
                sx={{
                  backgroundColor: selectedType === 'all' ? '#0B7897' : 'white',
                  color: selectedType === 'all' ? 'white' : '#052A42',
                  fontWeight: selectedType === 'all' ? 600 : 400,
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: selectedType === 'all' ? '#063C5E' : '#E8F4F8',
                  },
                  transition: 'all 0.3s ease',
                }}
              />
              {USE_CASE_TYPES.map((type) => (
                <Chip
                  key={type}
                  label={type}
                  onClick={() => handleTypeChange(type.toLowerCase())}
                  sx={{
                    backgroundColor: selectedType === type.toLowerCase() 
                      ? TYPE_COLORS[type] || '#0B7897' 
                      : 'white',
                    color: selectedType === type.toLowerCase() ? 'white' : '#052A42',
                    fontWeight: selectedType === type.toLowerCase() ? 600 : 400,
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: selectedType === type.toLowerCase()
                        ? TYPE_COLORS[type] || '#063C5E'
                        : '#E8F4F8',
                    },
                    transition: 'all 0.3s ease',
                  }}
                />
              ))}
            </Box>
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
              {/* Split products into B2C and B2B/B2E */}
              {(() => {
                // B2C products: For families - prioritize targetAudience
                const b2cProducts = products.filter(p => {
                  // Primary: Check targetAudience first
                  if (p.targetAudience === 'private-users') return true;
                  if (p.targetAudience === 'schools' || p.targetAudience === 'businesses') return false;
                  
                  // Fallback: If no targetAudience, check category
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
                
                // B2B products: For organizations - prioritize targetAudience
                const b2bProducts = products.filter(p => {
                  // Primary: Check targetAudience first
                  if (p.targetAudience === 'businesses') return true;
                  if (p.targetAudience === 'private-users' || p.targetAudience === 'schools') return false;
                  
                  // Fallback: If no targetAudience, check category
                  if (!p.targetAudience) {
                    return p.category === 'businesses';
                  }
                  return false;
                });
                
                // B2E products: For schools - prioritize targetAudience
                const b2eProducts = products.filter(p => {
                  // Primary: Check targetAudience first
                  if (p.targetAudience === 'schools') return true;
                  if (p.targetAudience === 'private-users' || p.targetAudience === 'businesses') return false;
                  
                  // Fallback: If no targetAudience, check category
                  if (!p.targetAudience) {
                    return p.category === 'schools';
                  }
                  return false;
                });
                
                // Remove duplicates - ensure each product appears only once
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
                
                return (
                  <>
                    {/* B2C Products Section */}
                    {uniqueB2C.length > 0 && (
                      <Box sx={{ mb: uniqueB2B.length > 0 ? 8 : 4 }}>
                        <Typography 
                          variant="h3" 
                          sx={{ 
                            mb: 2,
                            fontSize: { xs: '1.75rem', md: '2.5rem' },
                            fontWeight: 700,
                            color: '#063C5E',
                            textAlign: 'center',
                          }}
                        >
                         For Families
                        </Typography>
                        {/* <Typography 
                          variant="body1" 
                          sx={{ 
                            mb: 4,
                            textAlign: 'center',
                            color: 'text.secondary',
                          }}
                        >
                          For Families
                        </Typography> */}
                        <Grid
                          data-aos="zoom-in"
                          data-aos-duration="800"
                          data-aos-delay="100"
                          container
                          spacing={4}
                          sx={{ alignItems: 'stretch', mb: 4 }}
                        >
                          {uniqueB2C.map((product, index) => (
                            <Grid item xs={12} sm={6} md={4} key={product._id}>
                              <ProductCard product={product} delay={index * 100} />
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    )}

                    {/* B2B and B2E Products Section - Combined heading when both exist */}
                    {(uniqueB2B.length > 0 || uniqueB2E.length > 0) && (
                      <Box sx={{ mb: 4 }}>
                        <Typography 
                          variant="h3" 
                          sx={{ 
                            mb: 2,
                            fontSize: { xs: '1.75rem', md: '2.5rem' },
                            fontWeight: 700,
                            color: '#063C5E',
                            textAlign: 'center',
                          }}
                        >
                          {uniqueB2B.length > 0 && uniqueB2E.length > 0
                            ? 'For Organizations and Schools'
                            : uniqueB2B.length > 0
                            ? 'For Organizations (B2B)'
                            : 'For Schools (B2E)'}
                        </Typography>
                        <Grid
                          data-aos="zoom-in"
                          data-aos-duration="800"
                          data-aos-delay="100"
                          container
                          spacing={4}
                          sx={{ alignItems: 'stretch', mb: 4 }}
                        >
                          {/* B2B Products */}
                          {uniqueB2B.map((product, index) => (
                            <Grid item xs={12} sm={6} md={4} key={product._id}>
                              <ProductCard product={product} delay={index * 100} />
                            </Grid>
                          ))}
                          {/* B2E Products */}
                          {uniqueB2E.map((product, index) => (
                            <Grid item xs={12} sm={6} md={4} key={product._id}>
                              <ProductCard product={product} delay={(uniqueB2B.length + index) * 100} />
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    )}

                    {/* Show count if any sections exist */}
                    {(uniqueB2C.length > 0 || uniqueB2B.length > 0 || uniqueB2E.length > 0) && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        textAlign="center"
                        sx={{ mb: 3 }}
                      >
                        Showing {showingFrom}&ndash;{showingTo} of {meta.total} products
                        {(selectedType !== 'all' || selectedCategory !== 'all') && (
                          <>
                            {' '}
                            {selectedType !== 'all' && `(${selectedType})`}
                            {selectedCategory !== 'all' && ` - ${selectedCategory}`}
                          </>
                        )}
                      </Typography>
                    )}
                  </>
                );
              })()}
            </>
          )}

          {/* Pagination - Always shown after product grid */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <PaginationControls
              page={meta.page}
              totalPages={meta.totalPages}
              basePath={`/shop${selectedType !== 'all' || selectedCategory !== 'all' ? `?${new URLSearchParams({
                ...(selectedType !== 'all' && { type: selectedType }),
                ...(selectedCategory !== 'all' && { category: selectedCategory }),
              }).toString()}` : ''}`}
            />
          </Box>
        </Container>
      </Box>
      <Footer />
    </>
  );
}

