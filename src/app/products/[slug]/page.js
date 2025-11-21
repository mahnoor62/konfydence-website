import { Box, Chip, Container, Grid, Typography, Button } from '@mui/material';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import api from '@/lib/api';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ProductBackButton from './components/ProductBackButton';

const FALLBACK_SLUG = '__no-products';

async function getProduct(slug) {
  try {
    const res = await api.get(`/products/slug/${slug}`);
    return res.data;
  } catch (error) {
    return null;
  }
}

export async function generateStaticParams() {
  try {
    const res = await api.get('/products', { params: { all: true } });
    const products = Array.isArray(res.data) ? res.data : res.data.products || [];

    const slugs = products
      .filter((product) => Boolean(product?.slug))
      .map((product) => ({
        slug: product.slug,
      }));

    if (!slugs.length) {
      return [{ slug: FALLBACK_SLUG }];
    }

    return slugs;
  } catch (error) {
    console.error('Error generating product params:', error);
    return [{ slug: FALLBACK_SLUG }];
  }
}

export const dynamic = 'force-static';
export const revalidate = 3600;
export const dynamicParams = false;

export default async function ProductDetailPage({ params }) {
  if (params.slug === FALLBACK_SLUG) {
    return (
      <>
        <Header />
        <Box component="main" sx={{ pt: { xs: 8, md: 10 }, minHeight: '60vh' }}>
          <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
            <Typography variant="h3" gutterBottom>
              Products are coming soon
            </Typography>
            <Typography variant="body1" color="text.secondary">
              We&apos;re still preparing our product catalog. Please check back later.
            </Typography>
            <Box sx={{ mt: 4 }}>
              <ProductBackButton />
            </Box>
          </Container>
        </Box>
        <Footer />
      </>
    );
  }

  const product = await getProduct(params.slug);

  if (!product) {
    notFound();
  }

  const fallbackImage = '/images/placeholders/product-default.svg';
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const normalizedApiBase = apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase;
  const cleanImageUrl = product.imageUrl?.trim() ?? '';
  const resolvedImage = cleanImageUrl
    ? cleanImageUrl.startsWith('http')
      ? cleanImageUrl
      : `${normalizedApiBase}${cleanImageUrl.startsWith('/') ? cleanImageUrl : `/${cleanImageUrl}`}`
    : fallbackImage;

  return (
    <>
      <Header />
      <Box component="main" sx={{ pt: { xs: 8, md: 10 }, backgroundColor: '#F2F5FB', minHeight: '100vh' }}>
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
          <Grid container spacing={6}>
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src={resolvedImage}
                alt={product.name}
                sx={{
                  width: '100%',
                  borderRadius: 4,
                  objectFit: 'cover',
                  boxShadow: '0 30px 70px rgba(6,60,94,0.2)',
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip label={product.type.toUpperCase()} color="primary" />
                {product.badges?.map((badge) => (
                  <Chip key={badge} label={badge} variant="outlined" />
                ))}
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, color: '#052A42' }}>
                {product.name}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.7 }}>
                {product.description}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: '#0B7897' }}>
                €{product.price.toFixed(2)}
              </Typography>

              <Grid container spacing={2} sx={{ mb: 4 }}>
                {product.pricingInfo?.primary && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Primary
                    </Typography>
                    <Typography variant="body1">{product.pricingInfo.primary}</Typography>
                  </Grid>
                )}
                {product.pricingInfo?.secondary && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Secondary
                    </Typography>
                    <Typography variant="body1">{product.pricingInfo.secondary}</Typography>
                  </Grid>
                )}
              </Grid>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {product.ctaHref && (
                  <Button
                    component={Link}
                    href={product.ctaHref}
                    variant="contained"
                    size="large"
                    sx={{ borderRadius: 2, px: 4 }}
                  >
                    {product.ctaText || 'Get Started'}
                  </Button>
                )}
                <ProductBackButton />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
      <Footer />
    </>
  );
}

