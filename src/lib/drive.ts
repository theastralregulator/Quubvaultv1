import { google } from 'googleapis';

/**
 * Returns an authenticated Google Drive client using service account credentials.
 * Credentials are loaded from environment variables (set in Vercel dashboard or .env.local).
 */
export function getDriveClient() {
  const privateKey = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: privateKey,
    },
    scopes: ['https://www.googleapis.com/auth/drive'],
  });

  return google.drive({ version: 'v3', auth });
}

/** The Google Drive folder where all user files are stored (shared with the service account). */
export const DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID!;
