import { Request, Response } from 'express';
import { createOrderService, updateOrderService, deleteOrderService } from '../services/orderService';

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { buyer, seller, gig, selectedPackage, status } = req.body;

    const savedOrder = await createOrderService({ buyer, seller, gig, selectedPackage, status });
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'An error occurred while creating the order' });
  }
};


export const updateOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const orderId = req.params.id;
    const updateData = req.body;
    const sellerId = req.user._id; // Assuming the authenticated user is the seller

    const updatedOrder = await updateOrderService(orderId, sellerId, updateData);

    if (!updatedOrder) {
      res.status(404).json({ error: 'Order not found or unauthorized' });
      return;
    }

    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'An error occurred while updating the order' });
  }
};

export const deleteOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const orderId = req.params.id;
    const sellerId = req.user._id;

    const deletedOrder = await deleteOrderService(orderId, sellerId);

    if (!deletedOrder) {
      res.status(404).json({ error: 'Order not found or unauthorized' });
      return;
    }

    res.status(200).json({ message: 'Order deleted successfully', order: deletedOrder });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: 'An error occurred while deleting the order' });
  }
};