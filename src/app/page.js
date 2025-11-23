
import { Avatar, Box, Button, Card, CardContent, Chip, Container, Grid, Stack, Typography } from '@mui/material';
import { LockOutlined, SchoolOutlined, BusinessCenterOutlined, SecurityOutlined, PersonOutline } from '@mui/icons-material';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BlogCard from '@/components/BlogCard';
import ProductCard from '@/components/ProductCard';
import PartnerLogosSwiper from '@/components/PartnerLogosSwiper';
import ErrorDisplay from '@/components/ErrorDisplay';
import axios from 'axios';
import Link from 'next/link';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const API_URL = `${API_BASE_URL}/api`;
console.log('API URL:', API_URL);

async function getHomeData() {
  console.log('📡 API: GET', `${API_URL}/products`, { limit: 3, page: 1 });
  console.log('📡 API: GET', `${API_URL}/settings`);
  console.log('📡 API: GET', `${API_URL}/blog`, { published: 'true', limit: 3 });
  console.log('📡 API: GET', `${API_URL}/partners`);

  const [latestProducts, settings, blogPosts, partnerLogos] = await Promise.all([
    // Fetch 3 latest products sorted by creation date (newest first)
    axios.get(`${API_URL}/products`, { params: { limit: 3, page: 1 } }).then((res) => res.data).catch((err) => {
      console.error('❌ Error fetching latest products:', {
        url: `${API_URL}/products`,
        error: err.response?.data || err.message,
        status: err.response?.status,
      });
      return { products: [] };
    }),
    axios.get(`${API_URL}/settings`).then((res) => res.data).catch((err) => {
      console.error('❌ Error fetching settings:', {
        url: `${API_URL}/settings`,
        error: err.response?.data || err.message,
        status: err.response?.status,
      });
      throw err.response?.data;
    }),
    axios.get(`${API_URL}/blog`, { params: { published: 'true', limit: 3 } }).then((res) => {
      const data = res.data;
      return Array.isArray(data) ? data : (data?.posts || []);
    }).catch((err) => {
      console.error('❌ Error fetching blog posts:', {
        url: `${API_URL}/blog`,
        error: err.response?.data || err.message,
        status: err.response?.status,
      });
      throw err.response?.data;
    }),
    // axios.get(`${API_URL}/testimonials`).then((res) => {
    //   const data = res.data;
    //   return Array.isArray(data) ? data : [];
    // }).catch((err) => {
    //   console.error('❌ Error fetching testimonials:', err.response?.data || err.message);
    //   throw err;
    // }),
    axios.get(`${API_URL}/partners`).then((res) => {
      const data = res.data;
      return Array.isArray(data) ? data : [];
    }).catch((err) => {
      console.error('❌ Error fetching partners:', {
        url: `${API_URL}/partners`,
        error: err.response?.data || err.message,
        status: err.response?.status,
      });
      throw err.response?.data;
    }),
  ]);

  const products = latestProducts?.products;

  return { 
    products: products, 
    blogPosts: blogPosts, 
    partnerLogos: partnerLogos 
  };
}

export default async function Home() {
  let products = [];
  let blogPosts = [];
  let partnerLogos = [];
  let error = null;

  try {
    const data = await getHomeData();
    console.log('🔗 Data:', data);
    products = data.products;
    blogPosts = data.blogPosts;
    partnerLogos = data.partnerLogos;
  } catch (err) {
    error = err;
    console.error('Error loading home page data:', err);
  }

  // const currencyFormatter = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });

  const latestPosts = Array.isArray(blogPosts) ? blogPosts.slice(0, 3) : []; 
  const homeProducts = Array.isArray(products) ? products.slice(0, 3) : [];
  console.log('🔗 Blog Posts:', blogPosts);
  console.log('latestPosts', latestPosts);
  console.log('🔗 Products:', products);  
  console.log('homeProducts', homeProducts);
  

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
            background: 'linear-gradient(180deg, #063C5E 0%, #0B7897 80%)',
            color: 'white',
            pt: { xs: 10, md: 14 },
            pb: { xs: 12, md: 16 },
          }}
        >
          <Container maxWidth="lg">
            <Grid container spacing={6} alignItems="center">
              <Grid item xs={12} md={8}>
                {/* <Chip
                  label="The Scam Survival Kit"
                  sx={{ mb: 3, backgroundColor: 'rgba(255,255,255,0.12)', color: 'white', fontWeight: 600, letterSpacing: 1 }}
                /> */}
                <Box data-aos="fade-right" data-aos-duration="800" data-aos-delay="100">
                  <Typography variant="h1" sx={{ mt: 3,mb: 3, fontSize: { xs: '2rem', md: '3rem', lg: '3rem' }, lineHeight: 1.1, fontWeight: 700, color: 'white' }}>
                    The Scam Survival Kit— Outsmart Scammers Before They Outsmart You.
                  </Typography>
                  <Typography variant="body1" sx={{ fontSize: '1.15rem', maxWidth: 520, mb: 4, opacity: 0.9, color: 'white' }}>
                    A practical learning game that trains care about scam awareness for families, schools, and companies.
                  </Typography>
                </Box>
                <Box data-aos="fade-right" data-aos-duration="800" data-aos-delay="300">
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 5 }}>
                    <Button 
                      component={Link} 
                      href="/shop" 
                      variant="contained" 
                      size="large"
                      sx={{ 
                        backgroundColor: '#063C5E',
                        color: 'white',
                        '&:hover': { backgroundColor: '#052A42' },
                        px: 4,
                        py: 1.5,
                        fontWeight: 600
                      }}
                    >
                      Get Your Kit
                    </Button>
                    <Button
                      component={Link}
                      href="/contact?topic=b2b_demo"
                      variant="contained"
                      size="large"
                      sx={{ 
                        backgroundColor: '#00A4E8',
                        color: 'white',
                        '&:hover': { backgroundColor: '#0088C7' },
                        px: 4,
                        py: 1.5,
                        fontWeight: 600
                      }}
                    >
                      Request D2B Demo
                    </Button>
                  </Stack>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box
                  data-aos="fade-left"
                  data-aos-duration="1000"
                  data-aos-delay="200"
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'relative',
                    minHeight: { xs: 300, md: 400 },
                  }}
                >
                  <Box
                    sx={{
                      width: { xs: 280, md: 360 },
                      height: { xs: 180, md: 230 },
                      background: 'linear-gradient(135deg, #0066CC 0%, #004499 100%)',
                      borderRadius: 3,
                      position: 'relative',
                      boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                      transform: 'perspective(1000px) rotateY(-5deg) rotateX(5deg)',
                      transition: 'all 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'perspective(1000px) rotateY(-5deg) rotateX(5deg) scale(1.05)',
                        boxShadow: '0 24px 72px rgba(0,0,0,0.4)',
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 20,
                        left: 20,
                        right: 20,
                        height: 40,
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: 2,
                      },
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: 20,
                        left: 20,
                        right: 20,
                        height: 3,
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: -15,
                        right: -15,
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        background: '#FFD700',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 20px rgba(255,215,0,0.5)',
                        zIndex: 2,
                      }}
                    >
                      <Box
                        component="svg"
                        width="30"
                        height="30"
                        viewBox="0 0 24 24"
                        fill="none"
                        sx={{ color: '#000' }}
                      >
                        <path
                          d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
                          fill="currentColor"
                        />
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>
        <Container    data-aos="zoom-in"
                data-aos-duration="800"
                data-aos-delay="200" maxWidth="lg" sx={{ mt: -15 }}>
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
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'white', mb: 2, lineHeight: 1.5 }}>
                  Cybercrime costs Germany €206 billion annually—and 85% of it starts with a human click *
                </Typography>
                <Typography variant="body1" sx={{ color: 'white', opacity: 0.95 }}>
                  Source: Bitkom e.V. Wirtschafts-schutzbericht 2016.
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
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'white', mb: 2, fontSize: '1.1rem' }}>
                  How Konfydence Fixes it
                </Typography>
                <Stack spacing={1.5}>
                  {['Fun and engaging', 'Accessible for all ages', 'Proven learning method'].map((item) => (
                    <Typography key={item} variant="body1" sx={{ color: 'white', display: 'flex', alignItems: 'flex-start', gap: 1, fontSize: '1rem' }}>
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

        <Box sx={{ py: 12, position: 'relative', overflow: 'hidden' }}>
          <Container        data-aos="zoom-in"
                 data-aos-duration="800"
                data-aos-delay="100" maxWidth="lg">
            <Box data-aos="zoom-in" data-aos-duration="800">
              <Typography 
                variant="h2" 
                textAlign="center" 
                sx={{ 
                  mb: 8,
                  fontSize: { xs: '2rem', md: '3rem' },
                  fontWeight: 700,
                  color: '#063C5E',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                Our Products
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
                <Grid container spacing={4} sx={{ alignItems: 'stretch', mb: 4 }}>
                  {homeProducts.map((product, index) => (
                    <Grid item xs={12} md={4} key={product._id}>
                      <ProductCard product={product} delay={index * 150} />
                    </Grid>
                  ))}
              </Grid>
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

        <Box sx={{ py: 10, backgroundColor: '#E9F4FF' }}>
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
        </Box>
      </Box>
{/* 
        <Box sx={{ py: 8 }}>
          <Container maxWidth="lg">
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={6}>
                <Card 
                  sx={{ 
                    borderRadius: 4, 
                    height: '100%',
                    transition: 'all 0.3s ease-in-out',
                    transform: 'translateY(0)',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-8px) scale(1.02)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    },
                  }}
                >
                  <CardContent>
                    <Typography variant="overline" sx={{ letterSpacing: 4, color: 'text.secondary' }}>
                      Compliance Experts
                    </Typography>
                    <Typography variant="h4" sx={{ mb: 2 }}>
                      Developed with educators. Trusted by compliance teams.
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                      Every kit is crafted with input from security strategists, behavioural scientists, and school leaders.
                    </Typography>
                    <Stack spacing={2}>
                      {[
                        'Behavioral design backed by real scam scripts',
                        'Guided storylines for private users, schools, businesses',
                        'Plug-and-play activities for 60-minute sessions',
                      ].map((item) => (
                        <Stack direction="row" spacing={1.5} alignItems="center" key={item}>
                          <SecurityOutlined fontSize="small" color="primary" />
                          <Typography variant="body2">{item}</Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card 
                  sx={{ 
                    p: 3, 
                    borderRadius: 4,
                    transition: 'all 0.3s ease-in-out',
                    transform: 'translateY(0)',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-8px) scale(1.02)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    },
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                    <Avatar sx={{ width: 56, height: 56 }}>
                      {(settings?.founderName || 'TM')[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {settings?.founderName || 'T. Mbanwie'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Founder & Chief Trust Officer
                      </Typography>
                    </Box>
                  </Stack>
                  <Typography variant="h5" sx={{ fontStyle: 'italic', mb: 2 }}>
                    “Prevention is the strongest protection.”
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Built in partnership with CoMaSy and educational networks to help people recognise scams faster than they appear.
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </Container>
        </Box> */}

        {/* <Box sx={{ py: 10, backgroundColor: 'background.default' }}>
          <Container maxWidth="lg">
            <Typography variant="h2" textAlign="center" gutterBottom>
              Trusted by educators, HR directors, and families
            </Typography>
            <Typography variant="body1" textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
              Proof points from pilots, corporate rollouts, and multi-generational households.
            </Typography>
            <Grid container spacing={4}>
              {testimonialList.map((testimonial) => (
                <Grid item xs={12} md={4} key={testimonial._id}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      transition: 'all 0.3s ease-in-out',
                      transform: 'translateY(0)',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'translateY(-8px) scale(1.02)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                      },
                    }}
                  >
                    <CardContent>
                      <Typography variant="body1" sx={{ fontStyle: 'italic', mb: 3 }}>
                        “{testimonial.quote}”
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>{testimonial.name[0]}</Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {testimonial.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {testimonial.role}, {testimonial.organization}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            <Stack direction="row" spacing={4} justifyContent="center" sx={{ mt: 6 }} flexWrap="wrap" rowGap={2}>
              {['Bitkom', 'Verbraucherzentrale', 'EU Cybersecurity Week'].map((logo) => (
                <Typography key={logo} variant="subtitle1" sx={{ opacity: 0.7 }}>
                  {logo}
                </Typography>
              ))}
            </Stack>
          </Container>
        </Box> */}

        {/* <Box sx={{ py: 8, backgroundColor: '#F6FAFF' }}>
          <Container maxWidth="lg">
            <Chip label="Konfydence Journal" color="secondary" sx={{ mb: 2 }} />
            <Typography variant="h3" textAlign="center" sx={{ mb: 2 }}>
              Latest insights
            </Typography>
            <Typography variant="body1" textAlign="center" color="text.secondary" sx={{ mb: 5, maxWidth: 720, mx: 'auto' }}>
              Guides for families, schools, and compliance teams navigating today’s threat landscape.
            </Typography>
            <Grid container spacing={4}>
              {latestPosts.map((post) => (
                <Grid item xs={12} md={4} key={post._id}>
                  <BlogCard post={post} />
                </Grid>
              ))}
            </Grid>
            <Box textAlign="center" sx={{ mt: 4 }}>
              <Button variant="outlined" component={Link} href="/blog">
                Explore the journal
              </Button>
            </Box>
          </Container>
        </Box> */}
      
      {/* Partner Logos Swiper */}
      {partnerLogos.length > 0 ? (
        <PartnerLogosSwiper partnerLogos={partnerLogos} />
      ) : (
        <Box sx={{ py: 8, textAlign: 'center', backgroundColor: 'white' }}>
          <Typography variant="body1" color="text.secondary">
            Partner logos will appear here once available.
          </Typography>
        </Box>
      )}

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
            Latest Articles
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
          {latestPosts.length === 0 ? (
            <Typography textAlign="center" color="text.secondary">
              No articles yet. Check back soon!
            </Typography>
          ) : (
            <>
              <Grid container spacing={4}>
                {latestPosts.slice(0, 3).map((post, index) => (
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
      <Footer />
    </>
  );
}

