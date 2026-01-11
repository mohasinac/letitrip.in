import { Metadata } from "next";
import LegalPageLayout from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = {
  title: "Cookie Policy - Let It Rip",
  description:
    "Learn about how Let It Rip uses cookies and tracking technologies to improve your shopping experience. Cookie types, purposes, and how to manage them.",
  robots: "index, follow",
};

export default function CookiePolicyPage() {
  return (
    <LegalPageLayout
      title="Cookie Policy"
      lastUpdated="November 7, 2025"
      version="2.0"
      effectiveDate="November 1, 2025"
    >
      <h2>1. What Are Cookies?</h2>
      <p>
        Cookies are small text files that are placed on your device (computer,
        smartphone, tablet) when you visit our website. They help us recognize
        your device and remember information about your visit, such as your
        preferred language, login status, and items in your cart.
      </p>
      <p>
        Cookies are widely used to make websites work more efficiently and
        provide a better user experience. They cannot access other files on your
        device or carry viruses.
      </p>

      <h2>2. Types of Cookies We Use</h2>

      <h3>2.1 Essential Cookies (Strictly Necessary)</h3>
      <p>
        These cookies are necessary for the website to function and cannot be
        switched off. They are usually set in response to actions you take, such
        as logging in, adding items to cart, or filling in forms.
      </p>
      <p>
        <strong>Examples:</strong>
      </p>
      <ul>
        <li>
          <strong>Session cookies:</strong> Keep you logged in during your
          session
        </li>
        <li>
          <strong>Authentication tokens:</strong> Verify your identity securely
        </li>
        <li>
          <strong>Shopping cart:</strong> Remember items you've added to cart
        </li>
        <li>
          <strong>Security cookies:</strong> Prevent fraudulent activity and
          CSRF attacks
        </li>
        <li>
          <strong>Language preference:</strong> Remember your language selection
        </li>
      </ul>
      <p>
        <em>
          You cannot opt-out of essential cookies as they are required for the
          site to work.
        </em>
      </p>

      <h3>2.2 Performance Cookies (Analytics)</h3>
      <p>
        These cookies help us understand how visitors interact with our website
        by collecting and reporting information anonymously. This helps us
        improve the user experience.
      </p>
      <p>
        <strong>What we track:</strong>
      </p>
      <ul>
        <li>Pages you visit and time spent on each page</li>
        <li>Links you click and buttons you interact with</li>
        <li>Search queries you enter</li>
        <li>Errors you encounter</li>
        <li>Browser type, device type, screen resolution</li>
        <li>Approximate location (city/country level)</li>
      </ul>
      <p>
        <strong>Analytics providers we use:</strong>
      </p>
      <ul>
        <li>
          <strong>Google Analytics:</strong> Website traffic and behavior
          analysis
        </li>
        <li>
          <strong>Firebase Analytics:</strong> App usage and crash reporting
        </li>
        <li>
          <strong>Hotjar:</strong> Heatmaps and session recordings (anonymized)
        </li>
      </ul>
      <p>
        <em>You can opt-out of analytics cookies in cookie settings.</em>
      </p>

      <h3>2.3 Functional Cookies</h3>
      <p>
        These cookies enable enhanced functionality and personalization. They
        may be set by us or third-party providers whose services we use on our
        pages.
      </p>
      <p>
        <strong>Examples:</strong>
      </p>
      <ul>
        <li>
          <strong>Recently viewed items:</strong> Show products you've recently
          browsed
        </li>
        <li>
          <strong>Wishlist/Favorites:</strong> Remember items you've favorited
        </li>
        <li>
          <strong>Location preference:</strong> Remember your shipping location
        </li>
        <li>
          <strong>Currency preference:</strong> Display prices in your preferred
          currency
        </li>
        <li>
          <strong>Notification preferences:</strong> Remember your notification
          settings
        </li>
        <li>
          <strong>Chat widget:</strong> Live chat functionality
        </li>
      </ul>
      <p>
        <em>
          You can control functional cookies in cookie settings. Disabling them
          may limit some features.
        </em>
      </p>

      <h3>2.4 Targeting/Advertising Cookies</h3>
      <p>
        These cookies are set by our advertising partners to build a profile of
        your interests and show you relevant ads on other websites. They don't
        store personal information but uniquely identify your browser and
        device.
      </p>
      <p>
        <strong>What they do:</strong>
      </p>
      <ul>
        <li>Track which pages you visit on our site</li>
        <li>Show you our ads on other websites (remarketing)</li>
        <li>Limit how many times you see the same ad</li>
        <li>Measure ad campaign effectiveness</li>
        <li>Show personalized product recommendations</li>
      </ul>
      <p>
        <strong>Advertising partners we work with:</strong>
      </p>
      <ul>
        <li>
          <strong>Google Ads:</strong> Display advertising and remarketing
        </li>
        <li>
          <strong>Facebook Pixel:</strong> Social media advertising
        </li>
        <li>
          <strong>Instagram Ads:</strong> Product promotion on Instagram
        </li>
      </ul>
      <p>
        <em>
          You can opt-out of advertising cookies in cookie settings or browser
          privacy settings.
        </em>
      </p>

      <h3>2.5 Social Media Cookies</h3>
      <p>
        These cookies are set by social media services we've added to the site
        to enable you to share our content with your friends and networks.
      </p>
      <p>
        <strong>Social platforms:</strong>
      </p>
      <ul>
        <li>
          <strong>Facebook:</strong> Share button, Like plugin
        </li>
        <li>
          <strong>Instagram:</strong> Embedded posts, share button
        </li>
        <li>
          <strong>Twitter:</strong> Tweet button, embedded tweets
        </li>
        <li>
          <strong>YouTube:</strong> Embedded videos
        </li>
        <li>
          <strong>WhatsApp:</strong> Share button
        </li>
      </ul>
      <p>
        These services may track your activity across different sites even if
        you don't interact with the social buttons. Refer to their privacy
        policies for details.
      </p>

      <h2>3. Other Tracking Technologies</h2>

      <h3>3.1 Web Beacons (Pixels)</h3>
      <p>
        Small invisible images embedded in web pages and emails to track opens,
        clicks, and conversions. Used for:
      </p>
      <ul>
        <li>Email open rate tracking</li>
        <li>Conversion tracking (purchases after ad click)</li>
        <li>Website traffic analysis</li>
      </ul>

      <h3>3.2 Local Storage</h3>
      <p>
        Browser storage that persists even after you close the browser. We use
        it for:
      </p>
      <ul>
        <li>Shopping cart persistence (guest users)</li>
        <li>Recently viewed products</li>
        <li>User preferences and settings</li>
        <li>Performance optimization (caching)</li>
      </ul>

      <h3>3.3 Session Storage</h3>
      <p>
        Temporary storage that clears when you close the browser tab. Used for:
      </p>
      <ul>
        <li>Multi-step checkout process</li>
        <li>Form data persistence</li>
        <li>Temporary filters and sorting</li>
      </ul>

      <h3>3.4 Device Fingerprinting</h3>
      <p>
        We may collect information about your device configuration (browser, OS,
        screen size, fonts, plugins) to:
      </p>
      <ul>
        <li>Detect and prevent fraud</li>
        <li>Identify returning users across devices</li>
        <li>Optimize display for your device</li>
      </ul>

      <h2>4. Third-Party Cookies</h2>
      <p>
        Some cookies are set by third-party services we use. We don't control
        these cookies directly. Please review their privacy policies:
      </p>

      <h3>4.1 Payment Processors</h3>
      <ul>
        <li>
          <strong>Razorpay:</strong> Secure payment processing
          <br />
          <a
            href="https://razorpay.com/privacy/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Razorpay Privacy Policy
          </a>
        </li>
      </ul>

      <h3>4.2 Analytics & Performance</h3>
      <ul>
        <li>
          <strong>Google Analytics:</strong> Website analytics
          <br />
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Google Privacy Policy
          </a>
        </li>
        <li>
          <strong>Firebase:</strong> App analytics and hosting
          <br />
          <a
            href="https://firebase.google.com/support/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Firebase Privacy Policy
          </a>
        </li>
      </ul>

      <h3>4.3 Advertising & Marketing</h3>
      <ul>
        <li>
          <strong>Google Ads:</strong> Display advertising
          <br />
          <a
            href="https://policies.google.com/technologies/ads"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Google Ads Policy
          </a>
        </li>
        <li>
          <strong>Facebook/Meta:</strong> Social advertising
          <br />
          <a
            href="https://www.facebook.com/privacy/policy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Meta Privacy Policy
          </a>
        </li>
      </ul>

      <h2>5. How to Manage Cookies</h2>

      <h3>5.1 Cookie Consent Banner</h3>
      <p>
        When you first visit our site, you'll see a cookie consent banner. You
        can:
      </p>
      <ul>
        <li>
          <strong>Accept All:</strong> Allow all cookies (essential, analytics,
          functional, advertising)
        </li>
        <li>
          <strong>Reject Non-Essential:</strong> Only essential cookies (site
          may have limited functionality)
        </li>
        <li>
          <strong>Customize:</strong> Choose which cookie categories to allow
        </li>
      </ul>
      <p>
        You can change your cookie preferences anytime by clicking the "Cookie
        Settings" link in the footer.
      </p>

      <h3>5.2 Browser Settings</h3>
      <p>
        You can control cookies through your browser settings. However,
        disabling cookies may affect site functionality.
      </p>
      <p>
        <strong>How to manage cookies in popular browsers:</strong>
      </p>
      <ul>
        <li>
          <strong>Google Chrome:</strong> Settings → Privacy and security →
          Cookies and site data
        </li>
        <li>
          <strong>Firefox:</strong> Settings → Privacy & Security → Cookies and
          Site Data
        </li>
        <li>
          <strong>Safari:</strong> Preferences → Privacy → Manage Website Data
        </li>
        <li>
          <strong>Edge:</strong> Settings → Cookies and site permissions →
          Cookies and site data
        </li>
        <li>
          <strong>Brave:</strong> Settings → Shields → Cookies
        </li>
      </ul>

      <h3>5.3 Opt-Out Tools</h3>
      <p>Additional ways to control tracking:</p>
      <ul>
        <li>
          <strong>Google Analytics Opt-out:</strong>
          <br />
          <a
            href="https://tools.google.com/dlpage/gaoptout"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Install Google Analytics Opt-out Browser Add-on
          </a>
        </li>
        <li>
          <strong>Network Advertising Initiative (NAI):</strong>
          <br />
          <a
            href="https://optout.networkadvertising.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Opt-out of interest-based advertising
          </a>
        </li>
        <li>
          <strong>Digital Advertising Alliance (DAA):</strong>
          <br />
          <a
            href="https://optout.aboutads.info/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Control online behavioral advertising
          </a>
        </li>
      </ul>

      <h3>5.4 Mobile Device Settings</h3>
      <p>On mobile devices, you can limit tracking through:</p>
      <ul>
        <li>
          <strong>iOS:</strong> Settings → Privacy → Tracking → Disable "Allow
          Apps to Request to Track"
        </li>
        <li>
          <strong>Android:</strong> Settings → Google → Ads → Opt out of Ads
          Personalization
        </li>
      </ul>

      <h2>6. Do Not Track (DNT)</h2>
      <p>
        Some browsers offer a "Do Not Track" signal. However, there is no
        industry standard for how to respond to DNT signals. Currently, our site
        does not respond to DNT signals, but you can manage cookies through
        browser settings or our cookie consent tool.
      </p>

      <h2>7. Cookie Lifespan</h2>
      <p>Cookies we use have different lifespans:</p>

      <h3>7.1 Session Cookies</h3>
      <ul>
        <li>Deleted when you close your browser</li>
        <li>Used for: login sessions, shopping cart</li>
      </ul>

      <h3>7.2 Persistent Cookies</h3>
      <ul>
        <li>
          <strong>Short-term (1-7 days):</strong> Flash sale reminders, limited
          promotions
        </li>
        <li>
          <strong>Medium-term (30-90 days):</strong> Language preference,
          recently viewed items
        </li>
        <li>
          <strong>Long-term (1-2 years):</strong> Analytics, advertising, user
          identification
        </li>
      </ul>
      <p>
        You can delete cookies manually through browser settings at any time.
      </p>

      <h2>8. Cookies and Your Rights</h2>
      <p>Under Indian and international privacy laws, you have the right to:</p>
      <ul>
        <li>
          <strong>Know what cookies are being used:</strong> This policy
          provides full transparency
        </li>
        <li>
          <strong>Choose which cookies to allow:</strong> Use our cookie consent
          tool
        </li>
        <li>
          <strong>Withdraw consent:</strong> Change cookie settings anytime
        </li>
        <li>
          <strong>Delete cookies:</strong> Clear cookies through browser
          settings
        </li>
        <li>
          <strong>Request cookie data:</strong> Contact us for details on
          cookies we've set
        </li>
      </ul>

      <h2>9. Impact of Disabling Cookies</h2>
      <p>
        If you disable or reject non-essential cookies, the following features
        may not work properly:
      </p>
      <ul>
        <li>
          <strong>Personalization:</strong> Product recommendations, recently
          viewed items
        </li>
        <li>
          <strong>Shopping cart:</strong> Items may not persist across sessions
          (guest users)
        </li>
        <li>
          <strong>Preferences:</strong> Language, currency, location settings
          reset each visit
        </li>
        <li>
          <strong>Analytics:</strong> We can't improve site based on usage
          patterns
        </li>
        <li>
          <strong>Advertising:</strong> You'll still see ads, but less relevant
          to your interests
        </li>
        <li>
          <strong>Social sharing:</strong> Share buttons may not work
        </li>
      </ul>
      <p>
        <strong>Essential cookies cannot be disabled</strong> as they are
        required for core functionality (login, checkout, security).
      </p>

      <h2>10. Cookies for Security</h2>
      <p>We use cookies to enhance security and prevent fraud:</p>
      <ul>
        <li>
          <strong>CSRF tokens:</strong> Prevent cross-site request forgery
          attacks
        </li>
        <li>
          <strong>Session validation:</strong> Ensure you're the legitimate
          account owner
        </li>
        <li>
          <strong>Bot detection:</strong> Prevent automated attacks and spam
        </li>
        <li>
          <strong>Rate limiting:</strong> Prevent brute force login attempts
        </li>
        <li>
          <strong>Fraud prevention:</strong> Detect suspicious activity patterns
        </li>
      </ul>

      <h2>11. Updates to Cookie Policy</h2>
      <p>We may update this Cookie Policy to reflect:</p>
      <ul>
        <li>Changes in cookies we use</li>
        <li>New third-party services</li>
        <li>Updates to privacy laws and regulations</li>
        <li>Changes in our business practices</li>
      </ul>
      <p>When we make significant changes, we'll notify you by:</p>
      <ul>
        <li>Updating the "Last Updated" date on this page</li>
        <li>Showing a notice on the website</li>
        <li>Sending an email (for material changes)</li>
      </ul>
      <p>
        We recommend reviewing this policy periodically to stay informed about
        how we use cookies.
      </p>

      <h2>12. Children's Privacy</h2>
      <p>
        Our services are not intended for children under 18. We do not knowingly
        collect data from children through cookies. If you're a parent and
        believe your child has provided information through our cookies, contact
        us to request deletion.
      </p>

      <h2>13. International Users</h2>
      <p>
        If you're visiting from outside India, please note that cookies may
        transfer your data internationally. By using our site, you consent to
        such transfers. We ensure appropriate safeguards are in place as
        required by applicable laws.
      </p>

      <h2>14. Contact Us About Cookies</h2>
      <p>If you have questions about our use of cookies:</p>
      <ul>
        <li>
          <strong>Email:</strong> privacy@letitrip.com
        </li>
        <li>
          <strong>Subject:</strong> "Cookie Policy Inquiry"
        </li>
        <li>
          <strong>Support:</strong>{" "}
          <a href="/support/ticket">Create a Support Ticket</a>
        </li>
        <li>
          <strong>Cookie Settings:</strong> Manage your preferences in the
          footer
        </li>
      </ul>

      <h2>15. Glossary</h2>
      <p>Common cookie-related terms explained:</p>
      <ul>
        <li>
          <strong>First-party cookies:</strong> Set by letitrip.com domain
        </li>
        <li>
          <strong>Third-party cookies:</strong> Set by other domains (analytics,
          ads)
        </li>
        <li>
          <strong>Session cookies:</strong> Temporary, deleted when browser
          closes
        </li>
        <li>
          <strong>Persistent cookies:</strong> Remain after browser closes
          (until expiry or manual deletion)
        </li>
        <li>
          <strong>Secure cookies:</strong> Only transmitted over HTTPS
          (encrypted)
        </li>
        <li>
          <strong>HttpOnly cookies:</strong> Cannot be accessed by JavaScript
          (security)
        </li>
        <li>
          <strong>SameSite cookies:</strong> Restrict cross-site cookie sending
          (security)
        </li>
      </ul>

      <hr />

      <p className="text-sm text-gray-600 mt-8">
        <strong>Version History:</strong>
        <br />
        Version 2.0 (November 1, 2025): Added India-specific information, mobile
        device settings, additional third-party services
        <br />
        Version 1.0 (January 1, 2024): Initial cookie policy
      </p>
    </LegalPageLayout>
  );
}
