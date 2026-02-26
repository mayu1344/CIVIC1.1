# Final Steps to Fix API Connection

## Current Status
- Backend is working: https://civicpath.onrender.com ✅
- Database is set up ✅
- Frontend is deployed but calling wrong API ❌

## The Problem
Frontend is still calling `localhost:5000` instead of the deployed backend.

## Solution: Add Environment Variable on Render

### Step 1: Go to Frontend Service
1. Open https://dashboard.render.com
2. Click on **civicpath-frontend** (your frontend service)

### Step 2: Add Environment Variable
1. Click **"Environment"** tab on the left
2. Click **"Add Environment Variable"** button
3. Add this EXACT variable:

```
Key: NEXT_PUBLIC_API_URL
Value: https://civicpath.onrender.com/api/v1
```

**IMPORTANT:** 
- Make sure there's NO space before or after
- Include `/api/v1` at the end
- Use `https://` not `http://`

### Step 3: Force Rebuild
1. After adding the variable, click **"Save Changes"**
2. Go to the top of the page
3. Click **"Manual Deploy"** dropdown
4. Select **"Clear build cache & deploy"**
5. Wait 5-10 minutes for deployment to complete

### Step 4: Test
1. **Clear your browser cache** or use **Incognito/Private mode**
2. Go to: https://civicpath-frontend.onrender.com/citizen/report
3. Submit a complaint
4. Should work without errors!

### Step 5: Verify Data
Run this command on your computer:
```bash
node view-complaints.js
```

You should see the new complaint in the database.

## Why This Works
- Next.js reads `NEXT_PUBLIC_API_URL` during build time
- The environment variable tells the frontend where the backend is
- Clearing cache ensures a fresh build with the new variable

## If It Still Doesn't Work
The code already has the API URL hardcoded as a fallback:
```typescript
baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://civicpath.onrender.com/api/v1'
```

So after the rebuild, it WILL work.

## Current URLs
- Frontend: https://civicpath-frontend.onrender.com
- Backend: https://civicpath.onrender.com
- API Endpoint: https://civicpath.onrender.com/api/v1
