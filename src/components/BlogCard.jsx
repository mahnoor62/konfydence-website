import { Card, CardContent, CardMedia, Typography, Button, Box, Chip } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/router';

// Category labels mapping
const CATEGORY_LABELS = {
  'for-families': 'For families',
  'for-companies': 'For companies',
  'for-schools': 'For schools',
  'news': 'News',
  'how-to': 'How-to',
  'kids-program': 'Kids program',
  'charity-model': 'Charity model',
  'auditors': 'Auditors',
  'nis2': 'NIS2',
  'comasi': 'CoMaSi',
  'b2b-sales': 'B2B sales',
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
};

export default function BlogCard({ post, delay = 0 }) {
  const router = useRouter();
  const fallbackImage = '/images/placeholders/blog-default.svg';
  const apiBase = process.env.NEXT_PUBLIC_API_URL;
  const normalizedApiBase = apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase;
  const cleanImageUrl = post.featuredImage?.trim() ?? '';
  const resolvedImage = cleanImageUrl
    ? cleanImageUrl.startsWith('http')
      ? cleanImageUrl
      : `${normalizedApiBase}${cleanImageUrl.startsWith('/') ? cleanImageUrl : `/${cleanImageUrl}`}`
    : fallbackImage;

  const handleCardClick = (e) => {
    // Don't navigate if clicking on a button or link
    if (e.target.closest('button') || e.target.closest('a')) {
      return;
    }
    router.push(`/blog/${post.slug}`);
  };

  return (
    <Card
      onClick={handleCardClick}
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
          {post.category && (
            <Chip 
              label={CATEGORY_LABELS[post.category] || post.category} 
              size="small" 
              sx={{
                backgroundColor: CATEGORY_COLORS[post.category] || '#0B7897',
                color: 'white',
                fontWeight: 500,
              }}
            />
          )}
          {Array.isArray(post.tags) && post.tags.slice(0, 2).map((tag) => (
            <Chip key={tag} label={tag} size="small" variant="outlined" />
          ))}
        </Box>
        <Typography variant="h5" component="h3" gutterBottom sx={{ color: 'text.primary' }}>
          {post.title}
        </Typography>
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            mb: 3, 
            flexGrow: 1,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            lineHeight: 1.6,
          }}
        >
          {post.excerpt || post.description || 'No description available'}
        </Typography>
        <Box sx={{ mt: 'auto' }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2, fontSize: '0.75rem' }}>
            By {post.author || 'Tichi Mbanwie'} {post.authorTitle ? `(${post.authorTitle})` : '(Financial and Compliance Controller, ex-PIMCO, ex-Ford)'}
          </Typography>
          <Button
            component={Link}
            href={`/blog/${post.slug}`}
            onClick={(e) => {
              e.stopPropagation();
            }}
            size="small"
            variant="contained"
            fullWidth
            sx={{
              backgroundColor: '#FF725E',
              color: 'white',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: '#e65a4a',
              },
            }}
          >
            Read More →
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

