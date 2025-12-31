'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import {
  Container,
  Typography,
  Grid,
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Alert,
  Stack,
  Paper,
  Divider,
  IconButton,
  Snackbar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import SecurityIcon from '@mui/icons-material/Security';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import SchoolIcon from '@mui/icons-material/School';
import BusinessIcon from '@mui/icons-material/Business';
import FlagIcon from '@mui/icons-material/Flag';
import CloseIcon from '@mui/icons-material/Close';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import axios from 'axios';
import Link from 'next/link';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_URL environment variable is missing!');
}
const API_URL = `${API_BASE_URL}/api`;

export default function SKKPage() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [cardIndex, setCardIndex] = useState(0);

  const validateEmail = (email) => {
    const emailRegex = /.+@.+\..+/;
    return emailRegex.test(email);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }
    
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setEmailError('');
    
    try {
      const url = `${API_URL}/newsletter/subscribe`;
      await axios.post(url, {
        email: email.trim(),
        subscriptionType: 'waitlist',
      });
      
      setSnackbar({ 
        open: true, 
        message: 'Thank you! You\'re on the waitlist. We\'ll notify you when we launch on Kickstarter.', 
        severity: 'success' 
      });
      setEmail('');
    } catch (err) {
      console.error('Error submitting email:', err);
      setSnackbar({ 
        open: true, 
        message: err.response?.data?.message || 'Something went wrong. Please try again.', 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('aos').then((AOS) => {
        AOS.default.init({
          duration: 800,
          easing: 'ease-in-out',
          once: true,
          offset: 100,
        });
      });
    }
  }, []);

  // Card flip animation for hero
  useEffect(() => {
    const interval = setInterval(() => {
      setCardIndex((prev) => (prev + 1) % 5);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const cards = [
    { name: 'Bank Email', scenario: 'Urgent account verification required' },
    { name: 'Package Tracking', scenario: 'Click to track your delivery' },
    { name: 'Lottery', scenario: 'You\'ve won $1,000,000!' },
    { name: 'Friend in Need', scenario: 'Emergency - need money now' },
    { name: 'Social Media Hack', scenario: 'Your account has been compromised' },
  ];

  return (
    <>
      <Head>
        <title>Konfydence Pre-Launch - Train the 5-Second Pause | Kickstarter Feb 2026</title>
        <meta name="description" content="Join the waitlist for Konfydence - the card game that trains the one habit that beats every scam: the 5-second pause. Launching on Kickstarter February 2026." />
      </Head>
      <Header />
      
      {/* Hero Section */}
      <Box sx={{ pt: { xs: 8, md: 10 }, backgroundColor: '#E9F4FF', position: 'relative', overflow: 'hidden' }}>
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6} data-aos="fade-right">
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
                  fontWeight: 700,
                  mb: 3,
                  color: '#063C5E',
                  lineHeight: 1.1,
                }}
              >
                Train the One Habit That Beats Every Scam: <Box component="span" sx={{ color: '#FF725E' }}>The 5-Second Pause</Box>
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontSize: { xs: '1.1rem', md: '1.4rem' },
                  fontWeight: 400,
                  mb: 4,
                  color: '#0B7897',
                  lineHeight: 1.6,
                }}
              >
                Anyone can fall for a scam in a moment of pressure. Smart people practice pausing first. Konfydence turns real scam awareness into a fun, confidence-building game.
              </Typography>
              
              {/* CTA Section */}
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  backgroundColor: 'white',
                  borderRadius: 2,
                  mb: 4,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: { xs: '1.1rem', md: '1.25rem' },
                    fontWeight: 600,
                    mb: 2,
                    color: '#063C5E',
                  }}
                >
                  Get Early Access + Exclusive Bonus Cards
                </Typography>
                <Box component="form" onSubmit={handleEmailSubmit}>
                  <Stack spacing={2}>
                    <TextField
                      fullWidth
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailError('');
                      }}
                      error={!!emailError}
                      helperText={emailError}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: '#0B7897',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#0B7897',
                          },
                        },
                      }}
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      disabled={loading}
                      sx={{
                        backgroundColor: '#FF725E',
                        color: 'white',
                        py: 1.5,
                        fontWeight: 600,
                        fontSize: '1.1rem',
                        '&:hover': {
                          backgroundColor: '#e65a4a',
                        },
                      }}
                    >
                      {loading ? 'Joining...' : 'Get Early Access'}
                    </Button>
                  </Stack>
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    mt: 2,
                    color: 'text.secondary',
                    fontSize: '0.875rem',
                    textAlign: 'center',
                  }}
                >
                  No spam. Be the first when we launch on Kickstarter (Feb 2026).
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6} data-aos="fade-left">
              <Box sx={{ position: 'relative' }}>
                {/* Card Carousel */}
                <Box
                  sx={{
                    position: 'relative',
                    height: { xs: '400px', md: '500px' },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {cards.map((card, idx) => (
                    <Card
                      key={idx}
                      sx={{
                        position: 'absolute',
                        width: { xs: '280px', md: '350px' },
                        height: { xs: '350px', md: '450px' },
                        opacity: idx === cardIndex ? 1 : 0,
                        transform: idx === cardIndex
                          ? 'translateY(0) scale(1) rotate(0deg)'
                          : 'translateY(20px) scale(0.9) rotate(5deg)',
                        transition: 'all 0.6s ease-in-out',
                        zIndex: idx === cardIndex ? 10 : 5 - idx,
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                        cursor: 'pointer',
                      }}
                      onClick={() => setCardIndex(idx)}
                    >
                      <CardContent
                        sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                          p: 4,
                          background: idx === cardIndex
                            ? 'linear-gradient(135deg, #063C5E 0%, #0B7897 100%)'
                            : 'linear-gradient(135deg, #0B7897 0%, #063C5E 100%)',
                          color: 'white',
                        }}
                      >
                        <Typography
                          variant="h4"
                          sx={{
                            fontWeight: 700,
                            mb: 2,
                            textAlign: 'center',
                          }}
                        >
                          {card.name}
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            fontSize: '1.1rem',
                            textAlign: 'center',
                            mb: 3,
                          }}
                        >
                          {card.scenario}
                        </Typography>
                        {idx === cardIndex && (
                          <Box
                            sx={{
                              mt: 2,
                              p: 2,
                              backgroundColor: 'rgba(255,255,255,0.2)',
                              borderRadius: 2,
                              textAlign: 'center',
                            }}
                          >
                            <PauseCircleOutlineIcon sx={{ fontSize: 48, mb: 1 }} />
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                              Pause for 5 seconds
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Key Benefits Section */}
      <Box sx={{ py: { xs: 6, md: 8 }, backgroundColor: '#ffffff' }}>
        <Container maxWidth="lg" data-aos="fade-up">
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                <PauseCircleOutlineIcon sx={{ fontSize: 32, color: '#0B7897', mr: 2, mt: 0.5 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#063C5E' }}>
                    Master the 5-Second Pause
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    The proven habit that stops 90% of scams before they start
                  </Typography>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                <SecurityIcon sx={{ fontSize: 32, color: '#0B7897', mr: 2, mt: 0.5 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#063C5E' }}>
                    80 Real-World Scenarios
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    Emails, calls, texts, social media — practice them all
                  </Typography>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                <CheckCircleIcon sx={{ fontSize: 32, color: '#0B7897', mr: 2, mt: 0.5 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#063C5E' }}>
                    Point-Based Gameplay
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    Rewards safe choices and builds confidence
                  </Typography>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                <FamilyRestroomIcon sx={{ fontSize: 32, color: '#0B7897', mr: 2, mt: 0.5 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#063C5E' }}>
                    Play in 15 Minutes
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    Solo, family, or team — fits any schedule
                  </Typography>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                <FlagIcon sx={{ fontSize: 32, color: '#0B7897', mr: 2, mt: 0.5 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#063C5E' }}>
                    Made in Germany Quality
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    Premium durability · Supports Konfydence for Kids
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Founder Credibility Section */}
      <Box sx={{ py: { xs: 6, md: 8 }, backgroundColor: '#063C5E', color: 'white' }}>
        <Container maxWidth="lg" data-aos="fade-up">
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '2rem', md: '2.5rem' },
              fontWeight: 700,
              mb: 4,
              textAlign: 'center',
            }}
          >
            Why I Created Konfydence
          </Typography>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="body1"
                sx={{
                  fontSize: { xs: '1rem', md: '1.125rem' },
                  lineHeight: 1.8,
                  mb: 3,
                  opacity: 0.95,
                }}
              >
                Tichi Mbanwie spent 15+ years in high-stakes finance and compliance at PIMCO and Ford. He saw it happen repeatedly: smart, experienced colleagues — and even close family — falling for scams despite knowing better.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  p: 4,
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderRadius: 2,
                  borderLeft: '4px solid #FF725E',
                }}
              >
                <Typography
                  variant="h4"
                  sx={{
                    fontSize: { xs: '1.5rem', md: '2rem' },
                    fontWeight: 600,
                    mb: 2,
                    fontStyle: 'italic',
                    lineHeight: 1.4,
                  }}
                >
                  &quot;Scammers don&apos;t win because we&apos;re dumb. They win because they&apos;re fast. Konfydence trains you to be faster — with one simple pause.&quot;
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: '1rem',
                    opacity: 0.9,
                  }}
                >
                  – Tichi Mbanwie, Founder
                </Typography>
              </Box>
            </Grid>
          </Grid>
          
          {/* Decision Ladder Visual */}
          <Box sx={{ mt: 6, textAlign: 'center' }}>
            <Typography
              variant="h5"
              sx={{
                fontSize: { xs: '1.25rem', md: '1.5rem' },
                fontWeight: 600,
                mb: 3,
              }}
            >
              The Decision Ladder
            </Typography>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 2,
              }}
            >
              {['Breathe', 'Pause 5 Seconds', 'Think', 'Respond'].map((step, idx) => (
                <Box
                  key={idx}
                  sx={{
                    p: 2,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: 2,
                    minWidth: { xs: '140px', md: '180px' },
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    {step}
                  </Typography>
                  {idx < 3 && (
                    <Typography sx={{ fontSize: '1.5rem', opacity: 0.7 }}>↓</Typography>
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Problem Section */}
      <Box sx={{ py: { xs: 6, md: 8 }, backgroundColor: '#ffffff' }}>
        <Container maxWidth="lg" data-aos="fade-up">
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '2rem', md: '2.5rem' },
              fontWeight: 700,
              mb: 4,
              textAlign: 'center',
              color: '#063C5E',
            }}
          >
            The Hard Truth: Why Warnings Aren&apos;t Enough
          </Typography>
          <Typography
            variant="h5"
            sx={{
              fontSize: { xs: '1.25rem', md: '1.5rem' },
              fontWeight: 400,
              mb: 4,
              textAlign: 'center',
              color: '#0B7897',
            }}
          >
            Scams exploit biology, not ignorance. In seconds of hurry, authority, or excitement, even experts click.
          </Typography>
          
          <Typography
            variant="h6"
            sx={{
              fontSize: { xs: '1.1rem', md: '1.25rem' },
              fontWeight: 600,
              mb: 3,
              color: '#063C5E',
            }}
          >
            You&apos;ve probably:
          </Typography>
          
          <Grid container spacing={3}>
            {[
              'Felt rushed by an "urgent" email',
              'Clicked a suspicious link',
              'Worried about family falling for tricks',
              'Found traditional training boring or forgettable',
            ].map((point, idx) => (
              <Grid item xs={12} sm={6} key={idx}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <Typography
                    sx={{
                      color: '#FF725E',
                      fontSize: '1.5rem',
                      mr: 2,
                      lineHeight: 1,
                    }}
                  >
                    •
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: { xs: '1rem', md: '1.125rem' },
                      lineHeight: 1.8,
                    }}
                  >
                    {point}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Solution Section */}
      <Box sx={{ py: { xs: 6, md: 8 }, backgroundColor: '#E9F4FF' }}>
        <Container maxWidth="lg" data-aos="fade-up">
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '2rem', md: '2.5rem' },
              fontWeight: 700,
              mb: 4,
              textAlign: 'center',
              color: '#063C5E',
            }}
          >
            What If One 5-Second Habit Changed Everything?
          </Typography>
          
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h5"
                sx={{
                  fontSize: { xs: '1.25rem', md: '1.5rem' },
                  fontWeight: 600,
                  mb: 3,
                  color: '#063C5E',
                }}
              >
                With Konfydence, you:
              </Typography>
              
              <Stack spacing={2}>
                {[
                  'Spot H.A.C.K. triggers instantly (Hurry · Authority · Comfort · Kill-Switch)',
                  'Practice pausing under simulated pressure — safely',
                  'Turn mistakes into confidence, not shame',
                  'Protect family, kids, or team together',
                ].map((benefit, idx) => (
                  <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <CheckCircleIcon sx={{ color: '#0B7897', mr: 2, mt: 0.5 }} />
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: { xs: '1rem', md: '1.125rem' },
                        lineHeight: 1.8,
                      }}
                    >
                      {benefit}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  position: 'relative',
                  borderRadius: 3,
                  overflow: 'hidden',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                }}
              >
                <Box
                  component="img"
                  src="/images/skk-family-playing.jpg"
                  alt="Happy family playing Konfydence cards"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                  sx={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                  }}
                />
                <Box
                  sx={{
                    display: 'none',
                    width: '100%',
                    height: '400px',
                    backgroundColor: '#0B7897',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    flexDirection: 'column',
                    p: 4,
                  }}
                >
                  <FamilyRestroomIcon sx={{ fontSize: 80, mb: 2 }} />
                  <Typography variant="h5" sx={{ fontWeight: 700, textAlign: 'center' }}>
                    The 5-Second Pause in Action
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 2, textAlign: 'center' }}>
                    Happy family playing cards, laughing, discussing
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Who It's For Section */}
      <Box sx={{ py: { xs: 6, md: 8 }, backgroundColor: '#ffffff' }}>
        <Container maxWidth="lg" data-aos="fade-up">
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '2rem', md: '2.5rem' },
              fontWeight: 700,
              mb: 4,
              textAlign: 'center',
              color: '#063C5E',
            }}
          >
            Who It&apos;s For
          </Typography>
          
          <Grid container spacing={4}>
            {[
              {
                icon: <FamilyRestroomIcon sx={{ fontSize: 48 }} />,
                title: 'Families',
                description: 'Game nights that build lifelong protection',
              },
              {
                icon: <FamilyRestroomIcon sx={{ fontSize: 48 }} />,
                title: 'Parents & Grandparents',
                description: 'Teach kids/teens without lectures',
              },
              {
                icon: <SchoolIcon sx={{ fontSize: 48 }} />,
                title: 'Schools',
                description: 'Discussion-based digital literacy',
              },
              {
                icon: <BusinessIcon sx={{ fontSize: 48 }} />,
                title: 'Teams',
                description: 'Fun compliance training (NIS2-aligned)',
              },
            ].map((item, idx) => (
              <Grid item xs={12} sm={6} md={3} key={idx}>
                <Card
                  sx={{
                    height: '100%',
                    textAlign: 'center',
                    p: 3,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                    },
                  }}
                >
                  <Box sx={{ color: '#0B7897', mb: 2 }}>
                    {item.icon}
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      mb: 2,
                      color: '#063C5E',
                    }}
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'text.secondary',
                    }}
                  >
                    {item.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Product Details Section */}
      <Box sx={{ py: { xs: 6, md: 8 }, backgroundColor: '#E9F4FF' }}>
        <Container maxWidth="lg" data-aos="fade-up">
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '2rem', md: '2.5rem' },
              fontWeight: 700,
              mb: 4,
              textAlign: 'center',
              color: '#063C5E',
            }}
          >
            Inside Your Konfydence Kit
          </Typography>
          
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Stack spacing={3}>
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      mb: 1,
                      color: '#063C5E',
                    }}
                  >
                    80 Premium Cards
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    70 scenarios + 10 discussion wild cards
                  </Typography>
                </Box>
                
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      mb: 1,
                      color: '#063C5E',
                    }}
                  >
                    Simple Rules
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    Play in minutes — no complicated setup
                  </Typography>
                </Box>
                
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      mb: 1,
                      color: '#063C5E',
                    }}
                  >
                    Scoring System
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    Rewards the pause habit and safe choices
                  </Typography>
                </Box>
                
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      mb: 1,
                      color: '#063C5E',
                    }}
                  >
                    Digital Extension Add-On
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    Optional updates and new scenarios
                  </Typography>
                </Box>
              </Stack>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  position: 'relative',
                  borderRadius: 3,
                  overflow: 'hidden',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                }}
              >
                <Swiper
                  modules={[Autoplay, Pagination]}
                  spaceBetween={0}
                  slidesPerView={1}
                  autoplay={{
                    delay: 3000,
                    disableOnInteraction: false,
                  }}
                  pagination={{ clickable: true }}
                >
                  {cards.map((card, idx) => (
                    <SwiperSlide key={idx}>
                      <Box
                        sx={{
                          p: 6,
                          backgroundColor: '#063C5E',
                          color: 'white',
                          textAlign: 'center',
                          minHeight: '300px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography
                          variant="h4"
                          sx={{
                            fontWeight: 700,
                            mb: 2,
                          }}
                        >
                          {card.name}
                        </Typography>
                        <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
                          {card.scenario}
                        </Typography>
                      </Box>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Our Responsibility Section */}
      <Box sx={{ py: { xs: 6, md: 8 }, backgroundColor: '#ffffff' }}>
        <Container maxWidth="lg" data-aos="fade-up">
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '2rem', md: '2.5rem' },
              fontWeight: 700,
              mb: 4,
              textAlign: 'center',
              color: '#063C5E',
            }}
          >
            Built Right, For Good
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <FlagIcon sx={{ fontSize: 64, color: '#0B7897', mb: 2 }} />
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                    color: '#063C5E',
                  }}
                >
                  Made in Germany
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  Premium quality & durability
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <SchoolIcon sx={{ fontSize: 64, color: '#0B7897', mb: 2 }} />
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                    color: '#063C5E',
                  }}
                >
                  Konfydence for Kids
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  Every kit helps underserved schools
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <FamilyRestroomIcon sx={{ fontSize: 64, color: '#0B7897', mb: 2 }} />
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                    color: '#063C5E',
                  }}
                >
                  Inclusive Production
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  With sheltered workshops
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* FAQ Section */}
      <Box sx={{ py: { xs: 6, md: 8 }, backgroundColor: '#E9F4FF' }}>
        <Container maxWidth="md" data-aos="fade-up">
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '2rem', md: '2.5rem' },
              fontWeight: 700,
              mb: 4,
              textAlign: 'center',
              color: '#063C5E',
            }}
          >
            Frequently Asked Questions
          </Typography>
          
          <Stack spacing={2}>
            {[
              {
                question: 'Is Konfydence only for tech experts?',
                answer: 'No, it\'s designed for anyone who wants practical scam awareness without technical jargon.',
              },
              {
                question: 'Can this help my family or team?',
                answer: 'Yes, it trains decision-making and spotting scams before they cause harm.',
              },
              {
                question: 'Is it safe for children?',
                answer: 'Absolutely. Content is age-appropriate and encourages discussion, not fear.',
              },
              {
                question: 'Can companies use it for compliance workshops?',
                answer: 'Yes. Aligns with NIS2 and security awareness objectives.',
              },
              {
                question: 'How does the 5-Second Pause work?',
                answer: 'It\'s the calm break that lets logic override emotion — practiced safely with every card.',
              },
            ].map((faq, idx) => (
              <Accordion key={idx} sx={{ boxShadow: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#063C5E' }}>
                    {faq.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* Final CTA Section */}
      <Box sx={{ py: { xs: 6, md: 10 }, backgroundColor: '#063C5E', color: 'white' }}>
        <Container maxWidth="md" data-aos="zoom-in">
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '2rem', md: '2.5rem' },
              fontWeight: 700,
              mb: 3,
              textAlign: 'center',
            }}
          >
            Be First. Train the Pause. Protect What Matters.
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontSize: { xs: '1rem', md: '1.25rem' },
              fontWeight: 400,
              mb: 4,
              textAlign: 'center',
              opacity: 0.95,
            }}
          >
            Limited early access — join before Kickstarter launch.
          </Typography>
          
          <Paper
            elevation={3}
            sx={{
              p: 4,
              backgroundColor: 'white',
              borderRadius: 2,
            }}
          >
            <Box component="form" onSubmit={handleEmailSubmit}>
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError('');
                  }}
                  error={!!emailError}
                  helperText={emailError}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#0B7897',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#0B7897',
                      },
                    },
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  sx={{
                    backgroundColor: '#FF725E',
                    color: 'white',
                    py: 1.5,
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    '&:hover': {
                      backgroundColor: '#e65a4a',
                    },
                  }}
                >
                  {loading ? 'Joining...' : 'Yes, Secure My Early Access'}
                </Button>
              </Stack>
            </Box>
            
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography
                variant="body2"
                sx={{
                  fontSize: '0.875rem',
                  color: '#FF725E',
                  fontWeight: 600,
                  mb: 1,
                }}
              >
                First 500 get exclusive bonus cards
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: '0.875rem',
                  color: 'text.secondary',
                  mb: 1,
                }}
              >
                Launch: February 2026
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: '0.875rem',
                  color: 'text.secondary',
                }}
              >
                Spots filling fast
              </Typography>
            </Box>
          </Paper>
        </Container>
      </Box>

      <Footer />
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
