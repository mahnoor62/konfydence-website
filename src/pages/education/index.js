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
  Tabs,
  Tab,
} from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_URL environment variable is missing!');
}
const API_URL = `${API_BASE_URL}/api`;

export default function EducationPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    institution: '',
    email: '',
    studentStaffSize: '',
    message: '',
  });
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    institution: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [activeTab, setActiveTab] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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

  const validateEmail = (email) => {
    const emailRegex = /.+@.+\..+/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = {
      firstName: '',
      lastName: '',
      institution: '',
      email: '',
    };
    let isValid = true;

    if (!formData.firstName || !formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
      isValid = false;
    }

    if (!formData.lastName || !formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
      isValid = false;
    }

    if (!formData.institution.trim()) {
      newErrors.institution = 'Institution is required';
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setSnackbar({ open: true, message: 'Please fill in all required fields correctly.', severity: 'error' });
      return;
    }

    setLoading(true);
    try {
      const url = `${API_URL}/contact`;
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        organization: formData.institution.trim(),
        company: formData.institution.trim(),
        topic: 'education',
        studentStaffSize: formData.studentStaffSize.trim() || '',
        message: formData.message.trim() || '',
        formSource: 'b2e_form', // Set formSource for Education page
      };
      await axios.post(url, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      setSnackbar({ open: true, message: 'Thank you! We will contact you soon.', severity: 'success' });
      setFormData({ firstName: '', lastName: '', institution: '', email: '', studentStaffSize: '', message: '' });
      setErrors({ firstName: '', lastName: '', institution: '', email: '' });
    } catch (error) {
      console.error('Error submitting form:', error);
      const errorMessage = error.response?.data?.errors?.[0]?.msg || error.response?.data?.message || error.message || 'Error submitting form. Please try again.';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <Box component="main" sx={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
        {/* Hero Section */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #063C5E 0%, #0B7897 100%)',
            color: 'white',
            pt: { xs: 12, md: 16 },
            pb: { xs: 8, md: 12 },
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Container maxWidth="lg"     data-aos="zoom-in"
                  data-aos-duration="800">
            <Grid container spacing={6} alignItems="center" sx={{py:{xs:5,md:10}}}>
              <Grid item xs={12} md={6}>
                <Typography
                  variant="h4"
                  sx={{
                    // fontSize: { xs: '2rem', md: '2rem' },
                    fontWeight: 700,
                    mb: 3,
                    lineHeight: 1.2,
                    color: 'white',
                  }}
                >
                  Empower Students to Pause Under Pressure
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    // fontSize: { xs: '1.25rem', md: '1.5rem' },
                    fontWeight: 600,
                    mb: 2,
                    color: 'white',
                  }}
                >
                  Interactive tools and workshops that teach young people to spot scam tricks early—building real confidence for life online.
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    // fontSize: { xs: '1rem', md: '1.125rem' },
                    mb: 2,
                    color: 'white',
                    lineHeight: 1.8,
                  }}
                >
                 Designed for classrooms, clubs, orientation weeks, and leadership programs.
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: { xs: '1rem', md: '.9rem' },
                    mb: 4,
                    color: 'white',
                    lineHeight: 1.8,
                  }}
                >
                 No lectures. Just fun simulations and group activities that train a simple, powerful habit:
                 pause for five seconds when H.A.C.K. signals appear.
                </Typography>
                <Stack 
                  direction={{ xs: 'column', md: 'row' }}
                  spacing={{ xs: 2, md: 2 }}
                  sx={{
                    flexWrap: 'wrap',
                  }}
                >
                  <Button
                    component={Link}
                    href="/free-resources"
                    variant="contained"
                    size="large"
                    sx={{
                      backgroundColor: '#FFFFFF',
                      color: '#063C5E',
                      px: { xs: 2.5, sm: 3, md: 3.5 },
                      py: { xs: 1.25, md: 1.5 },
                      fontSize: { xs: '0.875rem', sm: '0.95rem', md: '1rem' },
                      fontWeight: 600,
                      borderRadius: 2,
                      textTransform: 'none',
                      whiteSpace: 'nowrap',
                      '&:hover': {
                        backgroundColor: '#F5F5F5',
                        transform: 'translateX(5px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Download Free Lesson Pack
                  </Button>
                  <Button
                    component="a"
                    href="#pilot-form"
                    variant="outlined"
                    size="large"
                    sx={{
                      borderColor: '#FFFFFF',
                      color: '#FFFFFF',
                      px: { xs: 2.5, sm: 3, md: 3.5 },
                      py: { xs: 1.25, md: 1.5 },
                      fontSize: { xs: '0.875rem', sm: '0.95rem', md: '1rem' },
                      fontWeight: 600,
                      borderRadius: 2,
                      textTransform: 'none',
                      whiteSpace: 'nowrap',
                      '&:hover': {
                        borderColor: '#F5F5F5',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        transform: 'translateX(5px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Request Free Demo
                  </Button>
                </Stack>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    borderRadius: 3,
                    overflow: 'hidden',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
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
                        src="/images/education1.jpg"
                        alt="Students learning digital safety"
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
                        src="/images/education2.jpeg"
                        alt="Interactive workshop"
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
                        src="/images/education3.jpeg"
                        alt="Students engaged in activities"
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

        {/* Why Most Awareness Programs Fail Section */}
        <Box sx={{ py: { xs: 8, md: 12 }, backgroundColor: '#ffffff' }}>
          <Container maxWidth="lg" data-aos="fade-out" data-aos-duration="800">
            {/* Main Heading */}
            <Typography
              variant="h3"
              sx={{
                // fontSize: { xs: '2rem', md: '2.5rem', lg: '3rem' },
                fontWeight: 700,
                mb: 2,
                textAlign: 'center',
                color: '#063C5E',
              }}
            >
              Why Most Awareness Programs Fail
            </Typography>
            
            {/* Subtitle */}
            <Typography
              variant="body1"
              sx={{
                // fontSize: { xs: '1.25rem', md: '1.5rem' },
                fontWeight: 600,
                mb: 4,
                textAlign: 'center',
                color: '#063C5E',
              }}
            >
              Because watching Videos And Taking Quizzes Aren&apos;t Enough
            </Typography>

            {/* Text Boxes Row - 2 Columns */}
            <Grid container spacing={4} sx={{ mb: 6 }}>
              <Grid item xs={12} md={6}>
                <Paper
                  sx={{
                    p: 3,
                    border: '2px solid #0B7897',
                    borderRadius: 2,
                    height: '100%',
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      // fontSize: { xs: '1rem', md: '1.125rem' },
                      mb: 2,
                      lineHeight: 1.8,
                      color: 'text.primary',
                    }}
                  >
                    Students watch, pass the test... and still click months later. Scams strike when rushed or stressed—triggering the{' '}
                    {/* <Link 
                      href="/pdfs/the-limbic-hijack.pdf" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ 
                        color: '#0B7897', 
                        textDecoration: 'underline',
                        fontWeight: 600,
                      }}
                    > */}
                      limbic hijack
                    {/* </Link>
                    {' '} */}
                    before logic kicks in.
                  </Typography>
                  <Link 
                    href="/pdfs/the-limbic-hijack.pdf" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ 
                      color: '#0B7897', 
                      textDecoration: 'none',
                      fontWeight: 600,
                      fontSize: '1rem',
                    }}
                    onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                    onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                  >
                    Read the Science: Why Human Hardware Fails First →
                  </Link>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper
                  sx={{
                    p: 3,
                    border: '2px solid #0B7897',
                    borderRadius: 2,
                    height: '100%',
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      // fontSize: { xs: '1rem', md: '1.125rem' },
                      lineHeight: 1.8,
                      color: 'text.primary',
                      fontWeight: 600,
                    }}
                  >
                    Konfydence trains the habit that works under pressure: Pause for 5 seconds when something feels off.
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Connecting Text */}
            <Typography
              variant="body2"
              sx={{
                fontSize: { xs: '0.9rem', md: '1rem' },
                lineHeight: 1.8,
                color: 'text.secondary',
                fontStyle: 'italic',
                textAlign: 'center',
                mb: 6,
              }}
            >
              Most cyber attacks don&apos;t need advanced hacking—they succeed through manipulation when people are under pressure.
            </Typography>

            {/* Images Row - 2 Columns with Headings */}
            <Grid container spacing={4} sx={{ alignItems: 'stretch' }}>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      mb: 2,
                      color: '#063C5E',
                      textAlign: 'center',
                    }}
                  >
                    The Scammer Mindset
                  </Typography>
                  <Box
                    component="img"
                    src="/images/full.JPG"
                    alt="The Scammer Mindset"
                    sx={{
                      width: '100%',
                      height: { xs: 'auto', md: '500px' },
                      objectFit: 'contain',
                    }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      mb: 2,
                      color: '#063C5E',
                      textAlign: 'center',
                    }}
                  >
                    How to stop Them - The 5 Seconds Pause
                  </Typography>
                  <Box
                    component="img"
                    src="/images/5SecondsDefense.jpg"
                    alt="YOUR 5 SECOND DEFENSE"
                    sx={{
                      width: '100%',
                      // borderRadius: 5,
                      height: { xs: 'auto', md: '500px' },
                      objectFit: 'contain',
                    }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* Free & Premium Tools Section */}
        <Box sx={{ py: { xs: 8, md: 12 }, backgroundColor: '#F6F8FA' }}>
          <Container maxWidth="lg">
            <Typography
              variant="h2"
              data-aos="fade-down"
              data-aos-duration="800"
              sx={{
                fontSize: { xs: '2rem', md: '2.5rem', lg: '3rem' },
                fontWeight: 700,
                mb: 5,
                textAlign: 'center',
                color: '#063C5E',
              }}
            >
              Free & Premium Tools
            </Typography>
            {/* <Typography
              variant="h4"
              data-aos="fade-down"
              data-aos-duration="800"
              data-aos-delay="100"
              sx={{
                fontSize: { xs: '1.25rem', md: '1.5rem' },
                fontWeight: 600,
                mb: 6,
                textAlign: 'center',
                color: '#063C5E',
              }}
            >
              Tools That Fit Your Classroom or Campus
            </Typography> */}
            
            <Grid container spacing={4} sx={{ mb: 8 }}>
              {/* Free Starter Pack */}
              <Grid item xs={12} md={6}>
                <Card
                  data-aos="fade-right"
                  data-aos-duration="800"
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    border: '3px solid #0B7897',
                    backgroundColor: '#ffffff',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: '100%',
                      height: { xs: 250, md: 300 },
                      overflow: 'hidden',
                      position: 'relative',
                    }}
                  >
                    <Box
                      component="img"
                      src="/images/education4.jpeg"
                      alt="Free Starter Pack"
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease',
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        backgroundColor: '#FFC107',
                        color: '#000000',
                        px: 2,
                        py: 0.5,
                        borderRadius: 2,
                        fontSize: '0.875rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                      }}
                    >
                      Free
                    </Box>
                  </Box>
                  <CardContent sx={{ p: 4 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        mb: 2,
                        color: '#063C5E',
                      }}
                    >
                      Tools That Fit Your Classroom or Campus
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: 'text.secondary',
                        lineHeight: 1.7,
                        mb: 3,
                      }}
                    >
                      Downloadable lesson plans, workshop guides, and card game adaptations. Ready-to-use activities teaching H.A.C.K. and pause drills.
                    </Typography>
                    <Button
                      component={Link}
                      href="/free-resources"
                      variant="contained"
                      fullWidth
                      sx={{
                        backgroundColor: '#0B7897',
                        color: 'white',
                        py: 1.5,
                        fontWeight: 600,
                        textTransform: 'none',
                        '&:hover': {
                          backgroundColor: '#063C5E',
                        },
                      }}
                    >
                      Download Free Now →
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              {/* Full Workshop & Simulation Kit */}
              <Grid item xs={12} md={6}>
                <Card
                  data-aos="fade-left"
                  data-aos-duration="800"
                  data-aos-delay="100"
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    backgroundColor: '#ffffff',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: '100%',
                      height: { xs: 250, md: 300 },
                      overflow: 'hidden',
                      backgroundColor: '#F6F8FA',
                    }}
                  >
                    <Box
                      component="img"
                      src="/images/education5.png"
                      alt="Full Workshop & Simulation Kit"
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                      onError={(e) => {
                        if (e.target.src.includes('.png')) {
                          e.target.src = '/images/education5.jpeg';
                        }
                      }}
                    />
                  </Box>
                  <CardContent sx={{ p: 4 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        mb: 2,
                        color: '#063C5E',
                      }}
                    >
                      Full Workshop & Simulation Kit
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: 'text.secondary',
                        lineHeight: 1.7,
                        mb: 3,
                      }}
                    >
                      Unlimited digital access for students + facilitator reports. Customizable for clubs, orientation, or full courses. Track habit-building progress.
                    </Typography>
                    <Button
                      component="a"
                      href="#pilot-form"
                      variant="contained"
                      fullWidth
                      sx={{
                        backgroundColor: '#0B7897',
                        color: 'white',
                        py: 1.5,
                        fontWeight: 600,
                        textTransform: 'none',
                        '&:hover': {
                          backgroundColor: '#063C5E',
                        },
                      }}
                    >
                      Request Free Demo →
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Card Game Integration */}
            {/* <Box sx={{ mb: 8 }} data-aos="fade-up" data-aos-duration="800">
              <Grid container spacing={4} alignItems="center">
                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      width: '100%',
                      height: { xs: 250, md: 300 },
                      overflow: 'hidden',
                      borderRadius: 3,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                      transition: 'transform 0.3s, box-shadow 0.3s',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                      },
                    }}
                  >
                    <Box
                      component="img"
                      src="/images/education6.jpeg"
                      alt="Card Game Integration"
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      mb: 3,
                      color: '#063C5E',
                    }}
                  >
                    Card Game Integration
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: { xs: '1rem', md: '1.125rem' },
                      lineHeight: 1.8,
                      color: 'text.primary',
                    }}
                  >
                    Adapt our family card game for group play—spot real scenarios together.
                  </Typography>
                </Grid>
              </Grid>
            </Box> */}

            {/* Trust Elements */}
            {/* <Box sx={{ textAlign: 'center' }} data-aos="fade-up" data-aos-duration="800">
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  color: '#063C5E',
                }}
              >
                Trust Elements
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  mb: 4,
                }}
              >
                Aligned with education standards + privacy-focused
              </Typography>
              <Grid container spacing={4} justifyContent="center">
                <Grid item xs={12} sm={6} md={5}>
                  <Box
                    data-aos="fade-right"
                    data-aos-duration="800"
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        mb: 2,
                        color: '#063C5E',
                        textAlign: 'center',
                      }}
                    >
                      Education Standards
                    </Typography>
                    <Box
                      sx={{
                        borderRadius: 3,
                        overflow: 'hidden',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                        transition: 'transform 0.3s, box-shadow 0.3s',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                        },
                      }}
                    >
                      <Box
                        component="img"
                        src="/images/education7.jpeg"
                        alt="Education Standards"
                        sx={{
                          width: '100%',
                          height: 'auto',
                          display: 'block',
                        }}
                      />
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={5}>
                  <Box
                    data-aos="fade-left"
                    data-aos-duration="800"
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        mb: 2,
                        color: '#063C5E',
                        textAlign: 'center',
                      }}
                    >
                      Privacy Focused
                    </Typography>
                    <Box
                      sx={{
                        borderRadius: 3,
                        overflow: 'hidden',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                        transition: 'transform 0.3s, box-shadow 0.3s',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                        },
                      }}
                    >
                      <Box
                        component="img"
                        src="/images/education8.jpeg"
                        alt="Privacy Focused"
                        sx={{
                          width: '100%',
                          height: 'auto',
                          display: 'block',
                        }}
                      />
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Box> */}
          </Container>
        </Box>

        {/* Social Proof & Impact Section */}
        <Box sx={{ py: { xs: 8, md: 12 }, backgroundColor: '#ffffff' }}>
          <Container maxWidth="lg" >
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2rem', md: '2.5rem', lg: '3rem' },
                fontWeight: 700,
                mb: 6,
                textAlign: 'center',
                color: '#063C5E',
              }}
            >
              Already Making Campuses Safer
            </Typography>
            
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Card
                    data-aos="fade-right"
                  data-aos-duration="800"
                  sx={{
                    height: '100%',
                    p: 4,
                    backgroundColor: '#E9F4FF',
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  }}
                >
                  <Box sx={{ display: 'flex', gap: 0.5, mb: 2, justifyContent: 'center' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Box
                        key={star}
                        component="span"
                        sx={{
                          color: '#FFB800',
                          fontSize: '1.5rem',
                        }}
                      >
                        ★
                      </Box>
                    ))}
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontStyle: 'italic',
                      textAlign: 'center',
                      mb: 3,
                      color: '#063C5E',
                      lineHeight: 1.7,
                    }}
                  >
                    &ldquo;Engaging and effective—students actually remember the pause habit.&rdquo;
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      textAlign: 'center',
                      fontWeight: 600,
                      color: '#063C5E',
                    }}
                  >
                    — University Orientation Director
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    width: '100%',
                    height: { xs: 300, md: 400 },
                    borderRadius: 3,
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                    },
                  }}
                >
                  <Box
                    component="img"
                    src="/images/education9.jpeg"
                    alt="Group facilitation"
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.1)',
                      },
                    }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* Pilot Request Form */}
        <Box
          id="pilot-form"
          sx={{
            py: { xs: 8, md: 12 },
            backgroundColor: '#F6F8FA',
          }}
        >
          <Container maxWidth="md"     data-aos="zoom-in"
                  data-aos-duration="800">
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2rem', md: '2.5rem', lg: '3rem' },
                fontWeight: 700,
                mb: 2,
                textAlign: 'center',
                color: '#063C5E',
              }}
            >
              Start with a Free Pilot for Your School/University
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontSize: { xs: '1rem', md: '1.125rem' },
                mb: 5,
                textAlign: 'center',
                color: 'text.secondary',
              }}
            >
              See the tools in action—no commitment. We&apos;ll tailor activities and reports to your needs.
            </Typography>

            {/* Success/Error Message */}
            {snackbar.open && (
              <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
                <Alert 
                  severity={snackbar.severity}
                  onClose={() => setSnackbar({ ...snackbar, open: false })}
                  sx={{
                    maxWidth: 600,
                    width: '100%',
                    borderRadius: 2,
                    fontSize: '1rem',
                  }}
                >
                  {snackbar.message}
                </Alert>
              </Box>
            )}

            <Paper
              sx={{
                p: { xs: 3, md: 5 },
                borderRadius: 3,
                boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
              }}
            >
              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      required
                      value={formData.firstName}
                      onChange={(e) => {
                        setFormData({ ...formData, firstName: e.target.value });
                        if (errors.firstName) setErrors({ ...errors, firstName: '' });
                      }}
                      error={!!errors.firstName}
                      helperText={errors.firstName}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      required
                      value={formData.lastName}
                      onChange={(e) => {
                        setFormData({ ...formData, lastName: e.target.value });
                        if (errors.lastName) setErrors({ ...errors, lastName: '' });
                      }}
                      error={!!errors.lastName}
                      helperText={errors.lastName}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Institution"
                      required
                      value={formData.institution}
                      onChange={(e) => {
                        setFormData({ ...formData, institution: e.target.value });
                        if (errors.institution) setErrors({ ...errors, institution: '' });
                      }}
                      error={!!errors.institution}
                      helperText={errors.institution}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        if (errors.email) setErrors({ ...errors, email: '' });
                      }}
                      error={!!errors.email}
                      helperText={errors.email}
                    />
                  </Grid>
                  <Grid item xs={12} sm={12}>
                    <TextField
                      fullWidth
                      label="Student/Staff Size"
                      value={formData.studentStaffSize}
                      onChange={(e) => setFormData({ ...formData, studentStaffSize: e.target.value })}
                      placeholder="e.g., 500-1000 students"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Message"
                      multiline
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us about your needs..."
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      fullWidth
                      disabled={loading}
                      sx={{
                        backgroundColor: '#0B7897',
                        color: 'white',
                        py: 1.5,
                        fontSize: '1.125rem',
                        fontWeight: 600,
                        borderRadius: 2,
                        textTransform: 'none',
                        '&:hover': {
                          backgroundColor: '#063C5E',
                        },
                      }}
                    >
                      {loading ? 'Submitting...' : 'Submit Request'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Container>
        </Box>

        {/* Motivational Close */}
        <Box
          sx={{
            py: { xs: 8, md: 12 },
            background: 'linear-gradient(135deg, #063C5E 0%, #0B7897 100%)',
            color: 'white',
          }}
        >
          <Container maxWidth="lg"     data-aos="zoom-in"
                  data-aos-duration="800">
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2rem', md: '2.5rem', lg: '3rem' },
                fontWeight: 700,
                mb: 3,
                textAlign: 'center',
                lineHeight: 1.2,
              }}
            >
              Stop Training for the Quiz. Start Training for the Pause.
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '1rem', md: '1.25rem' },
                mb: 5,
                textAlign: 'center',
                maxWidth: 800,
                mx: 'auto',
                lineHeight: 1.8,
                color: 'white',
              }}
            >
              Young people face sophisticated scams daily. Five seconds of pause is their strongest defense. Join schools and universities building this habit early.
            </Typography>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={3}
              justifyContent="center"
              alignItems="center"
            >
              <Button
                component={Link}
                href="/free-resources"
                variant="contained"
                size="large"
                sx={{
                  backgroundColor: '#FFFFFF',
                  color: '#063C5E',
                  px: { xs: 4, md: 5 },
                  py: { xs: 1.5, md: 2 },
                  fontSize: { xs: '1rem', md: '1.125rem' },
                  fontWeight: 600,
                  borderRadius: 2,
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: '#F5F5F5',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Download Free Resources
              </Button>
              <Button
                component="a"
                href="#pilot-form"
                variant="outlined"
                size="large"
                sx={{
                  borderColor: '#FFFFFF',
                  color: '#FFFFFF',
                  px: { xs: 4, md: 5 },
                  py: { xs: 1.5, md: 2 },
                  fontSize: { xs: '1rem', md: '1.125rem' },
                  fontWeight: 600,
                  borderRadius: 2,
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: '#F5F5F5',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Request Pilot
              </Button>
            </Stack>
          </Container>
        </Box>
      </Box>
      <Footer />
    </>
  );
}
