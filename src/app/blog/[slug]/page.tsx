import { Container, Typography, Box, Chip, Button } from '@mui/material';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import api from '@/lib/api';
import { BlogPost } from '@/lib/types';
import { notFound } from 'next/navigation';
import ClientBackButton from './components/ClientBackButton';

async function getBlogPost(slug: string) {
  try {
    const res = await api.get<BlogPost>(`/blog/${slug}`);
    return res.data;
  } catch (error) {
    return null;
  }
}

export const dynamic = 'force-static';
export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    const res = await api.get('/blog', { params: { all: true } });
    const posts: BlogPost[] = Array.isArray(res.data) ? res.data : res.data.posts || [];

    return posts
      .filter((post) => Boolean(post?.slug))
      .map((post) => ({
        slug: post.slug,
      }));
  } catch (error) {
    console.error('Error generating blog params:', error);
    return [];
  }
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getBlogPost(params.slug);

  if (!post) {
    notFound();
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

