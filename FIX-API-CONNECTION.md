# Fix API Connection Issue

## Problem
Frontend is calling `http://localhost:5000/api/v1` instead of your deployed backend.

## Solution

### Step 1: Add Environment Variable to Frontend on Render

1. Go to https://dashboard.render.com
2. Click on your **FRONTEND** service (`civicpath-frontend`)
3. Click **"Environment"** tab
4. Click **"Add Environment Variable"**
5. Add:
   ```
   Key: NEXT_PUBLIC_API_URL
   Value: https://civicpath.onrender.com/api/v1
   ```
6. Click **"Save Changes"**
7. Frontend will automatically redeploy

### Step 2: Wait for Redeploy
- Wait 3-5 minutes for frontend to rebuild
- The frontend will now call your deployed backend

### Step 3: Test
1. Go to: https://civicpath-frontend.onrender.com/citizen/report
2. Fill out the form
3. Submit
4. Should work without API errors

### Step 4: Verify Data
Run this command to check database:
```bash
node view-complaints.js
```

## Current Configuration

**Backend URL:** https://civicpath.onrender.com
**Frontend URL:** https://civicpath-frontend.onrender.com
**API Endpoint:** https://civicpath.onrender.com/api/v1

**Frontend needs to know:** `NEXT_PUBLIC_API_URL=https://civicpath.onrender.com/api/v1`
