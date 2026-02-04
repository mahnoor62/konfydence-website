'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { Global } from '@emotion/react';
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
  Snackbar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
import PersonIcon from '@mui/icons-material/Person';
import GamepadIcon from '@mui/icons-material/Gamepad';
import WarningIcon from '@mui/icons-material/Warning';
import GroupIcon from '@mui/icons-material/Group';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_URL environment variable is missing!');
}
const API_URL = `${API_BASE_URL}/api`;

export default function SKKPage() {
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [cardIndex, setCardIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [sendingPdf, setSendingPdf] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
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
      const url = `${API_URL}/subscribers/subscribe`;
      await axios.post(url, {
        email: email.trim(),
        subscriptionType: 'waitlist',
        source: 'early-access-form',
      });
      
      setSubmittedEmail(email.trim());
      setEmail('');
      setModalOpen(true);
      
      // Mark that user has visited waitlist page, so banner won't show again on homepage
      if (typeof window !== 'undefined') {
        localStorage.setItem('skk_banner_clicked', 'true');
      }
    } catch (err) {
      console.error('Error submitting email:', err);
      const response = err.response;
      const responseData = response?.data;
      const errorMessage = responseData?.message || err.message || '';

      // If backend explicitly indicates the email is already registered (duplicate),
      // show an error to the user and do NOT open the success modal.
      if (response?.status === 400 && responseData?.duplicate) {
        setSnackbar({
          open: true,
          message: responseData.message || 'This email has already been registered.',
          severity: 'error',
        });
      } else if (responseData?.success === true) {
        // Fallback: if backend still returns success true, treat as success
        setSubmittedEmail(email.trim());
        setEmail('');
        setModalOpen(true);
        if (typeof window !== 'undefined') {
          localStorage.setItem('skk_banner_clicked', 'true');
        }
      } else {
        // Generic error handling
        setSnackbar({
          open: true,
          message: errorMessage || 'Something went wrong. Please try again.',
          severity: 'error',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleSendPdfToEmail = async () => {
    if (!submittedEmail) {
      setSnackbar({ open: true, message: 'No email address to send to.', severity: 'error' });
      return;
    }
    setSendingPdf(true);
    try {
      const res = await axios.post(`${API_URL}/subscribers/send-teaser-pdf`, {
        email: submittedEmail,
      });
      if (res.data?.success) {
        setSnackbar({
          open: true,
          message: 'Cheat Sheet sent to your email. Please check your inbox.',
          severity: 'success',
        });
        handleCloseModal();
      } else {
        setSnackbar({
          open: true,
          message: res.data?.message || 'Failed to send PDF. Please try again.',
          severity: 'error',
        });
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to send PDF. Please try again.';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    } finally {
      setSendingPdf(false);
    }
  };
  
  const [expanded, setExpanded] = useState({});
  
  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded({ ...expanded, [panel]: isExpanded });
  };

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      // Mark that user has visited waitlist page, so banner won't show again on homepage
      localStorage.setItem('skk_banner_clicked', 'true');
      
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
    if (!mounted) return;
    const interval = setInterval(() => {
      setCardIndex((prev) => (prev + 1) % 5);
    }, 3000);
    return () => clearInterval(interval);
  }, [mounted]);

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
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #063C5E 0%, #0B7897 100%)',
          color: 'white',
          pt: { xs: 12, md: 16 },
          pb: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
          <Grid container spacing={4} alignItems="stretch">
            {/* Left Column - Text + Key Benefits */}
            <Grid item xs={12} md={6} data-aos="fade-right" sx={{ display: 'flex', flexDirection: 'column' }}>
              <Box 
                sx={{ 
                  border: '2px solid rgba(255, 255, 255, 0.4)',
                  borderRadius: 3,
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Box sx={{ mb: 4 }}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      mb: 1,
                      color: 'white',
                      lineHeight: 1.1,
                    }}
                  >
                    Anyone can fall for a scam. Smart people train first.
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 400,
                      color: 'white',
                      lineHeight: 1.6,
                    }}
                  >
                    Cybersecurity doesn&apos;t fail because of technology it fails because we&apos;re human.
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: { xs: '1rem', md: '1.125rem' },
                      fontWeight: 400,
                      color: 'white',
                      lineHeight: 1.6,
                    }}
                  >
                    Konfydence turns that vulnerability into your greatest strength.
                  </Typography>
                </Box>

                {/* Key Benefits - Smaller in Left Column */}
                <Box sx={{ flex: 1 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: { xs: '1.25rem', md: '1.5rem' },
                    fontWeight: 700,
                    mb: 3,
                    color: 'white',
                  }}
                  data-aos="fade-up"
                >
                  Key Benefits
                </Typography>
                <Stack spacing={2}>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'flex-start',
                      py: 1,
                    }}
                  >
                    <CheckCircleIcon sx={{ fontSize: 24, color: '#FFD700', mr: 1.5, mt: 0.3, flexShrink: 0 }} />
                    <Typography variant="body2" sx={{ color: 'white', lineHeight: 1.6, fontSize: { xs: '0.85rem', md: '0.9rem' }, fontWeight: 500 }}>
                      90 scenario-based cards (80 real-world scams + 10 Wild Cards)
                    </Typography>
                  </Box>
                  
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'flex-start',
                      py: 1,
                    }}
                  >
                    <CheckCircleIcon sx={{ fontSize: 24, color: '#FFD700', mr: 1.5, mt: 0.3, flexShrink: 0 }} />
                    <Typography variant="body2" sx={{ color: 'white', lineHeight: 1.6, fontSize: { xs: '0.85rem', md: '0.9rem' }, fontWeight: 500 }}>
                      Point-based, skill-building gameplay
                    </Typography>
                  </Box>
                  
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'flex-start',
                      py: 1,
                    }}
                  >
                    <CheckCircleIcon sx={{ fontSize: 24, color: '#FFD700', mr: 1.5, mt: 0.3, flexShrink: 0 }} />
                    <Typography variant="body2" sx={{ color: 'white', lineHeight: 1.6, fontSize: { xs: '0.85rem', md: '0.9rem' }, fontWeight: 500 }}>
                      Quick, simple rules, no technical knowledge
                    </Typography>
                  </Box>
                  
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'flex-start',
                      py: 1,
                    }}
                  >
                    <CheckCircleIcon sx={{ fontSize: 24, color: '#FFD700', mr: 1.5, mt: 0.3, flexShrink: 0 }} />
                    <Typography variant="body2" sx={{ color: 'white', lineHeight: 1.6, fontSize: { xs: '0.85rem', md: '0.9rem' }, fontWeight: 500 }}>
                      Learn together, without risk or shame
                    </Typography>
                  </Box>
                  
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'flex-start',
                      py: 1,
                    }}
                  >
                    <CheckCircleIcon sx={{ fontSize: 24, color: '#FFD700', mr: 1.5, mt: 0.3, flexShrink: 0 }} />
                    <Typography variant="body2" sx={{ color: 'white', lineHeight: 1.6, fontSize: { xs: '0.85rem', md: '0.9rem' }, fontWeight: 500 }}>
                      Designed in Germany & socially responsible
                    </Typography>
                  </Box>
                </Stack>
              </Box>
              </Box>
            </Grid>
            
            {/* Right Column - Image + CTA Form */}
            <Grid item xs={12} md={6} data-aos="fade-left" sx={{ display: 'flex', flexDirection: 'column' }}>
              {/* Product Image */}
              <Box
                sx={{
                  width: '100%',
                  height: { xs: '300px', md: '350px' },
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  mb: 3,
                }}
              >
                <Box
                  component="img"
                  src="/images/scam-survival-kit.png"
                  alt="Konfydence Scam Survival Kit"
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    borderRadius: 4,
                    overflow: 'hidden',
                  }}
                />
              </Box>

              {/* CTA Section */}
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: { xs: '1.1rem', md: '1.25rem' },
                    fontWeight: 600,
                    mb: 2,
                    color: 'white',
                    textAlign: 'center',
                  }}
                >
                  Claim Your Early Bird Discount
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
                        borderRadius: 2,
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
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
                      disabled={loading}
                      fullWidth
                      sx={{
                        backgroundColor: '#FF725E',
                        color: 'white',
                        py: 1.5,
                        px: { xs: 2, md: 4 },
                        fontWeight: 600,
                        fontSize: '1.1rem',
                        '&:hover': {
                          backgroundColor: '#e65a4a',
                        },
                      }}
                    >
                      {loading ? 'Joining...' : 'Claim Your Early Bird Discount'}
                    </Button>
                  </Stack>
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    mt: 2,
                    color: 'white',
                    fontSize: '0.875rem',
                    textAlign: 'center',
                    mb: 1,
                    opacity: 0.9,
                  }}
                >
                  Designed by a finance & compliance expert with 16+ years of experience
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'white',
                    fontSize: '0.875rem',
                    textAlign: 'center',
                    opacity: 0.9,
                  }}
                >
                  No spam. Early access + behind-the-scenes updates.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Problem Awareness Section */}
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
          
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  p: 4,
                  height: '100%',
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  border: '1px solid #E0E0E0',
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: { xs: '1rem', md: '1.125rem' },
                    lineHeight: 1.8,
                    mb: 2,
                    color: '#063C5E',
                  }}
                >
                  Scams don&apos;t work because people are ignorant.
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: { xs: '1rem', md: '1.125rem' },
                    lineHeight: 1.8,
                    mb: 2,
                    color: '#063C5E',
                  }}
                >
                  They work because they exploit human biology, urgency, authority, excitement, fear.
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: { xs: '1rem', md: '1.125rem' },
                    lineHeight: 1.8,
                    mb: 2,
                    color: '#063C5E',
                  }}
                >
                  In seconds of pressure, even experienced people make mistakes.
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: { xs: '1rem', md: '1.125rem' },
                    lineHeight: 1.8,
                    fontWeight: 600,
                    color: '#063C5E',
                  }}
                >
                  This doesn&apos;t mean you&apos;re careless, it means you&apos;re human.
                </Typography>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  p: 4,
                  height: '100%',
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  border: '1px solid #E0E0E0',
                }}
              >
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
                <Box>
                  {[
                    'Felt rushed by an "urgent" email',
                    'Worried about family members falling for scams',
                    'Clicked a link you later questioned',
                    'Found traditional security training boring or forgettable',
                  ].map((point, idx) => (
                    <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                      <Typography
                        sx={{
                          color: '#FF725E',
                          fontSize: '1.5rem',
                          mr: 2,
                          lineHeight: 1,
                          flexShrink: 0,
                        }}
                      >
                        •
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          fontSize: { xs: '1rem', md: '1.125rem' },
                          lineHeight: 1.8,
                          color: '#063C5E',
                        }}
                      >
                        {point}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Card>
            </Grid>
          </Grid>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              {/* <Card
                sx={{
                  p: 4,
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  border: '1px solid #E0E0E0',
                  textAlign: 'center',
                }}
              > */}
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: { xs: '1rem', md: '1.125rem' },
                    lineHeight: 1.8,
                    fontWeight: 600,
                    color: '#063C5E', textAlign: 'center'
                  }}
                >
                  Knowing about scams isn&apos;t enough what matters is how you react in the moment.
                </Typography>
              {/* </Card> */}
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Solution Section */}
      <Box sx={{ py: { xs: 6, md: 8 }, backgroundColor: '#0A6686' }}>
        <Container maxWidth="lg" data-aos="fade-up">
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '2rem', md: '2.5rem' },
              fontWeight: 700,
              mb: 4,
              textAlign: 'center',
              color: 'white',
            }}
          >
            What If One 5-Second Habit Changed Everything?
          </Typography>
          
          <Grid container spacing={4} alignItems="stretch">
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', border: '2px solid white', borderRadius: 2, p: 3 }}>
              <Typography
                variant="h6"
                sx={{
                  fontSize: { xs: '1.1rem', md: '1.25rem' },
                  fontWeight: 600,
                  mb: 2,
                  color: 'white',
                }}
              >
                Konfydence trains one simple but powerful skill:
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontSize: { xs: '0.95rem', md: '1.1rem' },
                  fontWeight: 600,
                  mb: 2,
                  color: '#FFC54D',
                  fontStyle: 'italic',
                }}
              >
                Pause before you click, pay, or reply.
              </Typography>
              
              <Typography
                variant="body1"
                sx={{
                  fontSize: { xs: '0.95rem', md: '1.1rem' },
                  fontWeight: 600,
                  mb: 2,
                  color: 'white',
                }}
              >
                With Konfydence, you:
              </Typography>
              
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <CheckCircleIcon sx={{ color: '#FFC54D', mr: 2, mt: 0.5, fontSize: { xs: '1.2rem', md: '1.5rem' } }} />
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: { xs: '0.9rem', md: '1rem' },
                      lineHeight: 1.7,
                      color: 'white',
                    }}
                  >
                    Spot common H.A.C.K. triggers instantly
                  </Typography>
                </Box>
                <Box sx={{ ml: 4, mb: 2 }}>
                  <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                    <Chip label="Hurry" sx={{ backgroundColor: '#FF725E', color: 'white', fontSize: { xs: '0.75rem', md: '0.875rem' }, fontWeight: 600, minWidth: 'fit-content' }} />
                    <Chip label="Authority" sx={{ backgroundColor: '#0B7897', color: 'white', fontSize: { xs: '0.75rem', md: '0.875rem' }, fontWeight: 600, minWidth: 'fit-content' }} />
                    <Chip label="Comfort" 
                    sx={{
                     backgroundColor: '#4CAF50', color: 'white', fontSize: { xs: '0.75rem', md: '0.875rem' }, fontWeight: 600, minWidth: 'fit-content' }} />
                    <Chip label="Kill-Switch" 
                    sx={{ backgroundColor: '#FFC54D', color: '#063C5E', fontSize: { xs: '0.75rem', md: '0.875rem' }, fontWeight: 700, minWidth: 'fit-content', border: '1px solid rgba(6, 60, 94, 0.3)' }} 
                    />
                  </Stack>
                </Box>
                {[
                  'Practice pausing under simulated pressure, safely',
                  'Turn mistakes into confidence, not shame',
                  'Protect family, kids, or your team together',
                ].map((benefit, idx) => (
                  <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <CheckCircleIcon sx={{ color: '#FFC54D', mr: 2, mt: 0.5, fontSize: { xs: '1.2rem', md: '1.5rem' } }} />
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: { xs: '0.9rem', md: '1rem' },
                        lineHeight: 1.7,
                        color: 'white',
                      }}
                    >
                      {benefit}
                    </Typography>
                  </Box>
                ))}
              </Stack>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
        
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%',
                      minHeight: 0,
                    }}
                  >
                    <Box
                      sx={{
                        position: 'relative',
                        width: '100%',
                        flex: 1,
                        minHeight: 280,
                        backgroundColor: '#000B3F',
                        borderRadius: 3,
                        overflow: 'hidden',
                        cursor: 'pointer',
                      }}
                      onClick={(e) => {
                        const video = e.currentTarget.querySelector('video');
                        if (video) {
                          if (video.paused) {
                            video.play();
                          } else {
                            video.pause();
                          }
                        }
                      }}
                    >
                      <video
                        controls
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <source src="/video/video3.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </Box>
                  </Box>
            
              {/* <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Box
                  component="img"
                  src="/images/ssk-header.png"
                  alt="Happy family playing cards, laughing, discussing"
                  sx={{
                    width: '100%',
                    height: '100%',
                    borderRadius: 3,
                    objectFit: 'cover',
                  }}
                />
              </Box> */}
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '0.95rem', md: '1.1rem' },
                lineHeight: 1.8,
                fontWeight: 600,
                fontStyle: 'italic',
                color: 'white',
                mb: 1,
              }}
            >
              Scammers win by being fast.  Konfydence trains you to be faster, by pausing first.
            </Typography>
            {/* <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '0.95rem', md: '1.1rem' },
                lineHeight: 1.8,
                fontWeight: 600,
                fontStyle: 'italic',
                color: 'white',
              }}
            >
              Konfydence trains you to be faster, by pausing first.
            </Typography> */}
          </Box>
        </Container>
      </Box>

      {/* How Konfydence Works Section */}
      <Box sx={{ py: { xs: 6, md: 8 }, backgroundColor: '#ffffff' }}>
        <Container maxWidth="lg" data-aos="fade-up">
          <Grid container spacing={4} sx={{ alignItems: 'stretch', mb: 6 }}>
            {/* Left Column - Text */}
            <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column' }}>
              <Box
                sx={{
                  border: '2px solid #063C5E',
                  borderRadius: 3,
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    // fontSize: { xs: '2rem', md: '2.5rem' },
                    fontWeight: 700,
                    mb: 3,
                    color: '#063C5E',
                  }}
                >
                  How Konfydence Works
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    // fontSize: { xs: '1rem', md: '1.25rem' },
                    fontWeight: 500,
                    lineHeight: 1.7,
                    color: 'text.secondary',
                  }}
                >
                  Scammers rely on urgency to remove choice.
                  <br />
                  Konfydence works by restoring options — and the moment you see options, the pause has already begun.
                </Typography>
              </Box>
            </Grid>
            
            {/* Middle Column - Slider */}
            <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <Box
                sx={{
                  position: 'relative',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: { xs: '300px', md: '400px' },
                  maxHeight: { xs: '300px', md: '400px' },
                  minHeight: 0,
                  backgroundColor: 'transparent',
                }}
              >
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
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
                    style={{
                      '--swiper-pagination-color': '#FF725E',
                      height: '100%',
                    }}
                  >
                    <SwiperSlide>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '100%',
                          width: '100%',
                        }}
                      >
                        <Box
                          component="img"
                          src="/images/scam-bank-front-card.png"
                          alt="Bank Email Scam Card"
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            display: 'block',
                            borderRadius: 3,
                          }}
                        />
                      </Box>
                    </SwiperSlide>
                    <SwiperSlide>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '100%',
                          width: '100%',
                        }}
                      >
                        <Box
                          component="img"
                          src="/images/scam-bank-back-card.png"
                          alt="Bank Email Scam Card Back"
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            display: 'block',
                            borderRadius: 3,
                          }}
                        />
                      </Box>
                    </SwiperSlide>
                  </Swiper>
                </Box>
              </Box>
            </Grid>
            
            {/* Right Column - Image */}
            <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <Box
                sx={{
                  position: 'relative',
                  height: { xs: '300px', md: '400px' },
                  maxHeight: { xs: '300px', md: '400px' },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 0,
                  backgroundColor: 'transparent',
                }}
              >
                <Box
                  component="img"
                  src="/images/scam-pause-card.png"
                  alt="The 5-Second Pause"
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    display: 'block',
                    borderRadius: 3,
                  }}
                />
              </Box>
            </Grid>
          </Grid>
          
          <Typography
            variant="body1"
            sx={{
              fontSize: { xs: '1rem', md: '1.125rem' },
              fontStyle: 'italic',
              textAlign: 'center',
              mb: 4,
              color: '#063C5E',
              fontWeight: 600,
            }}
          >
            Konfydence doesn&apos;t teach rules.
            <br />
            It trains the moment that decides everything.
          </Typography>
          
          <Grid container spacing={3} alignItems="stretch">
            {[
              { step: '1', text: 'One realistic scam. One critical moment' },
              { step: '2', text: 'See What One 5-Second Pause Changes' },
              { step: '3', text: 'The same scam. Two reactions. Two outcomes.' },
              { step: '4', text: 'Decide how you would react in the moment.' },
              { step: '5', text: 'Compare different responses and discuss why some feel right, and others don\'t.' },
              { step: '6', text: 'Learn what makes a situation risky and how to spot red flags early.' },
              { step: '7', text: 'Earn points for safe actions, not perfect answers.' },
              { step: '8', text: 'Because the real goal is learning to stay calm and think clearly under pressure.' },
            ].map((item, idx) => (
              <Grid item xs={12} sm={6} key={idx}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'flex-start',
                    height: '100%',
                    border: '2px solid #063C5E',
                    borderRadius: 2,
                    p: 2,
                  }}
                >
                  <Box
                    sx={{
                      minWidth: 40,
                      height: 40,
                      borderRadius: '50%',
                      backgroundColor: '#0B7897',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      mr: 2,
                      flexShrink: 0,
                    }}
                  >
                    {item.step}
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: { xs: '0.9rem', md: '0.95rem' },
                      lineHeight: 1.6,
                      color: '#063C5E',
                      pt: 0.5,
                    }}
                  >
                    {item.text}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Who Konfydence Is For Section */}
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
            Who Konfydence Is For:
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6} md={6}>
              <Card
                sx={{
                  height: '100%',
                  textAlign: 'center',
                  p: 4,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                  },
                }}
              >
                <Box sx={{ color: '#0B7897', mb: 2 }}>
                  <PersonIcon sx={{ fontSize: 48 }} />
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                    color: '#063C5E',
                  }}
                >
                  Families & Individuals
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: 'text.secondary',
                  }}
                >
                  Protect kids, parents, and grandparents, together.
                  Build confidence instead of fear.
                </Typography>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={6}>
              <Card
                sx={{
                  height: '100%',
                  textAlign: 'center',
                  p: 4,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                  },
                }}
              >
                <Box sx={{ color: '#0B7897', mb: 2 }}>
                  <GamepadIcon sx={{ fontSize: 48 }} />
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                    color: '#063C5E',
                  }}
                >
                  Gamers & Board Game Fans
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: 'text.secondary',
                  }}
                >
                  Skill-based, competitive gameplay with real-world impact.
                </Typography>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={6}>
              <Card
                sx={{
                  height: '100%',
                  textAlign: 'center',
                  p: 4,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                  },
                }}
              >
                <Box sx={{ color: '#0B7897', mb: 2 }}>
                  <SchoolIcon sx={{ fontSize: 48 }} />
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                    color: '#063C5E',
                  }}
                >
                  Schools & Educators
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: 'text.secondary',
                  }}
                >
                  Discussion-based digital literacy before damage occurs.
                </Typography>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={6}>
              <Card
                sx={{
                  height: '100%',
                  textAlign: 'center',
                  p: 4,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                  },
                }}
              >
                <Box sx={{ color: '#0B7897', mb: 2 }}>
                  <BusinessIcon sx={{ fontSize: 48 }} />
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                    color: '#063C5E',
                  }}
                >
                  Companies & Teams
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: 'text.secondary',
                    mb: 2,
                  }}
                >
                  Design aligned to NIS2 and ISO 27001 human factor security awareness training requirements.
                </Typography>
                <Button
                href="/scenario-lab#demo-form"
                  variant="outlined"
                  sx={{
                    borderColor: '#0B7897',
                    color: '#0B7897',
                    whiteSpace: 'nowrap',
                    '&:hover': {
                      borderColor: '#063C5E',
                      backgroundColor: 'rgba(6, 60, 94, 0.04)',
                    },
                  }}
                >
                  Request B2B Demo Deck
                </Button>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Help Us Reach Our Goal Section */}
      <Box sx={{ py: { xs: 6, md: 8 }, backgroundColor: '#ffffff' }}>
        <Container maxWidth="md" data-aos="fade-up">
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '2rem', md: '2.5rem' },
              fontWeight: 700,
              mb: 2,
              textAlign: 'center',
              color: '#063C5E',
            }}
          >
            Help Us Reach Our Goal: 100 Schools
          </Typography>
          
          <Typography
            variant="body1"
            sx={{
              fontSize: { xs: '1rem', md: '1.125rem' },
              textAlign: 'center',
              mb: 4,
              color: '#063C5E',
            }}
          >
            Your signup counts as 1 vote for your local school. Help us unlock the first 500 digital licenses.
          </Typography>
          
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#063C5E' }}>
                12 / 100 Schools Activated
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                12%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={12}
              sx={{
                height: 12,
                borderRadius: 6,
                backgroundColor: '#E9F4FF',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#0B7897',
                  borderRadius: 6,
                },
              }}
            />
          </Box>
          
          <Typography
            variant="body2"
            sx={{
              textAlign: 'center',
              mb: 4,
              color: 'text.secondary',
              fontStyle: 'italic',
            }}
          >
            No spam. No sales. Just progress.
          </Typography>
          
          <Paper
            elevation={3}
            sx={{
              p: 4,
              backgroundColor: '#E9F4FF',
              borderRadius: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontSize: { xs: '1.1rem', md: '1.25rem' },
                fontWeight: 600,
                mb: 3,
                textAlign: 'center',
                color: '#063C5E',
              }}
            >
              Train Before Scammers Do → Get Early Access
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
                    // backgroundColor: 'white',
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
              We&apos;ll only email you with launch updates.
            </Typography>
          </Paper>
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
            Founder Credibility
          </Typography>
          <Typography
            variant="h3"
            sx={{
              fontSize: { xs: '1.5rem', md: '2rem' },
              fontWeight: 700,
              mb: 4,
              textAlign: 'center',
            }}
          >
            Why was Konfydence created?
          </Typography>
          <Grid container spacing={4} alignItems="stretch">
            <Grid item xs={12} md={6}>
              <Box sx={{ border: '2px solid white', borderRadius: 2, p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography
                variant="body2"
                sx={{
                  fontSize: { xs: '0.9rem', md: '0.95rem' },
                  lineHeight: 1.7,
                  mb: 2,
                  color: 'white',
                }}
              >
                I spent over 15 years in high-stakes finance and compliance, working with organizations like PIMCO and Ford.
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: { xs: '0.9rem', md: '0.95rem' },
                  lineHeight: 1.7,
                  mb: 2,
                  color: 'white',
                }}
              >
                I saw it happen again and again: smart, experienced people I worked with and even close family members falling for scams despite knowing better.
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: { xs: '0.9rem', md: '0.95rem' },
                  lineHeight: 1.7,
                  mb: 2,
                  color: 'white',
                }}
              >
                Not because they lacked knowledge.
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: { xs: '0.9rem', md: '0.95rem' },
                  lineHeight: 1.7,
                  mb: 2,
                  fontWeight: 600,
                  color: 'white',
                }}
              >
                But because pressure always beats theory.
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: { xs: '0.9rem', md: '0.95rem' },
                  lineHeight: 1.7,
                  mb: 2,
                  color: 'white',
                }}
              >
                That&apos;s why I decided to create Konfydence, a simple, game-based way to train your instincts, not just your knowledge.
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: { xs: '0.9rem', md: '0.95rem' },
                  lineHeight: 1.7,
                  color: 'white',
                }}
              >
                You practice spotting scams, pausing under pressure, and making calm, confident decisions.
              </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  p: 5,
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderRadius: 2,
                  borderLeft: '4px solid #FF725E',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <Typography
                  variant="h4"
                  sx={{
                    fontSize: { xs: '1.75rem', md: '2rem' },
                    fontWeight: 600,
                    mb: 3,
                    // fontStyle: 'italic',
                    lineHeight: 1.4,
                    color: 'white',
                  }}
                >
                  &quot;Scammers don&apos;t win because we&apos;re careless or dumb. They win because they rush us to act fast. With Konfydence you train to act faster, by pausing first.&quot;
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: { xs: '1rem', md: '1.125rem' },
                    color: 'white',
                  }}
                >
                  – Tichi Mbanwie, Founder
                </Typography>
              </Box>
            </Grid>
          </Grid>
          
          {/* Decision Ladder Visual */}
          <Box sx={{ mt: 6 }}>
            <Typography
              variant="h5"
              sx={{
                fontSize: { xs: '1.25rem', md: '1.5rem' },
                fontWeight: 600,
                mb: 5,mt:5,
                textAlign: 'center',
                color: 'white',
              }}
            >
              The Decision Ladder
            </Typography>
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={6}>
                <Grid container spacing={2}>
                  {['Breathe', 'Pause (5 seconds)', 'Think', 'Respond'].map((step, idx) => (
                    <Grid item xs={12} sm={6} key={idx}>
                      <Box
                        sx={{
                          p: 3,
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          borderRadius: 2,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                          // minHeight: { xs: '80px', md: '100px' },
                        }}
                      >
                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'white', textAlign: 'center' }}>
                          {step}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
              <Grid item xs={12} md={6} data-aos="fade-left">
                <Box
                  sx={{
                    width: '100%',
                    // height: { xs: '300px', md: '500px' },
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Box
                    component="img"
                    src="/images/ladder.jpeg"
                    alt="The Decision Ladder"
                    sx={{
                      // maxWidth: { xs: '100%', md: '90%' },
                      width: '100%',
                      borderRadius:3,
                      height: '100%',
                      objectFit: 'contain',
                      // borderRadius: 10,
                    }}
                    onError={(e) => {
                      // Try .jpeg if .png fails
                      if (e.target.src.includes('.png')) {
                        e.target.src = '/images/ssk-header.jpeg';
                      }
                    }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>

      {/* Product Details Section */}
      <Box sx={{ py: { xs: 4, md: 5 }, backgroundColor: '#E9F4FF' }}>
        <Container maxWidth="lg" data-aos="fade-up">
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '2rem', md: '2.5rem' },
              fontWeight: 700,
              mb: 6,
              textAlign: 'center',
              color: '#063C5E',
            }}
          >
            Inside Your Konfydence Kit
          </Typography>
          
          <Grid container spacing={2} >
          {/* <Grid item xs={12} md={2}></Grid> */}
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  height: '100%',
                  border: '2px solid #063C5E',
                  borderRadius: 2,
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <Stack spacing={3}>
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        mb: 1,
                        color: '#063C5E',
                        fontSize: { xs: '1.1rem', md: '1.25rem' },
                      }}
                    >
                      90 Premium Cards
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: 'text.secondary',
                        fontSize: { xs: '0.95rem', md: '1rem' },
                      }}
                    >
                      80 scenarios + 10 discussion wild cards
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        mb: 1,
                        color: '#063C5E',
                        fontSize: { xs: '1.1rem', md: '1.25rem' },
                      }}
                    >
                      Simple Rules
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: 'text.secondary',
                        fontSize: { xs: '0.95rem', md: '1rem' },
                      }}
                    >
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
                        fontSize: { xs: '1.1rem', md: '1.25rem' },
                      }}
                    >
                      Scoring System
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: 'text.secondary',
                        fontSize: { xs: '0.95rem', md: '1rem' },
                      }}
                    >
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
                        fontSize: { xs: '1.1rem', md: '1.25rem' },
                      }}
                    >
                      Digital Extension Add-On
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: 'text.secondary',
                        fontSize: { xs: '0.95rem', md: '1rem' },
                      }}
                    >
                      Optional updates and new scenarios
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Swiper
                modules={[Autoplay, Pagination]}
                spaceBetween={8}
                slidesPerView={2}
                breakpoints={{
                  0: {
                    slidesPerView: 2,
                    spaceBetween: 8,
                  },
                  600: {
                    slidesPerView: 2,
                    spaceBetween: 8,
                  },
                  960: {
                    slidesPerView: 2,
                    spaceBetween: 8,
                  },
                }}
                autoplay={{
                  delay: 3000,
                  disableOnInteraction: false,
                }}
                pagination={{ clickable: true }}
              >
                {[
                  { src: '/images/1.png', alt: 'Bank Email Scam Back Side Card' },
                  { src: '/images/1Bank.png', alt: 'Bank Email Scam' },
                  { src: '/images/2delivery.png', alt: 'Package Tracking Scam' },
                  { src: '/images/2.png', alt: 'Bank Email Scam Back Side Card' },
                  { src: '/images/5lottery.png', alt: 'Lottery Scam' },
                  { src: '/images/5.png', alt: 'Bank Email Scam Back Side Card' },
                  { src: '/images/7friend.png', alt: 'Friend in Need Scam' },
                  { src: '/images/7.png', alt: 'Bank Email Scam Back Side Card' },
                  { src: '/images/15grandchild.png', alt: 'Grandchild Scam' },
                  { src: '/images/15.png', alt: 'Bank Email Scam Back Side Card' },
                ].map((image, idx) => (
                  <SwiperSlide key={idx}>
                    <Box
                      sx={{
                        borderRadius: 2,
                        overflow: 'hidden',
                        width: '100%',
                        // height: { xs: '400px', md: '500px' },
                      }}
                    >
                      <Box
                        component="img"
                        src={image.src}
                        alt={image.alt}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          display: 'block',
                        }}
                      />
                    </Box>
                  </SwiperSlide>
                ))}
              </Swiper>
            </Grid>
            {/* <Grid item xs={12} md={2}></Grid> */}
          </Grid>
        </Container>
      </Box>

      {/* Our Mission Section */}
      <Box sx={{ py: { xs: 6, md: 8 }, backgroundColor: '#E9F4FF' }}>
        <Container maxWidth="lg" data-aos="fade-up">
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '2rem', md: '2.5rem' },
              fontWeight: 700,
              mb: 3,
              textAlign: 'center',
              color: '#063C5E',
            }}
          >
            Our Mission: Security Built Responsibly
          </Typography>
          
          <Typography
            variant="body1"
            sx={{
              fontSize: { xs: '1rem', md: '1.125rem' },
              lineHeight: 1.8,
              mb: 4,
              textAlign: 'center',
              color: '#063C5E',
              fontWeight: 600,
            }}
          >
            Security isn&apos;t just protection, it&apos;s responsibility.
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  p: 4,
                  height: '100%',
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  backgroundColor: 'white',
                  border: '1px solid #E0E0E0',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
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
                    Quality, transparency, ethical production
                  </Typography>
                </Box>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  p: 4,
                  height: '100%',
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  backgroundColor: 'white',
                  border: '1px solid #E0E0E0',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
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
                    Real social impact
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    $1 per kit supports digital resilience programs for children
                  </Typography>
                </Box>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  p: 4,
                  height: '100%',
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  backgroundColor: 'white',
                  border: '1px solid #E0E0E0',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <Box sx={{ textAlign: 'center' }}>
                  <GroupIcon sx={{ fontSize: 64, color: '#0B7897', mb: 2 }} />
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      mb: 2,
                      color: '#063C5E',
                    }}
                  >
                    Inclusion
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    Partnerships with sheltered workshops for assembly
                  </Typography>
                </Box>
              </Card>
            </Grid>
          </Grid>
          
          <Typography
            variant="body1"
            sx={{
              fontSize: { xs: '1rem', md: '1.125rem' },
              lineHeight: 1.8,
              mt: 4,
              textAlign: 'center',
              color: '#063C5E',
              fontWeight: 600,
            }}
          >
            Every kit supports a safer digital society.
          </Typography>
        </Container>
      </Box>

      {/* Why Konfydence Isn't Available Yet Section */}
      <Box sx={{ py: { xs: 6, md: 8 }, backgroundColor: '#ffffff' }}>
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
            Why Konfydence Isn&apos;t Available Yet
          </Typography>
          
          <Typography
            variant="body1"
            sx={{
              fontSize: { xs: '1rem', md: '1.125rem' },
              lineHeight: 1.8,
              mb: 3,
              color: '#063C5E',
            }}
          >
            We&apos;re preparing our Kickstarter launch to produce Konfydence responsibly, locally, ethically, and at scale.
          </Typography>
          
          <Typography
            variant="body1"
            sx={{
              fontSize: { xs: '1rem', md: '1.125rem' },
              lineHeight: 1.8,
              mb: 3,
              color: '#063C5E',
            }}
          >
            Early access helps us plan production, partnerships, and impact the right way.
          </Typography>
          
          <Typography
            variant="body1"
            sx={{
              fontSize: { xs: '1rem', md: '1.125rem' },
              lineHeight: 1.8,
              mb: 4,
              fontWeight: 600,
              // color: '#FF725E',
            }}
          >
            Every month without training is another chance for scammers to win.
          </Typography>
        </Container>
      </Box>

      {/* FAQ Section */}
      {/* <Box sx={{ py: { xs: 6, md: 8 }, backgroundColor: '#E9F4FF' }}>
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
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
              <Accordion
                key={idx}
                expanded={expanded[`faq-${idx}`] || false}
                onChange={handleAccordionChange(`faq-${idx}`)}
                sx={{
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  borderRadius: '8px !important',
                  mb: 1,
                  '&:before': {
                    display: 'none',
                  },
                  '&.Mui-expanded': {
                    margin: '0 0 8px 0',
                    boxShadow: '0 4px 16px rgba(11, 120, 151, 0.15)',
                  },
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={
                    <ExpandMoreIcon
                      sx={{
                        color: '#0B7897',
                        transition: 'transform 0.3s ease',
                        transform: expanded[`faq-${idx}`]
                          ? 'rotate(180deg)'
                          : 'rotate(0deg)',
                      }}
                    />
                  }
                  sx={{
                    py: 2,
                    px: 3,
                    pr: 1,
                    '&.Mui-expanded': {
                      backgroundColor: '#f0f9fb',
                      borderLeft: '4px solid #0B7897',
                      paddingLeft: '19px',
                    },
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: '#063C5E',
                      fontSize: { xs: '1rem', md: '1.125rem' },
                      width: '100%',
                      pr: 2,
                    }}
                  >
                    {faq.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails
                  sx={{
                    px: 3,
                    py: 3,
                    backgroundColor: '#fafafa',
                    borderTop: '1px solid #e0e0e0',
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'text.primary',
                      lineHeight: 1.8,
                      fontSize: { xs: '0.9375rem', md: '1rem' },
                    }}
                  >
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Container>
      </Box> */}

      {/* Final CTA Section */}
      <Box sx={{ py: { xs: 6, md: 10 }, backgroundColor: '#063C5E', color: 'white' }}>
        <Container maxWidth="lg" data-aos="zoom-in">
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '2rem', md: '2.5rem' },
              fontWeight: 700,
              mb: 3,
              textAlign: 'center',
            }}
          >
            You can&apos;t control scammers. But you can control how you respond.
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontSize: { xs: '1.25rem', md: '1.75rem' },
              fontWeight: 600,
              mb: 4,
              textAlign: 'center',
              opacity: 0.95,
            }}
          >
            Join the First Line of Defense → Get Early Access
          </Typography>
          
          <Grid container spacing={4} alignItems="stretch" justifyContent="center">
            <Grid item xs={12} md={8}>
              <Paper
                elevation={3}
                sx={{
                  p: { xs: 3, md: 5 },
                  backgroundColor: 'white',
                  borderRadius: 2,
                  height: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <Box component="form" onSubmit={handleEmailSubmit}>
              <Stack spacing={3}>
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
                    py: 2,
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
            
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography
                variant="body2"
                sx={{
                  fontSize: '0.875rem',
                  color: 'text.secondary',
                  mb: 2,
                }}
              >
                No spam. Unsubscribe anytime.
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: '0.875rem',
                  // color: '#FF725E',
                  fontWeight: 600,
                  mb: 1,
                }}
              >
                Kickstarter launch: February 2026
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: '0.875rem',
                  color: 'text.secondary',
                }}
              >
                Limited early-bird availability
              </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Footer />
      
      {/* Success Modal */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 3,
            // Ensure the modal uses Poppins explicitly (portal content may not inherit CSS variables)
            fontFamily: "'Poppins', sans-serif !important",
          },
        }}
      >
        <DialogTitle
          sx={{
            textAlign: 'center',
            fontSize: { xs: '1.5rem', md: '2rem' },
            fontWeight: 700,
            color: '#063C5E',
            pb: 2,
          fontFamily: "'Poppins', sans-serif !important",
          }}
        >
          You&apos;re on the list!
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '1rem', md: '1rem' },
                color: 'text.primary',
                mb: 2,
                lineHeight: 1.6,
              fontFamily: "'Poppins', sans-serif",
              }}
            >
              While you wait for early access, here&apos;s your instant 5-Second Defense Cheat Sheet.
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontSize: { xs: '0.95rem', md: '1rem' },
                color: 'text.secondary',
                lineHeight: 1.6,
              fontFamily: "'Poppins', sans-serif",
              }}
            >
              It covers the most common scams right now — including the rising AI Voice / Grandchild in Trouble scam that hits families hard.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3, px: 3 }}>
          <Button
            variant="contained"
            onClick={handleSendPdfToEmail}
            disabled={sendingPdf}
            sx={{
              backgroundColor: '#0B7897',
              color: 'white',
              py: 1.5,
              px: 4,
              fontSize: { xs: '1rem', md: '1.125rem' },
              fontWeight: 600,
              borderRadius: 2,
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#063C5E',
              },
            }}
            fullWidth
          >
            {sendingPdf ? 'Sending...' : 'Get Your Cheat Sheet Now'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

