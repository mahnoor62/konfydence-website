import { Card, CardContent, CardMedia, Typography, Button, Box, Chip } from '@mui/material';
import Link from 'next/link';

export default function BlogCard({ post, delay = 0 }) {
  const fallbackImage = '/images/placeholders/blog-default.svg';
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const normalizedApiBase = apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase;
  const cleanImageUrl = post.featuredImage?.trim() ?? '';
  const resolvedImage = cleanImageUrl
    ? cleanImageUrl.startsWith('http')
      ? cleanImageUrl
      : `${normalizedApiBase}${cleanImageUrl.startsWith('/') ? cleanImageUrl : `/${cleanImageUrl}`}`
    : fallbackImage;

  return (
    <Card
      data-aos="fade-up"
      data-aos-duration="800"
      data-aos-delay={delay}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease-in-out',
        transform: 'translateY(0)',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-8px) scale(1.02)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        },
      }}
    >
      <CardMedia
        component="img"
        height="180"
        image={resolvedImage}
        alt={post.title}
        sx={{
          objectFit: 'cover',
          transition: 'transform 0.3s ease-in-out',
          '.MuiCard-root:hover &': {
            transform: 'scale(1.05)',
          },
        }}
      />
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {post.category && <Chip label={post.category} size="small" color="secondary" />}
          {Array.isArray(post.tags) && post.tags.slice(0, 2).map((tag) => (
            <Chip key={tag} label={tag} size="small" variant="outlined" />
          ))}
        </Box>
        <Typography variant="h5" component="h3" gutterBottom sx={{ color: 'text.primary' }}>
          {post.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, flexGrow: 1 }}>
          {post.excerpt}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
          <Typography variant="caption" color="text.secondary">
            {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Typography>
          <Button
            component={Link}
            href={`/blog/${post.slug}`}
            size="small"
            variant="contained"
            sx={{ background: 'linear-gradient(135deg, #FF725E, #FF9B8A)' }}
          >
            Read More
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

