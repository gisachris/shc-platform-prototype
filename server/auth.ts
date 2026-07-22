import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { config } from './config';
import { User, UserRole } from '../src/types';
import { getDb } from './db';

const ORGANIZER_ROLES: UserRole[] = ['organizer', 'administrator', 'super_admin'];
const SALT_ROUNDS = 10;

export type AuthUser = User & { passwordHash?: string };

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!hash) return false;
  // Legacy plaintext seed support during migration
  if (!hash.startsWith('$2')) {
    return password === hash;
  }
  return bcrypt.compare(password, hash);
}

export function signToken(user: { id: string; email: string; role: UserRole }): string {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    config.jwtSecret,
    { expiresIn: '7d' }
  );
}

export function mapUserRow(row: any): AuthUser {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    role: row.role,
    company: row.company || '',
    jobTitle: row.job_title || '',
    avatar: row.avatar || '',
    ticketTier: row.ticket_tier || undefined,
    ticketId: row.ticket_id || undefined,
    assignedSessionIds: row.assigned_session_ids || [],
    bio: row.bio || '',
    passwordHash: row.password_hash,
  };
}

export function sanitizeUser(user: AuthUser, token?: string): User {
  const { passwordHash, ...rest } = user;
  return token ? { ...rest, token } : rest;
}

export async function findUserByEmail(email: string): Promise<AuthUser | null> {
  const { data, error } = await getDb().from('users').select('*').eq('email', email.toLowerCase()).maybeSingle();
  if (error) throw error;
  return data ? mapUserRow(data) : null;
}

export async function findUserById(id: string): Promise<AuthUser | null> {
  const { data, error } = await getDb().from('users').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? mapUserRow(data) : null;
}

export function getAuthUser(req: Request): User | null {
  return (req as any).user || null;
}

export function isOrganizer(user: User | null): boolean {
  return Boolean(user && ORGANIZER_ROLES.includes(user.role));
}

export async function authOptional(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next();
  }
  try {
    const token = header.slice(7);
    const payload = jwt.verify(token, config.jwtSecret) as { sub: string };
    const user = await findUserById(payload.sub);
    if (user) {
      (req as any).user = sanitizeUser(user, token);
    }
  } catch {
    // ignore invalid token for optional auth
  }
  next();
}

export async function authRequired(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  try {
    const token = header.slice(7);
    const payload = jwt.verify(token, config.jwtSecret) as { sub: string };
    const user = await findUserById(payload.sub);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    (req as any).user = sanitizeUser(user, token);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function requireOrganizer(req: Request, res: Response, next: NextFunction) {
  const user = getAuthUser(req);
  if (!isOrganizer(user)) {
    return res.status(403).json({ error: 'Unauthorized: organizer or administrator role required' });
  }
  next();
}

export async function writeAudit(entry: {
  action: string;
  actor: string;
  target: string;
  category: string;
  details?: string;
}) {
  const row = {
    id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    action: entry.action,
    actor: entry.actor,
    target: entry.target,
    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
    category: entry.category,
    details: entry.details || null,
  };
  await getDb().from('audit_logs').insert(row);
  return row;
}

export function newTicketId(): string {
  const n = Date.now().toString().slice(-8);
  return `SHC-${n}`;
}
