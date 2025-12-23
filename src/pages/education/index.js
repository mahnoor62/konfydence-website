'use client';

import { useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Snackbar,
  Alert,
} from '@mui/material';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_URL environment variable is missing!');
}
const API_URL = `${API_BASE_URL}/api`;
console.log('🔗 Education Page API URL:', API_URL);

export default function EducationPage() {
  const [formData, setFormData] = useState({
    name: '',
    school: '',
    email: '',
    role: '',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const validateField = (name, value) => {
    let error = '';
    if (name === 'name' && !value.trim()) {
      error = 'Name is required';
    } else if (name === 'school' && !value.trim()) {
      error = 'School / Institution is required';
    } else if (name === 'email') {
      if (!value.trim()) {
        error = 'Email is required';
      } else if (!/.+@.+\..+/.test(value)) {
        error = 'Please enter a valid email address';
      }
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors({ ...errors, [name]: error });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all required fields
    const newErrors = {};
    ['name', 'school', 'email'].forEach((field) => {
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
      const payload = {
        name: formData.name,
        school: formData.school,
        email: formData.email,
        role: formData.role,
        message: formData.message,
        lead_type: 'b2e',
      };

      const url = `${API_URL}/leads/education`;
      console.log('📡 API: POST', url, payload);
      await axios.post(url, payload, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
        params: { _t: Date.now() },
      });
      
      setSnackbar({ open: true, message: 'Thank you! We will contact you soon.', severity: 'success' });
      setFormData({ name: '', school: '', email: '', role: '', message: '' });
      setErrors({});
    } catch (error) {
      console.error('❌ Error submitting education lead:', {
        url: `${API_URL}/leads/education`,
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
      <Box component="main" sx={{ minHeight: '100vh' }}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #0A4D68 0%, #088395 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            color: 'white',
            py: 20,
          }}
        >
          <Container maxWidth="lg">
            <Typography variant="h2" textAlign="center" gutterBottom>
              Empower Students Against Digital Deception
            </Typography>
            <Typography variant="h6" textAlign="center" sx={{ opacity: 0.9 }}>
              Teaching children how digital manipulation works — before it works on them
            </Typography>
          </Container>
        </Box>

        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Grid container spacing={4} sx={{ mb: 8 }}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Teacher Handbook</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Comprehensive guide for educators with best practices and teaching strategies
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Lesson Plans</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ready-to-use curriculum materials aligned with educational standards
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Interactive Student Decks</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Engaging digital learning tools that make scam prevention fun and memorable
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* What Schools Receive Section */}
          <Box sx={{ mb: 6 }}>
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={5}>
                <Box
                  sx={{
                    width: '100%',
                    height: { xs: 300, md: 400 },
                    backgroundColor: '#E9F4FF',
                    borderRadius: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundImage: 'url(https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  }}
                >
                  <Box
                    sx={{
                      width: '100%',
                      height: '100%',
                      backgroundColor: 'rgba(6, 60, 94, 0.3)',
                      borderRadius: 3,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography
                      variant="h5"
                      sx={{
                        color: 'white',
                        fontWeight: 700,
                        textAlign: 'center',
                        px: 3,
                        textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                      }}
                    >
                      Youth Pack in Action
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={7}>
                <Typography
                  variant="h3"
                  sx={{
                    mb: 3,
                    fontSize: { xs: '1.75rem', md: '2.5rem' },
                    fontWeight: 700,
                    color: '#063C5E',
                  }}
                >
                  What students learn with the Youth Pack
                </Typography>
                <Box component="ul" sx={{ listStyle: 'none', pl: 0, m: 0 }}>
                  <Box
                    component="li"
                    sx={{
                      mb: 2,
                      display: 'flex',
                      alignItems: 'start',
                      fontSize: { xs: '1rem', md: '1.1rem' },
                    }}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: { xs: '1rem', md: '1.1rem' },
                        color: '#063C5E',
                        lineHeight: 1.8,
                      }}
                    >
                      • How scams exploit trust, fear, and authority
                    </Typography>
                  </Box>
                  <Box
                    component="li"
                    sx={{
                      mb: 2,
                      display: 'flex',
                      alignItems: 'start',
                      fontSize: { xs: '1rem', md: '1.1rem' },
                    }}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: { xs: '1rem', md: '1.1rem' },
                        color: '#063C5E',
                        lineHeight: 1.8,
                      }}
                    >
                      • How to pause before clicking or sharing
                    </Typography>
                  </Box>
                  <Box
                    component="li"
                    sx={{
                      mb: 2,
                      display: 'flex',
                      alignItems: 'start',
                      fontSize: { xs: '1rem', md: '1.1rem' },
                    }}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: { xs: '1rem', md: '1.1rem' },
                        color: '#063C5E',
                        lineHeight: 1.8,
                      }}
                    >
                      • How to discuss digital risks openly
                    </Typography>
                  </Box>
                  <Box
                    component="li"
                    sx={{
                      display: 'flex',
                      alignItems: 'start',
                      fontSize: { xs: '1rem', md: '1.1rem' },
                    }}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: { xs: '1rem', md: '1.1rem' },
                        color: '#063C5E',
                        lineHeight: 1.8,
                      }}
                    >
                      • How to support peers and family members
                    </Typography>
                  </Box>
                </Box>
                <Typography
                  variant="body1"
                  sx={{
                    mt: 3,
                    fontSize: { xs: '1rem', md: '1.1rem' },
                    color: '#063C5E',
                    lineHeight: 1.8,
                    fontStyle: 'italic',
                  }}
                >
                  Konfydence is built by cybersecurity and education experts to turn real-world digital risks into age-appropriate learning experiences.
                </Typography>
              </Grid>
            </Grid>
          </Box>

          {/* Youth Pack at a glance */}
          <Box sx={{ mb: 8 }}>
            <Card
              sx={{
                maxWidth: 700,
                mx: 'auto',
                p: 4,
                backgroundColor: '#E9F4FF',
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              }}
            >
              <CardContent>
                <Typography
                  variant="h5"
                  sx={{
                    mb: 3,
                    fontSize: { xs: '1.5rem', md: '1.75rem' },
                    fontWeight: 700,
                    color: '#063C5E',
                    textAlign: 'center',
                  }}
                >
                  Youth Pack at a glance
                </Typography>
                <Box component="ul" sx={{ listStyle: 'none', pl: 0, m: 0 }}>
                  <Box component="li" sx={{ mb: 2, display: 'flex', alignItems: 'start' }}>
                    <Typography variant="body1" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, color: '#063C5E' }}>
                      🎯 <strong>Target age:</strong> from 11
                    </Typography>
                  </Box>
                  <Box component="li" sx={{ mb: 2, display: 'flex', alignItems: 'start' }}>
                    <Typography variant="body1" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, color: '#063C5E' }}>
                      ⏱ <strong>Duration:</strong> 3–5 classroom sessions
                    </Typography>
                  </Box>
                  <Box component="li" sx={{ mb: 2, display: 'flex', alignItems: 'start' }}>
                    <Typography variant="body1" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, color: '#063C5E' }}>
                      🌍 <strong>Languages:</strong> German & English
                    </Typography>
                  </Box>
                  <Box component="li" sx={{ mb: 2, display: 'flex', alignItems: 'start' }}>
                    <Typography variant="body1" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, color: '#063C5E' }}>
                      📊 Includes discussion guides & reflection tools
                    </Typography>
                  </Box>
                  <Box component="li" sx={{ display: 'flex', alignItems: 'start' }}>
                    <Typography variant="body1" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, color: '#063C5E' }}>
                      🛡 <strong>Focus:</strong> scams, manipulation, digital trust
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Konfydence for Kids Section */}
          <Box sx={{ mb: 8, textAlign: 'center' }}>
            <Typography
              variant="h4"
              sx={{
                mb: 2,
                fontSize: { xs: '1.5rem', md: '2rem' },
                fontWeight: 700,
                color: '#063C5E',
              }}
            >
              Konfydence for Kids
            </Typography>
            <Typography
              variant="body1"
              sx={{
                maxWidth: 800,
                mx: 'auto',
                fontSize: { xs: '1rem', md: '1.1rem' },
                color: '#063C5E',
                lineHeight: 1.8,
              }}
            >
              Konfydence for Kids reinvests learning into impact.
              <br />
              Every Youth Pack contributes directly to organizations that help children grow safer, more confident, and more resilient in digital spaces.
            </Typography>
          </Box>

          {/* Form Section */}
          <Box>
            <Typography variant="h4" textAlign="center" gutterBottom>
              Request Pilot Information
            </Typography>
            {/* <Typography variant="body1" textAlign="center" color="text.secondary" sx={{ mb: 2 }}>
              Interested in bringing Konfydence to your school? Fill out the form below
            </Typography> */}
            
            {/* Context Copy */}
            <Typography
              variant="body2"
              textAlign="center"
              sx={{
                mb: 4,
                color: '#063C5E',
                fontStyle: 'italic',
                maxWidth: 700,
                mx: 'auto',
                px: 2,
              }}
            >
              Request a school pilot and we&apos;ll contact you within 2 working days with details, materials, and next steps.
            </Typography>

            <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600, mx: 'auto' }}>
              <Grid container spacing={3}>
                {/* 1. Name */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="name"
                    label="Name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={!!errors.name}
                    helperText={errors.name}
                  />
                </Grid>

                {/* 2. School / Institution */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="school"
                    label="School / Institution"
                    required
                    value={formData.school}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={!!errors.school}
                    helperText={errors.school}
                  />
                </Grid>

                {/* 3. Email */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="email"
                    label="Email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={!!errors.email}
                    helperText={errors.email}
                  />
                </Grid>

                {/* 4. Role */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="role"
                    label="Role (e.g. Teacher, Principal)"
                    value={formData.role}
                    onChange={handleChange}
                  />
                </Grid>

                {/* 5. Message */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="message"
                    label="Message"
                    multiline
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button type="submit" variant="contained" size="large" fullWidth disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit Request'}
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
