/**
 * LiveKit token generation for browser-based hybrid sessions.
 *
 * This router issues short-lived tokens for joining LiveKit rooms and validates who is allowed
 * to publish audio/video. It connects the conference session experience to the live video stack
 * used by LiveKitRoomModal in the client.
 */

import { Router } from 'express';
import { AccessToken } from 'livekit-server-sdk';
import { config, livekitConfigured } from '../config';
import { authRequired, getAuthUser, isOrganizer } from '../auth';
import { getDb } from '../db';

const router = Router();

router.get('/livekit/config', (_req, res) => {
  res.json({
    wsUrl: config.livekit.url || null,
    configured: livekitConfigured(),
  });
});

router.post('/livekit/token', authRequired, async (req, res) => {
  try {
    if (!livekitConfigured()) {
      return res.status(503).json({
        error: 'LiveKit is not configured. Set LIVEKIT_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET.',
      });
    }

    const user = getAuthUser(req)!;
    const { sessionId, roomName, participantName } = req.body;
    const resolvedRoom = roomName || (sessionId ? `session-${sessionId}` : null);
    if (!resolvedRoom) {
      return res.status(400).json({ error: 'sessionId or roomName is required' });
    }

    if (sessionId) {
      const { data: session } = await getDb().from('sessions').select('id, speaker_ids').eq('id', sessionId).maybeSingle();
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }
    }

    const canPublish =
      isOrganizer(user) ||
      user.role === 'speaker' ||
      user.role === 'moderator' ||
      (user.assignedSessionIds || []).includes(sessionId);

    const at = new AccessToken(config.livekit.apiKey, config.livekit.apiSecret, {
      identity: user.id,
      name: participantName || user.fullName,
      ttl: '6h',
    });

    at.addGrant({
      roomJoin: true,
      room: resolvedRoom,
      canPublish,
      canSubscribe: true,
      canPublishData: true,
    });

    const token = await at.toJwt();
    res.json({
      token,
      wsUrl: config.livekit.url,
      roomName: resolvedRoom,
      identity: user.id,
      participantName: participantName || user.fullName,
      canPublish,
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create LiveKit token' });
  }
});

export default router;
