import { Container, Typography, Button, Box } from '@mui/material';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function NotFound() {
  return (
    <>
      <Header />
      <Box component="main" sx={{ pt: { xs: 8, md: 10 }, minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h1" gutterBottom>
            404
          </Typography>
          <Typography variant="h4" gutterBottom>
            Page Not Found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            The page you're looking for doesn't exist.
          </Typography>
          <Button variant="contained" component={Link} href="/" size="large">
            Go Home
          </Button>
        </Container>
      </Box>
      <Footer />
    </>
  );
}

