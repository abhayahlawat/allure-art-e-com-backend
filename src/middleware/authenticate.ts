import type { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase.js';

export interface AuthenticatedRequest extends Request {
  user?: { id: string; email?: string | null };
}

export async function authenticate(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return next();
  const token = auth.slice('Bearer '.length);
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (!error && data.user) {
      req.user = { id: data.user.id, email: data.user.email };
    }
  } catch {
    // ignore
  }
  return next();
}


