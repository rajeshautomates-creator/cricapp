# Separate Service Deployment on Dokploy

This guide explains how to deploy the Cricket SaaS platform on Dokploy as separate services (Frontend, Backend, and Database) instead of a single Docker Compose. This is the recommended approach for production, as it allows Dokploy to manage each service independently.

## 1. Create a Managed PostgreSQL Database

1.  In Dokploy, go to your **Project**.
2.  Click **Create Resource** -> **Database** -> **PostgreSQL**.
3.  Name it `cricapp-db`.
4.  Once created, go to the **Credentials** or **External Access** tab to find the `Internal URL` or `URL`.
    - It will look like: `postgresql://user:password@host:5432/db`
    - **Important**: Use the **Internal URL** if you are deploying the apps on the same Dokploy instance.

## 2. Deploy the Backend Application

1.  Click **Create Resource** -> **Application** -> **GitHub**.
2.  Connect your repository (if not already connected).
3.  Choose the repository `rajeshautomates-creator/cricapp`.
4.  **Deployment Configuration**:
    - **Build Path**: `/backend`
    - **Application Name**: `cricapp-backend`
5.  **Environment Variables**:
    - Add `DATABASE_URL` (From step 1).
    - Add `JWT_ACCESS_SECRET` (A strong random string).
    - Add `JWT_REFRESH_SECRET` (Another strong random string).
    - Add `PORT` = `4000`
    - Add `NODE_ENV` = `production`
6.  **Build Phase**:
    - Ensure it uses the `Dockerfile` located in `/backend/Dockerfile`.
7.  **Port Mapping**:
    - Map internal port `4000` to a public port or domain.

## 3. Deploy the Frontend Application

1.  Click **Create Resource** -> **Application** -> **GitHub**.
2.  Choose the same repository `rajeshautomates-creator/cricapp`.
3.  **Deployment Configuration**:
    - **Build Path**: `/` (The root directory).
    - **Application Name**: `cricapp-frontend`
4.  **Environment Variables (CRITICAL)**:
    - You **MUST** set these variables in the "Environment" tab **BEFORE** the first deployment.
    - `NEXT_PUBLIC_API_URL` = `https://api.rajeshautomates.in/api` (Replace with your actual backend URL)
    - `NODE_ENV` = `production`
    - `NEXT_PUBLIC_SUPABASE_URL` = `http://localhost:54321` (Dummy value required for build)
    - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = `dummy` (Dummy value required for build)

    > [!WARNING]
    > **Build-Time Variables**: `NEXT_PUBLIC_` variables are baked into the application at **build time**. If you change `NEXT_PUBLIC_API_URL`, you must **Rebuild** the application, not just restart it.

5.  **Build Phase**:
    - Ensure it uses the `Dockerfile` located in `/Dockerfile`.
    - Build Path: `/`
6.  **Port Mapping**:
    - Map internal port `3000` to your primary domain.

Once the backend is deployed, you need to initialize the database tables. Since the repository starts without migration files, you must perform an initial "push" of the schema:

1.  Go to the **Backend Application** in Dokploy.
2.  Go to the **Console** or **Terminal** tab.
3.  Run the following command to create the tables:
    ```bash
    npx prisma db push
    ```

4.  (Optional) Seed payment settings if needed:
    ```bash
    npx prisma db seed
    ```
    
    > [!IMPORTANT]
    > **Automatic Migrations**: The application is configured to run `npx prisma migrate deploy` on every startup. However, this only works **after** you have created your first migration files locally and pushed them to GitHub. For the very first setup, use `db push`.

### Create Your First Super Admin

After deployment, create your first super admin account via the registration API:

#### Bash (Linux/macOS)
```bash
curl -X POST https://your-backend-domain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@yourdomain.com",
    "password": "your-secure-password",
    "fullName": "Admin Name",
    "role": "SUPER_ADMIN"
  }'
```

#### PowerShell (Windows)
```powershell
$body = @{
    email = "admin@yourdomain.com"
    password = "your-secure-password"
    fullName = "Admin Name"
    role = "SUPER_ADMIN"
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri "https://your-backend-domain.com/api/auth/register" -ContentType "application/json" -Body $body
```

> [!NOTE]
> In PowerShell, the standard `curl` command is an alias for `Invoke-WebRequest`, which has different syntax. Use `Invoke-RestMethod` or `curl.exe` instead.

> **Important**: The database starts empty in production. No demo data is created automatically.

## 6. Troubleshooting "NetworkError" or SSL Issues

If the browser shows "NetworkError when attempting to fetch resource", it is almost always due to an **Invalid SSL Certificate** on the backend API domain.

### How to Fix SSL in Dokploy:
1.  Go to your **Backend Application** in Dokploy.
2.  Go to the **Domains** tab.
3.  Ensure your domain (e.g., `api.rajeshautomates.in`) has **SSL Enabled** (HTTPS).
4.  If it shows "Pending" or "Error" for the certificate:
    - Double-check that your DNS A record points to the Dokploy server IP.
    - Click **Refresh** or **Force SSL** if available.
5.  **Test**: Open `https://api.rajeshautomates.in/api` in your browser. If you see a "Your connection is not private" warning, the frontend **will not work** until this is fixed.

Once the browser shows a "lock" icon 🔒 for the API URL, the login will work perfectly.
