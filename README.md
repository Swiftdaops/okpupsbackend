# OKPUPS Backend

Clean, simple Express + MongoDB backend for a vet-curated catalog (animals + products) with admin-only write access, hardened JWT cookies, audit logging, and Cloudinary image uploads.

## Setup

1) Install

```sh
cd /Users/WebDev/Desktop/OKPUPS/Okpupsbackend
npm i
```

2) Create `.env`

```env
NODE_ENV=development
PORT=5000

MONGODB_URI=mongodb://127.0.0.1:27017/okpups

JWT_SECRET=replace_me
JWT_EXPIRES_IN=2h
COOKIE_NAME=okpups_admin_token
COOKIE_SECURE=false
COOKIE_SAMESITE=strict

# Comma-separated allowed origins (CORS)
CORS_ORIGINS=http://localhost:3000,https://okpups.store,https://www.okpups.store

# Cloudinary
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
CLOUDINARY_FOLDER=okpups

# Create-admin script
ADMIN_EMAIL=admin@okpups.store
ADMIN_PASSWORD=change_me
```

3) Create the first admin

```sh
npm run create-admin
```

4) Run

```sh
npm run dev
```

## Notes

- If your frontend and backend are on different subdomains and you need cookies to flow cross-site, set `COOKIE_SAMESITE=none` and `COOKIE_SECURE=true` (HTTPS required).
- Public read endpoints are unprotected; all writes require admin auth via cookie.
