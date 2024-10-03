import mongoose from 'mongoose';
import Order, { IOrderDocument } from '../models/orderModel';
import User, { IUser } from '../models/usersModel';
import Gig, { IGigDocument } from '../models/gigModel';



export const createOrderService = async (orderData: any): Promise<IOrderDocument> => {
    const { buyer, seller, gig, selectedPackage, status } = orderData;
  
    const session = await mongoose.startSession();
    session.startTransaction();
  
    try {

       // Check if the gig exists
    const existingGig: IGigDocument | null = await Gig.findById(gig);
    if (!existingGig) {
      throw new Error('Gig not found');
    }

      const newOrder: IOrderDocument = new Order({
        buyer,
        seller,
        gig,
        selectedPackage,
        status,
      });
  
      const savedOrder: IOrderDocument = await newOrder.save({ session });
  
      // Update buyer's purchases
      await User.findByIdAndUpdate(
        buyer,
        { $push: { purchases: savedOrder._id } },
        { new: true, session }
      );
  
      // Update seller's orders
      await User.findByIdAndUpdate(
        seller,
        { $push: { orders: savedOrder._id } },
        { new: true, session }
      );
  
      await session.commitTransaction();
      return savedOrder;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  };

  export const updateOrderService = async (
    orderId: string,
    sellerId: string,
    updateData: any
  ): Promise<IOrderDocument | null> => {
    try {
      // Check if the update data contains only allowed fields
      const allowedFields = ['selectedPackage', 'status'];
      const isValidUpdate = Object.keys(updateData).every(field =>
        allowedFields.includes(field)
      );
  
      if (!isValidUpdate) {
        throw new Error('Invalid update fields');
      }
  
      const updateFields: any = {};
  
      if (updateData.selectedPackage) {
        updateFields['selectedPackage'] = updateData.selectedPackage;
      }
  
      if (updateData.status) {
        updateFields['status'] = updateData.status;
      }
  
      const updatedOrder = await Order.findOneAndUpdate(
        { _id: orderId, seller: sellerId },
        { $set: updateFields },
        { new: true }
      );
  
      return updatedOrder;
    } catch (error) {
      throw error;
    }
  };


export const deleteOrderService = async (orderId: string, sellerId: string): Promise<IOrderDocument | null> => {
  try {
    const deletedOrder = await Order.findOneAndDelete({ _id: orderId, seller: sellerId });

    if (!deletedOrder) {
      throw new Error('Order not found or unauthorized');
    }

    return deletedOrder;
  } catch (error) {
    throw error;
  }
};
