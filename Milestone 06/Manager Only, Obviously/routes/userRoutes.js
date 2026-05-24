import express from 'express';
import { getAllUsers, updateUserRole, getUserProfile } from '../controllers/userController.js';
import { allowedRoles, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, allowedRoles("admin"), getAllUsers);          // ❌ should be admin-only
router.put('/:id/role', protect, allowedRoles("admin"), updateUserRole); // ❌ should be admin-only
router.get('/me', protect, getUserProfile);

export default router;
