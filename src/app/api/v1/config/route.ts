
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

/**
 * @fileOverview Sovereign API v2.0 - Configuration Terminal
 * Remote management of Maintenance Mode and System Briefings.
 */

export const dynamic = 'force-dynamic';

const MASTER_API_KEY = "EMITYGATE_SOVEREIGN_LINK_99";

function verifyAuth(req: NextRequest) {
    const apiKey = req.headers.get('x-api-key');
    return apiKey === MASTER_API_KEY;
}

export async function GET(req: NextRequest) {
  if (!verifyAuth(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const settingsDoc = await adminDb.collection('appConfig').doc('settings').get();
    return NextResponse.json({
      success: true,
      data: settingsDoc.exists ? settingsDoc.data() : null
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
    if (!verifyAuth(req)) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const settingsRef = adminDb.collection('appConfig').doc('settings');
        
        const updates: any = {};
        if (body.isMaintenanceMode !== undefined) {
            updates.isMaintenanceMode = body.isMaintenanceMode;
            if (body.isMaintenanceMode) updates.lastMaintenanceId = Date.now().toString();
        }
        if (body.maintenanceMessage) updates.maintenanceMessage = body.maintenanceMessage;
        if (body.whatsNewMessage) updates.whatsNewMessage = body.whatsNewMessage;
        if (body.maintenanceTheme) updates.maintenanceTheme = body.maintenanceTheme;

        if (Object.keys(updates).length > 0) {
            await settingsRef.set(updates, { merge: true });
            return NextResponse.json({ success: true, message: 'Mainframe configuration remotely updated.' });
        }

        return NextResponse.json({ success: false, error: 'No configuration changes provided.' }, { status: 400 });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
