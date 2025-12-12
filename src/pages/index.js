import { Avatar, Box, Button, Card, CardContent, Chip, Container, Grid, Stack, Typography } from '@mui/material';
import { LockOutlined, SchoolOutlined, BusinessCenterOutlined, SecurityOutlined, PersonOutline, EmailOutlined, ChatBubbleOutline, ShieldOutlined } from '@mui/icons-material';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BlogCard from '@/components/BlogCard';
import ProductCard from '@/components/ProductCard';
import ErrorDisplay from '@/components/ErrorDisplay';
import axios from 'axios';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
// const API_URL = `${API_BASE_URL}/api`;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_URL is missing for website!');
}
const API_URL = `${API_BASE_URL}/api`;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};


export async function getServerSideProps() {
  let products = [];
  let blogPosts = [];
  let partnerLogos = [];
  let error = null;
  const ts = Date.now();

  try {
    const [latestProducts, blogPostsRes, partnerLogosRes] = await Promise.all([
      axios.get(`${API_URL}/products`, {
        headers: NO_CACHE_HEADERS,
        params: { limit: 9, page: 1, _t: ts },
      }).then((res) => {
        const products = res.data.products || [];
        console.log('📦 Fetched products for homepage:', products.length, products.map(p => ({ name: p.name, category: p.category })));
        return { products };
      }).catch((err) => {
        console.error('❌ Error fetching latest products:', {
          url: `${API_URL}/products`,
          error: err.response?.data || err.message,
          status: err.response?.status,
        });
        return { products: [] };
      }),
      axios.get(`${API_URL}/blog`, {
        headers: NO_CACHE_HEADERS,
        params: { published: 'true', limit: 3, page: 1, _t: ts },
      }).then((res) => {
        const data = res.data;
        const posts = Array.isArray(data) ? data : (data?.posts || []);
        return Array.isArray(posts) ? posts.slice(0, 3) : [];
      }).catch((err) => {
        console.error('❌ Error fetching blog posts:', {
          url: `${API_URL}/blog`,
          error: err.response?.data || err.message,
          status: err.response?.status,
        });
        return [];
      }),
      axios.get(`${API_URL}/partners`,{
        headers: NO_CACHE_HEADERS,
        params: { _t: ts },
      }).then((res) => {
        const data = res.data;
        const partners = Array.isArray(data) ? data : [];
        return partners;
      }).catch((err) => {
        console.error('❌ Error fetching partners:', {
          url: `${API_URL}/partners`,
          error: err.response?.data || err.message,
          status: err.response?.status,
        });
        return [];
      }),
    ]);

    products = latestProducts?.products || [];
    blogPosts = blogPostsRes || [];
    partnerLogos = partnerLogosRes || [];
  } catch (err) {
    error = err;
    console.error('❌ Error loading home page data:', err);
  }

  // Ensure all variables are arrays to prevent slice errors
  products = Array.isArray(products) ? products : [];
  blogPosts = Array.isArray(blogPosts) ? blogPosts : [];
  partnerLogos = Array.isArray(partnerLogos) ? partnerLogos : [];

  // Get products from each category, up to 3 per category
  // Priority: targetAudience is the primary filter, category is fallback
  // B2C products: For families - prioritize targetAudience, then check category
  const b2cProducts = (Array.isArray(products) ? products : []).filter(p => {
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
  }).slice(0, 3);
  
  // B2B/B2E products: For organizations & schools - prioritize targetAudience, then check category
  const b2bProducts = (Array.isArray(products) ? products : []).filter(p => {
    // Primary: Check targetAudience first
    if (p.targetAudience === 'schools' || p.targetAudience === 'businesses') return true;
    if (p.targetAudience === 'private-users') return false;
    
    // Fallback: If no targetAudience, check category
    if (!p.targetAudience) {
      return p.category === 'schools' || p.category === 'businesses';
    }
    return false;
  }).slice(0, 3);
  
  // Remove any duplicates (in case a product matches both criteria)
  const uniqueB2C = Array.isArray(b2cProducts) ? b2cProducts.filter(p => !b2bProducts.some(bp => bp._id === p._id)) : [];
  const uniqueB2B = Array.isArray(b2bProducts) ? b2bProducts.filter(p => !b2cProducts.some(cp => cp._id === p._id)) : [];
  
  const allFeaturedProducts = Array.isArray(uniqueB2C) && Array.isArray(uniqueB2B) 
    ? [...uniqueB2C, ...uniqueB2B].slice(0, 6) 
    : [];
  
  console.log('📊 Homepage products breakdown:', {
    total: products.length,
    b2c: b2cProducts.length,
    b2b: b2bProducts.length,
    featured: allFeaturedProducts.length
  });

  return {
    props: {
      products: allFeaturedProducts,
      blogPosts: Array.isArray(blogPosts) ? blogPosts.slice(0, 3) : [],
      partnerLogos,
      error: error ? { message: error.message } : null,
    },
  };
}

export default function Home({ products, blogPosts, partnerLogos, error }) {
  const homeProducts = Array.isArray(products) ? products : [];
  const latestPosts = Array.isArray(blogPosts) ? blogPosts : [];
  
  // Debug logging
  console.log('🏠 Homepage render - products:', homeProducts.length, homeProducts.map(p => ({ 
    name: p.name, 
    category: p.category,
    id: p._id 
  })));

  if (error) {
    return (
      <>
        <Header />
        <Box component="main" sx={{ backgroundColor: '#F5F8FB', minHeight: '80vh' }}>
          <Container maxWidth="lg" sx={{ py: 8 }}>
            <ErrorDisplay error={error} title="Failed to Load Homepage Data" />
          </Container>
        </Box>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <Box component="main" sx={{ backgroundColor: '#F5F8FB' }}>
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: '90vh',
            // overflow: { xs: 'visible', md: 'hidden' },
            // pb: { xs: 20, md: 0 },
          }}
        >
          {/* Floating Animated Icons */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1,
              pointerEvents: 'none',
              '@keyframes floatIcon1': {
                '0%, 100%': { transform: 'translateY(0px) translateX(0px) rotate(0deg)' },
                '33%': { transform: 'translateY(-20px) translateX(10px) rotate(5deg)' },
                '66%': { transform: 'translateY(10px) translateX(-10px) rotate(-5deg)' },
              },
              '@keyframes floatIcon2': {
                '0%, 100%': { transform: 'translateY(0px) translateX(0px) rotate(0deg)' },
                '33%': { transform: 'translateY(-15px) translateX(-15px) rotate(-5deg)' },
                '66%': { transform: 'translateY(15px) translateX(15px) rotate(5deg)' },
              },
              '@keyframes floatIcon3': {
                '0%, 100%': { transform: 'translateY(0px) translateX(0px) rotate(0deg)' },
                '33%': { transform: 'translateY(-18px) translateX(12px) rotate(3deg)' },
                '66%': { transform: 'translateY(12px) translateX(-12px) rotate(-3deg)' },
              },
              '@keyframes floatIcon4': {
                '0%, 100%': { transform: 'translateY(0px) translateX(0px) rotate(0deg)' },
                '33%': { transform: 'translateY(-22px) translateX(-10px) rotate(-4deg)' },
                '66%': { transform: 'translateY(10px) translateX(18px) rotate(4deg)' },
              },
            }}
          >
            {/* Lock Icon */}
            <Box
              sx={{
                position: 'absolute',
                top: { xs: '10%', md: '15%' },
                left: { xs: '5%', md: '10%' },
                animation: 'floatIcon1 6s ease-in-out infinite',
                animationDelay: '0s',
                display: 'block',
              }}
            >
              <LockOutlined sx={{ fontSize: { xs: 24, md: 40 }, color: 'rgba(255, 255, 255, 0.15)' }} />
            </Box>
            {/* Email Icon */}
            <Box
              sx={{
                position: 'absolute',
                top: { xs: '20%', md: '25%' },
                right: { xs: '5%', md: '15%' },
                animation: 'floatIcon2 8s ease-in-out infinite',
                animationDelay: '1s',
                display: 'block',
              }}
            >
              <EmailOutlined sx={{ fontSize: { xs: 24, md: 40 }, color: 'rgba(255, 255, 255, 0.15)' }} />
            </Box>
            {/* Chat Bubble Icon */}
            <Box
              sx={{
                position: 'absolute',
                bottom: { xs: '25%', md: '20%' },
                left: { xs: '5%', md: '12%' },
                animation: 'floatIcon3 7s ease-in-out infinite',
                animationDelay: '2s',
                display: 'block',
              }}
            >
              <ChatBubbleOutline sx={{ fontSize: { xs: 24, md: 40 }, color: 'rgba(255, 255, 255, 0.15)' }} />
            </Box>
            {/* Shield Icon */}
            <Box
              sx={{
                position: 'absolute',
                bottom: { xs: '30%', md: '25%' },
                right: { xs: '5%', md: '10%' },
                animation: 'floatIcon4 9s ease-in-out infinite',
                animationDelay: '1.5s',
                display: 'block',
              }}
            >
              <ShieldOutlined sx={{ fontSize: { xs: 24, md: 40 }, color: 'rgba(255, 255, 255, 0.15)' }} />
            </Box>
          </Box>

          {/* Mobile Slider - Only visible on small screens */}
          <Box
            sx={{
              display: { xs: 'block', md: 'none' },
              height: '100%',
              width: '100%',
            }}
          >
            <Swiper
              modules={[Pagination, Navigation, Autoplay]}
              spaceBetween={0}
              slidesPerView={1}
              pagination={{ 
                clickable: true,
                bulletActiveClass: 'swiper-pagination-bullet-active',
                bulletClass: 'swiper-pagination-bullet',
              }}
              navigation={true}
              autoplay={{
                delay: 4000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              loop={true}
              className="hero-mobile-swiper"
              style={{
                height: '100%',
                width: '100%',
              }}
            >
              {/* Slide 1 - B2C */}
              <SwiperSlide style={{ height: '100%' }}>
                <Box
                  sx={{
                    background: 'linear-gradient(135deg, #063C5E 0%, #0B7897 100%)',
                    color: 'white',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    height: '100%',
                    py: 4,
                  }}
                >
                  <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
                    <Box
                      sx={{
                        maxWidth: '100%',
                        mx: 'auto',
                        px: 2,
                      }}
                    >
                      {/* B2C Image */}
                      <Box
                        sx={{
                          mb: 4,
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          position: 'relative',
                          animation: 'floatCard 4s ease-in-out infinite',
                          transformOrigin: 'center',
                          filter: 'drop-shadow(0 25px 45px rgba(6,60,94,0.35))',
                          '@keyframes floatCard': {
                            '0%': { transform: 'translateY(0px) rotate(0deg)', filter: 'brightness(1) drop-shadow(0 25px 45px rgba(6,60,94,0.35))' },
                            '50%': {
                              transform: 'translateY(-15px) rotate(-1deg)',
                              filter: 'brightness(1.07) drop-shadow(0 25px 45px rgba(6,60,94,0.35))',
                            },
                            '100%': { transform: 'translateY(0px) rotate(0deg)', filter: 'brightness(1) drop-shadow(0 25px 45px rgba(6,60,94,0.35))' },
                          },
                        }}
                      >
                        <Box
                          component="img"
                          src="/images/hero-left.jpg"
                          alt="Family with Konfydence cards"
                          sx={{
                            width: '100%',
                            maxWidth: '280px',
                            height: 'auto',
                            borderRadius: 3,
                            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                            objectFit: 'contain',
                            position: 'relative',
                            overflow: 'hidden',
                            '&::after': {
                              content: '""',
                              position: 'absolute',
                              inset: 0,
                              background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(11,120,151,0.2))',
                            },
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: '-50%',
                              left: '-50%',
                              width: '200%',
                              height: '200%',
                              background: 'radial-gradient(circle, rgba(255,255,255,0.45), transparent 60%)',
                              animation: 'pulseGlow 6s ease-in-out infinite',
                            },
                            '@keyframes pulseGlow': {
                              '0%': { transform: 'translate(-20%, -20%) scale(1)' },
                              '50%': { transform: 'translate(10%, 10%) scale(1.1)', opacity: 0.7 },
                              '100%': { transform: 'translate(-20%, -20%) scale(1)' },
                            },
                          }}
                        />
                      </Box>
                      <Typography
                        variant="h1"
                        sx={{
                          fontSize: '2rem',
                          lineHeight: 1.2,
                          fontWeight: 700,
                          color: 'white',
                          mb: 3,
                          textAlign: 'center',
                        }}
                      >
                        Outsmart Scams. Build Digital Confidence.
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          fontSize: '1rem',
                          mb: 4,
                          opacity: 0.95,
                          color: 'white',
                          textAlign: 'center',
                        }}
                      >
                        Interactive training kits and digital learning for every generation.
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'center',
                        }}
                      >
                        <Button
                          component={Link}
                          href="/shop"
                          variant="contained"
                          size="large"
                          endIcon={
                            <Box
                              component="span"
                              sx={{
                                ml: 0.5,
                                fontSize: '1.2rem',
                                lineHeight: 1,
                              }}
                            >
                              →
                            </Box>
                          }
                          sx={{
                            backgroundColor: '#FFFFFF',
                            color: '#063C5E',
                            '&:hover': {
                              backgroundColor: '#F5F5F5',
                              transform: 'translateX(5px)',
                            },
                            px: 4,
                            py: 1.5,
                            fontWeight: 600,
                            transition: 'all 0.3s ease',
                          }}
                        >
                          Get Your Kit
                        </Button>
                      </Box>
                    </Box>
                  </Container>
                </Box>
              </SwiperSlide>

              {/* Slide 2 - B2B */}
              <SwiperSlide style={{ height: '100%' }}>
                <Box
                  sx={{
                    position: 'relative',
                    background: 'linear-gradient(rgba(6, 60, 94, 0.85), rgba(11, 120, 151, 0.85)), url("https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&q=80")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    height: '100%',
                    py: 4,
                  }}
                >
                  <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
                    <Box
                      sx={{
                        maxWidth: '100%',
                        mx: 'auto',
                        px: 2,
                      }}
                    >
                      <Typography
                        variant="h2"
                        sx={{
                          fontSize: '1.75rem',
                          lineHeight: 1.2,
                          fontWeight: 700,
                          color: 'white',
                          mb: 4,
                          textAlign: 'center',
                        }}
                      >
                        Compliance that engages. Awareness that lasts.
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'center',
                        }}
                      >
                        <Button
                          component={Link}
                          href="/contact?topic=b2b_demo"
                          variant="contained"
                          size="large"
                          endIcon={
                            <Box
                              component="span"
                              sx={{
                                ml: 0.5,
                                fontSize: '1.2rem',
                                lineHeight: 1,
                              }}
                            >
                              →
                            </Box>
                          }
                          sx={{
                            backgroundColor: '#00A4E8',
                            color: 'white',
                            '&:hover': {
                              backgroundColor: '#0088C7',
                              transform: 'translateX(5px)',
                            },
                            px: 4,
                            py: 1.5,
                            fontWeight: 600,
                            transition: 'all 0.3s ease',
                          }}
                        >
                          Request B2B Demo
                        </Button>
                      </Box>
                    </Box>
                  </Container>
                </Box>
              </SwiperSlide>
            </Swiper>
          </Box>

          {/* Desktop Grid - Only visible on medium and larger screens */}
          <Grid container sx={{ height: '100%', display: { xs: 'none', md: 'flex' } }}>
            {/* Left Side - B2C */}
            <Grid
              item
              xs={12}
              sm={12}
              md={6}
              sx={{
                background: 'linear-gradient(135deg, #063C5E 0%, #0B7897 100%)',
                color: 'white',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                height: '100%',
                py: { xs: 4, md: 0 },
              }}
            >
              <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
                <Box
                  data-aos="fade-right"
                  data-aos-duration="800"
                  data-aos-delay="100"
                  sx={{
                    maxWidth: { xs: '100%', md: '90%' },
                    mx: 'auto',
                    px: { xs: 2, md: 4 },
                  }}
                >
                  {/* B2C Image */}
                  <Box
                    sx={{
                      mb: 4,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      position: 'relative',
                      animation: 'floatCard 4s ease-in-out infinite',
                      transformOrigin: 'center',
                      filter: 'drop-shadow(0 25px 45px rgba(6,60,94,0.35))',
                      '@keyframes floatCard': {
                        '0%': { transform: 'translateY(0px) rotate(0deg)', filter: 'brightness(1) drop-shadow(0 25px 45px rgba(6,60,94,0.35))' },
                        '50%': {
                          transform: 'translateY(-15px) rotate(-1deg)',
                          filter: 'brightness(1.07) drop-shadow(0 25px 45px rgba(6,60,94,0.35))',
                        },
                        '100%': { transform: 'translateY(0px) rotate(0deg)', filter: 'brightness(1) drop-shadow(0 25px 45px rgba(6,60,94,0.35))' },
                      },
                    }}
                  >
                    {/* <Box
                      component="img"
                      src="/images/hero-left.jpg"
                      alt="Family with Konfydence cards"
                      sx={{
                        width: '100%',
                        maxWidth: { xs: '280px', md: '450px' },
                        height: 'auto',
                        borderRadius: 3,
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                        objectFit: 'contain',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          inset: 0,
                          background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(11,120,151,0.2))',
                        },
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: '-50%',
                          left: '-50%',
                          width: '200%',
                          height: '200%',
                          background: 'radial-gradient(circle, rgba(255,255,255,0.45), transparent 60%)',
                          animation: 'pulseGlow 6s ease-in-out infinite',
                        },
                        '@keyframes pulseGlow': {
                          '0%': { transform: 'translate(-20%, -20%) scale(1)' },
                          '50%': { transform: 'translate(10%, 10%) scale(1.1)', opacity: 0.7 },
                          '100%': { transform: 'translate(-20%, -20%) scale(1)' },
                        },
                      }}
                    /> */}
                  </Box>
                  <Typography
                    variant="h1"
                    sx={{
                      fontSize: { xs: '2rem', md: '2.75rem', lg: '3rem' },
                      lineHeight: 1.2,
                      fontWeight: 700,
                      color: 'white',
                      mb: 3,
                      textAlign: { xs: 'center', md: 'left' },
                    }}
                  >
                    Outsmart Scams. Build Digital Confidence.
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: { xs: '1rem', md: '1.15rem' },
                      mb: 4,
                      opacity: 0.95,
                      color: 'white',
                      textAlign: { xs: 'center', md: 'left' },
                    }}
                  >
                    The game that empowers families, students, and teams to spot scams before they happen.
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: { xs: 'center', md: 'flex-start' },
                    }}
                    data-aos="fade-right"
                    data-aos-duration="800"
                    data-aos-delay="300"
                  >
                    <Button
                      component={Link}
                      href="/shop"
                      variant="contained"
                      size="large"
                      endIcon={
                        <Box
                          component="span"
                          sx={{
                            ml: 0.5,
                            fontSize: '1.2rem',
                            lineHeight: 1,
                          }}
                        >
                          →
                        </Box>
                      }
                      sx={{
                        backgroundColor: '#FFFFFF',
                        color: '#063C5E',
                        '&:hover': {
                          backgroundColor: '#F5F5F5',
                          transform: 'translateX(5px)',
                        },
                        px: 4,
                        py: 1.5,
                        fontWeight: 600,
                        transition: 'all 0.3s ease',
                      }}
                    >
                      Get Your Kit
                    </Button>
                  </Box>
                </Box>
              </Container>
            </Grid>

            {/* Right Side - B2B */}
            <Grid
              item
              xs={12}
              sm={12}
              md={6}
              sx={{
                position: 'relative',
                background: 'linear-gradient(rgba(6, 60, 94, 0.85), rgba(11, 120, 151, 0.85)), url("https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&q=80")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                height: '100%',
                py: { xs: 4, md: 0 },
              }}
            >
              <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
                <Box
                  data-aos="fade-left"
                  data-aos-duration="800"
                  data-aos-delay="200"
                  sx={{
                    maxWidth: { xs: '100%', md: '90%' },
                    mx: 'auto',
                    px: { xs: 2, md: 4 },
                  }}
                >
                  <Typography
                    variant="h2"
                    sx={{
                      fontSize: { xs: '1.75rem', md: '2.5rem', lg: '3rem' },
                      lineHeight: 1.2,
                      fontWeight: 700,
                      color: 'white',
                      mb: 4,
                      textAlign: { xs: 'center', md: 'left' },
                    }}
                  >
                    Compliance that engages. Awareness that lasts.
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: { xs: 'center', md: 'flex-start' },
                    }}
                    data-aos="fade-left"
                    data-aos-duration="800"
                    data-aos-delay="400"
                  >
                    <Button
                      component={Link}
                      href="/contact?topic=b2b_demo"
                      variant="contained"
                      size="large"
                      endIcon={
                        <Box
                          component="span"
                          sx={{
                            ml: 0.5,
                            fontSize: '1.2rem',
                            lineHeight: 1,
                          }}
                        >
                          →
                        </Box>
                      }
                      sx={{
                        backgroundColor: '#00A4E8',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: '#0088C7',
                          transform: 'translateX(5px)',
                        },
                        px: 4,
                        py: 1.5,
                        fontWeight: 600,
                        transition: 'all 0.3s ease',
                      }}
                    >
                      Request B2B Demo
                    </Button>
                  </Box>
                </Box>
              </Container>
            </Grid>
          </Grid>
          
          {/* Info Cards Section - Overlapping Hero Section */}
          <Container
            data-aos="zoom-in"
            data-aos-duration="800"
            data-aos-delay="200"
            maxWidth="lg"
            sx={{
              mt:-20,
              display: { xs: 'none', md: 'block' },
              // position: 'absolute',
              // bottom: { xs: -300, md: -100 },
              // left: '50%',
              transform: 'translateX(-50%)',
              width: '100%',
              zIndex: 10,
            }}
          >
          <Grid container spacing={1}>
             <Grid item sm={6} xs={12} md={1}></Grid>
            <Grid item sm={6} xs={12} md={5}>
              <Box
                sx={{
                  p: 3,
                  height: '100%',
                  backgroundColor: '#7FC7D9',
                  borderRadius: 3,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  position: 'relative',
                  animation: 'floatCard 4s ease-in-out infinite',
                  transformOrigin: 'center',
                  filter: 'drop-shadow(0 25px 45px rgba(6,60,94,0.35))',
                  transition: 'all 0.3s ease-in-out',
                  cursor: 'pointer',
                  '@keyframes floatCard': {
                    '0%': { transform: 'translateY(0px) rotate(0deg)', filter: 'brightness(1) drop-shadow(0 25px 45px rgba(6,60,94,0.35))' },
                    '50%': {
                      transform: 'translateY(-15px) rotate(-1deg)',
                      filter: 'brightness(1.07) drop-shadow(0 25px 45px rgba(6,60,94,0.35))',
                    },
                    '100%': { transform: 'translateY(0px) rotate(0deg)', filter: 'brightness(1) drop-shadow(0 25px 45px rgba(6,60,94,0.35))' },
                  },
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                  },
                }}
              >
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'white', mb: 2, lineHeight: 1.5, fontSize: { xs: '1rem', md: '1.25rem' } }}>
                Cybercrime causes over €200 billion in damages every year in Germany alone.* Most attacks still start with a single human click.
                and update the footnote to
                </Typography>
                <Typography variant="body1" sx={{ color: 'white', opacity: 0.95, fontSize: { xs: '0.875rem', md: '1rem' } }}>
                *Based on figures reported by Bitkom for the German economy.
                </Typography>
              </Box>
            </Grid>
            <Grid item sm={6} xs={12} md={5}>
              <Box
                sx={{
                  p: 3,
                  height: '100%',
                  backgroundColor: '#5FA8BA',
                  borderRadius: 3,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  position: 'relative',
                  animation: 'floatCard 4s ease-in-out infinite',
                  transformOrigin: 'center',
                  filter: 'drop-shadow(0 25px 45px rgba(6,60,94,0.35))',
                  transition: 'all 0.3s ease-in-out',
                  cursor: 'pointer',
                  '@keyframes floatCard': {
                    '0%': { transform: 'translateY(0px) rotate(0deg)', filter: 'brightness(1) drop-shadow(0 25px 45px rgba(6,60,94,0.35))' },
                    '50%': {
                      transform: 'translateY(-15px) rotate(-1deg)',
                      filter: 'brightness(1.07) drop-shadow(0 25px 45px rgba(6,60,94,0.35))',
                    },
                    '100%': { transform: 'translateY(0px) rotate(0deg)', filter: 'brightness(1) drop-shadow(0 25px 45px rgba(6,60,94,0.35))' },
                  },
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                  },
                }}
              >
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'white', mb: 2, fontSize: { xs: '1rem', md: '1.1rem' } }}>
                  How Konfydence Fixes it
                </Typography>
                <Stack spacing={1.5}>
                  {['Fun and engaging', 'Accessible for all ages', 'Proven learning method'].map((item) => (
                    <Typography key={item} variant="body1" sx={{ color: 'white', display: 'flex', alignItems: 'flex-start', gap: 1, fontSize: { xs: '0.875rem', md: '1rem' } }}>
                      <Box component="span" sx={{ color: 'white', fontWeight: 600, mr: 0.5 }}>✓</Box>
                      {item}
                    </Typography>
                  ))}
                </Stack>
              </Box>
            </Grid>
              <Grid item sm={6} xs={12} md={1}></Grid>
          </Grid>
        </Container>
        </Box>

        {/* B2C Product Hero - Scam Survival Kit */}
        <Box sx={{ my: { xs: 8, md: 20 }, position: 'relative', overflow: 'visible' }}>
          <Container maxWidth="lg">
            <Grid container spacing={6} alignItems="center">
              <Grid item xs={12} md={6}>
                <Box
                  data-aos="fade-right"
                  data-aos-duration="800"
                  data-aos-delay="100"
                >
                  <Typography
                    variant="h2"
                    sx={{
                      mb: 3,
                      fontWeight: 700,
                      color: 'black',
                      lineHeight: 1.2,
                      fontSize: { xs: '2rem', md: '3rem' },
                    }}
                  >
                    Scam Survival Kit
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      mb: 4,
                      color: 'black',
                      lineHeight: 1.6,
                      fontSize: { xs: '1.1rem', md: '1.5rem' },
                    }}
                  >
                    The interactive card game that teaches your family to spot scams before they happen.
                  </Typography>
                  <Stack spacing={2} sx={{ mb: 4 }}>
                    {[
                      'Real-world scam scenarios',
                      'Age-appropriate for all generations',
                      'Proven learning through play',
                    ].map((item) => (
                      <Box key={item} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                        <Box
                          sx={{
                            mt: 0.5,
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            backgroundColor: '#00A4E8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <Box
                            component="span"
                            sx={{
                              color: 'white',
                              fontSize: '0.875rem',
                              fontWeight: 700,
                            }}
                          >
                            ✓
                          </Box>
                        </Box>
                        <Typography
                          variant="body1"
                          sx={{
                            color: 'black',
                            fontSize: { xs: '1rem', md: '1.1rem' },
                            fontWeight: 500,
                          }}
                        >
                          {item}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                  <Button
                    component={Link}
                    href="/shop"
                    variant="contained"
                    size="large"
                    sx={{
                      backgroundColor: '#00A4E8',
                      color: 'white',
                      fontWeight: 600,
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      fontSize: { xs: '1rem', md: '1.1rem' },
                      '&:hover': {
                        backgroundColor: '#0088C7',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 24px rgba(0, 164, 232, 0.4)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Get Your Kit
                  </Button>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box
                  data-aos="fade-left"
                  data-aos-duration="800"
                  data-aos-delay="200"
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Box
                    sx={{
                      width: '100%',
                      maxWidth: { xs: '100%', md: '500px' },
                      height: { xs: '300px', md: '400px' },
                      backgroundColor: '#0B7897',
                      borderRadius: 3,
                      position: 'relative',
                      boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      animation: 'floatCard 4s ease-in-out infinite',
                      transformOrigin: 'center',
                      filter: 'drop-shadow(0 25px 45px rgba(6,60,94,0.35))',
                      '@keyframes floatCard': {
                        '0%': { transform: 'translateY(0px) rotate(0deg)', filter: 'brightness(1) drop-shadow(0 25px 45px rgba(6,60,94,0.35))' },
                        '50%': {
                          transform: 'translateY(-15px) rotate(-1deg)',
                          filter: 'brightness(1.07) drop-shadow(0 25px 45px rgba(6,60,94,0.35))',
                        },
                        '100%': { transform: 'translateY(0px) rotate(0deg)', filter: 'brightness(1) drop-shadow(0 25px 45px rgba(6,60,94,0.35))' },
                      },
                    }}
                  >
                    <Box
                      component="img"
                      src="/images/hero-left.jpg"
                      alt="Scam Survival Kit"
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: 3,
                      }}
                    />
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* B2B/B2E Flow Explanation */}
        <Box sx={{ py: { xs: 8, md: 12 }, backgroundColor: 'white' }}>
          <Container maxWidth="lg">
            <Box data-aos="zoom-in" data-aos-duration="800" sx={{ mb: { xs: 4, md: 6 }, textAlign: 'center' }}>
              <Typography
                variant="h2"
                sx={{
                  fontSize: { xs: '2rem', md: '3rem' },
                  fontWeight: 700,
                  color: '#063C5E',
                  mb: 2,
                }}
              >
                How It Works
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontSize: { xs: '1rem', md: '1.25rem' },
                  color: 'text.secondary',
                  maxWidth: 700,
                  mx: 'auto',
                }}
              >
                Simple, streamlined process from demo to analytics
              </Typography>
            </Box>
            <Box sx={{ position: 'relative' }}>
              <Grid container spacing={4} sx={{ mt: 2 }}>
                {[
                  { step: '1', title: 'Demo', description: 'See how it works with a personalized demonstration' },
                  { step: '2', title: 'Custom Package', description: 'We tailor the solution to your organization\'s needs' },
                  { step: '3', title: 'Training', description: 'Roll out engaging training that your team actually enjoys' },
                  { step: '4', title: 'Analytics', description: 'Track progress and measure impact with detailed insights' },
                ].map((item, index) => (
                  <Grid item xs={12} sm={6} md={3} key={item.step} sx={{ position: 'relative' }}>
                    <Box
                      data-aos="fade-up"
                      data-aos-duration="800"
                      data-aos-delay={index * 150}
                      sx={{
                        textAlign: 'center',
                        p: 4,
                        height: '100%',
                        backgroundColor: '#F5F8FB',
                        borderRadius: 3,
                        border: '2px solid transparent',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        '&:hover': {
                          borderColor: '#00A4E8',
                          transform: 'translateY(-8px)',
                          boxShadow: '0 12px 32px rgba(0,0,0,0.1)',
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: '50%',
                          backgroundColor: '#00A4E8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mx: 'auto',
                          mb: 3,
                          fontSize: { xs: '1.5rem', md: '2rem' },
                          fontWeight: 700,
                          color: 'white',
                        }}
                      >
                        {item.step}
                      </Box>
                      <Typography
                        variant="h5"
                        sx={{
                          mb: 2,
                          fontWeight: 700,
                          color: '#063C5E',
                          fontSize: { xs: '1.25rem', md: '1.5rem' },
                        }}
                      >
                        {item.title}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color: 'text.secondary',
                          fontSize: { xs: '0.95rem', md: '1rem' },
                          lineHeight: 1.6,
                        }}
                      >
                        {item.description}
                      </Typography>
                    </Box>
                    {index < 3 && (
                      <Box
                        sx={{
                          display: { xs: 'none', md: 'flex' },
                          position: 'absolute',
                          top: '50%',
                          right: '-16px',
                          transform: 'translateY(-50%)',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 2,
                        }}
                      >
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            backgroundColor: '#00A4E8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '1.2rem',
                            fontWeight: 700,
                          }}
                        >
                          →
                        </Box>
                      </Box>
                    )}
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Container>
        </Box>

        <Box sx={{ py: 15, position: 'relative', overflow: 'hidden' }}>
          <Container        data-aos="zoom-in"
                 data-aos-duration="800"
                data-aos-delay="100" maxWidth="lg">
            <Box data-aos="zoom-in" data-aos-duration="800">
              <Typography 
                variant="h2" 
                textAlign="center" 
                sx={{ 
                  mb: 8,
                  mt:8,
                  fontSize: { xs: '2rem', md: '3rem' },
                  fontWeight: 700,
                  color: '#063C5E',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                Latest Products
              </Typography>
            </Box>
            {homeProducts.length === 0 ? (
              <Box textAlign="center" py={6}>
                <Typography variant="h6" color="text.secondary">
                  No featured products are available right now. Please check back soon.
                  </Typography>
                      </Box>
            ) : (
              <>
                {/* Split products into B2C and B2B/B2E */}
                {(() => {
                  // B2C products: For families - prioritize targetAudience
                  const b2cProducts = homeProducts.filter(p => {
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
                  
                  // B2B/B2E products: For organizations & schools - prioritize targetAudience
                  const b2bProducts = homeProducts.filter(p => {
                    // Primary: Check targetAudience first
                    if (p.targetAudience === 'schools' || p.targetAudience === 'businesses') return true;
                    if (p.targetAudience === 'private-users') return false;
                    
                    // Fallback: If no targetAudience, check category
                    if (!p.targetAudience) {
                      return p.category === 'schools' || p.category === 'businesses';
                    }
                    return false;
                  });
                  
                  // Remove duplicates - ensure each product appears only once
                  const uniqueB2C = b2cProducts.filter(p => 
                    !b2bProducts.some(bp => bp._id === p._id)
                  );
                  const uniqueB2B = b2bProducts.filter(p => 
                    !b2cProducts.some(cp => cp._id === p._id)
                  );
                  
                  const uncategorizedProducts = homeProducts.filter(p => 
                    !uniqueB2C.some(cp => cp._id === p._id) && 
                    !uniqueB2B.some(bp => bp._id === p._id)
                  );
                  
                  console.log('🔍 Product filtering results:', {
                    total: homeProducts.length,
                    b2c: b2cProducts.length,
                    b2b: b2bProducts.length,
                    uncategorized: uncategorizedProducts.length,
                  });
                  
                  return (
                    <>
                      {/* For families section - B2C products */}
                      {uniqueB2C.length > 0 && (
                        <Box sx={{ mb: uniqueB2B.length > 0 ? 8 : 4 }}>
                          <Typography 
                            variant="h3" 
                            sx={{ 
                              mb: 4,
                              fontSize: { xs: '1.75rem', md: '2.5rem' },
                              fontWeight: 700,
                              color: '#063C5E',
                              textAlign: 'left',
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
                          <Grid container spacing={4} sx={{ alignItems: 'stretch' }}>
                            {uniqueB2C.map((product, index) => (
                              <Grid item xs={12} md={4} key={product._id || index}>
                                <ProductCard product={product} delay={index * 150} />
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      )}

                      {/* For organizations & schools section - B2B/B2E products */}
                      {uniqueB2B.length > 0 && (
                        <Box sx={{ mb: 4 }}>
                          <Typography 
                            variant="h3" 
                            sx={{ 
                              mb: 4,
                              fontSize: { xs: '1.75rem', md: '2.5rem' },
                              fontWeight: 700,
                              color: '#063C5E',
                              textAlign: 'left',
                            }}
                          >
                            For Organizations and Schools
                          </Typography>
                          {/* <Typography 
                            variant="body1" 
                            sx={{ 
                              mb: 4,
                              textAlign: 'center',
                              color: 'text.secondary',
                            }}
                          >
                            For Organizations and Schools
                          </Typography> */}
                          <Grid container spacing={4} sx={{ alignItems: 'stretch' }}>
                            {uniqueB2B.map((product, index) => (
                              <Grid item xs={12} md={4} key={product._id || index}>
                                <ProductCard product={product} delay={index * 150} />
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      )}
                      
                      {/* Fallback: Show uncategorized products if no categorized products found */}
                      {b2cProducts.length === 0 && b2bProducts.length === 0 && uncategorizedProducts.length > 0 && (
                        <Box sx={{ mb: 4 }}>
                          <Grid container spacing={4} sx={{ alignItems: 'stretch' }}>
                            {uncategorizedProducts.map((product, index) => (
                              <Grid item xs={12} md={4} key={product._id || index}>
                                <ProductCard product={product} delay={index * 150} />
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      )}
                    </>
                  );
                })()}
                <Box textAlign="center">
                  <Button 
                    component={Link} 
                    href="/products"
                    variant="outlined"
                    size="large"
                    sx={{
                      px: 5,
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 700,
                      borderColor: '#063C5E',
                      color: '#063C5E',
                      '&:hover': {
                        borderColor: '#052A42',
                        color: '#052A42',
                      },
                    }}
                  >
                    Show more
                  </Button>
                </Box>
              </>
            )}
          </Container>
        </Box>

        {/* CoMaSy B2B Section */}
        <Box sx={{ py: { xs: 8, md: 12 },    backgroundColor: '#E9F4FF' }}>
          <Container maxWidth="lg">
            <Box data-aos="zoom-in" data-aos-duration="800" sx={{ mb: { xs: 4, md: 6 } }}>
              <Typography
                variant="h2"
                textAlign="center"
                sx={{
                  fontSize: { xs: '2rem', md: '3rem' },
                  fontWeight: 700,
                  color: '#063C5E',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                CoMaSy (B2B)
              </Typography>
            </Box>
            <Grid container spacing={6} alignItems="center">
              {/* Left Side - Product Mockup */}
              <Grid item xs={12} md={6}>
                <Box
                  data-aos="fade-right"
                  data-aos-duration="800"
                  data-aos-delay="100"
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Box
                    sx={{
                      width: '100%',
                      maxWidth: { xs: '100%', md: '500px' },
                      height: { xs: '300px', md: '400px' },
                      backgroundColor: '#063C5E',
                      borderRadius: 3,
                      position: 'relative',
                      boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                      display: 'flex',
                      flexDirection: 'column',
                      p: 3,
                      gap: 2,
                      animation: 'floatCard 4s ease-in-out infinite',
                      transformOrigin: 'center',
                      filter: 'drop-shadow(0 25px 45px rgba(6,60,94,0.35))',
                      overflow: 'hidden',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(11,120,151,0.2))',
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: '-50%',
                        left: '-50%',
                        width: '200%',
                        height: '200%',
                        background: 'radial-gradient(circle, rgba(255,255,255,0.45), transparent 60%)',
                        animation: 'pulseGlow 6s ease-in-out infinite',
                      },
                      '@keyframes floatCard': {
                        '0%': { transform: 'translateY(0px) rotate(0deg)', filter: 'brightness(1) drop-shadow(0 25px 45px rgba(6,60,94,0.35))' },
                        '50%': {
                          transform: 'translateY(-15px) rotate(-1deg)',
                          filter: 'brightness(1.07) drop-shadow(0 25px 45px rgba(6,60,94,0.35))',
                        },
                        '100%': { transform: 'translateY(0px) rotate(0deg)', filter: 'brightness(1) drop-shadow(0 25px 45px rgba(6,60,94,0.35))' },
                      },
                      '@keyframes pulseGlow': {
                        '0%': { transform: 'translate(-20%, -20%) scale(1)' },
                        '50%': { transform: 'translate(10%, 10%) scale(1.1)', opacity: 0.7 },
                        '100%': { transform: 'translate(-20%, -20%) scale(1)' },
                      },
                    }}
                  >
                    {/* Dashboard Preview Mockup */}
                    <Box
                      sx={{
                        flex: 1,
                        backgroundColor: '#0B7897',
                        borderRadius: 2,
                        p: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                      }}
                    >
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Box sx={{ width: '60%', height: '8px', backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 1 }} />
                        <Box sx={{ width: '30%', height: '8px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 1 }} />
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {[1, 2, 3, 4].map((i) => (
                          <Box
                            key={i}
                            sx={{
                              width: { xs: '45%', md: '48%' },
                              height: '60px',
                              backgroundColor: 'rgba(255,255,255,0.15)',
                              borderRadius: 1.5,
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                    {/* Cards Preview */}
                    <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center' }}>
                      {[1, 2, 3].map((i) => (
                        <Box
                          key={i}
                          sx={{
                            width: '60px',
                            height: '80px',
                            backgroundColor: '#00A4E8',
                            borderRadius: 2,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                </Box>
              </Grid>

              {/* Right Side - Content */}
              <Grid item xs={12} md={6}>
                <Box data-aos="fade-left" data-aos-duration="800" data-aos-delay="200">
                  <Typography
                    variant="h2"
                    sx={{
                      mb: 2,
                      fontWeight: 700,
                      color: '#063C5E',
                      lineHeight: 1.2,
                      fontSize: { xs: '2rem', md: '2.5rem' },
                    }}
                  >
                    Transform Compliance into Engagement.
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 4,
                      color: 'text.secondary',
                      lineHeight: 1.6,
                      fontSize: { xs: '1rem', md: '1.25rem' },
                    }}
                  >
                    CoMaSy is a didactic simulation system for real-world cyber and fraud awareness.
                  </Typography>

                  {/* Pitch Bullets */}
                  <Stack spacing={2} sx={{ mb: 4 }}>
                    {[
                      'NIS2 & DSGVO compliant',
                      'Behavior-based metrics',
                      'Custom content for finance, HR, and risk teams',
                    ].map((item) => (
                      <Box key={item} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                        <Box
                          sx={{
                            mt: 0.5,
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            backgroundColor: '#00A4E8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <Box
                            component="span"
                            sx={{
                              color: 'white',
                              fontSize: '0.875rem',
                              fontWeight: 700,
                            }}
                          >
                            ✓
                          </Box>
                        </Box>
                        <Typography
                          variant="body1"
                          sx={{
                            color: '#063C5E',
                            fontSize: { xs: '0.95rem', md: '1.1rem' },
                            fontWeight: 500,
                          }}
                        >
                          {item}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>

                  {/* Pricing Tiers */}
                  <Box
                    sx={{
                      mb: 4,
                      p: 3,
                      backgroundColor: '#E9F4FF',
                      borderRadius: 2,
                      border: '1px solid rgba(6, 60, 94, 0.1)',
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        mb: 2,
                        fontWeight: 600,
                        color: '#063C5E',
                        fontSize: { xs: '1rem', md: '1.1rem' },
                      }}
                    >
                      Pricing
                    </Typography>
                    <Stack spacing={1.5}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ color: '#063C5E', fontWeight: 500 }}>
                          KMU
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#063C5E', fontWeight: 600 }}>
                          €1,500/year
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ color: '#063C5E', fontWeight: 500 }}>
                          Mid-size
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#063C5E', fontWeight: 600 }}>
                          €4/employee
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ color: '#063C5E', fontWeight: 500 }}>
                          Enterprise
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#063C5E', fontWeight: 600 }}>
                          Custom
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>

                  {/* CTA Button */}
                  <Button
                    component={Link}
                    href="/comasy"
                    variant="contained"
                    size="large"
                    sx={{
                      backgroundColor: '#00A4E8',
                      color: 'white',
                      fontWeight: 600,
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      mb: 4,
                      '&:hover': {
                        backgroundColor: '#0088C7',
                      },
                    }}
                  >
                    Book a Demo
                  </Button>

                  {/* Logos Section */}
                  {/* <Box
                    sx={{
                      pt: 3,
                      borderTop: '1px solid rgba(6, 60, 94, 0.1)',
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 2,
                        color: 'text.secondary',
                        fontSize: { xs: '0.85rem', md: '0.95rem' },
                        textAlign: { xs: 'center', md: 'left' },
                      }}
                    >
                      Pilot clients + As seen at Didacta & BETT London 2026
                    </Typography>
                    <Box
                      sx={{
                        display: 'none',
                        gap: 3,
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: { xs: 'center', md: 'flex-start' },
                      }}
                    >
                      {/* Placeholder for pilot client logos - you can add actual logos here */}
                      {/* <Box
                        sx={{
                          width: { xs: '80px', md: '100px' },
                          height: { xs: '40px', md: '50px' },
                          backgroundColor: 'rgba(6, 60, 94, 0.1)',
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography variant="caption" sx={{ color: '#063C5E', fontSize: '0.7rem' }}>
                          Logo
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          width: { xs: '80px', md: '100px' },
                          height: { xs: '40px', md: '50px' },
                          backgroundColor: 'rgba(6, 60, 94, 0.1)',
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography variant="caption" sx={{ color: '#063C5E', fontSize: '0.7rem' }}>
                          Logo
                        </Typography>
                      </Box>
                    </Box> */}
                  {/* </Box>  */}
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* Education (B2E Section) */}
        <Box
          sx={{
         
            py: { xs: 8, md: 12 },
            position: 'relative',
            background: 'linear-gradient(rgba(6, 60, 94, 0.85), rgba(11, 120, 151, 0.85)), url("https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            overflow: 'hidden',
          }}
        >
          <Container maxWidth="lg">
            <Box data-aos="zoom-in" data-aos-duration="800" sx={{ mb: { xs: 4, md: 6 }, textAlign: 'center' }}>
              <Typography
                variant="h2"
                sx={{
                  fontSize: { xs: '2rem', md: '3rem' },
                  fontWeight: 700,
                  color: 'white',
                  mb: 2,
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                Education (B2E)
              </Typography>
              <Typography
                variant="h3"
                sx={{
                  fontSize: { xs: '1.75rem', md: '2.5rem' },
                  fontWeight: 700,
                  color: 'white',
                  mb: 2,
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                Empower Students Against Digital Deception.
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontSize: { xs: '1rem', md: '1.25rem' },
                  color: 'rgba(255, 255, 255, 0.95)',
                  maxWidth: 800,
                  mx: 'auto',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                The Youth Pack brings media literacy to life – aligned with KMK Digital Strategy.
              </Typography>
            </Box>

            {/* Features Grid */}
            <Grid container spacing={4} sx={{ mb: 6 }}>
              {[
                { icon: '🎓', title: 'Teacher Handbook', description: 'Comprehensive guide for educators' },
                { icon: '🧩', title: 'Lesson Plans', description: 'Ready-to-use curriculum materials' },
                { icon: '💡', title: 'Interactive Student Decks', description: 'Engaging activities for students' },
              ].map((feature, index) => (
                <Grid item xs={12} md={4} key={feature.title}>
                  <Box
                    data-aos="fade-up"
                    data-aos-duration="800"
                    data-aos-delay={index * 150}
                    sx={{
                      textAlign: 'center',
                      p: 4,
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: 3,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                      transition: 'all 0.3s ease',
                      height: '100%',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 12px 32px rgba(0,0,0,0.2)',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        fontSize: { xs: '3rem', md: '4rem' },
                        mb: 2,
                        lineHeight: 1,
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography
                      variant="h5"
                      sx={{
                        mb: 1,
                        fontWeight: 700,
                        color: '#063C5E',
                        fontSize: { xs: '1.25rem', md: '1.5rem' },
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        fontSize: { xs: '0.9rem', md: '1rem' },
                      }}
                    >
                      {feature.description}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>

            {/* CTA Button */}
            <Box
              sx={{
                textAlign: 'center',
                position: 'relative',
                zIndex: 1,
              }}
              data-aos="zoom-in"
              data-aos-duration="800"
              data-aos-delay="450"
            >
              <Button
                component={Link}
                href="/education"
                variant="contained"
                size="large"
                sx={{
                  backgroundColor: '#00A4E8',
                  color: 'white',
                  fontWeight: 600,
                  px: 5,
                  py: 1.5,
                  borderRadius: 2,
                  fontSize: { xs: '1rem', md: '1.1rem' },
                  '&:hover': {
                    backgroundColor: '#0088C7',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 24px rgba(0, 164, 232, 0.4)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Request Pilot Info
              </Button>
            </Box>
          </Container>
        </Box>

        {/* <Box sx={{ py: 10, backgroundColor: '#E9F4FF' }}>
          <Container maxWidth="lg">
            <Grid container spacing={6} alignItems="center">
              <Grid item xs={12} md={6}>
                <Box data-aos="fade-right" data-aos-duration="800" data-aos-delay="100">
                  <Typography variant="h2" sx={{ mb: 3, fontWeight: 700, color: '#063C5E', lineHeight: 1.2 }}>
                    Teaching Digital Resilience Made Simple.
                  </Typography>
                  <Typography variant="h6" sx={{ mb: 4, color: 'text.secondary', lineHeight: 1.6, maxWidth: 520 }}>
                    Engage students with our Youth Pack, didactic concept & teacher handbook.
                  </Typography>
                  <Button 
                    component={Link} 
                    href="/education" 
                    variant="contained"
                    size="large"
                    sx={{
                      backgroundColor: '#063C5E',
                      color: 'white',
                      fontWeight: 600,
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      '&:hover': {
                        backgroundColor: '#052A42',
                      },
                    }}
                  >
                    Request School Pilot Info
                  </Button>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box
                  data-aos="fade-left"
                  data-aos-duration="1000"
                  data-aos-delay="200"
                  sx={{
                    position: 'relative',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: 400,
                  }}
                >
                  <Box
                    sx={{
                      width: '100%',
                      maxWidth: 400,
                      height: 400,
                      backgroundColor: '#0B7897',
                      borderRadius: 4,
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      animation: 'floatCard 4s ease-in-out infinite',
                      transformOrigin: 'center',
                      filter: 'drop-shadow(0 25px 45px rgba(6,60,94,0.35))',
                      transition: 'all 0.3s ease-in-out',
                      cursor: 'pointer',
                      '@keyframes floatCard': {
                        '0%': { transform: 'translateY(0px) rotate(0deg)', filter: 'brightness(1) drop-shadow(0 25px 45px rgba(6,60,94,0.35))' },
                        '50%': {
                          transform: 'translateY(-15px) rotate(-1deg)',
                          filter: 'brightness(1.07) drop-shadow(0 25px 45px rgba(6,60,94,0.35))',
                        },
                        '100%': { transform: 'translateY(0px) rotate(0deg)', filter: 'brightness(1) drop-shadow(0 25px 45px rgba(6,60,94,0.35))' },
                      },
                      '&:hover': {
                        transform: 'scale(1.08)',
                        boxShadow: '0 16px 48px rgba(0,0,0,0.25)',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 40,
                        left: 40,
                        width: 80,
                        height: 60,
                        backgroundColor: '#E9F4FF',
                        borderRadius: 3,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 0.5,
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          bottom: -10,
                          left: 20,
                          width: 0,
                          height: 0,
                          borderLeft: '10px solid transparent',
                          borderRight: '10px solid transparent',
                          borderTop: '10px solid #E9F4FF',
                        },
                      }}
                    >
                      {[1, 2, 3].map((i) => (
                        <Box
                          key={i}
                          sx={{
                            width: 40,
                            height: 3,
                            backgroundColor: '#0B7897',
                            borderRadius: 1,
                          }}
                        />
                      ))}
                    </Box>
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 20,
                        right: 40,
                        width: 120,
                        height: 160,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                      }}
                    >
                      <Box
                        component="svg"
                        viewBox="0 0 100 150"
                        sx={{
                          width: '100%',
                          height: '100%',
                          '& path': {
                            fill: '#FFFFFF',
                          },
                        }}
                      >
                        <path d="M50 10 C60 10, 65 15, 65 25 C65 30, 63 35, 60 38 C65 40, 70 45, 70 52 C70 58, 66 62, 61 64 C65 67, 68 72, 68 78 C68 85, 62 90, 55 92 L55 140 C55 145, 53 147, 50 147 C47 147, 45 145, 45 140 L45 92 C38 90, 32 85, 32 78 C32 72, 35 67, 39 64 C34 62, 30 58, 30 52 C30 45, 35 40, 40 38 C37 35, 35 30, 35 25 C35 15, 40 10, 50 10 Z" />
                        <rect x="45" y="50" width="10" height="15" rx="2" fill="#0B7897" />
                        <rect x="48" y="70" width="4" height="20" rx="2" fill="#0B7897" />
                        <ellipse cx="55" cy="42" rx="8" ry="10" fill="#0B7897" />
                        <ellipse cx="55" cy="42" rx="5" ry="7" fill="#FFFFFF" />
                      </Box>
                      <Box
                        sx={{
                          position: 'absolute',
                          top: -30,
                          right: -20,
                          width: 60,
                          height: 40,
                          backgroundColor: '#E9F4FF',
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Box
                          sx={{
                            width: 40,
                            height: 30,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 0.5,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {[1, 2, 3].map((i) => (
                            <Box
                              key={i}
                              sx={{
                                width: 30,
                                height: 2,
                                backgroundColor: '#0B7897',
                                borderRadius: 1,
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box> */}

      {/* Trusted by Families, Companies & Schools - Testimonials Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, backgroundColor: '#E9F4FF' }}>
        <Container maxWidth="lg">
          <Box data-aos="zoom-in" data-aos-duration="800" sx={{ mb: { xs: 4, md: 6 }, textAlign: 'center' }}>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2rem', md: '3rem' },
                fontWeight: 700,
                color: '#063C5E',
                mb: 2,
              }}
            >
              Trusted by Families, Companies & Schools
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontSize: { xs: '1rem', md: '1.25rem' },
                color: 'text.secondary',
                maxWidth: 700,
                mx: 'auto',
              }}
            >
              Real stories from people and organizations using Konfydence to strengthen scam awareness and digital safety.
            </Typography>
          </Box>

          {/* B2C Testimonials (Families) */}
          <Box sx={{ mb: 6 }}>
            <Typography
              variant="h4"
              sx={{
                mb: 4,
                fontSize: { xs: '1.5rem', md: '2rem' },
                fontWeight: 600,
                color: '#063C5E',
                textAlign: 'center',
              }}
            >
              For Families
            </Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Box
                  data-aos="fade-up"
                  data-aos-duration="800"
                  data-aos-delay="100"
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
                      color: 'text.secondary',
                      mb: 3,
                      fontSize: { xs: '0.95rem', md: '1rem' },
                      lineHeight: 1.7,
                      flexGrow: 1,
                      fontStyle: 'italic',
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
                    — Parent, Munich
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box
                  data-aos="fade-up"
                  data-aos-duration="800"
                  data-aos-delay="200"
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
                      color: 'text.secondary',
                      mb: 3,
                      fontSize: { xs: '0.95rem', md: '1rem' },
                      lineHeight: 1.7,
                      flexGrow: 1,
                      fontStyle: 'italic',
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
                    — Family of Four, Berlin
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* B2B Testimonials (Companies) */}
          <Box sx={{ mb: 6 }}>
            <Typography
              variant="h4"
              sx={{
                mb: 4,
                fontSize: { xs: '1.5rem', md: '2rem' },
                fontWeight: 600,
                color: '#063C5E',
                textAlign: 'center',
              }}
            >
              For Companies
            </Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Box
                  data-aos="fade-up"
                  data-aos-duration="800"
                  data-aos-delay="300"
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
                      color: 'text.secondary',
                      mb: 3,
                      fontSize: { xs: '0.95rem', md: '1rem' },
                      lineHeight: 1.7,
                      flexGrow: 1,
                      fontStyle: 'italic',
                    }}
                  >
                    &ldquo;Konfydence raised scam-awareness across our staff by 78% in just four weeks.&rdquo;
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: '#063C5E',
                      fontSize: { xs: '0.9rem', md: '1rem' },
                    }}
                  >
                    — Compliance Officer, German Bank
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box
                  data-aos="fade-up"
                  data-aos-duration="800"
                  data-aos-delay="400"
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
                      color: 'text.secondary',
                      mb: 3,
                      fontSize: { xs: '0.95rem', md: '1rem' },
                      lineHeight: 1.7,
                      flexGrow: 1,
                      fontStyle: 'italic',
                    }}
                  >
                    &ldquo;One of the most effective anti-fraud trainings we&apos;ve deployed.&rdquo;
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: '#063C5E',
                      fontSize: { xs: '0.9rem', md: '1rem' },
                    }}
                  >
                    — HR Director, FinTech Company
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* B2E Testimonials (Schools) */}
          <Box sx={{ mb: 6 }}>
            <Typography
              variant="h4"
              sx={{
                mb: 4,
                fontSize: { xs: '1.5rem', md: '2rem' },
                fontWeight: 600,
                color: '#063C5E',
                textAlign: 'center',
              }}
            >
              For Schools
            </Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Box
                  data-aos="fade-up"
                  data-aos-duration="800"
                  data-aos-delay="500"
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
                      color: 'text.secondary',
                      mb: 3,
                      fontSize: { xs: '0.95rem', md: '1rem' },
                      lineHeight: 1.7,
                      flexGrow: 1,
                      fontStyle: 'italic',
                    }}
                  >
                    &ldquo;Our students loved the Youth Pack — extremely effective for digital literacy lessons.&rdquo;
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: '#063C5E',
                      fontSize: { xs: '0.9rem', md: '1rem' },
                    }}
                  >
                    — Teacher, Hamburg
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box
                  data-aos="fade-up"
                  data-aos-duration="800"
                  data-aos-delay="600"
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
                      color: 'text.secondary',
                      mb: 3,
                      fontSize: { xs: '0.95rem', md: '1rem' },
                      lineHeight: 1.7,
                      flexGrow: 1,
                      fontStyle: 'italic',
                    }}
                  >
                    &ldquo;Finally a tool that makes online safety engaging for teens.&rdquo;
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: '#063C5E',
                      fontSize: { xs: '0.9rem', md: '1rem' },
                    }}
                  >
                    — Principal, Vienna
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* CTA Row - 3 Buttons */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: 3,
              justifyContent: 'center',
              alignItems: 'center',
              mt: 6,
            }}
          >
            <Button
              component={Link}
              href="/shop"
              variant="contained"
              sx={{
                backgroundColor: '#063C5E',
                color: 'white',
                fontWeight: 600,
                px: 4,
                py: 1.5,
                borderRadius: 2,
                fontSize: { xs: '0.95rem', md: '1rem' },
                minWidth: { xs: '100%', md: '200px' },
                '&:hover': {
                  backgroundColor: '#052A42',
                },
              }}
            >
              Buy Scam Survival Kit
            </Button>
            <Button
              component={Link}
              href="/contact?topic=b2b_demo"
              variant="contained"
              sx={{
                backgroundColor: '#00A4E8',
                color: 'white',
                fontWeight: 600,
                px: 4,
                py: 1.5,
                borderRadius: 2,
                fontSize: { xs: '0.95rem', md: '1rem' },
                minWidth: { xs: '100%', md: '200px' },
                '&:hover': {
                  backgroundColor: '#0088C7',
                },
              }}
            >
              Request Company Demo
            </Button>
            <Button
              component={Link}
              href="/education"
              variant="contained"
              sx={{
                backgroundColor: '#0B7897',
                color: 'white',
                fontWeight: 600,
                px: 4,
                py: 1.5,
                borderRadius: 2,
                fontSize: { xs: '0.95rem', md: '1rem' },
                minWidth: { xs: '100%', md: '200px' },
                '&:hover': {
                  backgroundColor: '#063C5E',
                },
              }}
            >
              Request School Demo
            </Button>
          </Box>
        </Container>
      </Box>

      <Box  data-aos="zoom-in" data-aos-duration="800" data-aos-delay="100" sx={{ py: { xs: 8, md: 10 }, backgroundColor: '#F2F5FB' }}>
        <Container
          maxWidth="md"
          sx={{ textAlign: 'center', mb: 6 }}
          data-aos="zoom-in"
          data-aos-duration="800"
        >
          <Typography variant="overline" sx={{ letterSpacing: 2, fontWeight: 600, color: '#0B7897' }}>
            Blog / Resources
          </Typography>
          <Typography
            variant="h3"
            sx={{ fontWeight: 700, mb: 2, color: '#052A42', fontSize: { xs: '2rem', md: '2.5rem' } }}
          >
            Latest Blog Posts
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 640, mx: 'auto', mb: 4 }}>
            Read our latest tips, insights, and strategies to stay safe online.
          </Typography>
          <Button variant="contained" size="large" sx={{ borderRadius: 999, px: 4 }} href="/contact?topic=other">
            Subscribe for Updates
          </Button>
        </Container>
        <Container
          maxWidth="lg"
          data-aos="zoom-in"
          data-aos-duration="800"
        >
          {!latestPosts || latestPosts.length === 0 ? (
            <Typography textAlign="center" color="text.secondary">
              No articles yet. Check back soon!
            </Typography>
          ) : (
            <>
              <Grid container spacing={4}>
                {(Array.isArray(latestPosts) ? latestPosts : []).slice(0, 3).map((post, index) => (
                  <Grid item xs={12} md={4} key={post._id}>
                    <BlogCard post={post} delay={index * 100} />
                  </Grid>
                ))}
              </Grid>
              <Box textAlign="center" sx={{ mt: 5 }}>
                <Button variant="outlined" size="large" href="/blog" sx={{ borderRadius: 999, px: 4 }}>
                  Show More Articles
                </Button>
              </Box>
            </>
          )}
        </Container>
      </Box>
      </Box>
      <Footer />
    </>
  );
}

