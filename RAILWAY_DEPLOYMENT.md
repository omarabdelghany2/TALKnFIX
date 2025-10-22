# Railway Deployment Guide

This guide will help you deploy the IsuueTalk application to Railway.

## Prerequisites

1. A [Railway](https://railway.app/) account (sign up for free)
2. Railway CLI installed (optional but recommended): `npm i -g @railway/cli`
3. A MongoDB database (you can use Railway's MongoDB or MongoDB Atlas)

## Deployment Steps

### 1. Prepare Your MongoDB Database

**Option A: MongoDB Atlas (Recommended)**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get your connection string (it should look like: `mongodb+srv://username:password@cluster.mongodb.net/issuetalk`)

**Option B: Railway MongoDB**
1. In your Railway project, click "New"
2. Select "Database" → "Add MongoDB"
3. Copy the connection string from the MongoDB service

### 2. Deploy the Backend Server

1. **Create a New Project on Railway**
   - Go to [Railway](https://railway.app/)
   - Click "New Project"
   - Select "Deploy from GitHub repo" (or use Railway CLI)

2. **Connect Your Repository**
   - Authorize Railway to access your GitHub account
   - Select your IsuueTalk repository

3. **Configure the Backend Service**
   - Railway will auto-detect your Node.js app
   - Set the **Root Directory** to `server`
   - Configure the following settings:

   **Build Command:** (leave default or use)
   ```
   npm install
   ```

   **Start Command:**
   ```
   npm start
   ```

4. **Add Environment Variables**

   Go to your service settings → Variables, and add:

   ```
   PORT=5001
   MONGODB_URI=<your_mongodb_connection_string>
   JWT_SECRET=<generate_a_strong_random_secret>
   JWT_EXPIRE=7d
   NODE_ENV=production
   ```

   **Important Notes:**
   - Replace `<your_mongodb_connection_string>` with your actual MongoDB connection string
   - Generate a strong JWT_SECRET (use a random string generator)
   - Railway automatically exposes your service and provides a URL

5. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete
   - Copy your backend URL (e.g., `https://your-app.railway.app`)

### 3. Deploy the Frontend

1. **Add a New Service**
   - In the same Railway project, click "New" → "GitHub Repo" (select the same repo)
   - Or click "+ New Service" and select your repository again

2. **Configure the Frontend Service**
   - Set the **Root Directory** to `frontend/api-craft-fe`

   **Build Command:**
   ```
   npm install && npm run build
   ```

   **Start Command:**
   ```
   npm run preview
   ```

3. **Add Environment Variables**

   Go to your frontend service settings → Variables, and add:

   ```
   VITE_API_URL=<your_backend_url>/api
   ```

   **Example:**
   ```
   VITE_API_URL=https://your-backend.railway.app/api
   ```

   **Important:** Make sure to use the actual backend URL from step 2.5

4. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete
   - Your frontend will be available at the provided Railway URL

### 4. Update CORS Settings (Important!)

You need to update your backend to allow requests from your frontend domain.

1. Open `server/server.js`
2. Update the CORS configuration:

```javascript
app.use(cors({
  origin: ['http://localhost:3000', 'https://your-frontend.railway.app'],
  credentials: true
}));
```

Replace `https://your-frontend.railway.app` with your actual frontend URL.

3. Commit and push the changes - Railway will automatically redeploy

### 5. Verify Deployment

1. Visit your frontend URL
2. Try to register a new account
3. Create a post
4. Test all features

## Alternative: Using Railway CLI

If you prefer using the CLI:

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Deploy backend
cd server
railway up

# Deploy frontend
cd ../frontend/api-craft-fe
railway up
```

## Troubleshooting

### Backend Issues

**Build Fails:**
- Check that all dependencies are in `package.json`
- Verify the start command is correct: `npm start`

**Cannot Connect to MongoDB:**
- Verify your MongoDB connection string is correct
- Check that your IP is whitelisted in MongoDB Atlas
- Ensure the database user has proper permissions

**API Not Responding:**
- Check the service logs in Railway dashboard
- Verify environment variables are set correctly
- Make sure PORT is set correctly

### Frontend Issues

**Build Fails:**
- Ensure all dependencies are installed
- Check for TypeScript errors
- Verify build command is correct

**Cannot Connect to Backend:**
- Verify `VITE_API_URL` is set correctly with `/api` at the end
- Check CORS settings in backend
- Make sure the backend URL is accessible

**Blank Page or 404 Errors:**
- Check browser console for errors
- Verify the build completed successfully
- Check that assets are being served correctly

## Environment Variables Reference

### Backend (server/.env)
```
PORT=5001
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/issuetalk
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
JWT_EXPIRE=7d
NODE_ENV=production
```

### Frontend (frontend/api-craft-fe/.env)
```
VITE_API_URL=https://your-backend.railway.app/api
```

## Cost Considerations

Railway offers:
- **Free Tier:** $5 worth of usage per month (perfect for getting started)
- **Hobby Plan:** $5/month for additional resources
- Both services (frontend + backend) will use your free credits

## Post-Deployment

After successful deployment:

1. **Update README:** Add your live URLs
2. **Monitor Logs:** Check Railway dashboard for any errors
3. **Set up Custom Domain (Optional):** Railway allows custom domains
4. **Enable HTTPS:** Railway provides SSL certificates automatically
5. **Monitor Usage:** Keep an eye on your Railway usage dashboard

## Custom Domain (Optional)

1. Go to your service settings in Railway
2. Click "Settings" → "Domains"
3. Click "Generate Domain" or "Custom Domain"
4. Follow the DNS configuration instructions

## Continuous Deployment

Railway automatically deploys when you push to your GitHub repository:
- Push to main branch → automatic deployment
- Check deployment status in Railway dashboard
- View build logs for any errors

## Support

- **Railway Docs:** https://docs.railway.app/
- **Railway Discord:** Join for community support
- **MongoDB Atlas Support:** https://www.mongodb.com/docs/atlas/

---

## Quick Reference Commands

```bash
# Check deployment status
railway status

# View logs
railway logs

# Open service in browser
railway open

# Add environment variable
railway variables set KEY=value

# Link to different project
railway link <project-id>
```

Good luck with your deployment!
