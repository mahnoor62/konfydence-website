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
import FacebookIcon from '@mui/icons-material/Facebook';
import SendIcon from '@mui/icons-material/Send';
import NextLink from 'next/link';
import AmbassadorPopup from './AmbassadorPopup';

// TikTok Icon Component
const TikTokIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    width="24"
    height="24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const socialLinks = [
  { icon: LinkedInIcon, href: 'https://www.linkedin.com/in/tichi-mbanwie-854a231a7/', label: 'LinkedIn' },
  { icon: FacebookIcon, href: 'https://www.facebook.com/profile.php?id=100017665030097', label: 'Facebook' },
  { icon: InstagramIcon, href: 'https://www.instagram.com/konfydence_game', label: 'Instagram' },
  // { icon: TikTokIcon, href: 'https://www.tiktok.com/@konfydence_', label: 'TikTok' },
];

const trustBadges = [
  'NIS2-Ready',
  'ISO 27001 Aligned',
  'Behavioral Science Backed',
];

const solutionsForHome = [
  { label: 'Family Scam Survival Kit', href: '/sskit-family' },
  // { label: 'Digital Extension', href: '/sskit-family' },
  { label: 'Free Family Tech Contract', href: '/resources' },
];

const solutionsForEducation = [
  // { label: 'Education', href: '/education' },
  // { label: 'Student Workshops', href: '/education' },
];

const solutionsForWork = [
  { label: 'Scenario Lab Platform', href: '/scenario-lab' },
  { label: 'Request Demo', href: '/contact' },
];

const resources = [
  { label: 'Blog (Latest Insights)', href: '/blog' },
  { label: 'FAQ', href: '/faq' },
  { label: 'The Limbic Hijack', href: '/pdfs/the-limbic-hijack.pdf', external: true },
  // { label: 'H.A.C.K. Framework Guide', href: '/resources' },
  { label: 'Ambassador Program', href: '/about' },
  { label: 'Resource Hub', href: '/resources' },
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
  const [ambassadorPopupOpen, setAmbassadorPopupOpen] = useState(false);

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
        pt: { xs: 6, md: 5 },
        pb: { xs: 4, md: 5 },
        mt: 0,
      }}
    >
      <Container maxWidth='xl' sx={{ px: { xs: 3, md: 5 } }}>
        {/* Top Row - Centered Text */}
        <Box
          sx={{
            textAlign: 'center',
            mb: 5,
            // pt: { xs: 2, md: 3 },
          }}
        >
          <Typography
            variant="body1"
            sx={{
              color: 'white',
              // fontSize: { xs: '1rem', md: '1.25rem' },
              fontWeight: 600,
              // letterSpacing: '0.5px',
            }}
          >
            Scammers want you to act fast. We train you to act faster. By pausing first.
          </Typography>
        </Box>
        
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
           Train the moment before it decides for you.
            </Typography>
            
            {/* Trust Badges */}
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 0.75, flexWrap: 'wrap' }}>
              {trustBadges.map((badge, index) => (
                <Chip
                  key={badge}
                  label={badge}
                  size="small"
                  sx={{
                    backgroundColor: index % 2 === 0 ? '#008B8B' : 'white',
                    color: index % 2 === 0 ? 'white' : 'black',
                    fontSize: '0.55rem',
                    height: 20,
                    fontWeight: 600,
                    '& .MuiChip-label': {
                      px: 0.75,
                      py: 0,
                    },
                  }}
                />
              ))}
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
              <Link
                component={NextLink}
                href="/education"
                sx={{
                  display: 'block',
                  mb: 1,
                  fontWeight: 600,
                  opacity: 0.9,
                  fontSize: '0.8rem',
                  color: 'white',
                  textDecoration: 'none',
                  '&:hover': {
                    opacity: 1,
                    textDecoration: 'underline',
                  },
                  transition: 'all 0.2s',
                }}
              >
                For Education
              </Link>
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
                item.label === 'Ambassador Program' ? (
                  <Link
                    key={item.href}
                    component="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setAmbassadorPopupOpen(true);
                    }}
                    sx={{
                      display: 'block',
                      color: 'rgba(255,255,255,0.85)',
                      fontSize: '0.85rem',
                      textDecoration: 'none',
                      textAlign: 'left',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      '&:hover': {
                        color: 'white',
                        textDecoration: 'underline',
                      },
                      transition: 'all 0.2s',
                    }}
                  >
                    {item.label}
                  </Link>
                ) : (
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
                )
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

      {/* Ambassador Popup */}
      <AmbassadorPopup
        open={ambassadorPopupOpen}
        onClose={() => setAmbassadorPopupOpen(false)}
      />
    </Box>
  );
}
