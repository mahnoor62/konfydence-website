'use client';

import { useState } from 'react';
import { 
  Box, 
  Container, 
  Grid, 
  Typography, 
  Link, 
  IconButton, 
  TextField,
  Button,
  Chip,
  Stack,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';
import TwitterIcon from '@mui/icons-material/Twitter';
import SendIcon from '@mui/icons-material/Send';
import NextLink from 'next/link';

const socialLinks = [
  { icon: LinkedInIcon, href: 'https://linkedin.com', label: 'LinkedIn' },
  { icon: InstagramIcon, href: 'https://instagram.com', label: 'Instagram' },
  { icon: YouTubeIcon, href: 'https://youtube.com', label: 'YouTube' },
  { icon: TwitterIcon, href: 'https://twitter.com', label: 'Twitter' },
];

const trustBadges = [
  'NIS2-Ready',
  'ISO 27001 Aligned',
  'Behavioral Science Backed',
];

const solutionsForHome = [
  { label: 'Family Scam Survival Kit', href: '/sskit-family' },
  { label: 'Digital Extension', href: '/sskit-family' },
  { label: 'Free Family Tech Contract', href: '/resources' },
];

const solutionsForEducation = [
  { label: 'Free Lesson Pack', href: '/resources' },
  { label: 'Student Workshops', href: '/education' },
];

const solutionsForWork = [
  { label: 'CoMaSi Platform', href: '/comasi' },
  { label: 'Request Demo', href: '/contact' },
];

const resources = [
  { label: 'Blog (Latest Insights)', href: '/blog' },
  { label: 'FAQ', href: '/faq' },
  { label: 'The Limbic Hijack', href: '/pdfs/the-limbic-hijack.pdf', external: true },
  { label: 'H.A.C.K. Framework Guide', href: '/resources' },
  { label: 'Ambassador Program', href: '/about' },
  { label: 'Hub', href: '/resources' },
];

const company = [
  { label: 'About Us', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Join Waitlist', href: '/scam-survival-kit' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setEmailError(false);
    setErrorMessage('');
    setSuccessMessage('');

    if (!email || !email.includes('@')) {
      setEmailError(true);
      setErrorMessage('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          subscriptionType: 'general',
          source: 'newsletter-form',
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccessMessage('Successfully subscribed! Thank you for joining us.');
        setEmail('');
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        setEmailError(true);
        setErrorMessage(data.message || 'An error occurred. Please try again.');
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      setEmailError(true);
      setErrorMessage('Unable to subscribe. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#000',
        color: 'white',
        pt: { xs: 6, md: 8 },
        pb: { xs: 4, md: 6 },
        mt: 0,
      }}
    >
      <Container maxWidth='xl' sx={{ px: { xs: 3, md: 5 } }}>
        {/* Main Footer Content - 4 Columns */}
        <Grid container spacing={3} sx={{ mb: 4, justifyContent: 'space-between' }}>
          {/* Column 1: Brand & Mission */}
          <Grid item xs={12} sm={6} md={3}>
            <Box
              component={NextLink}
              href="/"
              sx={{
                textDecoration: 'none',
                color: 'inherit',
                display: 'flex',
                alignItems: 'center',
                gap: 1.2,
                mb: 2,
              }}
            >
              <Box
                component="img"
                src="/images/footer-logo.png"
                alt="Konfydence Logo"
                sx={{
                  width: 48,
                  height: 48,
                  objectFit: 'contain',
                }}
              />
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    fontFamily: 'var(--font-poppins)',
                    letterSpacing: '-0.02em',
                    fontSize: '1.3rem',
                  }}
                >
                  Konfydence
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, fontSize: '0.85rem' }}>
                  Safer Digital Decisions
                </Typography>
              </Box>
            </Box>
            <Typography 
              variant="body2" 
              sx={{ 
                opacity: 0.9, 
                lineHeight: 1.7, 
                mb: 3,
                fontSize: '0.85rem',
              }}
            >
              Empowering families, schools, and teams to pause under pressure and outsmart scams.
            </Typography>
            
            {/* Trust Badges */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {/* First Row: 2 badges */}
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {trustBadges.slice(0, 2).map((badge, index) => (
                  <Chip
                    key={badge}
                    label={badge}
                    size="small"
                    sx={{
                      backgroundColor: index % 2 === 0 ? '#008B8B' : 'white',
                      color: index % 2 === 0 ? 'white' : 'black',
                      fontSize: '0.65rem',
                      height: 24,
                      fontWeight: 600,
                      '& .MuiChip-label': {
                        px: 1,
                      },
                    }}
                  />
                ))}
              </Box>
              {/* Second Row: 1 badge */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                {trustBadges.slice(2, 3).map((badge) => (
                  <Chip
                    key={badge}
                    label={badge}
                    size="small"
                    sx={{
                      backgroundColor: '#008B8B',
                      color: 'white',
                      fontSize: '0.65rem',
                      height: 24,
                      fontWeight: 600,
                      '& .MuiChip-label': {
                        px: 1,
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Grid>

          {/* Column 2: Solutions */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontSize: '0.95rem' }}>
              Solutions
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, opacity: 0.9, fontSize: '0.8rem' }}>
                For Home
              </Typography>
              <Stack spacing={1}>
                {solutionsForHome.map((item) => (
                  <Link
                    key={item.href}
                    component={NextLink}
                    href={item.href}
                    sx={{
                      display: 'block',
                      color: 'rgba(255,255,255,0.85)',
                      fontSize: '0.85rem',
                      textDecoration: 'none',
                      '&:hover': {
                        color: 'white',
                        textDecoration: 'underline',
                      },
                      transition: 'all 0.2s',
                    }}
                  >
                    {item.label}
                  </Link>
                ))}
              </Stack>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, opacity: 0.9, fontSize: '0.8rem' }}>
                For Education
              </Typography>
              <Stack spacing={1}>
                {solutionsForEducation.map((item) => (
                  <Link
                    key={item.href}
                    component={NextLink}
                    href={item.href}
                    sx={{
                      display: 'block',
                      color: 'rgba(255,255,255,0.85)',
                      fontSize: '0.85rem',
                      textDecoration: 'none',
                      '&:hover': {
                        color: 'white',
                        textDecoration: 'underline',
                      },
                      transition: 'all 0.2s',
                    }}
                  >
                    {item.label}
                  </Link>
                ))}
              </Stack>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, opacity: 0.9, fontSize: '0.8rem' }}>
                For Work
              </Typography>
              <Stack spacing={1}>
                {solutionsForWork.map((item) => (
                  <Link
                    key={item.href}
                    component={NextLink}
                    href={item.href}
                    sx={{
                      display: 'block',
                      color: 'rgba(255,255,255,0.85)',
                      fontSize: '0.85rem',
                      textDecoration: 'none',
                      '&:hover': {
                        color: 'white',
                        textDecoration: 'underline',
                      },
                      transition: 'all 0.2s',
                    }}
                  >
                    {item.label}
                  </Link>
                ))}
              </Stack>
            </Box>
          </Grid>

          {/* Column 3: Resources */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontSize: '0.95rem' }}>
              Resources
            </Typography>
            <Stack spacing={1.5}>
              {resources.map((item) => (
                <Link
                  key={item.href}
                  component={item.external ? 'a' : NextLink}
                  href={item.href}
                  target={item.external ? '_blank' : undefined}
                  rel={item.external ? 'noopener noreferrer' : undefined}
                  sx={{
                    display: 'block',
                    color: 'rgba(255,255,255,0.85)',
                    fontSize: '0.85rem',
                    textDecoration: 'none',
                    '&:hover': {
                      color: 'white',
                      textDecoration: 'underline',
                    },
                    transition: 'all 0.2s',
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </Stack>
          </Grid>

          {/* Column 4: Company */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontSize: '0.95rem' }}>
              Company
            </Typography>
            <Stack spacing={1.5}>
              {company.map((item) => (
                <Link
                  key={item.href}
                  component={NextLink}
                  href={item.href}
                  sx={{
                    display: 'block',
                    color: 'rgba(255,255,255,0.85)',
                    fontSize: '0.85rem',
                    textDecoration: 'none',
                    '&:hover': {
                      color: 'white',
                      textDecoration: 'underline',
                    },
                    transition: 'all 0.2s',
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </Stack>
          </Grid>
        </Grid>

        {/* Bottom Bar */}
        <Box
          sx={{
            pt: 4,
            borderTop: '1px solid rgba(255,255,255,0.2)',
            display: 'flex',
            flexDirection: { xs: 'column', lg: 'row' },
            alignItems: 'center',
            justifyContent: { xs: 'center', lg: 'space-between' },
            gap: { xs: 2, lg: 2 },
          }}
        >
          {/* Left: Copyright */}
          <Typography 
            variant="body2" 
            sx={{ 
              opacity: 0.9,
              fontSize: '0.8rem',
              textAlign: { xs: 'center', lg: 'left' },
              whiteSpace: { lg: 'nowrap' },
              flex: { lg: '0 1 auto' },
            }}
          >
            Made in Germany • Proudly supporting Konfydence for Kids <br/>
            Copyright © 2025 Konfydence
          </Typography>

          {/* Center: Email Signup */}
          <Box
            component="form"
            onSubmit={handleEmailSubmit}
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: 'center',
              justifyContent: 'center',
              gap: { xs: 1.5, md: 1.5 },
              flex: { lg: '0 1 auto' },
              width: { xs: '100%', lg: 'auto' },
              maxWidth: { xs: '100%', md: 500 },
            }}
          >
            <Typography 
              variant="body2" 
              sx={{ 
                opacity: 0.9,
                fontSize: { xs: '0.75rem', md: '0.8rem' },
                whiteSpace: { xs: 'normal', md: 'nowrap' },
                display: 'block',
                mb: { xs: 0.5, md: 0 },
                textAlign: 'center',
                width: { xs: '100%', md: 'auto' },
              }}
            >
              Join 10,000+ building the pause habit
            </Typography>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                gap: { xs: 1.5, md: 1 },
                width: { xs: '100%', md: 'auto' },
                justifyContent: 'center',
              }}
            >
              <TextField
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError(false);
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                error={emailError}
                helperText={errorMessage}
                size="small"
                disabled={isSubmitting}
                sx={{
                  width: { xs: '100%', md: '200px' },
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    '& fieldset': {
                      borderColor: 'rgba(255,255,255,0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255,255,255,0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'rgba(255,255,255,0.7)',
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: 'white',
                    fontSize: { xs: '0.875rem', md: '0.8rem' },
                    py: { xs: 1.25, md: 0.75 },
                    '&::placeholder': {
                      color: 'rgba(255,255,255,0.6)',
                      opacity: 1,
                    },
                  },
                }}
              />
              <Button
                type="submit"
                variant="contained"
                endIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
                disabled={isSubmitting}
                sx={{
                  backgroundColor: '#008B8B',
                  color: 'white',
                  px: { xs: 3, md: 2.5 },
                  py: { xs: 1.25, md: 0.75 },
                  fontSize: { xs: '0.875rem', md: '0.8rem' },
                  textTransform: 'none',
                  whiteSpace: 'nowrap',
                  width: { xs: '100%', md: 'auto' },
                  minWidth: { xs: 'auto', md: 140 },
                  '&:hover': {
                    backgroundColor: '#006E6E',
                  },
                  '&:disabled': {
                    backgroundColor: '#008B8B',
                    opacity: 0.7,
                  },
                }}
              >
                {isSubmitting ? 'Subscribing...' : 'Get Updates'}
              </Button>
            </Box>
          </Box>

          {/* Right: Social Icons */}
          <Box sx={{ 
            display: 'flex', 
            gap: 0.5, 
            justifyContent: { xs: 'center', lg: 'flex-end' },
            flex: { lg: '0 1 auto' },
            whiteSpace: 'nowrap',
          }}>
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <IconButton
                  key={social.label}
                  component="a"
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: 'white',
                    opacity: 0.9,
                    '&:hover': {
                      opacity: 1,
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  <Icon />
                </IconButton>
              );
            })}
          </Box>
        </Box>
      </Container>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={!!successMessage || !!errorMessage}
        autoHideDuration={5000}
        onClose={() => {
          setSuccessMessage('');
          setErrorMessage('');
        }}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => {
            setSuccessMessage('');
            setErrorMessage('');
          }}
          severity={successMessage ? 'success' : 'error'}
          sx={{ width: '100%' }}
        >
          {successMessage || errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
