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
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  Divider,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link,
  IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import SchoolIcon from '@mui/icons-material/School';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GamepadIcon from '@mui/icons-material/Gamepad';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoadingState from '@/components/LoadingState';
import ErrorDisplay from '@/components/ErrorDisplay';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const API_URL = `${API_BASE_URL}/api`;

export default function MemberDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { getAuthToken, user: authUser } = useAuth();
  const [member, setMember] = useState(null);
  const [gameProgress, setGameProgress] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (id && id !== '[id]') {
      fetchMemberDetails();
    }
  }, [id]);

  const fetchMemberDetails = async () => {
    if (!id || id === '[id]') {
      setError('Invalid member ID');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const token = getAuthToken();
      
      if (!token) {
        router.push('/login');
        return;
      }

      // Check current user's role
      const currentUserResponse = await axios.get(`${API_URL}/auth/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const currentUser = currentUserResponse.data;
      const isCurrentUserOwner = currentUser.role === 'b2b_user' || currentUser.role === 'b2e_user';
      const isCurrentUserMember = currentUser.role === 'b2b_member' || currentUser.role === 'b2e_member';
      
      // If current user is a member trying to view details, redirect them
      // Members should not see this detail page - only organization admins should
      if (isCurrentUserMember && !isCurrentUserOwner) {
        router.push('/dashboard/member');
        return;
      }
      
      // Only owners/admins can view member details
      if (!isCurrentUserOwner && currentUser.role !== 'admin') {
        setError({ message: 'You do not have permission to view this page' });
        setLoading(false);
        return;
      }
      
      setIsOwner(isCurrentUserOwner);

      // Fetch member details
      const memberResponse = await axios.get(`${API_URL}/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // API returns { user, transactions }, extract user
      const memberData = memberResponse.data.user || memberResponse.data;
      
      // Ensure memberStatus is properly synced from database
      // If memberStatus is not set or is null, default to 'pending'
      if (!memberData.memberStatus) {
        memberData.memberStatus = 'pending';
      }
      
      // If current user is a member (not owner) viewing their own details, restrict organization details
      if (!isCurrentUserOwner && currentUser._id.toString() === id) {
        // Member viewing their own details - only show name and code
        if (memberData.organizationId) {
          try {
            const orgResponse = await axios.get(`${API_URL}/organizations/${memberData.organizationId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            // Backend already restricts, but ensure we only use name and code
            const orgData = orgResponse.data.organization || orgResponse.data;
            memberData.organization = {
              name: orgData.name,
              uniqueCode: orgData.uniqueCode
            };
          } catch (err) {
            console.error('Error fetching organization:', err);
          }
        }
        if (memberData.schoolId) {
          try {
            const schoolResponse = await axios.get(`${API_URL}/schools/${memberData.schoolId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            // Backend already restricts, but ensure we only use name and code
            const schoolData = schoolResponse.data;
            memberData.school = {
              name: schoolData.name,
              uniqueCode: schoolData.uniqueCode
            };
          } catch (err) {
            console.error('Error fetching school:', err);
          }
        }
      } else if (memberData.organizationId) {
        // Owner viewing member - fetch full org details
        try {
          const orgResponse = await axios.get(`${API_URL}/organizations/${memberData.organizationId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          memberData.organization = orgResponse.data.organization || orgResponse.data;
        } catch (err) {
          console.error('Error fetching organization:', err);
        }
      } else if (memberData.schoolId) {
        // Owner viewing member - fetch full school details
        try {
          const schoolResponse = await axios.get(`${API_URL}/schools/${memberData.schoolId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          memberData.school = schoolResponse.data;
        } catch (err) {
          console.error('Error fetching school:', err);
        }
      }
      
      setMember(memberData);

      // Fetch game progress
      try {
        const gameResponse = await axios.get(`${API_URL}/game-progress/user/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setGameProgress(gameResponse.data || []);
      } catch (err) {
        console.error('Error fetching game progress:', err);
        setGameProgress([]);
      }

      // Fetch activities (only if member is approved and has actual activities)
      // Don't show fake "joined" activity
      try {
        const activitiesResponse = await axios.get(`${API_URL}/users/${id}/activities`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (activitiesResponse.data && Array.isArray(activitiesResponse.data) && activitiesResponse.data.length > 0) {
          setActivities(activitiesResponse.data);
        } else {
          setActivities([]);
        }
      } catch (err) {
        // No activities endpoint or error - don't show fake activities
        setActivities([]);
      }
    } catch (err) {
      console.error('Error fetching member details:', err);
      if (err.response?.status === 404) {
        setError({ message: 'Member not found' });
      } else if (err.response?.status === 403) {
        setError({ message: 'You do not have permission to view this member' });
      } else {
        setError(err);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <Box sx={{ minHeight: '100vh', height: '100%', pt: 8 }}>
          <LoadingState message="Loading member details..." />
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
          <Container maxWidth="lg">
            <ErrorDisplay error={error} title="Failed to Load Member Details" />
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => router.back()}
              sx={{ mt: 2 }}
            >
              Go Back
            </Button>
          </Container>
        </Box>
        <Footer />
      </>
    );
  }

  if (!member) {
    return null;
  }

  return (
    <>
      <Header />
      <Box
        component="main"
        sx={{
          pt: { xs: 20, md: 20 },
          minHeight: '80vh',
          backgroundColor: '#F5F8FB',
          py: 4,
        }}
      >
        <Container maxWidth="xl">
          <Breadcrumbs sx={{ mb: 3 }}>
            <Link
              color="inherit"
              href="/dashboard/organization"
              onClick={(e) => {
                e.preventDefault();
                router.push('/dashboard/organization');
              }}
              sx={{ cursor: 'pointer' }}
            >
              Dashboard
            </Link>
            <Typography color="text.primary">Member Details</Typography>
          </Breadcrumbs>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton
                onClick={() => router.back()}
                sx={{ color: '#0B7897' }}
              >
                <ArrowBackIcon />
              </IconButton>
              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: '#063C5E',
                  }}
                >
                  {member.name || member.email}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Chip
                    label={member.role === 'b2b_member' ? 'Business Member' : 'Education Member'}
                    size="small"
                    color="primary"
                  />
                  <Chip
                    label={member.memberStatus === 'approved' ? 'Approved' : member.memberStatus === 'pending' ? 'Pending' : 'Rejected'}
                    size="small"
                    color={member.memberStatus === 'approved' ? 'success' : member.memberStatus === 'pending' ? 'warning' : 'error'}
                  />
                </Stack>
              </Box>
            </Box>
          </Box>

          <Grid container spacing={3}>
            {/* Member Info Card */}
            <Grid item xs={12} md={4}>
              <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)', borderRadius: 3, height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        bgcolor: '#0B7897',
                        fontSize: '2rem',
                        mr: 2,
                      }}
                    >
                      {member.name?.charAt(0)?.toUpperCase() || member.email?.charAt(0)?.toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#063C5E' }}>
                        {member.name || 'Member'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {member.email}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Member Status
                      </Typography>
                      <Chip
                        label={member.memberStatus === 'approved' ? 'Approved' : member.memberStatus === 'pending' ? 'Pending Approval' : 'Rejected'}
                        size="small"
                        color={member.memberStatus === 'approved' ? 'success' : member.memberStatus === 'pending' ? 'warning' : 'error'}
                        sx={{ mt: 0.5, ml: 1 }}
                      />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Account Status
                      </Typography>
                      <Chip
                        label={member.isActive ? 'Active' : 'Inactive'}
                        color={member.isActive ? 'success' : 'default'}
                        size="small"
                        sx={{ mt: 0.5, ml: 1 }}
                      />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Member Since
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {new Date(member.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                    {member.memberApprovedAt && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Approved On
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          {new Date(member.memberApprovedAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Game Progress Card */}
            <Grid item xs={12} md={8}>
              <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)', borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <GamepadIcon sx={{ mr: 1, color: '#0B7897' }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#063C5E' }}>
                      Game Progress
                    </Typography>
                  </Box>

                  {gameProgress.length > 0 ? (
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell><strong>Game</strong></TableCell>
                            <TableCell><strong>Environment</strong></TableCell>
                            <TableCell><strong>Score</strong></TableCell>
                            <TableCell><strong>Last Played</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {gameProgress.map((progress, index) => (
                            <TableRow key={index}>
                              <TableCell>{progress.gameName || 'Game'}</TableCell>
                              <TableCell>{progress.level || 'N/A'}</TableCell>
                              <TableCell>{progress.score || 0}</TableCell>
                              <TableCell>
                                {progress.lastPlayed ? new Date(progress.lastPlayed).toLocaleString() : 'N/A'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Alert severity="info">
                      No game progress found for this member.
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Activities Card */}
            <Grid item xs={12}>
              <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)', borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <AccessTimeIcon sx={{ mr: 1, color: '#0B7897' }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#063C5E' }}>
                      Member Activities
                    </Typography>
                  </Box>

                  {activities.length > 0 ? (
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell><strong>Activity</strong></TableCell>
                            <TableCell><strong>Date</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {activities.map((activity, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <Typography variant="body2">
                                  {activity.description || activity.type || 'Activity'}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" color="text.secondary">
                                  {new Date(activity.timestamp || activity.createdAt || new Date()).toLocaleString()}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Alert severity="info">
                      No activities found for this member.
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
      <Footer />
    </>
  );
}

