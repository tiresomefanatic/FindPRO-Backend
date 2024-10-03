import express, { Request, Response } from 'express';
import { becomeSellerController, createUser, getUserById, updateUser } from '../controllers/userController'
import { authMiddleware } from '../auth/protected';

const router = express.Router();

router.get('/:id', getUserById)

router.put('/updateUser/:id', authMiddleware, updateUser)
router.put('/become-seller/:id', authMiddleware, becomeSellerController);


router.post('/createUser', createUser);






export default router;