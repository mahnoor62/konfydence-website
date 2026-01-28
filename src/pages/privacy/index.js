import { Container, Typography, Box, Link, List, ListItem } from '@mui/material';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <Box component="main" sx={{ pt: { xs: 8, md: 10 }, minHeight: '80vh', backgroundColor: '#ffffff' }}>
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Typography variant="h2" gutterBottom sx={{ color: '#063C5E', fontWeight: 700, mb: 2 }}>
            Privacy & Cookies Policy
          </Typography>
          <Typography variant="body1" paragraph sx={{ color: '#666', mb: 4 }}>
            <strong>Last updated:</strong> 10 Jan 2026
          </Typography>

          <Typography variant="body1" paragraph sx={{ mb: 4, lineHeight: 1.8 }}>
            Konfydence (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) respects your privacy and is committed to protecting your personal data. This Privacy & Cookies Policy explains how we collect, use, store, and protect information when you visit{' '}
            <Link href="https://konfydence.com" target="_blank" rel="noopener noreferrer" sx={{ color: '#0B7897' }}>
              https://konfydence.com
            </Link>
            {' '}or interact with our services.
          </Typography>

          <Typography variant="h4" sx={{ mt: 5, mb: 2, color: '#063C5E', fontWeight: 600 }}>
            1. Who We Are
          </Typography>
          <Box sx={{ mb: 3 }}>
            {/* <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
            <b>Company Name:</b> Konfydence 
            </Typography> */}
            <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
           
            <b>Company Name:</b> PlanetHike OÜ <br />
<b>Registered Office Address:</b> Järvevana tee 9, Tallinn, 11314, Estonia <br />
Konfydence is a product of PlanetHike OÜ <br />

<b>Registration Number:</b> 80656111 <br />

<b>Legal Representative / Founder:</b> Tichi Mbanwie <br />

<b>Email:</b> hello @ planethike .org <br />
<b>Phone:</b> +49 (0)1634668380
            </Typography>
            {/* <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
              [Business address]
            </Typography> */}
            {/* <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
              Email:{' '}
              <Link href="mailto:privacy@konfydence.com" sx={{ color: '#0B7897' }}>
                privacy@konfydence.com
              </Link>
            </Typography> */}
            <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
              We are the data controller responsible for your personal data under applicable data protection laws, including the EU General Data Protection Regulation (GDPR).
            </Typography>
          </Box>

          <Typography variant="h4" sx={{ mt: 5, mb: 2, color: '#063C5E', fontWeight: 600 }}>
            2. What Data We Collect
          </Typography>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, mb: 2 }}>
            We collect only data that is necessary and proportionate.
          </Typography>
          <Typography variant="h6" sx={{ mt: 3, mb: 1, color: '#063C5E', fontWeight: 600 }}>
            a) Data you provide directly
          </Typography>
          <List sx={{ pl: 3, mb: 3 }}>
            <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 0 }}>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>Name</Typography>
            </ListItem>
            <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 0 }}>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>Email address</Typography>
            </ListItem>
            <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 0 }}>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>Organization, role, or affiliation (if provided)</Typography>
            </ListItem>
            <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 0 }}>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>Messages or inquiries you submit</Typography>
            </ListItem>
            <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 0 }}>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>Information provided through forms (e.g. demo requests, downloads, sign-ups)</Typography>
            </ListItem>
          </List>
          <Typography variant="h6" sx={{ mt: 3, mb: 1, color: '#063C5E', fontWeight: 600 }}>
            b) Data collected automatically
          </Typography>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, mb: 1 }}>
            When you visit our website, we may collect limited technical data such as:
          </Typography>
          <List sx={{ pl: 3, mb: 2 }}>
            <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 0 }}>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>IP address (anonymized where possible)</Typography>
            </ListItem>
            <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 0 }}>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>Browser type and version</Typography>
            </ListItem>
            <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 0 }}>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>Device type and operating system</Typography>
            </ListItem>
            <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 0 }}>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>Pages visited and time spent</Typography>
            </ListItem>
            <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 0 }}>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>Referring URL</Typography>
            </ListItem>
          </List>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, mb: 3 }}>
            This information is used solely for security, functionality, and aggregated analytics.
          </Typography>

          <Typography variant="h4" sx={{ mt: 5, mb: 2, color: '#063C5E', fontWeight: 600 }}>
            3. How We Use Your Data
          </Typography>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, mb: 2 }}>
            We use personal data only for the following purposes:
          </Typography>
          <List sx={{ pl: 3, mb: 2 }}>
            <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 0 }}>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>To respond to inquiries and requests</Typography>
            </ListItem>
            <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 0 }}>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>To provide requested resources or services</Typography>
            </ListItem>
            <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 0 }}>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>To communicate updates about Konfydence (only if you opt in)</Typography>
            </ListItem>
            <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 0 }}>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>To operate, secure, and improve our website</Typography>
            </ListItem>
            <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 0 }}>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>To prevent misuse and ensure technical stability</Typography>
            </ListItem>
            <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 0 }}>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>To comply with legal obligations</Typography>
            </ListItem>
          </List>
          <Box sx={{ backgroundColor: '#F6F8FA', p: 2, borderRadius: 1, mb: 3 }}>
            <Typography variant="body1" sx={{ lineHeight: 1.8, fontWeight: 600, mb: 1 }}>
              We do not sell personal data.
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.8, fontWeight: 600, mb: 1 }}>
              We do not share personal data for advertising purposes.
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.8, fontWeight: 600 }}>
              We do not use automated decision-making or profiling.
            </Typography>
          </Box>

          <Typography variant="h4" sx={{ mt: 5, mb: 2, color: '#063C5E', fontWeight: 600 }}>
            4. Legal Basis for Processing (GDPR)
          </Typography>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, mb: 2 }}>
            We process personal data on one or more of the following legal bases:
          </Typography>
          <List sx={{ pl: 3, mb: 3 }}>
            <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 0 }}>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                <strong>Consent</strong> – when you voluntarily provide data or opt in to communications
              </Typography>
            </ListItem>
            <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 0 }}>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                <strong>Legitimate interest</strong> – to operate, secure, and improve our services
              </Typography>
            </ListItem>
            <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 0 }}>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                <strong>Contractual necessity</strong> – when processing is required to deliver requested services
              </Typography>
            </ListItem>
            <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 0 }}>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                <strong>Legal obligation</strong> – when required by applicable law
              </Typography>
            </ListItem>
          </List>

          <Typography variant="h4" sx={{ mt: 5, mb: 2, color: '#063C5E', fontWeight: 600 }}>
            5. Cookies & Similar Technologies
          </Typography>
          <Typography variant="h6" sx={{ mt: 3, mb: 1, color: '#063C5E', fontWeight: 600 }}>
            What are cookies?
          </Typography>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, mb: 3 }}>
            Cookies are small text files stored on your device when you visit a website. They help ensure proper functionality and provide insights into aggregate usage.
          </Typography>
          <Typography variant="h6" sx={{ mt: 3, mb: 1, color: '#063C5E', fontWeight: 600 }}>
            Cookies we use
          </Typography>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, mb: 2 }}>
            We use a limited and privacy-conscious set of cookies, including:
          </Typography>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, mb: 1, pl: 2 }}>
            <strong>Essential cookies</strong>
            <br />
            Required for website functionality, security, and stability.
          </Typography>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, mb: 2, pl: 2 }}>
            <strong>Analytics cookies</strong>
            <br />
            Used to understand how visitors use our website in aggregate form.
          </Typography>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, mb: 2 }}>
            We may use tools such as Google Analytics with IP anonymization enabled. These tools help us improve performance and usability and do not identify individual users.
          </Typography>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, mb: 1, fontWeight: 600 }}>
            We do not use:
          </Typography>
          <List sx={{ pl: 3, mb: 2 }}>
            <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 0 }}>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>Advertising cookies</Typography>
            </ListItem>
            <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 0 }}>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>Behavioral tracking cookies</Typography>
            </ListItem>
            <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 0 }}>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>Third-party marketing or retargeting cookies</Typography>
            </ListItem>
          </List>
          <Typography variant="h6" sx={{ mt: 3, mb: 1, color: '#063C5E', fontWeight: 600 }}>
            Managing cookies
          </Typography>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, mb: 1 }}>
            You can manage or disable cookies through your browser settings.
          </Typography>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, mb: 1 }}>
            If you wish to opt out of Google Analytics tracking, you may also use the official opt-out tool:{' '}
            <Link href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" sx={{ color: '#0B7897' }}>
              https://tools.google.com/dlpage/gaoptout
            </Link>
          </Typography>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, mb: 3 }}>
            Where required by law, we request consent before placing non-essential cookies.
          </Typography>

          <Typography variant="h4" sx={{ mt: 5, mb: 2, color: '#063C5E', fontWeight: 600 }}>
            6. Third-Party Service Providers
          </Typography>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, mb: 2 }}>
            We may use carefully selected third-party service providers for:
          </Typography>
          <List sx={{ pl: 3, mb: 2 }}>
            <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 0 }}>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>Website hosting</Typography>
            </ListItem>
            <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 0 }}>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>Analytics</Typography>
            </ListItem>
            <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 0 }}>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>Email communication</Typography>
            </ListItem>
            <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 0 }}>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>Form processing</Typography>
            </ListItem>
          </List>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, mb: 2 }}>
            These providers process personal data only on our instructions and are bound by appropriate data protection agreements.
          </Typography>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, mb: 3 }}>
            We do not knowingly transfer personal data outside the EU without appropriate safeguards, such as Standard Contractual Clauses.
          </Typography>

          <Typography variant="h4" sx={{ mt: 5, mb: 2, color: '#063C5E', fontWeight: 600 }}>
            7. Data Retention
          </Typography>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, mb: 2 }}>
            We retain personal data only for as long as necessary to fulfill the purposes described in this policy, unless a longer retention period is required by law.
          </Typography>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, mb: 3 }}>
            When data is no longer required, it is securely deleted or anonymized.
          </Typography>

          <Typography variant="h4" sx={{ mt: 5, mb: 2, color: '#063C5E', fontWeight: 600 }}>
            8. Your Rights (GDPR and Equivalent Laws)
          </Typography>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, mb: 2 }}>
            You have the right to:
          </Typography>
          <List sx={{ pl: 3, mb: 2 }}>
            <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 0 }}>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>Access your personal data</Typography>
            </ListItem>
            <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 0 }}>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>Correct inaccurate or incomplete data</Typography>
            </ListItem>
            <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 0 }}>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>Request deletion of your data</Typography>
            </ListItem>
            <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 0 }}>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>Restrict or object to processing</Typography>
            </ListItem>
            <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 0 }}>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>Withdraw consent at any time</Typography>
            </ListItem>
            <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 0 }}>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>Request data portability</Typography>
            </ListItem>
            <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 0 }}>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>Lodge a complaint with a data protection authority</Typography>
            </ListItem>
          </List>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, mb: 3 }}>
            To exercise your rights, contact us at:{' '}
            <Link href="mailto:privacy@konfydence.com" sx={{ color: '#0B7897' }}>
              privacy@konfydence.com
            </Link>
          </Typography>

          <Typography variant="h4" sx={{ mt: 5, mb: 2, color: '#063C5E', fontWeight: 600 }}>
            9. California and Other U.S. Privacy Rights
          </Typography>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, mb: 2 }}>
            If you are a resident of California or another U.S. state with similar privacy laws (such as the CCPA/CPRA), you may have additional rights, including:
          </Typography>
          <List sx={{ pl: 3, mb: 2 }}>
            <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 0 }}>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>The right to know what personal information we collect and disclose</Typography>
            </ListItem>
            <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 0 }}>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>The right to request deletion of your personal information</Typography>
            </ListItem>
            <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 0 }}>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                The right to opt out of the &quot;sale&quot; or &quot;sharing&quot; of personal information
                <br />
                (Konfydence does not sell or share personal data as defined by these laws)
              </Typography>
            </ListItem>
            <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 0 }}>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>The right to non-discrimination for exercising your privacy rights</Typography>
            </ListItem>
          </List>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, mb: 1, fontWeight: 600 }}>
            We honor:
          </Typography>
          <List sx={{ pl: 3, mb: 2 }}>
            <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 0 }}>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>Requests submitted by authorized agents</Typography>
            </ListItem>
            <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 0 }}>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>Browser-based opt-out preference signals, such as Global Privacy Control (GPC), where applicable</Typography>
            </ListItem>
          </List>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, mb: 3 }}>
            To exercise these rights, please contact us at{' '}
            <Link href="mailto:privacy@konfydence.com" sx={{ color: '#0B7897' }}>
              privacy@konfydence.com
            </Link>
            .
          </Typography>

          <Typography variant="h4" sx={{ mt: 5, mb: 2, color: '#063C5E', fontWeight: 600 }}>
            10. Data Security
          </Typography>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, mb: 2 }}>
            We implement appropriate technical and organizational measures to protect personal data against unauthorized access, loss, misuse, or disclosure.
          </Typography>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, mb: 3 }}>
            While no system is completely secure, we take reasonable and proportionate steps to safeguard your information.
          </Typography>

          <Typography variant="h4" sx={{ mt: 5, mb: 2, color: '#063C5E', fontWeight: 600 }}>
            11. Children&apos;s Privacy
          </Typography>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, mb: 3 }}>
            Konfydence does not knowingly collect personal data from children under the age of 16 without parental or guardian consent. If you believe such data has been provided to us, please contact us so we can take appropriate action.
          </Typography>

          <Typography variant="h4" sx={{ mt: 5, mb: 2, color: '#063C5E', fontWeight: 600 }}>
            12. Changes to This Policy
          </Typography>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, mb: 3 }}>
            We may update this Privacy & Cookies Policy from time to time. The current version will always be available on this page, and the &quot;Last updated&quot; date will reflect any changes.
          </Typography>

          <Typography variant="h4" sx={{ mt: 5, mb: 2, color: '#063C5E', fontWeight: 600 }}>
            13. Contact
          </Typography>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, mb: 2 }}>
            If you have questions about this policy or how we handle personal data, please contact:{' '}
            <Link href="mailto:privacy@konfydence.com" sx={{ color: '#0B7897' }}>
              privacy@konfydence.com
            </Link>
          </Typography>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, mb: 4 }}>
            Website:{' '}
            <Link href="https://www.konfydence.com" target="_blank" rel="noopener noreferrer" sx={{ color: '#0B7897' }}>
              https://www.konfydence.com
            </Link>
          </Typography>
        </Container>
      </Box>
      <Footer />
    </>
  );
}

