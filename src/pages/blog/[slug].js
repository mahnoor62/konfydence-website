import { Container, Typography, Box, Chip, Button } from '@mui/material';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ErrorDisplay from '@/components/ErrorDisplay';
import axios from 'axios';
import ClientBackButton from '@/components/PageBackButton';

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


console.log('🔗 Blog Post Detail API URL:', API_URL);

export async function getServerSideProps(context) {
  const { slug } = context.params;
  const { res } = context; 
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  let post = null;
  let error = null;
  const ts = Date.now(); // cache breaker

  try {
    const url = `${API_URL}/blog/${slug}`;
console.log('📡 API: GET', url);
const res = await axios.get(url, {
  headers: NO_CACHE_HEADERS,
  params: { _t: ts },
});
post = res.data;

    // const url = `${API_URL}/blog/${slug}`;
    // console.log('📡 API: GET', url);
    // const res = await axios.get(url);
    // post = res.data;
  } catch (err) {
    error = err;
    console.error('❌ Error loading blog post:', {
      url: `${API_URL}/blog/${slug}`,
      error: err.response?.data || err.message,
      status: err.response?.status,
    });
  }

  if (!post && !error) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      post,
      error: error ? { message: error.message } : null,
    },
  };
}

export default function BlogPostPage({ post, error }) {
  if (error) {
    return (
      <>
        <Header />
        <Box component="main" sx={{ pt: { xs: 8, md: 10 }, minHeight: '80vh' }}>
          <Container maxWidth="md" sx={{ py: 8 }}>
            <ErrorDisplay error={error} title="Failed to Load Blog Post" />
          </Container>
        </Box>
        <Footer />
      </>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <>
      <Header />
      <Box component="main" sx={{ pt: { xs: 8, md: 10 }, minHeight: '80vh' }}>
        <Container maxWidth="md" sx={{ py: 6 }}>
          {post.featuredImage && (
            <Box
              component="img"
              src={post.featuredImage}
              alt={post.title}
              sx={{
                width: '100%',
                height: 400,
                objectFit: 'cover',
                borderRadius: 2,
                mb: 4,
              }}
            />
          )}
          <Box
            sx={{
              mb: 3,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
              alignItems: 'center',
            }}
          >
            <Chip label={post.category} sx={{ textTransform: 'capitalize' }} />
            {post.tags.map((tag) => (
              <Chip key={tag} label={tag} variant="outlined" size="small" />
            ))}
          </Box>
          <Typography variant="h2" gutterBottom>
            {post.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Typography>
          <Box
            sx={{
              '& p': { mb: 2 },
              '& h2': { mt: 4, mb: 2 },
              '& h3': { mt: 3, mb: 2 },
              '& ul, & ol': { mb: 2, pl: 4 },
            }}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
          <ClientBackButton />
        </Container>
      </Box>
      <Footer />
    </>
  );
}

