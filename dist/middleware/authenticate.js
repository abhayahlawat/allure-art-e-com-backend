import { supabase } from '../lib/supabase.js';
export async function authenticate(req, _res, next) {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer '))
        return next();
    const token = auth.slice('Bearer '.length);
    try {
        const { data, error } = await supabase.auth.getUser(token);
        if (!error && data.user) {
            req.user = { id: data.user.id, email: data.user.email };
        }
    }
    catch {
        // ignore
    }
    return next();
}
