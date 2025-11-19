import { Container, Typography, Grid, Box } from '@mui/material';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import PaginationControls from '@/components/PaginationControls';
import api from '@/lib/api';
import { PaginatedProductsResponse } from '@/lib/types';

async function getProducts(page: number, limit: number) {
  try {
    const res = await api.get<PaginatedProductsResponse>('/products', {
      params: { page, limit },
    });
    return res.data;
  } catch (error) {
    return {
      products: [],
      total: 0,
      page,
      totalPages: 1,
      limit,
    };
  }
}

interface ProductsPageProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const rawPage = searchParams?.page;
  const pageParam = Array.isArray(rawPage) ? rawPage[0] : rawPage;
  const currentPage = Math.max(parseInt(pageParam || '1', 10) || 1, 1);
  const limit = 10;
  const data = await getProducts(currentPage, limit);

  const showingFrom = data.total === 0 ? 0 : (data.page - 1) * data.limit + 1;
  const showingTo = data.total === 0 ? 0 : showingFrom + data.products.length - 1;

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
          <Box  >
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
              Our Products
            </Typography>
            <Typography variant="body1" textAlign="center" color="text.secondary" sx={{ mb: 8 }}>
              Choose the perfect solution for your needs
            </Typography>
          </Box>

          {data.products.length === 0 ? (
            <Box textAlign="center" py={6}>
              <Typography variant="h6" color="text.secondary">
                No products available right now. Please check back later.
              </Typography>
            </Box>
          ) : (
            <>
              {/* <Typography
                variant="body2"
                color="text.secondary"
                textAlign="center"
                sx={{ mb: 3 }}
              >
                Showing {showingFrom}&ndash;{showingTo} of {data.total} products
              </Typography> */}
              <Grid  data-aos="zoom-in" data-aos-duration="800" data-aos-delay="100"  container spacing={4} sx={{ alignItems: 'stretch', mb: 4 }}>
                {data.products.map((product, index) => (
                  <Grid item xs={12} md={4} key={product._id}>
                    <ProductCard product={product} delay={index * 100} />
                  </Grid>
                ))}
              </Grid>
            </>
          )}

          {data.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <PaginationControls page={data.page} totalPages={data.totalPages} />
            </Box>
          )}
        </Container>
      </Box>
      <Footer />
    </>
  );
}

