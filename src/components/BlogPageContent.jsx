'use client';

import { Container, Typography, Grid, Box, Button, Stack, Chip, TextField, Paper, Card, CardContent, CardMedia } from '@mui/material';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import SearchIcon from '@mui/icons-material/Search';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BlogCard from '@/components/BlogCard';
import PaginationControls from '@/components/PaginationControls';
import ErrorDisplay from '@/components/ErrorDisplay';
import LoadingState from '@/components/LoadingState';
import axios from 'axios';

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

const BLOGS_PER_PAGE = 12;

const CATEGORY_CHIPS = [
  { label: 'All', value: 'all' },
  { label: 'For Families', value: 'for-families' },
  { label: 'For Schools', value: 'for-schools' },
  { label: 'For Organizations', value: 'for-companies' },
  { label: 'How-To', value: 'how-to' },
  { label: 'Auditors', value: 'auditors' },
  { label: 'Latest Scams', value: 'latest-scams' },
];

const CATEGORY_COLORS = {
  'for-families': '#FF725E',
  'for-companies': '#0B7897',
  'for-schools': '#00A4E8',
  'how-to': '#5FA8BA',
  'auditors': '#795548',
  'latest-scams': '#F44336',
};

export default function BlogPageContent() {
  const router = useRouter();
  const page = Math.max(parseInt(router.query.page || '1', 10), 1);
  const categoryParam = router.query.category || 'all';
  const searchParam = router.query.search || '';
  const [searchQuery, setSearchQuery] = useState('');

  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);
  const [weeklyEmail, setWeeklyEmail] = useState('');
  const [weeklyEmailError, setWeeklyEmailError] = useState('');
  const [subscribingWeekly, setSubscribingWeekly] = useState(false);
  const [subscribeWeeklySuccess, setSubscribeWeeklySuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (router.isReady) {
      const urlCategory = router.query.category || 'all';
      const urlSearch = router.query.search || '';
      setSelectedCategory(urlCategory);
      setSearchQuery(urlSearch);
    }
  }, [router.isReady, router.query.category, router.query.search]);

  const fetchPosts = useCallback(async (pageNum, category, search) => {
    try {
      setLoading(true);
      setError(null);
      const ts = Date.now();
      const params = {
        page: pageNum.toString(),
        limit: BLOGS_PER_PAGE.toString(),
        published: 'true',
        _t: ts,
      };
      if (category && category !== 'all') {
        params.category = category;
      }
      if (search && search.trim()) {
        params.search = search.trim();
      }
      const url = `${API_URL}/blog`;
      const res = await axios.get(url, {
        headers: NO_CACHE_HEADERS,
        params,
      });
      const postsData = Array.isArray(res.data) ? res.data : res.data.posts || [];
      setPosts(postsData);
      setTotal(res.data.total ?? postsData.length);
      setPages(res.data.totalPages || res.data.pages || 1);
    } catch (err) {
      console.error('❌ Error fetching blog posts:', err);
      setError(err);
      setPosts([]);
      setTotal(0);
      setPages(1);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (router.isReady) {
      fetchPosts(page, selectedCategory, searchQuery);
    }
  }, [page, selectedCategory, searchQuery, fetchPosts, router.isReady]);

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

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    const params = new URLSearchParams();
    if (category !== 'all') {
      params.set('category', category);
    }
    params.set('page', '1');
    router.push(`/blog?${params.toString()}`);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (selectedCategory !== 'all') {
      params.set('category', selectedCategory);
    }
    if (searchQuery.trim()) {
      params.set('search', searchQuery.trim());
    }
    params.set('page', '1');
    router.push(`/blog?${params.toString()}`);
  };

  const handleSubscribe = async (e, subscriptionType = 'latest-news') => {
    e.preventDefault();
    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }
    const emailRegex = /.+@.+\..+/;
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setSubscribing(true);
    setEmailError('');
    
    // Determine source based on subscription type
    const getSource = (type) => {
      switch (type) {
        case 'latest-news':
          return 'insights-form';
        case 'weekly-insights':
          return 'insights-form';
        case 'general':
          return 'newsletter-form';
        case 'waitlist':
          return 'waitlist-form';
        default:
          return 'newsletter-form';
      }
    };
    
    try {
      const url = `${API_URL}/newsletter/subscribe`;
      const response = await axios.post(url, { 
        email: email.trim(),
        subscriptionType,
        source: getSource(subscriptionType),
      });
      setSubscribeSuccess(true);
      setEmail('');
      setTimeout(() => setSubscribeSuccess(false), 5000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Something went wrong. Please try again.';
      setEmailError(errorMessage);
    } finally {
      setSubscribing(false);
    }
  };

  const showingFrom = total === 0 ? 0 : (page - 1) * BLOGS_PER_PAGE + 1;
  const showingTo = total === 0 ? 0 : Math.min(page * BLOGS_PER_PAGE, total);

  return (
    <>
      <Head>
        <title>Konfydence Blogs</title>
      </Head>
      <Header />
      
      {/* Hero Section */}
      <Box sx={{ pt: { xs: 8, md: 10 }, backgroundColor: '#063C5E' }}>
        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}     data-aos="zoom-in"
                  data-aos-duration="800">
          <Grid container spacing={4} alignItems="center" sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2rem', md: '2rem' },
                  fontWeight: 700,
                  mb: 2,
                  color: '#FFFFFF',
                  lineHeight: 1.2,
                }}
              >
                Scam Awareness & Digital Safety Insights
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontSize: { xs: '1.1rem', md: '1.3rem' },
                  fontWeight: 500,
                  mb: 2,
                  color: '#FFFFFF',
                  lineHeight: 1.6,
                }}
              >
                Practical, science-backed strategies to outsmart scammers — for families, schools, teams, and leaders.
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontSize: { xs: '1rem', md: '1.125rem' },
                  mb: 3,
                  lineHeight: 1.7,
                  color: 'rgba(255,255,255,0.9)',
                }}
              >
                Explore how human behavior (not technology) is the real key to staying safe online.
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
                  {/* <SwiperSlide> */}
                    {/* <Box
                      component="img"
                      src="/images/skk1.jpeg"
                      alt="Family playing cards"
                      sx={{
                        width: '100%',
                        height: { xs: '300px', md: '400px' },
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    /> */}
                  {/* </SwiperSlide> */}
                   <SwiperSlide>
                    <Box
                      component="img"
                      src="/images/skk2.jpeg"
                      alt="Classroom workshop"
                      sx={{
                        width: '100%',
                        height: { xs: '300px', md: '400px' },
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                  </SwiperSlide> 
                  <SwiperSlide>
                    <Box
                      component="img"
                      src="/images/comasy1.jpeg"
                      alt="Office team"
                      sx={{
                        width: '100%',
                        height: { xs: '300px', md: '400px' },
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                  </SwiperSlide>
                </Swiper>
              </Box>
            </Grid>
          </Grid>

          {/* Search Bar and Subscribe CTA */}
          <Box sx={{ textAlign: 'center' }}>
            <Grid container spacing={3} justifyContent="center" sx={{ mb: 3 }}>
              <Grid item xs={12} sm={8} md={6}>
                <Box component="form" onSubmit={handleSearch}>
                  <TextField
                    fullWidth
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                    sx={{
                      backgroundColor: 'white',
                      borderRadius: 2,
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
                </Box>
              </Grid>
            </Grid>
            <Box component="form" onSubmit={(e) => handleSubscribe(e, 'latest-news')} sx={{ maxWidth: { xs: '100%', sm: '600px' }, mx: 'auto' }}>
              <Stack spacing={1}>
                <Stack  sx={{ alignItems: 'stretch', display: 'flex', flexDirection: { xs: 'column', md: 'row' } , gap:3}}>
                  <Box sx={{ flex: 1 }}>
                    <TextField
                      placeholder="Enter your email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailError('');
                      }}
                      error={!!emailError}
                      fullWidth
                      sx={{
                        borderRadius: 5,
                        backgroundColor: 'white',
                        '& .MuiOutlinedInput-root': {
                          height: '56px',
                          '&:hover fieldset': {
                            borderColor: '#0B7897',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#0B7897',
                          },
                        },
                      }}
                    />
                  </Box>
                  <Button
                    type="submit"
                    variant="outlined"
                    disabled={subscribing}
                    sx={{
                      borderColor: '#FFFFFF',
                      color: '#FFFFFF',
                      px: { xs: 2, sm: 3, md: 4 },
                      py: 1.5,
                      fontWeight: 600,
                      whiteSpace: { xs: 'normal', sm: 'nowrap' },
                      height: '56px',
                      width: { xs: '100%', md: 'auto' },
                      '&:hover': {
                        borderColor: '#F5F5F5',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      },
                    }}
                  >
                    {subscribing ? 'Subscribing...' : 'Subscribe for Latest Insights →'}
                  </Button>
                </Stack>
                {emailError && (
                  <Typography sx={{ color: '#d32f2f', fontSize: '0.75rem', ml: 1.5 }}>
                    {emailError}
                  </Typography>
                )}
                {subscribeSuccess && (
                  <Typography sx={{ color: '#4CAF50', fontSize: '0.875rem', ml: 1.5 }}>
                    Successfully subscribed!
                  </Typography>
                )}
              </Stack>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Category Filters */}
      <Box sx={{ py: { xs: 4, md: 6 }, backgroundColor: '#ffffff' }}>
        <Container maxWidth="lg">
          <Box 
            sx={{ 
              mb: 4, 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 1.5, 
              justifyContent: 'center',
              px: { xs: 2, sm: 0 },
            }}
          >
            {CATEGORY_CHIPS.map((chip) => (
              <Chip
                key={chip.value}
                label={chip.label}
                onClick={() => handleCategoryChange(chip.value)}
                sx={{
                  backgroundColor: selectedCategory === chip.value
                    ? (chip.value === 'all' ? '#0B7897' : CATEGORY_COLORS[chip.value] || '#0B7897')
                    : 'white',
                  color: selectedCategory === chip.value ? 'white' : '#052A42',
                  fontWeight: selectedCategory === chip.value ? 600 : 400,
                  cursor: 'pointer',
                  border: selectedCategory === chip.value ? 'none' : '1px solid #e0e0e0',
                  '&:hover': {
                    backgroundColor: selectedCategory === chip.value
                      ? (chip.value === 'all' ? '#063C5E' : CATEGORY_COLORS[chip.value] || '#063C5E')
                      : '#E8F4F8',
                  },
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </Box>

          {/* Blog Posts Grid */}
          {error ? (
            <ErrorDisplay error={error} title="Failed to Load Blog Posts" />
          ) : loading ? (
            <LoadingState message="Loading articles..." />
          ) : posts.length === 0 ? (
            <Typography
              variant="body1"
              color="text.secondary"
              textAlign="center"
              sx={{ py: 8 }}
            >
              No articles found. {searchQuery ? 'Try a different search term.' : 'Check back soon for new scam-awareness content.'}
            </Typography>
          ) : (
            <>
              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="center"
                sx={{ mb: 3 }}
              >
                Showing {showingFrom}&ndash;{showingTo} of {total} articles
                {selectedCategory !== 'all' && ` in "${CATEGORY_CHIPS.find((cat) => cat.value === selectedCategory)?.label || selectedCategory}"`}
              </Typography>
              <Grid container spacing={4}>
                {posts.map((post, index) => (
                  <Grid item xs={12} sm={6} md={4} key={post._id}>
                    <BlogCard post={post} delay={index * 100} />
                  </Grid>
                ))}
              </Grid>
              {pages > 1 && (
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                  <PaginationControls
                    page={page}
                    totalPages={pages}
                    basePath={`/blog${selectedCategory !== 'all' ? `?${new URLSearchParams({
                      category: selectedCategory,
                    }).toString()}` : ''}`}
                  />
                </Box>
              )}
            </>
          )}
        </Container>
      </Box>

      {/* Bottom Section */}
      <Box sx={{ py: { xs: 6, md: 8 }, backgroundColor: '#E9F4FF' }}>
        <Container maxWidth="lg">
          {/* Row 1: 3 Images */}
          <Grid container spacing={4} sx={{ mb: 4 }} data-aos="fade-down" data-aos-duration="800">
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  width: '100%',
                  borderRadius: 2,
                  overflow: 'hidden',
                }}
              >
                <Box
                  component="img"
                  src="/images/skk5.png"
                  alt="Hot Brain vs Cool Brain"
                  sx={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                  }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  width: '100%',
                  borderRadius: 2,
                  overflow: 'hidden',
                }}
              >
                <Box
                  component="img"
                  src="/images/f3.png"
                  alt="Decision Ladder"
                  sx={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                  }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  width: '100%',
                  borderRadius: 2,
                  overflow: 'hidden',
                }}
              >
                <Box
                  component="img"
                  src="/images/f4.png"
                  alt="H.A.C.K. Framework"
                  sx={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                  }}
                />
              </Box>
            </Grid>
          </Grid>

          {/* Row 2: 3 Forms */}
          <Grid container spacing={4} alignItems="stretch">
            <Grid item xs={12} md={4}>
              <Paper
                data-aos="fade-down"
                data-aos-duration="800"
                elevation={3}
                sx={{
                  p: 4,
                  borderRadius: 3,
                  backgroundColor: 'white',
                  // height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <Typography variant="h5" sx={{ mb:5,  color: '#063C5E', fontWeight: 700 }}>
                  Get New Insights Weekly
                </Typography>
                <Box 
                  component="form" 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!weeklyEmail.trim()) {
                      setWeeklyEmailError('Email is required');
                      return;
                    }
                    const emailRegex = /.+@.+\..+/;
                    if (!emailRegex.test(weeklyEmail)) {
                      setWeeklyEmailError('Please enter a valid email address');
                      return;
                    }

                    setSubscribingWeekly(true);
                    setWeeklyEmailError('');
                    
                    try {
                      const url = `${API_URL}/newsletter/subscribe`;
                      await axios.post(url, { 
                        email: weeklyEmail.trim(),
                        subscriptionType: 'weekly-insights',
                        source: 'insights-form',
                      });
                      setSubscribeWeeklySuccess(true);
                      setWeeklyEmail('');
                      setTimeout(() => setSubscribeWeeklySuccess(false), 5000);
                    } catch (err) {
                      const errorMessage = err.response?.data?.message || 'Something went wrong. Please try again.';
                      setWeeklyEmailError(errorMessage);
                    } finally {
                      setSubscribingWeekly(false);
                    }
                  }}
                  sx={{ mt: 0 }}
                >
                  <Stack spacing={2}>
                    <TextField
                      fullWidth
                      placeholder="Enter your email"
                      type="email"
                      value={weeklyEmail}
                      onChange={(e) => {
                        setWeeklyEmail(e.target.value);
                        setWeeklyEmailError('');
                      }}
                      error={!!weeklyEmailError}
                      sx={{
                        backgroundColor: 'white',
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: '#e0e0e0',
                          },
                        },
                      }}
                    />
                    {weeklyEmailError && (
                      <Typography sx={{ color: '#d32f2f', fontSize: '0.75rem', ml: 1.5, mt: -1 }}>
                        {weeklyEmailError}
                      </Typography>
                    )}
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      disabled={subscribingWeekly}
                      sx={{
                        background: 'linear-gradient(135deg, #0B7897 0%, #5FA8BA 100%)',
                        color: 'white',
                        py: 1.5,
                        fontWeight: 600,
                        '&:hover': {
                          background: 'linear-gradient(135deg, #063C5E 0%, #0B7897 100%)',
                        },
                      }}
                    >
                      {subscribingWeekly ? 'Subscribing...' : 'Subscribe'}
                    </Button>
                    {subscribeWeeklySuccess && (
                      <Typography sx={{ color: '#4CAF50', fontSize: '0.875rem', ml: 1.5 }}>
                        Successfully subscribed!
                      </Typography>
                    )}
                  </Stack>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper
                data-aos="fade-down"
                data-aos-duration="800"
                elevation={3}
                sx={{
                  p: 4,
                  borderRadius: 3,
                  backgroundColor: '#063C5E',
                  color: 'white',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
                  Build the Habits You Read About
                </Typography>
                <Stack spacing={2}>
                  <Button
                    component={Link}
                    href="/products"
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
                    Get Family Kit
                  </Button>
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
                    Request Demo
                  </Button>
                </Stack>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper
                data-aos="fade-down"
                data-aos-duration="800"
                elevation={3}
                sx={{
                  p: 4,
                  borderRadius: 3,
                  backgroundColor: 'white',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <Typography variant="h5" sx={{ mb: 3, color: '#063C5E', fontWeight: 700 }}>
                  Free Resources
                </Typography>
                <Stack spacing={2}>
                  <Button
                    component={Link}
                    href="/sskit-family"
                    variant="outlined"
                    fullWidth
                    sx={{
                      borderColor: '#0B7897',
                      color: '#0B7897',
                      justifyContent: 'flex-start',
                      '&:hover': {
                        borderColor: '#063C5E',
                        backgroundColor: '#E9F4FF',
                      },
                    }}
                  >
                    Family Tech Agreement
                  </Button>
                  <Button
                    component={Link}
                    href="/education"
                    variant="outlined"
                    fullWidth
                    sx={{
                      borderColor: '#0B7897',
                      color: '#0B7897',
                      justifyContent: 'flex-start',
                      '&:hover': {
                        borderColor: '#063C5E',
                        backgroundColor: '#E9F4FF',
                      },
                    }}
                  >
                    Lesson Pack
                  </Button>
                  <Button
                    component="a"
                    href="/pdfs/the-limbic-hijack.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="outlined"
                    fullWidth
                    sx={{
                      borderColor: '#0B7897',
                      color: '#0B7897',
                      justifyContent: 'flex-start',
                      '&:hover': {
                        borderColor: '#063C5E',
                        backgroundColor: '#E9F4FF',
                      },
                    }}
                  >
                    Limbic Hijack Explainer
                  </Button>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Footer />
    </>
  );
}
