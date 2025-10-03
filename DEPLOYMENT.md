# Deployment Guide

Step-by-step instructions to deploy WalletGate documentation to `docs.walletgate.app`

## Prerequisites

- GitHub account
- Vercel account (free tier)
- Access to Cloudflare DNS (for walletgate.app domain)

## Step 1: Create Public GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Set repository name: **`docs`**
3. Set owner: **`walletgate`** (your organization)
4. **Make it PUBLIC** ✅
5. **Do NOT initialize with README** (we already have one)
6. Click "Create repository"

## Step 2: Push Code to GitHub

From your terminal in `/Users/henryokonkwo/Desktop/walletgate/docs-site`:

```bash
# Initialize git (if not already done)
cd /Users/henryokonkwo/Desktop/walletgate/docs-site
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: WalletGate documentation site"

# Add GitHub remote
git remote add origin https://github.com/walletgate/docs.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 3: Deploy to Vercel

### Option A: Vercel CLI (Fastest)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from docs-site directory
cd /Users/henryokonkwo/Desktop/walletgate/docs-site
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: walletgate-docs
# - Directory: ./ (current directory)
# - Override build settings? No

# Deploy to production
vercel --prod
```

### Option B: Vercel Dashboard (Recommended)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select **`walletgate/docs`** from GitHub
4. Configure:
   - **Framework Preset**: Other
   - **Build Command**: `npm run build`
   - **Output Directory**: `.vitepress/dist`
   - **Install Command**: `npm install`
5. Click **"Deploy"**

Wait ~2 minutes for first deployment to complete.

## Step 4: Configure Custom Domain

### In Vercel Dashboard:

1. Go to your project → **Settings** → **Domains**
2. Click **"Add Domain"**
3. Enter: `docs.walletgate.app`
4. Click **"Add"**

Vercel will show DNS configuration instructions.

### In Cloudflare Dashboard:

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Select **walletgate.app** domain
3. Go to **DNS** → **Records**
4. Click **"Add record"**
5. Configure:
   - **Type**: `CNAME`
   - **Name**: `docs`
   - **Target**: `cname.vercel-dns.com`
   - **Proxy status**: Proxied (orange cloud) ✅
6. Click **"Save"**

### Verify in Vercel:

Wait 2-5 minutes, then in Vercel:
1. Go to **Domains**
2. Verify `docs.walletgate.app` shows **✓ Valid Configuration**
3. SSL certificate should auto-provision

## Step 5: Test Deployment

Visit these URLs to verify:

- ✅ [https://docs.walletgate.app](https://docs.walletgate.app) - Homepage
- ✅ [https://docs.walletgate.app/guide/getting-started](https://docs.walletgate.app/guide/getting-started) - Getting Started
- ✅ [https://docs.walletgate.app/api/overview](https://docs.walletgate.app/api/overview) - API Reference
- ✅ [https://docs.walletgate.app/api/interactive](https://docs.walletgate.app/api/interactive) - Swagger UI
- ✅ [https://docs.walletgate.app/sdk/installation](https://docs.walletgate.app/sdk/installation) - SDK Docs

## Step 6: Configure Auto-Deploy

Vercel automatically deploys on every push to `main`:

1. Make a change to any `.md` file
2. Commit and push:
   ```bash
   git add .
   git commit -m "docs: update getting started"
   git push origin main
   ```
3. Vercel will automatically build and deploy

Check deployment status at [vercel.com/walletgate/docs](https://vercel.com/walletgate/docs)

## Step 7: Update Links

Update these files to point to new docs site:

### packages/admin-console/src/components/Header.tsx

Change:
```typescript
// Old
href="https://api.walletgate.app/api-docs"

// New
href="https://docs.walletgate.app"
```

### packages/admin-console/src/pages/Dashboard.tsx

Update Developer Resources cards to point to `docs.walletgate.app`

### packages/admin-console/src/pages/Landing.tsx

Update FAQ answers and links to point to new docs site

## Troubleshooting

### Build fails on Vercel

**Problem**: Build command fails
**Solution**: Check build logs in Vercel dashboard. Common issues:
- Node version (ensure Vercel uses Node 18+)
- Missing dependencies (run `npm install` locally first)

### Domain not connecting

**Problem**: `docs.walletgate.app` shows "Not Found"
**Solution**:
1. Verify CNAME in Cloudflare points to `cname.vercel-dns.com`
2. Verify domain is added in Vercel project settings
3. Wait 5-10 minutes for DNS propagation
4. Try clearing browser cache or use incognito

### SSL certificate not provisioning

**Problem**: "Your connection is not private"
**Solution**:
1. In Cloudflare, ensure Proxy is **ON** (orange cloud)
2. In Cloudflare → SSL/TLS → Overview, set to **"Full"**
3. Wait 10-15 minutes for SSL to provision
4. Force refresh browser

### 404 on routes

**Problem**: Direct navigation to `/guide/getting-started` shows 404
**Solution**: This should be handled by `vercel.json`. If not working:
1. Verify `vercel.json` is in root of `docs-site` directory
2. Redeploy: `vercel --prod --force`

## Maintenance

### Updating Documentation

```bash
# Make changes to .md files
vim guide/getting-started.md

# Commit and push
git add .
git commit -m "docs: improve getting started guide"
git push origin main

# Vercel auto-deploys in ~2 minutes
```

### Updating OpenAPI Spec

```bash
# Copy latest spec from backend
cp ../packages/backend/openapi.yaml public/openapi.yaml

# Commit and push
git add public/openapi.yaml
git commit -m "docs: update OpenAPI spec"
git push origin main
```

### Rolling Back

```bash
# View recent deployments
vercel ls

# Rollback to specific deployment
vercel rollback [deployment-url]
```

## Success Checklist

- ✅ GitHub repo created and public
- ✅ Code pushed to GitHub
- ✅ Vercel project created and deployed
- ✅ Custom domain `docs.walletgate.app` configured
- ✅ SSL certificate active
- ✅ All pages accessible
- ✅ Swagger UI working
- ✅ Auto-deploy on push enabled
- ✅ Links in admin console updated

## Support

If you encounter issues:

1. Check Vercel deployment logs
2. Verify DNS settings in Cloudflare
3. Test locally with `npm run dev`
4. Email me at: henry@walletgate.app

---

**Estimated Time**: 15-20 minutes
**Cost**: $0 (Vercel free tier + existing Cloudflare)
