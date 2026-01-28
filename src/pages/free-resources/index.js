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
  TextField,
  Snackbar,
  Alert,
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
    key: 'free-family',
    bundleName: 'Free Family Confidence Pack',
    resources: [
      'Konfydence-Family-Tech-Contract.pdf',
      'Family_SSK_Rules.pdf',
      'Konfydence Permission To Pause.docx',
      '"Pause Before You Click" fridge magnet graphic (printable PDF)',
      '"Intelligence isn\'t your defense" pause bars graphic',
      'Decision Ladder ("breathe pause think respond")',
    ],
    // explicit files to download for this bundle (only these will be downloaded)
    downloadFiles: ['Konfydence-Family-Tech-Contract.pdf', 'Family_SSK_Rules.pdf'],
    // availability: 'Free',
    availabilityType: 'free',
  },
  {
    key: 'free-classroom',
    bundleName: 'Free Classroom Starter Pack (Teacher Hook)',
    resources: [
      'School_Lesson_Plan.pdf',
      'School_Parent HACK Guide.pdf',
      'School Classroom_Pause_Posters.pdf',
      'The Classroom Digital Safety Agreement.docx',
      'School_Curriculum Alignment Map.pdf',
      'H.A.C.K. Framework poster (vintage & 4-panel versions)',
    ],
    // explicit files to download for this bundle
    downloadFiles: [
      'School_Lesson_Plan.pdf',
      'School_Parent HACK Guide.pdf',
      'School Classroom_Pause_Posters.pdf',
      'School_Curriculum Alignment Map.pdf',
    ],
    // availability: 'Free ',
    availabilityType: 'free-email',
  },
  {
    key: 'advanced-educator',
    bundleName: 'Advanced Educator Toolkit',
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
    key: 'compliance-audit',
    bundleName: 'Compliance & Audit Pack',
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
    key: 'post-demo',
    bundleName: 'Post-Demo',
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
    key: 'ambassador',
    bundleName: 'Ambassador Resource Pack',
    resources: [
      'Konfydence Ambassador.pdf',
      'Konfydence Ambassador Agreement.pdf (post-approval)',
      'Shareable graphics pack (pause bars, H.A.C.K. posters, myth-buster)',
    ],
    // files live under public/pdfs/Ambassador/
    downloadFiles: ['Ambassador/KonfydenceAmbassador.pdf', 'Ambassador/KonfydenceAmbassadorAgreement.pdf'],
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
  const [pdfIndex, setPdfIndex] = useState(null);
  const [emails, setEmails] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [messages, setMessages] = useState({}); // per-bundle inline messages
  const [showEmailField, setShowEmailField] = useState({});
  const [sending, setSending] = useState({});

  const handleBack = () => {
    router.back();
  };
 
  const sanitizeFileName = (name) => {
    // Replace spaces and problematic chars with underscores for URL paths
    return name.replace(/["']/g, '').replace(/\s+/g, '_');
  };

  // Download all available files for a bundle (used by the single-section download button)
  const downloadBundleResources = async (bundle) => {
    if (!bundle || !bundle.resources || bundle.resources.length === 0) return;
    const filesToTry = Array.isArray(bundle.downloadFiles) && bundle.downloadFiles.length
      ? bundle.downloadFiles
      : bundle.resources;

    for (const resource of filesToTry) {
      // only attempt items that look like files (have an extension)
      if (!/\.[a-zA-Z0-9]{1,5}$/.test(resource)) continue;
      const url = await findExistingResourceUrl(resource);
      if (!url) {
        console.warn('No file found for', resource);
        continue;
      }
      const urlFilename = url.split('/').pop();
      // Produce a readable download name for the user:
      // - prefer the displayed resource name if it includes an extension
      // - otherwise append the real file extension from the URL
      const displayHasExt = /\.[a-zA-Z0-9]{1,5}$/.test(resource.trim());
      const getSafeName = (name) =>
        // remove quotes and slashes, trim whitespace; keep spaces for readability
        name.replace(/["'\/\\]/g, '').trim();
      const downloadName = (() => {
        if (displayHasExt) return getSafeName(resource);
        const ext = urlFilename.includes('.') ? urlFilename.split('.').pop() : '';
        return ext ? `${getSafeName(resource)}.${ext}` : getSafeName(resource);
      })();
      const link = document.createElement('a');
      link.href = url;
      link.download = downloadName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      // small delay to reduce browser popup blocking risk
      await new Promise((res) => setTimeout(res, 300));
    }
  };

  const normalizeNameVariants = (name) => {
    // produce variants to match filesystem naming: original, underscores, dashes, remove numbering prefix
    const cleaned = name.replace(/["']/g, '').trim();
    const withoutNumberPrefix = cleaned.replace(/^\d+\.\s*/, '');
    const variants = [
      cleaned,
      withoutNumberPrefix,
      cleaned.replace(/\s+/g, '_'),
      withoutNumberPrefix.replace(/\s+/g, '_'),
      cleaned.replace(/\s+/g, '-'),
      withoutNumberPrefix.replace(/\s+/g, '-'),
    ];
    // ensure .pdf or .docx suffix presence (some list items may be descriptions)
    const extMatch = cleaned.match(/\.[a-zA-Z0-9]{1,5}$/);
    if (!extMatch) {
      // prefer pdf and docx if no extension present
      return variants.flatMap((v) => [v + '.pdf', v + '.docx']);
    }
    return variants;
  };

  const findExistingResourceUrl = async (resourceName) => {
    const candidates = normalizeNameVariants(resourceName).map((c) => c.toLowerCase());
    let index = pdfIndex;
    if (!index) {
      try {
      const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const resp = await fetch(`${backend}/api/pdf-index`);
        if (resp.ok) {
          const contentType = resp.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const json = await resp.json();
            index = json.files || [];
            setPdfIndex(index);
          } else {
            // unexpected response
            index = [];
            setPdfIndex(index);
          }
        } else {
          index = [];
          setPdfIndex(index);
        }
      } catch (err) {
        index = [];
        setPdfIndex(index);
      }
    }

    // match candidates against index entries (case-insensitive)
    for (const cand of candidates) {
      const found = index.find((f) => {
        const lf = f.toLowerCase();
        if (lf === cand) return true;
        if (lf.endsWith('/' + cand)) return true;
        return false;
      });
      if (found) {
        return `/pdfs/${encodeURI(found)}`;
      }
    }
    // Fallback: fuzzy match by stripping non-alphanumeric characters (handles prefixes like "1. " or spacing differences)
    const normalizeForCompare = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
    for (const cand of candidates) {
      const candNorm = normalizeForCompare(cand);
      const found = index.find((f) => normalizeForCompare(f).includes(candNorm) || candNorm.includes(normalizeForCompare(f)));
      if (found) {
        return `/pdfs/${encodeURI(found)}`;
      }
    }
    return null;
  };

  const sendResourcesByEmail = async (bundleKey, email) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setSnackbar({ open: true, message: 'Enter a valid email address', severity: 'error' });
      return;
    }
    setSending((s) => ({ ...s, [bundleKey]: true }));
    try {
      const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const resp = await fetch(`${backend}/api/email-resources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bundleKey, email }),
      });
      const contentType = resp.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const json = await resp.json();
        if (resp.ok && json.success) {
          // inline message near the bundle send button
          setMessages((m) => ({ ...m, [bundleKey]: { message: 'Resources sent to email', severity: 'success' } }));
          setEmails((s) => ({ ...s, [bundleKey]: '' }));
          // hide the email field after success
          setShowEmailField((s) => ({ ...s, [bundleKey]: false }));
        } else {
          setMessages((m) => ({ ...m, [bundleKey]: { message: json.message || 'Failed to send email', severity: 'error' } }));
        }
      } else {
        const text = await resp.text();
        setMessages((m) => ({ ...m, [bundleKey]: { message: `Email API error: ${resp.status} ${resp.statusText}`, severity: 'error' } }));
        console.error('Non-JSON response from email API:', text);
      }
    } catch (err) {
      console.error('Send email error:', err);
      setSnackbar({ open: true, message: 'Error sending email', severity: 'error' });
    } finally {
      setSending((s) => ({ ...s, [bundleKey]: false }));
    }
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
                  <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '1rem', width: { xs: '200px', md: '360px' } }}>
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
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                              <ListItemText
                                primary={resource}
                                primaryTypographyProps={{
                                  variant: 'body2',
                                  color: 'text.secondary',
                                }}
                              />
                              {/* single-section download button handles downloads; no per-file button shown */}
                            </Box>
                          </ListItem>
                        ))}
                      </List>
                    </TableCell>
                    <TableCell sx={{ verticalAlign: 'top', py: 3 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {!(bundle.key === 'free-family' || bundle.key === 'free-classroom' || bundle.key === 'advanced-educator' || bundle.key === 'compliance-audit' || bundle.key === 'ambassador') ? (
                            <Chip
                              label={bundle.availability}
                              color={getAvailabilityColor(bundle.availabilityType)}
                              size="small"
                              icon={
                                // Show email/lock/download icons for gated/other types
                                bundle.availabilityType.includes('email') || bundle.availabilityType === 'gated-company' ? (
                                  <EmailIcon fontSize="small" />
                                ) : bundle.availabilityType === 'exclusive' ? (
                                  <LockIcon fontSize="small" />
                                ) : bundle.availabilityType === 'ambassador' ? (
                                  <DownloadIcon fontSize="small" />
                                ) : null
                              }
                              sx={{ fontWeight: 500, mb: bundle.bundleName === 'Gated Advanced Educator Toolkit' ? 1 : 0 }}
                            />
                          ) : null}
                          
                          {/* Extra explicit download button for clarity */}
                          {(bundle.key === 'free-family' || bundle.key === 'free-classroom' || bundle.key === 'ambassador') && (
                            <IconButton
                              size="small"
                              onClick={() => downloadBundleResources(bundle)}
                              sx={{
                                color: '#0B7897',
                                padding: '6px',
                                '&:hover': { backgroundColor: 'rgba(11, 120, 151, 0.08)' },
                              }}
                              title={`Download ${bundle.bundleName}`}
                            >
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                          )}
                          {/* Email input + send button (full width, new line) for sections 3 and 4 */}
                          {(bundle.key === 'advanced-educator' || bundle.key === 'compliance-audit') && (
                            <Box sx={{ width: '100%', mt: 1 }}>
                              {messages[bundle.key] && messages[bundle.key].severity === 'success' ? (
                                <Alert severity="success" sx={{ mt: 1 }}>
                                  {messages[bundle.key].message}
                                </Alert>
                              ) : (
                                <>
                                  {!showEmailField[bundle.key] ? (
                                    <Chip
                                      label="Email share"
                                      color="default"
                                      clickable
                                      onClick={() => setShowEmailField((s) => ({ ...s, [bundle.key]: true }))}
                                      icon={<EmailIcon />}
                                      sx={{ borderRadius: 2 }}
                                    />
                                  ) : (
                                    <>
                                      <TextField
                                        fullWidth
                                        size="small"
                                        placeholder="Email share"
                                        value={emails[bundle.key] || ''}
                                        onChange={(e) => setEmails((s) => ({ ...s, [bundle.key]: e.target.value }))}
                                        disabled={!!sending[bundle.key]}
                                      />
                                      <Button
                                        fullWidth
                                        variant="contained"
                                        size="small"
                                        onClick={() => {
                                          // clear any previous inline message for this bundle before sending
                                          setMessages((m) => ({ ...m, [bundle.key]: null }));
                                          sendResourcesByEmail(bundle.key, emails[bundle.key]);
                                        }}
                                        sx={{ mt: 1, textTransform: 'none' }}
                                        disabled={!!sending[bundle.key]}
                                      >
                                        {sending[bundle.key] ? 'Sending…' : 'Send'}
                                      </Button>
                                    </>
                                  )}

                                  {/* Inline message near the field for errors */}
                                  {messages[bundle.key] && messages[bundle.key].severity !== 'success' && (
                                    <Alert severity={messages[bundle.key].severity} sx={{ mt: 1 }}>
                                      {messages[bundle.key].message}
                                    </Alert>
                                  )}
                                </>
                              )}
                            </Box>
                          )}
                        </Box>
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

      <Box>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={5000}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        >
          <Alert
            onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
      <Footer />
    </>
  );
}

