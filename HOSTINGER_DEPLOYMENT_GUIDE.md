# Hostinger Deployment Guide for Frontend and Backend

This guide explains how to upload and configure the `mytutee` frontend and backend on Hostinger so the site works end to end.

## 1. What You Need Before Deploying

Have these ready first:

- A Hostinger hosting plan with Node.js support for the backend.
- Your domain connected to Hostinger.
- MongoDB Atlas or another accessible MongoDB database.
- SMTP credentials for sending OTPs and notifications.
- Your frontend production URL, such as `https://mytutee.com`.

## 2. Project Structure

This project has two parts:

- Frontend: `client/`
- Backend: `server/`

The frontend calls the backend through the API base URL defined in `client/src/config.js`.

## 3. Prepare the Backend for Hostinger

### Step 1: Set environment variables

Hostinger does not use your local `.env` file automatically. You must create the same environment variables in hPanel or in the backend service configuration.

Required backend variables:

- `DATABASE_URL` or `MONGO_URI`
- `JWT_SECRET`
- `PORT`
- `SMTP_HOST`
- `SMTP_PORT`
- `EMAIL_USER`
- `EMAIL_PASS`
- `OTP_EXPIRE_TIME`
- `NODE_ENV=production`
- `FRONTEND_URL=https://mytutee.com`

If your frontend uses a different domain or subdomain, set `FRONTEND_URL` to that exact origin.

### Step 2: Upload the backend files

Upload the entire `server/` folder to Hostinger.

Make sure these files are included:

- `server.js`
- `package.json`
- `config/`
- `models/`
- `routes/`
- `middleware/`
- `utils/`
- `ecosystem.config.js` if you use PM2

Do not upload `node_modules` from your local machine.

### Step 3: Install backend dependencies on Hostinger

Use Hostinger's terminal or Node.js application manager to install dependencies from `server/package.json`.

Run:

```bash
npm install
```

### Step 4: Start the backend

The backend uses the port from `process.env.PORT`, which is important for Hostinger.

Start it with:

```bash
npm start
```

If you use PM2, you can also start it with the provided ecosystem file.

### Step 5: Verify the backend is live

Open this endpoint in a browser or API client:

```text
https://your-backend-domain/api/health
```

Expected response:

```json
{ "status": "ok" }
```

If that works, the backend is running correctly.

## 4. Prepare the Frontend for Hostinger

### Step 1: Set the production API URL

The frontend base URL is defined in `client/src/config.js`.

It should point to your backend API, for example:

```js
export const BASE_URL = "https://mytutee.com/api";
export const ORIGIN_URL = "https://mytutee.com";
```

If your backend lives on a different domain, update `BASE_URL` to match it.

### Step 2: Build the frontend

On your local machine, go to the frontend folder and build the app:

```bash
cd client
npm install
npm run build
```

This creates the production build output, usually in the `dist/` folder.

### Step 3: Upload the frontend build

Upload the contents of the `dist/` folder to Hostinger's web root, usually `public_html/`.

Do not upload the whole `client/` source folder as the live site. Upload the built production files instead.

### Step 4: Confirm the frontend is served

After upload, visit your site in the browser:

```text
https://mytutee.com
```

If the build was uploaded correctly, the frontend should load.

## 5. Connect Frontend and Backend

The frontend talks to the backend using the API URL in `client/src/config.js`.

### Important connection rules

- Frontend requests must point to the backend domain.
- The backend must allow requests from the frontend origin through CORS.
- Both domains must use the same production URLs everywhere.

For this project, the backend CORS setup should allow:

- `http://localhost:5173` for local development
- `https://mytutee.com` for production
- any additional frontend domain you use

If your frontend and backend are on different Hostinger subdomains, set CORS and the frontend API base URL accordingly.

### Example

If the frontend is on `https://mytutee.com` and backend is on `https://api.mytutee.com`, then:

- Frontend `BASE_URL` should be `https://api.mytutee.com/api`
- Backend `FRONTEND_URL` should be `https://mytutee.com`

## 6. Backend Route and App Setup Notes

Make sure the backend starts with the correct file and listens on the host-assigned port.

Good production checklist:

- `server.js` should use `process.env.PORT || 5000`
- The app should listen on `0.0.0.0`
- CORS should allow the frontend origin
- MongoDB connection string should be set correctly
- The backend should not depend on local-only file paths

## 7. Common Hostinger Problems

### Problem: Server does not start

Possible causes:

- Missing environment variables
- Wrong start file in Hostinger
- MongoDB connection failure
- Express route syntax issue

### Problem: API returns CORS errors

Possible causes:

- Frontend origin is not added to backend CORS rules
- `BASE_URL` in the frontend points to the wrong domain
- You are mixing `http` and `https`

### Problem: Frontend loads but API calls fail

Possible causes:

- Backend is not running
- Backend is running on the wrong port
- API base URL in `client/src/config.js` is incorrect
- The backend domain is blocked by CORS

### Problem: File uploads or media do not load

Possible causes:

- Upload folders were not deployed
- Upload paths are not writable on Hostinger
- The frontend is pointing to the wrong origin for file URLs

## 8. Recommended Deployment Order

Use this order for the cleanest deployment:

1. Configure backend environment variables.
2. Upload and start the backend.
3. Test the backend health endpoint.
4. Update frontend production API URL if needed.
5. Build the frontend.
6. Upload the frontend build to `public_html/`.
7. Test login, API requests, and file uploads.

## 9. Final Verification Checklist

Before considering deployment complete, confirm all of these:

- The backend responds at `/api/health`.
- The frontend loads from the domain.
- API requests reach the backend successfully.
- CORS errors do not appear in the browser console.
- MongoDB connections succeed.
- OTP and email sending work if enabled.

## 10. Notes for This Project

For this repository, the frontend already points to `https://mytutee.com/api` in `client/src/config.js`.

The backend should be deployed with production CORS enabled and the correct Hostinger environment variables set.

If you move the frontend or backend to another domain later, update both the frontend API URL and the backend allowed origins together.
