'use client';

import { useState, useEffect, useRef } from 'react';
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
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Stack,
  Divider,
  IconButton,
  CircularProgress,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoadingState from '@/components/LoadingState';
import ErrorDisplay from '@/components/ErrorDisplay';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const API_URL = `${API_BASE_URL}/api`;

export default function DashboardPage() {
  const router = useRouter();
  const { user: authUser, logout, getAuthToken, requireAuth } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '' });
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [selectedTab, setSelectedTab] = useState(0);
  const [copiedCode, setCopiedCode] = useState(null);
  const [selectedLevelTab, setSelectedLevelTab] = useState(0);
  const [tabsScrollLeft, setTabsScrollLeft] = useState(0);
  const [tabsScrollRight, setTabsScrollRight] = useState(false);
  const tabsRef = useRef(null);

  useEffect(() => {
    if (!authUser && !loading) {
      router.push('/login?redirect=/dashboard');
      return;
    }
    if (authUser) {
      // Check if user is a member (has organizationId or schoolId)
      const hasOrganizationId = authUser.organizationId;
      const hasSchoolId = authUser.schoolId;
      const isMember = hasOrganizationId || hasSchoolId;
      
      // Redirect members to member dashboard
      if (isMember && (authUser.role === 'b2b_member' || authUser.role === 'b2e_member')) {
        router.push('/dashboard/member');
        return;
      }
      
      // Redirect B2B users to Organization dashboard and B2E users to Institute dashboard
      if (authUser.role === 'b2b_user') {
        router.push('/dashboard/organization');
        return;
      }
      if (authUser.role === 'b2e_user') {
        router.push('/dashboard/institute');
        return;
      }
      fetchDashboardData();
    }
  }, [authUser, router]);

  const checkTabsScroll = () => {
    if (tabsRef.current) {
      const element = tabsRef.current;
      setTabsScrollLeft(element.scrollLeft);
      setTabsScrollRight(
        element.scrollLeft < element.scrollWidth - element.clientWidth - 1
      );
    }
  };

  useEffect(() => {
    checkTabsScroll();
    const handleResize = () => {
      setTimeout(checkTabsScroll, 100);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getAuthToken();
      const response = await axios.get(`${API_URL}/user/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDashboardData(response.data);
      // Reset level tab when data changes
      setSelectedLevelTab(0);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const getProfilePhotoUrl = (profilePhoto) => {
    if (!profilePhoto) return null;
    if (profilePhoto.startsWith('http')) return profilePhoto;
    const apiBase = API_BASE_URL;
    const normalizedApiBase = apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase;
    return `${normalizedApiBase}${profilePhoto}`;
  };

  const handleEditProfile = () => {
    setEditForm({ 
      name: dashboardData?.user?.name || '', 
      email: dashboardData?.user?.email || '' 
    });
    setProfilePhotoFile(null);
    // Set preview to current profile photo if exists
    const currentPhotoUrl = getProfilePhotoUrl(dashboardData?.user?.profilePhoto);
    setProfilePhotoPreview(currentPhotoUrl);
    setEditDialogOpen(true);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setSnackbar({
          open: true,
          message: 'Please select an image file',
          severity: 'error'
        });
        return;
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setSnackbar({
          open: true,
          message: 'Image size must be less than 5MB',
          severity: 'error'
        });
        return;
      }

      setProfilePhotoFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeletePhoto = async () => {
    try {
      setUploadingPhoto(true);
      const token = getAuthToken();
      await axios.delete(`${API_URL}/profile/photo`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSnackbar({
        open: true,
        message: 'Profile photo deleted successfully',
        severity: 'success'
      });

      setProfilePhotoPreview(null);
      setProfilePhotoFile(null);
      fetchDashboardData();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.error || 'Failed to delete profile photo',
        severity: 'error'
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSubmitting(true);
      const token = getAuthToken();
      
      // Upload photo first if selected
      if (profilePhotoFile) {
        setUploadingPhoto(true);
        const formData = new FormData();
        formData.append('photo', profilePhotoFile);

        await axios.post(
          `${API_URL}/profile/photo`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        setUploadingPhoto(false);
      }

      // Update profile
      await axios.put(
        `${API_URL}/user/profile`,
        { 
          name: editForm.name,
          email: editForm.email 
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      setSnackbar({
        open: true,
        message: 'Profile updated successfully',
        severity: 'success',
      });
      setEditDialogOpen(false);
      setProfilePhotoFile(null);
      setProfilePhotoPreview(null);
      fetchDashboardData();
    } catch (err) {
      setUploadingPhoto(false);
      setSnackbar({
        open: true,
        message: err.response?.data?.error || 'Failed to update profile',
        severity: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleAccount = async () => {
    try {
      const token = getAuthToken();
      await axios.put(
        `${API_URL}/user/account/toggle`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSnackbar({
        open: true,
        message: dashboardData?.user?.isActive
          ? 'Account disabled successfully'
          : 'Account enabled successfully',
        severity: 'success',
      });
      fetchDashboardData();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.error || 'Failed to toggle account',
        severity: 'error',
      });
    }
  };

  if (loading || !authUser) {
    return (
      <>
        <Header />
        <Box sx={{ minHeight: '100vh', height: '100%', pt: 8 }}>
          <LoadingState message="Loading dashboard..." />
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
          <ErrorDisplay error={error} title="Failed to Load Dashboard" />
        </Box>
        <Footer />
      </>
    );
  }

  // Show loading if redirecting B2B/B2E users
  if (authUser && (authUser.role === 'b2b_user' || authUser.role === 'b2e_user')) {
    return (
      <>
        <Header />
        <Box sx={{ minHeight: '100vh', height: '100%', pt: 8 }}>
          <LoadingState message="Redirecting to organization dashboard..." />
        </Box>
        <Footer />
      </>
    );
  }

  if (!dashboardData) {
    return null;
  }

  const { user, membership, allMemberships, activePackages, progress, transactions, gameProgress, organizations } = dashboardData;

  // Determine which tabs to show
  // Exclude demo progress from hasProgress check UNLESS user has paid transactions
  // If user has paid transactions, they're a purchased user and should see progress
  const hasPaidTransactions = transactions && transactions.length > 0 && transactions.some(t => t.status === 'paid');
  // Only show progress if: user has paid transactions OR gameProgress.isDemo is explicitly false (not undefined, not true)
  const shouldShowGameProgress = gameProgress && gameProgress.totalLevelsPlayed > 0 && (hasPaidTransactions || gameProgress.isDemo === false);
  const hasProgress = shouldShowGameProgress || (progress && (progress.totalCards > 0 || (progress.packageProgress && progress.packageProgress.length > 0)));
  const hasTransactions = transactions && transactions.length > 0;
  const hasMemberships = (allMemberships && allMemberships.length > 0) || (activePackages && activePackages.length > 0);
  
  // Filter shop page purchases (packageId null, packageType present, and digital/digital_physical)
  const shopPagePurchases = transactions && transactions.length > 0 ? transactions.filter(tx => 
    !tx.packageId && 
    tx.packageType && 
    (tx.packageType === 'digital' || tx.packageType === 'digital_physical') &&
    tx.status === 'paid'
  ) : [];
  const hasShopPagePurchases = shopPagePurchases.length > 0;
  
  // Check if user has incomplete game progress (has started but not completed all 3 levels)
  // Exclude demo progress UNLESS user has paid transactions
  // If user has paid transactions, they're a purchased user and should see Resume Game button
  const hasIncompleteProgress = gameProgress && gameProgress.totalLevelsPlayed > 0 && gameProgress.totalLevelsPlayed < 3 && (hasPaidTransactions || gameProgress.isDemo === false);
  
  // Determine which level to resume from (find the first incomplete level)
  const getResumeLevel = () => {
    // Don't resume demo progress UNLESS user has paid transactions
    // If user has paid transactions, they're a purchased user and should see Resume Game button
    // Only resume if: hasPaidTransactions OR isDemo is explicitly false (not undefined, not true)
    if (!gameProgress) return null;
    if (gameProgress.isDemo === true && !hasPaidTransactions) return null; // Demo user without purchase
    if (gameProgress.isDemo !== false && !hasPaidTransactions) return null; // isDemo is undefined or true, and no purchase
    // Check each level (1, 2, 3) to find the first one that hasn't been completed
    for (let levelNum = 1; levelNum <= 3; levelNum++) {
      const levelArray = gameProgress[`level${levelNum}`] || [];
      const levelStats = gameProgress[`level${levelNum}Stats`] || {};
      // If level has no cards or no stats, it's incomplete
      if (levelArray.length === 0 || !levelStats.completedAt) {
        return levelNum;
      }
    }
    // If all levels are completed, return null
    return null;
  };
  
  const resumeLevel = getResumeLevel();
  
  // Check if user is a demo user - hide Resume Game button and game progress for demo users
  // BUT: If demo user has made a purchase (has paid transaction), show everything (they're now a purchased user)
  const isDemoUser = (() => {
    // CRITICAL: First check if user has paid transactions in transaction table
    // If user has paid transactions, they're NOT a demo user (even if they were before)
    // This is the PRIMARY check - if they purchased, they're a purchased user
    if (transactions && transactions.length > 0) {
      const hasPaidTransactions = transactions.some(t => t.status === 'paid');
      if (hasPaidTransactions) {
        console.log('✅ User has paid transactions - NOT a demo user, showing game progress and Resume Game button');
        return false; // Has paid transactions = purchased user, show everything
      }
    }
    
    // If no paid transactions, check if they're a demo user
    // Method 1: Check backend gameProgress data for isDemo flag
    if (gameProgress && gameProgress.isDemo === true) {
      console.log('⚠️ User has isDemo=true in gameProgress and no paid transactions - hiding game progress and Resume Game button');
      return true; // Demo user with no purchase, hide everything
    }
    
    // Method 2: Check sessionStorage for demo code
    if (typeof window !== 'undefined') {
      const codeType = sessionStorage.getItem('codeType');
      if (codeType === 'trial') {
        const trialDataStr = sessionStorage.getItem('trialData');
        if (trialDataStr) {
          try {
            const trialData = JSON.parse(trialDataStr);
            // Check if it's a demo (has targetAudience or isDemo flag)
            if (trialData.isDemo === true || trialData.targetAudience) {
              // Double-check: if they have paid transactions, they're not a demo
              if (transactions && transactions.length > 0) {
                const hasPaidTransactions = transactions.some(t => t.status === 'paid');
                if (hasPaidTransactions) {
                  return false; // Has paid, show everything
                }
              }
              console.log('⚠️ User has demo code in sessionStorage and no paid transactions - hiding game progress and Resume Game button');
              return true; // Still a demo user, hide everything
            }
          } catch (e) {
            // If parsing fails, continue to other checks
          }
        }
      }
    }
    
    // If gameProgress.isDemo is false or undefined, and no paid transactions
    // Default: If we can't confirm it's a demo user, show everything
    // (This is safer - only hide if we're certain it's a demo)
    return false;
  })();

  return (
    <>
      <Header />
      <Box
        component="main"
        sx={{
          pt: { xs: 20, md: 20 },
          minHeight: '80vh',
          backgroundColor: '#F5F8FB',
          py: 10,
        }}
      >
        <Container maxWidth="xl">
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: '#063C5E',
              mb: 4,
            }}
          >
            Dashboard
          </Typography>

          <Grid container spacing={3} sx={{ alignItems: 'stretch' }}>
            {/* Profile Card */}
            <Grid item xs={12} md={4}>
              <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)', borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar
                      src={getProfilePhotoUrl(user.profilePhoto)}
                      sx={{
                        width: 80,
                        height: 80,
                        bgcolor: '#0B7897',
                        fontSize: '2rem',
                        mr: 2,
                      }}
                    >
                      {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#063C5E' }}>
                        {user.name || 'User'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {user.email}
                      </Typography>
                    </Box>
                  </Box>

                  <Stack spacing={2} sx={{ flexGrow: 1, justifyContent: 'space-between' }}>
                    <Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Account Status
                        </Typography>
                        <Chip
                          label={user.isActive ? 'Active' : 'Disabled'}
                          color={user.isActive ? 'success' : 'default'}
                          size="small"
                          sx={{ mt: 0.5  , ml:2 }}
                        />
                      </Box>
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          Member Since
                        </Typography>
                        <Typography variant="body2">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                      {user.lastLogin && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            Last Login
                          </Typography>
                          <Typography variant="body2">
                            {new Date(user.lastLogin).toLocaleDateString()}
                          </Typography>
                        </Box>
                      )}
                      {user.referralCode && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            Your Referral Link
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontWeight: 500, 
                                fontSize: '0.85rem',
                                wordBreak: 'break-all',
                                flex: 1,
                                color: '#0B7897'
                              }}
                            >
                              {typeof window !== 'undefined' ? `${window.location.origin}/register?ref=${user.referralCode}` : ''}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => {
                                const referralLink = `${window.location.origin}/register?ref=${user.referralCode}`;
                                navigator.clipboard.writeText(referralLink);
                                setSnackbar({
                                  open: true,
                                  message: 'Referral link copied!',
                                  severity: 'success'
                                });
                              }}
                              sx={{ color: '#0B7897' }}
                            >
                              <ContentCopyIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      )}
                    </Box>

                    <Box>
                      <Divider sx={{ my: 1 }} />

                      {/* Resume Game Button - Show if user has incomplete progress (only for purchased users, not demo users) */}
                      {hasIncompleteProgress && resumeLevel && !isDemoUser && (
                        <Button
                          variant="contained"
                          fullWidth
                          onClick={() => router.push(`/play?resume=${resumeLevel}`)}
                          sx={{
                            backgroundColor: '#0B7897',
                            color: '#fff',
                            mb: 1,
                            '&:hover': {
                              backgroundColor: '#085f76',
                            },
                          }}
                        >
                          Resume Game
                        </Button>
                      )}

                      {/* Replay Game - Play again without using another seat (same seat, no extra count) */}
                      {gameProgress && gameProgress.totalLevelsPlayed >= 3 && (hasPaidTransactions || gameProgress.isDemo === false) && (
                        <Button
                          variant="outlined"
                          fullWidth
                          onClick={() => router.push('/play?replay=1')}
                          sx={{
                            borderColor: '#0B7897',
                            color: '#0B7897',
                            mb: 1,
                            '&:hover': {
                              borderColor: '#085f76',
                              backgroundColor: 'rgba(11, 120, 151, 0.08)',
                            },
                          }}
                        >
                          Replay Game
                        </Button>
                      )}

                      <Button
                        variant="outlined"
                        fullWidth
                        onClick={handleEditProfile}
                        sx={{ borderColor: '#0B7897', color: '#0B7897', mb: 1 }}
                      >
                        Edit Profile
                      </Button>
                      <Button
                        variant="outlined"
                        fullWidth
                        onClick={handleToggleAccount}
                        sx={{
                          borderColor: user.isActive ? '#d32f2f' : '#0B7897',
                          color: user.isActive ? '#d32f2f' : '#0B7897',
                        }}
                      >
                        {user.isActive ? 'Disable Account' : 'Enable Account'}
                      </Button>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Membership - Only show for B2C users, hide Active Packages */}
            {allMemberships && allMemberships.length > 0 && (
              <Grid item xs={12} md={8}>
                <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)', borderRadius: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#063C5E', mb: 2 }}>
                      Membership {allMemberships.length > 0 && `(${allMemberships.length})`}
                    </Typography>
                    <Grid container spacing={2}>
                      {allMemberships.map((mem) => {
                        // Find related transaction for seats information
                        const memPackageId = mem.packageId || mem.package?._id || mem.package?.id;
                        const memPackageName = mem.package?.name;
                        
                        const relatedTransaction = transactions?.find(tx => {
                          const txPackageId = tx.packageId;
                          const txPackageName = tx.packageName;
                          
                          // Match by package ID or package name
                          if (memPackageId && txPackageId) {
                            const memPkgIdStr = typeof memPackageId === 'object' ? (memPackageId._id || memPackageId.toString()) : memPackageId.toString();
                            const txPkgIdStr = typeof txPackageId === 'object' ? (txPackageId._id || txPackageId.toString()) : txPackageId.toString();
                            if (memPkgIdStr === txPkgIdStr) return true;
                          }
                          
                          // Match by package name
                          if (memPackageName && txPackageName && memPackageName === txPackageName) {
                            return true;
                          }
                          
                          return false;
                        });

                        const maxSeats = relatedTransaction?.maxSeats || 1;
                        const usedSeats = relatedTransaction?.usedSeats || 0;
                        const remainingSeats = maxSeats - usedSeats;
                        const uniqueCode = relatedTransaction?.uniqueCode || null;

                        return (
                          <Grid item xs={12} sm={6} lg={4} key={mem.id}>
                            <Box
                              sx={{
                                p: 2,
                                backgroundColor: '#F5F8FB',
                                borderRadius: 2,
                                border: '1px solid #E0E7F0',
                                height: '100%',
                              }}
                            >
                              <Stack direction="row" spacing={2} alignItems="center" mb={1} flexWrap="wrap">
                                <Chip
                                  label={mem.type?.toUpperCase() || 'B2C'}
                                  color="primary"
                                  sx={{ fontWeight: 600 }}
                                  size="small"
                                />
                                <Chip
                                  label={mem.status}
                                  color={mem.status === 'active' ? 'success' : 'default'}
                                  size="small"
                                />
                              </Stack>
                              <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontWeight: 500 }}>
                                {mem.package?.name || 'N/A'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                Started: {new Date(mem.startDate).toLocaleDateString()}
                              </Typography>
                              {mem.endDate && (
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                  Expires: {new Date(mem.endDate).toLocaleDateString()}
                                </Typography>
                              )}

                              {/* Unique Code for Game Play */}
                              {uniqueCode && (
                                <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #E0E7F0' }}>
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}>
                                    Game Play Unique Code
                                  </Typography>
                                  <Box
                                    sx={{
                                      p: 1.5,
                                      bgcolor: '#fff',
                                      borderRadius: 1,
                                      border: '1px solid #E0E7F0',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                    }}
                                  >
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        fontFamily: 'monospace',
                                        fontWeight: 600,
                                        color: '#063C5E',
                                        letterSpacing: 0.5,
                                        fontSize: '0.85rem',
                                      }}
                                    >
                                      {uniqueCode}
                                    </Typography>
                                    <IconButton
                                      size="small"
                                      onClick={() => {
                                        navigator.clipboard.writeText(uniqueCode);
                                        setSnackbar({
                                          open: true,
                                          message: 'Code copied to clipboard!',
                                          severity: 'success'
                                        });
                                      }}
                                      sx={{ ml: 1, color: '#0B7897' }}
                                    >
                                      <ContentCopyIcon sx={{ fontSize: 16 }} />
                                    </IconButton>
                                  </Box>
                                </Box>
                              )}

                              {/* Seats Information */}
                              <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #E0E7F0' }}>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 600 }}>
                                  Seats Information
                                </Typography>
                                <Grid container spacing={1}>
                                  <Grid item xs={4}>
                                    <Box sx={{ textAlign: 'center', p: 1, bgcolor: '#fff', borderRadius: 1 }}>
                                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem' }}>
                                        Total
                                      </Typography>
                                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#063C5E' }}>
                                        {maxSeats}
                                      </Typography>
                                    </Box>
                                  </Grid>
                                  <Grid item xs={4}>
                                    <Box sx={{ textAlign: 'center', p: 1, bgcolor: '#fff', borderRadius: 1 }}>
                                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem' }}>
                                        Used
                                      </Typography>
                                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#F59E0B' }}>
                                        {usedSeats}
                                      </Typography>
                                    </Box>
                                  </Grid>
                                  <Grid item xs={4}>
                                    <Box sx={{ textAlign: 'center', p: 1, bgcolor: '#fff', borderRadius: 1 }}>
                                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem' }}>
                                        Remaining
                                      </Typography>
                                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#10B981' }}>
                                        {remainingSeats}
                                      </Typography>
                                    </Box>
                                  </Grid>
                                </Grid>
                              </Box>
                              
                              {/* Game Progress for this Membership - Hide for demo users UNLESS they have paid transactions */}
                              {mem.gameProgress && mem.gameProgress.totalLevelsPlayed > 0 && (hasPaidTransactions || mem.gameProgress.isDemo === false) && (
                                <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #E0E7F0' }}>
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}>
                                    Game Progress
                                  </Typography>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography variant="caption" color="text.secondary">
                                      Score
                                    </Typography>
                                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                      {mem.gameProgress.percentageScore}%
                                    </Typography>
                                  </Box>
                                  <LinearProgress
                                    variant="determinate"
                                    value={mem.gameProgress.percentageScore}
                                    sx={{
                                      height: 6,
                                      borderRadius: 3,
                                      backgroundColor: '#E0E7F0',
                                      mb: 0.5,
                                      '& .MuiLinearProgress-bar': {
                                        backgroundColor: '#0B7897',
                                      },
                                    }}
                                  />
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.7rem' }}>
                                    {mem.gameProgress.totalLevelsPlayed} environment(s) • {mem.gameProgress.correctAnswers}/{mem.gameProgress.totalQuestions} correct
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Main Content Area with Tabs */}
            {(hasProgress || hasTransactions) && (
              <Grid item xs={12}>
                <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)', borderRadius: 3 }}>
                  <CardContent sx={{ p: 0 }}>
                    <Box
                      sx={{
                        position: 'relative',
                        borderBottom: 1,
                        borderColor: 'divider',
                      }}
                    >
                      {/* Left Arrow - Show on small screens when scrollable */}
                      {tabsScrollLeft > 0 && (
                        <IconButton
                          onClick={() => {
                            if (tabsRef.current) {
                              tabsRef.current.scrollBy({ left: -200, behavior: 'smooth' });
                            }
                          }}
                          sx={{
                            position: 'absolute',
                            left: 0,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            zIndex: 2,
                            backgroundColor: 'white',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                            display: { xs: 'flex', md: 'none' },
                            '&:hover': {
                              backgroundColor: '#F5F8FB',
                            },
                          }}
                        >
                          <ChevronLeftIcon />
                        </IconButton>
                      )}
                      
                      {/* Right Arrow - Show on small screens when scrollable */}
                      {tabsScrollRight && (
                        <IconButton
                          onClick={() => {
                            if (tabsRef.current) {
                              tabsRef.current.scrollBy({ left: 200, behavior: 'smooth' });
                            }
                          }}
                          sx={{
                            position: 'absolute',
                            right: 0,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            zIndex: 2,
                            backgroundColor: 'white',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                            display: { xs: 'flex', md: 'none' },
                            '&:hover': {
                              backgroundColor: '#F5F8FB',
                            },
                          }}
                        >
                          <ChevronRightIcon />
                        </IconButton>
                      )}

                      <Box
                        ref={tabsRef}
                        onScroll={(e) => {
                          const element = e.target;
                          setTabsScrollLeft(element.scrollLeft);
                          setTabsScrollRight(
                            element.scrollLeft < element.scrollWidth - element.clientWidth - 1
                          );
                        }}
                        sx={{
                          overflowX: 'auto',
                          overflowY: 'hidden',
                          scrollbarWidth: 'none',
                          msOverflowStyle: 'none',
                          '&::-webkit-scrollbar': {
                            display: 'none',
                          },
                          '& .MuiTabs-scroller': {
                            overflowX: 'auto',
                          },
                        }}
                      >
                        <Tabs
                          value={selectedTab}
                          onChange={(e, newValue) => setSelectedTab(newValue)}
                          variant="scrollable"
                          scrollButtons={false}
                          sx={{
                            px: 3,
                            '& .MuiTab-root': {
                              textTransform: 'none',
                              fontWeight: 600,
                              fontSize: '1rem',
                              minHeight: 64,
                            },
                          }}
                        >
                          {hasProgress && (
                            <Tab label="Progress Tracking" />
                          )}
                          {hasTransactions && (
                            <Tab label="Purchase History" />
                          )}
                          {hasShopPagePurchases && (
                            <Tab label="Package Info" />
                          )}
                        </Tabs>
                      </Box>
                    </Box>

                    {/* Progress Tracking Tab */}
                    {hasProgress && selectedTab === 0 && (
                      <Box sx={{ p: 3 }}>
                        {/* Overall Game Progress - Hide for demo users UNLESS they have paid transactions */}
                        {gameProgress && gameProgress.totalLevelsPlayed > 0 && (hasPaidTransactions || gameProgress.isDemo === false) && (
                          <Box sx={{ mb: 4 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                              <Typography variant="h6" sx={{ fontWeight: 700, color: '#063C5E' }}>
                                Game Progress
                              </Typography>
                              {/* Resume Game Button - Only for purchased users, not demo users */}
                              {hasIncompleteProgress && resumeLevel && !isDemoUser && (
                                <Button
                                  variant="contained"
                                  onClick={() => router.push(`/play?resume=${resumeLevel}`)}
                                  sx={{
                                    backgroundColor: '#0B7897',
                                    color: '#fff',
                                    mr: 1,
                                    '&:hover': {
                                      backgroundColor: '#085f76',
                                    },
                                  }}
                                >
                                  Resume Game
                                </Button>
                              )}
                              {/* Replay Game - Play again without using another seat */}
                              {gameProgress && gameProgress.totalLevelsPlayed >= 3 && (hasPaidTransactions || gameProgress.isDemo === false) && (
                                <Button
                                  variant="outlined"
                                  onClick={() => router.push('/play?replay=1')}
                                  sx={{
                                    borderColor: '#0B7897',
                                    color: '#0B7897',
                                    '&:hover': {
                                      borderColor: '#085f76',
                                      backgroundColor: 'rgba(11, 120, 151, 0.08)',
                                    },
                                  }}
                                >
                                  Replay Game
                                </Button>
                              )}
                            </Box>
                            <Box sx={{ mb: 3 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2" color="text.secondary">
                                  Overall Game Score
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {gameProgress.overallPercentage}%
                                </Typography>
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={gameProgress.overallPercentage}
                                sx={{
                                  height: 10,
                                  borderRadius: 5,
                                  backgroundColor: '#E0E7F0',
                                  '& .MuiLinearProgress-bar': {
                                    backgroundColor: '#0B7897',
                                  },
                                }}
                              />
                              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                Score: {gameProgress.overallScore} / {gameProgress.overallMaxScore} 
                                ({gameProgress.cards?.reduce((sum, c) => sum + c.correctAnswers, 0) || 0} correct answers out of {gameProgress.cards?.reduce((sum, c) => sum + c.totalQuestions, 0) || 0} questions)
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                Total Environments Played: {gameProgress.totalLevelsPlayed}
                              </Typography>
                            </Box>

                            {/* Level Tabs */}
                            {(() => {
                              // Check if we have level data (level1, level2, level3)
                              const hasLevelData = [1, 2, 3].some(levelNum => {
                                const levelArray = gameProgress[`level${levelNum}`] || [];
                                return levelArray.length > 0;
                              });

                              if (!hasLevelData && gameProgress.cards && gameProgress.cards.length > 0) {
                                // Fallback to old structure (cards grouped by card)
                                return (
                                  <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #E0E7F0', borderRadius: 2 }}>
                                    <Table>
                                      <TableHead>
                                        <TableRow sx={{ backgroundColor: '#F5F8FB' }}>
                                          <TableCell sx={{ fontWeight: 600 }}>Card Title</TableCell>
                                          <TableCell sx={{ fontWeight: 600 }}>Card Score</TableCell>
                                          <TableCell sx={{ fontWeight: 600 }}>Correct Answers</TableCell>
                                          <TableCell sx={{ fontWeight: 600 }}>Environments</TableCell>
                                        </TableRow>
                                      </TableHead>
                                      <TableBody>
                                        {gameProgress.cards.map((card, idx) => (
                                          <TableRow key={idx}>
                                            <TableCell>
                                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                {card.cardTitle}
                                              </Typography>
                                            </TableCell>
                                            <TableCell>
                                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <LinearProgress
                                                  variant="determinate"
                                                  value={card.percentageScore}
                                                  sx={{
                                                    width: 80,
                                                    height: 8,
                                                    borderRadius: 4,
                                                    backgroundColor: '#E0E7F0',
                                                    '& .MuiLinearProgress-bar': {
                                                      backgroundColor: '#FFD700',
                                                    },
                                                  }}
                                                />
                                                <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 40 }}>
                                                  {card.percentageScore}%
                                                </Typography>
                                              </Box>
                                            </TableCell>
                                            <TableCell>
                                              <Typography variant="body2">
                                                {card.correctAnswers} / {card.totalQuestions}
                                              </Typography>
                                            </TableCell>
                                            <TableCell>
                                              <Stack spacing={0.5}>
                                                  {card.levels && card.levels.length > 0 ? (
                                                  card.levels.map((level, levelIdx) => (
                                                    <Box key={levelIdx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                      <Chip
                                                        label={`E${level.levelNumber}: ${level.score}/${level.maxScore} (${level.correctAnswers}/${level.totalQuestions})`}
                                                        size="small"
                                                        sx={{
                                                          backgroundColor: (level.percentageScore || (level.maxScore > 0 ? Math.round((level.score / level.maxScore) * 100) : 0)) >= 50 ? '#E8F5E9' : '#FFF3E0',
                                                          color: (level.percentageScore || (level.maxScore > 0 ? Math.round((level.score / level.maxScore) * 100) : 0)) >= 50 ? '#2E7D32' : '#E65100',
                                                          fontWeight: 600,
                                                          fontSize: '0.7rem',
                                                        }}
                                                      />
                                                      {level.completedAt && (
                                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                                                          {new Date(level.completedAt).toLocaleDateString()}
                                                        </Typography>
                                                      )}
                                                    </Box>
                                                  ))
                                                ) : (
                                                  <Typography variant="caption" color="text.secondary">
                                                    No environments played
                                                  </Typography>
                                                )}
                                              </Stack>
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </TableContainer>
                                );
                              }

                              // New structure: Level tabs
                              const availableLevels = [1, 2, 3].filter(levelNum => {
                                const levelArray = gameProgress[`level${levelNum}`] || [];
                                return levelArray.length > 0;
                              });

                              if (availableLevels.length === 0) {
                                return (
                                  <Alert severity="info">
                                    No game progress found.
                                  </Alert>
                                );
                              }

                              return (
                                <Box>
                                  <Tabs
                                    value={selectedLevelTab}
                                    onChange={(e, newValue) => setSelectedLevelTab(newValue)}
                                    sx={{
                                      borderBottom: 1,
                                      borderColor: 'divider',
                                      mb: 2,
                                      '& .MuiTab-root': {
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        fontSize: '1rem',
                                        minHeight: 48,
                                      },
                                    }}
                                  >
                                    {availableLevels.map((levelNum) => {
                                      const levelStats = gameProgress[`level${levelNum}Stats`] || {};
                                      const levelTotalScore = levelStats.totalScore || 0;
                                      const levelMaxScore = levelStats.maxScore || 0;
                                      const levelCorrectAnswers = levelStats.correctAnswers || 0;
                                      const levelTotalQuestions = levelStats.totalQuestions || 0;
                                      const levelPercentage = levelMaxScore > 0 ? Math.round((levelTotalScore / levelMaxScore) * 100) : 0;

                                      return (
                                        <Tab
                                          key={levelNum}
                                          label={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                Environment {levelNum}
                                              </Typography>
                                              <Chip
                                                label={`${levelPercentage}%`}
                                                size="small"
                                                color={levelPercentage >= 80 ? 'success' : levelPercentage >= 50 ? 'warning' : 'error'}
                                                sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                                              />
                                            </Box>
                                          }
                                        />
                                      );
                                    })}
                                  </Tabs>

                                  {availableLevels.map((levelNum, tabIndex) => {
                                    if (selectedLevelTab !== tabIndex) return null;

                                    const levelArray = gameProgress[`level${levelNum}`] || [];
                                    const levelStats = gameProgress[`level${levelNum}Stats`] || {};

                                    const levelTotalScore = levelStats.totalScore || 0;
                                    const levelMaxScore = levelStats.maxScore || 0;
                                    const levelCorrectAnswers = levelStats.correctAnswers || 0;
                                    const levelTotalQuestions = levelStats.totalQuestions || 0;
                                    const levelPercentage = levelMaxScore > 0 ? Math.round((levelTotalScore / levelMaxScore) * 100) : 0;

                                    return (
                                      <Box key={levelNum}>
                                        {/* Level Summary */}
                                        <Box sx={{ mb: 2, p: 2, bgcolor: '#F5F8FB', borderRadius: 2 }}>
                                          <Grid container spacing={2}>
                                            <Grid item xs={12} sm={4}>
                                              <Box sx={{ textAlign: 'center' }}>
                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                                  Score
                                                </Typography>
                                                <Typography variant="h6" sx={{ fontWeight: 700, color: '#063C5E' }}>
                                                  {levelTotalScore} / {levelMaxScore}
                                                </Typography>
                                              </Box>
                                            </Grid>
                                            <Grid item xs={12} sm={4}>
                                              <Box sx={{ textAlign: 'center' }}>
                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                                  Correct Answers
                                                </Typography>
                                                <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                                                  {levelCorrectAnswers} / {levelTotalQuestions}
                                                </Typography>
                                              </Box>
                                            </Grid>
                                            <Grid item xs={12} sm={4}>
                                              <Box sx={{ textAlign: 'center' }}>
                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                                  Percentage
                                                </Typography>
                                                <Chip
                                                  label={`${levelPercentage}%`}
                                                  color={levelPercentage >= 80 ? 'success' : levelPercentage >= 50 ? 'warning' : 'error'}
                                                  sx={{ fontWeight: 700 }}
                                                />
                                              </Box>
                                            </Grid>
                                          </Grid>
                                        </Box>

                                        {/* Cards Table */}
                                        {!levelArray || levelArray.length === 0 ? (
                                    <Alert severity="info">
                                            No cards played in Environment {levelNum} yet.
                                          </Alert>
                                        ) : (
                                          <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #E0E7F0', borderRadius: 2 }}>
                                            <Table>
                                              <TableHead>
                                                <TableRow sx={{ backgroundColor: '#F5F8FB' }}>
                                                  <TableCell sx={{ fontWeight: 600 }}>Card Title</TableCell>
                                                  <TableCell sx={{ fontWeight: 600 }}>Score</TableCell>
                                                  <TableCell sx={{ fontWeight: 600 }}>Correct Answers</TableCell>
                                                  <TableCell sx={{ fontWeight: 600 }}>Percentage</TableCell>
                                                  <TableCell sx={{ fontWeight: 600 }}>Completed Time</TableCell>
                                                </TableRow>
                                              </TableHead>
                                              <TableBody>
                                                {levelArray.map((card, cardIndex) => {
                                                  // Handle card data structure - cardId might be populated or just an ID
                                                  const cardTitle = card.cardTitle || 
                                                                    (card.cardId && typeof card.cardId === 'object' ? card.cardId.title : null) || 
                                                                    'Unknown Card';
                                                  const cardScore = card.cardTotalScore || 0;
                                                  const cardMaxScore = card.cardMaxScore || 0;
                                                  const cardCorrect = card.cardCorrectAnswers || 0;
                                                  const cardTotal = card.cardTotalQuestions || 0;
                                                  const cardPercentage = card.cardPercentageScore !== undefined && card.cardPercentageScore !== null 
                                                    ? card.cardPercentageScore 
                                                    : (cardMaxScore > 0 ? Math.round((cardScore / cardMaxScore) * 100) : 0);
                                                  const completedAt = levelStats.completedAt || card.completedAt;

                                                  return (
                                                    <TableRow
                                                      key={cardIndex}
                                                      sx={{
                                                        '&:hover': {
                                                          backgroundColor: '#FAFAFA',
                                                        }
                                                      }}
                                                    >
                                                      <TableCell>
                                                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#063C5E' }}>
                                                          {cardTitle}
                                                        </Typography>
                                                      </TableCell>
                                                      <TableCell>
                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                          {cardScore} / {cardMaxScore}
                                                        </Typography>
                                                      </TableCell>
                                                      <TableCell>
                                                        <Typography variant="body2" sx={{ fontWeight: 500, color: cardCorrect > 0 ? 'success.main' : 'text.primary' }}>
                                                          {cardCorrect} / {cardTotal}
                                                        </Typography>
                                                      </TableCell>
                                                      <TableCell>
                                                        <Chip
                                                          label={`${cardPercentage}%`}
                                                          size="small"
                                                          color={cardPercentage >= 80 ? 'success' : cardPercentage >= 50 ? 'warning' : 'error'}
                                                          sx={{ fontWeight: 600 }}
                                                        />
                                                      </TableCell>
                                                      <TableCell>
                                                        <Typography variant="body2" color="text.secondary">
                                                          {completedAt
                                                            ? new Date(completedAt).toLocaleString()
                                                            : 'N/A'}
                                                        </Typography>
                                                      </TableCell>
                                                    </TableRow>
                                                  );
                                                })}
                                              </TableBody>
                                            </Table>
                                          </TableContainer>
                                        )}
                                      </Box>
                                    );
                                  })}
                                </Box>
                              );
                            })()}
                          </Box>
                        )}

                        {/* Card Progress Section */}
                        {progress && progress.totalCards > 0 && (
                          <Box sx={{ mb: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#063C5E', mb: 2 }}>
                              Card Progress
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body2" color="text.secondary">
                                Overall Card Progress
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {progress.totalProgress}%
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={progress.totalProgress}
                              sx={{
                                height: 10,
                                borderRadius: 5,
                                backgroundColor: '#E0E7F0',
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: '#0B7897',
                                },
                              }}
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                              {progress.completedCards} of {progress.totalCards} cards completed
                            </Typography>
                          </Box>
                        )}

                        {/* Package Progress */}
                        {progress && progress.packageProgress && progress.packageProgress.length > 0 && (
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#063C5E', mb: 2 }}>
                              Package Progress
                            </Typography>
                            <Stack spacing={2}>
                              {progress.packageProgress.map((pkg, idx) => (
                                <Box key={idx}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography variant="body2">{pkg.packageName}</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                      {pkg.completionPercentage}%
                                    </Typography>
                                  </Box>
                                  <LinearProgress
                                    variant="determinate"
                                    value={pkg.completionPercentage}
                                    sx={{
                                      height: 8,
                                      borderRadius: 4,
                                      backgroundColor: '#E0E7F0',
                                      '& .MuiLinearProgress-bar': {
                                        backgroundColor: '#FFD700',
                                      },
                                    }}
                                  />
                                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                    {pkg.completedCards} of {pkg.totalCards} cards completed
                                  </Typography>
                                </Box>
                              ))}
                            </Stack>
                          </Box>
                        )}
                      </Box>
                    )}

                    {/* Purchase History Tab */}
                    {hasTransactions && selectedTab === (hasProgress ? 1 : 0) && !hasShopPagePurchases && (
                      <Box sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#063C5E', mb: 2 }}>
                          Purchase History
                        </Typography>
                        <TableContainer 
                          sx={{ 
                            maxHeight: transactions.length > 5 ? '600px' : 'auto',
                            border: '1px solid #E0E7F0',
                            borderRadius: 2,
                          }}
                        >
                          <Table stickyHeader>
                            <TableHead>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 600, backgroundColor: '#F5F8FB' }}>Date</TableCell>
                                <TableCell sx={{ fontWeight: 600, backgroundColor: '#F5F8FB' }}>Package</TableCell>
                                <TableCell sx={{ fontWeight: 600, backgroundColor: '#F5F8FB' }}>Type</TableCell>
                                <TableCell sx={{ fontWeight: 600, backgroundColor: '#F5F8FB' }}>Amount</TableCell>
                                <TableCell sx={{ fontWeight: 600, backgroundColor: '#F5F8FB' }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 600, backgroundColor: '#F5F8FB' }}>Payment ID</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {transactions.map((tx) => (
                                <TableRow key={tx.id} hover>
                                  <TableCell>
                                    {new Date(tx.createdAt).toLocaleDateString()}
                                  </TableCell>
                                  <TableCell>
                                    {tx.packageId ? tx.packageName : (tx.packageType ? tx.packageType.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : tx.packageName)}
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      label={tx.type.replace('_', ' ').toUpperCase()}
                                      size="small"
                                      sx={{ textTransform: 'capitalize' }}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    ${tx.amount.toFixed(2)}
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      label={tx.status}
                                      color={
                                        tx.status === 'paid'
                                          ? 'success'
                                          : tx.status === 'pending'
                                          ? 'warning'
                                          : 'default'
                                      }
                                      size="small"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                                      {tx.stripePaymentIntentId || tx.paymentIntentId || 'N/A'}
                                    </Typography>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    )}
                    {hasTransactions && selectedTab === (hasProgress ? 1 : 0) && hasShopPagePurchases && (
                      <Box sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#063C5E', mb: 2 }}>
                          Purchase History
                        </Typography>
                        <TableContainer 
                          sx={{ 
                            maxHeight: transactions.length > 5 ? '600px' : 'auto',
                            border: '1px solid #E0E7F0',
                            borderRadius: 2,
                          }}
                        >
                          <Table stickyHeader>
                            <TableHead>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 600, backgroundColor: '#F5F8FB' }}>Date</TableCell>
                                <TableCell sx={{ fontWeight: 600, backgroundColor: '#F5F8FB' }}>Package</TableCell>
                                <TableCell sx={{ fontWeight: 600, backgroundColor: '#F5F8FB' }}>Type</TableCell>
                                <TableCell sx={{ fontWeight: 600, backgroundColor: '#F5F8FB' }}>Amount</TableCell>
                                <TableCell sx={{ fontWeight: 600, backgroundColor: '#F5F8FB' }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 600, backgroundColor: '#F5F8FB' }}>Payment ID</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {transactions.map((tx) => (
                                <TableRow key={tx.id} hover>
                                  <TableCell>
                                    {new Date(tx.createdAt).toLocaleDateString()}
                                  </TableCell>
                                  <TableCell>
                                    {tx.packageId ? tx.packageName : (tx.packageType ? tx.packageType.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : tx.packageName)}
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      label={tx.type.replace('_', ' ').toUpperCase()}
                                      size="small"
                                      sx={{ textTransform: 'capitalize' }}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    ${tx.amount.toFixed(2)}
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      label={tx.status}
                                      color={
                                        tx.status === 'paid'
                                          ? 'success'
                                          : tx.status === 'pending'
                                          ? 'warning'
                                          : 'default'
                                      }
                                      size="small"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                                      {tx.stripePaymentIntentId || tx.paymentIntentId || 'N/A'}
                                    </Typography>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    )}

                    {/* Package Info Tab - Shop Page Purchases */}
                    {hasShopPagePurchases && selectedTab === (hasProgress ? (hasTransactions ? 2 : 1) : (hasTransactions ? 1 : 0)) && (
                      <Box sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#063C5E', mb: 2 }}>
                          Package Information
                        </Typography>
                        <Grid container spacing={3}>
                          {shopPagePurchases.map((tx) => (
                            <Grid item xs={12} md={6} key={tx.id}>
                              <Card
                                sx={{
                                  height: '100%',
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                  borderRadius: 2,
                                  border: '1px solid #E0E7F0',
                                  '&:hover': {
                                    boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                                  },
                                }}
                              >
                                <CardContent>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                    <Box>
                                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#063C5E', mb: 0.5 }}>
                                        {tx.packageType ? tx.packageType.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'Package'}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        Purchased: {new Date(tx.createdAt).toLocaleDateString()}
                                      </Typography>
                                    </Box>
                                    <Chip
                                      label={tx.status}
                                      color={tx.status === 'paid' ? 'success' : 'default'}
                                      size="small"
                                    />
                                  </Box>

                                  {/* Unique Code Section */}
                                  {tx.uniqueCode && (
                                    <Box
                                      sx={{
                                        p: 2,
                                        backgroundColor: '#F5F8FB',
                                        borderRadius: 2,
                                        mb: 2,
                                        border: '2px dashed #0B7897',
                                      }}
                                    >
                                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                                        Your Unique Code
                                      </Typography>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography
                                          variant="h6"
                                          sx={{
                                            fontWeight: 700,
                                            color: '#0B7897',
                                            fontFamily: 'monospace',
                                            letterSpacing: 1.5,
                                            flexGrow: 1,
                                          }}
                                        >
                                          {tx.uniqueCode}
                                        </Typography>
                                        <IconButton
                                          onClick={async () => {
                                            try {
                                              await navigator.clipboard.writeText(tx.uniqueCode);
                                              setCopiedCode(tx.id);
                                              setTimeout(() => setCopiedCode(null), 2000);
                                            } catch (err) {
                                              console.error('Failed to copy:', err);
                                            }
                                          }}
                                          size="small"
                                          sx={{
                                            color: '#0B7897',
                                            '&:hover': {
                                              backgroundColor: 'rgba(11, 120, 151, 0.1)',
                                            },
                                          }}
                                        >
                                          <ContentCopyIcon sx={{ fontSize: 18 }} />
                                        </IconButton>
                                      </Box>
                                      {copiedCode === tx.id && (
                                        <Alert severity="success" sx={{ mt: 1, py: 0.5 }}>
                                          Code copied to clipboard!
                                        </Alert>
                                      )}
                                    </Box>
                                  )}

                                  {/* Seat Information */}
                                  {tx.maxSeats !== null && tx.maxSeats !== undefined && (
                                    <Box sx={{ mb: 2 }}>
                                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                                        Seat Information
                                      </Typography>
                                      <Box sx={{ display: 'flex', gap: 2 }}>
                                        <Box>
                                          <Typography variant="body2" color="text.secondary">
                                            Total Seats
                                          </Typography>
                                          <Typography variant="h6" sx={{ fontWeight: 700, color: '#063C5E' }}>
                                            {tx.maxSeats}
                                          </Typography>
                                        </Box>
                                        <Box>
                                          <Typography variant="body2" color="text.secondary">
                                            Used Seats
                                          </Typography>
                                          <Typography variant="h6" sx={{ fontWeight: 700, color: '#FF725E' }}>
                                            {tx.usedSeats || 0}
                                          </Typography>
                                        </Box>
                                        <Box>
                                          <Typography variant="body2" color="text.secondary">
                                            Available
                                          </Typography>
                                          <Typography variant="h6" sx={{ fontWeight: 700, color: '#4caf50' }}>
                                            {(tx.maxSeats || 0) - (tx.usedSeats || 0)}
                                          </Typography>
                                        </Box>
                                      </Box>
                                    </Box>
                                  )}

                                  {/* Package Type Info */}
                                  <Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 600 }}>
                                      Package Type
                                    </Typography>
                                    <Chip
                                      label={tx.packageType ? tx.packageType.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'N/A'}
                                      size="small"
                                      sx={{
                                        backgroundColor: '#E3F2FD',
                                        color: '#063C5E',
                                        fontWeight: 600,
                                      }}
                                    />
                                  </Box>
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </Container>
      </Box>

      {/* Edit Profile Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {/* Profile Photo Upload */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Avatar
                src={profilePhotoPreview || getProfilePhotoUrl(dashboardData?.user?.profilePhoto)}
                sx={{
                  width: 100,
                  height: 100,
                  bgcolor: '#0B7897',
                  fontSize: '2.5rem',
                }}
              >
                {editForm.name?.charAt(0)?.toUpperCase() || editForm.email?.charAt(0)?.toUpperCase()}
              </Avatar>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="profile-photo-upload"
                  type="file"
                  onChange={handlePhotoChange}
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <label htmlFor="profile-photo-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<PhotoCameraIcon />}
                      disabled={uploadingPhoto}
                      sx={{
                        borderColor: '#0B7897',
                        color: '#0B7897',
                        '&:hover': {
                          borderColor: '#063C5E',
                          backgroundColor: 'rgba(11, 120, 151, 0.1)',
                        },
                      }}
                    >
                      {uploadingPhoto ? 'Uploading...' : profilePhotoFile ? 'Change Photo' : 'Upload Photo'}
                    </Button>
                  </label>
                  {(profilePhotoPreview || dashboardData?.user?.profilePhoto) && !profilePhotoFile && (
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={handleDeletePhoto}
                      disabled={uploadingPhoto}
                      sx={{
                        '&:hover': {
                          backgroundColor: 'rgba(211, 47, 47, 0.1)',
                        },
                      }}
                    >
                      Delete Photo
                    </Button>
                  )}
                </Box>
                {profilePhotoFile && (
                  <Typography variant="caption" color="text.secondary">
                    {profilePhotoFile.name}
                  </Typography>
                )}
                {uploadingPhoto && (
                  <CircularProgress size={20} sx={{ mt: 1 }} />
                )}
              </Box>
            </Box>

            <Divider />

            <TextField
              fullWidth
              label="Name"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              required
              autoComplete="name"
            />
            
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              required
              autoComplete="email"
              helperText="Changing email will require verification"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setEditDialogOpen(false);
            setProfilePhotoFile(null);
            setProfilePhotoPreview(null);
          }}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveProfile}
            variant="contained"
            disabled={submitting || uploadingPhoto}
            sx={{ backgroundColor: '#0B7897', '&:hover': { backgroundColor: '#063C5E' } }}
          >
            {submitting ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      {snackbar.open && (
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 9999,
          }}
        >
          {snackbar.message}
        </Alert>
      )}

      <Footer />
    </>
  );
}

