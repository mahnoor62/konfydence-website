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
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_URL environment variable is missing!');
}
const API_URL = `${API_BASE_URL}/api`;
console.log('🔗 About Page API URL:', API_URL);

async function getSettings() {
  try {
    const url = `${API_URL}/settings`;
    console.log('📡 API: GET', url);
    const res = await axios.get(url);
    return res.data;
  } catch (error) {
    console.error('❌ Error fetching settings:', {
      url: `${API_URL}/settings`,
      error: error.response?.data || error.message,
      status: error.response?.status,
    });
    return null;
  }
}

export default async function AboutPage() {
  const settings = await getSettings();

  return (
    <>
      <Header />
      <Box component="main" sx={{backgroundColor: '#F4F8FD' }}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #063C5E 0%, #0B7897 80%)',
            color: 'white',
            py: { xs: 8, md: 12 },
            // mt: { xs: 8, md: 10 }
          }}
        >
          <Container data-aos="zoom-in" data-aos-duration="900" maxWidth="lg" sx={{ mt: { xs: 8, md: 10 } }}>
            <Grid container spacing={6} alignItems="center">
              <Grid item xs={12} md={7}>
                <Typography variant="overline" sx={{ letterSpacing: 2, fontWeight: 600 }}>
                  OUR WHY
                </Typography>
                <Typography variant="h2" sx={{ fontWeight: 700, mt: 2, mb: 3, lineHeight: 1.2 }}>
                  We help every person feel confident against digital scams.
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ opacity: 0.9, mb: 4, maxWidth: 520, color: 'rgba(255,255,255,0.95)' }}
                >
                  Konfydence blends tactile learning, cinematic storytelling, and practical simulations to
                  transform complex security concepts into memorable moments for families, schools, and teams.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button variant="contained" size="large" sx={{ borderRadius: 2, px: 4 }} href="/products">
                    Explore Products
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    sx={{ borderColor: 'white', color: 'white', borderRadius: 2, px: 4 }}
                    href="/contact?topic=b2b_demo"
                  >
                    Meet Our Team
                  </Button>
                </Stack>
              </Grid>
              <Grid item xs={12} md={5}>
                <Box
                  sx={{
                    position: 'relative',
                    animation: 'floatCard 4s ease-in-out infinite',
                    transformOrigin: 'center',
                    filter: 'drop-shadow(0 25px 45px rgba(6,60,94,0.35))',
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
                      height: 360,
                      boxShadow:
                        '0 35px 95px rgba(4,37,58,0.45), 0 0 40px rgba(255,255,255,0.35)',
                      overflow: 'hidden',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        inset: 0,
                        background:
                          'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(11,120,151,0.2))',
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: '-50%',
                        left: '-50%',
                        width: '200%',
                        height: '200%',
                        background:
                          'radial-gradient(circle, rgba(255,255,255,0.45), transparent 60%)',
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
          <Grid container spacing={4} sx={{ mb: 8 }}>
            {[
              { label: 'Learners trained', value: '45k+' },
              { label: 'Countries active', value: '12+' },
              { label: 'Simulated attacks stopped', value: '3.2M' },
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

          <Grid container spacing={6} alignItems="center" sx={{ mb: 10 }}>
            <Grid item xs={12} md={6} data-aos="fade-right" data-aos-duration="900">
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: '#052A42' }}>
                Our mission
              </Typography>
              <Typography variant="body1" paragraph color="text.secondary">
                We design multi-sensory experiences that bring cyber safety to life. From table-top simulations to
                cinematic story cards and facilitated workshops, our approach helps people feel calm, curious, and
                prepared when faced with fraud.
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Every Konfydence product is built with educators, psychologists, and security operators to ensure
                learning sticks—long after the workshop ends.
              </Typography>
            </Grid>
            <Grid
              item
              xs={12}
              md={6}
              data-aos="fade-left"
              data-aos-duration="900"
              data-aos-delay="150"
            >
              <Card
                sx={{
                  borderRadius: 4,
                  p: 4,
                  position: 'relative',
                  overflow: 'hidden',
                  background:
                    'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(233,244,255,0.8))',
                  boxShadow: '0 35px 90px rgba(6,60,94,0.18)',
                  border: '1px solid rgba(11,120,151,0.12)',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(120deg, rgba(11,120,151,0.15), transparent)',
                    opacity: 0.8,
                    pointerEvents: 'none',
                  },
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#0B7897', mb: 1 }}>
                  Pillars of Konfydence
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Stack spacing={2}>
                  {[
                    'Playful practice over fear-based training',
                    'Evidence-backed behavioral science',
                    'Inclusive for every generation and job role',
                    'Delivered as a seamless hybrid experience',
                  ].map((item) => (
                    <Box key={item} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip label="✓" color="primary" size="small" />
                      <Typography variant="body2" color="text.secondary">
                        {item}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Card>
            </Grid>
          </Grid>

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
                    width: 120,
                    height: 120,
                    bgcolor: '#0B7897',
                    fontSize: '2rem',
                  }}
                >
                  {(settings.founderName || 'K')[0]}
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontStyle: 'italic', mb: 2 }}>
                    “{settings.founderQuote}”
                  </Typography>
                  <Typography variant="body2" sx={{ letterSpacing: 1 }}>
                    — {settings.founderName || 'Konfydence Founder'}
                  </Typography>
                </Box>
              </Stack>
            </Card>
          )}

          <Box sx={{ textAlign: 'center' }} data-aos="fade-down" data-aos-duration="900">
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: '#052A42' }}>
              Recognized by teams who care about trust
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              From national broadcasters to global scale-ups, our work appears on stages and screens worldwide.
            </Typography>
            <Grid container spacing={4}>
              {['Europe Tech Week', 'CyberSec EU', 'Parents for Digital', 'GovSec Labs'].map((label) => (
                <Grid item xs={6} md={3} key={label}>
                  <Card sx={{ borderRadius: 3, p: 3, textAlign: 'center', minHeight: 120 }}>
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
        </Container>
      </Box>
      <Footer />
    </>
  );
}

