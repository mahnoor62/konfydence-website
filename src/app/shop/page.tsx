'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Container, Typography, Grid, Box } from '@mui/material';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import api from '@/lib/api';
import { PaginatedProductsResponse, Product } from '@/lib/types';
import PaginationControls from '@/components/PaginationControls';

const PRODUCTS_PER_PAGE = 10;

export default function ShopPage() {
  const searchParams = useSearchParams();
  const pageParam = searchParams.get('page');
  const currentPage = Math.max(parseInt(pageParam || '1', 10) || 1, 1);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1, page: 1 });

  useEffect(() => {
    let isMounted = true;

    async function fetchProducts() {
      setLoading(true);
      try {
        const res = await api.get<PaginatedProductsResponse>('/products', {
          params: { page: currentPage, limit: PRODUCTS_PER_PAGE },
        });
        if (!isMounted) return;
        setProducts(res.data.products);
        setMeta({
          total: res.data.total,
          totalPages: res.data.totalPages,
          page: res.data.page,
        });
      } catch (error) {
        if (!isMounted) return;
        console.error('Error fetching products:', error);
        setProducts([]);
        setMeta({ total: 0, totalPages: 1, page: 1 });
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, [currentPage]);

  if (loading) {
    return (
      <>
        <Header />
        <Box component="main" sx={{ pt: { xs: 8, md: 10 }, minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography>Loading...</Typography>
        </Box>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <Box component="main" sx={{ pt: { xs: 8, md: 10 }, minHeight: '80vh', backgroundColor: '#E9F4FF' }}>
        <Container maxWidth="lg" sx={{ py: 12 }}>
          <Box data-aos="fade-up" data-aos-duration="800">
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
            <Typography variant="body1" textAlign="center" color="text.secondary" sx={{ mb: 8 }}>
              Browse our selection of scam prevention products
            </Typography>
          </Box>

          {products.length === 0 ? (
            <Box textAlign="center" py={6}>
              <Typography variant="h6" color="text.secondary">
                No products available in the shop right now. Please check back soon.
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
                Showing {meta.total === 0 ? 0 : (meta.page - 1) * PRODUCTS_PER_PAGE + 1}–
                {meta.total === 0
                  ? 0
                  : (meta.page - 1) * PRODUCTS_PER_PAGE + products.length}{' '}
                of {meta.total} products
              </Typography>
              <Grid container spacing={4} sx={{ alignItems: 'stretch' }}>
                {products.map((product, index) => (
                  <Grid item xs={12} sm={6} md={4} key={product._id}>
                    <ProductCard product={product} delay={index * 100} />
                  </Grid>
                ))}
              </Grid>
              {meta.totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                  <PaginationControls page={meta.page} totalPages={meta.totalPages} basePath="/shop" />
                </Box>
              )}
            </>
          )}
        </Container>
      </Box>
      <Footer />
    </>
  );
}

