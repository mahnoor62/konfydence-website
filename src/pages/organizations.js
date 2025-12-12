'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  LinearProgress,
} from '@mui/material';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoadingState from '@/components/LoadingState';
import ErrorDisplay from '@/components/ErrorDisplay';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const API_URL = `${API_BASE_URL}/api`;

export default function OrganizationsPage() {
  const router = useRouter();
  const { user, getAuthToken } = useAuth();
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/organizations');
      return;
    }
    fetchOrganizations();
  }, [user]);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getAuthToken();
      const response = await axios.get(`${API_URL}/user/organizations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOrganizations(response.data);
    } catch (err) {
      console.error('Error fetching organizations:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !user) {
    return (
      <>
        <Header />
        <Box sx={{ minHeight: '80vh', pt: 8 }}>
          <LoadingState message="Loading organizations..." />
        </Box>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <Box sx={{ minHeight: '80vh', pt: 8 }}>
          <ErrorDisplay error={error} title="Failed to Load Organizations" />
        </Box>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <Box
        component="main"
        sx={{
          pt: { xs: 8, md: 10 },
          minHeight: '80vh',
          backgroundColor: '#F5F8FB',
          py: 4,
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#063C5E' }}>
              Organizations
            </Typography>
            <Button
              variant="contained"
              onClick={() => router.push('/organizations/new')}
              sx={{
                backgroundColor: '#0B7897',
                '&:hover': { backgroundColor: '#063C5E' },
              }}
            >
              Create Organization
            </Button>
          </Box>

          {organizations.length === 0 ? (
            <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)', borderRadius: 3 }}>
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No Organizations Found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  You don&apos;t have access to any organizations yet.
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => router.push('/organizations/new')}
                  sx={{
                    backgroundColor: '#0B7897',
                    '&:hover': { backgroundColor: '#063C5E' },
                  }}
                >
                  Create Your First Organization
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Grid container spacing={3}>
              {organizations.map((org) => (
                <Grid item xs={12} md={6} key={org._id}>
                  <Card
                    sx={{
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                      borderRadius: 3,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                      },
                    }}
                    onClick={() => router.push(`/organizations/${org._id}`)}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Stack spacing={2}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#063C5E' }}>
                              {org.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {org.type}
                            </Typography>
                          </Box>
                          <Chip
                            label={org.segment}
                            color={org.segment === 'B2B' ? 'primary' : 'secondary'}
                            size="small"
                          />
                        </Box>

                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Status
                          </Typography>
                          <Chip
                            label={org.status}
                            color={
                              org.status === 'active'
                                ? 'success'
                                : org.status === 'expired'
                                ? 'error'
                                : 'default'
                            }
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        </Box>

                        <Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Contact: {org.primaryContact.name} ({org.primaryContact.email})
                          </Typography>
                        </Box>

                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              Seat Usage
                            </Typography>
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>
                              {org.seatUsage?.usedSeats || 0} / {org.seatUsage?.seatLimit || 0}
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={
                              org.seatUsage?.seatLimit > 0
                                ? ((org.seatUsage?.usedSeats || 0) / org.seatUsage.seatLimit) * 100
                                : 0
                            }
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: '#E0E7F0',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: '#0B7897',
                              },
                            }}
                          />
                        </Box>

                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Active Contracts: {org.activeContractsCount || 0}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Users: {org.userCount || 0}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </Box>
      <Footer />
    </>
  );
}

