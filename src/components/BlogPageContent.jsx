'use client';

import { Container, Typography, Grid, Box, Button, Stack, Chip } from '@mui/material';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
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
console.log('🔗 Blog Page API URL:', API_URL);

const BLOGS_PER_PAGE = 12;

// Fixed category chips as requested
const CATEGORY_CHIPS = [
  { label: 'For families', value: 'for-families' },
  { label: 'For companies', value: 'for-companies' },
  { label: 'For schools', value: 'for-schools' },
  { label: 'News', value: 'news' },
  { label: 'How-to', value: 'how-to' },
];

const CATEGORY_COLORS = {
  'for-families': '#FF725E',
  'for-companies': '#0B7897',
  'for-schools': '#00A4E8',
  'news': '#063C5E',
  'how-to': '#5FA8BA',
};

export default function BlogPageContent() {
  const router = useRouter();
  const page = Math.max(parseInt(router.query.page || '1', 10), 1);
  const categoryParam = router.query.category || 'all';

  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [error, setError] = useState(null);

  const fetchPosts = useCallback(async (pageNum, category) => {
    try {
      setLoading(true);
      setError(null);
      const ts = Date.now();
      const params = {
        page: pageNum.toString(),
        limit: BLOGS_PER_PAGE.toString(),
        published: 'true',
        _t: ts, // cache breaker
      };
      if (category && category !== 'all') {
        params.category = category;
      }
      const url = `${API_URL}/blog`;
      console.log('📡 API: GET', url, params);
      const res = await axios.get(url, {
        headers: NO_CACHE_HEADERS,
        params,
      });
      const postsData = Array.isArray(res.data) ? res.data : res.data.posts || [];
      setPosts(postsData);
      setTotal(res.data.total ?? postsData.length);
      setPages(res.data.totalPages || res.data.pages || 1);
    } catch (err) {
      console.error('❌ Error fetching blog posts:', {
        url: `${API_URL}/blog`,
        error: err.response?.data || err.message,
        status: err.response?.status,
      });
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
      fetchPosts(page, selectedCategory);
    }
  }, [page, selectedCategory, fetchPosts, router.isReady]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    const params = new URLSearchParams();
    if (category !== 'all') {
      params.set('category', category);
    }
    params.set('page', '1');
    router.push(`/blog?${params.toString()}`);
  };

  const showingFrom = total === 0 ? 0 : (page - 1) * BLOGS_PER_PAGE + 1;
  const showingTo = total === 0 ? 0 : Math.min(page * BLOGS_PER_PAGE, total);

  return (
    <>
      <Header />
      <Box component="main" sx={{ pt: { xs: 8, md: 10 }, backgroundColor: '#F2F5FB', minHeight: '100vh' }}>
        <Container
          maxWidth="lg"
          sx={{ py: { xs: 6, md: 8 } }}
          data-aos="zoom-in"
          data-aos-duration="800"
        >
          {/* Page Title and Intro */}
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="h1"
              component="h1"
              sx={{
                fontWeight: 700,
                mb: 2,
                fontSize: { xs: '2rem', md: '3rem' },
                color: '#052A42',
              }}
            >
              Scam Awareness & Digital Safety Insights
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                mb: 4,
                maxWidth: 800,
                mx: 'auto',
                fontSize: { xs: '1rem', md: '1.1rem' },
                lineHeight: 1.7,
              }}
            >
              Read the latest articles on scams, social engineering, and practical ways to build safer digital habits for families, teams, and schools.
            </Typography>
          </Box>

          {/* Category/Tag Chips */}
          <Box sx={{ mb: 4, display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'center' }}>
            <Chip
              label="All"
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
            {CATEGORY_CHIPS.map((chip) => (
              <Chip
                key={chip.value}
                label={chip.label}
                onClick={() => handleCategoryChange(chip.value)}
                sx={{
                  backgroundColor: selectedCategory === chip.value
                    ? CATEGORY_COLORS[chip.value] || '#0B7897'
                    : 'white',
                  color: selectedCategory === chip.value ? 'white' : '#052A42',
                  fontWeight: selectedCategory === chip.value ? 600 : 400,
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: selectedCategory === chip.value
                      ? CATEGORY_COLORS[chip.value] || '#063C5E'
                      : '#E8F4F8',
                  },
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </Box>

          {/* Content Area */}
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
              No articles published yet. Check back soon for new scam-awareness content.
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
      <Footer />
    </>
  );
}
