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

export default function EducationPage() {
  const [formData, setFormData] = useState({
    schoolName: '',
    contactName: '',
    role: '',
    email: '',
    cityCountry: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/leads/education', formData);
      setSnackbar({ open: true, message: 'Thank you! We will contact you soon.', severity: 'success' });
      setFormData({ schoolName: '', contactName: '', role: '', email: '', cityCountry: '', message: '' });
    } catch (error) {
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
              The Youth Pack brings media literacy to life – aligned with KMK Digital Strategy
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

          <Box>
            <Typography variant="h4" textAlign="center" gutterBottom>
              Request Pilot Information
            </Typography>
            <Typography variant="body1" textAlign="center" color="text.secondary" sx={{ mb: 4 }}>
              Interested in bringing Konfydence to your school? Fill out the form below
            </Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600, mx: 'auto' }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="School / Institution Name"
                    required
                    value={formData.schoolName}
                    onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Contact Person"
                    required
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Role"
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
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
                    label="City / Country"
                    required
                    value={formData.cityCountry}
                    onChange={(e) => setFormData({ ...formData, cityCountry: e.target.value })}
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

