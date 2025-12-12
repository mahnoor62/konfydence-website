'use client';

import { useState, useEffect, useRef } from 'react';
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  Container,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useScrollTrigger,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'CoMaSy', href: '/comasy' },
  { label: 'Education', href: '/education' },
  { label: 'Shop', href: '/shop' },
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const pathname = usePathname();
  const { user, logout, loading: authLoading } = useAuth();

  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 50,
  });

  useEffect(() => {
    setScrolled(trigger);
  }, [trigger]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          background: scrolled
            ? 'rgba(255,255,255,0.95)'
            : 'linear-gradient(90deg, rgba(0,139,139,0.15) 0%, rgba(0,81,131,0.25) 100%)',
          backdropFilter: 'blur(18px)',
          borderRadius: '0',
          // borderBottom: scrolled ? '1px solid rgba(15,31,43,0.08)' : 'transparent',
          transition: 'all 0.4s ease',
          color: scrolled ? 'text.primary' : 'white',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ py: 1, minHeight: { xs: 64, md: 88 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
              <Box
                component={Link}
                href="/"
                sx={{
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.2,
                  flex: { xs: '1 1 auto', md: '0 0 220px' },
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #00c4c7, #1c6edb)',
                    display: 'grid',
                    placeItems: 'center',
                    color: 'white',
                    fontWeight: 700,
                    fontFamily: 'var(--font-poppins)',
                    fontSize: '1.3rem',
                  }}
                >
                  K
                </Box>
                <Box>
                  <Box
                    component="span"
                    sx={{
                      fontSize: '1.55rem',
                      fontWeight: 700,
                      fontFamily: 'var(--font-poppins)',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    Konfydence
                  </Box>
                  <Box component="span" sx={{ display: 'block', fontSize: '0.82rem', opacity: 0.7 }}>
                    Safer Digital Decisions
                  </Box>
                </Box>
              </Box>

              <Box
                sx={{
                  flex: '1 1 auto',
                  display: { xs: 'none', md: 'flex' },
                  justifyContent: 'center',
                  gap: 1,
                }}
              >
                {navItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                  return (
                    <Button
                      key={item.href}
                      component={Link}
                      href={item.href}
                      sx={{
                        color: isActive ? '#0E4D68' : 'inherit',
                        backgroundColor: isActive ? 'rgba(255,255,255,0.9)' : 'transparent',
                        textTransform: 'none',
                        fontSize: '0.95rem',
                        fontWeight: isActive ? 600 : 500,
                        borderRadius: 999,
                        px: 2.5,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.2)',
                        },
                      }}
                    >
                      {item.label}
                    </Button>
                  );
                })}
              </Box>

              <Box
                sx={{
                  // flex: { xs: '0 0 auto', md: '0 0 220px' },
                  display: { xs: 'none', md: 'flex' },
                  justifyContent: 'flex-end',
                  gap: 1,
                }}
              >
                {!authLoading && user ? (
                  <>
                    <Box
                      ref={dropdownRef}
                      sx={{
                        position: 'relative',
                        display: 'inline-block',
                      }}
                    >
                      <Button
                        variant="outlined"
                        onClick={toggleDropdown}
                        endIcon={<ArrowDropDownIcon sx={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />}
                        sx={{
                          borderColor: scrolled ? 'primary.main' : 'rgba(255,255,255,0.85)',
                          color: scrolled ? 'primary.main' : 'white',
                          textTransform: 'none',
                          fontWeight: 600,
                          px: 2.5,
                          '&:hover': {
                            borderColor: scrolled ? 'primary.dark' : 'white',
                            backgroundColor: scrolled ? 'primary.light' : 'rgba(255,255,255,0.1)',
                            color: 'white',
                          },
                        }}
                      >
                        Dashboard
                      </Button>
                      {dropdownOpen && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            marginTop: '4px',
                            minWidth: '180px',
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            zIndex: 1000,
                            overflow: 'hidden',
                            animation: 'fadeIn 0.2s ease',
                            '@keyframes fadeIn': {
                              from: { opacity: 0, transform: 'translateY(-10px)' },
                              to: { opacity: 1, transform: 'translateY(0)' },
                            },
                          }}
                        >
                          <Box
                            component={Link}
                            href="/dashboard"
                            onClick={() => setDropdownOpen(false)}
                            sx={{
                              display: 'block',
                              padding: '12px 16px',
                              color: '#063C5E',
                              textDecoration: 'none',
                              fontSize: '0.95rem',
                              fontWeight: 500,
                              transition: 'background-color 0.2s',
                              '&:hover': {
                                backgroundColor: 'rgba(6, 60, 94, 0.08)',
                              },
                            }}
                          >
                            Dashboard
                          </Box>
                          <Box
                            component={Link}
                            href="/game"
                            onClick={() => setDropdownOpen(false)}
                            sx={{
                              display: 'block',
                              padding: '12px 16px',
                              color: '#063C5E',
                              textDecoration: 'none',
                              fontSize: '0.95rem',
                              fontWeight: 500,
                              transition: 'background-color 0.2s',
                              '&:hover': {
                                backgroundColor: 'rgba(6, 60, 94, 0.08)',
                              },
                            }}
                          >
                            Game
                          </Box>
                          <Box
                            component="button"
                            onClick={() => {
                              setDropdownOpen(false);
                              logout();
                            }}
                            sx={{
                              display: 'block',
                              width: '100%',
                              padding: '12px 16px',
                              color: '#d32f2f',
                              textDecoration: 'none',
                              fontSize: '0.95rem',
                              fontWeight: 500,
                              border: 'none',
                              background: 'none',
                              textAlign: 'left',
                              cursor: 'pointer',
                              transition: 'background-color 0.2s',
                              '&:hover': {
                                backgroundColor: 'rgba(211, 47, 47, 0.08)',
                              },
                            }}
                          >
                            Logout
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outlined"
                      component={Link}
                      href="/login"
                      sx={{
                        borderColor: scrolled ? 'primary.main' : 'rgba(255,255,255,0.85)',
                        color: scrolled ? 'primary.main' : 'white',
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 2.5,
                        '&:hover': {
                          borderColor: scrolled ? 'primary.dark' : 'white',
                          backgroundColor: scrolled ? 'primary.light' : 'rgba(255,255,255,0.1)',
                          color: 'white',
                        },
                      }}
                    >
                      Login
                    </Button>
                    <Button
                      variant="contained"
                      component={Link}
                      href="/shop"
                      sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        background: 'linear-gradient(135deg, #FFC54D, #FF8A00)',
                        color: '#073041',
                        '&:hover': {
                          opacity: 0.95,
                        },
                      }}
                    >
                      Shop Now
                    </Button>
                  </>
                )}
              </Box>

              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="end"
                onClick={handleDrawerToggle}
                sx={{ display: { md: 'none' } }}
              >
                <MenuIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 280,
            background: 'linear-gradient(180deg, #FFFFFF 0%, #F6F8FA 100%)',
          },
        }}
      >
        <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center', pt: 2 }}>
          <List sx={{ px: 1 }}>
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <ListItem key={item.href} disablePadding>
                  <ListItemButton
                    component={Link}
                    href={item.href}
                    selected={isActive}
                    sx={{
                      borderRadius: 2,
                      mb: 0.5,
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(6, 60, 94, 0.1)',
                        color: '#063C5E',
                        fontWeight: 600,
                      },
                      '&.Mui-selected:hover': {
                        backgroundColor: 'rgba(6, 60, 94, 0.15)',
                      },
                    }}
                  >
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontWeight: isActive ? 600 : 500,
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
            {!authLoading && user ? (
              <>
                <ListItem disablePadding>
                  <ListItemButton component={Link} href="/dashboard">
                    <ListItemText primary="Dashboard" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton component={Link} href="/game">
                    <ListItemText primary="Game" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton 
                    onClick={() => {
                      handleDrawerToggle();
                      logout();
                    }}
                    sx={{
                      color: '#d32f2f',
                      '&:hover': {
                        backgroundColor: 'rgba(211, 47, 47, 0.08)',
                      },
                    }}
                  >
                    <ListItemText primary="Logout" />
                  </ListItemButton>
                </ListItem>
              </>
            ) : (
              <>
                <ListItem disablePadding>
                  <ListItemButton component={Link} href="/login">
                    <ListItemText primary="Login" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton component={Link} href="/shop">
                    <ListItemText primary="Shop Now" />
                  </ListItemButton>
                </ListItem>
              </>
            )}
          </List>
        </Box>
      </Drawer>
    </>
  );
}

