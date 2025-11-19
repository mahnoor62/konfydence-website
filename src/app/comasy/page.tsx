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
import api from '@/lib/api';

export default function CoMaSyPage() {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    employeeCount: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/leads/b2b', formData);
      setSnackbar({ open: true, message: 'Thank you! We will contact you soon.', severity: 'success' });
      setFormData({ name: '', company: '', email: '', employeeCount: '', message: '' });
    } catch (error) {
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
          <Grid container spacing={6}>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  backgroundImage: 'url(https://via.placeholder.com/600x400)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  borderRadius: 2,
                  height: 400,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h4" gutterBottom>
                Benefits
              </Typography>
              <Box component="ul" sx={{ listStyle: 'none', pl: 0, mb: 4 }}>
                <Box component="li" sx={{ mb: 2, display: 'flex', alignItems: 'start' }}>
                  <Typography variant="body1">✓ NIS2 & DSGVO compliant training modules</Typography>
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

              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>Pricing</Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>KMU:</strong> €1,500/year
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Mid-size:</strong> €4/employee
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Enterprise:</strong> Custom pricing
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ mt: 8 }}>
            <Typography variant="h4" textAlign="center" gutterBottom>
              Request a Demo
            </Typography>
            <Typography variant="body1" textAlign="center" color="text.secondary" sx={{ mb: 4 }}>
              Fill out the form below and we'll get in touch
            </Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600, mx: 'auto' }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Company"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Employee Count"
                    value={formData.employeeCount}
                    onChange={(e) => setFormData({ ...formData, employeeCount: e.target.value })}
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

