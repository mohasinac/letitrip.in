# Security Policy

## Supported Versions

We actively support the following versions with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please follow these steps:

### 1. **Do Not** Open a Public Issue

Please do not disclose security vulnerabilities publicly until we've had a chance to address them.

### 2. Report Privately

Send an email to: **security@letitrip.com**

Include:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### 3. What to Expect

- **Acknowledgment**: Within 48 hours
- **Initial Assessment**: Within 5 business days
- **Regular Updates**: Every 7 days until resolved
- **Fix Timeline**: Critical issues within 7 days, others within 30 days

### 4. Disclosure Process

1. We'll investigate and confirm the issue
2. We'll develop a fix
3. We'll test the fix thoroughly
4. We'll release a security update
5. We'll publicly disclose the vulnerability (after fix is deployed)

## Security Best Practices

### For Users

1. **Keep Updated**: Always use the latest version
2. **Review Dependencies**: Regularly audit your dependencies
3. **Report Issues**: If you see something, say something

### For Contributors

1. **Input Validation**: Always validate and sanitize user inputs
2. **Dependencies**: Use trusted, maintained packages
3. **Sensitive Data**: Never commit API keys, tokens, or passwords
4. **Code Review**: Security-critical changes require extra review

## Known Security Considerations

### XSS Prevention

Our library includes sanitization utilities (`sanitizeHtml`, `sanitizeString`) to prevent XSS attacks. Always use these when displaying user-generated content:

```typescript
import { sanitizeHtml } from "@letitrip/react-library/utils";

function UserContent({ content }) {
  return <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }} />;
}
```

### Input Validation

Use our validation utilities to ensure data integrity:

```typescript
import { validateEmail, validatePhone } from "@letitrip/react-library/utils";

// Validate before processing
if (!validateEmail(email)) {
  throw new Error("Invalid email");
}
```

### Dependency Security

We regularly audit dependencies using:

- `npm audit`
- Dependabot
- Snyk

## Security Features

### Built-in Protection

1. **XSS Prevention**: HTML sanitization utilities
2. **Input Validation**: Comprehensive validators
3. **Type Safety**: Full TypeScript support
4. **Safe Defaults**: Components use secure defaults

### Accessibility & Security

Proper accessibility features prevent:

- Clickjacking (proper ARIA roles)
- Navigation confusion (semantic HTML)
- Focus trapping issues (focus management)

## Third-Party Dependencies

We carefully vet all dependencies for:

- Active maintenance
- Security track record
- Community trust
- Minimal attack surface

Current key dependencies:

- `react` - Meta (Facebook)
- `date-fns` - Well-maintained, security-focused
- `libphonenumber-js` - Phone validation standard
- `tailwind-merge` - CSS utility, minimal risk

## Vulnerability Disclosure

### Our Commitment

- Respond quickly to security reports
- Provide timely fixes for confirmed issues
- Credit researchers (with permission)
- Maintain transparency with users

### Hall of Fame

We recognize security researchers who responsibly disclose vulnerabilities:

_No reports yet - be the first!_

## Security Updates

Subscribe to security notifications:

1. Watch repository on GitHub
2. Enable GitHub Security Advisories
3. Follow releases for security tags

## Contact

- **Security Email**: security@letitrip.com
- **General Issues**: https://github.com/letitrip/react-library/issues
- **Discussions**: https://github.com/letitrip/react-library/discussions

## Legal

This security policy is provided as-is. We reserve the right to:

- Update this policy at any time
- Determine if a report qualifies as a security issue
- Choose not to fix issues we deem low risk

Thank you for helping keep @letitrip/react-library secure! 🔒
