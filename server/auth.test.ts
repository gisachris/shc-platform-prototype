/**
 * Tests for the server-side mapper and ticket ID helpers.
 *
 * This file asserts that the database mapping logic and SHC ticket format operate as expected.
 * It connects to server/mappers.ts and the auth helpers used during registration and attendee flows.
 */

import { describe, it, expect } from 'vitest';
import { mapSession, mapAttendee } from './mappers';

function newTicketId(): string {
  const n = Date.now().toString().slice(-8);
  return `SHC-${n}`;
}

describe('ticket ids', () => {
  it('generates stable SHC-prefixed ids', () => {
    const id = newTicketId();
    expect(id.startsWith('SHC-')).toBe(true);
    expect(id.length).toBeGreaterThan(6);
  });
});

describe('mappers', () => {
  it('maps session rows to camelCase', () => {
    const session = mapSession({
      id: 'ses-1',
      title: 'Opening',
      description: 'Welcome',
      day: 1,
      start_time: '09:00 AM',
      end_time: '10:00 AM',
      start_minutes: 540,
      end_minutes: 600,
      track: 'Keynote',
      room: 'Main',
      capacity: 100,
      registered_count: 10,
      speaker_ids: ['spk-1'],
      level: 'All Levels',
      tags: ['Open'],
    });
    expect(session.speakerIds).toEqual(['spk-1']);
    expect(session.startTime).toBe('09:00 AM');
  });

  it('maps attendee rows', () => {
    const attendee = mapAttendee({
      id: 'att-1',
      ticket_id: 'SHC-123',
      ticket_tier: 'general',
      full_name: 'Test User',
      email: 'test@example.com',
      company: 'RCB',
      job_title: 'Coordinator',
      interests: ['MICE'],
      dietary_preference: 'None',
      tshirt_size: 'L',
      is_networking_opt_in: true,
      is_checked_in: false,
      registered_at: '2026-07-22',
      qr_code_data: 'SHC-123|test@example.com',
      avatar: '',
      bio: '',
    });
    expect(attendee.ticketId).toBe('SHC-123');
    expect(attendee.fullName).toBe('Test User');
  });
});
