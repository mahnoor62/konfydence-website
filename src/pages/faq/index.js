'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import {
  Container,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Button,
  Grid,
  Tabs,
  Tab,
  Paper,
  Stack,
  Modal,
  IconButton,
} from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AmbassadorPopup from '@/components/AmbassadorPopup';

const FAQ_CATEGORIES = [
  'General',
  'Family Kit',
  'Science & Approach',
  'For Schools/Universities',
  'For Businesses',
  'Ambassador Program',
];

const faqData = {
  'General': [
    {
      question: 'What is Konfydence?',
      answer: 'Konfydence teaches the one habit that stops most scams: a quick pause under pressure. Using fun simulations and games based on behavioral science.',
    },
    {
      question: 'Who is Konfydence for?',
      answer: 'Families, students, schools, teams, and organizations—anyone wanting real confidence online.',
    },
    {
      question: 'How is Konfydence different from other training?',
      answer: 'We train behavior under stress (not just knowledge) with engaging tools that stick.',
    },
  ],
  'Family Kit': [
    {
      question: 'What\'s included in the Family Scam Survival Kit?',
      answer: '80 premium scenario cards, H.A.C.K. reference, digital extensions, and free Family Tech Agreement.',
    },
    {
      question: 'Is it suitable for kids and grandparents?',
      answer: 'Yes—designed for ages 12+, multi-generational play, no-blame discussions.',
    },
    {
      question: 'What are the current prices?',
      answer: 'Introductory: Physical $49 | Digital $29/year | Bundle $69 (Retail higher post-launch).',
    },
    {
      question: 'Does buying a kit help schools?',
      answer: 'Yes—every purchase donates a digital school license via Buy One, Give One.',
    },
  ],
  'Science & Approach': [
    {
      question: 'What is the "limbic hijack" and why does it matter?',
      answer: 'Scammers trigger emotions to bypass logic. We train you to pause and regain control. Explain the H.A.C.K. framework. Hurry, Authority, Comfort, Kill-Switch— the four tricks scammers always use. Spot them, pause 5 seconds.',
      hasImage: true,
      image: '/images/f3.png',
      imageAlt: 'Hot Brain vs Cool Brain - Limbic Hijack',
    },
    // {
    //   question: 'Explain the H.A.C.K. framework.',
    //   answer: 'Hurry, Authority, Comfort, Kill-Switch— the four tricks scammers always use. Spot them, pause 5 seconds.',
    // },
    {
      question: 'Is this based on real science?',
      answer: 'Yes—behavioral psychology proves short pauses outsmart emotional triggers. Read More →',
      hasImage: true,
      image: '/images/f4.png',
      imageAlt: 'Science-based approach',
      answerAfterImage: 'Answer to HACK = Breath, Pause, Think, Respond.',
      hasLink: true,
      linkText: 'Read More →',
      linkUrl: '/pdfs/the-limbic-hijack.pdf',
    },
  ],
  'For Schools/Universities': [
    {
      question: 'Are there free resources for educators?',
      answer: 'Yes—download our full Lesson Pack instantly.',
    },
    {
      question: 'How can we run a pilot?',
      answer: 'Request a free pilot tailored to your campus—no commitment.',
    },
  ],
  'For Businesses': [
    {
      question: 'What is CoMaSy?',
      answer: 'Our Compliance Mastery System: Simulations + auditor-ready reports for real risk reduction.',
    },
    {
      question: 'How does pricing work?',
      answer: 'Custom per-seat licensing—book a demo for details.',
    },
  ],
  'Ambassador Program': [
    {
      question: 'What is a Konfydence Ambassador?',
      answer: 'Passionate individuals spreading scam resilience—earn rewards, early access.',
    },
    {
      question: 'How do I join?',
      answer: 'Apply here',
      hasLink: true,
      linkText: 'Apply here',
      linkUrl: '/contact',
    },
  ],
};

export default function FAQPage() {
  const [expanded, setExpanded] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [ambassadorPopupOpen, setAmbassadorPopupOpen] = useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded({ ...expanded, [panel]: isExpanded });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setSearchQuery('');
  };

  const filterFAQs = (category) => {
    if (!searchQuery.trim()) return faqData[category];
    
    const query = searchQuery.toLowerCase();
    return faqData[category].filter(
      (faq) =>
        faq.question.toLowerCase().includes(query) ||
        (faq.answer && faq.answer.toLowerCase().includes(query)) ||
        (faq.answerAfterImage && faq.answerAfterImage.toLowerCase().includes(query))
    );
  };

  // Update active tab when search query changes
  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      let matchingTabIndex = activeTab;
      
      for (let i = 0; i < FAQ_CATEGORIES.length; i++) {
        const category = FAQ_CATEGORIES[i];
        const categoryFAQs = faqData[category] || [];
        const hasMatch = categoryFAQs.some(
          (faq) =>
            faq.question.toLowerCase().includes(query) ||
            (faq.answer && faq.answer.toLowerCase().includes(query)) ||
            (faq.answerAfterImage && faq.answerAfterImage.toLowerCase().includes(query))
        );
        if (hasMatch) {
          matchingTabIndex = i;
          break;
        }
      }
      
      if (matchingTabIndex !== activeTab) {
        setActiveTab(matchingTabIndex);
      }
    }
  }, [searchQuery]);

  const currentCategory = FAQ_CATEGORIES[activeTab];
  const filteredFAQs = filterFAQs(currentCategory);

  return (
    <>
      <Head>
        <title>Konfydence FAQ</title>
        <meta name="description" content="Got questions about Konfydence? Find answers about building real scam resilience for families, schools, and teams." />
      </Head>
      <Header />
      
      {/* Hero Section */}
      <Box sx={{ pt: { xs: 8, md: 10 }, backgroundColor: '#096888'}}>
        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
          {/* First Row: Left Content, Right Image Carousel */}
          <Grid container spacing={4} sx={{ alignItems: 'stretch', mb: 4 }}>
            <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
              <Box
                sx={{
                  width: '100%',
                  display: 'flex',
                  // bgcolor:'red',
                  height:{xs:'auto', md:400},
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '2rem', md: '2rem' },
                    fontWeight: 700,
                    mb: 3,
                    color: '#FFFFFF',
                    lineHeight: 1.2,
                  }}
                >
                  Got Questions About Konfydence? We&apos;ve Got Answers.
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    fontSize: { xs: '1.1rem', md: '1.3rem' },
                    fontWeight: 500,
                    mb: 3,
                    color: '#FFFFFF',
                    lineHeight: 1.6,
                  }}
                >
                  Everything you need to know about building real scam resilience—for families, schools, and teams.
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: { xs: '1rem', md: '1.125rem' },
                    mb: 2,mt:2,
                    lineHeight: 1.7,
                    color: 'rgba(255,255,255,0.9)',
                  }}
                >
                  From how the 5-second pause works to pricing and science—find quick answers below. Still have questions? We&apos;re here to help.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
              <Box
                sx={{
                  // bgcolor:'red',
                  height:{xs:'auto', md:400},
                  width: '100%',
                  borderRadius: 3,
                  overflow: 'hidden',
                  // boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Box
                  component="img"
                  src="/images/5SecondsDefense2.jpg"
                  alt="5 Second Defense"
                  sx={{
                    width: '80%',
                    // height: '100%',
                    objectFit: 'contain',
                    display: 'block',
                    borderRadius: 3,
                  }}
                />
                {/* Commented out slider
                <Swiper
                  modules={[Autoplay, Pagination, Navigation]}
                  spaceBetween={0}
                  slidesPerView={1}
                  autoplay={{
                    delay: 4000,
                    disableOnInteraction: false,
                  }}
                  pagination={{ clickable: true }}
                  navigation
                  style={{
                    '--swiper-pagination-color': '#FFFFFF',
                    '--swiper-navigation-color': '#FFFFFF',
                  }}
                >
                  <SwiperSlide>
                    <Box
                      component="img"
                      src="/images/5SecondsDefense2.jpg"
                      alt="5 Second Defense"
                      sx={{
                        width: '100%',
                        height: 'auto',
                        display: 'block',
                      }}
                    />
                  </SwiperSlide>
                  <SwiperSlide>
                    <Box
                      component="img"
                      src="/images/5SecondsDefense2.jpg"
                      alt="5 Second Defense"
                      sx={{
                        width: '100%',
                        height: 'auto',
                        display: 'block',
                      }}
                    />
                  </SwiperSlide>
                </Swiper>
                */}
              </Box>
            </Grid>
          </Grid>

          {/* Search and Contact Button - Centered Row */}
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Box
              sx={{
                mb: 3,
                maxWidth: 600,
                mx: 'auto',
              }}
            >
              <TextField
                fullWidth
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <Box sx={{ mr: 1, display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                      <SearchIcon />
                    </Box>
                  ),
                }}
                sx={{
                  backgroundColor: 'white',
                  borderRadius: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    '& fieldset': {
                      border: 'none',
                    },
                  },
                }}
              />
            </Box>
            <Button
              component={Link}
              href="/contact"
              variant="outlined"
              sx={{
                borderColor: '#FFFFFF',
                color: '#FFFFFF',
                px: 3,
                py: 1.5,
                borderRadius: 3,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                '&:hover': {
                  borderColor: '#FFFFFF',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Can&apos;t find your answer? Contact Us →
            </Button>
          </Box>
        </Container>
      </Box>

      {/* FAQ Categories Section */}
      <Box sx={{ py: { xs: 6, md: 8 }, backgroundColor: '#ffffff' }}>
        <Container maxWidth="lg">
          <Paper
            elevation={0}
            sx={{
              border: '1px solid #e0e0e0',
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{
                borderBottom: '2px solid #e0e0e0',
                '& .MuiTab-root': {
                  fontWeight: 600,
                  color: '#063C5E',
                  textTransform: 'none',
                  fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                  minHeight: { xs: '48px', md: '64px' },
                  px: { xs: 1.5, sm: 2, md: 3 },
                  '&.Mui-selected': {
                    color: '#0B7897',
                  },
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#0B7897',
                  height: 3,
                },
                '& .MuiTabs-scrollButtons': {
                  color: '#0B7897',
                  '&.Mui-disabled': {
                    opacity: 0.3,
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(11, 120, 151, 0.1)',
                  },
                },
                '& .MuiTabs-scrollButtons.Mui-disabled': {
                  opacity: 0.3,
                },
              }}
            >
              {FAQ_CATEGORIES.map((category) => (
                <Tab key={category} label={category} />
              ))}
            </Tabs>

            <Box sx={{ p: { xs: 3, md: 4 }, maxWidth: '900px', mx: 'auto' }}>
              {filteredFAQs.length === 0 ? (
                <Typography
                  variant="body1"
                  sx={{
                    textAlign: 'center',
                    color: 'text.secondary',
                    py: 4,
                  }}
                >
                  No FAQs found matching &quot;{searchQuery}&quot; in {currentCategory}.
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {filteredFAQs.map((faq, index) => (
                    <Accordion
                      key={index}
                      expanded={expanded[`${currentCategory}-${index}`] || false}
                      onChange={handleChange(`${currentCategory}-${index}`)}
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
                              transform: expanded[`${currentCategory}-${index}`]
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
                        {faq.answer && (
                          <Typography
                            variant="body1"
                            component="div"
                            sx={{
                              color: 'text.primary',
                              lineHeight: 1.8,
                              fontSize: { xs: '0.9375rem', md: '1rem' },
                              mb: faq.hasImage ? 2 : 0,
                            }}
                          >
                            {faq.hasLink && (faq.answer.includes('[Read More →]') || faq.answer.includes('Read More →')) ? (
                              <>
                                {faq.answer.includes('[Read More →]') 
                                  ? faq.answer.split('[Read More →]')[0]
                                  : faq.answer.split('Read More →')[0]
                                }{' '}
                                {faq.linkUrl.startsWith('/pdfs/') ? (
                                  <Typography
                                    component="a"
                                    href={faq.linkUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    sx={{
                                      color: '#0B7897',
                                      fontWeight: 600,
                                      textDecoration: 'none',
                                      cursor: 'pointer',
                                      display: 'inline',
                                      '&:hover': {
                                        color: '#063C5E',
                                        textDecoration: 'underline',
                                      },
                                    }}
                                  >
                                    Read More →
                                  </Typography>
                                ) : (
                                  <Link
                                    href={faq.linkUrl}
                                    style={{
                                      color: '#0B7897',
                                      fontWeight: 600,
                                      textDecoration: 'none',
                                      cursor: 'pointer',
                                    }}
                                    onMouseEnter={(e) => {
                                      e.target.style.color = '#063C5E';
                                      e.target.style.textDecoration = 'underline';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.target.style.color = '#0B7897';
                                      e.target.style.textDecoration = 'none';
                                    }}
                                  >
                                    Read More →
                                  </Link>
                                )}
                              </>
                            ) : faq.hasLink && faq.linkText ? (
                              <>
                                {faq.answer.replace(faq.linkText, '').trim()}{' '}
                                {faq.linkUrl === '/contact' && faq.linkText === 'Apply here' ? (
                                  <Typography
                                    component="span"
                                    onClick={() => setAmbassadorPopupOpen(true)}
                                    sx={{
                                      color: '#0B7897',
                                      fontWeight: 600,
                                      textDecoration: 'none',
                                      cursor: 'pointer',
                                      display: 'inline',
                                      '&:hover': {
                                        color: '#063C5E',
                                        textDecoration: 'underline',
                                      },
                                    }}
                                  >
                                    {faq.linkText}
                                  </Typography>
                                ) : (
                                  <Link
                                    href={faq.linkUrl}
                                    style={{
                                      color: '#0B7897',
                                      fontWeight: 600,
                                      textDecoration: 'none',
                                      cursor: 'pointer',
                                    }}
                                    onMouseEnter={(e) => {
                                      e.target.style.color = '#063C5E';
                                      e.target.style.textDecoration = 'underline';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.target.style.color = '#0B7897';
                                      e.target.style.textDecoration = 'none';
                                    }}
                                  >
                                    {faq.linkText}
                                  </Link>
                                )}
                              </>
                            ) : (
                              faq.answer
                            )}
                          </Typography>
                        )}
                        {faq.hasImage && (
                          <Box
                            component="img"
                            src={faq.image}
                            alt={faq.imageAlt}
                            sx={{
                              width: '100%',
                              maxWidth: '600px',
                              height: 'auto',
                              borderRadius: 2,
                              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                              mt: faq.answer ? 2 : 0,
                              mb: faq.answerAfterImage ? 2 : 0,
                              display: 'block',
                              mx: 'auto',
                            }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        )}
                        {faq.answerAfterImage && (
                          <Typography
                            variant="body1"
                            sx={{
                              color: 'text.primary',
                              lineHeight: 1.8,
                              fontSize: { xs: '0.9375rem', md: '1rem' },
                              fontWeight: 600,
                              mt: 2,
                            }}
                          >
                            {faq.answerAfterImage}
                          </Typography>
                        )}
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              )}
            </Box>
          </Paper>
        </Container>
      </Box>

      {/* HACK Image Thumbnail */}
      <Box sx={{ py: { xs: 3, md: 4 }, backgroundColor: '#ffffff', textAlign: 'center' }}>
        <Container maxWidth="md">
          <Typography
            variant="h6"
            sx={{
              mb: 2,
              color: '#063C5E',
              fontWeight: 600,
            }}
          >
            H.A.C.K. Framework Reference
          </Typography>
          <Box
            component="img"
            src="/images/hack.png"
            alt="H.A.C.K. Framework"
            onClick={() => setImageModalOpen(true)}
            sx={{
              maxWidth: { xs: '120px', md: '300px' },
              height: 'auto',
              cursor: 'pointer',
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
              },
            }}
          />
        </Container>
      </Box>

      {/* Bottom Close & Conversion */}
      <Box sx={{ py: { xs: 6, md: 8 }, backgroundColor: '#063C5E', color: 'white' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: '1.75rem', md: '2.5rem' },
                fontWeight: 700,
                mb: 3,
                color: 'white',
              }}
            >
              Still Have Questions? Let&apos;s Talk.
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '1rem', md: '1.125rem' },
                mb: 4,
                lineHeight: 1.8,
                color: 'rgba(255,255,255,0.9)',
                maxWidth: '800px',
                mx: 'auto',
              }}
            >
              We&apos;re real people building real habits—reach out anytime.
            </Typography>
          </Box>
          
          <Box
            sx={{
              maxWidth: { xs: '100%', sm: '700px' },
              mx: 'auto',
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Button
              component={Link}
              href="/products"
              variant="contained"
              sx={{
                backgroundColor: '#FF725E',
                color: 'white',
                py: 1.5,
                px: 4,
                fontWeight: 600,
                fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                width: { xs: '100%', sm: 'calc(50% - 8px)' },
                maxWidth: { xs: '100%', sm: '340px' },
                '&:hover': {
                  backgroundColor: '#e65a4a',
                },
              }}
            >
              Families → Get Your Kit
            </Button>
            <Button
              component={Link}
              href="/education#pilot-form"
              variant="contained"
              sx={{
                backgroundColor: '#0B7897',
                color: 'white',
                py: 1.5,
                px: 4,
                fontWeight: 600,
                fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                width: { xs: '100%', sm: 'calc(50% - 8px)' },
                maxWidth: { xs: '100%', sm: '340px' },
                '&:hover': {
                  backgroundColor: '#063C5E',
                },
              }}
            >
              Schools → Free Resources
            </Button>
            <Button
              component={Link}
              href="/comasi#demo-form"
              variant="contained"
              sx={{
                backgroundColor: '#0B7897',
                color: 'white',
                py: 1.5,
                px: 4,
                fontWeight: 600,
                fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                width: { xs: '100%', sm: 'calc(50% - 8px)' },
                maxWidth: { xs: '100%', sm: '340px' },
                '&:hover': {
                  backgroundColor: '#063C5E',
                },
              }}
            >
              Business → Request Demo
            </Button>
            <Button
              component={Link}
              href="/contact"
              variant="outlined"
              sx={{
                borderColor: 'white',
                color: 'white',
                py: 1.5,
                px: 4,
                fontWeight: 600,
                fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                width: { xs: '100%', sm: 'calc(50% - 8px)' },
                maxWidth: { xs: '100%', sm: '340px' },
                '&:hover': {
                  borderColor: '#FF725E',
                  backgroundColor: 'rgba(255, 114, 94, 0.1)',
                },
              }}
            >
              Contact Us →
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Full Image Modal */}
      <Modal
        open={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
        }}
      >
        <Box
          sx={{
            position: 'relative',
            maxWidth: '90vw',
            maxHeight: '90vh',
            outline: 'none',
          }}
        >
          <IconButton
            onClick={() => setImageModalOpen(false)}
            sx={{
              position: 'absolute',
              top: -40,
              right: 0,
              color: 'white',
              backgroundColor: 'rgba(0,0,0,0.5)',
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.7)',
              },
            }}
          >
            ×
          </IconButton>
          <Box
            component="img"
            src="/images/hack.png"
            alt="H.A.C.K. Framework - Full Size"
            sx={{
              width: '100%',
              height: 'auto',
              maxHeight: '90vh',
              objectFit: 'contain',
              borderRadius: 2,
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            }}
          />
        </Box>
      </Modal>

      {/* Ambassador Popup */}
      <AmbassadorPopup
        open={ambassadorPopupOpen}
        onClose={() => setAmbassadorPopupOpen(false)}
      />

      <Footer />
    </>
  );
}
