
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * @fileOverview Sovereign API v1 - Advanced User Synchronization
 * This endpoint allows external products (EmityGate.com) to read and update
 * MindMate student records securely.
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
    return NextResponse.json({ error: 'Unauthorized Access to Mainframe' }, { status: 401 });
  }

  const { userId } = params;

  try {
    const userDoc = await adminDb.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: 'Legend not found in database' }, { status: 404 });
    }

    const data = userDoc.data();

    return NextResponse.json({
      success: true,
      data: {
        uid: data?.uid,
        displayName: data?.displayName,
        credits: data?.credits,
        streak: data?.streak,
        totalStudyTime: data?.totalStudyTime,
        rank: data?.showcasedBadge || 'Student',
        isVip: data?.isVip || false,
        isMaster: data?.masterCardExpires ? new Date(data.masterCardExpires) > new Date() : false,
        lastActive: new Date().toISOString()
      }
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(
    req: NextRequest,
    { params }: { params: { userId: string } }
) {
    if (!verifyAuth(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = params;
    const body = await req.json();
    const { action, amount, badge } = body;

    try {
        const userRef = adminDb.collection('users').doc(userId);
        const userSnap = await userRef.get();

        if (!userSnap.exists) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const updates: any = {};

        if (action === 'adjust_credits' && typeof amount === 'number') {
            updates.credits = FieldValue.increment(amount);
        }

        if (action === 'set_badge' && badge) {
            updates.showcasedBadge = badge;
        }

        if (Object.keys(updates).length > 0) {
            await userRef.update(updates);
            return NextResponse.json({ success: true, message: 'Mainframe updated successfully' });
        }

        return NextResponse.json({ error: 'No valid action provided' }, { status: 400 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
