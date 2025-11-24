import { Container, Typography, Box } from '@mui/material';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <Box component="main" sx={{ pt: { xs: 8, md: 10 }, minHeight: '80vh' }}>
        <Container maxWidth="md" sx={{ py: 6 }}>
          <Typography variant="h2" gutterBottom>
            Privacy Policy
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Typography>
          <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
            1. Data Collection
          </Typography>
          <Typography variant="body1" paragraph>
            We collect information that you provide directly to us, including when you create an account,
            make a purchase, request a demo, or contact us.
          </Typography>
          <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
            2. How We Use Your Data
          </Typography>
          <Typography variant="body1" paragraph>
            We use the information we collect to provide, maintain, and improve our services, process transactions,
            send you communications, and respond to your inquiries.
          </Typography>
          <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
            3. Data Protection
          </Typography>
          <Typography variant="body1" paragraph>
            We implement appropriate technical and organizational measures to protect your personal data against
            unauthorized access, alteration, disclosure, or destruction.
          </Typography>
          <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
            4. Your Rights
          </Typography>
          <Typography variant="body1" paragraph>
            You have the right to access, correct, or delete your personal data at any time. Please contact us
            at info@konfydence.com to exercise these rights.
          </Typography>
        </Container>
      </Box>
      <Footer />
    </>
  );
}

