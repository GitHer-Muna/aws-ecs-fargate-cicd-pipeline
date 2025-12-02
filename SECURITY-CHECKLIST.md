# Pre-Push Security Checklist

## ✅ Files to Review Before Pushing

- [ ] `.gitignore` exists and includes:
  - [ ] `.env` and all environment files
  - [ ] `node_modules/`
  - [ ] AWS credentials
  - [ ] Build outputs (`dist/`, `build/`)

- [ ] No hardcoded secrets in code:
  - [ ] No AWS access keys
  - [ ] No database passwords
  - [ ] No API keys
  - [ ] No JWT secrets

- [ ] Task definition files use placeholders:
  - [ ] `<AWS_ACCOUNT_ID>` instead of actual account ID
  - [ ] `<AWS_REGION>` instead of actual region
  - [ ] Secrets reference ARNs, not actual values

- [ ] Docker files are secure:
  - [ ] Non-root users
  - [ ] No COPY of sensitive files
  - [ ] `.dockerignore` properly configured

- [ ] Documentation is professional:
  - [ ] No personal information
  - [ ] No internal company references
  - [ ] No placeholder text marked as "TODO"
  - [ ] Links are valid

## ✅ What's Safe to Push

✓ Dockerfile configurations  
✓ buildspec.yml (with environment variable placeholders)  
✓ task-definition files (with placeholders)  
✓ Application source code  
✓ Documentation (README, BLOG, ARCHITECTURE)  
✓ `.gitignore` and `.dockerignore`

## ❌ What Should NEVER be Pushed

✗ `.env` files  
✗ AWS credentials  
✗ Database connection strings with passwords  
✗ JWT secrets  
✗ API keys  
✗ SSL certificates/private keys  
✗ `node_modules/`  
✗ Build outputs (`dist/`, `build/`)

## 🔍 Quick Security Scan

Run these commands before pushing:

```bash
# Check for .env files
find . -name "*.env*" -not -path "*/node_modules/*"

# Check for AWS credentials
grep -r "AKIA" . --exclude-dir=node_modules --exclude-dir=.git

# Check for common secret patterns
grep -r -E "(password|secret|key).*=.*['\"][^'\"]{20,}" . \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  --exclude="*.md"

# Verify .gitignore exists
test -f .gitignore && echo "✓ .gitignore exists" || echo "✗ .gitignore missing!"
```

## 📝 Final Checks

- [ ] All placeholder values are clearly marked (e.g., `<AWS_ACCOUNT_ID>`)
- [ ] README mentions this is a learning/portfolio project
- [ ] No sensitive company/client information
- [ ] All documentation is grammatically correct
- [ ] Links in README work correctly
- [ ] License file is present (MIT recommended for portfolio)

## ✅ Ready to Push!

If all checks pass, you're good to go:

```bash
git add .
git commit -m "Your descriptive commit message"
git push origin main
```

---

**Note:** This checklist helps prevent accidental exposure of sensitive information in public repositories.
