'use client';

import { useState, useEffect, Suspense } from 'react';
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
} from '@mui/material';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_URL environment variable is missing!');
}
const API_URL = `${API_BASE_URL}/api`;
console.log('🔗 Contact Page API URL:', API_URL);

function ContactForm() {
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    topic: searchParams?.get('topic') || 'other',
    message: '',
    employeeCount: '',
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const topic = searchParams?.get('topic');
    if (topic) {
      setFormData((prev) => ({ ...prev, topic }));
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { employeeCount, ...rest } = formData;
      const payload = {
        ...rest,
        message: employeeCount
          ? `Employee count: ${employeeCount}\n\n${formData.message}`
          : formData.message,
      };
      const url = `${API_URL}/contact`;
      console.log(`📡 POST ${url}`, payload);
      await axios.post(url, payload);
      setSnackbar({ open: true, message: 'Thank you! We will get back to you soon.', severity: 'success' });
      setFormData({ name: '', email: '', company: '', topic: 'other', message: '', employeeCount: '' });
    } catch (error) {
      console.error('❌ Error submitting contact form:', {
        url: `${API_URL}/contact`,
        error: error.response?.data || error.message,
        status: error.response?.status,
      });
      setSnackbar({ open: true, message: 'Error submitting form. Please try again.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

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
            py: { xs: 10, md: 12},
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
                  mt:10,
                  fontWeight: 700,
                  mb: 2,
                  fontSize: { xs: '2.4rem', md: '3.2rem' },
                }}
              >
                Get in Touch
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: 'rgba(255,255,255,0.92)',
                  fontSize: { xs: '1.05rem', md: '1.15rem' },
                  lineHeight: 1.6,
                }}
              >
                Feel free to reach out with any questions or inquiries. Our team typically responds within one
                business day.
              </Typography>
            </Box>
          </Container>
        </Box>

        <Container data-aos="zoom-in" data-aos-duration="800" data-aos-delay="100" 
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
            <Typography
              variant="h4"
              textAlign="center"
              sx={{ fontWeight: 700, mb: 1, color: '#052A42', fontSize: { xs: '1.75rem', md: '2.1rem' } }}
            >
              Get in Touch
            </Typography>
            <Typography variant="body1" textAlign="center" color="text.secondary" sx={{ mb: 4 }}>
              Feel free to reach out with any questions or inquiries.
            </Typography>

            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Company"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    select
                    label="Employee count"
                    value={formData.employeeCount}
                    onChange={(e) => setFormData({ ...formData, employeeCount: e.target.value })}
                  >
                    <MenuItem value="1-10">1-10</MenuItem>
                    <MenuItem value="11-50">11-50</MenuItem>
                    <MenuItem value="51-200">51-200</MenuItem>
                    <MenuItem value="200+">200+</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    select
                    label="Topic"
                    required
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
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
                    multiline
                    rows={5}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
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

export default function ContactPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ContactForm />
    </Suspense>
  );
}

