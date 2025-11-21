'use client';

import { Container, Typography, Grid, Box, Button, Stack, Chip } from '@mui/material';
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BlogCard from '@/components/BlogCard';
import PaginationControls from '@/components/PaginationControls';
import ErrorDisplay from '@/components/ErrorDisplay';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_URL environment variable is missing!');
}
const API_URL = `${API_BASE_URL}/api`;
console.log('🔗 Blog Page API URL:', API_URL);

const BLOGS_PER_PAGE = 10;

const CATEGORY_COLORS = {
  insight: '#FF725E',
  technique: '#FF9B8A',
  checklist: '#0B7897',
  guide: '#063C5E',
  template: '#052A42',
  reference: '#8B9DC3',
};

export default function BlogPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
  const categoryParam = searchParams.get('category') || 'all';

  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [error, setError] = useState(null);

  const fetchPosts = useCallback(async (pageNum, category) => {
    try {
      setLoading(true);
      setError(null);
      const categoryQuery = category && category !== 'all' ? `&category=${encodeURIComponent(category)}` : '';
      const url = `${API_URL}/blog?all=true&page=${pageNum}&limit=${BLOGS_PER_PAGE}${categoryQuery}`;
      console.log(`📡 GET ${url}`);
      const res = await axios.get(url);
      const postsData = Array.isArray(res.data) ? res.data : res.data.posts || [];
      setPosts(postsData);
      setTotal(res.data.total || postsData.length);
      setPages(res.data.totalPages || 1);
      if (res.data.categories) {
        setCategories(res.data.categories);
      }
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
    fetchPosts(page, selectedCategory);
  }, [page, selectedCategory, fetchPosts]);

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
          maxWidth="md"
          sx={{ textAlign: 'center', py: { xs: 6, md: 8 } }}
          data-aos="zoom-in"
          data-aos-duration="800"
        >
          <Typography variant="overline" sx={{ letterSpacing: 2, fontWeight: 600, color: '#0B7897' }}>
            Blog / Resources
          </Typography>
          <Typography
            variant="h2"
            sx={{ fontWeight: 700, mt: 1, mb: 2, fontSize: { xs: '2.25rem', md: '3rem' }, color: '#052A42' }}
          >
            Read our latest tips, insights, and strategies to stay safe online.
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 640, mx: 'auto' }}>
            Actionable guidance for families, schools, and businesses navigating today&apos;s scam landscape.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button variant="contained" size="large" sx={{ px: 4, borderRadius: 999 }} href="/contact?topic=other">
              Subscribe for Updates
            </Button>
          </Stack>
        </Container>

        <Container
          maxWidth="lg"
          sx={{ pb: { xs: 6, md: 10 } }}
          data-aos="zoom-in"
          data-aos-duration="800"
        >
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, textAlign: 'center', mb: 3, color: '#052A42' }}
          >
            Latest Articles
          </Typography>

          {/* Category Filter */}
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
            {categories.map((category) => (
              <Chip
                key={category}
                label={category.charAt(0).toUpperCase() + category.slice(1)}
                onClick={() => handleCategoryChange(category)}
                sx={{
                  backgroundColor: selectedCategory === category ? CATEGORY_COLORS[category] || '#0B7897' : 'white',
                  color: selectedCategory === category ? 'white' : '#052A42',
                  fontWeight: selectedCategory === category ? 600 : 400,
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: selectedCategory === category
                      ? CATEGORY_COLORS[category] || '#063C5E'
                      : '#E8F4F8',
                  },
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </Box>

          {error ? (
            <ErrorDisplay error={error} title="Failed to Load Blog Posts" />
          ) : loading ? (
            <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ py: 8 }}>
              Loading articles...
            </Typography>
          ) : posts.length === 0 ? (
            <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ py: 8 }}>
              {selectedCategory !== 'all' 
                ? `No articles found in "${selectedCategory}" category.` 
                : 'No blog posts available yet. Check back soon!'}
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
                {selectedCategory !== 'all' && ` in "${selectedCategory}"`}
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

