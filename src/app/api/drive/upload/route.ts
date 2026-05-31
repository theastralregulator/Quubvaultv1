import { NextRequest, NextResponse } from 'next/server';
import { getDriveClient, DRIVE_FOLDER_ID } from '@/lib/drive';
import { Readable } from 'stream';

export const runtime = 'nodejs';

/**
 * POST /api/drive/upload
 * Body: multipart/form-data with fields:
 *   - file   (the binary file)
 *   - name   (original filename)
 *   - userId (Firebase UID — used as subfolder name for organisation)
 *
 * Returns: { driveFileId, webViewLink, webContentLink, name, size, mimeType }
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const userId = formData.get('userId') as string | null;

    if (!file || !userId) {
      return NextResponse.json({ error: 'Missing file or userId' }, { status: 400 });
    }

    const drive = getDriveClient();

    // Ensure a per-user subfolder exists (or create it lazily)
    const userFolderId = await getOrCreateUserFolder(drive, userId);

    // Convert the Web API File to a Node.js readable stream
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const stream = Readable.from(buffer);

    const response = await drive.files.create({
      requestBody: {
        name: file.name,
        parents: [userFolderId],
      },
      media: {
        mimeType: file.type || 'application/octet-stream',
        body: stream,
      },
      fields: 'id,name,size,mimeType,webViewLink,webContentLink',
    });

    const driveFile = response.data;

    // Make file readable by anyone with the link (so download URLs work)
    await drive.permissions.create({
      fileId: driveFile.id!,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    return NextResponse.json({
      driveFileId: driveFile.id,
      webViewLink: driveFile.webViewLink,
      webContentLink: driveFile.webContentLink,
      name: driveFile.name,
      size: file.size,
      mimeType: driveFile.mimeType,
    });
  } catch (err: any) {
    console.error('[Drive Upload Error]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * Returns the Drive folder ID for a specific user, creating it if it doesn't exist.
 * Folders are stored under the main DRIVE_FOLDER_ID as "{userId}".
 */
async function getOrCreateUserFolder(drive: any, userId: string): Promise<string> {
  // Search for existing folder
  const search = await drive.files.list({
    q: `'${DRIVE_FOLDER_ID}' in parents and name = '${userId}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: 'files(id)',
    spaces: 'drive',
  });

  if (search.data.files && search.data.files.length > 0) {
    return search.data.files[0].id!;
  }

  // Create the user folder
  const folder = await drive.files.create({
    requestBody: {
      name: userId,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [DRIVE_FOLDER_ID],
    },
    fields: 'id',
  });

  return folder.data.id!;
}
