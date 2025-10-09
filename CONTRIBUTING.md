# Contributing to Custom Web3 Provider SDK

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Enhancements](#suggesting-enhancements)

## Code of Conduct

This project adheres to a Code of Conduct. By participating, you are expected to uphold this code. Please be respectful and constructive in all interactions.

## Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 7
- Git

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
```bash
git clone https://github.com/YOUR_USERNAME/custom-web3-provider-sdk.git
cd custom-web3-provider-sdk
```

### Install Dependencies

```bash
npm install
```

### Build the Project

```bash
npm run build
```

### Run the Demo

```bash
npm run dev:setup
cd demo
npm run dev
```

## Development Workflow

### 1. Create a Branch

Create a feature branch from `main`:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 2. Make Changes

- Write clean, readable code
- Follow TypeScript best practices
- Add JSDoc comments for public APIs
- Update documentation as needed

### 3. Test Your Changes

```bash
# Type check
npm run type-check

# Lint
npm run lint

# Format
npm run format

# Run all checks
npm run check-all

# Build
npm run build

# Test in demo
npm run install:demo
cd demo && npm run dev
```

### 4. Commit Your Changes

Use conventional commit messages:

```bash
git commit -m "feat: add new wallet provider support"
git commit -m "fix: resolve connection timeout issue"
git commit -m "docs: update README with new examples"
git commit -m "refactor: improve error handling"
git commit -m "test: add unit tests for wallet actions"
```

Commit types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## Coding Standards

### TypeScript

- Use strict TypeScript mode
- Provide explicit types for public APIs
- Avoid `any` type (use `unknown` if necessary)
- Use modern ES6+ features

### Code Style

- Use Prettier for formatting (runs automatically)
- Use ESLint for linting (runs automatically)
- 2 spaces for indentation
- Single quotes for strings
- Semicolons required
- 80-100 character line limit

### Naming Conventions

- **Files**: camelCase for utilities, PascalCase for components
- **Variables/Functions**: camelCase
- **Classes/Types**: PascalCase
- **Constants**: UPPER_SNAKE_CASE
- **Private members**: prefix with underscore (_)

### Logging

- Use the logger utility, never `console.log`
- Debug logs should be informative but not verbose
- Error logs should include context

```typescript
import { logger } from './utils/logger';

// Good
logger.debug('Connection attempt', { provider: 'metamask' });
logger.error('Connection failed', error, { context: 'connect' });

// Bad
console.log('debug info');
```

### Error Handling

- Always use custom error classes
- Provide meaningful error messages
- Include error codes for categorization

```typescript
throw new Web3ProviderError(
  'Connection timeout',
  ERROR_CODES.TIMEOUT,
  { provider: 'metamask' }
);
```

### Comments

- Use JSDoc for public APIs
- Write self-documenting code
- Comment complex logic
- Avoid obvious comments

```typescript
/**
 * Connects to a Web3 wallet provider
 * @param name - The wallet provider name
 * @returns Promise resolving to connection result
 * @throws {ProviderNotFoundError} If provider is not detected
 */
async connect(name: WalletProviderName): Promise<ConnectionResult> {
  // Implementation
}
```

## Testing

### Unit Tests

Write unit tests for:
- Utility functions
- Error handling
- Type guards
- Data transformations

### Integration Tests

Test:
- Provider detection
- Connection flows
- Event handling
- Wallet actions

### Manual Testing

Test with real wallets:
- MetaMask
- Coinbase Wallet
- Trust Wallet
- Other supported wallets

Test on multiple:
- Browsers (Chrome, Firefox, Safari, Brave)
- Networks (Mainnet, testnets)
- Devices (Desktop, mobile)

## Pull Request Process

### Before Submitting

- ✅ All tests pass
- ✅ Code is linted and formatted
- ✅ TypeScript compiles without errors
- ✅ Documentation is updated
- ✅ CHANGELOG.md is updated (for significant changes)
- ✅ No console.log statements
- ✅ Commit messages follow conventions

### PR Description

Include in your PR description:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe how you tested the changes

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated
```

### Review Process

1. Automated checks must pass (linting, type checking, build)
2. Code review by maintainers
3. Address feedback
4. Approval and merge

## Reporting Bugs

### Before Reporting

- Check existing issues
- Try to reproduce on latest version
- Gather relevant information

### Bug Report Template

```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

## Expected Behavior
What should happen

## Actual Behavior
What actually happened

## Environment
- SDK Version: 
- Browser: 
- Wallet: 
- Network: 
- OS: 

## Screenshots/Logs
If applicable

## Additional Context
Any other relevant information
```

## Suggesting Enhancements

### Enhancement Template

```markdown
## Feature Description
Clear description of the proposed feature

## Problem It Solves
What problem does this solve?

## Proposed Solution
How should this work?

## Alternatives Considered
What other solutions did you consider?

## Additional Context
Mockups, examples, etc.
```

## Development Tips

### Debugging

Enable debug logging:
```typescript
const provider = useWeb3Provider({
  debug: true,
  // ... other options
});
```

### Testing Locally with Demo

```bash
npm run install:demo
cd demo
npm run dev
```

### Checking Bundle Size

```bash
npm run build
ls -lh dist/
```

### Performance Profiling

Use Chrome DevTools or React DevTools Profiler to identify performance issues.

## Community

- GitHub Issues: Bug reports and feature requests
- GitHub Discussions: Questions and general discussion
- Pull Requests: Code contributions

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

Feel free to open an issue for any questions about contributing!

---

Thank you for contributing to Custom Web3 Provider SDK! 🚀
