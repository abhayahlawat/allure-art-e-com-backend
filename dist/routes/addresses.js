import { Router } from 'express';
import { createAddress, getUserAddresses } from '../controllers/addresses.js';
import { authenticate } from '../middleware/authenticate.js';
const router = Router();
// Protected routes (require authentication)
router.use(authenticate);
// Create a new address
router.post('/', createAddress);
// Get all addresses for the current user
router.get('/', getUserAddresses);
export default router;
