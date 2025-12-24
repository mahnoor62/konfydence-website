'use client';

import { useEffect, useState } from 'react';
import { Box, Container, Grid, Typography, Link, IconButton, Stack } from '@mui/material';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';
import TwitterIcon from '@mui/icons-material/Twitter';
import NextLink from 'next/link';
import axios from 'axios';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'CoMaSy', href: '/comasy' },
  { label: 'Education', href: '/education' },
  { label: 'Shop', href: '/shop' },
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

const footerLinks = {
  company: [
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'CoMaSy', href: '/comasy' },
  ],
  resources: [
    { label: 'Blog', href: '/blog' },
    { label: 'Education', href: '/education' },
    { label: 'Shop', href: '/shop' },
    { label: 'FAQ', href: '/faq' },
  ],
  legal: [
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
  ],
};

const socialLinks = [
  { icon: LinkedInIcon, href: 'https://linkedin.com', label: 'LinkedIn' },
  { icon: InstagramIcon, href: 'https://instagram.com', label: 'Instagram' },
  { icon: YouTubeIcon, href: 'https://youtube.com', label: 'YouTube' },
  { icon: TwitterIcon, href: 'https://twitter.com', label: 'Twitter' },
];

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

const formatTypeName = (slug = '') =>
  slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

export default function Footer() {
  const [footerTypes, setFooterTypes] = useState([]);

  useEffect(() => {
    const fetchFooterTypes = async () => {
      let types = [];

      try {
        const res = await axios.get(`${API_URL}/productTypes`, {
          headers: NO_CACHE_HEADERS,
          params: { active: 'true', _t: Date.now() },
        });
        types = Array.isArray(res.data) ? res.data : res.data?.types || [];
      } catch (error) {
        if (error.response?.status !== 404) {
          console.error('❌ Error fetching footer product types:', {
            url: `${API_URL}/productTypes`,
            error: error.response?.data || error.message,
            status: error.response?.status,
          });
        }
      }

      if (!types.length) {
        try {
          const fallbackRes = await axios.get(`${API_URL}/products`, {
            headers: NO_CACHE_HEADERS,
            params: { all: true, _t: Date.now() },
          });
          const allProducts = Array.isArray(fallbackRes.data)
            ? fallbackRes.data
            : fallbackRes.data?.products || [];

          types = Array.from(
            new Map(
              allProducts
                .map((product) => product.type)
                .filter(Boolean)
                .map((typeSlug) => [
                  typeSlug,
                  {
                    slug: typeSlug,
                    name: formatTypeName(typeSlug),
                  },
                ])
            ).values()
          );
        } catch (fallbackError) {
          console.error('❌ Error deriving footer product types:', {
            url: `${API_URL}/products?all=true`,
            error: fallbackError.response?.data || fallbackError.message,
            status: fallbackError.response?.status,
          });
        }
      }

      setFooterTypes((types || []).slice(0, 3));
    };

    fetchFooterTypes();
  }, []);

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'black',
        color: 'white',
        pt: 8,
        pb: 4,
        mt: 0,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={6} sx={{ position: 'relative', zIndex: 1, mb: 6 }}>
          <Grid item xs={12} md={4}>
            <Box
              component={NextLink}
              href="/"
              sx={{
                textDecoration: 'none',
                color: 'inherit',
                display: 'flex',
                alignItems: 'center',
                gap: 1.2,
                mb: 3,
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #00c4c7, #1c6edb)',
                  display: 'grid',
                  placeItems: 'center',
                  color: 'white',
                  fontWeight: 700,
                  fontFamily: 'var(--font-poppins)',
                  fontSize: '1.3rem',
                }}
              >
                K
              </Box>
              <Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    fontFamily: 'var(--font-poppins)',
                    letterSpacing: '-0.02em',
                    mb: 0.5,
                    fontSize: '1.55rem',
                  }}
                >
                  Konfydence
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, fontSize: '0.82rem' }}>
                  Safer Digital Decisions
                </Typography>
              </Box>
            </Box>
            <Typography variant="body2" sx={{ opacity: 0.9, lineHeight: 1.7, maxWidth: 320, mb: 4 }}>
              Empowering individuals, schools, and businesses with interactive scam prevention training and compliance solutions.
            </Typography>

            {/* Navigation Menu */}
            {/* <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontSize: '0.95rem' }}>
                Navigation
              </Typography>
              <Stack spacing={1} direction="row" flexWrap="wrap" gap={1.5}>
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    component={NextLink}
                    href={item.href}
                    color="inherit"
                    underline="hover"
                    sx={{
                      opacity: 0.85,
                      fontSize: '0.9rem',
                      whiteSpace: 'nowrap',
                      '&:hover': {
                        opacity: 1,
                      },
                    }}
                  >
                    {item.label}
                  </Link>
                ))}
              </Stack>
            </Box> */}
          </Grid>

          <Grid item xs={6} sm={6} md={2}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontSize: '0.95rem' }}>
              Products
            </Typography>
            {footerTypes.map((type) => (
              <Link
                key={type.slug}
                component={NextLink}
                href={`/products?type=${encodeURIComponent(type.slug)}`}
                color="inherit"
                underline="hover"
                sx={{ display: 'block', mb: 1.5, opacity: 0.85, fontSize: '0.9rem', '&:hover': { opacity: 1 } }}
              >
                {type.name || formatTypeName(type.slug)}
              </Link>
            ))}
          </Grid>

          <Grid item xs={6} sm={6} md={2}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontSize: '0.95rem' }}>
              Company
            </Typography>
            {footerLinks.company.map((link) => (
              <Link
                key={link.href}
                component={NextLink}
                href={link.href}
                color="inherit"
                underline="hover"
                sx={{ display: 'block', mb: 1.5, opacity: 0.85, fontSize: '0.9rem', '&:hover': { opacity: 1 } }}
              >
                {link.label}
              </Link>
            ))}
          </Grid>

          <Grid item xs={6} sm={6} md={2}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontSize: '0.95rem' }}>
              Resources
            </Typography>
            {footerLinks.resources.map((link) => (
              <Link
                key={link.href}
                component={NextLink}
                href={link.href}
                color="inherit"
                underline="hover"
                sx={{ display: 'block', mb: 1.5, opacity: 0.85, fontSize: '0.9rem', '&:hover': { opacity: 1 } }}
              >
                {link.label}
              </Link>
            ))}
          </Grid>

          <Grid item xs={6} sm={6} md={2}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontSize: '0.95rem' }}>
              Legal
            </Typography>
            {footerLinks.legal.map((link) => (
              <Link
                key={link.href}
                component={NextLink}
                href={link.href}
                color="inherit"
                underline="hover"
                sx={{ display: 'block', mb: 1.5, opacity: 0.85, fontSize: '0.9rem', '&:hover': { opacity: 1 } }}
              >
                {link.label}
              </Link>
            ))}
          </Grid>
        </Grid>

        <Box
          sx={{
            pt: 4,
            borderTop: '1px solid rgba(255,255,255,0.2)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
          Copyright © 2026 Konfydence UG (haftungsbeschränkt)
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
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
    </Box>
  );
}


