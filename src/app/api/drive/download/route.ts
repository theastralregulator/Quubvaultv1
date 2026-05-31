import { NextRequest, NextResponse } from 'next/server';
import { getDriveClient } from '@/lib/drive';

export const runtime = 'nodejs';

/**
 * GET /api/drive/download?driveFileId=xxx&name=filename.ext
 *
 * Streams a file from Google Drive directly to the browser as a download.
 * This avoids exposing long-lived Drive URLs to the client.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const driveFileId = searchParams.get('driveFileId');
    const name = searchParams.get('name') || 'download';

    if (!driveFileId) {
      return NextResponse.json({ error: 'Missing driveFileId' }, { status: 400 });
    }

    const drive = getDriveClient();

    // Get file metadata for MIME type
    const meta = await drive.files.get({
      fileId: driveFileId,
      fields: 'mimeType,name',
    });

    const mimeType = meta.data.mimeType || 'application/octet-stream';

    // Download the file bytes
    const fileResponse = await drive.files.get(
      { fileId: driveFileId, alt: 'media' },
      { responseType: 'arraybuffer' }
    );

    const buffer = Buffer.from(fileResponse.data as ArrayBuffer);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(name)}"`,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (err: any) {
    console.error('[Drive Download Error]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
