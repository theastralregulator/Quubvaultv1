import { google } from 'googleapis';

/**
 * Returns an authenticated Google Drive client using service account credentials.
 * Credentials are loaded from environment variables (set in Vercel dashboard or .env.local).
 * Multiple fallback environment variable names are supported.
 */
export function getDriveClient() {
  // Try parsing the entire service account JSON if provided
  let serviceAccount: any = null;
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    try {
      serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    } catch (e) {
      console.error("[Drive Credentials] Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON env variable");
    }
  }

  // Fallback chain for client email
  const clientEmail = serviceAccount?.client_email || 
                      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || 
                      process.env.GOOGLE_CLIENT_EMAIL || 
                      process.env.FIREBASE_CLIENT_EMAIL;

  // Fallback chain for raw private key
  let rawPrivateKey = serviceAccount?.private_key || 
                      process.env.GOOGLE_PRIVATE_KEY || 
                      process.env.FIREBASE_PRIVATE_KEY;

  // Fallback chain for project ID
  const projectId = serviceAccount?.project_id ||
                    process.env.GOOGLE_PROJECT_ID ||
                    process.env.FIREBASE_PROJECT_ID ||
                    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  // Resolve folder ID
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  // Format private key correctly
  let privateKey = "";
  if (rawPrivateKey) {
    privateKey = rawPrivateKey.replace(/\\n/g, '\n');
    // Strip wrapping quotes if present
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.substring(1, privateKey.length - 1);
    }
    if (privateKey.startsWith("'") && privateKey.endsWith("'")) {
      privateKey = privateKey.substring(1, privateKey.length - 1);
    }
  }

  // Secure diagnostic logging (no secrets logged)
  console.log("[Drive Client initialization check]", {
    hasClientEmail: !!clientEmail,
    hasPrivateKey: !!privateKey,
    hasProjectId: !!projectId,
    hasFolderId: !!folderId
  });

  // Safe validation
  if (!clientEmail) {
    throw new Error("Authentication configuration missing: client_email is required.");
  }

  if (!privateKey) {
    throw new Error("Authentication configuration missing: private_key is required.");
  }

  if (!folderId) {
    throw new Error("Cloud storage configuration error: folder_id is required.");
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
    scopes: ['https://www.googleapis.com/auth/drive'],
    projectId: projectId || undefined,
  });

  return google.drive({ version: 'v3', auth });
}

/** The Google Drive folder where all user files are stored (shared with the service account). */
export const DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID!;

/**
 * Utility to map raw Google Drive API errors to friendly, secure user-facing messages.
 */
export function getFriendlyDriveError(err: any, defaultMsg = "Service unavailable"): string {
  const errMsg = err?.message || "";
  
  if (
    errMsg.includes("configuration") ||
    errMsg.includes("missing") ||
    errMsg.includes("required") ||
    errMsg.includes("client_email") ||
    errMsg.includes("private_key") ||
    errMsg.includes("JSON")
  ) {
    return "Cloud storage configuration error. Please contact the administrator.";
  }

  if (errMsg.includes("auth") || err?.code === 401 || err?.status === 401 || err?.code === 403 || err?.status === 403) {
    return "Authentication configuration missing or invalid. Please check storage permissions.";
  }

  if (err?.code === 404 || err?.status === 404) {
    return "Requested file or folder not found.";
  }

  return defaultMsg;
}

