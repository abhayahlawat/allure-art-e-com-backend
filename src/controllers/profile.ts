import type { Response } from 'express';
import { z } from 'zod';
import { supabase } from '../lib/supabase.js';
import type { AuthenticatedRequest } from '../middleware/authenticate.js';

const UpsertProfileSchema = z.object({
  display_name: z.string().min(1).max(100),
  phone: z.string().min(5).max(20)
});

export async function getMyProfile(req: AuthenticatedRequest, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { data, error } = await supabase.auth.admin.getUserById(req.user.id);
  if (error) return res.status(500).json({ error: 'Failed to fetch user' });
  const meta = data.user?.user_metadata || {};
  return res.json({
    profile: {
      display_name: meta.display_name || null,
      phone: data.user?.phone || null,
      email: data.user?.email || null
    }
  });
}

export async function upsertMyProfile(req: AuthenticatedRequest, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const parsed = UpsertProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
  }
  const { display_name, phone } = parsed.data;

  const { data, error } = await supabase.auth.admin.updateUserById(req.user.id, {
    user_metadata: { display_name },
    phone
  });
  if (error) return res.status(500).json({ error: 'Failed to save profile', details: error.message });
  const meta = data.user?.user_metadata || {};
  return res.json({ profile: { display_name: meta.display_name || null, phone: meta.phone || null, email: data.user?.email || null } });
}


