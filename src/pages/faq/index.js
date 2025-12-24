import { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Fade,
  Grow,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import PeopleIcon from '@mui/icons-material/People';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const konfydenceFAQs = [
  {
    question: 'What is Konfydence?',
    answer: 'Konfydence is an interactive learning system that helps people recognize scams and manipulation before harm happens. It focuses on human behavior, not technical skills.',
  },
  {
    question: 'Is Konfydence a card game or a training program?',
    answer: 'Both. Konfydence uses physical and digital cards to simulate real-world scam scenarios and guide structured discussion. The goal is learning through decision-making and reflection, not memorization.',
  },
  {
    question: 'Who is Konfydence for?',
    answer: (
      <>
        <Box component="ul" sx={{ pl: 3, mb: 0 }}>
          <li>Families and individuals</li>
          <li>Schools and youth programs</li>
          <li>Organizations and teams</li>
          <li>Anyone who uses email, messaging apps, or online services</li>
        </Box>
        <Typography variant="body1" sx={{ mt: 2 }}>
          If you interact digitally, Konfydence is relevant.
        </Typography>
      </>
    ),
  },
  {
    question: 'Is this only for "non-technical" people?',
    answer: 'No. Scams don\'t target ignorance — they exploit psychological shortcuts. Even experienced professionals fall victim under pressure. Konfydence is designed for all levels.',
  },
  {
    question: 'Does Konfydence use fear or shock tactics?',
    answer: 'No. We deliberately avoid scare tactics. Learning works best when people feel calm, curious, and confident.',
  },
  {
    question: 'Is Konfydence age-appropriate?',
    answer: 'Yes. Scenarios are designed to work across generations. From 12 years. Discussions can be adapted for children, teens, adults, and seniors.',
  },
  {
    question: 'Is Konfydence a compliance or certification tool?',
    answer: 'No. Konfydence does not certify compliance. It supports awareness and behavior-based learning and can provide documentation that organizations may use as part of their risk and training efforts.',
  },
  {
    question: 'Does Konfydence track individual behavior?',
    answer: 'No. Konfydence focuses on group-level learning and discussion. It does not monitor, score, or profile individuals.',
  },
  {
    question: 'How does the digital extension work?',
    answer: (
      <>
        <Typography variant="body1" paragraph>
          Each physical kit includes a QR code that unlocks optional digital access, including:
        </Typography>
        <Box component="ul" sx={{ pl: 3, mb: 0 }}>
          <li>additional scenarios</li>
          <li>updates</li>
          <li>self-paced learning</li>
        </Box>
        <Typography variant="body1" sx={{ mt: 2 }}>
          A free trial is included.
        </Typography>
      </>
    ),
  },
  {
    question: 'What is "Konfydence for Kids"?',
    answer: 'For kids-related products, €1 per unit is donated to initiatives that strengthen digital resilience for children and young people.',
  },
];

const ambassadorFAQs = [
  {
    question: 'What is a Konfydence Ambassador?',
    answer: 'A Konfydence Ambassador is an independent partner who helps spread digital resilience by introducing Konfydence to families, schools, organizations, or communities. Ambassadors are rewarded for real impact — not for clicks or hype.',
  },
  {
    question: 'Is this an affiliate or MLM program?',
    answer: (
      <>
        <Typography variant="body1" paragraph>
          No. There are:
        </Typography>
        <Box component="ul" sx={{ pl: 3, mb: 0 }}>
          <li>no teams</li>
          <li>no downlines</li>
          <li>no recruiting others</li>
          <li>no variable pricing</li>
        </Box>
        <Typography variant="body1" sx={{ mt: 2 }}>
          This is a direct, transparent partner model.
        </Typography>
      </>
    ),
  },
  {
    question: 'How are ambassadors rewarded?',
    answer: (
      <>
        <Typography variant="body1" paragraph>
          Ambassadors are rewarded based on outcomes:
        </Typography>
        <Box component="ul" sx={{ pl: 3, mb: 0 }}>
          <li>product sales (B2C)</li>
          <li>qualified leads (education & organizations)</li>
          <li>closed contracts (where applicable)</li>
        </Box>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Typical rewards range from 10–15%, depending on the context.
        </Typography>
      </>
    ),
  },
  {
    question: 'What is an ambassador code?',
    answer: 'Each ambassador receives a personal code used to: attribute sales, track introductions, and ensure transparent rewards. The code is used only for attribution.',
  },
  {
    question: 'Can ambassadors offer discounts?',
    answer: 'No. Pricing is fixed across all channels to protect trust and fairness.',
  },
  {
    question: 'Can I order products in bulk for events or workshops?',
    answer: (
      <>
        <Typography variant="body1" paragraph>
          Yes. Ambassadors can place bulk orders for:
        </Typography>
        <Box component="ul" sx={{ pl: 3, mb: 0 }}>
          <li>workshops</li>
          <li>trainings</li>
          <li>conferences</li>
          <li>community events</li>
        </Box>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Bulk orders follow fixed pricing and still qualify for ambassador rewards.
        </Typography>
      </>
    ),
  },
  {
    question: 'Do ambassadors need to close sales?',
    answer: 'No. Especially for schools and organizations, ambassadors typically: make introductions, open conversations, and support pilots. Konfydence handles contracting and pricing.',
  },
  {
    question: 'When are rewards paid?',
    answer: 'Rewards are paid based on: confirmed sales, or qualified leads reaching defined milestones. Details are shared during onboarding.',
  },
  {
    question: 'Are there minimum sales targets?',
    answer: 'No. Ambassador activity is quality-driven, not quota-driven.',
  },
  {
    question: 'Can anyone become an ambassador?',
    answer: 'We review each application to ensure alignment with Konfydence values and mission. This helps protect: ambassadors\' credibility, customer trust, and brand integrity.',
  },
  {
    question: 'Is there a contract?',
    answer: 'Yes. Ambassadors receive a clear, plain-language agreement outlining: responsibilities, rewards, data protection, and ethical guidelines.',
  },
  {
    question: 'Can I stop anytime?',
    answer: 'Yes. There are no long-term obligations.',
  },
];

export default function FAQPage() {
  const [expanded, setExpanded] = useState({});

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded({ ...expanded, [panel]: isExpanded });
  };

  return (
    <>
      <Header />
      <Box
        component="main"
        sx={{
          pt: { xs: 8, md: 10 },
          minHeight: '80vh',
          background: 'linear-gradient(180deg, #f5f5f5 0%, #ffffff 100%)',
        }}
      >
        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
          {/* Header Section */}
          <Fade in timeout={800}>
            <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  fontWeight: 700,
                  color: '#0B7897',
                  mb: 2,
                  background: 'linear-gradient(135deg, #0B7897 0%, #063C5E 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Frequently Asked Questions
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: 'text.secondary',
                  maxWidth: '600px',
                  mx: 'auto',
                  fontWeight: 400,
                }}
              >
                Find answers to common questions about Konfydence and our Ambassador program
              </Typography>
            </Box>
          </Fade>

          {/* Konfydence FAQs Section */}
          <Grow in timeout={1000}>
            <Box sx={{ mb: { xs: 6, md: 8 } }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  mb: 4,
                  pb: 2,
                  borderBottom: '3px solid #0B7897',
                }}
              >
                <QuestionAnswerIcon
                  sx={{
                    fontSize: { xs: '2rem', md: '2.5rem' },
                    color: '#0B7897',
                  }}
                />
                <Typography
                  variant="h3"
                  sx={{
                    fontSize: { xs: '1.75rem', md: '2.25rem' },
                    fontWeight: 600,
                    color: '#0B7897',
                  }}
                >
                  Konfydence
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {konfydenceFAQs.map((faq, index) => (
                  <Fade
                    key={index}
                    in
                    timeout={600}
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    <Accordion
                      expanded={expanded[`konfydence-${index}`] || false}
                      onChange={handleChange(`konfydence-${index}`)}
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
                              transform: expanded[`konfydence-${index}`]
                                ? 'rotate(180deg)'
                                : 'rotate(0deg)',
                            }}
                          />
                        }
                        sx={{
                          py: 2,
                          px: 3,
                          '&.Mui-expanded': {
                            backgroundColor: '#f0f9fb',
                            borderLeft: '4px solid #0B7897',
                          },
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            color: '#063C5E',
                            fontSize: { xs: '1rem', md: '1.125rem' },
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
                        {typeof faq.answer === 'string' ? (
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
                        ) : (
                          <Box
                            sx={{
                              color: 'text.primary',
                              lineHeight: 1.8,
                              fontSize: { xs: '0.9375rem', md: '1rem' },
                            }}
                          >
                            {faq.answer}
                          </Box>
                        )}
                      </AccordionDetails>
                    </Accordion>
                  </Fade>
                ))}
              </Box>
            </Box>
          </Grow>

          <Divider sx={{ my: { xs: 4, md: 6 }, borderWidth: 2, borderColor: '#e0e0e0' }} />

          {/* Ambassador FAQs Section */}
          <Grow in timeout={1200}>
            <Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  mb: 4,
                  pb: 2,
                  borderBottom: '3px solid #0B7897',
                }}
              >
                <PeopleIcon
                  sx={{
                    fontSize: { xs: '2rem', md: '2.5rem' },
                    color: '#0B7897',
                  }}
                />
                <Typography
                  variant="h3"
                  sx={{
                    fontSize: { xs: '1.75rem', md: '2.25rem' },
                    fontWeight: 600,
                    color: '#0B7897',
                  }}
                >
                  Konfydence Ambassador
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {ambassadorFAQs.map((faq, index) => (
                  <Fade
                    key={index}
                    in
                    timeout={600}
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    <Accordion
                      expanded={expanded[`ambassador-${index}`] || false}
                      onChange={handleChange(`ambassador-${index}`)}
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
                              transform: expanded[`ambassador-${index}`]
                                ? 'rotate(180deg)'
                                : 'rotate(0deg)',
                            }}
                          />
                        }
                        sx={{
                          py: 2,
                          px: 3,
                          '&.Mui-expanded': {
                            backgroundColor: '#f0f9fb',
                            borderLeft: '4px solid #0B7897',
                          },
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            color: '#063C5E',
                            fontSize: { xs: '1rem', md: '1.125rem' },
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
                        {typeof faq.answer === 'string' ? (
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
                        ) : (
                          <Box
                            sx={{
                              color: 'text.primary',
                              lineHeight: 1.8,
                              fontSize: { xs: '0.9375rem', md: '1rem' },
                            }}
                          >
                            {faq.answer}
                          </Box>
                        )}
                      </AccordionDetails>
                    </Accordion>
                  </Fade>
                ))}
              </Box>
            </Box>
          </Grow>
        </Container>
      </Box>
      <Footer />
    </>
  );
}

