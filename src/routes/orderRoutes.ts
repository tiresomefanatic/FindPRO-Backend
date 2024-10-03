import express from 'express';
import { createOrder, updateOrder, deleteOrder } from '../controllers/orderController';
import { IUser } from '../models/usersModel';



const router = express.Router();

router.post('/create-new-order', createOrder);





export default router;