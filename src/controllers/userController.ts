import { Request, Response } from "express";
import User, { IUser } from "../models/usersModel";
import { becomeSellerService, getUserByIdService, updateUserService } from "../services/userService";
import { Types } from "mongoose";
import { AuthenticatedRequest } from "../auth/protected";

export const createUser = async (req: Request, res: Response) => {
  try {
    const { firstName } = req.body;

    // Check if the user already exists
    // const existingUser = await User.findOne({ phoneNumber });
    // if (existingUser) {
    //   return res.status(409).json({ message: 'User already exists' });
    // }

    // Create a new user
    const newUser: IUser = new User({
      firstName,
    });

    // Save the user to the database
    await newUser.save();

    res
      .status(201)
      .json({ message: "User created successfully", user: newUser });
    newUser;
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateUser = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = new Types.ObjectId(req.userId);
    const updateData = req.body as Partial<IUser>;

    // Validation for FAQs
    if (updateData.faqs) {
      const hasEmptyFields = updateData.faqs.some(
        (faq: { question: string; answer: string }) =>
          faq.question.trim() === '' || faq.answer.trim() === ''
      );

      if (hasEmptyFields) {
        res.status(400).json({ error: 'Question and answer fields cannot be empty.' });
        return;
      }
    }

    const updatedUser = await updateUserService(userId, updateData);

    if (!updatedUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    if (error instanceof Error) {
      if (error.message === 'Invalid user ID') {
        res.status(400).json({ error: "Invalid user ID" });
      } else {
        res.status(500).json({ error: error.message });
      }
    } else {
      res.status(500).json({ error: "An unknown error occurred while updating the user" });
    }
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;

    const user = await getUserByIdService(userId);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error getting user by ID:', error);
    res.status(500).json({ error: 'An error occurred while getting the user' });
  }
};

export const becomeSellerController = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = new Types.ObjectId (req.userId);

    const updatedUser = await becomeSellerService(userId);

    if (!updatedUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error becoming a seller:', error);
    res.status(500).json({ error: 'An error occurred while becoming a seller' });
  }
};