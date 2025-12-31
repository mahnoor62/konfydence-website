'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { 
  Container, 
  Typography, 
  Grid, 
  Box, 
  Card, 
  CardContent, 
  Button, 
  Stack, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ErrorDisplay from '@/components/ErrorDisplay';
import LoadingState from '@/components/LoadingState';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_URL environment variable is missing!');
}
const API_URL = `${API_BASE_URL}/api`;
const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

export default function PackagesPage() {
  const router = useRouter();
  const { type, productId } = router.query; // Get product type and productId from query parameter
  const { user, requireAuth } = useAuth();
  
  const [packages, setPackages] = useState([]);
  const [allPackages, setAllPackages] = useState([]); // Store all packages
  const [customPackages, setCustomPackages] = useState([]); // Store custom packages
  const [loading, setLoading] = useState(true);
  const [loadingCustomPackages, setLoadingCustomPackages] = useState(false);
  const [error, setError] = useState(null);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [processingPurchase, setProcessingPurchase] = useState(null);
  const [processingFreeTrial, setProcessingFreeTrial] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('organizations_schools'); // 'organizations_schools', 'families', 'custom'
  const [hasB2BPackages, setHasB2BPackages] = useState(false); // Track if B2B/B2E packages exist
  const [hasUsedFreeTrial, setHasUsedFreeTrial] = useState(false); // Track if user has used free trial
  const [requestForm, setRequestForm] = useState({
    entityType: '',
    organizationName: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    additionalNotes: '',
    seatLimit: '',
    customPricing: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [product, setProduct] = useState(null); // Store product data when productId is present
  const [roleMismatch, setRoleMismatch] = useState({ show: false, message: '' }); // Track role mismatch

  // Determine if we should show "Request Custom Package" button
  // Show only for B2B/B2E, not for B2C
  // If no type specified, default to showing all packages (backward compatibility)
  const showRequestCustomButton = type === 'B2B' || type === 'B2E' || type === 'B2B_B2E';

  const fetchPackages = useCallback(async (categoryOverride = null) => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        _t: Date.now(), // Timestamp to prevent caching - ensures fresh data on every call
      };

      // Determine which category to use for filtering
      let categoryToUse = categoryOverride || selectedCategory;
      if (type === 'B2C') {
        categoryToUse = 'families';
      } else if (type === 'B2B' || type === 'B2E') {
        categoryToUse = 'organizations_schools';
      }

      // If type is specified in URL, use it (for backward compatibility)
      // For B2B/B2E, always fetch all B2B and B2E packages
      if (type === 'B2B' || type === 'B2E' || type === 'B2B_B2E') {
        params.targetAudience = 'B2B_B2E'; // Always fetch all B2B and B2E packages
      } else if (type === 'B2C') {
        params.targetAudience = 'B2C';
      } else {
        // If no type specified, use category to determine targetAudience
        if (categoryToUse === 'organizations_schools') {
          params.targetAudience = 'B2B_B2E'; // Fetch B2B and B2E packages
        } else if (categoryToUse === 'families') {
          params.targetAudience = 'B2C'; // Fetch B2C packages
        }
        // If categoryToUse is neither, fetch all packages (no targetAudience param)
      }

      const url = `${API_URL}/packages/public`;
      console.log('📡 API: GET', url, params, 'Headers:', NO_CACHE_HEADERS);
      const res = await axios.get(url, {
        headers: NO_CACHE_HEADERS,
        params,
      });
      const fetchedPackages = res.data || [];
      setAllPackages(fetchedPackages);
      
      // Apply client-side filtering as well to ensure correct filtering
      filterPackagesByCategory(fetchedPackages, categoryToUse);
    } catch (err) {
      console.error('❌ Error fetching packages:', {
        error: err.response?.data || err.message,
        status: err.response?.status,
      });
      setError(err);
      setPackages([]);
      setAllPackages([]);
    } finally {
      setLoading(false);
    }
  }, [type, selectedCategory]);

  // Check if user has used free trial
  const checkFreeTrialUsage = useCallback(async () => {
    if (!user) {
      setHasUsedFreeTrial(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setHasUsedFreeTrial(false);
        return;
      }

      const response = await axios.get(`${API_URL}/free-trial/has-used-trial`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setHasUsedFreeTrial(response.data.hasUsedTrial || false);
    } catch (error) {
      console.error('Error checking free trial usage:', error);
      // If error, assume user hasn't used trial (show card)
      setHasUsedFreeTrial(false);
    }
  }, [user]);

  // Fetch custom packages
  const fetchCustomPackages = useCallback(async () => {
    // Only fetch if user is logged in (B2B/B2E users)
    if (!user || (user.role !== 'b2b_user' && user.role !== 'b2e_user')) {
      setCustomPackages([]);
      return;
    }
    
    try {
      setLoadingCustomPackages(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setCustomPackages([]);
        return;
      }

      console.log('🔍 Fetching custom packages for user:', user._id, 'Role:', user.role);
      const response = await axios.get(`${API_URL}/custom-packages`, {
        headers: {
          Authorization: `Bearer ${token}`,
          ...NO_CACHE_HEADERS
        }
      });

      console.log('📦 Custom packages response:', response.data);
      if (Array.isArray(response.data)) {
        // Filter custom packages that are available for purchase
        // Only show packages with status 'pending' (not yet purchased)
        // Once purchased, they will have a transaction and won't show here
        const availableCustomPackages = response.data.filter(cp => {
          // Only show pending packages (not yet purchased)
          // Active packages are already purchased and should not show for purchase again
          const isPending = cp.status === 'pending';
          console.log('📦 Custom package:', cp._id, 'Status:', cp.status, 'IsPending:', isPending);
          return isPending;
        });
        console.log('✅ Available custom packages for purchase:', availableCustomPackages.length);
        setCustomPackages(availableCustomPackages);
      } else {
        setCustomPackages([]);
      }
    } catch (err) {
      console.error('❌ Error fetching custom packages:', err);
      setCustomPackages([]);
    } finally {
      setLoadingCustomPackages(false);
    }
  }, [user]);

  // Fetch product data when productId is present
  const fetchProduct = useCallback(async () => {
    if (!productId) {
      setProduct(null);
      setRoleMismatch({ show: false, message: '' });
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/products/${productId}`, {
        headers: NO_CACHE_HEADERS
      });
      const fetchedProduct = response.data;
      setProduct(fetchedProduct);

      // Check URL type parameter first - if type matches user role, don't show error
      if (user && user.role) {
        const userRole = user.role;
        const urlType = type; // Get type from URL query parameter

        // Check if URL type matches user role
        let urlTypeMatchesRole = false;
        if (urlType === 'B2B' && (userRole === 'b2b_user' || userRole === 'b2b_member' || userRole === 'admin')) {
          urlTypeMatchesRole = true;
        } else if (urlType === 'B2E' && (userRole === 'b2e_user' || userRole === 'b2e_member' || userRole === 'admin')) {
          urlTypeMatchesRole = true;
        } else if (urlType === 'B2C' && (userRole === 'b2c_user' || userRole === 'admin')) {
          urlTypeMatchesRole = true;
        }

        // If URL type matches user role, don't show error (user chose correct type)
        if (urlTypeMatchesRole) {
          setRoleMismatch({ show: false, message: '' });
          return;
        }

        // If URL type doesn't match user role, check product targetAudience
        const productTargetAudience = fetchedProduct.targetAudience || fetchedProduct.category;
        let mismatch = false;
        let message = '';

        // Map product targetAudience to user roles
        // businesses → B2B (b2b_user, b2b_member)
        // schools → B2E (b2e_user, b2e_member)
        // private-users → B2C (b2c_user)

        if (productTargetAudience === 'businesses') {
          // Product is for B2B - only show error if user is NOT B2B
          if (userRole !== 'b2b_user' && userRole !== 'b2b_member' && userRole !== 'admin') {
            mismatch = true;
            if (userRole === 'b2e_user' || userRole === 'b2e_member') {
              message = 'You are a B2E user. You can only purchase B2E products.';
            } else if (userRole === 'b2c_user') {
              message = 'You are a B2C user. You can only purchase B2C products.';
            }
          }
        } else if (productTargetAudience === 'schools') {
          // Product is for B2E - only show error if user is NOT B2E
          if (userRole !== 'b2e_user' && userRole !== 'b2e_member' && userRole !== 'admin') {
            mismatch = true;
            if (userRole === 'b2b_user' || userRole === 'b2b_member') {
              message = 'You are a B2B user. You can only purchase B2B products.';
            } else if (userRole === 'b2c_user') {
              message = 'You are a B2C user. You can only purchase B2C products.';
            }
          }
        } else if (productTargetAudience === 'private-users') {
          // Product is for B2C - only show error if user is NOT B2C
          if (userRole !== 'b2c_user' && userRole !== 'admin') {
            mismatch = true;
            if (userRole === 'b2b_user' || userRole === 'b2b_member') {
              message = 'You are a B2B user. You can only purchase B2B products.';
            } else if (userRole === 'b2e_user' || userRole === 'b2e_member') {
              message = 'You are a B2E user. You can only purchase B2E products.';
            }
          }
        }

        setRoleMismatch({ show: mismatch, message });
      } else {
        // User not logged in, no mismatch check needed
        setRoleMismatch({ show: false, message: '' });
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      setProduct(null);
      setRoleMismatch({ show: false, message: '' });
    }
  }, [productId, user, type]);

  useEffect(() => {
    if (router.isReady) {
      // If type is in URL, set category accordingly
      if (type === 'B2C') {
        setSelectedCategory('families');
      } else if (type === 'B2B' || type === 'B2E') {
        setSelectedCategory('organizations_schools');
      }
      fetchPackages();
      checkFreeTrialUsage();
      // Fetch product if productId exists - only after router is ready
      if (productId) {
        fetchProduct();
      }
      // Fetch custom packages if user is logged in
      if (user) {
        fetchCustomPackages();
      }
    }
  }, [router.isReady, type, productId, fetchPackages, checkFreeTrialUsage, fetchCustomPackages, fetchProduct, user]);

  // Re-filter packages when product changes
  useEffect(() => {
    if (product && allPackages.length > 0) {
      const categoryToUse = selectedCategory;
      filterPackagesByCategory(allPackages, categoryToUse);
    }
  }, [product, allPackages, selectedCategory]);

  // Filter packages by category
  const filterPackagesByCategory = (packagesList, category) => {
    let filtered = packagesList;
    
    // Only filter by product targetAudience if type is NOT B2B or B2E
    // When type is B2B or B2E, show all B2B and B2E packages regardless of product
    if (productId && product && type !== 'B2B' && type !== 'B2E' && type !== 'B2B_B2E') {
      const productTargetAudience = product.targetAudience || product.category;
      let allowedTargetAudiences = [];
      
      // Map product targetAudience to package targetAudiences
      if (productTargetAudience === 'businesses') {
        allowedTargetAudiences = ['B2B'];
      } else if (productTargetAudience === 'schools') {
        allowedTargetAudiences = ['B2E'];
      } else if (productTargetAudience === 'private-users') {
        allowedTargetAudiences = ['B2C'];
      }
      
      // Filter packages that match product targetAudience
      if (allowedTargetAudiences.length > 0) {
        filtered = packagesList.filter(pkg => {
          if (!pkg.targetAudiences || !Array.isArray(pkg.targetAudiences)) {
            return false;
          }
          return pkg.targetAudiences.some(ta => allowedTargetAudiences.includes(ta));
        });
      }
    }
    
    if (category === 'organizations_schools') {
      // Filter for B2B or B2E (organizations and schools)
      // Show ALL B2B and B2E packages when type is B2B or B2E
      const categoryFiltered = filtered.filter(pkg => {
        if (!pkg.targetAudiences || !Array.isArray(pkg.targetAudiences)) {
          return false;
        }
        return pkg.targetAudiences.includes('B2B') || pkg.targetAudiences.includes('B2E');
      });
      setPackages(categoryFiltered);
      // Check if there are any B2B or B2E packages
      setHasB2BPackages(categoryFiltered.length > 0);
    } else if (category === 'families') {
      // Filter for B2C (families)
      const categoryFiltered = filtered.filter(pkg => {
        if (!pkg.targetAudiences || !Array.isArray(pkg.targetAudiences)) {
          return false;
        }
        return pkg.targetAudiences.includes('B2C');
      });
      setPackages(categoryFiltered);
      setHasB2BPackages(false); // No free trial for B2C
    } else {
      setPackages(filtered);
      // Check if there are any B2B or B2E packages in all packages
      const hasB2B = filtered.some(pkg => {
        if (!pkg.targetAudiences || !Array.isArray(pkg.targetAudiences)) {
          return false;
        }
        return pkg.targetAudiences.includes('B2B') || pkg.targetAudiences.includes('B2E');
      });
      setHasB2BPackages(hasB2B);
    }
  };

  // Handle category change
  const handleCategoryChange = (event, newValue) => {
    setSelectedCategory(newValue);
    // Re-fetch packages with new category to get fresh data
    fetchPackages(newValue);
  };

  // Handle free trial request
  const handleGetFreeTrial = async () => {
    // Prevent multiple clicks
    if (processingFreeTrial || processingPurchase) {
      return;
    }

    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`);
      return;
    }

    // Set processing state immediately
    setProcessingFreeTrial(true);

    try {
      // Get auth token
      const token = localStorage.getItem('token');
      if (!token) {
        router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`);
        return;
      }

      // Get first B2B or B2E package for trial
      const b2bPackage = packages.find(pkg => {
        if (!pkg.targetAudiences || !Array.isArray(pkg.targetAudiences)) {
          return false;
        }
        return pkg.targetAudiences.includes('B2B') || pkg.targetAudiences.includes('B2E');
      });

      if (!b2bPackage) {
        setSnackbar({
          open: true,
          message: 'No package available for trial',
          severity: 'error',
        });
        return;
      }

      // Create free trial
      const response = await axios.post(
        `${API_URL}/free-trial/create`,
        { 
          packageId: b2bPackage._id,
          productId: productId ? productId : null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Mark that user has used free trial
      setHasUsedFreeTrial(true);

      // Redirect to trial success page with code
      router.push(`/trial-success?code=${response.data.trial.uniqueCode}`);
    } catch (error) {
      console.error('Error creating free trial:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Failed to create free trial',
        severity: 'error',
      });
      setProcessingFreeTrial(false);
    }
  };

  const getBillingTypeLabel = (billingType) => {
    const labels = {
      'one_time': 'One Time',
      'subscription': 'Subscription',
      'per_seat': 'Per Seat',
    };
    return labels[billingType] || billingType;
  };

  // Parse description into feature list (only split by line breaks)
  const parseDescriptionToFeatures = (description) => {
    if (!description) return [];
    const features = description.split(/\n/).map(f => f.trim()).filter(f => f.length > 0);
    if (features.length === 0) {
      return [description.trim()];
    }
    return features;
  };

  // Determine if package should be highlighted
  const isHighlighted = (index, total) => {
    if (total === 4) return index === 1;
    if (total === 3) return index === 1;
    if (total >= 5) return index === Math.floor(total / 2);
    return false;
  };

  const handleRequestCustomPackage = () => {
    // Check if user is logged in
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`);
      return;
    }
    setSelectedPackage(null);
    setRequestDialogOpen(true);
  };

  const handleCloseRequestDialog = () => {
    setRequestDialogOpen(false);
    setSelectedPackage(null);
    setRequestForm({
      entityType: '',
      organizationName: '',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      additionalNotes: '',
      seatLimit: '',
      customPricing: ''
    });
  };

  const handleBuyNow = async (pkg, isCustomPackage = false) => {
    // Prevent multiple clicks - if any purchase is already processing, return early
    if (processingPurchase) {
      return;
    }

    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`);
      return;
    }

    // Set processing state immediately to prevent multiple clicks
      setProcessingPurchase(pkg._id);
      
    // Validate product before purchase (if productId is in URL)
    if (productId) {
      try {
        const productToValidate = product || await axios.get(`${API_URL}/products/${productId}`, { headers: NO_CACHE_HEADERS }).then(r => r.data).catch(() => null);
        
        if (productToValidate) {
          const userRole = user.role;
          const productTargetAudience = productToValidate.targetAudience || productToValidate.category;

          // Check if URL type matches user role - if yes, allow purchase (skip validation)
          let urlTypeMatchesRole = false;
          if (type === 'B2B' && (userRole === 'b2b_user' || userRole === 'b2b_member' || userRole === 'admin')) {
            urlTypeMatchesRole = true;
          } else if (type === 'B2E' && (userRole === 'b2e_user' || userRole === 'b2e_member' || userRole === 'admin')) {
            urlTypeMatchesRole = true;
          } else if (type === 'B2C' && (userRole === 'b2c_user' || userRole === 'admin')) {
            urlTypeMatchesRole = true;
          }

          // If URL type matches user role, skip validation (user chose correct type)
          if (!urlTypeMatchesRole) {
            // If URL type doesn't match, check product targetAudience against user role
            let productMismatch = false;
            let productMessage = '';

            if (productTargetAudience === 'businesses') {
              // Product is for B2B - only error if user is NOT B2B
              if (userRole !== 'b2b_user' && userRole !== 'b2b_member' && userRole !== 'admin') {
                productMismatch = true;
                if (userRole === 'b2e_user' || userRole === 'b2e_member') {
                  productMessage = 'You are a B2E user. You can only purchase B2E products.';
                } else if (userRole === 'b2c_user') {
                  productMessage = 'You are a B2C user. You can only purchase B2C products.';
                }
              }
            } else if (productTargetAudience === 'schools') {
              // Product is for B2E - only error if user is NOT B2E
              if (userRole !== 'b2e_user' && userRole !== 'b2e_member' && userRole !== 'admin') {
                productMismatch = true;
                if (userRole === 'b2b_user' || userRole === 'b2b_member') {
                  productMessage = 'You are a B2B user. You can only purchase B2B products.';
                } else if (userRole === 'b2c_user') {
                  productMessage = 'You are a B2C user. You can only purchase B2C products.';
                }
              }
            } else if (productTargetAudience === 'private-users') {
              // Product is for B2C - only error if user is NOT B2C
              if (userRole !== 'b2c_user' && userRole !== 'admin') {
                productMismatch = true;
                if (userRole === 'b2b_user' || userRole === 'b2b_member') {
                  productMessage = 'You are a B2B user. You can only purchase B2B products.';
                } else if (userRole === 'b2e_user' || userRole === 'b2e_member') {
                  productMessage = 'You are a B2E user. You can only purchase B2E products.';
                }
              }
            }

            if (productMismatch) {
              setSnackbar({
                open: true,
                message: productMessage,
                severity: 'error'
              });
              setProcessingPurchase(null);
              return;
            }
          }

          // Check package targetAudiences against product targetAudience (only if URL type doesn't match)
          // If URL type matches, we trust the user chose the right packages
          if (!urlTypeMatchesRole && pkg.targetAudiences && Array.isArray(pkg.targetAudiences)) {
            let packageMatchesProduct = false;
            
            if (productTargetAudience === 'businesses') {
              packageMatchesProduct = pkg.targetAudiences.includes('B2B');
            } else if (productTargetAudience === 'schools') {
              packageMatchesProduct = pkg.targetAudiences.includes('B2E');
            } else if (productTargetAudience === 'private-users') {
              packageMatchesProduct = pkg.targetAudiences.includes('B2C');
            }

            if (!packageMatchesProduct) {
              setSnackbar({
                open: true,
                message: 'This package does not match the product type. Please select a compatible package.',
                severity: 'error'
              });
              setProcessingPurchase(null);
              return;
            }
          }
        }
      } catch (err) {
        console.error('Error validating product before purchase:', err);
        // Continue with purchase if validation fails (backend will catch it)
      }
    }

    try {
      // Get auth token
      const token = localStorage.getItem('token');
      if (!token) {
        router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`);
        return;
      }

      // Create Stripe Checkout Session
      const requestData = isCustomPackage 
        ? { 
            customPackageId: pkg._id,
            productId: productId || null,
            urlType: type || null // Pass URL type to server for validation
          }
        : { 
            packageId: pkg._id,
            productId: productId || null,
            urlType: type || null // Pass URL type to server for validation
          };

      const response = await axios.post(
        `${API_URL}/payments/create-checkout-session`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Redirect to Stripe Checkout
      if (response.data.url) {
        window.location.href = response.data.url;
      } else {
        setSnackbar({
          open: true,
          message: 'Failed to create checkout session',
          severity: 'error',
        });
        setProcessingPurchase(null);
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Failed to start checkout process',
        severity: 'error',
      });
      setProcessingPurchase(null);
    }
  };

  const handleSubmitRequest = async () => {
    if (!requestForm.entityType || !requestForm.organizationName || !requestForm.contactName || !requestForm.contactEmail) {
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields',
        severity: 'error'
      });
      return;
    }

    try {
      setSubmitting(true);
      
      // Get auth token if user is logged in (for B2B/B2E users)
      let authHeaders = { ...NO_CACHE_HEADERS };
      let token = null;
      try {
        // Try to get token from localStorage or sessionStorage
        if (typeof window !== 'undefined') {
          token = localStorage.getItem('token') || sessionStorage.getItem('token');
        }
        if (token) {
          authHeaders.Authorization = `Bearer ${token}`;
        }
      } catch (e) {
        console.log('No auth token available');
      }
      
      // Build requestedModifications object - ALWAYS include all fields
      const requestedModifications = {
        cardsToAdd: [], // Cards will be selected by admin when creating product
        cardsToRemove: []
      };
      
      // ALWAYS include seatLimit if user entered a valid number
      if (requestForm.seatLimit && requestForm.seatLimit.toString().trim() !== '') {
        const seatLimitNum = parseInt(requestForm.seatLimit.toString().trim(), 10);
        if (!isNaN(seatLimitNum)) {
          requestedModifications.seatLimit = seatLimitNum;
        }
      }
      
      // ALWAYS include additionalNotes (even if empty string)
      requestedModifications.additionalNotes = requestForm.additionalNotes 
        ? String(requestForm.additionalNotes).trim() 
        : '';
      
      // ALWAYS include customPricing with notes and currency
      requestedModifications.customPricing = {
        notes: requestForm.customPricing 
          ? String(requestForm.customPricing).trim() 
          : '',
        currency: 'EUR'
      };
      
      const requestData = {
        entityType: requestForm.entityType || undefined,
        organizationName: requestForm.organizationName,
        contactName: requestForm.contactName,
        contactEmail: requestForm.contactEmail,
        contactPhone: requestForm.contactPhone || '',
        requestedModifications: requestedModifications
      };

      console.log('📤 Submitting custom package request:', JSON.stringify(requestData, null, 2));
      console.log('📤 requestedModifications:', JSON.stringify(requestedModifications, null, 2));

      await axios.post(`${API_URL}/custom-package-requests`, requestData, {
        headers: authHeaders,
      });

      setSnackbar({
        open: true,
        message: 'Custom package request submitted successfully! We will contact you soon.',
        severity: 'success'
      });
      handleCloseRequestDialog();
    } catch (err) {
      console.error('Error submitting request:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.error || 'Failed to submit request. Please try again.',
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <Box component="main" sx={{ pt: { xs: 8, md: 10 }, minHeight: '80vh', backgroundColor: '#F5F8FB' }}>
        <Container
          maxWidth="xl"
          sx={{ py: { xs: 6, md: 12 } }}
          data-aos="zoom-in"
          data-aos-duration="800"
        >
          {/* Header Section - Moved to top */}
          <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
            <Typography
              variant="overline"
              sx={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'text.secondary',
                letterSpacing: 2,
                mb: 1,
              }}
            >
              PRICING PLAN
            </Typography>
            <Typography
              variant="h2"
              sx={{
                mb: 2,
                fontSize: { xs: '2rem', md: '3rem' },
                fontWeight: 700,
                color: '#063C5E',
                lineHeight: 1.2,
              }}
            >
              Packages
            </Typography>
          </Box>

          {/* Category Tabs - Only show when no type filter in URL */}
          {!type && (
            <Box sx={{ mb: 6, borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={selectedCategory}
                onChange={handleCategoryChange}
                aria-label="package categories"
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  '& .MuiTab-root': {
                    fontSize: { xs: '0.875rem', md: '1rem' },
                    fontWeight: 600,
                    textTransform: 'none',
                    minHeight: 48,
                    color: '#063C5E',
                    px: { xs: 2, md: 3 },
                    '&.Mui-selected': {
                      color: '#0B7897',
                    },
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: '#0B7897',
                    height: 3,
                  },
                }}
              >
                <Tab label="Organizations & Schools" value="organizations_schools" />
                <Tab label="For Families" value="families" />
                {user && (user.role === 'b2b_user' || user.role === 'b2e_user') && (
                  <Tab 
                    label={`Custom Packages ${customPackages.length > 0 ? `(${customPackages.length})` : ''}`} 
                    value="custom" 
                  />
                )}
              </Tabs>
            </Box>
          )}

          {/* Role Mismatch Banner */}
          {roleMismatch.show && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                backgroundColor: '#ffebee',
                color: '#c62828',
                '& .MuiAlert-icon': {
                  color: '#c62828'
                }
              }}
              onClose={() => setRoleMismatch({ show: false, message: '' })}
            >
              {roleMismatch.message}
            </Alert>
          )}

          {/* Section Heading based on type */}
          {!loading && packages.length > 0 && type && (
            <Box sx={{ mb: { xs: 3, md: 4 }, textAlign: 'center' }}>
              <Typography
                variant="h3"
                sx={{
                  fontSize: { xs: '1.5rem', md: '2rem' },
                  fontWeight: 700,
                  color: '#063C5E',
                  mb: 1,
                }}
              >
                {type === 'B2C' 
                  ? 'For Families (B2C)'
                  : (type === 'B2B' || type === 'B2E' || type === 'B2B_B2E')
                  ? 'For Organizations & Schools (B2B & B2E)'
                  : 'Available Packages'}
              </Typography>
            </Box>
          )}

          {error ? (
            <ErrorDisplay error={error} title="Failed to Load Packages" />
          ) : selectedCategory === 'custom' ? (
            // Custom Packages Tab
            <Box>
              {loadingCustomPackages ? (
                <LoadingState message="Loading custom packages..." />
              ) : customPackages.length === 0 ? (
                <Box textAlign="center" py={6}>
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                    No custom packages available at the moment.
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Custom packages will appear here once they are approved by our team.
                  </Typography>
                </Box>
              ) : (
                <Grid
                  container
                  spacing={3}
                  sx={{ 
                    alignItems: 'stretch',
                    justifyContent: 'center',
                    mb: 4 
                  }}
                >
                  {customPackages.map((pkg, index) => {
                    const features = parseDescriptionToFeatures(pkg.description || pkg.basePackageId?.description || '');
                    const isPurchased = pkg.status === 'active';
                    
                    return (
                      <Grid 
                        item 
                        xs={12} 
                        sm={6} 
                        md={6} 
                        lg={3} 
                        key={pkg._id}
                        sx={{
                          display: 'flex',
                        }}
                      >
                        <Card
                          sx={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            borderRadius: 3,
                            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                            backgroundColor: 'white',
                            border: '2px solid #E0E0E0',
                            position: 'relative',
                            overflow: 'visible',
                            '&:hover': {
                              boxShadow: '0 12px 48px rgba(0,0,0,0.2)',
                              transform: 'translateY(-4px)',
                              transition: 'all 0.3s ease',
                            },
                          }}
                        >
                          <CardContent 
                            sx={{ 
                              flexGrow: 1, 
                              display: 'flex', 
                              flexDirection: 'column',
                              p: 3,
                            }}
                          >
                            {/* Custom Package Badge */}
                            <Box sx={{ position: 'absolute', top: 12, right: 12, display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'flex-end' }}>
                              <Typography
                                variant="caption"
                                sx={{
                                  backgroundColor: '#0B7897',
                                  color: 'white',
                                  px: 1.5,
                                  py: 0.5,
                                  borderRadius: 1,
                                  fontWeight: 700,
                                  fontSize: '0.75rem',
                                }}
                              >
                                CUSTOM
                              </Typography>
                              {/* Category Badge for Custom Package */}
                              {(pkg.basePackageId?.packageType || pkg.packageType) && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    display: 'inline-block',
                                    px: 1.5,
                                    py: 0.5,
                                    borderRadius: '12px',
                                    backgroundColor: (pkg.basePackageId?.packageType || pkg.packageType) === 'digital' ? '#E3F2FD' : 
                                                    (pkg.basePackageId?.packageType || pkg.packageType) === 'physical' ? '#FFF3E0' : 
                                                    (pkg.basePackageId?.packageType || pkg.packageType) === 'digital_physical' ? '#F3E5F5' :
                                                    (pkg.basePackageId?.packageType || pkg.packageType) === 'renewal' ? '#E8F5E9' :
                                                    '#F5F5F5',
                                    color: (pkg.basePackageId?.packageType || pkg.packageType) === 'digital' ? '#1976D2' : 
                                            (pkg.basePackageId?.packageType || pkg.packageType) === 'physical' ? '#F57C00' : 
                                            (pkg.basePackageId?.packageType || pkg.packageType) === 'digital_physical' ? '#7B1FA2' :
                                            (pkg.basePackageId?.packageType || pkg.packageType) === 'renewal' ? '#2E7D32' :
                                            '#424242',
                                    fontWeight: 600,
                                    fontSize: '0.7rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                  }}
                                >
                                  {(pkg.basePackageId?.packageType || pkg.packageType) === 'digital' ? 'Digital' : 
                                   (pkg.basePackageId?.packageType || pkg.packageType) === 'physical' ? 'Physical' : 
                                   (pkg.basePackageId?.packageType || pkg.packageType) === 'digital_physical' ? 'Digital + Physical' : 
                                   (pkg.basePackageId?.packageType || pkg.packageType) === 'renewal' ? 'Renewal' : 
                                   (pkg.basePackageId?.packageType || pkg.packageType) === 'standard' ? 'Standard' :
                                   (pkg.basePackageId?.packageType || pkg.packageType)}
                                </Typography>
                              )}
                            </Box>

                            <Typography 
                              variant="h5" 
                              component="h3" 
                              sx={{ 
                                fontWeight: 700,
                                color: '#063C5E',
                                mb: 2,
                                mt: 1,
                                fontSize: { xs: '1.25rem', md: '1.5rem' },
                              }}
                            >
                              {pkg.name || pkg.basePackageId?.name || 'Custom Package'}
                            </Typography>

                            <Box sx={{ mb: 3 }}>
                              <Typography
                                variant="h3"
                                sx={{
                                  fontWeight: 700,
                                  color: '#0B7897',
                                  fontSize: { xs: '2rem', md: '2.5rem' },
                                  lineHeight: 1,
                                  mb: 0.5,
                                }}
                              >
                                {pkg.contractPricing?.currency === 'EUR' ? '€' : pkg.contractPricing?.currency || '€'}{pkg.contractPricing?.amount || 0}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: 'text.secondary',
                                  fontSize: '0.875rem',
                                }}
                              >
                                {getBillingTypeLabel(pkg.contractPricing?.billingType || 'one_time')}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: 'text.secondary',
                                  fontSize: '0.875rem',
                                  mt: 0.5,
                                }}
                              >
                                {pkg.seatLimit || 0} Seats
                              </Typography>
                            </Box>

                            <Stack spacing={1.5} sx={{ flexGrow: 1, mb: 3 }}>
                              {features.slice(0, 5).map((feature, idx) => (
                                <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography sx={{ color: '#0B7897', fontSize: '1.2rem' }}>✓</Typography>
                                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                    {feature}
                                  </Typography>
                                </Box>
                              ))}
                              {pkg.seatLimit && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography sx={{ color: '#0B7897', fontSize: '1.2rem' }}>✓</Typography>
                                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                    {pkg.seatLimit} Seats Included
                                  </Typography>
                                </Box>
                              )}
                            </Stack>

                            <Button
                              variant="contained"
                              fullWidth
                              onClick={() => handleBuyNow(pkg, true)}
                              disabled={isPurchased || processingPurchase !== null}
                              sx={{
                                background: isPurchased 
                                  ? 'linear-gradient(90deg, #4CAF50 0%, #45A049 100%)'
                                  : 'linear-gradient(90deg, #0B7897 0%, #063C5E 100%)',
                                color: 'white',
                                fontWeight: 700,
                                py: 1.5,
                                '&:hover': {
                                  background: isPurchased
                                    ? 'linear-gradient(90deg, #45A049 0%, #4CAF50 100%)'
                                    : 'linear-gradient(90deg, #063C5E 0%, #0B7897 100%)',
                                },
                                '&:disabled': {
                                  background: '#4CAF50',
                                  color: 'white',
                                },
                              }}
                            >
                              {processingPurchase === pkg._id 
                                ? 'Processing...' 
                                : isPurchased 
                                ? 'Purchased' 
                                : 'Purchase Now'}
                            </Button>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              )}
            </Box>
          ) : loading ? (
            <LoadingState message="Loading packages..." />
          ) : packages.length === 0 ? (
            <Box textAlign="center" py={6}>
              <Typography variant="h6" color="text.secondary">
                No packages available at the moment. Please check back soon.
              </Typography>
            </Box>
          ) : (
            <Grid
              container
              spacing={3}
              sx={{ 
                alignItems: 'stretch',
                justifyContent: 'center',
                mb: 4 
              }}
            >
              {/* Request Custom Package Card - Show for Organizations & Schools */}
              {((!type && selectedCategory === 'organizations_schools') || type === 'B2B' || type === 'B2E' || type === 'B2B_B2E') && (
                <Grid 
                  item 
                  xs={12} 
                  sm={6} 
                  md={6} 
                  lg={3}
                  sx={{
                    display: 'flex',
                  }}
                >
                  <Card
                    sx={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 3,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                      backgroundColor: 'white',
                      border: '2px solid #0B7897',
                      position: 'relative',
                      overflow: 'visible',
                      '&:hover': {
                        boxShadow: '0 12px 48px rgba(11,120,151,0.3)',
                        transform: 'translateY(-4px)',
                        transition: 'all 0.3s ease',
                      },
                    }}
                  >
                    <CardContent 
                      sx={{ 
                        flexGrow: 1, 
                        display: 'flex', 
                        flexDirection: 'column',
                        p: 4,
                      }}
                    >
                      <Typography 
                        variant="h5" 
                        component="h3" 
                        sx={{ 
                          fontWeight: 700,
                          color: '#063C5E',
                          mb: 2,
                          fontSize: { xs: '1.25rem', md: '1.5rem' },
                        }}
                      >
                        Need a Custom Package?
                      </Typography>

                      <Box sx={{ mb: 3 }}>
                        <Typography
                          variant="body1"
                          sx={{
                            color: 'text.secondary',
                            fontSize: '0.9375rem',
                            lineHeight: 1.6,
                            mb: 2,
                          }}
                        >
                          Tell us your specific requirements and we&apos;ll create a tailored package for your organization.
                        </Typography>
                      </Box>

                      <Stack spacing={1.5} sx={{ flexGrow: 1, mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography sx={{ color: '#0B7897', fontSize: '1.2rem' }}>✓</Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Custom Seat Limits
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography sx={{ color: '#0B7897', fontSize: '1.2rem' }}>✓</Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Flexible Pricing Options
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography sx={{ color: '#0B7897', fontSize: '1.2rem' }}>✓</Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Tailored Card Selection
                          </Typography>
                        </Box>
                      </Stack>

                      <Button
                        variant="contained"
                        fullWidth
                        onClick={handleRequestCustomPackage}
                        sx={{
                          backgroundColor: '#0B7897',
                          color: 'white',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          borderRadius: 2,
                          py: 1.5,
                          fontSize: { xs: '0.875rem', md: '0.9375rem' },
                          '&:hover': {
                            backgroundColor: '#063C5E',
                            transform: 'scale(1.02)',
                          },
                          transition: 'all 0.2s ease',
                        }}
                      >
                        Request Custom Package
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Free Trial Card - Show for Organizations & Schools when B2B/B2E packages exist and user hasn't used trial */}
              {((!type && selectedCategory === 'organizations_schools') || type === 'B2B' || type === 'B2E') && hasB2BPackages && packages.length > 0 && !hasUsedFreeTrial && (
                <Grid 
                  item 
                  xs={12} 
                  sm={6} 
                  md={6} 
                  lg={3}
                  sx={{
                    display: 'flex',
                  }}
                >
                  <Card
                    sx={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 3,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      position: 'relative',
                      overflow: 'visible',
                      border: '3px solid #FFD700',
                    }}
                  >
                    <CardContent 
                      sx={{ 
                        flexGrow: 1, 
                        display: 'flex', 
                        flexDirection: 'column',
                        p: 4,
                      }}
                    >
                      <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            backgroundColor: '#FFD700',
                            color: '#063C5E',
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            fontWeight: 700,
                            fontSize: '0.75rem',
                          }}
                        >
                          FREE TRIAL
                        </Typography>
                      </Box>

                      <Typography 
                        variant="h5" 
                        component="h3" 
                        sx={{ 
                          fontWeight: 700,
                          color: 'white',
                          mb: 2,
                          mt: 2,
                          fontSize: { xs: '1.25rem', md: '1.5rem' },
                        }}
                      >
                        7-Day Free Trial
                      </Typography>

                      <Box sx={{ mb: 3 }}>
                        <Typography
                          variant="h3"
                          sx={{
                            fontWeight: 700,
                            color: '#FFD700',
                            fontSize: { xs: '2rem', md: '2.5rem' },
                            lineHeight: 1,
                            mb: 0.5,
                          }}
                        >
                          FREE
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'rgba(255,255,255,0.9)',
                            fontSize: '0.875rem',
                          }}
                        >
                          2 Seats Available
                        </Typography>
                      </Box>

                      <Stack spacing={1.5} sx={{ flexGrow: 1, mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography sx={{ color: '#FFD700', fontSize: '1.2rem' }}>✓</Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                            7 Days Access
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography sx={{ color: '#FFD700', fontSize: '1.2rem' }}>✓</Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                            2 Demo Seats
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography sx={{ color: '#FFD700', fontSize: '1.2rem' }}>✓</Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                            Full Package Access
                          </Typography>
                        </Box>
                      </Stack>

                      <Button
                        variant="contained"
                        fullWidth
                        onClick={() => handleGetFreeTrial()}
                        disabled={processingFreeTrial || processingPurchase !== null}
                        sx={{
                          backgroundColor: 'white !important',
                          // background: 'linear-gradient(90deg, #00897B 0%, #4FC3F7 100%) !important',
                          // backgroundColor: 'transparent !important',
                          color: 'white !important',
                          fontWeight: 700,
                          py: 1.5,
                          '&:hover': {
                            // background: 'linear-gradient(90deg, #00695C 0%, #29B6F6 100%) !important',
                            // backgroundColor: 'transparent !important',
                            color: 'white !important',
                          },
                        }}
                      >
                        {processingFreeTrial ? 'Processing...' : 'Get Free Trial'}
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {packages.map((pkg, index) => {
                const features = parseDescriptionToFeatures(pkg.description);
                const highlighted = isHighlighted(index, packages.length);
                
                return (
                  <Grid 
                    item 
                    xs={12} 
                    sm={6} 
                    md={6} 
                    lg={3} 
                    key={pkg._id}
                    sx={{
                      display: 'flex',
                    }}
                  >
                    <Card
                      data-aos="fade-up"
                      data-aos-duration="800"
                      data-aos-delay={index * 100}
                      sx={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 3,
                        boxShadow: highlighted 
                          ? '0 8px 32px rgba(0,0,0,0.15)' 
                          : '0 4px 20px rgba(0,0,0,0.1)',
                        backgroundColor: highlighted ? '#0B7897' : 'white',
                        color: highlighted ? 'white' : 'text.primary',
                        transition: 'all 0.3s ease-in-out',
                        transform: 'translateY(0)',
                        position: 'relative',
                        overflow: 'visible',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: highlighted 
                            ? '0 12px 40px rgba(11,120,151,0.3)' 
                            : '0 8px 32px rgba(0,0,0,0.15)',
                        },
                      }}
                    >
                      <CardContent 
                        sx={{ 
                          flexGrow: 1, 
                          display: 'flex', 
                          flexDirection: 'column',
                          p: 4,
                        }}
                      >
                        {/* Category Badge */}
                        {pkg.packageType && (
                          <Box sx={{ mb: 1.5 }}>
                            <Typography
                              variant="caption"
                              sx={{
                                display: 'inline-block',
                                px: 1.5,
                                py: 0.5,
                                borderRadius: '12px',
                                backgroundColor: highlighted 
                                  ? 'rgba(255, 255, 255, 0.2)' 
                                  : (pkg.packageType === 'digital' ? '#E3F2FD' : 
                                      pkg.packageType === 'physical' ? '#FFF3E0' : 
                                      pkg.packageType === 'digital_physical' ? '#F3E5F5' :
                                      pkg.packageType === 'renewal' ? '#E8F5E9' :
                                      '#F5F5F5'),
                                color: highlighted 
                                  ? '#FFD700' 
                                  : (pkg.packageType === 'digital' ? '#1976D2' : 
                                      pkg.packageType === 'physical' ? '#F57C00' : 
                                      pkg.packageType === 'digital_physical' ? '#7B1FA2' :
                                      pkg.packageType === 'renewal' ? '#2E7D32' :
                                      '#424242'),
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                              }}
                            >
                              {pkg.packageType === 'digital' ? 'Digital' : 
                               pkg.packageType === 'physical' ? 'Physical' : 
                               pkg.packageType === 'digital_physical' ? 'Digital + Physical' : 
                               pkg.packageType === 'renewal' ? 'Renewal' : 
                               pkg.packageType === 'standard' ? 'Standard' :
                               pkg.packageType}
                            </Typography>
                          </Box>
                        )}

                        {/* Package Name */}
                        <Typography 
                          variant="h5" 
                          component="h3" 
                          sx={{ 
                            fontWeight: 700,
                            color: highlighted ? 'white' : '#063C5E',
                            mb: 2,
                            fontSize: { xs: '1.25rem', md: '1.5rem' },
                          }}
                        >
                          {pkg.name}
                        </Typography>

                        {/* Price */}
                        <Box sx={{ mb: 3 }}>
                          <Typography
                            variant="h3"
                            sx={{
                              fontWeight: 700,
                              color: '#FFD700',
                              fontSize: { xs: '2rem', md: '2.5rem' },
                              lineHeight: 1,
                              mb: 0.5,
                            }}
                          >
                            €{pkg.pricing?.amount || 0}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: highlighted ? 'rgba(255,255,255,0.8)' : 'text.secondary',
                              fontSize: '0.875rem',
                            }}
                          >
                            {getBillingTypeLabel(pkg.pricing?.billingType)}
                          </Typography>
                        </Box>

                        {/* Description List (one line = one bullet) */}
                        <Stack spacing={1.5} sx={{ flexGrow: 1, mb: 3 }}>
                          {features.length > 0 ? (
                            features.map((feature, idx) => (
                              <Box 
                                key={idx}
                                sx={{ 
                                  display: 'flex', 
                                  alignItems: 'flex-start', 
                                  gap: 1.5 
                                }}
                              >
                                <Box
                                  sx={{
                                    mt: 0.5,
                                    width: 20,
                                    height: 20,
                                    borderRadius: '50%',
                                    backgroundColor: highlighted ? '#FFD700' : '#FFD700',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                  }}
                                >
                                  <Box
                                    component="span"
                                    sx={{
                                      color: highlighted ? '#063C5E' : '#063C5E',
                                      fontSize: '0.75rem',
                                      fontWeight: 700,
                                    }}
                                  >
                                    ✓
                                  </Box>
                                </Box>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: highlighted ? '#FFD700' : 'text.primary',
                                    fontSize: { xs: '0.875rem', md: '0.9375rem' },
                                    lineHeight: 1.6,
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                    fontWeight: highlighted ? 500 : 400,
                                  }}
                                >
                                  {feature}
                                </Typography>
                              </Box>
                            ))
                          ) : (
                            <Typography
                              variant="body2"
                              sx={{
                                color: highlighted ? 'rgba(255,255,255,0.8)' : 'text.secondary',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                              }}
                            >
                              {pkg.description}
                            </Typography>
                          )}
                        </Stack>

                        {/* Max Seats & Cards Count */}
                        <Box sx={{ mb: 3 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              color: highlighted ? 'rgba(255,255,255,0.8)' : 'text.secondary',
                              fontSize: '0.875rem',
                              mb: pkg.includedCardIds?.length > 0 ? 1 : 0,
                            }}
                          >
                            Max Seats: <strong>{pkg.maxSeats || 5}</strong>
                          </Typography>
                          {pkg.expiryTime && pkg.expiryTimeUnit && (
                            <Typography
                              variant="body2"
                              sx={{
                                color: highlighted ? 'rgba(255,255,255,0.8)' : 'text.secondary',
                                fontSize: '0.875rem',
                                mb: pkg.includedCardIds?.length > 0 ? 1 : 0,
                              }}
                            >
                              Expiry Time: <strong>{pkg.expiryTime} {pkg.expiryTimeUnit === 'months' ? 'Month' : 'Year'}{pkg.expiryTime !== 1 ? 's' : ''}</strong>
                            </Typography>
                          )}
                          {pkg.includedCardIds?.length > 0 && (
                            <Typography
                              variant="body2"
                              sx={{
                                color: highlighted ? 'rgba(255,255,255,0.8)' : 'text.secondary',
                                fontSize: '0.875rem',
                              }}
                            >
                              {pkg.includedCardIds.length} Card{pkg.includedCardIds.length !== 1 ? 's' : ''} Included
                            </Typography>
                          )}
                        </Box>

                        {/* CTA Buttons */}
                        <Stack spacing={1.5}>
                          <Button
                            variant="outlined"
                            fullWidth
                            onClick={() => handleBuyNow(pkg)}
                            disabled={processingPurchase !== null}
                            sx={{
                              borderColor: '#FFD700',
                              color: highlighted ? '#FFD700' : '#063C5E',
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              borderRadius: 2,
                              py: 1.5,
                              fontSize: { xs: '0.875rem', md: '0.9375rem' },
                              '&:hover': {
                                borderColor: '#FFC700',
                                backgroundColor: highlighted ? 'rgba(255,215,0,0.1)' : '#FFF9E6',
                              },
                              transition: 'all 0.2s ease',
                            }}
                          >
                            {processingPurchase === pkg._id ? 'Redirecting to Stripe...' : 'Buy Now'}
                          </Button>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Container>
      </Box>

      {/* Request Custom Package Dialog */}
      <Dialog 
        open={requestDialogOpen} 
        onClose={handleCloseRequestDialog} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          Request Custom Package
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <FormControl fullWidth required>
              <InputLabel>Entity Type</InputLabel>
              <Select
                value={requestForm.entityType}
                label="Entity Type"
                onChange={(e) => setRequestForm({ ...requestForm, entityType: e.target.value })}
              >
                <MenuItem value="">Select Type</MenuItem>
                <MenuItem value="organization">Organization</MenuItem>
                <MenuItem value="institute">Institute</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Organization Name *"
              value={requestForm.organizationName}
              onChange={(e) => setRequestForm({ ...requestForm, organizationName: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Contact Name *"
              value={requestForm.contactName}
              onChange={(e) => setRequestForm({ ...requestForm, contactName: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Email *"
              type="email"
              value={requestForm.contactEmail}
              onChange={(e) => setRequestForm({ ...requestForm, contactEmail: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Phone"
              value={requestForm.contactPhone}
              onChange={(e) => setRequestForm({ ...requestForm, contactPhone: e.target.value })}
            />
            <TextField
              fullWidth
              label="Number of Seats/Users"
              type="number"
              value={requestForm.seatLimit}
              onChange={(e) => setRequestForm({ ...requestForm, seatLimit: e.target.value })}
              helperText="How many users will need access?"
            />
            <TextField
              fullWidth
              label="Custom Pricing Requirements"
              value={requestForm.customPricing}
              onChange={(e) => setRequestForm({ ...requestForm, customPricing: e.target.value })}
              multiline
              rows={2}
              helperText="Describe your pricing needs (e.g., annual contract, volume discount)"
            />
            <TextField
              fullWidth
              label="Additional Requirements"
              value={requestForm.additionalNotes}
              onChange={(e) => setRequestForm({ ...requestForm, additionalNotes: e.target.value })}
              multiline
              rows={4}
              helperText="Tell us about any specific cards you'd like to add or remove, custom features, or other requirements"
            />
            <Alert severity="info">
              After submitting this request, our team will review your requirements and contact you within 1-2 business days with a custom quote.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRequestDialog} disabled={submitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitRequest} 
            variant="contained"
            disabled={submitting}
            sx={{ backgroundColor: '#0B7897', '&:hover': { backgroundColor: '#063C5E' } }}
          >
            {submitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Footer />
    </>
  );
}
