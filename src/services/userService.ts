import { Types } from 'mongoose';
import User, { IUser } from '../models/usersModel';


export const updateUserService = async (
    userId: Types.ObjectId,
    updateData: Partial<IUser>
  ): Promise<IUser | null> => {
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
    return updatedUser;
  };

  export const getUserByIdService = async (userId: string): Promise<IUser | null> => {
    const user = await User.findById(userId);
    return user;
  };

  export const becomeSellerService = async (userId: Types.ObjectId ): Promise<IUser | null> => {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { isSeller: true },
      { new: true }
    );
    return updatedUser;
  };