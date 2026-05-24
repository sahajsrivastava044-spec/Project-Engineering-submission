import express from 'express';
import { 
  getAllExpenses, 
  getMyExpenses, 
  createExpense, 
  updateExpense, 
  approveExpense, 
  rejectExpense, 
  deleteExpense 
} from '../controllers/expenseController.js';
import { allowedRoles, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, allowedRoles("admin","manager"), getAllExpenses);           // ❌ should be manager+
router.get('/mine', protect, getMyExpenses);
router.post('/', protect, createExpense);
router.put('/:id', protect, updateExpense);
router.put('/:id/approve', protect, allowedRoles("admin","manager"), approveExpense); // ❌ should be manager+
router.put('/:id/reject', protect, allowedRoles("admin","manager"), rejectExpense);   // ❌ should be manager+
router.delete('/:id', protect, allowedRoles("admin"),deleteExpense);      // ❌ should be admin-only

export default router;
