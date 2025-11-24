import { Container, Typography, Box } from '@mui/material';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function TermsPage() {
  return (
    <>
      <Header />
      <Box component="main" sx={{ pt: { xs: 8, md: 10 }, minHeight: '80vh' }}>
        <Container maxWidth="md" sx={{ py: 6 }}>
          <Typography variant="h2" gutterBottom>
            Terms of Service
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Typography>
          <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
            1. Acceptance of Terms
          </Typography>
          <Typography variant="body1" paragraph>
            By accessing and using Konfydence services, you accept and agree to be bound by these Terms of Service.
          </Typography>
          <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
            2. Use of Services
          </Typography>
          <Typography variant="body1" paragraph>
            You agree to use our services only for lawful purposes and in accordance with these Terms. You may not
            use our services in any way that could damage, disable, or impair our services.
          </Typography>
          <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
            3. Intellectual Property
          </Typography>
          <Typography variant="body1" paragraph>
            All content, features, and functionality of our services are owned by Konfydence and are protected by
            international copyright, trademark, and other intellectual property laws.
          </Typography>
          <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
            4. Limitation of Liability
          </Typography>
          <Typography variant="body1" paragraph>
            Konfydence shall not be liable for any indirect, incidental, special, consequential, or punitive damages
            resulting from your use of our services.
          </Typography>
        </Container>
      </Box>
      <Footer />
    </>
  );
}

