import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User, { IUser } from '../models/usersModel';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
//import authConfig from './authConfig';

import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;





passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID as string,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
  callbackURL: '/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });
    let isNewUser = false;

    const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : '';


    if (!user) {
      // Create a new user if not found
      user = await User.create({
        googleId: profile.id,
        name: profile.displayName,
        email: email,
      });
      isNewUser = true;
    }

    // Generate JWT access token and refresh token
    const accessToken = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1m' });
    const refreshToken = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '30d' });
    
   

    // Store the hashed refresh token in the user document
    user.refreshToken = refreshToken;
    await user.save();
    
    return done(null, { userId: user._id, accessToken, refreshToken, isNewUser, name: user.name } );
  } catch (error) {
    return done(error);
  }

}));

// passport.serializeUser((user: any, done) => {
//   done(null, user.userId);
// });

// passport.deserializeUser(async (userId, done) => {
//   try {
//     const user: IUser | null = await User.findById(userId);
//     done(null, user || undefined);
//   } catch (error) {
//     done(error, undefined);
//   }
// });

export default passport;


//const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : '';
