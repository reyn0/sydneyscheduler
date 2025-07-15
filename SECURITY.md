# Security Guide for Environment Variables

## 🔒 **Keeping Secrets Safe**

This project uses environment variables to keep sensitive information (like Google Analytics IDs) secure and out of the GitHub repository.

### **What's Protected:**
- Google Analytics 4 Measurement ID
- API URLs (if different from default)
- Any future API keys or secrets

### **How It Works:**

#### ✅ **Safe (Committed to GitHub):**
```javascript
// In analytics.js - this is safe to commit
const GA_MEASUREMENT_ID = process.env.REACT_APP_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';
```

#### 🔒 **Secure (NOT committed to GitHub):**
```bash
# In .env file - this is gitignored
REACT_APP_GA_MEASUREMENT_ID=G-YOUR-REAL-ID-HERE
```

### **File Structure:**
```
frontend/
├── .env                    # 🔒 Your real secrets (gitignored)
├── .env.example           # ✅ Template for others (committed)
└── src/utils/analytics.js # ✅ Code template (committed)
```

### **Setup Process:**

#### **For Development:**
1. Copy `.env.example` to `.env`
2. Replace template values with your real IDs
3. Never commit the `.env` file

#### **For Production:**
1. Create `.env.production` on your server
2. Add real production values
3. Build with production environment

### **Why This Approach:**

#### ✅ **Benefits:**
- **Team Collaboration**: Others can clone and run without your personal IDs
- **Multiple Environments**: Different IDs for dev/staging/production
- **Security**: Real secrets never touch GitHub
- **Maintainability**: Code stays in version control
- **Flexibility**: Easy to change IDs without code changes

#### ❌ **Avoid These Approaches:**
- Hardcoding secrets in JavaScript files
- Adding `analytics.js` to `.gitignore` (removes useful code)
- Committing `.env` files with real values
- Sharing secrets in team chat/email

### **Environment File Examples:**

#### **Development (.env):**
```bash
# Development Google Analytics
REACT_APP_GA_MEASUREMENT_ID=G-DEV123456789

# Development API (if different)
REACT_APP_API_URL=http://localhost:8000
```

#### **Production (.env.production):**
```bash
# Production Google Analytics  
REACT_APP_GA_MEASUREMENT_ID=G-PROD987654321

# Production API
REACT_APP_API_URL=https://sydneyscheduler.com
```

### **Verification:**

#### **Check what's safe to commit:**
```bash
# These should show template/placeholder values:
grep -r "G-X" frontend/src/
grep -r "localhost" frontend/src/

# These should contain real values (and be gitignored):
cat frontend/.env
cat frontend/.env.production
```

#### **Test in browser console:**
```javascript
// Should show your real GA ID in production
console.log(process.env.REACT_APP_GA_MEASUREMENT_ID);

// Should show template ID in GitHub repository
console.log('Template ID preserved in code');
```

### **Team Onboarding:**

When a new team member clones the repository:

1. **They get**: Template code with placeholder IDs
2. **They need**: To create their own `.env` file
3. **They copy**: `.env.example` to `.env` 
4. **They add**: Their own development GA ID
5. **They never**: Commit their personal `.env` file

This approach ensures security while maintaining collaboration! 🛡️
