import jwt from 'jsonwebtoken';
import User from '../models/usersModel';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { Types } from 'mongoose';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;


export const setAuthenticatedService = async (userId: string) => {
  try {
    const user = await User.findById(userId);
   
   
   
    if (user) {
      return {
        isAuthenticated: true,
        userData: user,
      };
    } else {
      return {
        isAuthenticated: false,
      };
    }
  } catch (error) {
    console.error('Error in setAuthenticatedService:', error);
    throw new Error('Internal server error');
  }
};


export const refreshAccessTokenService = async (accessToken: string) => {
  try {
    // Verify and decode the expired access token
    let decodedAccessToken: { userId: string };
    try {
      decodedAccessToken = jwt.verify(accessToken, JWT_SECRET, { ignoreExpiration: true }) as { userId: string };
    } catch (error) {
      throw new Error('Invalid access token');
    }
    const userId = decodedAccessToken.userId;

    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Get the hashed refresh token from the user document
    const refreshToken = user.refreshToken;

    if (!refreshToken) {
      throw new Error('Refresh token not found');
    }

    // Verify the refresh token
    let decodedRefreshToken: { userId: string };
    try {
      decodedRefreshToken = jwt.verify(refreshToken, JWT_SECRET) as { userId: string };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }

    // Generate a new access token
    const newAccessToken = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1d' });

    return newAccessToken;
  } catch (error) {   
    throw error;
  }
};

export const logoutService = async (userId: Types.ObjectId) => {
  try {
    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Clear the refresh token from the user document
    user.refreshToken = undefined;
    await user.save();

    return true;
  } catch (error) {
    console.error('Error in logoutService:', error);
    throw new Error('Internal server error');
  }
};