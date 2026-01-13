'use client';

import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  Container,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemText,
  Button,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import DownloadIcon from '@mui/icons-material/Download';
import EmailIcon from '@mui/icons-material/Email';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import IconButton from '@mui/material/IconButton';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const resourceBundles = [
  {
    bundleName: 'Free Family Confidence Pack (Viral Entry)',
    resources: [
      'Konfydence-Family-Tech-Contract.pdf',
      'Family_SSK_Rules.pdf',
      'Konfydence Permission To Pause.docx',
      '"Pause Before You Click" fridge magnet graphic (printable PDF)',
      '"Intelligence isn\'t your defense" pause bars graphic',
      'Decision Ladder ("breathe pause think respond")',
    ],
    // availability: 'Free',
    availabilityType: 'free',
  },
  {
    bundleName: 'Free Classroom Starter Pack (Teacher Hook)',
    resources: [
      'School_Lesson_Plan.pdf',
      'School_Parent HACK Guide.pdf',
      'School Classroom_Pause_Posters.pdf',
      'The Classroom Digital Safety Agreement.docx',
      'School_Curriculum Alignment Map.pdf',
      'H.A.C.K. Framework poster (vintage & 4-panel versions)',
    ],
    // availability: 'Free ',
    availabilityType: 'free-email',
  },
  {
    bundleName: 'Gated Advanced Educator Toolkit',
    resources: [
      'School_Lesson_Plan.pdf',
      'Teacher_Classroom_Drill.docx',
      'School Implementation Road map.pdf',
      'Student_Organization_Safety_Toolkit.docx',
      'Konfydence_For_Schools.pdf',
      'Konfydence_For_Universities.pdf',
      '"5 Second Defense" graphics (uni & school versions)',
      'Hot/Cool Brain cartoon',
    ],
    availability: 'Email Share',
    availabilityType: 'gated-email',
  },
  {
    bundleName: 'Gated Compliance & Audit Pack',
    resources: [
      'NIS2 ISO Alignment.pdf',
      'Behavioral Evidence Template.pdf',
      'CoMaSi.docx',
      'Pilot Proof of Concept Agreement.pdf',
      '"Your 5 Second Defense" flowchart',
      'H.A.C.K. detailed examples graphic',
    ],
    availability: 'Email Share',
    availabilityType: 'gated-company',
  },
  {
    bundleName: 'Post-Demo/Pilot Pro Pack (Exclusive)',
    resources: [
      'School Behavioral Practice Log.pdf',
      'School Behavioral Practice.pdf',
      'Konfydence Students Teachers Cards.docx (full scenarios)',
      'Konfydence University Adoption Brief.docx',
      'All premium graphics (Hot Brain, Limbic Hijack, full H.A.C.K. set)',
    ],
    availability: 'Only after demo/pilot',
    availabilityType: 'exclusive',
  },
  {
    bundleName: 'Ambassador Resource Pack',
    resources: [
      'Konfydence Ambassador.pdf',
      'Konfydence Ambassador Agreement.pdf (post-approval)',
      'Shareable graphics pack (pause bars, H.A.C.K. posters, myth-buster)',
    ],
    availability: 'Free overview',
    availabilityType: 'ambassador',
  },
];

const getAvailabilityColor = (type) => {
  switch (type) {
    case 'free':
      return 'success';
    case 'free-email':
      return 'info';
    case 'gated-email':
      return 'warning';
    case 'gated-company':
      return 'warning';
    case 'exclusive':
      return 'error';
    case 'ambassador':
      return 'primary';
    default:
      return 'default';
  }
};

export default function FreeResources() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <>
      <Head>
        <title>Konfydence Free Resources</title>
        <meta name="description" content="Access free educational resources, toolkits, and materials for families, schools, and educators from Konfydence." />
      </Head>
      <Header />
      
      <Box sx={{ pt: { xs: 8, md: 10 }, pb: { xs: 6, md: 8 }, backgroundColor: '#ffffff' }}>
        <Container maxWidth="lg">
          <Box sx={{ mb: 6, textAlign: 'center' }}>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2rem', md: '3rem' },
                fontWeight: 700,
                mb: 2,
                mt:5,
                color: '#063C5E',
              }}
            >
              Free Resources
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontSize: { xs: '1rem', md: '1.125rem' },
                color: 'text.secondary',
                maxWidth: '800px',
                mx: 'auto',
              }}
            >
              Download free educational resources, toolkits, and materials for families, schools, and educators
            </Typography>
          </Box>

          <TableContainer component={Paper} elevation={2}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#063C5E' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '1rem' }}>
                    Bundle Name
                  </TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '1rem' }}>
                    Included Resources + Visuals
                  </TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '1rem', width: '200px' }}>
                    Availability
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {resourceBundles.map((bundle, index) => (
                  <TableRow 
                    key={index}
                    sx={{ 
                      '&:nth-of-type(odd)': { backgroundColor: '#f9f9f9' },
                      '&:hover': { backgroundColor: '#f5f5f5' },
                    }}
                  >
                    <TableCell sx={{ verticalAlign: 'top', py: 3 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: '#063C5E' }}>
                        {bundle.bundleName}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ verticalAlign: 'top', py: 3 }}>
                      <List dense sx={{ py: 0 }}>
                        {bundle.resources.map((resource, idx) => (
                          <ListItem key={idx} sx={{ py: 0.5, pl: 0 }}>
                            <ListItemText 
                              primary={resource}
                              primaryTypographyProps={{
                                variant: 'body2',
                                color: 'text.secondary',
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </TableCell>
                    <TableCell sx={{ verticalAlign: 'top', py: 3 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <Chip
                          label={bundle.availability}
                          color={getAvailabilityColor(bundle.availabilityType)}
                          size="small"
                          icon={
                            bundle.availabilityType === 'free' ? (
                              <LockIcon fontSize="small" />
                            ) : bundle.availabilityType === 'free-email' ? (
                              <LockIcon fontSize="small" />
                            ) : bundle.availabilityType.includes('email') || bundle.availabilityType === 'gated-company' ? (
                              <EmailIcon fontSize="small" />
                            ) : bundle.availabilityType === 'exclusive' ? (
                              <LockIcon fontSize="small" />
                            ) : bundle.availabilityType === 'ambassador' ? (
                              <DownloadIcon fontSize="small" />
                            ) : null
                          }
                          sx={{ fontWeight: 500, mb: bundle.bundleName === 'Gated Advanced Educator Toolkit' ? 1 : 0 }}
                        />
                        {bundle.bundleName === 'Gated Advanced Educator Toolkit' && (
                          <List dense sx={{ py: 0, width: '100%' }}>
                            {/* Empty items for first 4 resources */}
                            {[0, 1, 2, 3].map((idx) => (
                              <ListItem 
                                key={`empty-${idx}`} 
                                sx={{ 
                                  py: 1.5, 
                                  pl: 0,
                                  pr: 0,
                                  justifyContent: 'flex-end',
                                  minHeight: 'auto',
                                }}
                              >
                                <Box sx={{ width: '100%' }} />
                              </ListItem>
                            ))}
                            {/* Icons for Konfydence_For_Schools.pdf (index 4) */}
                            <ListItem 
                              sx={{ 
                                py: 0.5, 
                                pl: 0,
                                pr: 0,
                                justifyContent: 'flex-end',
                                minHeight: 'auto',
                              }}
                            >
                              <Box sx={{ display: 'flex', gap: 0.5 }}>
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    const link = document.createElement('a');
                                    link.href = '/pdfs/Konfydence_For_Schools.pdf';
                                    link.download = 'Konfydence_For_Schools.pdf';
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                  }}
                                  sx={{
                                    color: '#FF9800',
                                    padding: '4px',
                                    '&:hover': {
                                      backgroundColor: 'rgba(255, 152, 0, 0.1)',
                                    },
                                  }}
                                  title="Download Konfydence For Schools PDF"
                                >
                                  <DownloadIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    window.open('/pdfs/Konfydence_For_Schools.pdf', '_blank');
                                  }}
                                  sx={{
                                    color: '#FF9800',
                                    padding: '4px',
                                    '&:hover': {
                                      backgroundColor: 'rgba(255, 152, 0, 0.1)',
                                    },
                                  }}
                                  title="View Konfydence For Schools PDF"
                                >
                                  <OpenInNewIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </ListItem>
                            {/* Icons for Konfydence_For_Universities.pdf (index 5) */}
                            <ListItem 
                              sx={{ 
                                py: 0.5, 
                                pl: 0,
                                pr: 0,
                                justifyContent: 'flex-end',
                                minHeight: 'auto',
                              }}
                            >
                              <Box sx={{ display: 'flex', gap: 0.5 }}>
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    const link = document.createElement('a');
                                    link.href = '/pdfs/Konfydence_For_Universities.pdf';
                                    link.download = 'Konfydence_For_Universities.pdf';
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                  }}
                                  sx={{
                                    color: '#FF9800',
                                    padding: '4px',
                                    '&:hover': {
                                      backgroundColor: 'rgba(255, 152, 0, 0.1)',
                                    },
                                  }}
                                  title="Download Konfydence For Universities PDF"
                                >
                                  <DownloadIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    window.open('/pdfs/Konfydence_For_Universities.pdf', '_blank');
                                  }}
                                  sx={{
                                    color: '#FF9800',
                                    padding: '4px',
                                    '&:hover': {
                                      backgroundColor: 'rgba(255, 152, 0, 0.1)',
                                    },
                                  }}
                                  title="View Konfydence For Universities PDF"
                                >
                                  <OpenInNewIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </ListItem>
                            {/* Empty items for last 2 resources */}
                            {[6, 7].map((idx) => (
                              <ListItem 
                                key={`empty-${idx}`} 
                                sx={{ 
                                  py: 0.5, 
                                  pl: 0,
                                  pr: 0,
                                  justifyContent: 'flex-end',
                                  minHeight: 'auto',
                                }}
                              >
                                <Box sx={{ width: '100%' }} />
                              </ListItem>
                            ))}
                          </List>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              For questions or support, please contact us through our{' '}
              <Link href="/contact" style={{ color: '#0B7897', textDecoration: 'underline' }}>
                contact page
              </Link>
            </Typography>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={handleBack}
              sx={{
                borderColor: '#063C5E',
                color: '#063C5E',
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: 2,
                textTransform: 'none',
                '&:hover': {
                  borderColor: '#0B7897',
                  backgroundColor: '#063C5E',
                  color: '#FFFFFF',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Back
            </Button>
          </Box>
        </Container>
      </Box>

      <Footer />
    </>
  );
}

