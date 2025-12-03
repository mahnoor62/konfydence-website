import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  Grid,
  MenuItem,
  Snackbar,
  Alert,
  Checkbox,
  FormControlLabel,
  Link as MuiLink,
} from '@mui/material';
import { EmailOutlined, PhoneOutlined } from '@mui/icons-material';
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
    name: '',
    email: '',
    company: '',
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
        setFormData((prev) => ({ ...prev, topic }));
      }
    }
  }, [router.isReady, router.query]);

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        if (!value.trim()) {
          return 'Name is required';
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
    ['name', 'email', 'message'].forEach((field) => {
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
      if (formData.topic === 'b2b_demo') {
        payload = {
          name: formData.name,
          company: formData.company || '',
          email: formData.email,
          message: formData.message,
          topic: 'b2b_demo',
          lead_type: 'b2b',
        };
      } else {
        payload = {
          name: formData.name,
          email: formData.email,
          topic: formData.topic,
          message: formData.message,
        };
        if (formData.company) {
          payload.company = formData.company;
        }
      }

      const url = `${API_URL}/contact`;
      console.log(`📡 POST ${url}`, payload);
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
      setSnackbar({
        open: true,
        message: 'Error submitting form. Please try again.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const isB2BDemo = formData.topic === 'b2b_demo';

  return (
    <>
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
                {isB2BDemo ? 'Request Company Demo' : 'Get in Touch'}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: 'rgba(255,255,255,0.92)',
                  fontSize: { xs: '1.05rem', md: '1.15rem' },
                  lineHeight: 1.6,
                }}
              >
                {isB2BDemo
                  ? 'Tell us about your organization and we\'ll schedule a live Konfydence demo within 24 hours on business days.'
                  : 'Feel free to reach out with any questions or inquiries. Our team typically responds within one business day.'}
              </Typography>
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
                  Thank you for your message.
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7 }}
                >
                  We&apos;ll get back to you within 24 hours.
                </Typography>
              </Box>
            ) : (
              <>
                <Typography
                  variant="h4"
                  textAlign="center"
                  sx={{ fontWeight: 700, mb: 1, color: '#052A42', fontSize: { xs: '1.75rem', md: '2.1rem' } }}
                >
                  {isB2BDemo ? 'Request Company Demo' : 'Get in Touch'}
                </Typography>
                <Typography variant="body1" textAlign="center" color="text.secondary" sx={{ mb: 4 }}>
                  {isB2BDemo
                    ? ''
                    : 'Feel free to reach out with any questions or inquiries.'}
                </Typography>

                {/* Direct Contact Info Block */}
                <Box
                  sx={{
                    mb: 4,
                    p: 3,
                    backgroundColor: '#F5F8FB',
                    borderRadius: 2,
                    border: '1px solid #E0E7ED',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <EmailOutlined sx={{ color: '#0B7897', fontSize: '1.2rem' }} />
                    <MuiLink
                      href="mailto:contact@konfydence.com"
                      sx={{
                        color: '#063C5E',
                        textDecoration: 'none',
                        fontWeight: 500,
                        '&:hover': { textDecoration: 'underline' },
                      }}
                    >
                      contact@konfydence.com
                    </MuiLink>
                  </Box>
                </Box>

                {/* B2B Context Copy Above Form */}
                {isB2BDemo && (
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{
                      mb: 3,
                      fontSize: { xs: '0.95rem', md: '1rem' },
                      lineHeight: 1.6,
                      textAlign: 'left',
                    }}
                  >
                    Tell us about your organization and we&apos;ll schedule a live Konfydence demo within 24 hours on business days.
                  </Typography>
                )}

                <Box component="form" onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={!!errors.name}
                        helperText={errors.name}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Company"
                        name="company"
                        value={formData.company}
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
                              style: {
                                maxHeight: 224,
                                width: 'auto',
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
                      >
                        <MenuItem value="b2b_demo">B2B Demo Request</MenuItem>
                        <MenuItem value="b2c_question">B2C Question</MenuItem>
                        <MenuItem value="education">Education Inquiry</MenuItem>
                        <MenuItem value="other">Other</MenuItem>
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
                        helperText={errors.message}
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
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display: 'block',
                          textAlign: 'center',
                          mt: 1.5,
                          fontSize: '0.85rem',
                        }}
                      >
                        {isB2BDemo
                          ? 'After you submit, we\'ll email you to propose a demo time and share a brief agenda.'
                          : 'We typically reply within 24 hours on business days.'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </>
            )}
          </Box>
        </Container>
      </Box>
      <Footer />
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </>
  );
}
