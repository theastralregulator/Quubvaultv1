import { NextRequest, NextResponse } from 'next/server';
import { getDriveClient, getFriendlyDriveError } from '@/lib/drive';

export const runtime = 'nodejs';

/**
 * POST /api/drive/rename
 * Body JSON: { driveFileId: string, newName: string }
 *
 * Updates the filename in Google Drive.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { driveFileId, newName } = body;

    if (!driveFileId || !newName) {
      return NextResponse.json({ error: 'Missing driveFileId or newName' }, { status: 400 });
    }

    const drive = getDriveClient();

    await drive.files.update({
      fileId: driveFileId,
      requestBody: { name: newName.trim() },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[Drive Rename Error]', err);
    return NextResponse.json(
      { error: getFriendlyDriveError(err, 'Rename service unavailable. Please try again later.') },
      { status: 500 }
    );
  }
}
