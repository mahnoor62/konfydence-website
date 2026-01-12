import { useState, useEffect } from 'react';
import Head from 'next/head';
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  Grid,
  MenuItem,
  Alert,
  Checkbox,
  FormControlLabel,
  Link as MuiLink,
} from '@mui/material';
import { useRouter } from 'next/router';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_URL environment variable is missing!');
}
const API_URL = `${API_BASE_URL}/api`;
console.log('🔗 Contact Page API URL:', API_URL);

const EMAIL_REGEX = /^.+@.+\..+$/;

export default function ContactPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    organization: '',
    topic: 'other',
    message: '',
    honeypot: '', // Spam protection
    notRobot: false, // Spam protection
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (router.isReady) {
      const topic = router.query.topic;
      if (topic) {
        // Map old topic values to new ones
        const topicMap = {
          'b2b_demo': 'CoMaSi',
          'b2e_demo': 'education-youth-pack',
          'b2e': 'education-youth-pack',
        };
        const mappedTopic = topicMap[topic] || topic;
        setFormData((prev) => ({ ...prev, topic: mappedTopic }));
      }
    }
  }, [router.isReady, router.query]);

  const validateField = (name, value) => {
    switch (name) {
      case 'firstName':
        if (!value.trim()) {
          return 'First name is required';
        }
        return '';
      case 'lastName':
        if (!value.trim()) {
          return 'Last name is required';
        }
        return '';
      case 'email':
        if (!value.trim()) {
          return 'Email is required';
        }
        if (!EMAIL_REGEX.test(value)) {
          return 'Please enter a valid email address';
        }
        return '';
      case 'message':
        if (!value.trim()) {
          return 'Message is required';
        }
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    
    setFormData((prev) => ({ ...prev, [name]: fieldValue }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Spam protection: Check honeypot and robot checkbox
    if (formData.honeypot) {
      // Bot detected - silently fail
      return;
    }
    
    if (!formData.notRobot) {
      setSnackbar({
        open: true,
        message: 'Please confirm you are not a robot',
        severity: 'error',
      });
      return;
    }

    // Validate all required fields
    const newErrors = {};
    ['firstName', 'lastName', 'email', 'message'].forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      // Prepare payload based on topic
      let payload;
      payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        topic: formData.topic,
        message: formData.message,
      };
      if (formData.organization) {
        payload.organization = formData.organization;
        payload.company = formData.organization; // Keep for backward compatibility
      }

      const url = `${API_URL}/contact`;
      console.log(`📡 POST ${url}`, payload);
      console.log('📤 Sending topic value:', formData.topic);
      await axios.post(url, payload, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
        params: { _t: Date.now() },
      });

      setSubmitted(true);
    } catch (error) {
      console.error('❌ Error submitting contact form:', {
        url: `${API_URL}/contact`,
        error: error.response?.data || error.message,
        status: error.response?.status,
      });
      
      // Get the actual error message from API response
      let errorMessage = 'Error submitting form. Please try again.';
      
      if (error.response?.data) {
        // Check for validation errors array
        if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
          const validationErrors = error.response.data.errors
            .map(err => err.msg || err.message || err)
            .join(', ');
          errorMessage = validationErrors || errorMessage;
        }
        // Check for single error message
        else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        }
        // Check for message field
        else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Konfydence Contact</title>
      </Head>
      <Header />
      <Box
        component="main"
        sx={{
          backgroundColor: '#F2F6FB',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          pb: { xs: 8, md: 10 },
        }}
      >
        <Box
          sx={{
            background: 'linear-gradient(135deg, #0B7897 0%, #063C5E 100%)',
            color: 'white',
            py: { xs: 10, md: 12 },
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(circle at 20% -10%, rgba(255,255,255,0.25), transparent 55%)',
              opacity: 0.45,
            }}
          />
          <Container maxWidth="md">
            <Box
              sx={{
                textAlign: 'center',
                maxWidth: 700,
                mx: 'auto',
                px: { xs: 2, md: 10 },
              }}
            >
              <Typography
                variant="h2"
                sx={{
                  mt: 10,
                  fontWeight: 700,
                  mb: 2,
                  fontSize: { xs: '2.4rem', md: '3.2rem' },
                }}
              >
                Get in Touch
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: 'rgba(255,255,255,0.95)',
                  fontSize: { xs: '1.1rem', md: '1.25rem' },
                  fontWeight: 500,
                  mb: 2,
                }}
              >
                Have questions about HACKs, training, or partnerships?
              </Typography>
              {/* <Typography
                variant="body1"
                sx={{
                  color: 'rgba(255,255,255,0.92)',
                  fontSize: { xs: '1.05rem', md: '1.15rem' },
                  lineHeight: 1.6,
                }}
              >
                We usually respond within one business day.
              </Typography> */}
            </Box>
          </Container>
        </Box>

        <Container
          data-aos="zoom-in"
          data-aos-duration="800"
          data-aos-delay="100"
          maxWidth="sm"
          sx={{
            mt: { xs: -8, md: -6 },
            px: { xs: 3, md: 0 },
          }}
        >
          <Box
            sx={{
              p: { xs: 4, md: 5 },
              borderRadius: 4,
              backgroundColor: 'white',
              boxShadow: '0 25px 80px rgba(6,60,94,0.12)',
              position: 'relative',
              zIndex: 2,
            }}
          >
            {snackbar.open && (
              <Alert 
                severity={snackbar.severity}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                sx={{ mb: 3 }}
              >
                {snackbar.message}
              </Alert>
            )}
            {submitted ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 600,
                    mb: 2,
                    color: '#052A42',
                    fontSize: { xs: '1.5rem', md: '1.75rem' },
                  }}
                >
                  Thank you for requesting a demo.
                </Typography>
                {/* <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7 }}
                >
                  We&apos;ll get back to you within 24 hours.
                </Typography> */}
              </Box>
            ) : (
              <>

                <Box component="form" onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="First Name"
                        name="firstName"
                        required
                        value={formData.firstName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={!!errors.firstName}
                        helperText={errors.firstName}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Last Name"
                        name="lastName"
                        required
                        value={formData.lastName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={!!errors.lastName}
                        helperText={errors.lastName}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Organization / School / Company"
                        name="organization"
                        value={formData.organization}
                        onChange={handleChange}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={!!errors.email}
                        helperText={errors.email}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        select
                        label="Topic"
                        name="topic"
                        required
                        value={formData.topic}
                        onChange={handleChange}
                        SelectProps={{
                          MenuProps: {
                            PaperProps: {
                              sx: {
                                maxHeight: 224,
                                width: 'auto',
                                '& .MuiMenuItem-root': {
                                  fontFamily: '"Poppins", sans-serif !important',
                                },
                              },
                            },
                            anchorOrigin: {
                              vertical: 'bottom',
                              horizontal: 'left',
                            },
                            transformOrigin: {
                              vertical: 'top',
                              horizontal: 'left',
                            },
                            disableScrollLock: true,
                            disablePortal: false,
                            keepMounted: false,
                          },
                        }}
                        sx={{
                          '& .MuiSelect-select': {
                            fontFamily: '"Poppins", sans-serif',
                          },
                        }}
                      >
                        <MenuItem 
                          value="scam-survival-kit"
                          sx={{ fontFamily: '"Poppins", sans-serif !important' }}
                        >
                          Scam Survival Kit (Families)
                        </MenuItem>
                        <MenuItem 
                          value="education-youth-pack"
                          sx={{ fontFamily: '"Poppins", sans-serif !important' }}
                        >
                          Education / Youth Pack
                        </MenuItem>
                        <MenuItem 
                          value="CoMaSi"
                          sx={{ fontFamily: '"Poppins", sans-serif !important' }}
                        >
                          CoMaSi (Companies & Compliance)
                        </MenuItem>
                        {/* <MenuItem 
                          value="nis2-audit"
                          sx={{ fontFamily: '"Poppins", sans-serif !important' }}
                        >
                          NIS2 / Audit Readiness
                        </MenuItem> */}
                        <MenuItem 
                          value="partnerships"
                          sx={{ fontFamily: '"Poppins", sans-serif !important' }}
                        >
                          Partnerships / Ambassadors
                        </MenuItem>
                        <MenuItem 
                          value="media-press"
                          sx={{ fontFamily: '"Poppins", sans-serif !important' }}
                        >
                          Media / Press
                        </MenuItem>
                        <MenuItem 
                          value="other"
                          sx={{ fontFamily: '"Poppins", sans-serif !important' }}
                        >
                          Other
                        </MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Message"
                        name="message"
                        multiline
                        rows={5}
                        required
                        value={formData.message}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={!!errors.message}
                        helperText={errors.message || "Tell us what kind of HACKs you're dealing with."}
                      />
                    </Grid>

                    {/* Honeypot field - hidden from users */}
                    <Grid item xs={12} sx={{ display: 'none' }}>
                      <TextField
                        fullWidth
                        label="Leave this field empty"
                        name="honeypot"
                        value={formData.honeypot}
                        onChange={handleChange}
                        tabIndex={-1}
                        autoComplete="off"
                      />
                    </Grid>

                    {/* Robot checkbox */}
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            name="notRobot"
                            checked={formData.notRobot}
                            onChange={handleChange}
                            required
                          />
                        }
                        label="I am not a robot"
                        sx={{
                          '& .MuiFormControlLabel-label': {
                            fontSize: '0.9rem',
                            color: 'text.secondary',
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        fullWidth
                        disabled={loading}
                        sx={{
                          py: 1.5,
                          fontWeight: 600,
                          backgroundColor: '#063C5E',
                          '&:hover': { backgroundColor: '#052A42' },
                        }}
                      >
                        {loading ? 'Sending...' : 'Send Message'}
                      </Button>
                    </Grid>
                  </Grid>
                </Box>

                {/* Footer reassurance */}
                <Box sx={{ mt: 4, textAlign: 'center' }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 2,
                      fontSize: '0.95rem',
                      lineHeight: 1.7,
                      maxWidth: 600,
                      mx: 'auto',
                    }}>   We W&apos;ll get back to you personally.Usually within one buisness day.</Typography>
           
                   
                  {/* <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      fontSize: '0.8rem',
                      fontStyle: 'italic',
                      opacity: 0.7,
                      mt: 3,
                    }}
                  >
                    Looking for a demo? Visit{' '}
                    <MuiLink
                      href="/comasi"
                      sx={{
                        color: '#0B7897',
                        textDecoration: 'none',
                        fontWeight: 500,
                        opacity: 0.9,
                        '&:hover': { textDecoration: 'underline', opacity: 1 },
                      }}
                    >
                      CoMaSy
                    </MuiLink>
                    {' '}or{' '}
                    <MuiLink
                      href="/education"
                      sx={{
                        color: '#0B7897',
                        textDecoration: 'none',
                        fontWeight: 500,
                        opacity: 0.9,
                        '&:hover': { textDecoration: 'underline', opacity: 1 },
                      }}
                    >
                      Education
                    </MuiLink>
                    {' '}to request a guided session. */}
                  {/* </Typography> */}
                </Box>
              </>
            )}
          </Box>

          {/* Response time info - outside form box, inside container */}
          {/* <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: 'block',
              textAlign: 'center',
              mt: 3,
              mb: 2,
              fontSize: '0.9rem',
              opacity: 0.7,
            }}
          >
            We typically reply within 24 hours on business days.
          </Typography> */}
        </Container>
      </Box>
      <Footer />
    </>
  );
}
