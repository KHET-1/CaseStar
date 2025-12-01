# CaseStar Security Documentation

## Content Security Policy (CSP)

### Overview
CaseStar implements a strict Content Security Policy to protect against XSS attacks and other code injection vulnerabilities.

### Configuration
The CSP is configured in `next.config.ts` with different policies for development and production environments.

### Development Environment
**Policy**: Relaxed CSP allowing `unsafe-eval` and localhost connections

```
script-src 'self' 'unsafe-inline' 'unsafe-eval'
connect-src 'self' ws://localhost:* http://localhost:*
```

**Why?**
- `unsafe-eval` is required for:
  - Next.js hot module reloading (HMR)
  - Development debugging tools
  - Source map generation
- Localhost websockets enable HMR functionality

### Production Environment
**Policy**: Strict CSP without eval

```
script-src 'self' 'unsafe-inline'
connect-src 'self'
```

**Security Features**:
- ✅ No `unsafe-eval` - prevents arbitrary code execution
- ✅ `X-Frame-Options: DENY` - prevents clickjacking
- ✅ `X-Content-Type-Options: nosniff` - prevents MIME sniffing
- ✅ `frame-ancestors 'none'` - additional iframe protection
- ✅ `Permissions-Policy` - restricts browser features

### Handling Dependencies That Use Eval

#### Framer Motion
Framer Motion (used for animations) **does not** require `unsafe-eval` in modern versions. If you see eval warnings:

1. **Check your version**: Ensure you're on the latest version
   ```bash
   npm update framer-motion
   ```

2. **If warnings persist**, they may be false positives from browser dev tools. Check actual functionality.

#### styled-jsx (if added)
If you add styled-jsx, it **requires** `unsafe-eval`. Alternatives:
- Use Tailwind CSS (already installed)
- Use CSS Modules
- Use vanilla CSS

### Common CSP Errors and Solutions

#### Error: "Refused to evaluate a string as JavaScript"
**Cause**: Code is trying to use `eval()`, `Function()`, or string-based setTimeout/setInterval

**Solutions**:
1. Replace `eval()` with safer alternatives:
   ```javascript
   // ❌ Bad
   eval('someCode()')
   
   // ✅ Good
   someCode()
   ```

2. Replace string-based timers:
   ```javascript
   // ❌ Bad
   setTimeout('doSomething()', 1000)
   
   // ✅ Good
   setTimeout(() => doSomething(), 1000)
   ```

#### Error: "Refused to connect to 'ws://...' because it violates CSP"
**Cause**: WebSocket connection blocked in production

**Solution**: Add the specific domain to `connect-src`:
```typescript
connect-src 'self' wss://your-domain.com
```

### Testing CSP

#### Development Testing
```bash
npm run dev
# Check browser console for CSP violations
```

#### Production Testing
```bash
npm run build
npm start
# Verify no CSP violations in console
```

### Security Best Practices

1. **Never add `unsafe-eval` to production** unless absolutely necessary
2. **Audit all dependencies** that might use eval
3. **Monitor browser console** for CSP violations
4. **Use nonces or hashes** for inline scripts if needed (advanced)
5. **Regular security updates**: Keep dependencies up to date

### Reporting CSP Violations

To enable CSP violation reporting (optional), add to next.config.ts:

```typescript
"report-uri /api/csp-report"
```

Then create an API route to handle reports.

### Additional Security Headers

CaseStar also implements:

- **X-Frame-Options**: Prevents clickjacking
- **X-Content-Type-Options**: Prevents MIME sniffing
- **Referrer-Policy**: Controls referrer information
- **Permissions-Policy**: Restricts browser features

### Resources

- [MDN CSP Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)
- [Next.js Security Headers](https://nextjs.org/docs/app/api-reference/next-config-js/headers)

---

**Last Updated**: 2025-12-01
**Maintained By**: CaseStar Security Team
