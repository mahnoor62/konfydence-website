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
  const [availableTypes, setAvailableTypes] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
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

  // const fetchAvailableFilters = useCallback(async () => {
  //   try {
  //     const url = `${API_URL}/products`;
  //     const params = { all: true };
  //     console.log('📡 API: GET', url, params);
  //     const res = await axios.get(url, { params });
  //     const types = Array.from(new Set(res.data.map((p) => p.type).filter(Boolean))).sort();
  //     const categories = Array.from(new Set(res.data.map((p) => p.category).filter(Boolean))).sort();
  //     setAvailableTypes(types);
  //     setAvailableCategories(categories);
  //   } catch (err) {
  //     console.error('❌ Error fetching filters:', {
  //       url: `${API_URL}/products?all=true`,
  //       error: err.response?.data || err.message,
  //       status: err.response?.status,
  //     });
  //   }
  // }, []);

  const fetchAvailableFilters = useCallback(async () => {
    try {
      const productsUrl = `${API_URL}/products`;
      const ts = Date.now();

      const productsRes = await axios.get(productsUrl, {
        headers: NO_CACHE_HEADERS,
        params: { all: true, _t: ts },
      });

      const allProducts = Array.isArray(productsRes.data)
        ? productsRes.data
        : productsRes.data.products || [];

      const categories = Array.from(
        new Set(allProducts.map((p) => p.category).filter(Boolean))
      ).sort();

      let typesData = [];

      try {
        const typesRes = await axios.get(`${API_URL}/productTypes`, {
          headers: NO_CACHE_HEADERS,
          params: { active: 'true', _t: ts },
        });

        typesData = Array.isArray(typesRes.data)
          ? typesRes.data
          : typesRes.data?.types || [];
      } catch (typeErr) {
        if (typeErr.response?.status !== 404) {
          console.error('❌ Error fetching product types:', {
            url: `${API_URL}/productTypes`,
            error: typeErr.response?.data || typeErr.message,
            status: typeErr.response?.status,
          });
        }

        if (!typesData.length) {
          typesData = Array.from(
            new Map(
              allProducts
                .map((product) => product.type)
                .filter(Boolean)
                .map((type) => [
                  type,
                  {
                    slug: type,
                    name: type
                      .split('-')
                      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(' '),
                  },
                ])
            ).values()
          );
        }
      }

      setAvailableTypes(typesData);
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
                  key={type.slug}
                  label={type.name}
                  onClick={() => handleTypeChange(type.slug)}
                  sx={{
                    backgroundColor: selectedType === type.slug ? TYPE_COLORS[type.slug] || '#0B7897' : 'white',
                    color: selectedType === type.slug ? 'white' : '#052A42',
                    fontWeight: selectedType === type.slug ? 600 : 400,
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: selectedType === type.slug
                        ? TYPE_COLORS[type.slug] || '#063C5E'
                        : '#E8F4F8',
                    },
                    transition: 'all 0.3s ease',
                  }}
                />
              ))}
            </Box>
          )}

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
            <LoadingState message="Loading products..." />
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

