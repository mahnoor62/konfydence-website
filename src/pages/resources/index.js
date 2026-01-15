'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DownloadIcon from '@mui/icons-material/Download';
import CloseIcon from '@mui/icons-material/Close';
import LockIcon from '@mui/icons-material/Lock';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const API_URL = `${API_BASE_URL}/api`;

const resourceSections = [
  {
    id: 'schools',
    title: 'Schools',
    subtitle: 'Educator Vault (The 8-Doc School System)',
    description: 'Plug & Play Digital Resilience. Give your students the 15-minute "Pause Habit" with our ready-to-use classroom curriculum and tracking tools.',
    pdfs: [
      { 
        display: 'Konfydence_For_Schools.pdf', 
        file: 'Konfydence_For_Schools.pdf',
        description: 'Overview guide for schools implementing Konfydence',
        alwaysClickable: true,
      },
      { 
        display: 'School_Lesson_Plan.pdf', 
        file: '1. School_Lesson_Plan.pdf',
        description: 'A comprehensive 5-module classroom curriculum designed to integrate the "Pause Habit" into existing digital citizenship periods.',
      },
      { 
        display: 'School_Behavioral Practice Log.pdf', 
        file: '2. School_Behavioral Practice Log.pdf',
        description: 'A student-facing tracking tool used to document and score defensive reactions to simulated scam scenarios.',
      },
      { 
        display: 'School_Curriculum Alignment Map.pdf', 
        file: '3. School_Curriculum Alignment Map.pdf',
        description: 'Technical documentation for administrators mapping Konfydence modules to national safety and educational resilience standards.',
      },
      { 
        display: 'School_Parent HACK Guide.pdf', 
        file: '4. School_Parent HACK Guide.pdf',
        description: 'A specialized resource for parents to mirror the school\'s "Pause" training in a domestic setting.',
      },
      { 
        display: 'SchoolBehavioralPractice.pdf', 
        file: '5. SchoolBehavioralPractice.pdf',
        description: 'Core instructional materials for teachers to lead hands-on behavioral drills and group discussions.',
      },
      { 
        display: 'SchoolClassroom_Pause_Posters.pdf', 
        file: '6. SchoolClassroom_Pause_Posters.pdf',
        description: 'High-visibility classroom anchors that provide students with a constant visual reminder of the H.A.C.K. framework.',
      },
      { 
        display: 'School Implementation Roadmap.pdf', 
        file: '7. School Implementation Roadmap.pdf',
        description: 'A strategic 3-step project management guide for school leadership to oversee a successful district-wide rollout.',
      },
      { 
        display: 'School-to-Parent Letter.docx', 
        file: '8. School-to-Parent Letter.docx',
        description: 'Professional communication templates designed to build trust and transparency between the school and the student\'s family.',
      },
    ],
  },
  {
    id: 'universities',
    title: 'Universities',
    subtitle: 'University Defense (Higher-Ed)',
    description: 'Protect Your Academic Future. Scammers hack stress and ambition, not just laptops. Access specialized modules to defend against the top 4 university-specific threats.',
    pdfs: [
      { 
        display: 'Konfydence_For_Universities.pdf', 
        file: 'Konfydence_For_Universities.pdf',
        description: 'Overview guide for universities implementing Konfydence',
        alwaysClickable: true,
      },
      { 
        display: 'University_DEFEND YOUR DEGREE.pdf', 
        file: 'University_DEFEND YOUR DEGREE.pdf',
        description: 'A high-stakes guide designed for students to identify and neutralize sophisticated academic, tuition, and financial scams.',
      },
      { 
        display: 'Student_Organization_Safety_Toolkit.pdf', 
        file: 'Student_Organization_Safety_Toolkit.pdf',
        description: 'Free toolkit for student organizations to build digital safety awareness and protect members from scams and social engineering attacks.',
        alwaysClickable: true,
      },
    ],
  },
  {
    id: 'corporate',
    title: 'Corporate',
    subtitle: 'Corporate Patron Hub',
    description: 'Compliance & Strategic Alignment. Access NIS2 and ISO alignment documentation along with pilot program agreements for enterprise deployment.',
    pdfs: [
      { 
        display: 'NIS2_ISO_Alignment.pdf', 
        file: 'corporate/NIS2_ISO_Alignment.pdf',
        description: 'Comprehensive alignment documentation between NIS2 requirements and ISO standards for digital safety implementation.',
      },
      { 
        display: 'PilotProofofConceptAgreement.pdf', 
        file: 'corporate/PilotProofofConceptAgreement.pdf',
        description: 'Professional agreement template for pilot programs and proof-of-concept deployments with enterprise partners.',
      },
    ],
  },
  {
    id: 'families',
    title: 'Families',
    subtitle: 'Family Home Base',
    description: 'Safety Starts at the Table. Turn the 15-minute training into a lifelong family habit. Download your tech contract and SSK rules to protect your family.',
    pdfs: [
      { 
        display: 'Family_SSK_Rules.pdf', 
        file: 'families/Family_SSK_Rules.pdf',
        description: 'Family-friendly Scam Survival Kit rules and guidelines to implement digital safety practices at home.',
      },
      { 
        display: 'Konfydence-Family-Tech-Contract.pdf', 
        file: 'families/Konfydence-Family-Tech-Contract.pdf',
        description: 'A no-blame agreement to start open conversations about online safety. Builds trust, sets boundaries, and reinforces the pause habit.',
      },
    ],
  },
  {
    id: 'media',
    title: 'Media',
    subtitle: 'Media & Proof',
    description: 'Science-Backed Safety. Explore the behavioral science behind the H.A.C.K. framework and understand scam terminology and psychological manipulation.',
    pdfs: [
      { 
        display: 'Social Engineering & Scam Terminology.pdf', 
        file: 'media/Social Engineering & Scam Terminology.pdf',
        description: 'Comprehensive glossary and explanation of social engineering tactics and scam terminology used by attackers.',
      },
      { 
        display: 'The "Limbic Hijack" Explainer.pdf', 
        file: 'media/the-limbic-hijack.pdf',
        description: 'An in-depth explanation of the limbic hijack phenomenon and how Konfydence addresses it through behavioral training.',
      },
    ],
  },
  {
    id: 'implementation',
    title: 'Implementation',
    subtitle: 'Deployment Resources',
    description: 'Evidence-Based Deployment. Access behavioral evidence templates and measurement tools to track the impact and effectiveness of Konfydence programs.',
    pdfs: [
      { 
        display: 'BehavioralEvidenceTemplate.pdf', 
        file: 'implementation/BehavioralEvidenceTemplate.pdf',
        description: 'Template for documenting behavioral evidence and measuring the effectiveness of digital safety training programs.',
      },
    ],
  },
  {
    id: 'trainer',
    title: 'Trainer',
    subtitle: 'Trainer Resources',
    description: 'Trainer Operations & Support. Access comprehensive operational addendums and resources for CoMaSi trainers to deliver effective training sessions.',
    pdfs: [
      { 
        display: 'CoMaSi Trainer Operations Addendum.pdf', 
        file: 'Trainer/CoMaSi Trainer Operations Addendum.pdf',
        description: 'Comprehensive operational addendum for CoMaSi trainers covering protocols, procedures, and best practices for training delivery.',
      },
    ],
  },
  {
    id: 'ambassador',
    title: 'Ambassador',
    subtitle: 'Ambassador Program',
    description: 'Join the Movement. Become a Konfydence Ambassador and help spread digital safety awareness in your community with our ambassador program resources.',
    pdfs: [
      { 
        display: 'KonfydenceAmbassador.pdf', 
        file: 'Ambassador/KonfydenceAmbassador.pdf',
        description: 'Complete guide for Konfydence Ambassadors covering program benefits, responsibilities, and how to spread digital safety awareness.',
      },
      { 
        display: 'KonfydenceAmbassadorAgreement.pdf', 
        file: 'Ambassador/KonfydenceAmbassadorAgreement.pdf',
        description: 'Official agreement document for Konfydence Ambassador program participants outlining terms, expectations, and commitments.',
      },
    ],
  },
];

export default function Resources() {
  const { user, getAuthToken } = useAuth();
  const [hasTransactions, setHasTransactions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

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

  useEffect(() => {
    setMounted(true);
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
  
  const handleBoxClick = (section) => {
    setSelectedSection(section);
    setDetailDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDetailDialogOpen(false);
    setSelectedSection(null);
  };

  const handlePdfClick = (pdfItem, e) => {
    if (e) {
      e.stopPropagation();
    }
    const isAlwaysClickable = pdfItem.alwaysClickable;
    const canClick = isAlwaysClickable || (user && hasTransactions);
    
    if (canClick) {
      const encodedName = encodeURIComponent(pdfItem.file);
      const pdfUrl = `/pdfs/${encodedName}`;
      
      // Check if file is DOCX - open directly in new tab
      // The browser will handle it based on server MIME type
      // If server sends proper headers, it will open in browser or download
      if (pdfItem.file.toLowerCase().endsWith('.docx')) {
        // Open directly - browser will handle based on Content-Disposition header
        // If server wants to display, it should send Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document
        // If server wants to download, it should send Content-Disposition: attachment
        // For now, we'll open it directly and let the server decide
        window.open(pdfUrl, '_blank');
      } else {
        // For PDFs, open directly
        window.open(pdfUrl, '_blank');
      }
    }
  };

  const handlePdfDownload = (pdfItem, e) => {
    e.stopPropagation();
    const isAlwaysClickable = pdfItem.alwaysClickable;
    const canDownload = isAlwaysClickable || (user && hasTransactions);
    
    if (canDownload) {
      const encodedName = encodeURIComponent(pdfItem.file);
      const pdfUrl = `/pdfs/${encodedName}`;
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = pdfItem.file;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const isPdfClickable = (pdfItem) => {
    return pdfItem.alwaysClickable || (user && hasTransactions);
  };

  return (
    <>
      <Head>
        <title>Konfydence Resource Hub</title>
      </Head>
      <Header />
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(180deg, #FFFFFF 0%, #F6F8FA 100%)',
          pt: { xs: 10, md: 15 },
          pb: 8,
        }}
      >
        <Container maxWidth="lg"     data-aos="zoom-in"
                  data-aos-duration="800">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                mb: 2,
                mt: 5,
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
              <Grid item xs={12} sm={6} md={4} key={section.id}>
                <Card
                  onClick={() => handleBoxClick(section)}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    cursor: 'pointer',
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
                        {section.pdfs.slice(0, 3).map((pdfItem, pdfIndex) => (
                          <Box
                            key={pdfIndex}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1.5,
                              p: 1,
                              borderRadius: 1,
                              bgcolor: 'white',
                              border: '1px solid',
                              borderColor: 'grey.200',
                            }}
                          >
                            <PictureAsPdfIcon
                              sx={{
                                color: '#d32f2f',
                                fontSize: 20,
                                flexShrink: 0,
                              }}
                            />
                            <Typography
                              variant="body2"
                              sx={{
                                color: 'text.secondary',
                                fontWeight: 500,
                                flex: 1,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                fontSize: '0.85rem',
                              }}
                            >
                              {pdfItem.display}
                            </Typography>
                          </Box>
                        ))}
                        {section.pdfs.length > 3 && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'text.secondary',
                              fontStyle: 'italic',
                              textAlign: 'center',
                              mt: 0.5,
                            }}
                          >
                            +{section.pdfs.length - 3} more resources
                          </Typography>
                        )}
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
              Unlock Resources and Protect Your Team
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'white',
              }}
            >
              Get your license today access lesson plans , guides, simulations, and more. Start building the Pause Habit in minutes.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pb: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box>
            <Chip
              label={selectedSection?.subtitle}
              size="small"
              sx={{
                bgcolor: 'primary.light',
                color: 'white',
                fontWeight: 600,
                mb: 1,
              }}
            />
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#063C5E', mt: 1 }}>
              {selectedSection?.title}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
              {selectedSection?.description}
            </Typography>
          </Box>
          <IconButton
            onClick={handleCloseDialog}
            sx={{
              color: 'text.secondary',
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: '#063C5E' }}>Document</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#063C5E' }}>Description</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: '#063C5E' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedSection?.pdfs.map((pdfItem, index) => {
                  const canAccess = isPdfClickable(pdfItem);
                  return (
                    <TableRow
                      key={index}
                      sx={{
                        '&:hover': {
                          bgcolor: canAccess ? 'action.hover' : 'grey.50',
                        },
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
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
                              fontWeight: canAccess ? 600 : 500,
                              color: canAccess ? 'text.primary' : 'text.secondary',
                            }}
                          >
                            {pdfItem.display}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'text.secondary',
                            fontSize: '0.9rem',
                          }}
                        >
                          {pdfItem.description}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        {canAccess ? (
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                            <Tooltip title="Open PDF">
                              <IconButton
                                onClick={(e) => handlePdfClick(pdfItem, e)}
                                size="small"
                                sx={{
                                  color: 'primary.main',
                                  '&:hover': {
                                    bgcolor: 'primary.light',
                                    color: 'white',
                                  },
                                }}
                              >
                                <OpenInNewIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Download PDF">
                              <IconButton
                                onClick={(e) => handlePdfDownload(pdfItem, e)}
                                size="small"
                                sx={{
                                  color: 'primary.main',
                                  '&:hover': {
                                    bgcolor: 'primary.light',
                                    color: 'white',
                                  },
                                }}
                              >
                                <DownloadIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        ) : (
                          <Tooltip title="Purchase a license to access this resource">
                            <LockIcon
                              sx={{
                                color: 'text.disabled',
                                fontSize: 20,
                              }}
                            />
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button onClick={handleCloseDialog} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </>
  );
}
