import { Metadata } from "next";
import { Box, Container, Typography, Card, CardContent } from "@mui/material";
import {
  HeroSection,
  ThemeAwareBox,
} from "@/components/shared/ThemeAwareComponents";

export const metadata: Metadata = {
  title: "Cookie Policy - JustForView",
  description:
    "Learn about how we use cookies to improve your experience on JustForView.",
};

export default function CookiePolicyPage() {
  return (
    <ThemeAwareBox>
      {/* Hero Section */}
      <HeroSection>
        <Container maxWidth="xl">
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h1"
              sx={{ fontWeight: 700, mb: 3, color: "white" }}
            >
              Cookie Policy
            </Typography>
            <Typography
              variant="h6"
              sx={{ maxWidth: 800, mx: "auto", color: "white", opacity: 0.9 }}
            >
              Learn about how we use cookies to improve your experience on
              JustForView.
            </Typography>
          </Box>
        </Container>
      </HeroSection>

      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <Typography
                  variant="h6"
                  color="text.secondary"
                  sx={{ lineHeight: 1.7 }}
                >
                  This Cookie Policy explains how JustForView uses cookies and
                  similar technologies to recognize you when you visit our
                  website.
                </Typography>
              </CardContent>
            </Card>

            {[
              {
                title: "What are cookies?",
                content: (
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ lineHeight: 1.7 }}
                  >
                    Cookies are small data files that are placed on your
                    computer or mobile device when you visit a website. Cookies
                    are widely used by website owners to make their websites
                    work, or to work more efficiently, as well as to provide
                    reporting information.
                  </Typography>
                ),
              },
              {
                title: "Types of cookies we use",
                content: (
                  <Box>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ lineHeight: 1.7, mb: 2 }}
                    >
                      <Typography
                        component="span"
                        fontWeight={600}
                        color="text.primary"
                      >
                        Essential Cookies:
                      </Typography>{" "}
                      These are necessary for the website to function properly,
                      including authentication and security.
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ lineHeight: 1.7, mb: 2 }}
                    >
                      <Typography
                        component="span"
                        fontWeight={600}
                        color="text.primary"
                      >
                        Performance Cookies:
                      </Typography>{" "}
                      These help us understand how visitors interact with our
                      website by collecting anonymous information.
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ lineHeight: 1.7, mb: 2 }}
                    >
                      <Typography
                        component="span"
                        fontWeight={600}
                        color="text.primary"
                      >
                        Functional Cookies:
                      </Typography>{" "}
                      These enable enhanced functionality and personalization,
                      such as remembering your preferences.
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ lineHeight: 1.7 }}
                    >
                      <Typography
                        component="span"
                        fontWeight={600}
                        color="text.primary"
                      >
                        Marketing Cookies:
                      </Typography>{" "}
                      These track visitors across websites to display relevant
                      advertisements.
                    </Typography>
                  </Box>
                ),
              },
              {
                title: "How to manage cookies",
                content: (
                  <Box>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ lineHeight: 1.7, mb: 2 }}
                    >
                      You can control and manage cookies in various ways:
                    </Typography>
                    <Box component="ul" sx={{ pl: 3, color: "text.secondary" }}>
                      <li>
                        Browser settings: Most browsers allow you to refuse or
                        accept cookies
                      </li>
                      <li>
                        Cookie preferences: Use our cookie consent banner to
                        manage your preferences
                      </li>
                      <li>
                        Delete cookies: You can delete existing cookies from
                        your browser
                      </li>
                      <li>
                        Opt-out tools: Use industry opt-out tools for
                        advertising cookies
                      </li>
                    </Box>
                  </Box>
                ),
              },
              {
                title: "Third-party cookies",
                content: (
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ lineHeight: 1.7 }}
                  >
                    We may use third-party services that place cookies on your
                    device, including analytics services like Google Analytics,
                    payment processors, and social media platforms. These third
                    parties have their own privacy policies and cookie policies.
                  </Typography>
                ),
              },
              {
                title: "Contact us",
                content: (
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ lineHeight: 1.7 }}
                  >
                    If you have any questions about our use of cookies, please
                    contact us at{" "}
                    <Typography
                      component="a"
                      href="mailto:privacy@justforview.in"
                      sx={{ color: "primary.main", textDecoration: "none" }}
                    >
                      privacy@justforview.in
                    </Typography>
                  </Typography>
                ),
              },
            ].map((section, index) => (
              <Card key={index} sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    {section.title}
                  </Typography>
                  {section.content}
                </CardContent>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>
    </ThemeAwareBox>
  );
}
