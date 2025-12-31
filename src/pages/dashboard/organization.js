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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
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

export default function OrganizationDashboardPage() {
  const router = useRouter();
  const { user: authUser, logout, getAuthToken, requireAuth } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [packageTabs, setPackageTabs] = useState({}); // Store tab state for each package
  const [tabsScrollLeft, setTabsScrollLeft] = useState(0);
  const [tabsScrollRight, setTabsScrollRight] = useState(false);
  const tabsRef = useRef(null);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [orgDialogOpen, setOrgDialogOpen] = useState(false);
  const [orgForm, setOrgForm] = useState({
    name: '',
    type: 'company',
    customType: '',
    segment: 'B2B',
    primaryContact: { name: '', email: '', phone: '', jobTitle: '' }
  });
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [memberRequests, setMemberRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [processingRequest, setProcessingRequest] = useState(null);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [allMembers, setAllMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [memberActivities, setMemberActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '' });
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [packages, setPackages] = useState([]);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [selectedUserForProgress, setSelectedUserForProgress] = useState(null);
  const [selectedUserInfo, setSelectedUserInfo] = useState(null); // Store user name and email
  const [userGameProgress, setUserGameProgress] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [progressDialogOpen, setProgressDialogOpen] = useState(false);
  const [customPackageRequests, setCustomPackageRequests] = useState([]);
  const [loadingCustomRequests, setLoadingCustomRequests] = useState(false);
  const [adminNotesDialogOpen, setAdminNotesDialogOpen] = useState(false);
  const [productDetailsDialogOpen, setProductDetailsDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [availableCustomPackages, setAvailableCustomPackages] = useState([]);
  const [loadingAvailableCustomPackages, setLoadingAvailableCustomPackages] = useState(false);
  const [descriptionDialogOpen, setDescriptionDialogOpen] = useState(false);
  const [selectedPackageDescription, setSelectedPackageDescription] = useState('');
  const [selectedRequestForNotes, setSelectedRequestForNotes] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  // Helper function to map visible tab index to content index
  // Visible tabs structure (after commenting out Student Activities):
  // 0=My Institutes, 1=Students, 2=Member Requests, [3=Packages if visible], [4=Custom Package Requests if visible], [last=Profile]
  // Content indices: 0=My Institutes, 1=Students, 2=Student Activities (commented), 3=Member Requests, 4=Packages, 5=Custom Package Requests, 6=Profile
  const getContentIndex = (visibleTabIndex) => {
    // Tab 0 -> Content 0 (My Institutes)
    if (visibleTabIndex === 0) return 0;
    // Tab 1 -> Content 1 (Students)
    if (visibleTabIndex === 1) return 1;
    // Tab 2 -> Content 3 (Member Requests, skip Student Activities at 2)
    if (visibleTabIndex === 2) return 3;

    // Determine which tabs are visible after Member Requests
    // Packages tab should ALWAYS show (even if no packages purchased yet)
    const packagesVisible = true; // Always show Packages tab
    const customRequestsVisible = customPackageRequests.length > 0;

    // Tab 3: Could be Packages (if visible) or Custom Package Requests (if Packages not visible but Custom Requests visible) or Profile (if neither visible)
    if (visibleTabIndex === 3) {
      if (packagesVisible) return 4; // Packages
      if (customRequestsVisible) return 5; // Custom Package Requests
      return 6; // Profile (neither Packages nor Custom Requests visible)
    }

    // Tab 4: Could be Custom Package Requests (if Packages visible) or Profile (if Packages not visible but Custom Requests visible, or if neither visible)
    if (visibleTabIndex === 4) {
      if (packagesVisible && customRequestsVisible) return 5; // Custom Package Requests (Packages was at 3)
      return 6; // Profile
    }

    // Tab 5+: Profile (content 6) - only reached if both Packages and Custom Package Requests are visible
    return 6;
  };

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
  }, [organizations, memberRequests, packages, customPackageRequests]);

  useEffect(() => {
    if (!authUser && !loading) {
      setLoading(false);
      router.push('/');
      return;
    }
    // Redirect B2C users to regular dashboard
    if (authUser && authUser.role === 'b2c_user') {
      router.push('/dashboard');
      return;
    }
    // Redirect members to their own dashboard
    if (authUser && (authUser.role === 'b2b_member' || authUser.role === 'b2e_member')) {
      router.push('/dashboard/member');
      return;
    }
    if (authUser) {
      fetchDashboardData();
      fetchOrganizations();
      fetchMemberRequests();
      fetchAllMembers();
      fetchMemberActivities();
      fetchPackages();
      fetchAvailableCustomPackages(); // Also fetch available custom packages
      fetchCustomPackageRequests(); // Fetch custom package requests to show tab if user has requests
      fetchTransactions(); // Fetch transactions for display
    }
  }, [authUser]);

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
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const token = getAuthToken();

      // Always fetch the latest user from backend to get reliable role/schoolId/orgId
      const meResponse = await axios.get(`${API_URL}/auth/user/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const currentUser = meResponse.data;

      let data = [];

      // For institute admins, directly fetch their institute by schoolId so it is available immediately after login
      if (currentUser?.role === 'b2e_user' && currentUser.schoolId) {
        try {
          const schoolResponse = await axios.get(`${API_URL}/schools/${currentUser.schoolId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (schoolResponse.data) {
            const schoolData = schoolResponse.data.school || schoolResponse.data;
            data = [schoolData];
          }
        } catch (innerErr) {
          console.error('Error fetching institute for current user:', innerErr);
        }
      } else {
        // For B2B users (and other roles that may own organizations), use the generic user/organizations endpoint
        const response = await axios.get(`${API_URL}/user/organizations`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        data = response.data || [];
      }

      // Format organizations / institutes for display
      // Backend already returns proper membersCount/userCount:
      // - For B2B: User.countDocuments with organizationId and approved status
      // - For B2E: User.countDocuments with schoolId and approved status
      const formattedOrgs = data.map(org => {
        // Use backend's membersCount or userCount, with fallback to members/students array length
        // Backend calculates this properly by counting actual members from User table
        // But also includes members/students array as fallback
        const membersCount = org.membersCount || org.userCount || org.members?.length || org.students?.length || 0;

        // Debug logging
        console.log('Organization data from backend:', {
          name: org.name,
          _id: org._id,
          membersCount: org.membersCount,
          userCount: org.userCount,
          members: org.members,
          students: org.students,
          membersArrayLength: org.members?.length || 0,
          studentsArrayLength: org.students?.length || 0,
          finalCount: membersCount
        });

        return {
          id: org._id || org.id,
          name: org.name,
          type: org.type,
          customType: org.customType,
          uniqueCode: org.uniqueCode,
          segment: org.segment,
          status: org.status,
          description: org.description,
          primaryContact: org.primaryContact,
          customPackagesCount: org.customPackages?.length || org.customPackagesCount || 0,
          userCount: membersCount,
          membersCount: membersCount,
          members: org.members || [], // Include members array
          students: org.students || [], // Include students array
          activeContractsCount: org.activeContractsCount || 0,
          createdAt: org.createdAt
        };
      });
      console.log('Formatted organizations:', formattedOrgs);
      setOrganizations(formattedOrgs);
    } catch (err) {
      console.error('Error fetching organizations:', err);
    }
  };

  const fetchMemberRequests = async () => {
    try {
      setLoadingRequests(true);
      const token = getAuthToken();
      const response = await axios.get(`${API_URL}/auth/member/requests`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Filter out requests where user is null or missing (invalid requests)
      const validRequests = (response.data.requests || []).filter(request =>
        request.user && request.user._id && (request.user.name || request.user.email)
      );

      setMemberRequests(validRequests);
    } catch (err) {
      console.error('Error fetching member requests:', err);
      setMemberRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleApproveRequest = async (requestId) => {
    try {
      setProcessingRequest(requestId);
      const token = getAuthToken();
      await axios.post(`${API_URL}/auth/member/requests/${requestId}/approve`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSnackbar({
        open: true,
        message: 'Member request approved successfully',
        severity: 'success'
      });
      await fetchMemberRequests();
      await fetchOrganizations();
      await fetchAllMembers();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.error || 'Failed to approve member request',
        severity: 'error'
      });
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      setProcessingRequest(requestId);
      const token = getAuthToken();
      await axios.post(`${API_URL}/auth/member/requests/${requestId}/reject`, { rejectionReason: 'Request rejected by admin' }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSnackbar({
        open: true,
        message: 'Member request rejected',
        severity: 'success'
      });
      await fetchMemberRequests();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.error || 'Failed to reject member request',
        severity: 'error'
      });
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleViewGameProgress = async (userId, userInfo = null) => {
    if (!userId) return;

    try {
      setLoadingProgress(true);

      // Extract string ID from userId (could be object or string)
      let userIdString = userId;
      if (typeof userId === 'object' && userId !== null) {
        userIdString = userId._id || userId.id || userId.toString();
      } else {
        userIdString = userId.toString();
      }

      setSelectedUserForProgress(userIdString);

      // Store user info if provided
      if (userInfo) {
        setSelectedUserInfo({
          name: userInfo.name || userInfo.userId?.name || userInfo.user?.name || 'Unknown User',
          email: userInfo.email || userInfo.userId?.email || userInfo.user?.email || 'N/A'
        });
      } else {
        setSelectedUserInfo(null);
      }

      setProgressDialogOpen(true);

      const token = getAuthToken();
      const response = await axios.get(`${API_URL}/game-progress/user/${userIdString}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // New structure: single document or null
      setUserGameProgress(response.data || null);

      // If user info not provided but available in response
      if (!userInfo && response.data && response.data.userId) {
        if (response.data.userId && typeof response.data.userId === 'object') {
          setSelectedUserInfo({
            name: response.data.userId.name || 'Unknown User',
            email: response.data.userId.email || 'N/A'
          });
        }
      }
    } catch (err) {
      console.error('Error fetching game progress:', err);
      setUserGameProgress(null);
    } finally {
      setLoadingProgress(false);
    }
  };

  const handleTerminateMembership = async (memberId) => {
    try {
      setProcessingRequest(memberId);
      const token = getAuthToken();
      await axios.delete(`${API_URL}/users/${memberId}/membership`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSnackbar({
        open: true,
        message: 'Member membership terminated successfully. The member has been notified via email.',
        severity: 'success'
      });
      // Refresh members list
      await fetchAllMembers();
      // Refresh organizations list to update member count
      await fetchOrganizations();
      // Refresh member activities
      await fetchMemberActivities();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.error || 'Failed to terminate membership. Please try again.',
        severity: 'error'
      });
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleConfirmRemove = () => {
    if (memberToRemove) {
      handleTerminateMembership(memberToRemove);
    }
    setRemoveDialogOpen(false);
    setMemberToRemove(null);
  };

  const fetchTransactions = async () => {
    try {
      setLoadingTransactions(true);
      const token = getAuthToken();

      // Get user's organization/school
      const userResponse = await axios.get(`${API_URL}/auth/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = userResponse.data;

      // Fallback to first organization/school from state if user object does not carry ids
      const fallbackOrgId = !user.organizationId && organizations?.length > 0 ? organizations[0].id : null;
      const activeOrganizationId = user.organizationId || fallbackOrgId;
      const fallbackSchoolId = !user.schoolId && user.segment === 'B2E' && organizations?.length > 0 ? organizations[0].id : null;
      const activeSchoolId = user.schoolId || fallbackSchoolId;

      let allTransactions = [];

      // Try to get transactions from user dashboard first
      try {
        const dashboardResponse = await axios.get(`${API_URL}/user/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (dashboardResponse.data?.transactions && Array.isArray(dashboardResponse.data.transactions)) {
          const userTransactions = dashboardResponse.data.transactions.filter(tx => {
            // IMPORTANT: Always filter by userId first - user can only see their own transactions
            const txUserId = tx.userId?._id || tx.userId;
            const userStr = user._id ? (typeof user._id === 'object' ? user._id.toString() : user._id.toString()) : null;
            const txUserStr = txUserId ? (typeof txUserId === 'object' ? txUserId.toString() : txUserId.toString()) : null;

            // First check: Transaction must belong to logged-in user
            if (userStr !== txUserStr) {
              return false;
            }

            // Second check: Filter transactions that belong to this organization/school (if applicable)
            const txOrgId = tx.organizationId?._id || tx.organizationId || tx.orgId;
            const txSchoolId = tx.schoolId?._id || tx.schoolId;

            if (activeOrganizationId) {
              const orgIdStr = typeof activeOrganizationId === 'object'
                ? (activeOrganizationId._id || activeOrganizationId.id || activeOrganizationId.toString())
                : activeOrganizationId.toString();
              const txOrgIdStr = txOrgId ? (typeof txOrgId === 'object' ? (txOrgId._id || txOrgId.toString()) : txOrgId.toString()) : null;
              // Transaction must belong to user AND match organization (or have no organizationId)
              return txOrgIdStr === orgIdStr || !txOrgId;
            }

            if (activeSchoolId) {
              const schoolIdStr = typeof activeSchoolId === 'object'
                ? (activeSchoolId._id || activeSchoolId.id || activeSchoolId.toString())
                : activeSchoolId.toString();
              const txSchoolIdStr = txSchoolId ? (typeof txSchoolId === 'object' ? (txSchoolId._id || txSchoolId.toString()) : txSchoolId.toString()) : null;
              // Transaction must belong to user AND match school (or have no schoolId)
              return txSchoolIdStr === schoolIdStr || !txSchoolId;
            }

            // If no organization/school filter, just return user's transactions
            return true;
          });

          allTransactions = userTransactions;
        }
      } catch (dashboardErr) {
        console.error('Error fetching transactions from dashboard:', dashboardErr);
      }

      // Also fetch from transactions endpoint
      if (activeOrganizationId || activeSchoolId) {
        try {
          const orgId = activeOrganizationId || activeSchoolId;
          const orgIdStr = typeof orgId === 'object'
            ? (orgId._id || orgId.id || orgId.toString())
            : orgId.toString();

          const transactionsResponse = await axios.get(`${API_URL}/transactions/b2b-b2e`, {
            headers: { Authorization: `Bearer ${token}` },
            params: activeOrganizationId ? { organizationId: orgIdStr } : { schoolId: orgIdStr }
          });

          if (Array.isArray(transactionsResponse.data)) {
            // Filter transactions to ensure they belong to logged-in user
            const userStr = user._id ? (typeof user._id === 'object' ? user._id.toString() : user._id.toString()) : null;
            const userTransactions = transactionsResponse.data.filter(tx => {
              const txUserId = tx.userId?._id || tx.userId;
              const txUserStr = txUserId ? (typeof txUserId === 'object' ? txUserId.toString() : txUserId.toString()) : null;
              return userStr === txUserStr; // Only include transactions that belong to logged-in user
            });

            // Merge with existing transactions, avoiding duplicates
            const existingIds = new Set(allTransactions.map(tx => tx._id || tx.id));
            const newTransactions = userTransactions.filter(tx => {
              const txId = tx._id || tx.id;
              return txId && !existingIds.has(txId);
            });
            allTransactions = [...allTransactions, ...newTransactions];
          }
        } catch (txErr) {
          console.error('Error fetching transactions from endpoint:', txErr);
        }
      }

      // Sort by date (newest first)
      allTransactions.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.created_at || 0);
        const dateB = new Date(b.createdAt || b.created_at || 0);
        return dateB - dateA;
      });

      setTransactions(allTransactions);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setTransactions([]);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const fetchMemberActivities = async () => {
    try {
      setLoadingActivities(true);
      const token = getAuthToken();

      // Get user's organization/school
      const userResponse = await axios.get(`${API_URL}/auth/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = userResponse.data;

      // Fallback to first organization/school from state if user object does not carry ids
      const fallbackOrgId = !user.organizationId && organizations?.length > 0 ? organizations[0].id : null;
      const activeOrganizationId = user.organizationId || fallbackOrgId;
      const fallbackSchoolId = !user.schoolId && user.segment === 'B2E' && organizations?.length > 0 ? organizations[0].id : null;
      const activeSchoolId = user.schoolId || fallbackSchoolId;
      let activities = [];

      // Fetch all members' activities
      if (activeOrganizationId) {
        try {
          // Get all members
          const orgResponse = await axios.get(`${API_URL}/organizations/${activeOrganizationId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (orgResponse.data.orgUsers && orgResponse.data.orgUsers.length > 0) {
            // Fetch activities for each member
            const memberIds = orgResponse.data.orgUsers
              .map(ou => ou.userId?._id || ou.userId)
              .filter(Boolean);

            for (const memberId of memberIds) {
              try {
                // Ensure memberId is a string, not an object
                const id = typeof memberId === 'object' && memberId !== null
                  ? (memberId._id || memberId.id || (memberId.toString && memberId.toString() !== '[object Object]' ? memberId.toString() : null))
                  : memberId;
                const idString = id && typeof id === 'string' ? id.trim() : (id ? String(id).trim() : null);
                if (!idString || idString === '[object Object]' || idString.includes('[object')) {
                  continue;
                }

                // Fetch game progress
                const gameResponse = await axios.get(`${API_URL}/game-progress/user/${idString}`, {
                  headers: { Authorization: `Bearer ${token}` },
                });

                if (gameResponse.data && Array.isArray(gameResponse.data)) {
                  gameResponse.data.forEach(progress => {
                    activities.push({
                      type: 'game',
                      memberId: memberId,
                      memberName: orgResponse.data.orgUsers.find(ou => (ou.userId?._id || ou.userId)?.toString() === memberId.toString())?.userId?.name || 'Member',
                      description: `Played ${progress.gameName || 'game'} - Level ${progress.level || 'N/A'} - Score: ${progress.score || 0}`,
                      timestamp: progress.lastPlayed || progress.createdAt || new Date()
                    });
                  });
                }
              } catch (err) {
                // Ignore individual member errors
              }
            }
          }
        } catch (err) {
          console.error('Error fetching organization member activities:', err);
        }
      }

      if (activeSchoolId) {
        try {
          const schoolResponse = await axios.get(`${API_URL}/schools/${activeSchoolId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          // Get student IDs from school.students array (new structure)
          let studentIds = [];
          if (schoolResponse.data.students && Array.isArray(schoolResponse.data.students)) {
            studentIds = schoolResponse.data.students.map(s => s._id || s);
          }

          // Also check schoolUsers (old structure)
          if (schoolResponse.data.schoolUsers && schoolResponse.data.schoolUsers.length > 0) {
            const userIds = schoolResponse.data.schoolUsers
              .map(su => su.userId?._id || su.userId)
              .filter(Boolean);
            studentIds = [...new Set([...studentIds, ...userIds])];
          }

          // Fetch game progress for all students
          for (const studentId of studentIds) {
            try {
              // Ensure studentId is a string, not an object
              const id = typeof studentId === 'object' && studentId !== null
                ? (studentId._id || studentId.id || (studentId.toString && studentId.toString() !== '[object Object]' ? studentId.toString() : null))
                : studentId;
              const idString = id && typeof id === 'string' ? id.trim() : (id ? String(id).trim() : null);
              if (!idString || idString === '[object Object]' || idString.includes('[object')) {
                continue;
              }

              const gameResponse = await axios.get(`${API_URL}/game-progress/user/${idString}`, {
                headers: { Authorization: `Bearer ${token}` },
              });

              if (gameResponse.data && Array.isArray(gameResponse.data)) {
                gameResponse.data.forEach(progress => {
                  // Find student name
                  let studentName = 'Student';
                  if (schoolResponse.data.students) {
                    const student = schoolResponse.data.students.find(s => (s._id || s)?.toString() === studentId.toString());
                    studentName = student?.name || studentName;
                  }
                  if (schoolResponse.data.schoolUsers) {
                    const schoolUser = schoolResponse.data.schoolUsers.find(su => (su.userId?._id || su.userId)?.toString() === studentId.toString());
                    studentName = schoolUser?.userId?.name || studentName;
                  }

                  activities.push({
                    type: 'game',
                    memberId: studentId,
                    memberName: studentName,
                    description: `Played ${progress.gameName || 'game'} - Level ${progress.level || 'N/A'} - Score: ${progress.score || 0}`,
                    timestamp: progress.lastPlayed || progress.createdAt || new Date()
                  });
                });
              }
            } catch (err) {
              // Ignore individual student errors
            }
          }
        } catch (err) {
          console.error('Error fetching school member activities:', err);
        }
      }

      // Sort by timestamp (newest first)
      activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      setMemberActivities(activities);
    } catch (err) {
      console.error('Error fetching member activities:', err);
      setMemberActivities([]);
    } finally {
      setLoadingActivities(false);
    }
  };

  const fetchAllMembers = async () => {
    try {
      setLoadingMembers(true);
      const token = getAuthToken();

      // Get user's organization/school
      const userResponse = await axios.get(`${API_URL}/auth/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const user = userResponse.data;
      // Fallback to first organization/school from state when ids are not attached to user
      const fallbackOrgId = !user.organizationId && organizations?.length > 0 ? organizations[0].id : null;
      const activeOrganizationId = user.organizationId || fallbackOrgId;
      const fallbackSchoolId = !user.schoolId && user.segment === 'B2E' && organizations?.length > 0 ? organizations[0].id : null;
      const activeSchoolId = user.schoolId || fallbackSchoolId;
      let members = [];

      // Fetch members from organization
      if (activeOrganizationId) {
        try {
          const orgResponse = await axios.get(`${API_URL}/organizations/${activeOrganizationId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (orgResponse.data.orgUsers && orgResponse.data.orgUsers.length > 0) {
            members = orgResponse.data.orgUsers
              .map(orgUser => {
                const userId = orgUser.userId?._id || orgUser.userId;
                const userData = orgUser.userId || {};
                return {
                  id: userId,
                  name: userData.name || 'N/A',
                  email: userData.email || 'N/A',
                  role: userData.role || 'b2b_member',
                  status: userData.memberStatus || 'pending',
                  memberStatus: userData.memberStatus || 'pending',
                  joinedAt: orgUser.createdAt || userData.createdAt,
                  isActive: userData.isActive !== undefined ? userData.isActive : true,
                  createdAt: userData.createdAt,
                  memberApprovedAt: userData.memberApprovedAt,
                  assignedCustomPackageIds: orgUser.assignedCustomPackageIds || [],
                  ...userData
                };
              })
              .filter(member => member.memberStatus === 'approved' || member.status === 'approved'); // Only approved members
          }
        } catch (err) {
          console.error('Error fetching organization members:', err);
        }
      }

      // Fetch members from school
      if (activeSchoolId) {
        try {
          const schoolResponse = await axios.get(`${API_URL}/schools/${activeSchoolId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          // First try to get from schoolUsers (if exists)
          if (schoolResponse.data.schoolUsers && schoolResponse.data.schoolUsers.length > 0) {
            members = schoolResponse.data.schoolUsers
              .map(schoolUser => {
                const userId = schoolUser.userId?._id || schoolUser.userId;
                const userData = schoolUser.userId || {};
                return {
                  id: userId,
                  name: userData.name || 'N/A',
                  email: userData.email || 'N/A',
                  role: 'b2e_member',
                  status: userData.memberStatus || 'pending',
                  memberStatus: userData.memberStatus || 'pending',
                  joinedAt: schoolUser.createdAt || userData.createdAt,
                  isActive: userData.isActive !== undefined ? userData.isActive : true,
                  createdAt: userData.createdAt,
                  memberApprovedAt: userData.memberApprovedAt,
                  ...userData
                };
              })
              .filter(member => member.memberStatus === 'approved' || member.status === 'approved'); // Only approved members
          }

          // Also check school.students array (new structure)
          if (schoolResponse.data.students && Array.isArray(schoolResponse.data.students) && schoolResponse.data.students.length > 0) {
            // Fetch full user details for students
            const studentPromises = schoolResponse.data.students.map(studentId => {
              // Ensure studentId is a string, not an object
              const id = typeof studentId === 'object' && studentId !== null
                ? (studentId._id || studentId.id || studentId.toString())
                : studentId;
              const idString = id ? id.toString().trim() : null;
              if (!idString) return Promise.resolve(null);

              return axios.get(`${API_URL}/users/${idString}`, {
                headers: { Authorization: `Bearer ${token}` },
              }).catch(() => null);
            });
            const studentResponses = await Promise.all(studentPromises);
            const students = studentResponses
              .filter(res => res && res.data)
              .map(res => ({
                id: res.data._id || res.data.id,
                name: res.data.name || 'N/A',
                email: res.data.email || 'N/A',
                role: 'b2e_member',
                status: res.data.memberStatus || 'pending',
                memberStatus: res.data.memberStatus || 'pending',
                joinedAt: res.data.createdAt,
                isActive: res.data.isActive !== undefined ? res.data.isActive : true,
                createdAt: res.data.createdAt,
                memberApprovedAt: res.data.memberApprovedAt,
                ...res.data
              }))
              .filter(student => student.memberStatus === 'approved' || student.status === 'approved'); // Only approved students

            // Merge with existing members, avoiding duplicates
            const existingIds = new Set(members.map(m => m.id?.toString()));
            students.forEach(student => {
              if (!existingIds.has(student.id?.toString())) {
                members.push(student);
              }
            });
          }

          // Fallback: If no students found, fetch users with schoolId
          if (members.length === 0) {
            try {
              const usersResponse = await axios.get(`${API_URL}/users`, {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                  schoolId: activeSchoolId,
                  role: 'b2e_member'
                }
              });
              if (usersResponse.data && Array.isArray(usersResponse.data)) {
                members = usersResponse.data
                  .map(userData => ({
                    id: userData._id || userData.id,
                    name: userData.name || 'N/A',
                    email: userData.email || 'N/A',
                    role: 'b2e_member',
                    status: userData.memberStatus || 'pending',
                    memberStatus: userData.memberStatus || 'pending',
                    joinedAt: userData.createdAt,
                    isActive: userData.isActive !== undefined ? userData.isActive : true,
                    createdAt: userData.createdAt,
                    memberApprovedAt: userData.memberApprovedAt,
                    ...userData
                  }))
                  .filter(member => member.memberStatus === 'approved' || member.status === 'approved'); // Only approved members
              }
            } catch (fallbackErr) {
              console.error('Error fetching students from users endpoint:', fallbackErr);
            }
          }
        } catch (err) {
          console.error('Error fetching school members:', err);
        }
      }

      // If still no members, try fetching from users endpoint
      if (members.length === 0 && (user.organizationId || user.schoolId)) {
        try {
          const membersResponse = await axios.get(`${API_URL}/users`, {
            headers: { Authorization: `Bearer ${token}` },
            params: {
              organizationId: user.organizationId,
              schoolId: user.schoolId,
              role: user.organizationId ? 'b2b_member' : 'b2e_member'
            }
          });
          if (membersResponse.data && Array.isArray(membersResponse.data)) {
            members = membersResponse.data;
          }
        } catch (err) {
          console.error('Error fetching members from users endpoint:', err);
        }
      }

      // CRITICAL: Filter to only show approved members (not pending or rejected)
      const approvedMembers = members.filter(member =>
        member.memberStatus === 'approved' || member.status === 'approved'
      );

      setAllMembers(approvedMembers);
    } catch (err) {
      console.error('Error fetching members:', err);
      setAllMembers([]);
    } finally {
      setLoadingMembers(false);
    }
  };

  const fetchPackages = async () => {
    try {
      setLoadingPackages(true);
      const token = getAuthToken();

      // Use new admin packages endpoint that returns ALL data properly populated
      try {
        const adminPackagesResponse = await axios.get(`${API_URL}/transactions/admin/packages`, {
          headers: { Authorization: `Bearer ${token}` },
        });


        console.log("adminPackagesResponse------------------------", adminPackagesResponse)


        if (adminPackagesResponse.data?.success && adminPackagesResponse.data?.transactions) {
          const transactions = adminPackagesResponse.data.transactions;

          console.log('📦 Admin packages response:', {
            transactionsCount: transactions.length,
            organization: adminPackagesResponse.data.organization,
            school: adminPackagesResponse.data.school
          });

          // Transform transactions to package-like format
          const transactionPackages = transactions.map(tx => {
            // Debug: Log the transaction object to see its structure
            console.log('🔍 Processing Transaction:', tx._id || tx.id);
            console.log('🔍 Raw Transaction Object (tx):', tx);
            console.log('🔍 tx.packageId:', tx.packageId);
            console.log('🔍 tx.uniqueCode:', tx.uniqueCode);
            console.log('🔍 tx.maxSeats:', tx.maxSeats);
            console.log('🔍 tx.usedSeats:', tx.usedSeats);
            // Log COMPLETE transaction data
            // console.log('🔍transactions', transactions);
            // console.log('📦 Complete Transaction Data:', {
            //   _id: tx._id,
            //   id: tx.id || tx._id,
            //   type: tx.type,
            //   userId: tx.userId,
            //   organizationId: tx.organizationId,
            //   schoolId: tx.schoolId,
            //   packageId: tx.packageId, // Fully populated package object
            //   packageType: tx.packageType,
            //   productId: tx.productId,
            //   customPackageId: tx.customPackageId,
            //   amount: tx.amount,
            //   currency: tx.currency,
            //   status: tx.status,
            //   providerRef: tx.providerRef,
            //   uniqueCode: tx.uniqueCode, // Unique code for game play
            //   stripePaymentIntentId: tx.stripePaymentIntentId,
            //   contractPeriod: tx.contractPeriod, // Complete contract period object
            //   maxSeats: tx.maxSeats,
            //   usedSeats: tx.usedSeats,
            //   codeApplications: tx.codeApplications,
            //   gamePlays: tx.gamePlays || [], // Array of game plays
            //   referrals: tx.referrals || [], // Array of referrals
            //   createdAt: tx.createdAt,
            //   updatedAt: tx.updatedAt,
            //   __v: tx.__v
            // });


            // Get package data - prioritize custom package if exists
            let packageData = null;
            let packageName = 'Package';
            let packageExpiryDate = null;

            if (tx.customPackageId) {
              // Custom package purchase
              packageData = tx.customPackageId.basePackageId || tx.customPackageId.basePackageId || {};
              packageName = tx.customPackageId.name ||
                tx.customPackageId.basePackageId?.name ||
                'Custom Package';
              // Prioritize transaction's calculated expiry date over custom package's contract endDate
              packageExpiryDate = tx.contractPeriod?.endDate ||
                tx.customPackageId.contract?.endDate ||
                tx.customPackageId.basePackageId?.expiryDate ||
                null;
            } else if (tx.packageId) {
              // Regular package purchase
              packageData = tx.packageId || {};
              packageName = packageData.name || 'Package';
              // Prioritize transaction's calculated expiry date over package's static expiryDate
              packageExpiryDate = tx.contractPeriod?.endDate || packageData.expiryDate || tx.packageId?.expiryDate || null;
            }

            // Extract ALL transaction fields explicitly - ensure we get ALL data from tx
            const transactionData = {
              _id: tx._id || tx.id,
              id: tx._id || tx.id,
              type: tx.type,
              userId: tx.userId,
              organizationId: tx.organizationId,
              schoolId: tx.schoolId,
              packageId: tx.packageId, // FULL populated package object
              packageType: tx.packageType || packageData.packageType || packageData.type,
              productId: tx.productId,
              customPackageId: tx.customPackageId,
              amount: tx.amount,
              currency: tx.currency,
              status: tx.status,
              providerRef: tx.providerRef,
              uniqueCode: tx.uniqueCode, // Unique code for game play
              stripePaymentIntentId: tx.stripePaymentIntentId,
              contractPeriod: tx.contractPeriod || {
                startDate: tx.createdAt,
                endDate: tx.contractPeriod?.endDate || packageExpiryDate || null
              },
              maxSeats: tx.maxSeats || packageData.maxSeats || 5,
              usedSeats: tx.usedSeats || 0,
              codeApplications: tx.codeApplications || 0,
              gamePlays: tx.gamePlays || [], // Array with populated userId
              referrals: tx.referrals || [], // Array with populated referredUserId
              createdAt: tx.createdAt,
              updatedAt: tx.updatedAt,
              __v: tx.__v
            };

            // Build complete package object with ALL transaction data
            const completePackage = {
              _id: tx._id || tx.id,
              id: tx._id || tx.id,
              name: packageName, // Package name from Package table (packageId.name)
              packageId: tx.packageId, // FULL populated package object with ALL fields
              packageExpiryDate: packageExpiryDate, // Expiry date from Package table (packageId.expiryDate)
              description: packageData.description || tx.customPackageId?.description || '',
              basePackageId: tx.packageId ? {
                name: packageData.name || packageName,
                expiryDate: packageExpiryDate,
                type: packageData.type || tx.packageId?.type,
                packageType: packageData.packageType || tx.packageId?.packageType
              } : null,
              customPackageId: tx.customPackageId,
              isTransaction: true,
              transaction: transactionData, // Complete transaction with ALL fields
              contractPricing: tx.customPackageId?.contractPricing || {
                amount: tx.amount,
                currency: tx.currency,
                billingType: 'one_time'
              },
              seatLimit: transactionData.maxSeats || tx.customPackageId?.seatLimit || 0,
              usedSeats: transactionData.usedSeats || 0,
              contract: transactionData.contractPeriod || tx.customPackageId?.contract || {
                startDate: tx.createdAt,
                endDate: transactionData.contractPeriod?.endDate || packageExpiryDate || null,
                status: tx.status === 'paid' ? 'active' : 'pending'
              },
              status: tx.status === 'paid' ? 'active' : 'pending',
              createdAt: tx.createdAt,
              uniqueCode: tx.uniqueCode, // Unique code for game play (from transaction) - DIRECT from tx
              stripePaymentIntentId: tx.stripePaymentIntentId, // DIRECT from tx
              // Transaction specific fields at root level for easy access - DIRECT from tx
              packageType: tx.packageType || packageData.packageType || packageData.type,
              maxSeats: tx.maxSeats || packageData.maxSeats || 5, // Total seats (from transaction) - DIRECT from tx
              usedSeats: tx.usedSeats || 0, // Used seats (from transaction) - DIRECT from tx
              gamePlays: tx.gamePlays || [], // Game plays array (from transaction) - DIRECT from tx
              referrals: tx.referrals || [] // Referrals array (from transaction) - DIRECT from tx
            };

            console.log('📦 Complete Package Object:', completePackage);
            return completePackage;
          });

          // Custom packages are now only shown via transactions (after purchase)
          // They are already included in transactionPackages if they have been purchased
          // Only purchased custom packages (with transactions) should appear on dashboard
          let allPackages = [...transactionPackages];

          // Remove duplicates based on _id
          const uniquePackages = [];
          const seenIds = new Set();
          allPackages.forEach(pkg => {
            const pkgId = pkg._id || pkg.id;
            if (pkgId && !seenIds.has(pkgId.toString())) {
              seenIds.add(pkgId.toString());
              uniquePackages.push(pkg);
            }
          });

          // Only show packages that have transactions (purchased)
          // Custom packages without transactions should NOT appear in Purchased Packages
          // They will show in "Available Custom Packages" section for purchase
          setPackages(uniquePackages);

          // Initialize package tabs to 0 (Package Information) for all packages
          const initialTabs = {};
          uniquePackages.forEach(pkg => {
            const pkgId = pkg._id || pkg.id;
            if (pkgId) {
              initialTabs[pkgId] = 0; // Default to first tab (Package Information)
            }
          });
          setPackageTabs(prevTabs => ({ ...initialTabs, ...prevTabs }));

          return; // Exit early - we got data from new endpoint
        }
      } catch (adminErr) {
        console.error('Error fetching from admin packages endpoint:', adminErr);
        // Fallback to old method if new endpoint fails
      }

      // FALLBACK: Old method (keep for backward compatibility)
      // Get user's organization/school
      const userResponse = await axios.get(`${API_URL}/auth/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = userResponse.data;

      // Fallback to first organization/school from state if user object does not carry ids
      const fallbackOrgId = !user.organizationId && organizations?.length > 0 ? organizations[0].id : null;
      const activeOrganizationId = user.organizationId || fallbackOrgId;
      const fallbackSchoolId = !user.schoolId && user.segment === 'B2E' && organizations?.length > 0 ? organizations[0].id : null;
      const activeSchoolId = user.schoolId || fallbackSchoolId;

      let allPackages = [];

      // First, try to get transactions from user dashboard (this includes all user transactions)
      try {
        const dashboardResponse = await axios.get(`${API_URL}/user/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (dashboardResponse.data?.transactions && Array.isArray(dashboardResponse.data.transactions)) {
          const userTransactions = dashboardResponse.data.transactions
            .filter(tx => {
              // IMPORTANT: First filter by userId - user can only see their own transactions
              const txUserId = tx.userId?._id || tx.userId;
              const userStr = user._id ? (typeof user._id === 'object' ? user._id.toString() : user._id.toString()) : null;
              const txUserStr = txUserId ? (typeof txUserId === 'object' ? txUserId.toString() : txUserId.toString()) : null;

              // Transaction must belong to logged-in user
              if (userStr !== txUserStr) {
                return false;
              }

              // Then filter transactions that belong to this organization/school
              const txOrgId = tx.organizationId?._id || tx.organizationId;
              const txSchoolId = tx.schoolId?._id || tx.schoolId;

              if (activeOrganizationId) {
                const orgIdStr = typeof activeOrganizationId === 'object'
                  ? (activeOrganizationId._id || activeOrganizationId.id || activeOrganizationId.toString())
                  : activeOrganizationId.toString();
                const txOrgIdStr = txOrgId ? (typeof txOrgId === 'object' ? (txOrgId._id || txOrgId.toString()) : txOrgId.toString()) : null;
                return txOrgIdStr === orgIdStr || !txOrgId;
              }

              if (activeSchoolId) {
                const schoolIdStr = typeof activeSchoolId === 'object'
                  ? (activeSchoolId._id || activeSchoolId.id || activeSchoolId.toString())
                  : activeSchoolId.toString();
                const txSchoolIdStr = txSchoolId ? (typeof txSchoolId === 'object' ? (txSchoolId._id || txSchoolId.toString()) : txSchoolId.toString()) : null;
                return txSchoolIdStr === schoolIdStr || !txSchoolId;
              }

              return true; // User's transaction with no org/school filter
            })
            .map(tx => {
              // Log COMPLETE transaction data
              // console.log('🔍 Processing user dashboard transaction:', tx._id);
              // console.log('📦 Complete Transaction Data:', {
              //   _id: tx._id,
              //   id: tx.id || tx._id,
              //   type: tx.type,
              //   userId: tx.userId,
              //   organizationId: tx.organizationId,
              //   schoolId: tx.schoolId,
              //   packageId: tx.packageId, // Fully populated package object
              //   packageType: tx.packageType,
              //   productId: tx.productId,
              //   customPackageId: tx.customPackageId,
              //   amount: tx.amount,
              //   currency: tx.currency,
              //   status: tx.status,
              //   providerRef: tx.providerRef,
              //   uniqueCode: tx.uniqueCode, // Unique code for game play
              //   stripePaymentIntentId: tx.stripePaymentIntentId,
              //   contractPeriod: tx.contractPeriod, // Complete contract period object
              //   maxSeats: tx.maxSeats,
              //   usedSeats: tx.usedSeats,
              //   codeApplications: tx.codeApplications,
              //   gamePlays: tx.gamePlays || [], // Array of game plays
              //   referrals: tx.referrals || [], // Array of referrals
              //   createdAt: tx.createdAt,
              //   updatedAt: tx.updatedAt,
              //   __v: tx.__v
              // });
              // console.log('📋 Package Details (from packageId):', tx.packageId);

              // Get package name from populated packageId (from Package table)
              const packageData = tx.packageId || {};
              const packageName = packageData.name ||
                (typeof tx.packageId === 'object' && tx.packageId?.name) ||
                'Package';

              // Get package expiry date - prioritize transaction's calculated expiry date
              const packageExpiryDate = tx.contractPeriod?.endDate || packageData.expiryDate || null;

              // Extract all transaction fields explicitly
              const transactionData = {
                _id: tx._id,
                id: tx._id || tx.id,
                type: tx.type,
                userId: tx.userId,
                organizationId: tx.organizationId,
                schoolId: tx.schoolId,
                packageId: tx.packageId, // Full populated package object
                packageType: tx.packageType || packageData.packageType || packageData.type,
                productId: tx.productId,
                customPackageId: tx.customPackageId,
                amount: tx.amount,
                currency: tx.currency,
                status: tx.status,
                uniqueCode: tx.uniqueCode, // Unique code for game play
                stripePaymentIntentId: tx.stripePaymentIntentId,
                contractPeriod: tx.contractPeriod || {
                  startDate: tx.createdAt,
                  endDate: tx.contractPeriod?.endDate || packageExpiryDate || null
                },
                maxSeats: tx.maxSeats || packageData.maxSeats || 5, // From transaction or package
                usedSeats: tx.usedSeats || 0,
                codeApplications: tx.codeApplications || 0,
                gamePlays: tx.gamePlays || [], // Array of game plays
                referrals: tx.referrals || [], // Array of referrals
                createdAt: tx.createdAt,
                updatedAt: tx.updatedAt
              };

              return {
                _id: tx._id || tx.id,
                id: tx._id || tx.id,
                name: packageName, // Package name from Package table
                packageId: tx.packageId, // Full populated package object from Package table
                packageExpiryDate: packageExpiryDate, // Expiry date from Package table
                description: packageData.description || '',
                basePackageId: tx.packageId ? {
                  name: packageData.name || packageName,
                  expiryDate: packageExpiryDate
                } : null,
                isTransaction: true,
                transaction: transactionData, // Complete transaction object with all fields
                contractPricing: {
                  amount: tx.amount,
                  currency: tx.currency,
                  billingType: 'one_time'
                },
                seatLimit: transactionData.maxSeats || 0,
                usedSeats: transactionData.usedSeats || 0,
                contract: transactionData.contractPeriod || {
                  startDate: tx.createdAt,
                  endDate: transactionData.contractPeriod?.endDate || packageExpiryDate || null,
                  status: tx.status === 'paid' ? 'active' : 'pending'
                },
                status: tx.status === 'paid' ? 'active' : 'pending',
                createdAt: tx.createdAt,
                uniqueCode: transactionData.uniqueCode, // Unique code for game play
                stripePaymentIntentId: transactionData.stripePaymentIntentId,
                // Transaction specific fields at root level
                packageType: transactionData.packageType,
                maxSeats: transactionData.maxSeats,
                gamePlays: transactionData.gamePlays,
                referrals: transactionData.referrals
              };
            });
          allPackages = [...allPackages, ...userTransactions];
        }
      } catch (dashboardErr) {
        console.error('Error fetching from user dashboard:', dashboardErr);
      }

      // Fetch transactions (actual purchases) for organization
      if (activeOrganizationId) {
        try {
          // First, try to get transactions from organization's transactionIds array
          // Extract ID if it's an object
          const orgId = typeof activeOrganizationId === 'object'
            ? (activeOrganizationId._id || activeOrganizationId.id || activeOrganizationId.toString())
            : activeOrganizationId.toString();

          const orgResponse = await axios.get(`${API_URL}/organizations/${orgId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => null);

          if (!orgResponse) {
            // If organization not found, try school endpoint
            if (activeSchoolId) {
              const schoolId = typeof activeSchoolId === 'object'
                ? (activeSchoolId._id || activeSchoolId.id || activeSchoolId.toString())
                : activeSchoolId.toString();

              const schoolResponse = await axios.get(`${API_URL}/schools/${schoolId}`, {
                headers: { Authorization: `Bearer ${token}` },
              });

              if (schoolResponse.data?.transactionIds && Array.isArray(schoolResponse.data.transactionIds)) {
                transactionIds = schoolResponse.data.transactionIds.map(tx => tx._id || tx);
              }
            }
          } else {
            let transactionIds = [];
            if (orgResponse.data?.transactionIds && Array.isArray(orgResponse.data.transactionIds)) {
              transactionIds = orgResponse.data.transactionIds.map(tx => tx._id || tx);
            }

            // If no transactionIds in organization, fetch from transactions endpoint
            if (transactionIds.length === 0) {
              try {
                const transactionsResponse = await axios.get(`${API_URL}/transactions/b2b-b2e`, {
                  headers: { Authorization: `Bearer ${token}` },
                  params: { organizationId: orgId }
                });
                if (Array.isArray(transactionsResponse.data)) {
                  // Filter transactions to ensure they belong to logged-in user
                  const userStr = user._id ? (typeof user._id === 'object' ? user._id.toString() : user._id.toString()) : null;
                  const userTransactions = transactionsResponse.data.filter(tx => {
                    const txUserId = tx.userId?._id || tx.userId;
                    const txUserStr = txUserId ? (typeof txUserId === 'object' ? txUserId.toString() : txUserId.toString()) : null;
                    return userStr === txUserStr; // Only include transactions that belong to logged-in user
                  });
                  transactionIds = userTransactions.map(tx => tx._id || tx.id);
                }
              } catch (txErr) {
                console.error('Error fetching from transactions endpoint:', txErr);
              }
            }

            console.log("transactions", transactions)

            // Also fetch transactions by userId (for transactions that don't have organizationId set)
            if (transactionIds.length === 0 && user._id) {
              try {
                const userTransactionsResponse = await axios.get(`${API_URL}/transactions/${user._id}`, {
                  headers: { Authorization: `Bearer ${token}` },
                }).catch(() => null);

                // Try alternative endpoint - get user's transactions
                if (!userTransactionsResponse || !userTransactionsResponse.data) {
                  // Fetch all transactions and filter by userId
                  const allTransactionsResponse = await axios.get(`${API_URL}/user/dashboard`, {
                    headers: { Authorization: `Bearer ${token}` },
                  });
                  if (allTransactionsResponse.data?.transactions) {
                    const userStr = user._id ? (typeof user._id === 'object' ? user._id.toString() : user._id.toString()) : null;
                    const userTransactions = allTransactionsResponse.data.transactions.filter(tx => {
                      const txUserId = tx.userId?._id || tx.userId;
                      const txUserStr = txUserId ? (typeof txUserId === 'object' ? txUserId.toString() : txUserId.toString()) : null;
                      return userStr === txUserStr; // Only include transactions that belong to logged-in user
                    });
                    transactionIds = userTransactions.map(tx => tx._id || tx.id);
                  }
                }
              } catch (userTxErr) {
                console.error('Error fetching user transactions:', userTxErr);
              }
            }

            // Fetch full transaction details
            if (transactionIds.length > 0) {
              const transactionPromises = transactionIds.map(txId =>
                axios.get(`${API_URL}/transactions/${txId}`, {
                  headers: { Authorization: `Bearer ${token}` },
                }).catch(() => null)
              );
              const transactionResponses = await Promise.all(transactionPromises);
              const transactions = transactionResponses
                .filter(res => res && res.data)
                .map(res => res.data);

              if (transactions.length > 0) {
                // Transform transactions to package-like format for display
                const transactionPackages = transactions.map(tx => {
                  // Log COMPLETE transaction data
                  // console.log('🔍 Processing transaction:', tx._id);
                  console.log('📦 Complete Transaction Data:', {
                    _id: tx._id,
                    id: tx.id || tx._id,
                    type: tx.type,
                    userId: tx.userId,
                    organizationId: tx.organizationId,
                    schoolId: tx.schoolId,
                    packageId: tx.packageId, // Fully populated package object
                    packageType: tx.packageType,
                    productId: tx.productId,
                    customPackageId: tx.customPackageId,
                    amount: tx.amount,
                    currency: tx.currency,
                    status: tx.status,
                    providerRef: tx.providerRef,
                    uniqueCode: tx.uniqueCode, // Unique code for game play
                    stripePaymentIntentId: tx.stripePaymentIntentId,
                    contractPeriod: tx.contractPeriod, // Complete contract period object
                    maxSeats: tx.maxSeats,
                    usedSeats: tx.usedSeats,
                    codeApplications: tx.codeApplications,
                    gamePlays: tx.gamePlays || [], // Array of game plays
                    referrals: tx.referrals || [], // Array of referrals
                    createdAt: tx.createdAt,
                    updatedAt: tx.updatedAt,
                    __v: tx.__v
                  });
                  // console.log('📋 Package Details (from packageId):', tx.packageId);

                  // Get package name from populated packageId (from Package table)
                  const packageData = tx.packageId || {};
                  const packageName = packageData.name ||
                    (typeof tx.packageId === 'object' && tx.packageId?.name) ||
                    tx.customPackageId?.name ||
                    'Package';

                  // Get package expiry date - prioritize transaction's calculated expiry date
                  const packageExpiryDate = tx.contractPeriod?.endDate || packageData.expiryDate || null;

                  // Extract all transaction fields explicitly
                  const transactionData = {
                    _id: tx._id,
                    id: tx._id || tx.id,
                    type: tx.type,
                    userId: tx.userId,
                    organizationId: tx.organizationId,
                    schoolId: tx.schoolId,
                    packageId: tx.packageId, // Full populated package object
                    packageType: tx.packageType || packageData.packageType || packageData.type,
                    productId: tx.productId,
                    customPackageId: tx.customPackageId,
                    amount: tx.amount,
                    currency: tx.currency,
                    status: tx.status,
                    uniqueCode: tx.uniqueCode, // Unique code for game play
                    stripePaymentIntentId: tx.stripePaymentIntentId,
                    contractPeriod: tx.contractPeriod || {
                      startDate: tx.createdAt,
                      endDate: tx.contractPeriod?.endDate || packageExpiryDate || null
                    },
                    maxSeats: tx.maxSeats || packageData.maxSeats || 5, // From transaction or package
                    usedSeats: tx.usedSeats || 0,
                    codeApplications: tx.codeApplications || 0,
                    gamePlays: tx.gamePlays || [], // Array of game plays
                    referrals: tx.referrals || [], // Array of referrals
                    createdAt: tx.createdAt,
                    updatedAt: tx.updatedAt
                  };

                  return {
                    _id: tx._id,
                    id: tx._id || tx.id,
                    name: packageName, // Package name from Package table
                    packageId: tx.packageId, // Full populated package object from Package table
                    packageExpiryDate: packageExpiryDate, // Expiry date from Package table
                    description: packageData.description || tx.customPackageId?.description || '',
                    basePackageId: tx.packageId ? {
                      name: packageData.name || packageName,
                      expiryDate: packageExpiryDate
                    } : null,
                    customPackageId: tx.customPackageId,
                    isTransaction: true,
                    transaction: transactionData, // Complete transaction object with all fields
                    contractPricing: tx.customPackageId?.contractPricing || {
                      amount: tx.amount,
                      currency: tx.currency,
                      billingType: 'one_time'
                    },
                    seatLimit: transactionData.maxSeats || tx.customPackageId?.seatLimit || 0,
                    usedSeats: transactionData.usedSeats || 0,
                    contract: transactionData.contractPeriod || tx.customPackageId?.contract || {
                      startDate: tx.createdAt,
                      endDate: transactionData.contractPeriod?.endDate || packageExpiryDate || null,
                      status: tx.status === 'paid' ? 'active' : 'pending'
                    },
                    status: tx.status === 'paid' ? 'active' : 'pending',
                    createdAt: tx.createdAt,
                    uniqueCode: transactionData.uniqueCode, // Unique code for game play
                    stripePaymentIntentId: transactionData.stripePaymentIntentId,
                    // Transaction specific fields at root level for easy access
                    packageType: transactionData.packageType,
                    maxSeats: transactionData.maxSeats,
                    gamePlays: transactionData.gamePlays,
                    referrals: transactionData.referrals
                  };
                });
                allPackages = [...allPackages, ...transactionPackages];
              }
            }
          }
        } catch (err) {
          console.error('Error fetching organization transactions:', err);
        }

        // Also fetch custom packages (both purchased and available)
        try {
          console.log('🔍 Fetching custom packages for organization:', activeOrganizationId);
          const response = await axios.get(`${API_URL}/custom-packages`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          console.log('📦 Custom packages API response:', {
            dataType: Array.isArray(response.data) ? 'array' : typeof response.data,
            count: Array.isArray(response.data) ? response.data.length : 0,
            data: response.data
          });

          if (Array.isArray(response.data)) {
            // Transform custom packages to match transaction package format
            const orgIdStr = activeOrganizationId?.toString();
            const schoolIdStr = activeSchoolId?.toString();
            console.log('🔍 Filtering custom packages:', {
              organizationId: orgIdStr || 'null',
              schoolId: schoolIdStr || 'null',
              totalPackages: response.data.length
            });

            const customPackageData = response.data
              .filter(cp => {
                // Filter by organizationId OR schoolId - check both populated and non-populated formats
                const cpOrgId = cp.organizationId?._id || cp.organizationId;
                const cpSchoolId = cp.schoolId?._id || cp.schoolId;

                // Match if organizationId matches OR schoolId matches
                const matchesOrg = orgIdStr && cpOrgId && cpOrgId.toString() === orgIdStr;
                const matchesSchool = schoolIdStr && cpSchoolId && cpSchoolId.toString() === schoolIdStr;
                const matches = matchesOrg || matchesSchool;

                console.log('🔍 Custom package filter check:', {
                  packageId: cp._id,
                  packageName: cp.name,
                  cpOrgId: cpOrgId?.toString() || 'null',
                  cpSchoolId: cpSchoolId?.toString() || 'null',
                  activeOrgId: orgIdStr || 'null',
                  activeSchoolId: schoolIdStr || 'null',
                  matchesOrg: matchesOrg,
                  matchesSchool: matchesSchool,
                  matches: matches
                });

                return matches;
              })
              .map(cp => {
                console.log('✅ Adding custom package to packages array:', cp.name || cp._id);
                return {
                  _id: cp._id,
                  id: cp._id,
                  name: cp.name || cp.basePackageId?.name || 'Custom Package',
                  packageId: cp.basePackageId,
                  packageExpiryDate: cp.contract?.endDate || null,
                  description: cp.description || cp.basePackageId?.description || '',
                  basePackageId: cp.basePackageId,
                  customPackageId: cp,
                  isTransaction: false,
                  isCustomPackage: true,
                  contractPricing: cp.contractPricing || {
                    amount: 0,
                    currency: 'EUR',
                    billingType: 'one_time'
                  },
                  seatLimit: cp.seatLimit || 0,
                  usedSeats: 0, // Custom packages don't track used seats in the same way
                  contract: cp.contract || {
                    startDate: cp.createdAt,
                    endDate: null,
                    status: cp.status === 'active' ? 'active' : 'pending'
                  },
                  status: cp.status === 'active' ? 'active' : cp.contract?.status || 'pending',
                  createdAt: cp.createdAt,
                  uniqueCode: null, // Custom packages don't have unique codes (they're assigned directly)
                  packageType: cp.basePackageId?.packageType || cp.basePackageId?.type || 'standard',
                  maxSeats: cp.seatLimit || 0,
                  usedSeats: 0,
                  gamePlays: [],
                  referrals: []
                };
              });

            console.log('📦 Custom packages after filtering:', {
              count: customPackageData.length,
              packages: customPackageData.map(cp => ({ id: cp._id, name: cp.name }))
            });

            allPackages = [...allPackages, ...customPackageData];
            console.log('📦 Total packages after adding custom packages:', allPackages.length);
          } else {
            console.warn('⚠️ Custom packages response is not an array:', response.data);
          }
        } catch (err) {
          console.error('❌ Error fetching organization custom packages:', err);
          console.error('❌ Error details:', {
            message: err.message,
            response: err.response?.data,
            status: err.response?.status
          });
        }
      }

      // Fetch transactions and packages from school
      if (activeSchoolId) {
        try {
          // First, try to get transactions from school's transactionIds array
          const schoolResponse = await axios.get(`${API_URL}/schools/${activeSchoolId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          let transactionIds = [];
          if (schoolResponse.data?.transactionIds && Array.isArray(schoolResponse.data.transactionIds)) {
            transactionIds = schoolResponse.data.transactionIds.map(tx => tx._id || tx);
          }

          // If no transactionIds in school, fetch from transactions endpoint
          if (transactionIds.length === 0) {
            try {
              const transactionsResponse = await axios.get(`${API_URL}/transactions/b2b-b2e`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { schoolId: activeSchoolId }
              });
              if (Array.isArray(transactionsResponse.data)) {
                // Filter transactions to ensure they belong to logged-in user
                const userStr = user._id ? (typeof user._id === 'object' ? user._id.toString() : user._id.toString()) : null;
                const userTransactions = transactionsResponse.data.filter(tx => {
                  const txUserId = tx.userId?._id || tx.userId;
                  const txUserStr = txUserId ? (typeof txUserId === 'object' ? txUserId.toString() : txUserId.toString()) : null;
                  return userStr === txUserStr; // Only include transactions that belong to logged-in user
                });
                transactionIds = userTransactions.map(tx => tx._id || tx.id);
              }
            } catch (txErr) {
              console.error('Error fetching from transactions endpoint:', txErr);
            }
          }

          // Also fetch transactions by userId (for transactions that don't have schoolId set)
          if (transactionIds.length === 0 && user._id) {
            try {
              // Fetch all transactions and filter by userId
              const allTransactionsResponse = await axios.get(`${API_URL}/user/dashboard`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              if (allTransactionsResponse.data?.transactions) {
                const userStr = user._id ? (typeof user._id === 'object' ? user._id.toString() : user._id.toString()) : null;
                const userTransactions = allTransactionsResponse.data.transactions.filter(tx => {
                  const txUserId = tx.userId?._id || tx.userId;
                  const txUserStr = txUserId ? (typeof txUserId === 'object' ? txUserId.toString() : txUserId.toString()) : null;
                  return userStr === txUserStr; // Only include transactions that belong to logged-in user
                });
                transactionIds = userTransactions.map(tx => tx._id || tx.id);
              }
            } catch (userTxErr) {
              console.error('Error fetching user transactions:', userTxErr);
            }
          }

          // Fetch full transaction details
          if (transactionIds.length > 0) {
            const transactionPromises = transactionIds.map(txId =>
              axios.get(`${API_URL}/transactions/${txId}`, {
                headers: { Authorization: `Bearer ${token}` },
              }).catch(() => null)
            );
            const transactionResponses = await Promise.all(transactionPromises);
            const transactions = transactionResponses
              .filter(res => res && res.data)
              .map(res => res.data);

            if (transactions.length > 0) {
              const transactionPackages = transactions.map(tx => {
                // Log COMPLETE transaction data
                // console.log('🔍 Processing school transaction:', tx._id);
                console.log('Complete Transaction Data:', {
                  _id: tx._id,
                  id: tx.id || tx._id,
                  type: tx.type,
                  userId: tx.userId,
                  organizationId: tx.organizationId,
                  schoolId: tx.schoolId,
                  packageId: tx.packageId, // Fully populated package object
                  packageType: tx.packageType,
                  productId: tx.productId,
                  customPackageId: tx.customPackageId,
                  amount: tx.amount,
                  currency: tx.currency,
                  status: tx.status,
                  providerRef: tx.providerRef,
                  uniqueCode: tx.uniqueCode, // Unique code for game play
                  stripePaymentIntentId: tx.stripePaymentIntentId,
                  contractPeriod: tx.contractPeriod, // Complete contract period object
                  maxSeats: tx.maxSeats,
                  usedSeats: tx.usedSeats,
                  codeApplications: tx.codeApplications,
                  gamePlays: tx.gamePlays || [], // Array of game plays
                  referrals: tx.referrals || [], // Array of referrals
                  createdAt: tx.createdAt,
                  updatedAt: tx.updatedAt,
                  __v: tx.__v
                });
                // console.log('📋 Package Details (from packageId):', tx.packageId);

                // Get package name from populated packageId (from Package table)
                const packageData = tx.packageId || {};
                const packageName = packageData.name ||
                  (typeof tx.packageId === 'object' && tx.packageId?.name) ||
                  tx.customPackageId?.name ||
                  'Package';

                // Get package expiry date - prioritize transaction's calculated expiry date
                const packageExpiryDate = tx.contractPeriod?.endDate || packageData.expiryDate || null;

                // Extract all transaction fields explicitly
                const transactionData = {
                  _id: tx._id,
                  id: tx._id || tx.id,
                  type: tx.type,
                  userId: tx.userId,
                  organizationId: tx.organizationId,
                  schoolId: tx.schoolId,
                  packageId: tx.packageId, // Full populated package object
                  packageType: tx.packageType || packageData.packageType || packageData.type,
                  productId: tx.productId,
                  customPackageId: tx.customPackageId,
                  amount: tx.amount,
                  currency: tx.currency,
                  status: tx.status,
                  uniqueCode: tx.uniqueCode, // Unique code for game play
                  stripePaymentIntentId: tx.stripePaymentIntentId,
                  contractPeriod: tx.contractPeriod || {
                    startDate: tx.createdAt,
                    endDate: tx.contractPeriod?.endDate || packageExpiryDate || null
                  },
                  maxSeats: tx.maxSeats || packageData.maxSeats || 5, // From transaction or package
                  usedSeats: tx.usedSeats || 0,
                  codeApplications: tx.codeApplications || 0,
                  gamePlays: tx.gamePlays || [], // Array of game plays
                  referrals: tx.referrals || [], // Array of referrals
                  createdAt: tx.createdAt,
                  updatedAt: tx.updatedAt
                };

                return {
                  _id: tx._id,
                  id: tx._id || tx.id,
                  name: packageName, // Package name from Package table
                  packageId: tx.packageId, // Full populated package object from Package table
                  packageExpiryDate: packageExpiryDate, // Expiry date from Package table
                  description: packageData.description || tx.customPackageId?.description || '',
                  basePackageId: tx.packageId ? {
                    name: packageData.name || packageName,
                    expiryDate: packageExpiryDate
                  } : null,
                  customPackageId: tx.customPackageId,
                  isTransaction: true,
                  transaction: transactionData, // Complete transaction object with all fields
                  contractPricing: tx.customPackageId?.contractPricing || {
                    amount: tx.amount,
                    currency: tx.currency,
                    billingType: 'one_time'
                  },
                  seatLimit: transactionData.maxSeats || tx.customPackageId?.seatLimit || 0,
                  usedSeats: transactionData.usedSeats || 0,
                  contract: transactionData.contractPeriod || tx.customPackageId?.contract || {
                    startDate: tx.createdAt,
                    endDate: transactionData.contractPeriod?.endDate || packageExpiryDate || null,
                    status: tx.status === 'paid' ? 'active' : 'pending'
                  },
                  status: tx.status === 'paid' ? 'active' : 'pending',
                  createdAt: tx.createdAt,
                  uniqueCode: transactionData.uniqueCode, // Unique code for game play
                  stripePaymentIntentId: transactionData.stripePaymentIntentId,
                  // Transaction specific fields at root level for easy access
                  packageType: transactionData.packageType,
                  maxSeats: transactionData.maxSeats,
                  gamePlays: transactionData.gamePlays,
                  referrals: transactionData.referrals
                };
              });
              allPackages = [...allPackages, ...transactionPackages];
            }
          }
        } catch (err) {
          console.error('Error fetching school transactions:', err);
        }

        // Custom packages are now only shown via transactions (after purchase)
        // They are already included in the transactions array from adminPackagesResponse
        // No need to fetch them separately - only purchased custom packages should appear
      }

      // Remove duplicates based on _id
      const uniquePackages = [];
      const seenIds = new Set();
      allPackages.forEach(pkg => {
        const id = pkg._id || pkg.id;
        if (id && !seenIds.has(id.toString())) {
          seenIds.add(id.toString());
          uniquePackages.push(pkg);
        }
      });

      // Only show packages that have transactions (purchased)
      // Custom packages without transactions should NOT appear in Purchased Packages
      // They will show in "Available Custom Packages" section for purchase
      console.log('📦 Final packages array before setting state:', {
        totalPackages: uniquePackages.length,
        packages: uniquePackages.map(pkg => ({
          id: pkg._id,
          name: pkg.name,
          isCustomPackage: !!pkg.customPackageId,
          isTransaction: pkg.isTransaction,
          organizationId: pkg.organizationId
        }))
      });

      setPackages(uniquePackages);

      // Initialize package tabs to 0 (Package Information) for all packages
      const initialTabs = {};
      uniquePackages.forEach(pkg => {
        const pkgId = pkg._id || pkg.id;
        if (pkgId) {
          initialTabs[pkgId] = 0; // Default to first tab (Package Information)
        }
      });
      setPackageTabs(prevTabs => ({ ...initialTabs, ...prevTabs }));
    } catch (err) {
      console.error('Error fetching packages:', err);
      setPackages([]);
    } finally {
      setLoadingPackages(false);
    }
  };

  const fetchCustomPackageRequests = async () => {
    try {
      setLoadingCustomRequests(true);
      const token = getAuthToken();

      // Fetch custom package requests (backend now includes completed requests with customPackageId populated)
      const response = await axios.get(`${API_URL}/custom-package-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (Array.isArray(response.data)) {
        // Backend already populates customPackageId, so we can use it directly
        setCustomPackageRequests(response.data);
      } else {
        setCustomPackageRequests([]);
      }
    } catch (err) {
      console.error('Error fetching custom package requests:', err);
      setCustomPackageRequests([]);
    } finally {
      setLoadingCustomRequests(false);
    }
  };

  // Fetch available custom packages for purchase (pending status)
  const fetchAvailableCustomPackages = async () => {
    try {
      setLoadingAvailableCustomPackages(true);
      const token = getAuthToken();

      console.log('🔍 Fetching available custom packages...');
      const response = await axios.get(`${API_URL}/custom-packages`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('📦 Custom packages response:', response.data);

      if (Array.isArray(response.data)) {
        // Get list of already purchased custom package IDs from transactions
        const purchasedCustomPackageIds = new Set();
        if (Array.isArray(packages)) {
          packages.forEach(pkg => {
            if (pkg.customPackageId && (pkg.customPackageId._id || pkg.customPackageId)) {
              const cpId = pkg.customPackageId._id || pkg.customPackageId;
              purchasedCustomPackageIds.add(cpId.toString());
            }
          });
        }

        console.log('🛒 Already purchased custom package IDs:', Array.from(purchasedCustomPackageIds));

        // Show custom packages that are:
        // 1. status='pending' OR status='active' (available for purchase)
        // 2. AND not already purchased (no transaction exists)
        const availablePackages = response.data.filter(cp => {
          const cpId = cp._id || cp.id;
          const isAvailable = (cp.status === 'pending' || cp.status === 'active') &&
            !purchasedCustomPackageIds.has(cpId.toString());
          console.log(`📦 Custom package ${cpId}: status=${cp.status}, isAvailable=${isAvailable}, alreadyPurchased=${purchasedCustomPackageIds.has(cpId.toString())}`);
          return isAvailable;
        });

        console.log(`✅ Found ${availablePackages.length} available custom packages out of ${response.data.length} total`);
        setAvailableCustomPackages(availablePackages);
      } else {
        console.log('⚠️ Response is not an array:', response.data);
        setAvailableCustomPackages([]);
      }
    } catch (err) {
      console.error('❌ Error fetching available custom packages:', err);
      console.error('Error details:', err.response?.data);
      setAvailableCustomPackages([]);
    } finally {
      setLoadingAvailableCustomPackages(false);
    }
  };

  // Handle custom package purchase
  const handleBuyCustomPackage = async (customPackage) => {
    console.log('🛒 Buy Now clicked for custom package:', {
      customPackage: customPackage,
      customPackageId: customPackage._id || customPackage.id,
      user: user?._id,
      hasToken: !!getAuthToken()
    });

    if (!user) {
      console.warn('⚠️ User not logged in, redirecting to login');
      router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`);
      return;
    }

    try {
      const token = getAuthToken();
      if (!token) {
        console.warn('⚠️ No auth token found, redirecting to login');
        router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`);
        return;
      }

      const customPackageId = customPackage._id || customPackage.id;
      console.log('🛒 Creating checkout session for custom package:', customPackageId);
      console.log('🛒 API URL:', `${API_URL}/payments/create-checkout-session`);
      console.log('🛒 Request payload:', { customPackageId });

      // Create Stripe Checkout Session - same as packages page
      const response = await axios.post(
        `${API_URL}/payments/create-checkout-session`,
        {
          customPackageId: customPackageId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('✅ Checkout session response:', response.data);

      // Redirect to Stripe Checkout - same as packages page
      if (response.data && response.data.url) {
        console.log('✅ Redirecting to Stripe Checkout:', response.data.url);
        window.location.href = response.data.url;
      } else {
        console.error('❌ No URL in checkout session response:', response.data);
        setSnackbar({
          open: true,
          message: 'Failed to create checkout session. Please try again.',
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('❌ Error creating checkout session:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });

      // Show error in snackbar instead of alert
      const errorMessage = error.response?.data?.error || error.message || 'Failed to start checkout process';
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    }
  };

  const getProfilePhotoUrl = (profilePhoto) => {
    if (!profilePhoto) return null;
    if (profilePhoto.startsWith('http')) return profilePhoto;
    const apiBase = API_BASE_URL;
    const normalizedApiBase = apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase;
    return `${normalizedApiBase}${profilePhoto}`;
  };

  const handleOpenProfileEdit = () => {
    setEditForm({
      name: dashboardData?.user?.name || '',
      email: dashboardData?.user?.email || '',
    });
    const currentPhotoUrl = getProfilePhotoUrl(dashboardData?.user?.profilePhoto);
    setProfilePhotoPreview(currentPhotoUrl);
    setProfilePhotoFile(null);
    setProfileEditOpen(true);
  };

  const handleProfilePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setSnackbar({
        open: true,
        message: 'Please select an image file',
        severity: 'error',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setSnackbar({
        open: true,
        message: 'Image size must be less than 5MB',
        severity: 'error',
      });
      return;
    }

    setProfilePhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteProfilePhoto = async () => {
    try {
      setUploadingPhoto(true);
      const token = getAuthToken();
      await axios.delete(`${API_URL}/profile/photo`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSnackbar({
        open: true,
        message: 'Profile photo deleted successfully',
        severity: 'success',
      });
      setProfilePhotoPreview(null);
      setProfilePhotoFile(null);
      fetchDashboardData();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.error || 'Failed to delete profile photo',
        severity: 'error',
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setProfileSubmitting(true);
      const token = getAuthToken();

      if (profilePhotoFile) {
        setUploadingPhoto(true);
        const formData = new FormData();
        formData.append('photo', profilePhotoFile);
        await axios.post(`${API_URL}/profile/photo`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        setUploadingPhoto(false);
      }

      await axios.put(
        `${API_URL}/user/profile`,
        {
          name: editForm.name,
          email: editForm.email,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSnackbar({
        open: true,
        message: 'Profile updated successfully',
        severity: 'success',
      });
      setProfileEditOpen(false);
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
      setProfileSubmitting(false);
    }
  };

  const handleCreateOrg = () => {
    setOrgForm({
      name: '',
      type: authUser?.role === 'b2e_user' ? 'school' : 'company',
      segment: authUser?.role === 'b2e_user' ? 'B2E' : 'B2B',
      primaryContact: {
        name: authUser?.name || '',
        email: authUser?.email || '',
        phone: '',
        jobTitle: ''
      }
    });
    setSelectedOrg(null);
    setOrgDialogOpen(true);
  };

  const handleEditOrg = (org) => {
    setSelectedOrg(org);
    setOrgForm({
      name: org.name || '',
      type: org.type || 'company',
      customType: org.customType || '',
      segment: org.segment || 'B2B',
      primaryContact: {
        name: org.primaryContact?.name || authUser?.name || '',
        email: org.primaryContact?.email || authUser?.email || '',
        phone: org.primaryContact?.phone || '',
        jobTitle: org.primaryContact?.jobTitle || ''
      }
    });
    setOrgDialogOpen(true);
  };

  const handleSaveOrg = async () => {
    try {
      setSubmitting(true);
      const token = getAuthToken();

      const orgData = {
        name: orgForm.name,
        type: orgForm.type,
        customType: orgForm.type === 'other' ? orgForm.customType : '',
        segment: orgForm.segment,
        primaryContact: orgForm.primaryContact
      };

      if (selectedOrg) {
        await axios.put(`${API_URL}/user/organizations/${selectedOrg.id}`, orgData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSnackbar({
          open: true,
          message: 'Organization updated successfully',
          severity: 'success'
        });
      } else {
        await axios.post(`${API_URL}/user/organizations`, orgData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSnackbar({
          open: true,
          message: 'Organization created successfully',
          severity: 'success'
        });
      }

      setOrgDialogOpen(false);
      fetchOrganizations();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.error || 'Failed to save organization',
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };
  console.log("customPackageRequests", customPackageRequests)

  console.log("📦 Current packages state:", packages.length, packages);
  console.log("📦 Available custom packages state:", availableCustomPackages.length, availableCustomPackages);

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

  if (!dashboardData) {
    return null;
  }

  const { user, organizations: userOrgs, gameProgress } = dashboardData;

  // Check if user has incomplete game progress (has started but not completed all 3 levels)
  const hasIncompleteProgress = gameProgress && gameProgress.totalLevelsPlayed > 0 && gameProgress.totalLevelsPlayed < 3;
  
  // Determine which level to resume from (find the first incomplete level)
  const getResumeLevel = () => {
    if (!gameProgress) return null;
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: '#063C5E',
              }}
            >
              {user.role === 'b2e_user' ? 'Institute' : 'Organization'} Dashboard
            </Typography>
            {/* Create button hidden per requirement */}
          </Box>

          <Box
            sx={{
              position: 'relative',
              mb: 3,
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
                onChange={(e, newValue) => {
                  setSelectedTab(newValue);
                  const contentIndex = getContentIndex(newValue);

                  // Refresh packages when switching to packages tab
                  if (contentIndex === 4) {
                    fetchPackages();
                    fetchAvailableCustomPackages(); // Also fetch available custom packages for purchase
                    // Also fetch requests to include completed custom packages
                    fetchCustomPackageRequests();
                  }
                  // Fetch custom package requests when switching to that tab
                  if (contentIndex === 5) {
                    fetchCustomPackageRequests();
                    // Also refresh packages to show newly created custom packages
                    fetchPackages();
                  }
                }}
                variant="scrollable"
                scrollButtons={false}
              >
                <Tab label={user.role === 'b2e_user' ? 'My Institutes' : 'My Organizations'} />
                <Tab label={user.role === 'b2e_user' ? 'Students' : 'Members'} />
                {/* Student Activities tab commented out */}
                {/* <Tab label={user.role === 'b2e_user' ? 'Student Activities' : 'Member Activities'} /> */}
                <Tab
                  label={
                    memberRequests.length > 0
                      ? `Member Requests (${memberRequests.length})`
                      : 'Member Requests'
                  }
                />
                <Tab label={packages.length > 0 ? `Packages (${packages.length})` : 'Packages'} />
                {customPackageRequests.length > 0 && (
                  <Tab
                    label={
                      customPackageRequests.length > 0
                        ? `Custom Package Requests (${customPackageRequests.length})`
                        : 'Custom Package Requests'
                    }
                  />
                )}
                <Tab label="Profile" />
              </Tabs>
            </Box>
          </Box>

          {getContentIndex(selectedTab) === 0 && (
            <>
              <Grid container spacing={3}>
                {organizations && organizations.length > 0 ? (
                  organizations.map((org) => (
                    <Grid item xs={12} md={6} lg={4} key={org.id}>
                      <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)', borderRadius: 3, height: '100%' }}>
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                            <Box>
                              <Typography variant="h6" sx={{ fontWeight: 700, color: '#063C5E', mb: 1 }}>
                                {org.name}
                              </Typography>
                              <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                                {org.segment && (
                                  <Chip
                                    label={org.segment}
                                    size="small"
                                    color="primary"
                                    sx={{ fontWeight: 600 }}
                                  />
                                )}
                                <Chip
                                  label={org.type}
                                  size="small"
                                  variant="outlined"
                                />
                              </Stack>
                            </Box>
                            <IconButton
                              size="small"
                              onClick={() => handleEditOrg(org)}
                              sx={{ color: '#0B7897' }}
                              disabled={submitting}
                            >
                              <EditIcon />
                            </IconButton>
                          </Box>

                          <Divider sx={{ my: 2 }} />

                          {/* Resume Game Button - Show if user has incomplete progress */}
                          {hasIncompleteProgress && resumeLevel && (
                            <Button
                              variant="contained"
                              fullWidth
                              onClick={() => router.push(`/game?resume=${resumeLevel}`)}
                              sx={{
                                backgroundColor: '#0B7897',
                                color: '#fff',
                                mb: 2,
                                '&:hover': {
                                  backgroundColor: '#085f76',
                                },
                              }}
                            >
                              Resume Game
                            </Button>
                          )}

                          <Stack spacing={1}>
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                {user.role === 'b2e_user' ? 'Institute Code' : 'Organization Code'}
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {org.uniqueCode || 'N/A'}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Primary Contact
                              </Typography>
                              <Typography variant="body2">
                                {org.primaryContact?.name || 'N/A'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {org.primaryContact?.email || ''}
                              </Typography>
                            </Box>
                            {/* {org.description && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Description
                          </Typography>
                          <Typography variant="body2">
                            {org.description}
                          </Typography>
                        </Box>
                      )} */}
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Total Members
                              </Typography>
                              <Typography variant="body2">
                                <strong>
                                  {(org.userCount ?? org.membersCount ?? org.members?.length ?? org.students?.length ?? 0)} {user.role === 'b2e_user' ? 'Students' : 'Members'}
                                </strong>
                              </Typography>
                            </Box>
                            {(org.customPackagesCount || 0) > 0 && (
                              <Box>
                                <Typography variant="caption" color="text.secondary">
                                  Custom Packages
                                </Typography>
                                <Typography variant="body2">
                                  {org.customPackagesCount} packages
                                </Typography>
                              </Box>
                            )}
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Status
                              </Typography>
                              <Chip
                                label={org.status || 'prospect'}
                                size="small"
                                color={org.status === 'active' ? 'success' : 'default'}
                              />
                            </Box>
                            {org.type === 'other' && org.customType && (
                              <Box>
                                <Chip label={org.customType} size="small" variant="outlined" />
                              </Box>
                            )}
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Created At
                              </Typography>
                              <Typography variant="body2">
                                {org.createdAt ? new Date(org.createdAt).toLocaleDateString() : 'N/A'}
                              </Typography>
                            </Box>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))
                ) : loading ? (
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                      <CircularProgress />
                    </Box>
                  </Grid>
                ) : (
                  <Grid item xs={12}>
                    <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)', borderRadius: 3 }}>
                      <CardContent sx={{ p: 4, textAlign: 'center' }}>
                        <BusinessIcon sx={{ fontSize: 60, color: '#0B7897', mb: 2 }} />
                        <Typography variant="h6" sx={{ mb: 1, color: '#063C5E' }}>
                          {user.role === 'b2e_user'
                            ? 'No institute found for this account.'
                            : 'No organizations found.'}
                        </Typography>
                        {user.role !== 'b2e_user' && (
                          <>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                              Create your first organization to get started.
                            </Typography>
                            <Button
                              variant="contained"
                              startIcon={<AddIcon />}
                              onClick={handleCreateOrg}
                              sx={{
                                backgroundColor: '#0B7897',
                                '&:hover': { backgroundColor: '#063C5E' }
                              }}
                            >
                              Create Organization
                            </Button>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </Grid>

              {/* Transactions Table in First Tab */}
              {transactions.length > 0 && (
                <Grid container spacing={3} sx={{ mt: 2 }}>
                  <Grid item xs={12}>
                    <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)', borderRadius: 3 }}>
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: '#063C5E' }}>
                            Transactions ({transactions.length})
                          </Typography>
                          <Button
                            size="small"
                            onClick={fetchTransactions}
                            disabled={loadingTransactions}
                            startIcon={loadingTransactions ? <CircularProgress size={16} /> : null}
                          >
                            {loadingTransactions ? 'Loading...' : 'Refresh'}
                          </Button>
                        </Box>

                        {loadingTransactions ? (
                          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress />
                          </Box>
                        ) : (
                          <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 600 }}>
                            <Table stickyHeader>
                              <TableHead>
                                <TableRow sx={{ backgroundColor: '#F5F8FB' }}>
                                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                                  <TableCell sx={{ fontWeight: 600 }}>Package</TableCell>
                                  <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                                  <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                  <TableCell sx={{ fontWeight: 600 }}>Payment ID</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {transactions.map((tx) => {
                                  const packageName = tx.packageId?.name ||
                                    tx.customPackageId?.name ||
                                    (typeof tx.packageId === 'object' && tx.packageId?.name) ||
                                    tx.packageName ||
                                    'Unknown Package';
                                  const txType = tx.type || 'purchase';
                                  const amount = tx.amount || 0;
                                  const currency = tx.currency || 'EUR';
                                  const status = tx.status || 'pending';
                                  const createdAt = tx.createdAt || tx.created_at || new Date();
                                  const stripePaymentIntentId = tx.stripePaymentIntentId || 'N/A';

                                  return (
                                    <TableRow key={tx._id || tx.id} hover>
                                      <TableCell>
                                        <Typography variant="body2">
                                          {new Date(createdAt).toLocaleDateString('en-GB', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric'
                                          })}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          {new Date(createdAt).toLocaleTimeString('en-GB', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                          })}
                                        </Typography>
                                      </TableCell>
                                      <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                          {packageName}
                                        </Typography>
                                      </TableCell>
                                      <TableCell>
                                        <Chip
                                          label={txType.replace('_', ' ').toUpperCase()}
                                          size="small"
                                          sx={{ textTransform: 'capitalize' }}
                                        />
                                      </TableCell>
                                      <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                          {currency === 'EUR' ? '€' : currency} {amount.toFixed(2)}
                                        </Typography>
                                      </TableCell>
                                      <TableCell>
                                        <Chip
                                          label={status}
                                          size="small"
                                          color={
                                            status === 'paid'
                                              ? 'success'
                                              : status === 'pending'
                                                ? 'warning'
                                                : status === 'failed'
                                                  ? 'error'
                                                  : 'default'
                                          }
                                        />
                                      </TableCell>
                                      <TableCell>
                                        <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                                          {stripePaymentIntentId}
                                        </Typography>
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}
            </>
          )}

          {getContentIndex(selectedTab) === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)', borderRadius: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#063C5E' }}>
                        {user.role === 'b2e_user' ? 'All Students' : 'All Members'}
                      </Typography>
                      <Button
                        size="small"
                        onClick={fetchAllMembers}
                        disabled={loadingMembers}
                        startIcon={loadingMembers ? <CircularProgress size={16} /> : <PeopleIcon />}
                      >
                        {loadingMembers ? 'Loading...' : 'Refresh'}
                      </Button>
                    </Box>

                    {loadingMembers ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                      </Box>
                    ) : allMembers.length > 0 ? (
                      <TableContainer component={Paper} variant="outlined">
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell><strong>Name</strong></TableCell>
                              <TableCell><strong>Email</strong></TableCell>
                              <TableCell><strong>Status</strong></TableCell>
                              <TableCell><strong>Joined At</strong></TableCell>
                              <TableCell align="right"><strong>Actions</strong></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {allMembers.map((member) => (
                              <TableRow key={member.id}>
                                <TableCell>
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {member.name || 'N/A'}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2">
                                    {member.email || 'N/A'}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={member.memberStatus === 'approved' ? 'Approved' : member.memberStatus === 'pending' ? 'Pending' : member.memberStatus === 'rejected' ? 'Rejected' : 'Pending'}
                                    size="small"
                                    color={member.memberStatus === 'approved' ? 'success' : member.memberStatus === 'pending' ? 'warning' : 'error'}
                                    sx={{
                                      color: member.memberStatus === 'approved' ? '#fff' : undefined,
                                      fontWeight: 600,
                                    }}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2" color="text.secondary">
                                    {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : 'N/A'}
                                  </Typography>
                                </TableCell>
                                <TableCell align="right">
                                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                                    {/* <Button
                                      size="small"
                                      variant="outlined"
                                      startIcon={<VisibilityIcon />}
                                      onClick={() => router.push(`/dashboard/member/${member.id}`)}
                                    >
                                      View
                                    </Button> */}
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      color="error"
                                      startIcon={<DeleteIcon />}
                                      onClick={() => {
                                        setMemberToRemove(member.id);
                                        setRemoveDialogOpen(true);
                                      }}
                                      disabled={processingRequest === member.id}
                                    >
                                      Delete
                                    </Button>
                                  </Stack>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Alert severity="info">
                        {user.role === 'b2e_user'
                          ? 'No members found. Members will appear here once they join your institute.'
                          : 'No members found. Members will appear here once they join your organization.'}
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Member Activities content commented out */}
          {/* {selectedTab === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)', borderRadius: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#063C5E' }}>
                        Member Activities
                      </Typography>
                      <Button
                        size="small"
                        onClick={fetchMemberActivities}
                        disabled={loadingActivities}
                        startIcon={loadingActivities ? <CircularProgress size={16} /> : <AccessTimeIcon />}
                      >
                        {loadingActivities ? 'Loading...' : 'Refresh'}
                      </Button>
                    </Box>

                    {loadingActivities ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                      </Box>
                    ) : memberActivities.length > 0 ? (
                      <TableContainer component={Paper} variant="outlined">
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell><strong>Member</strong></TableCell>
                              <TableCell><strong>Activity</strong></TableCell>
                              <TableCell><strong>Date</strong></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {memberActivities.map((activity, index) => (
                              <TableRow key={index}>
                                <TableCell>
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {activity.memberName || 'Member'}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2">
                                    {activity.description || activity.type || 'Activity'}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2" color="text.secondary">
                                    {new Date(activity.timestamp).toLocaleString()}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Alert severity="info">
                        No member activities found. Activities will appear here as members use the platform.
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )} */}

          {getContentIndex(selectedTab) === 3 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)', borderRadius: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#063C5E' }}>
                        Pending Member Requests
                      </Typography>
                      <Button
                        size="small"
                        onClick={fetchMemberRequests}
                        disabled={loadingRequests}
                        startIcon={loadingRequests ? <CircularProgress size={16} /> : <PeopleIcon />}
                      >
                        {loadingRequests ? 'Loading...' : 'Refresh'}
                      </Button>
                    </Box>

                    {loadingRequests ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                      </Box>
                    ) : memberRequests.length > 0 ? (
                      <TableContainer component={Paper} variant="outlined">
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell><strong>Name</strong></TableCell>
                              <TableCell><strong>Email</strong></TableCell>
                              <TableCell><strong>Requested At</strong></TableCell>
                              <TableCell align="right"><strong>Actions</strong></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {memberRequests.map((request) => (
                              <TableRow key={request._id || request.id}>
                                <TableCell>
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {request.user?.name || 'N/A'}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2">
                                    {request.user?.email || 'N/A'}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2" color="text.secondary">
                                    {new Date(request.createdAt || request.requestedAt).toLocaleString()}
                                  </Typography>
                                </TableCell>
                                <TableCell align="right">
                                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                                    <Button
                                      size="small"
                                      variant="contained"
                                      color="success"
                                      onClick={() => handleApproveRequest(request._id || request.id)}
                                      disabled={processingRequest === (request._id || request.id)}
                                      startIcon={processingRequest === (request._id || request.id) ? <CircularProgress size={14} /> : null}
                                    >
                                      {processingRequest === (request._id || request.id) ? 'Processing...' : 'Approve'}
                                    </Button>
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      color="error"
                                      onClick={() => handleRejectRequest(request._id || request.id)}
                                      disabled={processingRequest === (request._id || request.id)}
                                      startIcon={processingRequest === (request._id || request.id) ? <CircularProgress size={14} /> : null}
                                    >
                                      {processingRequest === (request._id || request.id) ? 'Processing...' : 'Reject'}
                                    </Button>
                                  </Stack>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Alert severity="info">
                        No pending member requests at this time.
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {getContentIndex(selectedTab) === 4 && (
            <Grid container spacing={3}>
              {packages.length > 0 && (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#063C5E' }}>
                      Purchased Packages
                    </Typography>
                    <Button
                      size="small"
                      onClick={fetchPackages}
                      disabled={loadingPackages}
                      startIcon={loadingPackages ? <CircularProgress size={16} /> : null}
                    >
                      {loadingPackages ? 'Loading...' : 'Refresh'}
                    </Button>
                  </Box>
                </Grid>
              )}

              {loadingPackages ? (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                </Grid>
              ) : (packages.length > 0 || availableCustomPackages.length > 0) ? (
                <>
                  {packages.length > 0 && packages.map((pkg) => (
                    <Grid item xs={12} key={pkg._id || pkg.id}>
                      <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)', borderRadius: 3, height: '100%', position: 'relative' }}>
                        <CardContent sx={{ p: 3 }}>
                          {/* Price Chip - Top Right Corner */}
                          {pkg.contractPricing && (
                            <Chip
                              label={`${(pkg.contractPricing.currency || 'EUR') === 'EUR' ? '€' : pkg.contractPricing.currency || '€'}${pkg.contractPricing.amount || 0} ${pkg.contractPricing.billingType === 'one_time' ? '(One Time)' : pkg.contractPricing.billingType === 'subscription' ? '(Subscription)' : '(Per Seat)'}`}
                              size="small"
                              sx={{
                                position: 'absolute',
                                top: 16,
                                right: 16,
                                fontWeight: 600,
                                backgroundColor: '#0B7897',
                                color: '#fff',
                                '&:hover': {
                                  backgroundColor: '#063C5E'
                                }
                              }}
                            />
                          )}

                          <Box sx={{ mb: 2 }}>
                            {/* Package Name - Prominent - From Package table or Custom Package */}
                            <Typography variant="h5" sx={{ fontWeight: 700, color: '#063C5E', mb: 1.5 }}>
                              {pkg.customPackageId?.name || pkg.packageId?.name || pkg.name || 'Package'}
                            </Typography>

                            {/* Status and Type Chips - In a row */}
                            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                              {/* Status Chip - First */}
                              <Chip
                                label={pkg.contract?.status || pkg.status || 'pending'}
                                size="small"
                                color={
                                  (pkg.contract?.status || pkg.status) === 'active'
                                    ? 'success'
                                    : (pkg.contract?.status || pkg.status) === 'expired'
                                      ? 'error'
                                      : 'warning'
                                }
                                sx={{ fontWeight: 600 }}
                              />

                              {/* Package Type Chip - Second */}
                              {(pkg.packageId?.type || pkg.packageId?.packageType || pkg.transaction?.packageType || pkg.packageType) && (
                                <Chip
                                  label={(() => {
                                    const packageType = pkg.packageId?.type ||
                                      pkg.packageId?.packageType ||
                                      pkg.transaction?.packageType ||
                                      pkg.packageType || '';
                                    // Capitalize first letter and replace underscores with spaces
                                    return packageType
                                      .split('_')
                                      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                                      .join(' ');
                                  })()}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontWeight: 500 }}
                                />
                              )}

                              {/* {pkg.basePackageId && (
                              <Chip
                                label="Custom"
                                size="small"
                                variant="outlined"
                              />
                            )} */}
                            </Stack>
                          </Box>

                          <Divider sx={{ my: 2 }} />

                          {/* Package Tabs */}
                          <Box sx={{ width: '100%' }}>
                            <Tabs
                              value={packageTabs[pkg._id || pkg.id] || 0}
                              onChange={(e, newValue) => {
                                setPackageTabs({
                                  ...packageTabs,
                                  [pkg._id || pkg.id]: newValue
                                });
                              }}
                              sx={{
                                borderBottom: 1,
                                borderColor: 'divider',
                                mb: 2
                              }}
                            >
                              <Tab label="Package Information" />
                              <Tab label="Seats Information" />
                            </Tabs>

                            {/* Tab Panel 0: Package Information */}
                            {(packageTabs[pkg._id || pkg.id] ?? 0) === 0 && (
                              <Stack spacing={2}>
                                {/* Unique Code - Show prominently at top */}
                                {(pkg.uniqueCode || pkg.transaction?.uniqueCode) && (
                                  <Box sx={{
                                    p: 2.5,
                                    bgcolor: '#F5F8FB',
                                    borderRadius: 2,
                                    border: '2px solid #0B7897',
                                    textAlign: 'center',
                                    mb: 1,
                                    position: 'relative'
                                  }}>
                                    {/* Copy Button - Top Right Corner */}
                                    <Chip
                                      icon={<ContentCopyIcon sx={{ fontSize: '16px !important' }} />}
                                      label="Copy"
                                      onClick={() => {
                                        const code = pkg.uniqueCode || pkg.transaction?.uniqueCode;
                                        navigator.clipboard.writeText(code);
                                        setSnackbar({
                                          open: true,
                                          message: 'Code copied to clipboard!',
                                          severity: 'success'
                                        });
                                      }}
                                      sx={{
                                        position: 'absolute',
                                        top: 8,
                                        right: 8,
                                        cursor: 'pointer',
                                        backgroundColor: '#0B7897',
                                        color: '#fff',
                                        fontWeight: 600,
                                        fontSize: '0.75rem',
                                        height: '28px',
                                        '&:hover': {
                                          backgroundColor: '#063C5E',
                                        },
                                        '& .MuiChip-icon': {
                                          color: '#fff',
                                          marginLeft: '4px'
                                        }
                                      }}
                                    />
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 600 }}>
                                      Game Play Unique Code
                                    </Typography>
                                    <Typography
                                      variant="h5"
                                      sx={{
                                        fontWeight: 700,
                                        color: '#063C5E',
                                        fontFamily: 'monospace',
                                        letterSpacing: 2,
                                        fontSize: '1.5rem'
                                      }}
                                    >
                                      {pkg.uniqueCode || pkg.transaction?.uniqueCode}
                                    </Typography>
                                  </Box>
                                )}

                                {/* Expiry Date - Prioritize transaction's calculated expiry date */}
                                {(pkg.transaction?.contractPeriod?.endDate || pkg.contract?.endDate || pkg.packageExpiryDate || pkg.packageId?.expiryDate) && (
                                  <Box sx={{
                                    p: 2,
                                    bgcolor: '#FFF7ED',
                                    borderRadius: 2,
                                    border: '1px solid #FED7AA'
                                  }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#063C5E', mb: 1 }}>
                                      Package Expiry Date
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                                      {new Date(
                                        pkg.transaction?.contractPeriod?.endDate ||
                                        pkg.contract?.endDate ||
                                        pkg.packageExpiryDate ||
                                        pkg.packageId?.expiryDate
                                      ).toLocaleDateString('en-GB', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                      })}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {(() => {
                                        const endDate = new Date(
                                          pkg.transaction?.contractPeriod?.endDate ||
                                          pkg.contract?.endDate ||
                                          pkg.packageExpiryDate ||
                                          pkg.packageId?.expiryDate
                                        );
                                        const now = new Date();
                                        const diffTime = endDate - now;
                                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                        if (diffDays < 0) return '⚠️ Expired';
                                        if (diffDays === 0) return '⚠️ Expires today';
                                        if (diffDays === 1) return '⚠️ Expires tomorrow';
                                        if (diffDays <= 7) return `⚠️ ${diffDays} days remaining`;
                                        return `✅ ${diffDays} days remaining`;
                                      })()}
                                    </Typography>
                                  </Box>
                                )}

                                {/* Contract Start Date */}
                                {pkg.contract?.startDate && (
                                  <Box>
                                    <Typography variant="caption" color="text.secondary">
                                      Start Date
                                    </Typography>
                                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                                      {new Date(pkg.contract.startDate).toLocaleDateString('en-GB', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                      })}
                                    </Typography>
                                  </Box>
                                )}

                                {/* Transaction Status */}
                                {pkg.isTransaction && pkg.transaction && (
                                  <Box>
                                    <Typography variant="caption" color="text.secondary">
                                      Payment Status
                                    </Typography>
                                    <Chip
                                      label={pkg.transaction.status || 'pending'}
                                      size="small"
                                      color={
                                        pkg.transaction.status === 'paid'
                                          ? 'success'
                                          : pkg.transaction.status === 'failed'
                                            ? 'error'
                                            : 'warning'
                                      }
                                      sx={{ mt: 0.5, fontWeight: 600, ml: 3 }}
                                    />
                                  </Box>
                                )}
                              </Stack>
                            )}

                            {/* Tab Panel 1: Seats Information */}
                            {(packageTabs[pkg._id || pkg.id] ?? 0) === 1 && (
                              <Box>
                                {(pkg.seatLimit || pkg.transaction?.maxSeats || pkg.maxSeats) ? (
                                  <>
                                    {/* Seats Summary */}
                                    <Grid container spacing={2} sx={{ mb: 3 }}>
                                      <Grid item xs={4}>
                                        <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#F9FAFB', borderRadius: 2 }}>
                                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                            Total Seats
                                          </Typography>
                                          <Typography variant="h6" sx={{ fontWeight: 700, color: '#063C5E' }}>
                                            {pkg.transaction?.maxSeats || pkg.seatLimit || 0}
                                          </Typography>
                                        </Box>
                                      </Grid>
                                      <Grid item xs={4}>
                                        <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#F9FAFB', borderRadius: 2 }}>
                                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                            Used Seats
                                          </Typography>
                                          <Typography variant="h6" sx={{ fontWeight: 700, color: '#F59E0B' }}>
                                            {pkg.transaction?.usedSeats || pkg.usedSeats || 0}
                                          </Typography>
                                        </Box>
                                      </Grid>
                                      <Grid item xs={4}>
                                        <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#F9FAFB', borderRadius: 2 }}>
                                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                            Remaining
                                          </Typography>
                                          <Typography variant="h6" sx={{ fontWeight: 700, color: '#10B981' }}>
                                            {(pkg.transaction?.maxSeats || pkg.seatLimit || 0) - (pkg.transaction?.usedSeats || pkg.usedSeats || 0)}
                                          </Typography>
                                        </Box>
                                      </Grid>
                                    </Grid>

                                    {/* Users Table */}
                                    {pkg.transaction?.gamePlays && pkg.transaction.gamePlays.length > 0 ? (
                                      <Box>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#063C5E', mb: 2 }}>
                                          Users
                                        </Typography>
                                        <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
                                          <Table>
                                            <TableHead>
                                              <TableRow sx={{ backgroundColor: '#F5F8FB' }}>
                                                <TableCell><strong>User</strong></TableCell>
                                                <TableCell><strong>Email</strong></TableCell>
                                                <TableCell><strong>Played At</strong></TableCell>
                                                <TableCell align="right"><strong>Actions</strong></TableCell>
                                              </TableRow>
                                            </TableHead>
                                            <TableBody>
                                              {pkg.transaction.gamePlays.map((gamePlay, index) => (
                                                <TableRow key={index}>
                                                  <TableCell>
                                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                      {gamePlay.userId?.name || gamePlay.user?.name || 'Unknown User'}
                                                    </Typography>
                                                  </TableCell>
                                                  <TableCell>
                                                    <Typography variant="body2" color="text.secondary">
                                                      {gamePlay.userId?.email || gamePlay.user?.email || 'N/A'}
                                                    </Typography>
                                                  </TableCell>
                                                  <TableCell>
                                                    <Typography variant="body2" color="text.secondary">
                                                      {gamePlay.playedAt ? new Date(gamePlay.playedAt).toLocaleString() : 'N/A'}
                                                    </Typography>
                                                  </TableCell>
                                                  <TableCell align="right">
                                                    <Button
                                                      size="small"
                                                      variant="outlined"
                                                      startIcon={<VisibilityIcon />}
                                                      onClick={() => {
                                                        // Extract user ID properly - could be object or string
                                                        let userId = null;
                                                        if (gamePlay.userId) {
                                                          if (typeof gamePlay.userId === 'object') {
                                                            userId = gamePlay.userId._id || gamePlay.userId.id || gamePlay.userId;
                                                          } else {
                                                            userId = gamePlay.userId;
                                                          }
                                                        } else if (gamePlay.user) {
                                                          if (typeof gamePlay.user === 'object') {
                                                            userId = gamePlay.user._id || gamePlay.user.id || gamePlay.user;
                                                          } else {
                                                            userId = gamePlay.user;
                                                          }
                                                        }

                                                        if (userId) {
                                                          // Convert to string if it's an ObjectId
                                                          const userIdString = typeof userId === 'object' ? (userId.toString ? userId.toString() : userId._id || userId.id) : userId.toString();
                                                          // Pass user info for display in dialog
                                                          handleViewGameProgress(userIdString, {
                                                            name: gamePlay.userId?.name || gamePlay.user?.name,
                                                            email: gamePlay.userId?.email || gamePlay.user?.email
                                                          });
                                                        }
                                                      }}
                                                    >
                                                      View Progress
                                                    </Button>
                                                  </TableCell>
                                                </TableRow>
                                              ))}
                                            </TableBody>
                                          </Table>
                                        </TableContainer>
                                      </Box>
                                    ) : (
                                      <Alert severity="info">
                                        No seats have been used yet.
                                      </Alert>
                                    )}
                                  </>
                                ) : (
                                  <Alert severity="info">
                                    No seats information available for this package.
                                  </Alert>
                                )}
                              </Box>
                            )}
                          </Box>

                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </>
              ) : (
                <Grid item xs={12}>
                  <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)', borderRadius: 3 }}>
                    <CardContent sx={{ p: 6, textAlign: 'center' }}>
                      <Box sx={{ mb: 3 }}>
                        <BusinessIcon sx={{ fontSize: 64, color: '#0B7897', opacity: 0.6 }} />
                      </Box>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: '#063C5E', mb: 2 }}>
                        No Packages Yet
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#666', mb: 3, maxWidth: '500px', mx: 'auto' }}>
                        You don&apos;t have any packages at the moment. Packages will appear here once they are purchased.
                      </Typography>
                      <Button
                        variant="contained"
                        onClick={fetchPackages}
                        disabled={loadingPackages}
                        sx={{
                          backgroundColor: '#0B7897',
                          '&:hover': {
                            backgroundColor: '#063C5E'
                          }
                        }}
                      >
                        {loadingPackages ? 'Loading...' : 'Refresh'}
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Available Custom Packages for Purchase - Only show when packages are available */}
              {availableCustomPackages.length > 0 && (
                <>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, mt: 4 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#063C5E' }}>
                        Available Custom Packages
                      </Typography>
                      <Button
                        size="small"
                        onClick={fetchAvailableCustomPackages}
                        disabled={loadingAvailableCustomPackages}
                        startIcon={loadingAvailableCustomPackages ? <CircularProgress size={16} /> : null}
                      >
                        {loadingAvailableCustomPackages ? 'Loading...' : 'Refresh'}
                      </Button>
                    </Box>
                  </Grid>

                  {loadingAvailableCustomPackages ? (
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                      </Box>
                    </Grid>
                  ) : (
                    availableCustomPackages.map((cp) => {
                      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
                      const normalizedApiBase = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;

                      return (
                        <Grid item xs={12} md={6} lg={4} key={cp._id || cp.id}>
                          <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)', borderRadius: 3, height: '100%', position: 'relative', border: '2px solid #0B7897' }}>
                            <CardContent sx={{ p: 3 }}>
                              {/* Price Chip - Top Right Corner */}
                              {cp.contractPricing && (
                                <Chip
                                  label={`${(cp.contractPricing.currency || 'EUR') === 'EUR' ? '€' : cp.contractPricing.currency || '€'}${cp.contractPricing.amount || 0} ${cp.contractPricing.billingType === 'one_time' ? '(One Time)' : cp.contractPricing.billingType === 'subscription' ? '(Subscription)' : '(Per Seat)'}`}
                                  size="small"
                                  sx={{
                                    position: 'absolute',
                                    top: 16,
                                    right: 16,
                                    fontWeight: 600,
                                    backgroundColor: '#0B7897',
                                    color: '#fff',
                                    '&:hover': {
                                      backgroundColor: '#063C5E'
                                    }
                                  }}
                                />
                              )}

                              <Box sx={{ mb: 2 }}>
                                <Typography variant="h5" sx={{ fontWeight: 700, color: '#063C5E', mb: 1.5 }}>
                                  {cp.name || 'Custom Package'}
                                </Typography>

                                <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                                  <Chip
                                    label="Pending Purchase"
                                    size="small"
                                    color="warning"
                                    sx={{ fontWeight: 600 }}
                                  />
                                  <Chip
                                    label="Custom"
                                    size="small"
                                    variant="outlined"
                                    sx={{ fontWeight: 500 }}
                                  />
                                </Stack>
                              </Box>

                              <Divider sx={{ my: 2 }} />

                              <Stack spacing={2}>
                                {/* Products Section */}
                                {cp.productIds && cp.productIds.length > 0 && (
                                  <Box>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#063C5E', mb: 1.5 }}>
                                      Included Products
                                    </Typography>
                                    <Stack spacing={1.5}>
                                      {cp.productIds.map((product) => {
                                        const cleanImageUrl = product.imageUrl?.trim() || '';
                                        const resolvedImage = cleanImageUrl
                                          ? cleanImageUrl.startsWith('http')
                                            ? cleanImageUrl
                                            : `${normalizedApiBase}${cleanImageUrl.startsWith('/') ? cleanImageUrl : `/${cleanImageUrl}`}`
                                          : '/images/placeholders/product-default.svg';

                                        return (
                                          <Box
                                            key={product._id || product.id}
                                            sx={{
                                              display: 'flex',
                                              gap: 1.5,
                                              p: 1.5,
                                              border: '1px solid #e0e0e0',
                                              borderRadius: 2,
                                              backgroundColor: '#f9f9f9'
                                            }}
                                          >
                                            <Box
                                              component="img"
                                              src={resolvedImage}
                                              alt={product.name || 'Product'}
                                              sx={{
                                                width: 60,
                                                height: 60,
                                                objectFit: 'cover',
                                                borderRadius: 1,
                                                flexShrink: 0
                                              }}
                                            />
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#063C5E', mb: 0.5 }}>
                                                {product.name || 'Untitled Product'}
                                              </Typography>
                                              <Typography variant="body2" sx={{ fontWeight: 700, color: '#0B7897' }}>
                                                €{product.price || 0}
                                              </Typography>
                                            </Box>
                                          </Box>
                                        );
                                      })}
                                    </Stack>
                                  </Box>
                                )}

                                {/* Description */}
                                {cp.description && (
                                  <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Typography variant="caption" color="text.secondary">
                                        Description
                                      </Typography>
                                      <IconButton
                                        size="small"
                                        onClick={() => {
                                          setSelectedPackageDescription(cp.description);
                                          setDescriptionDialogOpen(true);
                                        }}
                                        sx={{
                                          color: '#0B7897',
                                          '&:hover': {
                                            backgroundColor: 'rgba(11, 120, 151, 0.1)'
                                          },
                                          p: 0.5
                                        }}
                                        title="View Description"
                                      >
                                        <VisibilityIcon fontSize="small" />
                                      </IconButton>
                                    </Box>
                                  </Box>
                                )}

                                {/* Seat Limit */}
                                <Box>
                                  <Typography variant="caption" color="text.secondary">
                                    Seat Limit
                                  </Typography>
                                  <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 600 }}>
                                    {cp.seatLimit || 0} seats
                                  </Typography>
                                </Box>

                                {/* Contract Duration */}
                                {cp.contract?.endDate && (
                                  <Box>
                                    <Typography variant="caption" color="text.secondary">
                                      Contract Duration
                                    </Typography>
                                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                                      {(() => {
                                        const startDate = new Date(cp.contract.startDate);
                                        const endDate = new Date(cp.contract.endDate);
                                        const months = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24 * 30));
                                        return `${months} months`;
                                      })()}
                                    </Typography>
                                  </Box>
                                )}

                                {/* Expiry Time */}
                                {cp.expiryTime && cp.expiryTimeUnit && (
                                  <Box>
                                    <Typography variant="caption" color="text.secondary">
                                      Expiry Time
                                    </Typography>
                                    <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 600 }}>
                                      {cp.expiryTime} {cp.expiryTimeUnit === 'months' ? 'Month(s)' : 'Year(s)'}
                                    </Typography>
                                  </Box>
                                )}

                                {/* Buy Now Button */}
                                <Button
                                  fullWidth
                                  variant="contained"
                                  onClick={() => handleBuyCustomPackage(cp)}
                                  sx={{
                                    mt: 2,
                                    bgcolor: '#0B7897',
                                    '&:hover': {
                                      bgcolor: '#063C5E'
                                    },
                                    fontWeight: 600,
                                    py: 1.5
                                  }}
                                >
                                  Buy Now
                                </Button>
                              </Stack>
                            </CardContent>
                          </Card>
                        </Grid>
                      );
                    })
                  )}
                </>
              )}
            </Grid>
          )}

          {getContentIndex(selectedTab) === 5 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)', borderRadius: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#063C5E' }}>
                        Custom Package Requests
                      </Typography>
                      <Button
                        size="small"
                        onClick={fetchCustomPackageRequests}
                        disabled={loadingCustomRequests}
                        startIcon={loadingCustomRequests ? <CircularProgress size={16} /> : <AccessTimeIcon />}
                      >
                        {loadingCustomRequests ? 'Loading...' : 'Refresh'}
                      </Button>
                    </Box>

                    {loadingCustomRequests ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                      </Box>
                    ) : customPackageRequests.length > 0 ? (
                      <TableContainer component={Paper} variant="outlined">
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell><strong>Request ID</strong></TableCell>
                              <TableCell><strong>Products</strong></TableCell>
                              <TableCell><strong>Organization</strong></TableCell>
                              <TableCell><strong>Contact</strong></TableCell>
                              <TableCell><strong>Status</strong></TableCell>
                              <TableCell><strong>Requested Seats</strong></TableCell>
                              <TableCell><strong>Submitted At</strong></TableCell>
                              <TableCell><strong>Admin Notes</strong></TableCell>
                              {/* <TableCell align="right"><strong>Actions</strong></TableCell> */}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {customPackageRequests.map((request) => (
                              <TableRow key={request._id || request.id}>
                                <TableCell>
                                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                                    {request._id?.toString().substring(0, 8).toUpperCase() || 'N/A'}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  {request.productIds && request.productIds.length > 0 ? (
                                    <Box>
                                      {request.productIds.map((product, idx) => (
                                        <Chip
                                          key={product._id || idx}
                                          label={`${product.name || 'Untitled'} (€${product.price || 0})`}
                                          size="small"
                                          sx={{
                                            mb: 0.5,
                                            mr: 0.5,
                                            backgroundColor: product.visibility === 'private'
                                              ? 'rgba(255, 152, 0, 0.1)'
                                              : 'rgba(76, 175, 80, 0.1)',
                                            color: product.visibility === 'private'
                                              ? '#FF9800'
                                              : '#4CAF50',
                                            fontWeight: 500
                                          }}
                                        />
                                      ))}
                                    </Box>
                                  ) : request.productId ? (
                                    <Chip
                                      label={`${request.productId.name || 'Untitled'} (€${request.productId.price || 0})`}
                                      size="small"
                                      sx={{
                                        backgroundColor: 'rgba(11, 120, 151, 0.1)',
                                        color: '#0B7897',
                                        fontWeight: 500
                                      }}
                                    />
                                  ) : (
                                    <Typography variant="body2" color="text.secondary">
                                      No products linked
                                    </Typography>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2">
                                    {request.organizationName || 'N/A'}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2">
                                    {request.contactName || 'N/A'}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {request.contactEmail || ''}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={request.status || 'pending'}
                                    size="small"
                                    color={
                                      request.status === 'approved' || request.status === 'completed'
                                        ? 'success'
                                        : request.status === 'rejected'
                                          ? 'error'
                                          : request.status === 'reviewing'
                                            ? 'warning'
                                            : 'default'
                                    }
                                    sx={{ fontWeight: 600 }}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2">
                                    {request.requestedModifications?.seatLimit || 'N/A'}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2" color="text.secondary">
                                    {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'N/A'}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  {request.adminNotes ? (
                                    <Button
                                      size="small"
                                      variant="text"
                                      onClick={() => {
                                        setSelectedRequestForNotes(request);
                                        setAdminNotesDialogOpen(true);
                                      }}
                                      sx={{
                                        textTransform: 'none',
                                        color: '#0B7897',
                                        '&:hover': {
                                          backgroundColor: 'rgba(11, 120, 151, 0.1)'
                                        }
                                      }}
                                    >
                                      View Notes
                                    </Button>
                                  ) : (
                                    <Typography variant="body2" color="text.secondary">
                                      -
                                    </Typography>
                                  )}
                                </TableCell>
                                {/* <TableCell align="right">
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    startIcon={<VisibilityIcon />}
                                    onClick={() => {
                                      // Open request detail dialog or navigate to detail page
                                      window.open(`/packages?requestId=${request._id}`, '_blank');
                                    }}
                                  >
                                    View
                                  </Button>
                                </TableCell> */}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Alert severity="info">
                        No custom package requests found. Submit a request to create a custom package.
                      </Alert>
                    )}

                    {/* Show Created Custom Packages - Only show if NOT purchased yet (no transaction exists) */}
                    {customPackageRequests.filter(req => {
                      if (!req.customPackageId) return false;
                      // Check if this custom package has been purchased (has transaction)
                      const cpId = req.customPackageId._id || req.customPackageId.id || req.customPackageId;
                      const isPurchased = packages.some(pkg => {
                        const pkgCustomId = pkg.customPackageId?._id || pkg.customPackageId?.id || pkg.customPackageId;
                        return pkgCustomId && cpId && pkgCustomId.toString() === cpId.toString();
                      });
                      return !isPurchased; // Only show if NOT purchased
                    }).length > 0 && (
                        <Box sx={{ mt: 4 }}>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: '#063C5E', mb: 2 }}>
                            Created Custom Packages (Available for Purchase)
                          </Typography>
                          <Grid container spacing={2}>
                            {customPackageRequests
                              .filter(req => {
                                if (!req.customPackageId) return false;
                                // Check if this custom package has been purchased (has transaction)
                                const cpId = req.customPackageId._id || req.customPackageId.id || req.customPackageId;
                                const isPurchased = packages.some(pkg => {
                                  const pkgCustomId = pkg.customPackageId?._id || pkg.customPackageId?.id || pkg.customPackageId;
                                  return pkgCustomId && cpId && pkgCustomId.toString() === cpId.toString();
                                });
                                return !isPurchased; // Only show if NOT purchased
                              })
                              .map((request) => {
                                const cp = request.customPackageId;
                                // Debug: Log product data
                                if (cp && cp.productIds) {
                                  console.log('📦 Custom Package Products:', {
                                    packageId: cp._id,
                                    packageName: cp.name,
                                    productIds: cp.productIds,
                                    productCount: cp.productIds.length,
                                    firstProduct: cp.productIds[0]
                                  });
                                }
                                return (
                                  <Grid item xs={12} md={6} lg={4} key={cp._id || cp.id}>
                                    <Card sx={{
                                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                      borderRadius: 3,
                                      height: '100%',
                                      border: '2px solid #4CAF50'
                                    }}>
                                      <CardContent sx={{ p: 3 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                                          <Typography variant="h6" sx={{ fontWeight: 700, color: '#063C5E' }}>
                                            {cp.name || 'Custom Package'}
                                          </Typography>
                                          <Chip
                                            label={cp.status || 'active'}
                                            size="small"
                                            color="success"
                                            sx={{ fontWeight: 600 }}
                                          />
                                        </Box>

                                        {cp.description && (
                                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            {cp.description}
                                          </Typography>
                                        )}

                                        <Divider sx={{ my: 2 }} />

                                        <Stack spacing={1.5}>
                                          <Box>
                                            <Typography variant="caption" color="text.secondary">
                                              Package Price
                                            </Typography>
                                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                              {cp.contractPricing?.currency === 'EUR' ? '€' : cp.contractPricing?.currency || '€'}
                                              {cp.contractPricing?.amount || 0} {' '}
                                              {cp.contractPricing?.billingType === 'one_time' ? '(One Time)' :
                                                cp.contractPricing?.billingType === 'subscription' ? '(Subscription)' :
                                                  '(Per Seat)'}
                                            </Typography>
                                          </Box>

                                          <Box>
                                            <Typography variant="caption" color="text.secondary">
                                              Seat Limit
                                            </Typography>
                                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                              {cp.seatLimit || 'N/A'}
                                            </Typography>
                                          </Box>

                                          {cp.contract?.startDate && (
                                            <Box>
                                              <Typography variant="caption" color="text.secondary">
                                                Contract Start Date
                                              </Typography>
                                              <Typography variant="body2">
                                                {new Date(cp.contract.startDate).toLocaleDateString()}
                                              </Typography>
                                            </Box>
                                          )}

                                          {cp.contract?.endDate && (
                                            <Box>
                                              <Typography variant="caption" color="text.secondary">
                                                Contract End Date
                                              </Typography>
                                              <Typography variant="body2">
                                                {new Date(cp.contract.endDate).toLocaleDateString()}
                                              </Typography>
                                            </Box>
                                          )}

                                          {cp.productIds && cp.productIds.length > 0 && (
                                            <Box>
                                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                                Products ({cp.productIds.length})
                                              </Typography>
                                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                {cp.productIds.map((product, idx) => (
                                                  <Card
                                                    key={product._id || idx}
                                                    sx={{
                                                      border: '1px solid #e0e0e0',
                                                      borderRadius: 2,
                                                      p: 1,
                                                      display: 'flex',
                                                      alignItems: 'center',
                                                      gap: 1.5,
                                                      cursor: 'pointer',
                                                      '&:hover': {
                                                        boxShadow: 2,
                                                        borderColor: '#0B7897'
                                                      }
                                                    }}
                                                    onClick={() => {
                                                      setSelectedProduct(product);
                                                      setProductDetailsDialogOpen(true);
                                                    }}
                                                  >
                                                    {/* Product Image */}
                                                    {product.imageUrl ? (
                                                      <Box
                                                        component="img"
                                                        src={product.imageUrl}
                                                        alt={product.name || 'Product'}
                                                        sx={{
                                                          width: 60,
                                                          height: 60,
                                                          objectFit: 'cover',
                                                          borderRadius: 1,
                                                          flexShrink: 0
                                                        }}
                                                      />
                                                    ) : (
                                                      <Box
                                                        sx={{
                                                          width: 60,
                                                          height: 60,
                                                          bgcolor: '#e0e0e0',
                                                          borderRadius: 1,
                                                          display: 'flex',
                                                          alignItems: 'center',
                                                          justifyContent: 'center',
                                                          flexShrink: 0
                                                        }}
                                                      >
                                                        <BusinessIcon sx={{ color: '#999' }} />
                                                      </Box>
                                                    )}

                                                    {/* Product Info */}
                                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                                      <Typography
                                                        variant="body2"
                                                        sx={{
                                                          fontWeight: 600,
                                                          color: '#063C5E',
                                                          mb: 0.5,
                                                          overflow: 'hidden',
                                                          textOverflow: 'ellipsis',
                                                          whiteSpace: 'nowrap'
                                                        }}
                                                      >
                                                        {product.name || 'Product'}
                                                      </Typography>
                                                      {product.price !== undefined && (
                                                        <Typography variant="caption" color="text.secondary">
                                                          €{product.price || 0}
                                                        </Typography>
                                                      )}
                                                    </Box>

                                                    {/* View Details Icon Button */}
                                                    <IconButton
                                                      size="small"
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedProduct(product);
                                                        setProductDetailsDialogOpen(true);
                                                      }}
                                                      sx={{
                                                        color: '#0B7897',
                                                        flexShrink: 0,
                                                        '&:hover': {
                                                          bgcolor: '#063C5E',
                                                          color: '#fff'
                                                        }
                                                      }}
                                                    >
                                                      <VisibilityIcon fontSize="small" />
                                                    </IconButton>
                                                  </Card>
                                                ))}
                                              </Box>
                                            </Box>
                                          )}
                                        </Stack>

                                        <Divider sx={{ my: 2 }} />

                                        {/* Buy Now Button */}
                                        <Button
                                          fullWidth
                                          variant="contained"
                                          onClick={() => handleBuyCustomPackage(cp)}
                                          sx={{
                                            bgcolor: '#0B7897',
                                            color: '#fff',
                                            fontWeight: 600,
                                            py: 1.5,
                                            '&:hover': {
                                              bgcolor: '#063C5E'
                                            }
                                          }}
                                        >
                                          Buy Now
                                        </Button>
                                      </CardContent>
                                    </Card>
                                  </Grid>
                                );
                              })}
                          </Grid>
                        </Box>
                      )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Admin Notes Dialog */}
          <Dialog
            open={adminNotesDialogOpen}
            onClose={() => {
              setAdminNotesDialogOpen(false);
              setSelectedRequestForNotes(null);
            }}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>
              Admin Notes
              {selectedRequestForNotes && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  Request ID: {selectedRequestForNotes._id?.toString().substring(0, 8).toUpperCase() || 'N/A'}
                </Typography>
              )}
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', mt: 2 }}>
                {selectedRequestForNotes?.adminNotes || 'No notes available.'}
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => {
                  setAdminNotesDialogOpen(false);
                  setSelectedRequestForNotes(null);
                }}
                variant="contained"
                sx={{ bgcolor: '#0B7897', '&:hover': { bgcolor: '#063C5E' } }}
              >
                Close
              </Button>
            </DialogActions>
          </Dialog>

          {getContentIndex(selectedTab) === 6 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)', borderRadius: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar
                          src={getProfilePhotoUrl(user.profilePhoto) || undefined}
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
                      {/* <Box     onClick={handleOpenProfileEdit}> */}

                      {/* <EditIcon    />
                      </Box> */}

                      <Button
                        variant="contained"
                        startIcon={<EditIcon />}
                        onClick={handleOpenProfileEdit}
                        sx={{ backgroundColor: '#0B7897', '&:hover': { backgroundColor: '#063C5E' } }}
                      >
                        Edit
                      </Button>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Account Status
                        </Typography>
                        <Chip
                          label={user.isActive ? 'Active' : 'Disabled'}
                          color={user.isActive ? 'success' : 'default'}
                          size="small"
                          sx={{ mt: 0.5, ml: 2 }}
                        />
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Role
                        </Typography>
                        <Typography variant="body2">
                          {user.role === 'b2b_user' ? 'Business User (B2B)' : user.role === 'b2e_user' ? 'Education User (B2E)' : 'B2C User'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Member Since
                        </Typography>
                        <Typography variant="body2">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </Container>
      </Box>

      {/* Organization Dialog */}
      <Dialog open={orgDialogOpen} onClose={() => setOrgDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedOrg ? 'Edit Organization' : `Create ${user.role === 'b2e_user' ? 'School' : 'Organization'}`}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label={`${user.role === 'b2e_user' ? 'School' : 'Organization'} Name`}
              value={orgForm.name}
              onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
              required
            />
            <TextField
              fullWidth
              select
              label={`${user.role === 'b2e_user' ? 'School' : 'Organization'} Type`}
              value={orgForm.type}
              onChange={(e) => setOrgForm({ ...orgForm, type: e.target.value })}
              required
              SelectProps={{ native: true }}
            >
              {user.role === 'b2e_user' ? (
                <>
                  <option value="school">School</option>
                  <option value="govt">Government Institution</option>
                  <option value="other">Other</option>
                </>
              ) : (
                <>
                  <option value="company">Company</option>
                  <option value="bank">Bank</option>
                  <option value="govt">Government</option>
                  <option value="other">Other</option>
                </>
              )}
            </TextField>
            {orgForm.type === 'other' && (
              <TextField
                fullWidth
                label="Specify Type"
                value={orgForm.customType}
                onChange={(e) => setOrgForm({ ...orgForm, customType: e.target.value })}
                helperText="Provide the custom organization/school type"
                required
              />
            )}
            <Divider />
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Primary Contact
            </Typography>
            <TextField
              fullWidth
              label="Contact Name"
              value={orgForm.primaryContact.name}
              onChange={(e) => setOrgForm({
                ...orgForm,
                primaryContact: { ...orgForm.primaryContact, name: e.target.value }
              })}
              required
            />
            <TextField
              fullWidth
              label="Contact Email"
              type="email"
              value={orgForm.primaryContact.email}
              onChange={(e) => setOrgForm({
                ...orgForm,
                primaryContact: { ...orgForm.primaryContact, email: e.target.value }
              })}
              required
            />
            <TextField
              fullWidth
              label="Contact Phone"
              value={orgForm.primaryContact.phone}
              onChange={(e) => setOrgForm({
                ...orgForm,
                primaryContact: { ...orgForm.primaryContact, phone: e.target.value }
              })}
            />
            <TextField
              fullWidth
              label="Job Title"
              value={orgForm.primaryContact.jobTitle}
              onChange={(e) => setOrgForm({
                ...orgForm,
                primaryContact: { ...orgForm.primaryContact, jobTitle: e.target.value }
              })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOrgDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSaveOrg}
            variant="contained"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={16} /> : null}
            sx={{ backgroundColor: '#0B7897', '&:hover': { backgroundColor: '#063C5E' } }}
          >
            {submitting ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Profile Edit Dialog */}
      <Dialog open={profileEditOpen} onClose={() => setProfileEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                src={profilePhotoPreview || getProfilePhotoUrl(dashboardData?.user?.profilePhoto) || undefined}
                sx={{ width: 72, height: 72, bgcolor: '#0B7897' }}
              >
                {dashboardData?.user?.name?.charAt(0)?.toUpperCase() || dashboardData?.user?.email?.charAt(0)?.toUpperCase()}
              </Avatar>
              <Stack direction="row" spacing={1}>
                <Button variant="outlined" component="label">
                  Upload Photo
                  <input type="file" hidden accept="image/*" onChange={handleProfilePhotoChange} />
                </Button>
                {(profilePhotoPreview || dashboardData?.user?.profilePhoto) && (
                  <Button
                    variant="text"
                    color="error"
                    onClick={handleDeleteProfilePhoto}
                    disabled={uploadingPhoto}
                  >
                    {uploadingPhoto ? 'Removing...' : 'Remove'}
                  </Button>
                )}
              </Stack>
            </Box>

            <TextField
              fullWidth
              label="Name"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProfileEditOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSaveProfile}
            variant="contained"
            disabled={profileSubmitting}
            startIcon={profileSubmitting ? <CircularProgress size={16} /> : null}
            sx={{ backgroundColor: '#0B7897', '&:hover': { backgroundColor: '#063C5E' } }}
          >
            {profileSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Remove Member Confirmation Dialog */}
      <Dialog open={removeDialogOpen} onClose={() => { setRemoveDialogOpen(false); setMemberToRemove(null); }}>
        <DialogTitle>Confirm Removal</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove this member? This user will no longer be a member of your {authUser?.schoolId || authUser?.role === 'b2e_user' ? 'institute' : 'organization'}. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setRemoveDialogOpen(false); setMemberToRemove(null); }}>Cancel</Button>
          <Button color="error" onClick={handleConfirmRemove} disabled={processingRequest === memberToRemove}>
            {processingRequest === memberToRemove ? 'Removing...' : 'Remove'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Game Progress Dialog */}
      <Dialog
        open={progressDialogOpen}
        onClose={() => {
          setProgressDialogOpen(false);
          setSelectedUserForProgress(null);
          setSelectedUserInfo(null);
          setUserGameProgress(null);
        }}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Game Progress
          {selectedUserInfo && (
            <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 400 }}>
              {selectedUserInfo.name} ({selectedUserInfo.email})
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          {loadingProgress ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : userGameProgress ? (
            <Box>
              {(() => {
                // Level-wise structure with Accordion
                const hasAnyProgress = [1, 2, 3].some(levelNum => {
                  const levelArray = userGameProgress[`level${levelNum}`] || [];
                  return levelArray.length > 0;
                });

                if (!hasAnyProgress) {
                  return <Alert severity="info">No game progress found for this user.</Alert>;
                }

                return [1, 2, 3].map(levelNum => {
                  const levelArray = userGameProgress[`level${levelNum}`] || [];
                  const levelStats = userGameProgress[`level${levelNum}Stats`] || {};

                  // Calculate level totals
                  const levelTotalScore = levelStats.totalScore || 0;
                  const levelMaxScore = levelStats.maxScore || 0;
                  const levelCorrectAnswers = levelStats.correctAnswers || 0;
                  const levelTotalQuestions = levelStats.totalQuestions || 0;
                  const levelPercentage = levelMaxScore > 0 ? Math.round((levelTotalScore / levelMaxScore) * 100) : 0;

                  return (
                    <Accordion
                      key={levelNum}
                      defaultExpanded={levelNum === 1}
                      sx={{
                        mb: 2,
                        '&:before': {
                          display: 'none',
                        },
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        borderRadius: '8px !important',
                        overflow: 'hidden',
                      }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon sx={{ color: '#063C5E' }} />}
                        sx={{
                          backgroundColor: '#F5F8FB',
                          borderBottom: '2px solid #0B7897',
                          '&:hover': {
                            backgroundColor: '#E8F4F8',
                          },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', pr: 2 }}>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: '#063C5E', flexGrow: 1 }}>
                            Level {levelNum}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                Score
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#063C5E' }}>
                                {levelTotalScore} / {levelMaxScore}
                              </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                Correct
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                                {levelCorrectAnswers} / {levelTotalQuestions}
                              </Typography>
                            </Box>
                            <Chip
                              label={`${levelPercentage}%`}
                              size="small"
                              color={levelPercentage >= 80 ? 'success' : levelPercentage >= 50 ? 'warning' : 'error'}
                              sx={{ fontWeight: 700 }}
                            />
                          </Box>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails sx={{ p: 0 }}>
                        {levelArray.length === 0 ? (
                          <Box sx={{ p: 3 }}>
                            <Alert severity="info">
                              No cards played in Level {levelNum} yet.
                            </Alert>
                          </Box>
                        ) : (
                          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 0 }}>
                            <Table>
                              <TableHead>
                                <TableRow sx={{ backgroundColor: '#F5F8FB' }}>
                                  <TableCell><strong>Title</strong></TableCell>
                                  <TableCell><strong>Score</strong></TableCell>
                                  <TableCell><strong>Correct Answers</strong></TableCell>
                                  <TableCell><strong>Percentage</strong></TableCell>
                                  <TableCell><strong>Completed Time</strong></TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {levelArray.map((card, cardIndex) => {
                                  const cardTitle = card.cardTitle || card.cardId?.title || 'Unknown Card';
                                  const cardScore = card.cardTotalScore || 0;
                                  const cardMaxScore = card.cardMaxScore || 0;
                                  const cardCorrect = card.cardCorrectAnswers || 0;
                                  const cardTotal = card.cardTotalQuestions || 0;
                                  const cardPercentage = card.cardPercentageScore || 0;
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
                      </AccordionDetails>
                    </Accordion>
                  );
                });
              })()}
            </Box>
          ) : (
            <Alert severity="info">No game progress found for this user.</Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setProgressDialogOpen(false);
            setSelectedUserForProgress(null);
            setSelectedUserInfo(null);
            setUserGameProgress(null);
          }}>
            Close
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

      {/* Description Dialog */}
      <Dialog
        open={descriptionDialogOpen}
        onClose={() => setDescriptionDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#063C5E' }}>
          Package Description
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mt: 1 }}>
            {selectedPackageDescription || 'No description available.'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDescriptionDialogOpen(false)}
            variant="contained"
            sx={{ bgcolor: '#0B7897', '&:hover': { bgcolor: '#063C5E' } }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Product Details Dialog */}
      <Dialog
        open={productDetailsDialogOpen}
        onClose={() => {
          setProductDetailsDialogOpen(false);
          setSelectedProduct(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#063C5E', display: 'flex', alignItems: 'center', gap: 2 }}>
          {selectedProduct?.imageUrl && (
            <Box
              component="img"
              src={selectedProduct.imageUrl}
              alt={selectedProduct.name || 'Product'}
              sx={{
                width: 60,
                height: 60,
                objectFit: 'cover',
                borderRadius: 1
              }}
            />
          )}
          <Box>
            <Typography variant="h6">{selectedProduct?.name || 'Product Details'}</Typography>
            {selectedProduct?.price !== undefined && (
              <Typography variant="body2" color="text.secondary">
                €{selectedProduct.price || 0}
              </Typography>
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedProduct && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              {/* Product Image */}
              {selectedProduct.imageUrl && (
                <Box
                  component="img"
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.name || 'Product'}
                  sx={{
                    width: '100%',
                    maxHeight: 300,
                    objectFit: 'contain',
                    borderRadius: 2,
                    bgcolor: '#f5f5f5',
                    p: 2
                  }}
                />
              )}

              {/* Product Description */}
              {selectedProduct.description && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Description
                  </Typography>
                  <Box
                    sx={{
                      '& p': {
                        mb: 2,
                        lineHeight: 1.6,
                        '&:last-child': {
                          mb: 0,
                        },
                      },
                      '& strong': {
                        fontWeight: 700,
                        color: '#063C5E',
                      },
                      '& ul, & ol': {
                        pl: 3,
                        mb: 2,
                      },
                      '& li': {
                        mb: 1,
                      },
                    }}
                    dangerouslySetInnerHTML={{ __html: selectedProduct.description }}
                  />
                </Box>
              )}

              {/* Product Price */}
              {selectedProduct.price !== undefined && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Price
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#063C5E' }}>
                    €{selectedProduct.price || 0}
                  </Typography>
                </Box>
              )}

              {/* Attached Cards */}
              {(selectedProduct.level1?.length > 0 || selectedProduct.level2?.length > 0 || selectedProduct.level3?.length > 0) && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Attached Cards
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {selectedProduct.level1?.length > 0 && (
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                          Level 1 ({selectedProduct.level1.length} cards)
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selectedProduct.level1.map((card, idx) => (
                            <Chip
                              key={card._id || idx}
                              label={card.title || `Card ${idx + 1}`}
                              size="small"
                              sx={{ fontSize: '0.75rem' }}
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
                    {selectedProduct.level2?.length > 0 && (
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                          Level 2 ({selectedProduct.level2.length} cards)
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selectedProduct.level2.map((card, idx) => (
                            <Chip
                              key={card._id || idx}
                              label={card.title || `Card ${idx + 1}`}
                              size="small"
                              sx={{ fontSize: '0.75rem' }}
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
                    {selectedProduct.level3?.length > 0 && (
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                          Level 3 ({selectedProduct.level3.length} cards)
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selectedProduct.level3.map((card, idx) => (
                            <Chip
                              key={card._id || idx}
                              label={card.title || `Card ${idx + 1}`}
                              size="small"
                              sx={{ fontSize: '0.75rem' }}
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Box>
              )}

              {/* Product Visibility */}
              {selectedProduct.visibility !== undefined && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Visibility
                  </Typography>
                  <Chip
                    label={selectedProduct.visibility === 'public' ? 'Public' : 'Private'}
                    color={selectedProduct.visibility === 'public' ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
              )}

              {/* Product Category */}
              {selectedProduct.category && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Category
                  </Typography>
                  <Chip label={selectedProduct.category} size="small" />
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setProductDetailsDialogOpen(false);
              setSelectedProduct(null);
            }}
            variant="contained"
            sx={{ bgcolor: '#0B7897', '&:hover': { bgcolor: '#063C5E' } }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </>
  );
}

