'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import {
  Container,
  Typography,
  Grid,
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Alert,
  Stack,
  Paper,
} from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import axios from 'axios';
import Link from 'next/link';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_URL environment variable is missing!');
}
const API_URL = `${API_BASE_URL}/api`;

export default function SKKPage() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const validateEmail = (email) => {
    const emailRegex = /.+@.+\..+/;
    return emailRegex.test(email);
  };

  const handleDownload = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }
    
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setEmailError('');
    
    try {
      const url = `${API_URL}/newsletter/subscribe`;
      await axios.post(url, {
        email: email.trim(),
        subscriptionType: 'general',
      });
      
      setSnackbar({ 
        open: true, 
        message: 'Thank you! Check your email for the Family Tech Agreement download.', 
        severity: 'success' 
      });
      setEmail('');
      
      window.open('/pdfs/family-tech-agreement.pdf', '_blank');
    } catch (err) {
      console.error('Error submitting email:', err);
      setSnackbar({ 
        open: true, 
        message: err.response?.data?.message || 'Something went wrong. Please try again.', 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

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

  return (
    <>
      <Head>
        <title>Konfydence Skk</title>
      </Head>
      <Header />
      
      {/* Hero Section */}
      <Box sx={{ pt: { xs: 8, md: 10 }, backgroundColor: '#E9F4FF' }}>
        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}     data-aos="zoom-in"
                  data-aos-duration="800">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
            <Typography
              variant="h1"
              sx={{
                  fontSize: { xs: '2rem', md: '3rem', lg: '3.5rem' },
                  fontWeight: 700,
                mb: 2,
                  color: '#063C5E',
                  lineHeight: 1.2,
                }}
              >
                Build Your Family&apos;s Scam Survival Kit
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontSize: { xs: '1.1rem', md: '1.3rem' },
                  fontWeight: 500,
                  mb: 3,
                  color: '#0B7897',
                  lineHeight: 1.6,
                }}
              >
                The fun card game + digital tools that teach everyone to pause under pressure.
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontSize: { xs: '1rem', md: '1.1rem' },
                  fontWeight: 600,
                  // color: '#FF725E',
                  mb: 4,
                }}
              >
                Limited Introductory Pricing – Ends Soon!
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  borderRadius: 3,
                  overflow: 'hidden',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                  position: 'relative',
                }}
              >
                <Swiper
                  modules={[Autoplay, Pagination, Navigation]}
                  spaceBetween={0}
                  slidesPerView={1}
                  autoplay={{
                    delay: 4000,
                    disableOnInteraction: false,
                  }}
                  pagination={{ clickable: true }}
                  navigation
                  style={{
                    '--swiper-pagination-color': '#FFFFFF',
                    '--swiper-navigation-color': '#FFFFFF',
                  }}
                >
                  <SwiperSlide>
                    <Box
                      component="img"
                      src="/images/skk1.jpeg"
                      alt="Scam Survival Kit Lifestyle"
                      sx={{
                        width: '100%',
                        height: 'auto',
                        display: 'block',
                      }}
                    />
                  </SwiperSlide>
                  <SwiperSlide>
                    <Box
                      component="img"
                      src="/images/skk2.jpeg"
                      alt="Scam Survival Kit Product"
                      sx={{
                        width: '100%',
                        height: 'auto',
                        display: 'block',
                      }}
                    />
                  </SwiperSlide>
                  <SwiperSlide>
                    <Box
                      component="img"
                      src="/images/skk3.jpeg"
                      alt="Scam Survival Kit Family"
                      sx={{
                        width: '100%',
                        height: 'auto',
                        display: 'block',
                      }}
                    />
                  </SwiperSlide>
                  <SwiperSlide>
                    <Box
                      component="img"
                      src="/images/skk4.jpeg"
                      alt="Scam Survival Kit Cards"
                      sx={{
                        width: '100%',
                        height: 'auto',
                        display: 'block',
                      }}
                    />
                  </SwiperSlide>
                </Swiper>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Quick Value Section */}
      <Box sx={{ py: { xs: 6, md: 8 }, backgroundColor: '#ffffff' }}>
        <Container maxWidth="lg"     data-aos="zoom-in"
                  data-aos-duration="800">
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '1.75rem', md: '2.5rem' },
                fontWeight: 700,
              mb: 4,
              textAlign: 'center',
                color: '#063C5E',
              }}
            >
            Why Families Love Konfydence
          </Typography>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: { xs: '1rem', md: '1.125rem' },
                    mb: 2,
                    lineHeight: 1.8,
                    color: 'text.primary',
                  }}
                >
                  <strong>80 real-world scenarios.</strong> Practice recognizing scams before they happen.
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: { xs: '1rem', md: '1.125rem' },
                    mb: 2,
                    lineHeight: 1.8,
                    color: 'text.primary',
                  }}
                >
                  <strong>Shared H.A.C.K. language.</strong> A simple framework everyone can remember:
                </Typography>
                <Box component="ul" sx={{ pl: 3, mb: 2 }}>
                  <li>
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: { xs: '1rem', md: '1.125rem' },
                        mb: 1,
                        lineHeight: 1.8,
                      }}
                    >
                      <strong>Hurry:</strong> The artificial deadline.
                    </Typography>
                  </li>
                  <li>
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: { xs: '1rem', md: '1.125rem' },
                        mb: 1,
                        lineHeight: 1.8,
                      }}
                    >
                      <strong>Authority:</strong> The fake boss or official.
                    </Typography>
                  </li>
                  <li>
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: { xs: '1rem', md: '1.125rem' },
                        mb: 1,
                        lineHeight: 1.8,
                      }}
                    >
                      <strong>Comfort:</strong> The &quot;I&apos;m a friend/family&quot; trick.
                    </Typography>
                  </li>
                  <li>
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: { xs: '1rem', md: '1.125rem' },
                        mb: 1,
                        lineHeight: 1.8,
                      }}
                    >
                      <strong>Kill-Switch:</strong> The panic or extreme excitement trigger.
                    </Typography>
                  </li>
                </Box>
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: { xs: '1rem', md: '1.125rem' },
                    mb: 2,
                    lineHeight: 1.8,
                    color: 'text.primary',
                  }}
                >
                  <strong>No-blame conversations.</strong> Learn together without judgment.
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: { xs: '1rem', md: '1.125rem' },
                    mb: 2,
                    lineHeight: 1.8,
                    color: 'text.primary',
                  }}
                >
                  <strong>One habit that stops most scams:</strong> the 5-second pause.
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                    fontSize: { xs: '1rem', md: '1.125rem' },
                    mb: 2,
                    lineHeight: 1.8,
                    // color: '#FF725E',
                    fontWeight: 600,
                  }}
                >
                  Americans lost $12.5 billion to scams last year — protect your loved ones for less than a family dinner out.
            </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography
                variant="body2"
                sx={{
                  fontSize: { xs: '0.875rem', md: '1rem' },
                  mb: 2,
                  lineHeight: 1.6,
                  color: 'text.secondary',
                  fontStyle: 'italic',
                }}
              >
                A simple graphic showing a &quot;Hot Brain&quot; (Emotion/Limbic) reacting to a scam message and a &quot;Cool Brain&quot; (Logic/Prefrontal) pausing for 5 seconds.
              </Typography>
              <Box
                component="img"
                src="/images/skk5.png"
                alt="Hot Brain vs Cool Brain - 5 Second Pause"
                sx={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: 2,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                }}
              />
            </Grid>
          </Grid>
        </Container>
          </Box>

      {/* Product Cards Section */}
      <Box sx={{ py: { xs: 6, md: 8 }, backgroundColor: '#E9F4FF' }}>
        <Container maxWidth="lg"     data-aos="fade-up"
                  data-aos-duration="800">
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '1.75rem', md: '2.5rem' },
              fontWeight: 700,
              mb: 4,
              textAlign: 'center',
              color: '#063C5E',
            }}
          >
           Product Cards
          </Typography>
          <Grid container spacing={4}>
            {/* Physical Scam Survival Kit */}
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 15px 40px rgba(0,0,0,0.2)',
                  },
                }}
              >
                <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                  <Swiper
                    modules={[Autoplay, Pagination]}
                    spaceBetween={0}
                    slidesPerView={1}
                    autoplay={{
                      delay: 3000,
                      disableOnInteraction: false,
                    }}
                    pagination={{ clickable: true }}
                    style={{
                      '--swiper-pagination-color': '#0B7897',
                    }}
                  >
                    <SwiperSlide>
                      <Box
                        component="img"
                        src="/images/skk6.jpeg"
                        alt="Physical Scam Survival Kit"
                        sx={{
                          width: '100%',
                          height: { xs: '250px', md: '300px' },
                          objectFit: 'cover',
                        }}
                      />
                    </SwiperSlide>
                    <SwiperSlide>
                      <Box
                        component="img"
                        src="/images/skk7.jpeg"
                        alt="Scam Survival Kit Cards"
                        sx={{
                          width: '100%',
                          height: { xs: '250px', md: '300px' },
                          objectFit: 'cover',
                        }}
                      />
                    </SwiperSlide>
                    <SwiperSlide>
                      <Box
                        component="img"
                        src="/images/skk8.jpeg"
                        alt="Family Playing Scam Survival Kit"
                        sx={{
                          width: '100%',
                          height: { xs: '250px', md: '300px' },
                          objectFit: 'cover',
                        }}
                      />
                    </SwiperSlide>
                  </Swiper>
                </Box>
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      mb: 2,
                      color: '#063C5E',
                    }}
                  >
                    Physical Scam Survival Kit
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      mb: 2,
                      flexGrow: 1,
                      lineHeight: 1.7,
                      color: 'text.secondary',
                    }}
                  >
                    80 premium cards + H.A.C.K. reference. Instant fun, lifelong habit.
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: '#FF725E',
                        mb: 0.5,
                      }}
                    >
                      Intro Pricing: $49
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        textDecoration: 'line-through',
                      }}
                    >
                      Retail $69
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{
                      backgroundColor: '#0B7897',
                      color: 'white',
                      py: 1.5,
                      fontWeight: 600,
                      '&:hover': {
                        backgroundColor: '#063C5E',
                      },
                    }}
                  >
                    Add to Cart →
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Digital Family Extension */}
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 15px 40px rgba(0,0,0,0.2)',
                  },
                }}
              >
                <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                  <Swiper
                    modules={[Autoplay, Pagination]}
                    spaceBetween={0}
                    slidesPerView={1}
                    autoplay={{
                      delay: 3000,
                      disableOnInteraction: false,
                    }}
                    pagination={{ clickable: true }}
                    style={{
                      '--swiper-pagination-color': '#0B7897',
                    }}
                  >
                    <SwiperSlide>
                      <Box
                        component="img"
                        src="/images/skk10.png"
                        alt="Digital Family Extension App"
                        sx={{
                          width: '100%',
                          height: { xs: '250px', md: '300px' },
                          objectFit: 'cover',
                          backgroundColor: '#f5f5f5',
                        }}
                      />
                    </SwiperSlide>
                    <SwiperSlide>
                      <Box
                        component="img"
                        src="/images/skk11.png"
                        alt="Digital Family Extension Features"
                        sx={{
                          width: '100%',
                          height: { xs: '250px', md: '300px' },
                          objectFit: 'cover',
                          backgroundColor: '#f5f5f5',
                        }}
                      />
                    </SwiperSlide>
                  </Swiper>
            </Box>
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      mb: 2,
                      color: '#063C5E',
                    }}
                  >
                    Digital Family Extension
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      mb: 2,
                      flexGrow: 1,
                      lineHeight: 1.7,
                      color: 'text.secondary',
                    }}
                  >
                    New scenarios, progress tracking, printables (annual subscription).
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: '#FF725E',
                        mb: 0.5,
                      }}
                    >
                      Intro Pricing: $29/year
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        textDecoration: 'line-through',
                      }}
                    >
                      Later $39
                    </Typography>
          </Box>
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{
                      backgroundColor: '#0B7897',
                      color: 'white',
                      py: 1.5,
                      fontWeight: 600,
                      '&:hover': {
                        backgroundColor: '#063C5E',
                      },
                    }}
                  >
                    Subscribe Now →
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Best Value: Full Bundle */}
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  boxShadow: '0 15px 40px rgba(6,60,94,0.3)',
                  border: '3px solid #FF725E',
                  position: 'relative',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 20px 50px rgba(6,60,94,0.4)',
                  },
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    backgroundColor: '#FF725E',
                    color: 'white',
                    px: 2,
                    py: 0.5,
                    borderRadius: 2,
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    zIndex: 1,
                  }}
                >
                  BEST VALUE
                </Box>
                <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                  <Box
                    component="img"
                    src="/images/skk13.jpeg"
                    alt="Full Bundle - Physical Kit + Digital"
                    sx={{
                      width: '100%',
                      height: { xs: '250px', md: '300px' },
                      objectFit: 'cover',
                    }}
                  />
            </Box>
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      mb: 2,
                      color: '#063C5E',
                    }}
                  >
                    Full Bundle
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      mb: 2,
                      flexGrow: 1,
                      lineHeight: 1.7,
                      color: 'text.secondary',
                    }}
                  >
                    Physical Kit + 1-Year Digital + Free Family Tech Contract.
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: '#FF725E',
                        mb: 0.5,
                      }}
                    >
                      Intro Pricing: $69
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#063C5E',
                        fontWeight: 600,
                      }}
                    >
                      Save $9 – Retail $89
              </Typography>
            </Box>
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{
                      backgroundColor: '#FF725E',
                      color: 'white',
                      py: 1.5,
                      fontWeight: 600,
                      '&:hover': {
                        backgroundColor: '#e65a4a',
                      },
                    }}
                  >
                    Get Bundle Now →
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Download Section */}
      {/* <Box sx={{ py: { xs: 6, md: 8 }, backgroundColor: '#ffffff' }}>
        <Container maxWidth="md"     data-aos="zoom-in"
                  data-aos-duration="800">
          <Paper
            elevation={3}
            sx={{
              p: { xs: 4, md: 6 },
              borderRadius: 3,
              backgroundColor: '#E9F4FF',
              textAlign: 'center',
            }}
          >
                        <Typography 
                          variant="h3" 
                          sx={{ 
                fontSize: { xs: '1.75rem', md: '2.25rem' },
                fontWeight: 700,
                            mb: 2,
                            color: '#063C5E',
                          }}
                        >
              Start Free: Download Our Family Tech Agreement
                        </Typography>
            <Typography
                          variant="body1" 
                          sx={{ 
                fontSize: { xs: '1rem', md: '1.125rem' },
                            mb: 4,
                lineHeight: 1.7,
                            color: 'text.secondary',
                          }}
                        >
              No-blame rules to open conversations today.
            </Typography>
            <Box
              component="form"
              onSubmit={handleDownload}
              sx={{
                maxWidth: '500px',
                mx: 'auto',
              }}
            >
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError('');
                  }}
                  error={!!emailError}
                  helperText={emailError}
                  sx={{
                    display: 'none',
                    backgroundColor: 'white',
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#0B7897',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#0B7897',
                      },
                    },
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  sx={{
                    backgroundColor: '#0B7897',
                    color: 'white',
                    py: 1.5,
                    fontWeight: 600,
                    fontSize: '1rem',
                    '&:hover': {
                      backgroundColor: '#063C5E',
                    },
                  }}
                >
                  {loading ? 'Processing...' : 'Download Instantly →'}
                </Button>
              </Stack>
                      </Box>
            {snackbar.open && (
              <Alert
                severity={snackbar.severity}
                onClose={handleCloseSnackbar}
                sx={{ mt: 3 }}
              >
                {snackbar.message}
              </Alert>
            )}
          </Paper>
        </Container>
      </Box> */}

      {/* Bottom Close & Conversion Section */}
      {/* <Box sx={{ py: { xs: 6, md: 8 }, backgroundColor: '#063C5E', color: 'white' }}>
        <Container maxWidth="lg"     data-aos="fade-up"
                  data-aos-duration="800">
          <Box sx={{ textAlign: 'center' }}>
                        <Typography 
                          variant="h3" 
                          sx={{ 
                            fontSize: { xs: '1.75rem', md: '2.5rem' },
                            fontWeight: 700,
                mb: 3,
                color: 'white',
              }}
            >
              Still Have Questions? Let&apos;s Talk.
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '1rem', md: '1.125rem' },
                mb: 4,
                lineHeight: 1.8,
                color: 'rgba(255,255,255,0.9)',
                maxWidth: '800px',
                mx: 'auto',
              }}
            >
              We&apos;re real people building real habits—reach out anytime.
                        </Typography>
            <Grid container spacing={2} justifyContent="center" sx={{ mt: 2 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  component={Link}
                  href="/shop"
                  variant="contained"
                  fullWidth
                  sx={{
                    backgroundColor: '#FF725E',
                    color: 'white',
                    py: 1.5,
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: '#e65a4a',
                    },
                  }}
                >
                  Families → Get Your Kit
                </Button>
                            </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  component={Link}
                  href="/education"
                  variant="contained"
                  fullWidth
                  sx={{
                    backgroundColor: '#0B7897',
                    color: 'white',
                    py: 1.5,
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: '#063C5E',
                    },
                  }}
                >
                  Schools → Free Resources
                </Button>
                            </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  component={Link}
                  href="/comasy"
                  variant="contained"
                  fullWidth
                  sx={{
                    backgroundColor: '#0B7897',
                    color: 'white',
                    py: 1.5,
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: '#063C5E',
                    },
                  }}
                >
                  Business → Request Demo
                </Button>
                        </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  component={Link}
                  href="/contact"
                  variant="outlined"
                  fullWidth
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    py: 1.5,
                    fontWeight: 600,
                    '&:hover': {
                      borderColor: '#FF725E',
                      backgroundColor: 'rgba(255, 114, 94, 0.1)',
                    },
                  }}
                >
                  Contact Us →
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box> */}

      <Footer />
    </>
  );
}
