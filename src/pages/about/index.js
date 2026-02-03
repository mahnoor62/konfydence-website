import { Container, Typography, Box, Grid, Paper, Button, Stack } from '@mui/material';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Head from 'next/head';
import { useEffect, useState } from 'react';

export default function AboutPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Initialize AOS animations
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

  return (
    <>
      <Head>
        <title>Konfydence About</title>
        <meta name="description" content="Learn why Tichi Mbanwie founded Konfydence after 15 years in finance and compliance, and how we're building scam resilience for families, schools, and teams." />
      </Head>
      <Header />
      
      {/* Hero Section with Background */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #063C5E 0%, #0B7897 80%)',
          color: 'white',
          pt: { xs: 8, md: 10 },
        }}
      >
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }} data-aos="zoom-in"
                  data-aos-duration="800">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.5rem', md: '2rem' },
                  fontWeight: 700,
                  mb: 3,
                  color: '#FFFFFF',
                  lineHeight: 1.2,
                }}
              >
                Why Tichi Mbanwie Founded Konfydence
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  // fontSize: { xs: '1.1rem', md: '1.25rem' },
                  lineHeight: 1.8,
                  color: 'rgba(255,255,255,0.95)',
                  mb: 3,
                }}
              >
                Tichi Mbanwie spent over 16 years in finance and compliance at global organizations like PIMCO and Ford, where security was taken very seriously. Outside the workplace, he watched it happen again and again: smart, experienced people — including close family and friends with strong financial backgrounds — falling victim to scams.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6} data-aos="fade-left">
              <Box
                sx={{
                  width: '100%',
                  height: { xs: '400px', md: '500px' },
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  // borderRadius: 2,
                }}
              >
                <Box
                  component="img"
                  src="/images/titi.png"
                  alt="Tichi Mbanwie"
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    // borderRadiu,
                    // animation: 'floatImage 3s ease-in-out infinite',
                    // '@keyframes floatImage': {
                    //   '0%, 100%': { 
                    //     transform: 'translateY(0px)',
                    //   },
                    //   '50%': {
                    //     transform: 'translateY(-20px)',
                    //   },
                    // },
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Main Content */}
      <Box sx={{ backgroundColor: '#ffffff', py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg" data-aos="zoom-in"
                  data-aos-duration="800">
          <Box sx={{ mb: { xs: 6, md: 8 } }}>
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '1.1rem', md: '1.25rem' },
                lineHeight: 1.8,
                color: '#063C5E',
                mb: 3,
              }}
            >
              Fake lottery &quot;wins&quot; promising instant riches. Astronomical investment returns based on referring other people — not selling any products or services. Phishing calls from &quot;Microsoft support&quot; demanding urgent access. Sophisticated financial scams that drained accounts despite all the warnings.
            </Typography>

            <Box
              sx={{
                backgroundColor: '#E9F4FF',
                borderRadius: 3,
                p: { xs: 3, md: 4 },
                mb: 4,
                borderLeft: '4px solid #0B7897',
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  fontSize: { xs: '1.1rem', md: '1.25rem' },
                  lineHeight: 1.8,
                  color: '#063C5E',
                  fontStyle: 'italic',
                }}
              >
              Those triggers became the H.A.C.K. framework: Hurry, Authority, Comfort, Kill-Switch.
              </Typography>
            </Box>

            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '1.1rem', md: '1.25rem' },
                lineHeight: 1.8,
                color: '#063C5E',
                mb: 3,
              }}
            >
              That&apos;s when Tichi became convinced: Traditional training — videos, quizzes, alerts — wasn&apos;t enough. We don&apos;t need more knowledge. We need a simple habit that works under pressure: the 5-second pause.
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '1.1rem', md: '1.25rem' },
                lineHeight: 1.8,
                color: '#063C5E',
                mb: 3,
              }}
            >
              Konfydence was born from that conviction — to give people permission to slow down long enough to make a better decision.
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '1.1rem', md: '1.25rem' },
                lineHeight: 1.8,
                color: '#063C5E',
                fontWeight: 600,
              }}
            >
              Because if even finance pros can be hijacked in a moment of pressure, the answer isn&apos;t &quot;be smarter.&quot; It&apos;s &quot;be calmer — long enough to think.&quot;
            </Typography>
          </Box>

          {/* Closing Quote - Pullout Box */}
          <Box
            sx={{
              textAlign: 'center',
              mb: { xs: 6, md: 8 },
              py: { xs: 6, md: 8 },
              px: { xs: 3, md: 6 },
              backgroundColor: '#063C5E',
              borderRadius: 4,
              color: 'white',
              boxShadow: '0 25px 60px rgba(6,60,94,0.3)',
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontSize: { xs: '1.75rem', md: '2.25rem', lg: '2.5rem' },
                fontWeight: 700,
                mb: 3,
                lineHeight: 1.4,
                fontStyle: 'italic',
                maxWidth: '900px',
                mx: 'auto',
              }}
            >
              &quot;Scammers don&apos;t win because we&apos;re careless or dumb. They win because they rush us to act fast. With Konfydence you train to act faster, by pausing first.&quot;
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: 'rgba(255,255,255,0.9)',
                mt: 2,
              }}
            >
              – Tichi Mbanwie, Founder
            </Typography>
          </Box>

          {/* Quality & Trust Section */}
          {/* <Box sx={{ mb: { xs: 6, md: 8 } }} >
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: '2rem', md: '2.5rem' },
                fontWeight: 700,
                mb: 3,
                color: '#063C5E',
                textAlign: 'center',
              }}
            >
              Our Quality & Trust – Made in Germany
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '1.1rem', md: '1.25rem' },
                lineHeight: 1.8,
                color: '#063C5E',
                textAlign: 'center',
                maxWidth: '800px',
                mx: 'auto',
              }}
            >
              Our products are engineered for resilience. Every Konfydence card is designed and manufactured in Germany to meet the highest standards of quality and durability.
            </Typography>
          </Box> */}

          {/* Social Responsibility Section */}
          <Box
            sx={{
              backgroundColor: '#E9F4FF',
              borderRadius: 4,
              p: { xs: 4, md: 6 },
              mb: { xs: 6, md: 8 },
            }}
          
          >
      <Typography variant="h6" sx={{ fontSize: { xs: '1.1rem', md: '1.5rem' }, fontWeight: 600, mb: 2, color: 'black', textAlign: 'center' }}>How scammers rush you and how to outsmart them.</Typography>

          <Grid container sx={{ justifyContent: 'center' }}>
            <Grid item xs={12} md={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                      // maxWidth: 400, // keep size consistent and limit width on large screens
                      mx: 'auto',
                      paddingTop: '56.25%', // 16:9 aspect ratio
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
                      <source src="/video/video2.mp4" type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </Box>
            </Grid>
          </Grid>

            {/* <Typography
              variant="h3"
              sx={{
                fontSize: { xs: '2rem', md: '2.5rem' },
                fontWeight: 700,
                mb: 3,
                color: '#063C5E',
                textAlign: 'center',
              }}
            >
              Our Social Responsibility: Konfydence for Kids
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '1.1rem', md: '1.25rem' },
                lineHeight: 1.8,
                color: '#063C5E',
                textAlign: 'center',
                maxWidth: '800px',
                mx: 'auto',
                mb: 4,
              }}
            >
              Your purchase protects more than just your family. Through our program, we bring scam-spotting tools to vulnerable school communities — starting with Buy One, Give One during Kickstarter, and $1 donated per sale thereafter.
            </Typography>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <audio
                controls
                src="/video/video2.mp3"
                style={{
                  width: '100%',
                  maxWidth: 480,
                  display: 'block',
                  margin: '0 auto',
                  borderRadius: 8,
                }}
              >
                Your browser does not support the audio element.
              </audio> */}
            {/* </Box> */}
            {/* <Box sx={{ textAlign: 'center' }}>
              <Button
                component={Link}
                href="/education#pilot-form"
                variant="contained"
                size="large"
                sx={{
                  backgroundColor: '#0B7897',
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                  fontSize: { xs: '1rem', md: '1.1rem' },
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: '#063C5E',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 24px rgba(11,120,151,0.4)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                → Nominate a school
              </Button>
            </Box> */}
          </Box>

          {/* Decision Ladder Graphic - 2 Columns */}
          <Grid container spacing={4} sx={{ mb: { xs: 6, md: 8 } }} alignItems="stretch">
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
              <Typography
                variant="h4"
                sx={{
                  fontSize: { xs: '1.5rem', md: '1.75rem' },
                  fontWeight: 700,
                  mb: 2,
                  color: '#063C5E',
                }}
              >
                The Decision Ladder
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: { xs: '0.95rem', md: '1rem' },
                  lineHeight: 1.6,
                  color: '#063C5E',
                  mb: 3,
                }}
              >
                When faced with a potential scam, follow these four steps:
              </Typography>
              <Grid container spacing={2}>
                {/* First Row - Breathe and Pause */}
                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      backgroundColor: '#063C5E',
                      borderRadius: 2,
                      p: 2,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: '#FFFFFF',
                        mb: 1,
                        fontSize: { xs: '1rem', md: '1.125rem' },
                      }}
                    >
                      Breathe
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#FFFFFF',
                        fontSize: { xs: '0.875rem', md: '0.95rem' },
                        lineHeight: 1.5,
                      }}
                    >
                      Take a moment to calm your initial reaction
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      backgroundColor: '#063C5E',
                      borderRadius: 2,
                      p: 2,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: '#FFFFFF',
                        mb: 1,
                        fontSize: { xs: '1rem', md: '1.125rem' },
                      }}
                    >
                      Pause
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#FFFFFF',
                        fontSize: { xs: '0.875rem', md: '0.95rem' },
                        lineHeight: 1.5,
                      }}
                    >
                      Stop before taking any action
                    </Typography>
                  </Box>
                </Grid>
                {/* Second Row - Think and Respond */}
                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      backgroundColor: '#063C5E',
                      borderRadius: 2,
                      p: 2,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: '#FFFFFF',
                        mb: 1,
                        fontSize: { xs: '1rem', md: '1.125rem' },
                      }}
                    >
                      Think
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#FFFFFF',
                        fontSize: { xs: '0.875rem', md: '0.95rem' },
                        lineHeight: 1.5,
                      }}
                    >
                      Analyze the situation logically
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      backgroundColor: '#063C5E',
                      borderRadius: 2,
                      p: 2,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: '#FFFFFF',
                        mb: 1,
                        fontSize: { xs: '1rem', md: '1.125rem' },
                      }}
                    >
                      Respond
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#FFFFFF',
                        fontSize: { xs: '0.875rem', md: '0.95rem' },
                        lineHeight: 1.5,
                      }}
                    >
                      Make an informed decision
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', mt:5 }}>
              <Box
                component="img"
                src="/images/ladder.jpeg"
                alt="Decision Ladder - Breathe, Pause, Think, Respond"
                sx={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: 3,
                  boxShadow: '0 15px 40px rgba(0,0,0,0.1)',
                  filter: 'none',
                }}
              />
              </Box>
            </Grid>
          </Grid>

          {/* CTA Section */}
          {/* <Box
            sx={{
              textAlign: 'center',
              py: { xs: 6, md: 8 },
              backgroundColor: '#F5F8FB',
              borderRadius: 4,
              px: { xs: 3, md: 4 },
            }}
           
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={3}
              justifyContent="center"
              sx={{ maxWidth: 700, mx: 'auto' }}
            >
              <Button
                component={Link}
                href="/sskit-family"
                variant="contained"
                size="large"
                sx={{
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  backgroundColor: '#FF725E',
                  fontSize: { xs: '1rem', md: '1.1rem' },
                  '&:hover': {
                    backgroundColor: '#e65a4a',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 24px rgba(255, 114, 94, 0.4)',
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
                  backgroundColor: '#0B7897',
                  fontSize: { xs: '1rem', md: '1.1rem' },
                  '&:hover': {
                    backgroundColor: '#063C5E',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 24px rgba(11,120,151,0.4)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Request a Company or School Demo
              </Button>
            </Stack>
          </Box> */}
        </Container>
      </Box>
      <Footer />
    </>
  );
}
