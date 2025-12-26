'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DownloadIcon from '@mui/icons-material/Download';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const API_URL = `${API_BASE_URL}/api`;

const resourceSections = [
  {
    title: 'Schools',
    subtitle: 'Educator Vault (The 8-Doc School System)',
    description: 'Plug & Play Digital Resilience. Get ready-to-use classroom curriculum, tracking tools, and implementation guides for seamless integration into your school.',
    pdfs: [
      { display: 'Konfydence_For_Schools.pdf', file: 'Konfydence_For_Schools.pdf' },
      { display: 'School_Lesson_Plan.pdf', file: '1. School_Lesson_Plan.pdf' },
      { display: 'School_Behavioral Practice Log.pdf', file: '2. School_Behavioral Practice Log.pdf' },
      { display: 'School_Curriculum Alignment Map.pdf', file: '3. School_Curriculum Alignment Map.pdf' },
      { display: 'School_Parent HACK Guide.pdf', file: '4. School_Parent HACK Guide.pdf' },
      { display: 'SchoolBehavioralPractice.pdf', file: '5. SchoolBehavioralPractice.pdf' },
      { display: 'SchoolClassroom_Pause_Posters.pdf', file: '6. SchoolClassroom_Pause_Posters.pdf' },
      { display: 'School Implementation Roadmap.pdf', file: '7. School Implementation Roadmap.pdf' },
      { display: 'School-to-Parent Letter.docx', file: '8. School-to-Parent Letter.docx' },
    ],
  },
  {
    title: 'Universities',
    subtitle: 'University Defense',
    description: 'Protect Your Academic Future. Access specialized modules to defend against sophisticated academic, tuition, and financial scams targeting students.',
    pdfs: [
      { display: 'Konfydence_For_Universities.pdf', file: 'Konfydence_For_Universities.pdf' },
      { display: 'University_DEFEND YOUR DEGREE.pdf', file: 'University_DEFEND YOUR DEGREE.pdf' },
    ],
  },
  {
    title: 'Families',
    subtitle: 'Family Home Base',
    description: 'Safety Starts at the Table. Turn the 15-minute training into a lifelong family habit with downloadable tech contracts and scam prevention guides.',
    pdfs: [
    //   'Family Tech Contract.pdf',
    //   'Home H.A.C.K. Checklist.pdf',
    //   'Scam-of-the-Month Previews.pdf',
    ],
  },
  {
    title: 'Corporate',
    subtitle: 'Corporate Patron Hub',
    description: 'Fuel the Movement. Transform from a donor to a partner with professional deployment roadmaps, CSR impact reports, and brand integration guidelines.',
    pdfs: [
    //   'District-Wide Implementation Roadmap.pdf',
    //   'CSR Impact Report Templates.pdf',
    //   'Brand Integration Guidelines.pdf',
    ],
  },
  {
    title: 'Media',
    subtitle: 'Media & Proof',
    description: 'Science-Backed Safety. Explore the behavioral science behind the H.A.C.K. framework and see how we are disrupting the scam industry.',
    pdfs: [
    //   '10/10 Mission Video.pdf',
    //   'The "Limbic Hijack" Explainer.pdf',
    ],
  },
  {
    title: 'Implementation',
    subtitle: 'Deployment Resources',
    description: 'Complete implementation toolkit with roadmaps, templates, and best practices for successful deployment across organizations and districts.',
    pdfs: [
    //   'Implementation Guide.pdf',
    //   'Training Materials.pdf',
    //   'Assessment Tools.pdf',
    ],
  },
];

export default function Resources() {
  const { user, getAuthToken } = useAuth();
  const [hasTransactions, setHasTransactions] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkTransactions = async () => {
      if (user) {
        setLoading(true);
        try {
          const token = getAuthToken ? getAuthToken() : localStorage.getItem('token');
          if (!token) {
            setHasTransactions(false);
            return;
          }
          const response = await axios.get(`${API_URL}/user/dashboard`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          // Check if user has any transactions
          const transactions = response.data?.transactions || [];
          setHasTransactions(transactions.length > 0);
        } catch (error) {
          console.error('Error checking transactions:', error);
          setHasTransactions(false);
        } finally {
          setLoading(false);
        }
      } else {
        setHasTransactions(false);
      }
    };

    checkTransactions();
  }, [user, getAuthToken]);
  
  const handlePdfClick = (pdfName, e) => {
    // Prevent if clicking on download icon
    if (e && (e.target.closest('.download-icon') || e.target.closest('.MuiIconButton-root'))) {
      return;
    }
    if (user && hasTransactions) {
      // Open PDF in new tab (view only, not download)
      const encodedName = encodeURIComponent(pdfName);
      const pdfUrl = `/pdfs/${encodedName}`;
      window.open(pdfUrl, '_blank');
    }
  };

  const handlePdfDownload = (pdfName, e) => {
    e.stopPropagation(); // Prevent row click
    if (user && hasTransactions) {
      // Force download PDF
      const encodedName = encodeURIComponent(pdfName);
      const pdfUrl = `/pdfs/${encodedName}`;
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = pdfName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // PDFs are clickable only if user is logged in AND has transactions
  const isClickable = user && hasTransactions;

  return (
    <>
      <Header />
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(180deg, #FFFFFF 0%, #F6F8FA 100%)',
          pt: { xs: 10, md: 12 },
          pb: 8,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                mb: 2,
                mt:5,
                fontSize: { xs: '2rem', md: '3rem' },
                color: '#063C5E',
              }}
            >
              Resource Center
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: 'text.secondary',
                maxWidth: 800,
                mx: 'auto',
                fontWeight: 400,
              }}
            >
              When you purchase a license, you&apos;ll receive comprehensive implementation resources including lesson plans, guides, templates, and tools to seamlessly integrate Konfydence into your organization.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {resourceSections.map((section, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box sx={{ mb: 2 }}>
                      <Chip
                        label={section.subtitle}
                        size="small"
                        sx={{
                          bgcolor: 'primary.light',
                          color: 'white',
                          fontWeight: 600,
                          mb: 1.5,
                        }}
                      />
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 700,
                          mb: 1.5,
                          color: '#063C5E',
                          fontSize: { xs: '1.5rem', md: '1.75rem' },
                        }}
                      >
                        {section.title}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color: 'text.secondary',
                          mb: 3,
                          lineHeight: 1.7,
                        }}
                      >
                        {section.description}
                      </Typography>
                    </Box>

                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        bgcolor: 'grey.50',
                        borderRadius: 2,
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 600,
                          mb: 2,
                          color: 'text.primary',
                        }}
                      >
                        Included Resources ({section.pdfs.length}):
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {section.pdfs.map((pdfItem, pdfIndex) => {
                          const pdf = typeof pdfItem === 'string' ? pdfItem : pdfItem.display;
                          const pdfFile = typeof pdfItem === 'string' ? pdfItem : pdfItem.file;
                          return (
                            <Box
                              key={pdfIndex}
                              onClick={(e) => isClickable && handlePdfClick(pdfFile, e)}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                                p: 1.5,
                                borderRadius: 1,
                                bgcolor: 'white',
                                border: '1px solid',
                                borderColor: 'grey.200',
                                cursor: isClickable ? 'pointer' : 'default',
                                opacity: isClickable ? 1 : 0.85,
                                transition: 'all 0.2s',
                                '&:hover': isClickable ? {
                                  bgcolor: 'grey.50',
                                  borderColor: 'primary.main',
                                  transform: 'translateX(4px)',
                                } : {},
                              }}
                            >
                              <PictureAsPdfIcon
                                sx={{
                                  color: '#d32f2f',
                                  fontSize: 24,
                                  flexShrink: 0,
                                }}
                              />
                              <Typography
                                variant="body2"
                                sx={{
                                  color: isClickable ? 'text.primary' : 'text.secondary',
                                  fontWeight: isClickable ? 600 : 500,
                                  flex: 1,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {pdf}
                              </Typography>
                              {user && !hasTransactions && !loading && (
                                <Tooltip title="Purchase a license to download this resource">
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: 'text.secondary',
                                      fontSize: 11,
                                      fontStyle: 'italic',
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
                                    (Locked)
                                  </Typography>
                                </Tooltip>
                              )}
                              {isClickable && (
                                <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                                  <Tooltip title="Click to open PDF">
                                    <OpenInNewIcon
                                      sx={{
                                        color: 'primary.main',
                                        fontSize: 18,
                                        flexShrink: 0,
                                      }}
                                    />
                                  </Tooltip>
                                  <Tooltip title="Download PDF">
                                    <IconButton
                                      className="download-icon"
                                      onClick={(e) => handlePdfDownload(pdfFile, e)}
                                      size="small"
                                      sx={{
                                        p: 0.5,
                                        '&:hover': {
                                          bgcolor: 'primary.light',
                                        },
                                      }}
                                    >
                                      <DownloadIcon
                                        sx={{
                                          color: 'primary.main',
                                          fontSize: 18,
                                        }}
                                      />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              )}
                            </Box>
                          );
                        })}
                      </Box>
                    </Paper>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box
            sx={{
              mt: 6,
              textAlign: 'center',
              p: 4,
              borderRadius: 3,
              bgcolor: 'primary.light',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                mb: 1,
                color: 'white',
              }}
            >
              Ready to get started?
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'white',
              }}
            >
              Purchase a license to unlock access to all resources and start implementing Konfydence in your organization today.
            </Typography>
          </Box>
        </Container>
      </Box>
      <Footer />
    </>
  );
}

