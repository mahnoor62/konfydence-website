import { useEffect, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  Stack,
  Button,
  Divider,
  Chip,
} from '@mui/material';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import axios from 'axios';

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

console.log('🔗 About Page API URL:', API_URL);

export async function getServerSideProps() {
  let settings = null;
  const ts = Date.now();

  try {
    const url = `${API_URL}/settings`;
    console.log('📡 API: GET', url);
    const res = await axios.get(url, {
      headers: NO_CACHE_HEADERS,
      params: { _t: ts },
    });
    
    settings = res.data;
  } catch (error) {
    console.error('❌ Error fetching settings:', {
      url: `${API_URL}/settings`,
      error: error.response?.data || error.message,
      status: error.response?.status,
    });
  }

  return {
    props: {
      settings,
    },
  };
}

export default function AboutPage({ settings }) {
  const pillarRefs = useRef([]);

  useEffect(() => {
    // Intersection Observer for pillar animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, observerOptions);

    pillarRefs.current.forEach((ref) => {
      if (ref) {
        observer.observe(ref);
      }
    });

    return () => {
      const currentRefs = pillarRefs.current;
      currentRefs.forEach((ref) => {
        if (ref) {
          observer.unobserve(ref);
        }
      });
    };
  }, []);

  return (
    <>
      <Header />
      <Box component="main" sx={{ backgroundColor: '#F4F8FD' }}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #063C5E 0%, #0B7897 80%)',
            color: 'white',
            py: { xs: 8, md: 12 },
          }}
        >
          <Container data-aos="zoom-in" data-aos-duration="900" maxWidth="lg" sx={{ mt: { xs: 8, md: 10 } }}>
            <Grid container spacing={6} alignItems="center">
              <Grid item xs={12} md={7}>
                <Typography variant="h2" sx={{ fontWeight: 700, mt: 2, mb: 3, lineHeight: 1.2 }}>
                  We help people recognize HACKs before they get HACKED.
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ opacity: 0.95, mb: 2, maxWidth: 600, color: 'rgba(255,255,255,0.95)', fontWeight: 500 }}
                >
                  Most cybercrime doesn&apos;t start with code — it starts with a HACK on human behavior.
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ opacity: 0.9, mb: 4, maxWidth: 520, color: 'rgba(255,255,255,0.95)' }}
                >
                  Konfydence trains people to spot manipulation before it works.
                </Typography>
              </Grid>
              <Grid item xs={12} md={5}>
                <Box
                  sx={{
                    position: 'relative',
                    animation: 'floatCard 4s ease-in-out infinite',
                    transformOrigin: 'center',
                    filter: 'drop-shadow(0 25px 45px rgba(6,60,94,0.35))',
                    padding: { xs: 2, md: 0 },
                    '@keyframes floatCard': {
                      '0%': { transform: 'translateY(0px) rotate(0deg)', filter: 'brightness(1)' },
                      '50%': {
                        transform: 'translateY(-15px) rotate(-1deg)',
                        filter: 'brightness(1.07)',
                      },
                      '100%': { transform: 'translateY(0px) rotate(0deg)', filter: 'brightness(1)' },
                    },
                  }}
                >
                  <Box
                    sx={{
                      position: 'relative',
                      backgroundImage:
                        'url(https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=900&q=80)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      borderRadius: 4,
                      height: { xs: 280, md: 360 },
                      width: '100%',
                      maxWidth: '100%',
                      boxShadow: '0 35px 95px rgba(4,37,58,0.45), 0 0 40px rgba(255,255,255,0.35)',
                      overflow: 'hidden',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(11,120,151,0.2))',
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: '-50%',
                        left: '-50%',
                        width: '200%',
                        height: '200%',
                        background: 'radial-gradient(circle, rgba(255,255,255,0.45), transparent 60%)',
                        animation: 'pulseGlow 6s ease-in-out infinite',
                      },
                      '@keyframes pulseGlow': {
                        '0%': { transform: 'translate(-20%, -20%) scale(1)' },
                        '50%': { transform: 'translate(10%, 10%) scale(1.1)', opacity: 0.7 },
                        '100%': { transform: 'translate(-20%, -20%) scale(1)' },
                      },
                    }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>

        <Container data-aos="zoom-in" data-aos-duration="900" maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
          {/* Our Why Section */}
          <Box sx={{ mb: 10, textAlign: 'center' }}>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 3, color: '#052A42' }}>
              Our Why
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 4, color: '#063C5E', maxWidth: 800, mx: 'auto' }}>
              Scammers don&apos;t hack computers. They HACK people.
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#0B7897' }}>
              They exploit:
            </Typography>
            <Grid container spacing={3} sx={{ mb: 4, maxWidth: 700, mx: 'auto' }}>
              {[
                { label: 'Hurry', sublabel: '(Urgency)' },
                { label: 'Authority', sublabel: '' },
                { label: 'Trust', sublabel: '' },
                { label: 'Kindness', sublabel: '(emotional pressure)' },
              ].map((item) => (
                <Grid item xs={6} sm={3} key={item.label}>
                  <Card sx={{ 
                    borderRadius: 2, 
                    p: 2, 
                    textAlign: 'center', 
                    backgroundColor: '#E9F4FF',
                    height: '100%',
                    minHeight: { xs: '100px', sm: '120px' },
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#063C5E', mb: item.sublabel ? 0.5 : 0 }}>
                      {item.label}
                    </Typography>
                    {item.sublabel && (
                      <Typography variant="caption" color="text.secondary">
                        {item.sublabel}
                      </Typography>
                    )}
                    {!item.sublabel && (
                      <Typography variant="caption" sx={{ opacity: 0 }}>
                        &nbsp;
                      </Typography>
                    )}
                  </Card>
                </Grid>
              ))}
            </Grid>
            <Typography variant="body1" sx={{ maxWidth: 800, mx: 'auto', fontSize: '1.1rem', lineHeight: 1.8, color: '#063C5E' }}>
              Konfydence exists to make these patterns visible — so people can pause, think, and act safely.
            </Typography>
          </Box>

          {/* What Konfydence Does */}
          <Box sx={{ mb: 10 }}>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 3, color: '#052A42', textAlign: 'center' }}>
              What Konfydence Does
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 4, color: '#063C5E', textAlign: 'center', maxWidth: 800, mx: 'auto' }}>
              Konfydence turns real-world HACKs into:
            </Typography>
            <Grid container spacing={3} sx={{ mb: 4, maxWidth: 900, mx: 'auto' }}>
              {[
                'Interactive card-based simulations',
                'Guided discussions',
                'Measurable behavior signals',
              ].map((item) => (
                <Grid item xs={12} md={4} key={item}>
                  <Card sx={{ borderRadius: 3, p: 3, textAlign: 'center', height: '100%', backgroundColor: '#F5F8FB' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#063C5E' }}>
                      {item}
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
            <Box sx={{ textAlign: 'center', maxWidth: 700, mx: 'auto' }}>
              <Typography variant="body1" sx={{ fontSize: '1.1rem', fontWeight: 600, color: '#063C5E', mb: 1 }}>
                Not awareness.
              </Typography>
              <Typography variant="body1" sx={{ fontSize: '1.1rem', fontWeight: 600, color: '#063C5E', mb: 1 }}>
                Not lectures.
              </Typography>
              <Typography variant="h6" sx={{ fontSize: '1.3rem', fontWeight: 700, color: '#0B7897' }}>
                Decision training.
              </Typography>
            </Box>
          </Box>

          {/* One System. Multiple Audiences */}
          <Box sx={{ mb: 10 }}>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 4, color: '#052A42', textAlign: 'center' }}>
              One System. Multiple Audiences.
            </Typography>
            <Grid container spacing={4} sx={{ maxWidth: 1000, mx: 'auto' }}>
              <Grid item xs={12} md={4}>
                <Card sx={{ borderRadius: 3, p: 4, height: '100%', backgroundColor: '#E9F4FF' }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#063C5E' }}>
                    Families
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                    Learn to recognize HACKs together — across generations.
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ borderRadius: 3, p: 4, height: '100%', backgroundColor: '#E9F4FF' }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#063C5E' }}>
                    Schools
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                    Build early digital confidence through play and discussion.
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ borderRadius: 3, p: 4, height: '100%', backgroundColor: '#E9F4FF' }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#063C5E' }}>
                    Companies & Auditors
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                    Document human-risk awareness with evidence, not checkboxes.
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </Box>

          {/* Konfydence for Kids */}
          <Box sx={{ mb: 10, backgroundColor: '#F5F8FB', borderRadius: 4, p: { xs: 4, md: 6 } }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: '#052A42', textAlign: 'center' }}>
              Konfydence for Kids
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 3, color: '#063C5E', textAlign: 'center', fontStyle: 'italic' }}>
              (charity model — now explicit)
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#0B7897', textAlign: 'center' }}>
              HACKs start early. So does protection.
            </Typography>
            <Typography variant="body1" sx={{ mb: 2, textAlign: 'center', maxWidth: 800, mx: 'auto', lineHeight: 1.8, color: '#063C5E' }}>
              For every Youth Pack used, €1 is donated to organizations that strengthen children&apos;s digital resilience.
            </Typography>
            <Typography variant="body1" sx={{ textAlign: 'center', maxWidth: 800, mx: 'auto', lineHeight: 1.8, fontWeight: 600, color: '#063C5E' }}>
              Learning that protects others — not just yourself.
            </Typography>
          </Box>

          {/* Proof & Reach */}
          <Grid container spacing={4} sx={{ mb: 10 }}>
            {[
              { label: 'people trained to recognize HACK patterns', value: '45,000+' },
              { label: 'countries active', value: '12+' },
              { label: 'simulated HACK scenarios discussed', value: 'Millions of' },
            ].map((stat) => (
              <Grid item xs={12} md={4} key={stat.label}>
                <Card sx={{ borderRadius: 3, boxShadow: '0 15px 40px rgba(6,60,94,0.08)' }}>
                  <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#0B7897' }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.label}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Recognition */}
          <Box sx={{ mb: 10, textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: '#052A42' }}>
              Recognition
            </Typography>
            <Typography variant="body1" sx={{ maxWidth: 800, mx: 'auto', fontSize: '1.1rem', lineHeight: 1.8, color: '#063C5E', fontStyle: 'italic' }}>
              Recognized by educators, compliance teams, and digital-safety advocates who care about human-first security.
            </Typography>
          </Box>

          {/* Key Message */}
          <Box sx={{ mb: 10, textAlign: 'center', backgroundColor: '#E9F4FF', borderRadius: 4, p: { xs: 4, md: 6 } }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#052A42', maxWidth: 900, mx: 'auto', lineHeight: 1.6 }}>
              Konfydence doesn&apos;t teach people about scams.
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#0B7897', maxWidth: 900, mx: 'auto', lineHeight: 1.6 }}>
              It teaches them how HACKs work — and how to stop them.
            </Typography>
          </Box>

          {settings?.founderQuote && (
            <Card
              sx={{
                mb: 10,
                borderRadius: 4,
                p: { xs: 4, md: 6 },
                backgroundColor: '#052A42',
                color: 'white',
                boxShadow: '0 25px 60px rgba(5,42,66,0.4)',
              }}
            >
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems="center">
                <Avatar
                  sx={{
                    width: { xs: 100, md: 120 },
                    height: { xs: 100, md: 120 },
                    bgcolor: '#0B7897',
                    fontSize: { xs: '1.5rem', md: '2rem' },
                    margin: { xs: '0 auto', md: 0 },
                  }}
                >
                  {(settings.founderName || 'K')[0]}
                </Avatar>
                <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                  <Typography variant="h5" sx={{ fontStyle: 'italic', mb: 2 }}>
                    &ldquo;{settings.founderQuote}&rdquo;
                  </Typography>
                  <Typography variant="body2" sx={{ letterSpacing: 1 }}>
                    — {settings.founderName || 'Konfydence Founder'}
                  </Typography>
                </Box>
              </Stack>
            </Card>
          )}

          {/* Trusted Partners Section - Only One Instance */}
          <Box sx={{ textAlign: 'center', mb: 10 }} data-aos="fade-down" data-aos-duration="900">
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: '#052A42' }}>
              Recognized by teams who care about trust
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              From national broadcasters to global scale-ups, our work appears on stages and screens worldwide.
            </Typography>
            <Grid container spacing={4}>
              {['Europe Tech Week', 'CyberSec EU', 'Parents for Digital', 'GovSec Labs'].map((label) => (
                <Grid item xs={6} md={3} key={label}>
                  <Card
                    sx={{
                      borderRadius: 3,
                      p: 3,
                      textAlign: 'center',
                      minHeight: 120,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#0B7897' }}>
                      {label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Featured Partner
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* CTA Block */}
          <Box
            sx={{
              textAlign: 'center',
              py: { xs: 6, md: 8 },
              mb: 4,
              backgroundColor: '#E9F4FF',
              borderRadius: 4,
              px: { xs: 3, md: 4 },
            }}
            data-aos="fade-up"
            data-aos-duration="900"
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={3}
              justifyContent="center"
              sx={{ maxWidth: 700, mx: 'auto' }}
            >
              <Button
                component={Link}
                href="/shop"
                variant="contained"
                size="large"
                sx={{
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  backgroundColor: '#4CAF50',
                  fontSize: { xs: '1rem', md: '1.1rem' },
                  '&:hover': {
                    backgroundColor: '#45a049',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 24px rgba(76, 175, 80, 0.4)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Start with the Scam Survival Kit
              </Button>
              <Button
                component={Link}
                href="/contact?topic=b2e_demo"
                variant="contained"
                size="large"
                sx={{
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  backgroundColor: '#2196F3',
                  fontSize: { xs: '1rem', md: '1.1rem' },
                  '&:hover': {
                    backgroundColor: '#1976D2',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 24px rgba(33, 150, 243, 0.4)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Request a Company or School Demo
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>
      <Footer />
    </>
  );
}
