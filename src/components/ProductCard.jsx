import { Card, CardContent, CardMedia, Typography, Button, Box, Chip } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function ProductCard({ product, delay = 0 }) {
  const router = useRouter();
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

  // Determine product type for packages navigation
  // Priority: B2B > B2E > B2C
  // B2B: businesses category or targetAudience
  // B2E: schools category or targetAudience
  // B2C: private-users or other B2C categories
  const getProductType = () => {
    // Check B2B first (highest priority)
    if (product.targetAudience === 'businesses' || product.category === 'businesses') {
      return 'B2B';
    }
    
    // Check B2E second
    if (product.targetAudience === 'schools' || product.category === 'schools') {
      return 'B2E';
    }
    
    // Check B2C last
    const productNameLower = product.name?.toLowerCase() || '';
    const isB2C = 
      product.targetAudience === 'private-users' ||
      product.category === 'private-users' ||
      // Product Categories that are B2C
      product.category === 'membership' ||
      product.category === 'template' ||
      product.category === 'guide' ||
      product.category === 'toolkit' ||
      product.category === 'digital-guide' ||
      // Name-based detection (fallback for products without category set)
      productNameLower.includes('scam survival kit') ||
      productNameLower.includes('template') ||
      productNameLower.includes('guide') ||
      productNameLower.includes('membership');
    
    if (isB2C) return 'B2C';
    
    // Default to B2C if nothing matches
    return 'B2C';
  };

  const handleCardClick = (e) => {
    // Don't navigate if clicking on a button or link
    if (e.target.closest('button') || e.target.closest('a')) {
      return;
    }
    router.push(`/products/${product.slug}`);
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
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          paddingTop: '66.67%', // 3:2 aspect ratio (2/3 = 0.6667)
          backgroundColor: '#F5F8FB', // Consistent background color
          overflow: 'hidden',
        }}
      >
        <CardMedia
          component="img"
          image={resolvedImage || fallbackImage}
          alt={product.name}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'saturate(1.05)',
          }}
        />
      </Box>
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {product.badges?.map((badge) => {
            // Trust badges mapping
            const trustBadgeMap = {
              'gdpr-compliant': 'GDPR-compliant',
              'safe-checkout': 'Safe checkout',
              'money-back-guarantee': 'Money-back guarantee',
            };
            
            // Check if it's a trust badge
            const isTrustBadge = trustBadgeMap[badge];
            
            if (isTrustBadge) {
              return (
                <Chip
                  key={badge}
                  label={trustBadgeMap[badge]}
                  size="small"
                  sx={{
                    fontSize: '0.75rem',
                    height: '24px',
                    backgroundColor: 'rgba(6, 60, 94, 0.08)',
                    color: '#063C5E',
                    fontWeight: 500,
                  }}
                />
              );
            }
            
            // Regular badge
            return (
              <Chip
                key={badge}
                label={badge}
                size="small"
                color="primary"
                sx={{ backgroundColor: 'rgba(0,139,139,0.1)' }}
              />
            );
          })}
        </Box>
        <Typography variant="h5" component="h3" gutterBottom sx={{ color: 'text.primary' }}>
          {product.name}
        </Typography>
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            mb: 3, 
            flexGrow: 1,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            lineHeight: 1.6,
          }}
        >
          {product.description}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            mt: 'auto',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
              €{product.price}/month
            </Typography>
            <Button
              variant="contained"
              component={Link}
              href={`/products/${product.slug}`}
              onClick={(e) => {
                e.stopPropagation();
              }}
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
          
          {/* Buy Now button - shows for all products */}
          <Button
            variant="outlined"
            component={Link}
            href={`/packages?type=${getProductType()}&productId=${product._id}`}
            onClick={(e) => {
              e.stopPropagation();
            }}
            sx={{
              borderColor: '#063C5E',
              color: '#063C5E',
              fontWeight: 600,
              borderRadius: 2,
              py: 1,
              '&:hover': {
                borderColor: '#052A42',
                backgroundColor: '#E8F4F8',
              },
            }}
          >
            Buy Now
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

