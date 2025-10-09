# Security Policy

## Supported Versions

Currently supported versions with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of custom-web3-provider-sdk seriously. If you have discovered a security vulnerability, please report it to us privately.

### Where to Report

**Please DO NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them via:

1. **Email**: Send details to security@your-domain.com (replace with actual email)
2. **GitHub Security Advisory**: Use the [GitHub Security Advisory](https://github.com/hardilsingh/custom-web3-provider-sdk/security/advisories/new) feature (private disclosure)

### What to Include

Please include the following information in your report:

- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact of the vulnerability
- Suggested fix (if you have one)
- Your contact information

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Depends on severity
  - Critical: 1-7 days
  - High: 7-14 days
  - Medium: 14-30 days
  - Low: 30-90 days

### Security Update Process

1. We will acknowledge receipt of your vulnerability report
2. We will confirm the vulnerability and determine its impact
3. We will develop a fix and test it thoroughly
4. We will prepare a security advisory
5. We will release a patch and publish the advisory
6. We will credit you in the advisory (unless you prefer to remain anonymous)

## Security Best Practices

### For SDK Users

When using custom-web3-provider-sdk:

1. **Always use the latest version** with security patches
2. **Validate user inputs** before passing to SDK functions
3. **Use error boundaries** to prevent information leakage
4. **Enable debug mode only in development** environments
5. **Keep dependencies updated** regularly
6. **Review audit logs** for suspicious activity

### For SDK Developers

When contributing to custom-web3-provider-sdk:

1. **Never log sensitive information** (private keys, passwords, etc.)
2. **Validate all inputs** at function boundaries
3. **Sanitize user data** before display
4. **Use parameterized queries** for any database operations
5. **Follow secure coding practices**
6. **Add security tests** for new features
7. **Review dependencies** for known vulnerabilities

## Known Security Considerations

### Private Key Handling

This SDK **never** handles or stores private keys. All signing operations are performed by the user's wallet extension.

### Provider Security

The SDK relies on the security of the connected wallet provider (MetaMask, Coinbase, etc.). Users should:

- Only install wallet extensions from official sources
- Keep their wallet software updated
- Use hardware wallets for significant funds
- Verify transaction details before signing

### Network Security

- All RPC requests are made through the user's wallet provider
- The SDK does not make direct network calls with sensitive data
- Users should use secure RPC endpoints

### Input Validation

The SDK validates:
- Ethereum addresses (format validation)
- Chain IDs (format validation)
- Transaction parameters (type validation)
- Custom request parameters (type validation)

### Memory Safety

- Event listeners are properly cleaned up
- No memory leaks in long-running applications
- WeakMap used for private data where appropriate

## Dependency Security

We regularly audit dependencies for security vulnerabilities:

```bash
npm audit
```

Critical and high severity vulnerabilities are addressed immediately.

## Security Features

### Current Security Features

- ✅ Input validation and sanitization
- ✅ Type-safe TypeScript implementation
- ✅ No eval() or dangerous dynamic code execution
- ✅ Secure event handling
- ✅ Memory leak prevention
- ✅ Error boundary support
- ✅ XSS protection through sanitization

### Planned Security Features

- [ ] Content Security Policy (CSP) helpers
- [ ] Rate limiting helpers
- [ ] Transaction validation helpers
- [ ] Phishing detection helpers

## Compliance

This SDK aims to comply with:

- OWASP Top 10 security practices
- CWE (Common Weakness Enumeration) guidelines
- Ethereum security best practices

## Security Contacts

- **Security Email**: security@your-domain.com
- **PGP Key**: [Link to PGP key if available]
- **GitHub**: [Security Advisory](https://github.com/hardilsingh/custom-web3-provider-sdk/security/advisories)

## Acknowledgments

We would like to thank the following security researchers for responsibly disclosing vulnerabilities:

- [List will be updated as vulnerabilities are reported and fixed]

## Disclosure Policy

When we receive a security bug report, we will:

1. Confirm the issue and determine affected versions
2. Audit code to find similar issues
3. Prepare fixes for all supported versions
4. Release new versions as soon as possible
5. Publish a security advisory with credits

We aim to disclose security issues within 90 days of receiving the report, or sooner if a fix is available.

---

**Last Updated**: 2025-01-08
**Version**: 1.0.0
