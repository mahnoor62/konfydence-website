import { Container, Typography, Box, Chip, Button, Grid, Paper, Stack, TextField, Divider } from '@mui/material';
import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ErrorDisplay from '@/components/ErrorDisplay';
import axios from 'axios';
import ClientBackButton from '@/components/PageBackButton';
import ShareIcon from '@mui/icons-material/Share';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

const CATEGORY_LABELS = {
  'for-families': 'For Families',
  'for-companies': 'For Organizations',
  'for-schools': 'For Schools',
  'news': 'News',
  'how-to': 'How-To',
  'kids-program': 'Kids Program',
  'charity-model': 'Charity Model',
  'auditors': 'Auditors',
  'nis2': 'NIS2',
  'comasi': 'CoMaSi',
  'b2b-sales': 'B2B Sales',
  'latest-scams': 'Latest Scams',
};

const CATEGORY_COLORS = {
  'for-families': '#FF725E',
  'for-companies': '#0B7897',
  'for-schools': '#00A4E8',
  'news': '#063C5E',
  'how-to': '#5FA8BA',
  'kids-program': '#FF9800',
  'charity-model': '#9C27B0',
  'auditors': '#795548',
  'nis2': '#2196F3',
  'comasi': '#4CAF50',
  'b2b-sales': '#F44336',
  'latest-scams': '#F44336',
};

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

export async function getServerSideProps(context) {
  const { slug } = context.params;
  const { res } = context; 
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  let post = null;
  let error = null;
  const ts = Date.now();

  try {
    const url = `${API_URL}/blog/${slug}`;
    const response = await axios.get(url, {
      headers: NO_CACHE_HEADERS,
      params: { _t: ts },
    });
    post = response.data;
  } catch (err) {
    error = err;
    console.error('❌ Error loading blog post:', err);
  }

  if (!post && !error) {
    return { notFound: true };
  }

  return {
    props: {
      post,
      error: error ? { message: error.message } : null,
    },
  };
}

export default function BlogPostPage({ post, error }) {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);

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

  const publishedDate = new Date(post.publishedAt || post.createdAt);
  const readTime = Math.ceil((post.content?.replace(/<[^>]*>/g, '').length || 0) / 1000) || 5;
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = post.title || '';

  const handleSubscribe = async (e) => {
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
    
    try {
      const url = `${API_URL}/newsletter/subscribe`;
      await axios.post(url, { 
        email: email.trim(),
        subscriptionType: 'weekly-insights',
        source: 'insights-form',
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

  const handleShare = (platform) => {
    const url = encodeURIComponent(shareUrl);
    const title = encodeURIComponent(shareTitle);
    
    let shareLink = '';
    switch (platform) {
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
        break;
      case 'linkedin':
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      default:
        return;
    }
    window.open(shareLink, '_blank', 'width=600,height=400');
  };

  const isFamilyPost = post.category === 'for-families';
  const isSchoolPost = post.category === 'for-schools';
  const isBusinessPost = post.category === 'for-companies';

  return (
    <>
      <Head>
        <title>{post.title} | Konfydence Blog</title>
        <meta name="description" content={post.excerpt || post.description || 'Read about scam awareness and digital safety insights from Konfydence.'} />
      </Head>
      <Header />
      
      {/* Hero Section */}
      <Box sx={{ pt: { xs: 8, md: 10 }, backgroundColor: '#063C5E', color: 'white' }}>
        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
          {post.featuredImage && (
            <Box
              component="img"
              src={post.featuredImage}
              alt={post.title}
              sx={{
                width: '100%',
                height: { xs: '300px', md: '500px' },
                objectFit: 'cover',
                borderRadius: 3,
                mb: 4,
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              }}
            />
          )}
          
          <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
            {post.category && (
              <Chip 
                label={CATEGORY_LABELS[post.category] || post.category} 
                sx={{ 
                  backgroundColor: CATEGORY_COLORS[post.category] || '#0B7897',
                  color: 'white',
                  fontWeight: 600,
                }} 
              />
            )}
            {Array.isArray(post.tags) && post.tags.slice(0, 3).map((tag) => (
              <Chip key={tag} label={tag} variant="outlined" size="small" sx={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white' }} />
            ))}
          </Box>

          <Typography 
            variant="h1" 
            sx={{
              fontSize: { xs: '2rem', md: '3rem', lg: '3.5rem' },
              fontWeight: 700,
              mb: 2,
              color: 'white',
              lineHeight: 1.2,
            }}
          >
            {post.title}
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', mb: 4 }}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
              {publishedDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
              •
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
              By {post.author || 'Tichi Mbanwie'} {post.authorTitle ? `(${post.authorTitle})` : '(Financial and Compliance Controller, ex-PIMCO, ex-Ford)'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
              •
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
              {readTime} min read
            </Typography>
          </Box>

          {/* Social Share Buttons */}
          <Box sx={{ display: 'flex', gap: 1, mb: 4 }}>
            <Button
              onClick={() => handleShare('facebook')}
              startIcon={<FacebookIcon />}
              variant="outlined"
              sx={{
                borderColor: 'rgba(255,255,255,0.5)',
                color: 'white',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              Share
            </Button>
            <Button
              onClick={() => handleShare('twitter')}
              startIcon={<TwitterIcon />}
              variant="outlined"
              sx={{
                borderColor: 'rgba(255,255,255,0.5)',
                color: 'white',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              Tweet
            </Button>
            <Button
              onClick={() => handleShare('linkedin')}
              startIcon={<LinkedInIcon />}
              variant="outlined"
              sx={{
                borderColor: 'rgba(255,255,255,0.5)',
                color: 'white',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              Share
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Box sx={{ py: { xs: 6, md: 8 }, backgroundColor: '#ffffff' }}>
        <Container maxWidth="md" sx={{ py: 4 }}>
          {post.excerpt && (
            <Typography
              variant="h5"
              sx={{
                mb: 4,
                color: 'text.secondary',
                fontWeight: 400,
                fontSize: { xs: '1.1rem', md: '1.25rem' },
                lineHeight: 1.7,
                fontStyle: 'italic',
                px: { xs: 2, md: 0 },
              }}
            >
              {post.excerpt}
            </Typography>
          )}

          <Box
            sx={{
              mb: 5,
              '& p': { mb: 2, fontSize: '1.125rem', lineHeight: 1.8 },
              '& h2': { mt: 5, mb: 3, fontSize: { xs: '1.75rem', md: '2.25rem' }, fontWeight: 700, color: '#063C5E' },
              '& h3': { mt: 4, mb: 2, fontSize: { xs: '1.5rem', md: '1.75rem' }, fontWeight: 600, color: '#063C5E' },
              '& ul, & ol': { mb: 3, pl: 4, fontSize: '1.125rem', lineHeight: 1.8 },
              '& li': { mb: 1 },
              '& strong': { fontWeight: 600, color: '#063C5E' },
              '& img': { 
                width: '100%', 
                height: 'auto', 
                borderRadius: 2, 
                my: 4,
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              },
            }}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Inline CTAs - Contextual based on category */}
          {(isFamilyPost || isSchoolPost || isBusinessPost) && (
            <Paper
              elevation={3}
              sx={{
                p: 4,
                borderRadius: 3,
                backgroundColor: '#E9F4FF',
                my: 6,
                textAlign: 'center',
              }}
            >
              <Typography variant="h5" sx={{ mb: 2, color: '#063C5E', fontWeight: 700 }}>
                {isFamilyPost && 'Ready to build this habit?'}
                {isSchoolPost && 'Bring proven training to your school?'}
                {isBusinessPost && 'Bring proven training to your team?'}
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                {isFamilyPost && (
                  <Button
                    component={Link}
                    href="/products"
                    variant="contained"
                    sx={{
                      backgroundColor: '#FF725E',
                      color: 'white',
                      px: 4,
                      py: 1.5,
                      fontWeight: 600,
                      '&:hover': {
                        backgroundColor: '#e65a4a',
                      },
                    }}
                  >
                    Get Your Family Kit →
                  </Button>
                )}
                {isSchoolPost && (
                  <Button
                    component={Link}
                    href="/education#pilot-form"
                    variant="contained"
                    sx={{
                      backgroundColor: '#0B7897',
                      color: 'white',
                      px: 4,
                      py: 1.5,
                      fontWeight: 600,
                      '&:hover': {
                        backgroundColor: '#063C5E',
                      },
                    }}
                  >
                    Free Resources →
                  </Button>
                )}
                {isBusinessPost && (
                  <Button
                    component={Link}
                    href="/scenario-lab#demo-form"
                    variant="contained"
                    sx={{
                      backgroundColor: '#0B7897',
                      color: 'white',
                      px: 4,
                      py: 1.5,
                      fontWeight: 600,
                      '&:hover': {
                        backgroundColor: '#063C5E',
                      },
                    }}
                  >
                    Request Demo →
                  </Button>
                )}
              </Stack>
            </Paper>
          )}

          <Divider sx={{ my: 6 }} />

          {/* Related Posts Section */}
          <Box sx={{ mb: 6 }}>
            <Typography variant="h4" sx={{ mb: 4, color: '#063C5E', fontWeight: 700 }}>
              You might also like...
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Related posts will be displayed here. (This would require fetching related posts from API)
            </Typography>
          </Box>

          {/* Newsletter Signup */}
          <Paper
            elevation={3}
            sx={{
              p: 4,
              borderRadius: 3,
              backgroundColor: 'white',
              mb: 6,
              border: '1px solid #e0e0e0',
            }}
          >
            <Typography variant="h5" sx={{ mb: 2, color: '#063C5E', fontWeight: 700, textAlign: 'center' }}>
              Get Insights Like This Weekly
            </Typography>
            <Box component="form" onSubmit={handleSubscribe} sx={{ maxWidth: '500px', mx: 'auto' }}>
              <Stack spacing={1}>
                <TextField
                  fullWidth
                  placeholder="Enter your email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError('');
                  }}
                  error={!!emailError}
                  sx={{
                    backgroundColor: 'white',
                  }}
                />
                {emailError && (
                  <Typography sx={{ color: '#d32f2f', fontSize: '0.75rem', ml: 1.5 }}>
                    {emailError}
                  </Typography>
                )}
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={subscribing}
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
                  {subscribing ? 'Subscribing...' : 'Subscribe'}
                </Button>
                {subscribeSuccess && (
                  <Typography sx={{ color: '#4CAF50', fontSize: '0.875rem', textAlign: 'center' }}>
                    Successfully subscribed!
                  </Typography>
                )}
              </Stack>
            </Box>
          </Paper>

          {/* Final CTA Block */}
          <Box sx={{ mb: 6 }}>
            <Grid container spacing={2} sx={{ flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
              <Grid item xs={12} sm={4} sx={{ minWidth: 0 }}>
                <Button
                  component={Link}
                  href="/products"
                  variant="contained"
                  fullWidth
                  sx={{
                    backgroundColor: '#FF725E',
                    color: 'white',
                    py: 2,
                    fontWeight: 600,
                    fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' },
                    whiteSpace: 'nowrap',
                    '&:hover': {
                      backgroundColor: '#e65a4a',
                    },
                  }}
                >
                  For Home → Shop Kit
                </Button>
              </Grid>
              <Grid item xs={12} sm={4} sx={{ minWidth: 0 }}>
                <Button
                  component={Link}
                  href="/free-resources"
                  variant="contained"
                  fullWidth
                  sx={{
                    backgroundColor: '#0B7897',
                    color: 'white',
                    py: 2,
                    fontWeight: 600,
                    fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' },
                    whiteSpace: 'nowrap',
                    '&:hover': {
                      backgroundColor: '#063C5E',
                    },
                  }}
                >
                  For School → Free Resources
                </Button>
              </Grid>
              <Grid item xs={12} sm={4} sx={{ minWidth: 0 }}>
                <Button
                  component={Link}
                  href="/contact"
                  variant="contained"
                  fullWidth
                  sx={{
                    backgroundColor: '#0B7897',
                    color: 'white',
                    py: 2,
                    fontWeight: 600,
                    fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' },
                    whiteSpace: 'nowrap',
                    '&:hover': {
                      backgroundColor: '#063C5E',
                    },
                  }}
                >
                  For Work → Request Demo
                </Button>
              </Grid>
            </Grid>
          </Box>

          {/* Author Bio */}
          <Paper
            elevation={2}
            sx={{
              p: 4,
              borderRadius: 3,
              backgroundColor: '#f5f5f5',
            }}
          >
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={9}>
                <Typography variant="h6" sx={{ mb: 2, color: '#063C5E', fontWeight: 700 }}>
                  About the Author
                </Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                  <strong>{post.author || 'Tichi Mbanwie'}</strong> {post.authorTitle || 'is a Financial and Compliance Controller with extensive experience at PIMCO and Ford. She brings deep expertise in risk management and behavioral finance to help organizations and families build real digital resilience.'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Box
                    component="img"
                    src="/images/titi.png"
                    alt={post.author || 'Tichi Mbanwie'}
                    sx={{
                      width: '100%',
                      maxWidth: '200px',
                      height: 'auto',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '3px solid #0B7897',
                    }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Paper>

          <Box sx={{ mt: 4 }}>
            <ClientBackButton />
          </Box>
        </Container>
      </Box>

      <Footer />
    </>
  );
}
