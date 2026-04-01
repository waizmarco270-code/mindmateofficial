
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { addDays } from 'date-fns';

/**
 * @fileOverview Sovereign API v1.5 - Advanced Remote Authority
 * Remote controls for specific user records.
 */

export const dynamic = 'force-dynamic';

const MASTER_API_KEY = "EMITYGATE_SOVEREIGN_LINK_99";

function verifyAuth(req: NextRequest) {
    const apiKey = req.headers.get('x-api-key');
    return apiKey === MASTER_API_KEY;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  if (!verifyAuth(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized Access to Mainframe' }, { status: 401 });
  }

  const { userId } = params;

  try {
    const userDoc = await adminDb.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return NextResponse.json({ success: false, error: 'Legend not found' }, { status: 404 });
    }

    const data = userDoc.data();
    
    // Check Presence
    const presenceDoc = await adminDb.collection('presence').doc(userId).get();
    const presenceData = presenceDoc.data();
    const isOnline = presenceData?.isOnline && (Date.now() - (presenceData?.lastSeen?.toMillis() || 0) < 90000);

    return NextResponse.json({
      success: true,
      data: {
        ...data,
        isOnline,
        lastSeen: presenceData?.lastSeen?.toDate() || null
      }
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(
    req: NextRequest,
    { params }: { params: { userId: string } }
) {
    if (!verifyAuth(req)) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = params;
    const body = await req.json();
    const { action, amount, badge, banType, reason, days } = body;

    try {
        const userRef = adminDb.collection('users').doc(userId);
        const userSnap = await userRef.get();

        if (!userSnap.exists) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        const updates: any = {};

        switch (action) {
            case 'adjust_credits':
                if (typeof amount === 'number') updates.credits = FieldValue.increment(amount);
                break;
            
            case 'reset_credits':
                updates.credits = 0;
                break;

            case 'set_badge':
                if (badge) updates.showcasedBadge = badge;
                break;

            case 'execute_ban':
                updates.isBlocked = true;
                updates.banType = banType || 'permanent';
                updates.banReason = reason || 'Remotely triggered by EmityGate Command.';
                if (banType === 'temporary' && days) {
                    updates.banExpires = addDays(new Date(), days).toISOString();
                }
                break;

            case 'reinstate_user':
                updates.isBlocked = false;
                updates.banType = null;
                updates.banExpires = null;
                updates.banReason = null;
                break;

            default:
                return NextResponse.json({ success: false, error: 'Invalid remote directive' }, { status: 400 });
        }

        if (Object.keys(updates).length > 0) {
            await userRef.update(updates);
            return NextResponse.json({ success: true, message: `Action [${action}] executed successfully on UID ${userId}` });
        }

        return NextResponse.json({ success: false, error: 'No valid action provided' }, { status: 400 });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
