import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../auth/protected';
import { setAuthenticatedService, refreshAccessTokenService, logoutService } from '../services/authService';
import { Types } from 'mongoose';

export const setAuthenticated = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const result = await setAuthenticatedService(userId);
    if (result.isAuthenticated) {
      return res.status(200).json(result);
    } else {
      return res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error in setAuthenticated:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const refreshAccessToken = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers['authorization'];
    const accessToken = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!accessToken) {
      return res.status(403).json({ error: 'Access token not found' });
    }

    const newAccessToken = await refreshAccessTokenService(accessToken);

    res.json({ 
      message: 'Access token refreshed successfully',
      accessToken: newAccessToken
    });
  } catch (error) {
    console.error('Failed to refresh access token:', error);
    if (error instanceof Error) {
      if (error.message === 'Invalid access token' || error.message === 'Invalid refresh token') {
        res.status(401).json({ error: error.message });
      } else if (error.message === 'User not found' || error.message === 'Refresh token not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};


export const logout = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = new Types.ObjectId (req.userId)

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await logoutService(userId);

  

    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Error in logout:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

