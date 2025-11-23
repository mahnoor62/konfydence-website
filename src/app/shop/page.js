'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Container, Typography, Grid, Box, Chip } from '@mui/material';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import ErrorDisplay from '@/components/ErrorDisplay';
import axios from 'axios';
import PaginationControls from '@/components/PaginationControls';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_URL environment variable is missing!');
}
const API_URL = `${API_BASE_URL}/api`;
console.log('🔗 Shop Page API URL:', API_URL);

const PRODUCTS_PER_PAGE = 10;

const TYPE_COLORS = {
  starter: '#FF725E',
  bundle: '#0B7897',
  membership: '#063C5E',
};

const CATEGORY_LABELS = {
  'private-users': 'Private Users',
  schools: 'Schools',
  businesses: 'Businesses',
};

const CATEGORY_COLORS = {
  'private-users': '#FF9B8A',
  schools: '#0B7897',
  businesses: '#052A42',
};

function ShopPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageParam = searchParams.get('page');
  const typeParam = searchParams.get('type') || 'all';
  const categoryParam = searchParams.get('category') || 'all';

  const currentPage = Math.max(parseInt(pageParam || '1', 10) || 1, 1);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1, page: 1 });
  const [selectedType, setSelectedType] = useState(typeParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [availableTypes, setAvailableTypes] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async (page, type, category) => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page: page.toString(),
        limit: PRODUCTS_PER_PAGE.toString(),
      };

      if (type && type !== 'all') {
        params.type = type;
      }

      if (category && category !== 'all') {
        params.category = category;
      }

      const url = `${API_URL}/products`;
      console.log('📡 API: GET', url, params);
      const res = await axios.get(url, { params });
      setProducts(res.data.products);
      setMeta({
        total: res.data.total || 0,
        totalPages: res.data.totalPages || 1,
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

  const fetchAvailableFilters = useCallback(async () => {
    try {
      const url = `${API_URL}/products`;
      const params = { all: true };
      console.log('📡 API: GET', url, params);
      const res = await axios.get(url, { params });
      const types = Array.from(new Set(res.data.map((p) => p.type).filter(Boolean))).sort();
      const categories = Array.from(new Set(res.data.map((p) => p.category).filter(Boolean))).sort();
      setAvailableTypes(types);
      setAvailableCategories(categories);
    } catch (err) {
      console.error('❌ Error fetching filters:', {
        url: `${API_URL}/products?all=true`,
        error: err.response?.data || err.message,
        status: err.response?.status,
      });
    }
  }, []);

  useEffect(() => {
    fetchAvailableFilters();
  }, [fetchAvailableFilters]);

  useEffect(() => {
    const typeFromUrl = searchParams.get('type') || 'all';
    const categoryFromUrl = searchParams.get('category') || 'all';
    setSelectedType(typeFromUrl);
    setSelectedCategory(categoryFromUrl);
  }, [searchParams]);

  useEffect(() => {
    fetchProducts(currentPage, selectedType, selectedCategory);
  }, [currentPage, selectedType, selectedCategory, fetchProducts]);

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
          <Box>
            <Typography
              variant="h2"
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
            <Typography variant="body1" textAlign="center" color="text.secondary" sx={{ mb: 4 }}>
              Browse our selection of scam prevention products
            </Typography>
          </Box>

          {/* Type Filter */}
          {availableTypes.length > 0 && (
            <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'center' }}>
              <Typography variant="body2" sx={{ width: '100%', textAlign: 'center', mb: 1, fontWeight: 600, color: '#063C5E' }}>
                Filter by Type:
              </Typography>
              <Chip
                label="All Types"
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
              {availableTypes.map((type) => (
                <Chip
                  key={type}
                  label={type.charAt(0).toUpperCase() + type.slice(1)}
                  onClick={() => handleTypeChange(type)}
                  sx={{
                    backgroundColor: selectedType === type ? TYPE_COLORS[type] || '#0B7897' : 'white',
                    color: selectedType === type ? 'white' : '#052A42',
                    fontWeight: selectedType === type ? 600 : 400,
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: selectedType === type
                        ? TYPE_COLORS[type] || '#063C5E'
                        : '#E8F4F8',
                    },
                    transition: 'all 0.3s ease',
                  }}
                />
              ))}
            </Box>
          )}

          {/* Category Filter */}
          {availableCategories.length > 0 && (
            <Box sx={{ mb: 4, display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'center' }}>
              <Typography variant="body2" sx={{ width: '100%', textAlign: 'center', mb: 1, fontWeight: 600, color: '#063C5E' }}>
                Filter by Category:
              </Typography>
              <Chip
                label="All Categories"
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
              {availableCategories.map((category) => (
                <Chip
                  key={category}
                  label={CATEGORY_LABELS[category] || category.charAt(0).toUpperCase() + category.slice(1)}
                  onClick={() => handleCategoryChange(category)}
                  sx={{
                    backgroundColor: selectedCategory === category ? CATEGORY_COLORS[category] || '#0B7897' : 'white',
                    color: selectedCategory === category ? 'white' : '#052A42',
                    fontWeight: selectedCategory === category ? 600 : 400,
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: selectedCategory === category
                        ? CATEGORY_COLORS[category] || '#063C5E'
                        : '#E8F4F8',
                    },
                    transition: 'all 0.3s ease',
                  }}
                />
              ))}
            </Box>
          )}

          {error ? (
            <ErrorDisplay error={error} title="Failed to Load Products" />
          ) : loading ? (
            <Box textAlign="center" py={6}>
              <Typography variant="h6" color="text.secondary">
                Loading products...
              </Typography>
            </Box>
          ) : products.length === 0 ? (
            <Box textAlign="center" py={6}>
              <Typography variant="h6" color="text.secondary">
                {selectedType !== 'all' || selectedCategory !== 'all'
                  ? 'No products found matching your filters. Try adjusting your selection.'
                  : 'No products available in the shop right now. Please check back soon.'}
              </Typography>
            </Box>
          ) : (
            <>
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
                    {selectedCategory !== 'all' && ` - ${CATEGORY_LABELS[selectedCategory] || selectedCategory}`}
                  </>
                )}
              </Typography>
              <Grid
                data-aos="zoom-in"
                data-aos-duration="800"
                data-aos-delay="100"
                container
                spacing={4}
                sx={{ alignItems: 'stretch', mb: 4 }}
              >
                {products.map((product, index) => (
                  <Grid item xs={12} sm={6} md={4} key={product._id}>
                    <ProductCard product={product} delay={index * 100} />
                  </Grid>
                ))}
              </Grid>
            </>
          )}

          {meta.totalPages > 1 && (
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
          )}
        </Container>
      </Box>
      <Footer />
    </>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<Box sx={{ py: 12, textAlign: 'center' }}>Loading shop...</Box>}>
      <ShopPageContent />
    </Suspense>
  );
}

