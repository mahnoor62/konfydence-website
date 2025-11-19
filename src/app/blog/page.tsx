import { Container, Typography, Grid, Box, Button, Stack } from '@mui/material';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BlogCard from '@/components/BlogCard';
import api from '@/lib/api';
import { BlogPost } from '@/lib/types';
import PaginationControls from '@/components/PaginationControls';

const BLOGS_PER_PAGE = 10;

async function getBlogPosts(page: number = 1) {
  try {
    const res = await api.get<{ posts: BlogPost[]; total: number; pages: number }>(
      `/blog?published=true&page=${page}&limit=${BLOGS_PER_PAGE}`
    );
    return res.data;
  } catch (error) {
    return { posts: [], total: 0, pages: 0 };
  }
}

export default async function BlogPage({ searchParams }: { searchParams: { page?: string } }) {
  const page = Math.max(parseInt(searchParams.page || '1', 10), 1);
  const { posts, total, pages } = await getBlogPosts(page);
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
            Actionable guidance for families, schools, and businesses navigating today’s scam landscape.
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
            sx={{ fontWeight: 700, textAlign: 'center', mb: 4, color: '#052A42' }}
          >
            Latest Articles
          </Typography>

          {posts.length === 0 ? (
            <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ py: 8 }}>
              No blog posts available yet. Check back soon!
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
              </Typography>
              <Grid container spacing={4}>
                {posts.map((post, index) => (
                  <Grid item xs={12} sm={6} md={4} key={post._id}>
                    <BlogCard post={post} delay={index * 100} />
                  </Grid>
                ))}
              </Grid>
              {pages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                  <PaginationControls page={Math.min(page, pages)} totalPages={pages} basePath="/blog" />
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

