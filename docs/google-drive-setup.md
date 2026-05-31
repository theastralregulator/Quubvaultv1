# Google Drive API Setup Guide for Quub Vault

This guide walks you through connecting Quub Vault to Google Drive as the storage backend.

---

## Step 1 — Create or select a Google Cloud Project

1. Go to **[Google Cloud Console](https://console.cloud.google.com/)**.
2. Click the project dropdown at the top → **New Project**.
3. Name it `quub-vault` (or reuse your existing Firebase project's GCP project).
4. Click **Create**.

---

## Step 2 — Enable the Google Drive API

1. In the Cloud Console, go to **APIs & Services → Library**.
2. Search for **Google Drive API**.
3. Click it → click **Enable**.

---

## Step 3 — Create a Service Account

A Service Account lets your server upload/download files to Drive without any user being logged in.

1. Go to **APIs & Services → Credentials**.
2. Click **+ Create Credentials → Service Account**.
3. Fill in:
   - **Name**: `quub-vault-server`
   - **ID**: auto-filled
   - **Description**: Server-side Drive access for Quub Vault
4. Click **Create and Continue** → skip optional role/user steps → **Done**.
5. Click on the newly created service account in the list.
6. Go to the **Keys** tab → **Add Key → Create new key → JSON** → **Create**.
7. A `.json` file downloads — **keep this file safe, never commit it**.

The JSON file looks like this:
```json
{
  "type": "service_account",
  "project_id": "...",
  "private_key_id": "...",
  "private_key": "-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----\n",
  "client_email": "quub-vault-server@your-project.iam.gserviceaccount.com",
  ...
}
```

You'll need `client_email` and `private_key` from this file.

---

## Step 4 — Create a Google Drive Folder

1. Go to **[Google Drive](https://drive.google.com/)**.
2. Click **+ New → Folder** → name it **Quub Vault Storage**.
3. Right-click the new folder → **Share**.
4. In the "Add people and groups" field, paste the **service account email**
   (`quub-vault-server@your-project.iam.gserviceaccount.com`).
5. Set the role to **Editor** → click **Share**.
6. Open the folder → copy the **Folder ID** from the URL:
   ```
   https://drive.google.com/drive/folders/1A2B3C4D5E6F7G8H9I0J
                                          ^^^^^^^^^^^^^^^^^^^^^^^^
                                          This is your GOOGLE_DRIVE_FOLDER_ID
   ```

---

## Step 5 — Configure Environment Variables

### Local Development

Copy `.env.local.example` to `.env.local` and fill in the values:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=quub-vault-server@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nMIIEo...\n-----END RSA PRIVATE KEY-----\n"
GOOGLE_DRIVE_FOLDER_ID=1A2B3C4D5E6F7G8H9I0J
```

> **Tip**: The `private_key` value from the JSON file contains actual newlines.  
> When pasting into `.env.local`, keep them as `\n` escape sequences (single-line string).

### Vercel Production

In your Vercel project dashboard:
1. Go to **Settings → Environment Variables**.
2. Add these three variables:

| Name | Value |
|------|-------|
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | `quub-vault-server@...iam.gserviceaccount.com` |
| `GOOGLE_PRIVATE_KEY` | The full private key string (including `-----BEGIN...-----END-----`) |
| `GOOGLE_DRIVE_FOLDER_ID` | Your Drive folder ID |

> **For `GOOGLE_PRIVATE_KEY`**: Paste the raw value from the JSON file.  
> Vercel handles multiline secrets correctly — no need to manually escape `\n`.

---

## Step 6 — Verify It Works

After deploying (or running locally with `npm run dev`):

1. Log in to Quub Vault.
2. Navigate to **Upload** and upload any file.
3. Open your **Google Drive folder** — the file should appear inside a subfolder named after your Firebase UID.
4. Go to **My Files** and click **Download** — the file should stream from Drive.
5. Move a file to **Trash** → click **Delete Forever** — the file should disappear from Drive.

---

## Architecture Reference

```
Browser
  │
  ├─► POST /api/drive/upload     →  Drive files.create()
  ├─► GET  /api/drive/download   →  Drive files.get(alt=media)
  ├─► POST /api/drive/delete     →  Drive files.delete()
  └─► POST /api/drive/rename     →  Drive files.update()

Firestore (metadata only):
  files/{docId}  →  { driveFileId, name, size, type, userId, url, createdAt, ... }
  users/{uid}    →  { usedStorage, maxStorage, filesCount }
```

All Drive credentials stay server-side (environment variables).  
The browser **never** sees your `GOOGLE_PRIVATE_KEY`.
