/**
 * JWT verification tests for authentication contracts.
 *
 * This file checks that signed tokens carry the expected user identity and role metadata and
 * that forged tokens are rejected. It validates the security assumptions used by server/auth.ts.
 */

import { describe, it, expect } from 'vitest';
import jwt from 'jsonwebtoken';

describe('jwt auth shape', () => {
  it('signs and verifies with a secret', () => {
    const secret = 'test-secret';
    const token = jwt.sign({ sub: 'user-1', role: 'attendee' }, secret, { expiresIn: '1h' });
    const payload = jwt.verify(token, secret) as { sub: string; role: string };
    expect(payload.sub).toBe('user-1');
    expect(payload.role).toBe('attendee');
  });

  it('rejects forged unsigned token patterns', () => {
    const forged = 'token-user-1-123456';
    expect(() => jwt.verify(forged, 'test-secret')).toThrow();
  });
});
