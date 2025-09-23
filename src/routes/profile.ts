import { Router } from 'express';
import { getMyProfile, upsertMyProfile } from '../controllers/profile.js';

const router = Router();

router.get('/me', getMyProfile);
router.post('/me', upsertMyProfile);

export default router;


