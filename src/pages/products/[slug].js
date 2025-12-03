// import { Box, Chip, Container, Grid, Typography, Button } from '@mui/material';
// import Header from '@/components/Header';
// import Footer from '@/components/Footer';
// import ErrorDisplay from '@/components/ErrorDisplay';
// import axios from 'axios';
// import Link from 'next/link';
// import ProductBackButton from '@/components/PageBackButton';

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
// if (!API_BASE_URL) {
//   throw new Error('NEXT_PUBLIC_API_URL environment variable is missing!');
// }
// const API_URL = `${API_BASE_URL}/api`;
// const NO_CACHE_HEADERS = {
//   'Cache-Control': 'no-store, no-cache, must-revalidate',
//   Pragma: 'no-cache',
//   Expires: '0',
// };

// console.log('🔗 Product Detail API URL:', API_URL);

// export async function getServerSideProps(context) {
//   const { slug } = context.params;
//   let product = null;
//   let error = null;
//   const ts = Date.now(); 

//   try {
//     const url = `${API_URL}/products/slug/${slug}`;
//     console.log('📡 API: GET', url);
//     const res = await axios.get(url, {
//       headers: NO_CACHE_HEADERS,
//       params: { _t: ts },
//     });
    
//     // const res = await axios.get(url);
//     product = res.data;
//   } catch (err) {
//     error = err;
//     console.error('❌ Error loading product:', {
//       url: `${API_URL}/products/slug/${slug}`,
//       error: err.response?.data || err.message,
//       status: err.response?.status,
//     });
//   }

//   if (!product && !error) {
//     return {
//       notFound: true,
//     };
//   }

//   return {
//     props: {
//       product,
//       error: error ? { message: error.message } : null,
//     },
//   };
// }

// export default function ProductDetailPage({ product, error }) {
//   if (error) {
//     return (
//       <>
//         <Header />
//         <Box component="main" sx={{ pt: { xs: 8, md: 10 }, minHeight: '80vh', backgroundColor: '#F2F5FB' }}>
//           <Container maxWidth="lg" sx={{ py: 8 }}>
//             <ErrorDisplay error={error} title="Failed to Load Product" />
//           </Container>
//         </Box>
//         <Footer />
//       </>
//     );
//   }

//   if (!product) {
//     return null;
//   }

//   const fallbackImage = '/images/placeholders/product-default.svg';
//   const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
//   const normalizedApiBase = apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase;
//   const cleanImageUrl = product.imageUrl?.trim() ?? '';
//   const resolvedImage = cleanImageUrl
//     ? cleanImageUrl.startsWith('http')
//       ? cleanImageUrl
//       : `${normalizedApiBase}${cleanImageUrl.startsWith('/') ? cleanImageUrl : `/${cleanImageUrl}`}`
//     : fallbackImage;

//   return (
//     <>
//       <Header />
//       <Box component="main" sx={{ pt: { xs: 8, md: 10 }, backgroundColor: '#F2F5FB', minHeight: '100vh' }}>
//         <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
//           <Grid container spacing={6}>
//             <Grid item xs={12} md={6}>
//               <Box
//                 component="img"
//                 src={resolvedImage}
//                 alt={product.name}
//                 sx={{
//                   width: '100%',
//                   borderRadius: 4,
//                   objectFit: 'cover',
//                   boxShadow: '0 30px 70px rgba(6,60,94,0.2)',
//                 }}
//               />
//             </Grid>
//             <Grid item xs={12} md={6}>
//               <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
//                 <Chip label={product.type.toUpperCase()} color="primary" />
//                 {product.badges?.map((badge) => (
//                   <Chip key={badge} label={badge} variant="outlined" />
//                 ))}
//               </Box>
//               <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, color: '#052A42' }}>
//                 {product.name}
//               </Typography>
//               <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.7 }}>
//                 {product.description}
//               </Typography>
//               <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: '#0B7897' }}>
//                 €{product.price.toFixed(2)}
//               </Typography>

//               <Grid container spacing={2} sx={{ mb: 4 }}>
//                 {product.pricingInfo?.primary && (
//                   <Grid item xs={12}>
//                     <Typography variant="subtitle2" color="text.secondary">
//                       Primary
//                     </Typography>
//                     <Typography variant="body1">{product.pricingInfo.primary}</Typography>
//                   </Grid>
//                 )}
//                 {product.pricingInfo?.secondary && (
//                   <Grid item xs={12}>
//                     <Typography variant="subtitle2" color="text.secondary">
//                       Secondary
//                     </Typography>
//                     <Typography variant="body1">{product.pricingInfo.secondary}</Typography>
//                   </Grid>
//                 )}
//               </Grid>

//               <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
//                 {product.ctaHref && (
//                   <Button
//                     component={Link}
//                     href={product.ctaHref}
//                     variant="contained"
//                     size="large"
//                     sx={{ borderRadius: 2, px: 4 }}
//                   >
//                     {product.ctaText || 'Get Started'}
//                   </Button>
//                 )}
//                 <ProductBackButton />
//               </Box>
//             </Grid>
//           </Grid>
//         </Container>
//       </Box>
//       <Footer />
//     </>
//   );
// }

import { Box, Chip, Container, Grid, Typography, Button } from '@mui/material';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ErrorDisplay from '@/components/ErrorDisplay';
import axios from 'axios';
import Link from 'next/link';
import ProductBackButton from '@/components/PageBackButton';

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

console.log('🔗 Product Detail API URL:', API_URL);

export async function getServerSideProps(context) {
  const { slug } = context.params;
  const { res } = context; 
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  let product = null;
  let error = null;
  const ts = Date.now();

  try {
    const url = `${API_URL}/products/slug/${slug}`;
    console.log('📡 API: GET', url);

    const res = await axios.get(url, {
      headers: NO_CACHE_HEADERS,
      params: { _t: ts },
    });

    product = res.data;
  } catch (err) {
    error = err;
    console.error('❌ Error loading product:', {
      url: `${API_URL}/products/slug/${slug}`,
      error: err.response?.data || err.message,
      status: err.response?.status,
    });
  }

  if (!product && !error) {
    return { notFound: true };
  }

  return {
    props: {
      product,
      error: error ? { message: error.message } : null,
    },
  };
}

export default function ProductDetailPage({ product, error }) {
  if (error) {
    return (
      <>
        <Header />
        <Box component="main" sx={{ pt: { xs: 8, md: 10 }, minHeight: '80vh', backgroundColor: '#F2F5FB' }}>
          <Container maxWidth="lg" sx={{ py: 8 }}>
            <ErrorDisplay error={error} title="Failed to Load Product" />
          </Container>
        </Box>
        <Footer />
      </>
    );
  }

  if (!product) return null;

  // ---------- 🔥 FIX: SAFE VALUES ----------
  const safeType = product?.type ? product.type.toUpperCase() : 'PRODUCT';

  const hasPrice = typeof product?.price === 'number';
  const formattedPrice = hasPrice ? product.price.toFixed(2) : null;

  // ---------- Image Resolve ----------
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
                sx={{
                  position: 'relative',
                  width: '100%',
                  paddingTop: '66.67%', // 3:2 aspect ratio (2/3 = 0.6667)
                  backgroundColor: '#F5F8FB', // Consistent background color
                  borderRadius: 4,
                  overflow: 'hidden',
                  boxShadow: '0 30px 70px rgba(6,60,94,0.2)',
                }}
              >
                <Box
                  component="img"
                  src={resolvedImage}
                  alt={product.name}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: 4,
                  }}
                />
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>

              {/* 🔥 SAFE TYPE FIX */}
              <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip label={safeType} color="primary" />
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

              {/* 🔥 SAFE PRICE FIX */}
              {hasPrice && (
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: '#0B7897' }}>
                  €{formattedPrice}
                </Typography>
              )}

              {/* Pricing Info */}
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
                  <Button component={Link} href={product.ctaHref} variant="contained" size="large" sx={{ borderRadius: 2, px: 4 }}>
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
