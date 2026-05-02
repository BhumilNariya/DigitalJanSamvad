# Contributing to Digital Jan Samvad

Thank you for your interest in contributing! This document provides guidelines and best practices.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Code Style](#code-style)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)

---

## 🤝 Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on code, not the coder
- Report issues responsibly

---

## 🚀 Getting Started

### 1. Fork & Clone
```bash
git clone https://github.com/YOUR_USERNAME/DigitalJanSamvad.git
cd DigitalJanSamvad
git remote add upstream https://github.com/BhumilNariya/DigitalJanSamvad.git
```

### 2. Create Feature Branch
```bash
git checkout -b feature/your-feature-name
# or for bug fixes
git checkout -b bugfix/issue-description
```

### 3. Install Dependencies
```bash
npm install
cd backend && npm install && cd ..
```

### 4. Setup Environment
```bash
cp .env.example .env.local
cp backend/.env.example backend/.env
# Fill in your credentials
```

---

## 🔄 Development Workflow

### Before Starting
```bash
# Sync with upstream
git fetch upstream
git rebase upstream/main
```

### While Developing
```bash
# Keep changes focused on ONE feature
# Run linter frequently
npm run lint

# Test your changes
npm run dev
# In another terminal
cd backend && node server.js
```

### Before Committing
```bash
# Check git status
git status

# Stage specific files
git add path/to/file

# Review changes
git diff --staged
```

---

## 💬 Commit Message Guidelines

### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (no logic change)
- `refactor`: Code refactoring
- `perf`: Performance improvement
- `test`: Adding tests
- `chore`: Build, deps, config

### Examples

**Good:**
```
feat(issues): add issue filtering by category

- Added CategoryFilter component
- Implemented API endpoint for filtering
- Updated issue list to use new filter

Closes #123
```

```
fix(auth): prevent duplicate token generation

Fixed race condition where multiple login attempts
generated multiple tokens simultaneously.
```

```
docs(readme): update installation steps
```

**Bad:**
```
update files           # Too vague
Fixed stuff           # No scope
another fix           # No details
```

### Tips
- Use imperative mood: "add" not "added"
- Don't end subject with period
- Keep subject under 50 chars
- Explain WHAT and WHY, not HOW
- Reference issues: `Closes #123` or `Fixes #456`

---

## 🎨 Code Style

### Frontend (TypeScript/React)
```typescript
// ✅ Good
export const IssueCard: React.FC<IssueCardProps> = ({ issue, onUpvote }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleClick = async () => {
    setIsLoading(true);
    try {
      await onUpvote(issue.id);
    } finally {
      setIsLoading(false);
    }
  };

  return <button onClick={handleClick}>{issue.title}</button>;
};

// ❌ Bad
export default function issueCard(props) {
  const [loading, setLoading] = props.loading;
  const handleClick = () => props.onUpvote(props.id);
  return <button onClick={() => handleClick()}>{props.title}</button>;
}
```

### Naming Conventions
```typescript
// Components: PascalCase
const IssueCard = () => {}
const AdminDashboard = () => {}

// Functions: camelCase
const fetchIssues = () => {}
const calculateScore = () => {}

// Constants: UPPER_SNAKE_CASE
const API_BASE_URL = 'http://localhost:5000'
const DEFAULT_PAGE_SIZE = 20

// Types: PascalCase with 'Type' suffix
type UserType = { id: string; name: string }
interface IssueProps { id: string }
```

### Backend (Node.js/Express)
```javascript
// ✅ Good - Clear, documented, error handling
/**
 * Fetch all issues with pagination
 * @param {number} page - Page number
 * @param {number} limit - Results per page
 * @returns {Promise<Object>} Issues and metadata
 */
async function fetchIssues(page = 1, limit = 20) {
  try {
    const skip = (page - 1) * limit;
    const issues = await Issue.find()
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });
    
    const total = await Issue.countDocuments();
    
    return {
      data: issues,
      pagination: { page, limit, total }
    };
  } catch (error) {
    throw new Error(`Failed to fetch issues: ${error.message}`);
  }
}

// ❌ Bad - Unclear, no error handling
function getIssues(p, l) {
  return Issue.find().limit(l).skip(p);
}
```

### ESLint Rules
```bash
# Run linter
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix
```

---

## 📤 Pull Request Process

### 1. Before Creating PR
```bash
# Update main branch
git fetch upstream
git rebase upstream/main

# Resolve conflicts if any
git add .
git rebase --continue
```

### 2. Push to Your Fork
```bash
git push origin feature/your-feature-name
```

### 3. Create Pull Request
- Go to GitHub repository
- Click "Compare & pull request"
- Use descriptive title: `feat: add issue filtering`
- Fill out PR template

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Documentation update

## Related Issue
Closes #123

## Testing
- [ ] Tested locally
- [ ] No breaking changes
- [ ] Added tests if needed

## Screenshots (if applicable)
Add before/after screenshots
```

### Review Process
- Address reviewer feedback
- Push updates to same branch (auto-updates PR)
- Request re-review when ready
- Maintain professional communication

---

## ✅ Testing

### Frontend Tests
```bash
# Run tests (if configured)
npm test

# Run with coverage
npm test -- --coverage
```

### Manual Testing Checklist
- [ ] Feature works as described
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Keyboard navigation works
- [ ] Existing features not broken

### Backend Testing
```bash
# Start backend with test data
cd backend
node server.js
```

**Test Scenarios:**
- [ ] Auth flow (register → login → logout)
- [ ] Create issue → View → Update → Delete
- [ ] Comments and upvotes
- [ ] Admin operations
- [ ] Error handling

---

## 📚 Additional Resources

- [GitHub Flow Guide](https://guides.github.com/introduction/flow/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [ESLint Docs](https://eslint.org/docs/rules/)

---

## ❓ Questions?

- Open a [Discussion](https://github.com/BhumilNariya/DigitalJanSamvad/discussions)
- Create an [Issue](https://github.com/BhumilNariya/DigitalJanSamvad/issues)

---

**Thank you for contributing! 🙌**
