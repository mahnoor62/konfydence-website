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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_URL environment variable is missing!');
}
const API_URL = `${API_BASE_URL}/api`;
console.log('🔗 CoMaSy Page API URL:', API_URL);

export default function CoMaSyPage() {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    message: '',
  });
  const [errors, setErrors] = useState({
    name: '',
    company: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const validateEmail = (email) => {
    const emailRegex = /.+@.+\..+/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = {
      name: '',
      company: '',
      email: '',
    };
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }

    if (!formData.company.trim()) {
      newErrors.company = 'Company is required';
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      setSnackbar({ open: true, message: 'Please fill in all required fields correctly.', severity: 'error' });
      return;
    }

    setLoading(true);
    try {
      const url = `${API_URL}/leads/b2b`;
      // Send exact payload as required: { name, email, company, message, lead_type: "b2b" }
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        company: formData.company.trim(),
        message: formData.message.trim(),
        lead_type: 'b2b',
      };
      console.log('📡 API: POST', url, payload);
      await axios.post(url, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
        params: { _t: Date.now() },
      });
      
      setSnackbar({ open: true, message: 'Thank you! We will contact you soon.', severity: 'success' });
      setFormData({ name: '', company: '', email: '', message: '' });
      setErrors({ name: '', company: '', email: '' });
    } catch (error) {
      console.error('❌ Error submitting B2B lead:', {
        url: `${API_URL}/leads/b2b`,
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
      <Box component="main" sx={{  minHeight: '100vh' }}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #0A4D68 0%, #088395 100%)',
            color: 'white',
            py: 20,
          }}
        >
          <Container maxWidth="lg">
            <Typography variant="h2" textAlign="center" gutterBottom>
              CoMaSy - Compliance Mastery System
            </Typography>
            <Typography variant="h6" textAlign="center" sx={{ opacity: 0.9 }}>
              Transform compliance training into engaging, behavior-changing simulations
            </Typography>
          </Container>
        </Box>

        <Container maxWidth="lg" sx={{ py: 8 }}>
          {/* Description below hero */}
          <Box sx={{ mb: 6, textAlign: 'center' }}>
            <Typography 
              variant="body1" 
              sx={{ 
                fontSize: { xs: '1rem', md: '1.2rem' },
                color: '#063C5E',
                maxWidth: '900px',
                mx: 'auto',
                lineHeight: 1.8,
              }}
            >
              CoMaSy is a simulation-based compliance system that uses real-world scenarios to train employees and generate audit-ready evidence of human risk awareness.
            </Typography>
          </Box>
          <Grid container spacing={6}>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Box
                  sx={{
                    width: '100%',
                    maxWidth: { xs: '100%', md: '380px' },
                    height: { xs: '280px', md: '320px' },
                    backgroundColor: '#063C5E',
                    borderRadius: 3,
                    position: 'relative',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                    display: 'flex',
                    flexDirection: 'column',
                    p: 2.5,
                    gap: 1.5,
                    animation: 'floatCard 4s ease-in-out infinite',
                    transformOrigin: 'center',
                    filter: 'drop-shadow(0 25px 45px rgba(6,60,94,0.35))',
                    overflow: 'hidden',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(11,120,151,0.2))',
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: '-50%',
                      left: '-50%',
                      width: '200%',
                      height: '200%',
                      background: 'radial-gradient(circle, rgba(255,255,255,0.45), transparent 60%)',
                      animation: 'pulseGlow 6s ease-in-out infinite',
                    },
                    '@keyframes floatCard': {
                      '0%': { transform: 'translateY(0px) rotate(0deg)', filter: 'brightness(1) drop-shadow(0 25px 45px rgba(6,60,94,0.35))' },
                      '50%': {
                        transform: 'translateY(-15px) rotate(-1deg)',
                        filter: 'brightness(1.07) drop-shadow(0 25px 45px rgba(6,60,94,0.35))',
                      },
                      '100%': { transform: 'translateY(0px) rotate(0deg)', filter: 'brightness(1) drop-shadow(0 25px 45px rgba(6,60,94,0.35))' },
                    },
                    '@keyframes pulseGlow': {
                      '0%': { transform: 'translate(-20%, -20%) scale(1)' },
                      '50%': { transform: 'translate(10%, 10%) scale(1.1)', opacity: 0.7 },
                      '100%': { transform: 'translate(-20%, -20%) scale(1)' },
                    },
                  }}
                >
                  {/* Dashboard Preview Mockup */}
                  <Box
                    sx={{
                      flex: 1,
                      backgroundColor: '#0B7897',
                      borderRadius: 2,
                      p: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                    }}
                  >
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Box sx={{ width: '60%', height: '8px', backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 1 }} />
                      <Box sx={{ width: '30%', height: '8px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 1 }} />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {[1, 2, 3, 4].map((i) => (
                        <Box
                          key={i}
                          sx={{
                            width: { xs: '45%', md: '48%' },
                            height: '60px',
                            backgroundColor: 'rgba(255,255,255,0.15)',
                            borderRadius: 1.5,
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                  {/* Cards Preview */}
                  <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center' }}>
                    {[1, 2, 3].map((i) => (
                      <Box
                        key={i}
                        sx={{
                          width: '60px',
                          height: '80px',
                          backgroundColor: '#00A4E8',
                          borderRadius: 2,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h4" gutterBottom>
                Benefits
              </Typography>
              <Box component="ul" sx={{ listStyle: 'none', pl: 0, mb: 4 }}>
                <Box component="li" sx={{ mb: 2, display: 'flex', alignItems: 'start' }}>
                  <Typography variant="body1">✓ Aligned with NIS2 and GDPR awareness requirements</Typography>
                </Box>
                <Box component="li" sx={{ mb: 2, display: 'flex', alignItems: 'start' }}>
                  <Typography variant="body1">✓ Behavior-based metrics and reporting</Typography>
                </Box>
                <Box component="li" sx={{ mb: 2, display: 'flex', alignItems: 'start' }}>
                  <Typography variant="body1">✓ Custom content for finance, HR, and risk teams</Typography>
                </Box>
                <Box component="li" sx={{ mb: 2, display: 'flex', alignItems: 'start' }}>
                  <Typography variant="body1">✓ Engaging simulation-based learning</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>

          {/* Why Companies Use CoMaSy - Feature Comparison Table */}
          <Box sx={{ mt: 10, mb: 8 }}>
            <Typography 
              variant="h3" 
              textAlign="center" 
              gutterBottom
              sx={{
                fontSize: { xs: '1.75rem', md: '2.5rem' },
                fontWeight: 700,
                color: '#063C5E',
                mb: 4,
              }}
            >
              Why Companies Use CoMaSy
            </Typography>
            <TableContainer 
              component={Paper}
              sx={{
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                borderRadius: 3,
              }}
            >
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#063C5E' }}>
                    <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: '1.1rem' , pl:5}}>
                      Staff Training
                    </TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: '1.1rem' }}>
                      Incident Response
                    </TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: '1.1rem' }}>
                      Custom Packages
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <Box component="ul" sx={{ listStyle: 'none', pl: 0, m: 0 }}>
                        <Box component="li" sx={{ mb: 1.5, display: 'flex', alignItems: 'start' }}>
                          <Typography variant="body1" sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}>
                            • Interactive simulation-based learning
                          </Typography>
                        </Box>
                        <Box component="li" sx={{ mb: 1.5, display: 'flex', alignItems: 'start' }}>
                          <Typography variant="body1" sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}>
                            • Designed to support NIS2 and GDPR compliance efforts
                          </Typography>
                        </Box>
                        <Box component="li" sx={{ mb: 1.5, display: 'flex', alignItems: 'start' }}>
                          <Typography variant="body1" sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}>
                            • Behavior-based metrics and reporting
                          </Typography>
                        </Box>
                        <Box component="li" sx={{ display: 'flex', alignItems: 'start' }}>
                          <Typography variant="body1" sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}>
                            • Engaging content that increases retention
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box component="ul" sx={{ listStyle: 'none', pl: 0, m: 0 }}>
                        <Box component="li" sx={{ mb: 1.5, display: 'flex', alignItems: 'start' }}>
                          <Typography variant="body1" sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}>
                            • Real-time threat scenario simulations
                          </Typography>
                        </Box>
                        <Box component="li" sx={{ mb: 1.5, display: 'flex', alignItems: 'start' }}>
                          <Typography variant="body1" sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}>
                            • Rapid response training protocols
                          </Typography>
                        </Box>
                        <Box component="li" sx={{ mb: 1.5, display: 'flex', alignItems: 'start' }}>
                          <Typography variant="body1" sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}>
                            • Post-incident analysis and learning
                          </Typography>
                        </Box>
                        <Box component="li" sx={{ display: 'flex', alignItems: 'start' }}>
                          <Typography variant="body1" sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}>
                            • Team coordination exercises
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box component="ul" sx={{ listStyle: 'none', pl: 0, m: 0 }}>
                        <Box component="li" sx={{ mb: 1.5, display: 'flex', alignItems: 'start' }}>
                          <Typography variant="body1" sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}>
                            • Tailored content for finance teams
                          </Typography>
                        </Box>
                        <Box component="li" sx={{ mb: 1.5, display: 'flex', alignItems: 'start' }}>
                          <Typography variant="body1" sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}>
                            • Custom scenarios for HR departments
                          </Typography>
                        </Box>
                        <Box component="li" sx={{ mb: 1.5, display: 'flex', alignItems: 'start' }}>
                          <Typography variant="body1" sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}>
                            • Industry-specific risk team training
                          </Typography>
                        </Box>
                        <Box component="li" sx={{ display: 'flex', alignItems: 'start' }}>
                          <Typography variant="body1" sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}>
                            • Flexible pricing and deployment options
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Testimonial Block */}
          <Box sx={{ mb: 8 }}>
            <Card
              sx={{
                maxWidth: 800,
                mx: 'auto',
                p: 4,
                backgroundColor: '#E9F4FF',
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', gap: 0.5, mb: 2, justifyContent: 'center' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Box
                      key={star}
                      component="span"
                      sx={{
                        color: '#FFB800',
                        fontSize: '1.5rem',
                      }}
                    >
                      ★
                    </Box>
                  ))}
                </Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontStyle: 'italic',
                    textAlign: 'center',
                    mb: 3,
                    color: '#063C5E',
                    fontSize: { xs: '1.1rem', md: '1.5rem' },
                    lineHeight: 1.6,
                  }}
                >
                  &ldquo;Konfydence significantly raised scam-awareness across our staff.&rdquo;
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    textAlign: 'center',
                    fontWeight: 600,
                    color: '#063C5E',
                    fontSize: { xs: '0.95rem', md: '1.1rem' },
                  }}
                >
                  — Compliance Officer, Financial Services
                </Typography>
              </CardContent>
            </Card>
          </Box>

          {/* CTA Button */}
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Button
              component={Link}
              href="/contact?topic=b2b_demo"
              variant="contained"
              size="large"
              sx={{
                backgroundColor: '#00A4E8',
                color: 'white',
                fontWeight: 600,
                px: 6,
                py: 1.5,
                borderRadius: 2,
                fontSize: { xs: '1rem', md: '1.1rem' },
                '&:hover': {
                  backgroundColor: '#0088C7',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 24px rgba(0, 164, 232, 0.4)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Request Compliance Demo
            </Button>
          </Box>

          <Box sx={{ mt: 8 }}>
            <Typography variant="h4" textAlign="center" gutterBottom>
              Request a Demo
            </Typography>
            <Typography variant="body1" textAlign="center" color="text.secondary" sx={{ mb: 4 }}>
              Fill out the form below and we&apos;ll get in touch
            </Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600, mx: 'auto' }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Name"
                    required
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (errors.name) setErrors({ ...errors, name: '' });
                    }}
                    error={!!errors.name}
                    helperText={errors.name}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Company"
                    required
                    value={formData.company}
                    onChange={(e) => {
                      setFormData({ ...formData, company: e.target.value });
                      if (errors.company) setErrors({ ...errors, company: '' });
                    }}
                    error={!!errors.company}
                    helperText={errors.company}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (errors.email) setErrors({ ...errors, email: '' });
                    }}
                    error={!!errors.email}
                    helperText={errors.email}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Message"
                    multiline
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
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

          {/* Built for Audit & Compliance Teams Section */}
          <Box sx={{ mt: 10, mb: 6 }}>
            <Typography 
              variant="h4" 
              textAlign="center" 
              gutterBottom
              sx={{
                fontSize: { xs: '1.5rem', md: '2rem' },
                fontWeight: 700,
                color: '#063C5E',
                mb: 3,
              }}
            >
              Built for Audit & Compliance Teams
            </Typography>
            <Box 
              component="ul" 
              sx={{ 
                listStyle: 'none', 
                pl: 0, 
                maxWidth: 700,
                mx: 'auto',
              }}
            >
              <Box component="li" sx={{ mb: 2, display: 'flex', alignItems: 'start' }}>
                <Typography variant="body1" sx={{ fontSize: { xs: '1rem', md: '1.1rem' } }}>
                  ✓ Documented participation and outcomes
                </Typography>
              </Box>
              <Box component="li" sx={{ mb: 2, display: 'flex', alignItems: 'start' }}>
                <Typography variant="body1" sx={{ fontSize: { xs: '1rem', md: '1.1rem' } }}>
                  ✓ Behavior-based scoring (not just completion)
                </Typography>
              </Box>
              <Box component="li" sx={{ mb: 2, display: 'flex', alignItems: 'start' }}>
                <Typography variant="body1" sx={{ fontSize: { xs: '1rem', md: '1.1rem' } }}>
                  ✓ Evidence notes per session
                </Typography>
              </Box>
              <Box component="li" sx={{ mb: 2, display: 'flex', alignItems: 'start' }}>
                <Typography variant="body1" sx={{ fontSize: { xs: '1rem', md: '1.1rem' } }}>
                  ✓ Exportable reports for audits and regulators
                </Typography>
              </Box>
              <Box component="li" sx={{ mb: 2, display: 'flex', alignItems: 'start' }}>
                <Typography variant="body1" sx={{ fontSize: { xs: '1rem', md: '1.1rem' } }}>
                  ✓ Supports NIS2 Articles 21 & 23 (human risk & awareness)
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Pricing Section */}
          <Box sx={{ mt: 8, mb: 6 }}>
            <Typography 
              variant="h4" 
              textAlign="center" 
              gutterBottom
              sx={{
                fontSize: { xs: '1.5rem', md: '2rem' },
                fontWeight: 700,
                color: '#063C5E',
                mb: 2,
              }}
            >
              Pricing
            </Typography>
            <Typography 
              variant="body1" 
              textAlign="center" 
              color="text.secondary"
              sx={{ 
                mb: 3,
                maxWidth: 800,
                mx: 'auto',
                fontSize: { xs: '1rem', md: '1.1rem' },
              }}
            >
              CoMaSy pricing depends on organization size, use cases, and audit requirements.
            </Typography>
            <Box sx={{ maxWidth: 600, mx: 'auto', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#063C5E', mb: 2 }}>
                Typical engagement models:
              </Typography>
              <Box component="ul" sx={{ listStyle: 'none', pl: 0 }}>
                <Box component="li" sx={{ mb: 1.5 }}>
                  <Typography variant="body1">
                    <strong>SMEs:</strong> from €1,300 / year
                  </Typography>
                </Box>
                <Box component="li" sx={{ mb: 1.5 }}>
                  <Typography variant="body1">
                    <strong>Mid-size:</strong> per-seat pricing
                  </Typography>
                </Box>
                <Box component="li" sx={{ mb: 2 }}>
                  <Typography variant="body1">
                    <strong>Enterprise:</strong> custom scope and onboarding
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body1" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                Request a demo for a tailored offer.
              </Typography>
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

