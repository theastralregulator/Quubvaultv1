import { NextRequest, NextResponse } from 'next/server';
import { getDriveClient, getFriendlyDriveError } from '@/lib/drive';

export const runtime = 'nodejs';

/**
 * POST /api/drive/delete
 * Body JSON: { driveFileId: string }
 *
 * Permanently removes a file from Google Drive.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { driveFileId } = body;

    if (!driveFileId) {
      return NextResponse.json({ error: 'Missing driveFileId' }, { status: 400 });
    }

    const drive = getDriveClient();

    await drive.files.delete({ fileId: driveFileId });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    // If the file doesn't exist on Drive (already deleted), treat as success
    if (err.code === 404 || err.status === 404) {
      return NextResponse.json({ success: true });
    }
    console.error('[Drive Delete Error]', err);
    return NextResponse.json(
      { error: getFriendlyDriveError(err, 'Delete service unavailable. Please try again later.') },
      { status: 500 }
    );
  }
}
