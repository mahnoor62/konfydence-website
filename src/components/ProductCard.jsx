import { Card, CardContent, CardMedia, Typography, Button, Box, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';

// Utility function to strip HTML tags for preview
const stripHtmlTags = (html) => {
  if (!html) return '';
  // Remove HTML tags and decode HTML entities
  return html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
    .replace(/&amp;/g, '&') // Replace &amp; with &
    .replace(/&lt;/g, '<') // Replace &lt; with <
    .replace(/&gt;/g, '>') // Replace &gt; with >
    .replace(/&quot;/g, '"') // Replace &quot; with "
    .replace(/&#39;/g, "'") // Replace &#39; with '
    .trim();
};

export default function ProductCard({ product, delay = 0, hidePrice = false, buttonText = 'Buy Now' }) {
  const router = useRouter();
  const { user: authUser, getAuthToken } = useAuth();
  const [customPackageDialogOpen, setCustomPackageDialogOpen] = useState(false);
  const [customPackageForm, setCustomPackageForm] = useState({
    organizationName: '',
    contactName: '',
    email: '',
    phone: '',
    numberOfSeats: '',
    pricingRequirements: '',
    additionalRequirements: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  const fallbackImage = '/images/placeholders/product-default.svg';
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const API_URL = `${API_BASE_URL}/api`;
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

  // Check if product is B2B or B2E (Organizations, Schools, Companies)
  const isB2BOrB2E = () => {
    const productType = getProductType();
    return productType === 'B2B' || productType === 'B2E';
  };

  // Get contact page topic based on target audience
  const getContactTopic = () => {
    if (product.targetAudience === 'businesses' || product.category === 'businesses') {
      return 'b2b_demo';
    }
    if (product.targetAudience === 'schools' || product.category === 'schools') {
      return 'b2e_demo';
    }
    // Default to B2B if it's a B2B/B2E product but targetAudience is not set
    if (isB2BOrB2E()) {
      return 'b2b_demo';
    }
    return 'b2c_demo';
  };

  const handleCardClick = (e) => {
    // Don't navigate if clicking on a button or link
    if (e.target.closest('button') || e.target.closest('a') || e.target.closest('[role="dialog"]')) {
      return;
    }
    router.push(`/products/${product.slug}`);
  };

  const handleCustomPricingClick = (e) => {
    e.stopPropagation();
    // Check if user is logged in, if not redirect to login
    if (!authUser) {
      router.push(`/login?redirect=${encodeURIComponent(router.asPath)}&action=custom_package`);
      return;
    }
    // Pre-fill form with user data if available
    setCustomPackageForm({
      organizationName: authUser.organizationId?.name || authUser.schoolId?.name || '',
      contactName: authUser.name || '',
      email: authUser.email || '',
      phone: authUser.phone || '',
      numberOfSeats: '',
      pricingRequirements: '',
      additionalRequirements: '',
    });
    setCustomPackageDialogOpen(true);
  };

  const handleCustomPackageSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user is logged in
    if (!authUser) {
      router.push(`/login?redirect=${encodeURIComponent(router.asPath)}&action=custom_package`);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Please login to submit a custom package request');
      }

      const response = await axios.post(
        `${API_URL}/custom-package-requests`,
        {
          productId: product._id,
          productName: product.name,
          targetAudience: product.targetAudience || getProductType().toLowerCase(),
          organizationName: customPackageForm.organizationName,
          contactName: customPackageForm.contactName,
          contactEmail: customPackageForm.email,
          contactPhone: customPackageForm.phone,
          numberOfSeats: customPackageForm.numberOfSeats,
          pricingRequirements: customPackageForm.pricingRequirements,
          message: customPackageForm.additionalRequirements,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setSubmitSuccess(true);
      setCustomPackageForm({
        organizationName: '',
        contactName: '',
        email: '',
        phone: '',
        numberOfSeats: '',
        pricingRequirements: '',
        additionalRequirements: '',
      });
      
      // Close dialog after 2 seconds
      setTimeout(() => {
        setCustomPackageDialogOpen(false);
        setSubmitSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Error submitting custom package request:', error);
      setSubmitError(
        error.response?.data?.error || 
        error.response?.data?.errors?.[0]?.msg ||
        error.message || 
        'Failed to submit request. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseDialog = () => {
    if (!submitting) {
      setCustomPackageDialogOpen(false);
      setSubmitError(null);
      setSubmitSuccess(false);
      setCustomPackageForm({
        organizationName: '',
        contactName: '',
        email: '',
        phone: '',
        numberOfSeats: '',
        pricingRequirements: '',
        additionalRequirements: '',
      });
    }
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
          {product.badges?.filter((badge) => {
            // Only show approved badges - no third-party logos without written permission
            // Approved badges list
            const approvedBadges = [
              'gdpr-compliant',
              'safe-checkout',
              'money-back-guarantee',
              'nis2-ready',
              'custom-pricing',
            ];
            
            // Check if badge is approved (exact match or contains approved keyword)
            return approvedBadges.some(approved => 
              badge.toLowerCase() === approved.toLowerCase() ||
              badge.toLowerCase().includes(approved.toLowerCase())
            );
          }).map((badge) => {
            // Trust badges mapping
            const trustBadgeMap = {
              'gdpr-compliant': 'GDPR-compliant',
              'safe-checkout': 'Safe checkout',
              'money-back-guarantee': 'Money-back guarantee',
              'nis2-ready': 'NIS2-ready',
              'custom-pricing': 'Custom pricing',
            };
            
            // Check if it's a trust badge
            const isTrustBadge = trustBadgeMap[badge.toLowerCase()];
            
            if (isTrustBadge) {
              return (
                <Chip
                  key={badge}
                  label={trustBadgeMap[badge.toLowerCase()] || badge}
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
            
            // Regular approved badge
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
          {stripHtmlTags(product.description)}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            mt: 'auto',
          }}
        >
          {isB2BOrB2E() ? (
            // B2B/B2E: Custom pricing and Request Demo button
            <>
              {/* Custom Pricing Box - Clickable */}
              <Box
                onClick={handleCustomPricingClick}
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  mb: 2,
                  p: 1.5,
                  backgroundColor: '#F5F8FB',
                  borderRadius: 2,
                  border: '1px solid #E0E7F0',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: '#E8F4F8',
                    borderColor: '#0B7897',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontWeight: 600, 
                    color: '#063C5E',
                    textAlign: 'center',
                  }}
                >
                  Custom pricing · NIS2-ready
                </Typography>
              </Box>
              
              {/* Buttons Container - Responsive Layout */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  gap: { xs: 1.5, md: 1 },
                  width: '100%',
                }}
              >
                {/* Request Demo Button */}
                <Button
                  variant="contained"
                  component={Link}
                  href={`/contact?topic=${getContactTopic()}`}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  sx={{
                    backgroundColor: '#00A4E8',
                    color: 'white',
                    fontWeight: 700,
                    borderRadius: 2,
                    px: { xs: 3, md: 2 },
                    py: { xs: 1.5, md: 1 },
                    fontSize: { xs: '1rem', md: '0.875rem' },
                    width: { xs: '100%', md: '50%' },
                    flex: { xs: 'none', md: 1 },
                    '&:hover': {
                      backgroundColor: '#0088C7',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0, 164, 232, 0.3)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Request Demo
                </Button>

                {/* Buy Now / Get Early Access Button for B2B/B2E */}
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
                    px: { xs: 3, md: 2 },
                    py: { xs: 1.5, md: 1 },
                    fontSize: { xs: '1rem', md: '0.875rem' },
                    width: { xs: '100%', md: '50%' },
                    flex: { xs: 'none', md: 1 },
                    '&:hover': {
                      borderColor: '#052A42',
                      backgroundColor: '#E8F4F8',
                    },
                  }}
                >
                  {buttonText}
                </Button>
              </Box>
            </>
          ) : (
            // B2C: Price and Buy Now button
            <>
              {!hidePrice && (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
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
              )}
              
              {/* Buy Now / Get Early Access button - shows for B2C products */}
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
                  width: '100%',
                  '&:hover': {
                    borderColor: '#052A42',
                    backgroundColor: '#E8F4F8',
                  },
                }}
              >
                {buttonText}
              </Button>
            </>
          )}
        </Box>
      </CardContent>

      {/* Custom Package Request Dialog */}
      <Dialog 
        open={customPackageDialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        onClick={(e) => e.stopPropagation()}
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#063C5E' }}>
          Request Custom Package
        </DialogTitle>
        <DialogContent>
          {submitSuccess ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              Your custom package request has been submitted successfully! We&apos;ll contact you soon.
            </Alert>
          ) : (
            <form onSubmit={handleCustomPackageSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                <TextField
                  fullWidth
                  label="Organization Name"
                  value={customPackageForm.organizationName}
                  onChange={(e) => setCustomPackageForm({ ...customPackageForm, organizationName: e.target.value })}
                  required
                  disabled={submitting}
                  helperText="* Required"
                />
                <TextField
                  fullWidth
                  label="Contact Name"
                  value={customPackageForm.contactName}
                  onChange={(e) => setCustomPackageForm({ ...customPackageForm, contactName: e.target.value })}
                  required
                  disabled={submitting}
                  helperText="* Required"
                />
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={customPackageForm.email}
                  onChange={(e) => setCustomPackageForm({ ...customPackageForm, email: e.target.value })}
                  required
                  disabled={submitting}
                  helperText="* Required"
                />
                <TextField
                  fullWidth
                  label="Phone"
                  type="tel"
                  value={customPackageForm.phone}
                  onChange={(e) => setCustomPackageForm({ ...customPackageForm, phone: e.target.value })}
                  disabled={submitting}
                />
                <TextField
                  fullWidth
                  label="Number of Seats/Users"
                  type="number"
                  value={customPackageForm.numberOfSeats}
                  onChange={(e) => setCustomPackageForm({ ...customPackageForm, numberOfSeats: e.target.value })}
                  disabled={submitting}
                  helperText="How many users will need access?"
                  inputProps={{ min: 1 }}
                />
                <TextField
                  fullWidth
                  label="Custom Pricing Requirements"
                  multiline
                  rows={3}
                  value={customPackageForm.pricingRequirements}
                  onChange={(e) => setCustomPackageForm({ ...customPackageForm, pricingRequirements: e.target.value })}
                  disabled={submitting}
                  helperText="Describe your pricing needs (e.g., annual contract, volume discount)"
                  placeholder="e.g., Annual contract, volume discount, etc."
                />
                <TextField
                  fullWidth
                  label="Additional Requirements"
                  multiline
                  rows={4}
                  value={customPackageForm.additionalRequirements}
                  onChange={(e) => setCustomPackageForm({ ...customPackageForm, additionalRequirements: e.target.value })}
                  disabled={submitting}
                  helperText="Tell us about any specific cards you'd like to add or remove, custom features, or other requirements"
                  placeholder="Tell us about specific cards, custom features, or other requirements..."
                />
                {submitError && (
                  <Alert severity="error">
                    {submitError}
                  </Alert>
                )}
              </Box>
            </form>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          {!submitSuccess && (
            <>
              <Button onClick={handleCloseDialog} disabled={submitting}>
                Cancel
              </Button>
              <Button
                onClick={handleCustomPackageSubmit}
                variant="contained"
                disabled={submitting}
                sx={{
                  backgroundColor: '#0B7897',
                  '&:hover': { backgroundColor: '#063C5E' },
                }}
              >
                {submitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            </>
          )}
          {submitSuccess && (
            <Button
              onClick={handleCloseDialog}
              variant="contained"
              sx={{
                backgroundColor: '#0B7897',
                '&:hover': { backgroundColor: '#063C5E' },
              }}
            >
              Close
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Card>
  );
}

