import { url } from "inspector";
import mongoose, { Document, Model, ObjectId, Schema, Types } from "mongoose";
import { Url } from "url";

export interface IUser extends mongoose.Document {
  sessionToken?: string;
  googleId?: string;
  email?: string;
  isNewLogin?: boolean;
  refreshToken?: string;
  name: string;
  profilePic: string;
  bio?: string;
  gender?: string;
  //dateOfBirth?: Date;
  portfolioLink: string;
  instagramLink: string;
  location?: string;
  languages?: Types.Array<string>;
  skills?: Types.Array<string>;
  phoneNumber?: string;
  isSeller: boolean;
  bookmarkedGigs: Array<Types.ObjectId>;
  myGigs?: Array<Types.ObjectId>;
  orders?: Array<Types.ObjectId>;
  faqs?: Array<{
    question: string;
    answer: string;
  }>;
}

const UserSchema = new mongoose.Schema<IUser>({
  sessionToken: {
    type: String,
  },
  googleId: {
    type: String,
    unique: true,
  },
  email: {
    type: String,
    unique: true,
  },
  profilePic : {
    type: String,
  },
  name: {
    type: String,
    //required: true
  },
  isNewLogin: {
    type: Boolean,
  },
  refreshToken: {
    type: String,
  },

  bio: {
    type: String,
  },
  gender: {
    type: String,
  },
  // dateOfBirth: {
  //   type: Date
  // },
  portfolioLink: {
    type: String
  },
  instagramLink: {
    type: String
  },
  location: {
    type: String,
  },
  languages: {
    type: [String],
  },
  skills: {
    type: [String],
  },
  phoneNumber: {
    type: String,
    // required: true,
    // unique: true
  },
  
  isSeller: {
    type: Boolean,
    default: false,
  },

  faqs: [
    {
      question: String,
      answer: String,
    },
  ],

  myGigs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gig",
    },
  ],
  bookmarkedGigs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gig",
    },
  ],

  orders: [
    {
      type: Schema.Types.ObjectId,
      ref: "Order",
    },
  ],
});

const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);

export default User;
