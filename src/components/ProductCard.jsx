import { Card, CardContent, CardMedia, Typography, Button, Box, Chip } from '@mui/material';
import Link from 'next/link';

export default function ProductCard({ product, delay = 0 }) {
  const fallbackImage = '/images/placeholders/product-default.svg';
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const normalizedApiBase = apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase;
  const cleanImageUrl = product.imageUrl?.trim() ?? '';
  const shouldSkipLegacyStatic = cleanImageUrl.startsWith('/images/');
  const resolvedImage = !cleanImageUrl || shouldSkipLegacyStatic
    ? fallbackImage
    : cleanImageUrl.startsWith('http')
      ? cleanImageUrl
      : `${normalizedApiBase}${cleanImageUrl.startsWith('/') ? cleanImageUrl : `/${cleanImageUrl}`}`;

  return (
    <Card
      data-aos="fade-up"
      data-aos-duration="800"
      data-aos-delay={delay}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        backgroundColor: 'white',
        transition: 'all 0.3s ease-in-out',
        transform: 'translateY(0)',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-12px) scale(1.03)',
          boxShadow: '0 12px 32px rgba(0,0,0,0.2)',
        },
      }}
    >
      <CardMedia
        component="img"
        height="220"
        image={resolvedImage || fallbackImage}
        alt={product.name}
        sx={{
          objectFit: 'cover',
          filter: 'saturate(1.05)',
        }}
      />
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {product.badges?.map((badge) => (
            <Chip
              key={badge}
              label={badge}
              size="small"
              color="primary"
              sx={{ backgroundColor: 'rgba(0,139,139,0.1)' }}
            />
          ))}
        </Box>
        <Typography variant="h5" component="h3" gutterBottom sx={{ color: 'text.primary' }}>
          {product.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, flexGrow: 1 }}>
          {product.description}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 'auto',
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
            €{product.price}
          </Typography>
          <Button
            variant="contained"
            component={Link}
            href={`/products/${product.slug}`}
            sx={{
              backgroundColor: product.type === 'membership'
                ? '#063C5E'
                : product.type === 'bundle'
                ? '#0B7897'
                : '#FFD700',
              color: product.type === 'starter' ? '#063C5E' : 'white',
              fontWeight: 700,
              textTransform: 'uppercase',
              borderRadius: 2,
              px: 3,
              py: 1,
              '&:hover': {
                backgroundColor: product.type === 'membership'
                  ? '#052A42'
                  : product.type === 'bundle'
                  ? '#095f75'
                  : '#FFC700',
              },
            }}
          >
            View Details
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

