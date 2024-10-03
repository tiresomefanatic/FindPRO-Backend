import mongoose, { Document, Types, ObjectId, Model } from "mongoose";

interface PackageObject {
  per: string;
  price: string;
  description: string;
}

interface CategoryObject {
  id: Types.ObjectId;
  name: string;
  subCategories: Array<Types.ObjectId>;
}

interface subCategoryObject {
  id: Types.ObjectId;
  name: string;
  category: Types.ObjectId;
}

export interface IGigDocument extends Document {
  owner: Types.ObjectId;
  title: string;
  category?: string;
  subCategory?: string;
  skills?: Types.Array<string>;
  tags?: Types.Array<string>;
  description?: string;
  note?: string;
  packages: Array<{
    name: "basic" | "premium" | "custom";
    title: string;
    per: string;
    price: string;
    description: string;
  }>;
  faqs?: Array<{
    question: string;
    answer: string;
  }>;
  portfolioMedia?: Array<{
    uid: string;
    src: string;
  }>;
  lastUpdated: Date;
  status: "isDraft" | "isLive";
  createdAt: Date;
  orders?: Array<Types.ObjectId>;
  interactions: Array<{
    userId: Types.ObjectId;
    contact_viewed: number;
    phone_viewed: number;
    whatsapp_clicked: number;
    lastInteraction: Date;
  }>;
}

const GigSchema = new mongoose.Schema<IGigDocument>(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
    },
    category: {
      type: String,
    },
    subCategory: {
      type: String,
    },
    skills: [String],

    tags: [String],
    description: {
      type: String,
    },
    note: {
      type: String,
    },
    packages: [
      {
        name: {
          type: String,
          enum: ["Basic", "Premium", "Custom"],
        },
        title: {
          type: String,
        },
        per: {
          type: String,
        },
        price: {
          type: String,
        },
        description: {
          type: String,
        },
      },
    ],
    faqs: [
      {
        question: String,
        answer: String,
      },
    ],
    portfolioMedia: [
      {
        _id: false,
        uid: String,
        src: String,
      },
    ],
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["isDraft", "isLive"],
      default: "isDraft",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
    interactions: {
      type: [
        {
          userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          contact_viewed: { type: Number, default: 0 },
          phone_viewed: { type: Number, default: 0 },
          whatsapp_clicked: { type: Number, default: 0 },
          lastInteraction: { type: Date, default: Date.now },
        },
      ],
      default: [], // This ensures the field always exists as an array
    },
  },
  {
    timestamps: true,
  }
);

GigSchema.index({ category: "text", subCategory: "text" });

const Gig: Model<IGigDocument> = mongoose.model<IGigDocument>("Gig", GigSchema);

export default Gig;
