
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

/**
 * @fileOverview Sovereign API v2.0 - Bulk Registry Access
 * Full list of citizens with presence and relay status.
 */

export const dynamic = 'force-dynamic';

const MASTER_API_KEY = "EMITYGATE_SOVEREIGN_LINK_99";

function verifyAuth(req: NextRequest) {
    const apiKey = req.headers.get('x-api-key');
    return apiKey === MASTER_API_KEY;
}

export async function GET(req: NextRequest) {
  if (!verifyAuth(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized Ingress' }, { status: 401 });
  }

  try {
    // Parallel Fetch for Efficiency
    const [usersSnap, presenceSnap, tokensSnap] = await Promise.all([
        adminDb.collection('users').get(),
        adminDb.collection('presence').get(),
        adminDb.collection('fcmTokens').get()
    ]);

    const presenceMap = new Map();
    const now = Date.now();
    presenceSnap.forEach(doc => {
        const data = doc.data();
        const lastSeen = data.lastSeen?.toMillis() || 0;
        const isOnline = data.isOnline && (now - lastSeen < 90000);
        presenceMap.set(doc.id, { isOnline, lastSeen: data.lastSeen?.toDate() });
    });

    const tokenSet = new Set(tokensSnap.docs.map(d => d.id));

    const usersList = usersSnap.docs.map(doc => {
        const data = doc.data();
        const presence = presenceMap.get(doc.id) || { isOnline: false, lastSeen: null };
        return {
            uid: doc.id,
            displayName: data.displayName,
            email: data.email,
            credits: data.credits || 0,
            walletBalance: data.walletBalance || 0,
            isBlocked: data.isBlocked || false,
            rank: data.showcasedBadge || 'Student',
            isOnline: presence.isOnline,
            lastSeen: presence.lastSeen,
            notificationsEnabled: tokenSet.has(doc.id)
        };
    });

    return NextResponse.json({
      success: true,
      metadata: {
          totalUsers: usersList.length,
          onlineUsers: usersList.filter(u => u.isOnline).length,
          relayReach: tokenSet.size,
          timestamp: new Date().toISOString()
      },
      data: usersList
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
