import { Document, Schema, model, Types } from 'mongoose';

export interface IOrderDocument extends Document {
  buyer: Types.ObjectId
  seller: Types.ObjectId
  gig: Types.ObjectId
  selectedPackage: {
    type: 'basic' | 'premium' | 'custom';
    per: string;
    price: string;
    description: string;
  };
  status: 'In-Progress' | 'Completed' | 'Cancelled-By-Buyer' | 'Cancelled-By-Seller';
}

const orderSchema = new Schema<IOrderDocument>({
  buyer: {
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
  seller: {
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
  gig: {
        type: Schema.Types.ObjectId, 
        ref: 'Gig', 
        required: true 
    },
  selectedPackage: {
    type: { 
        type: String, 
        enum: ['basic', 'premium', 'custom'], 
        required: true 
    },
    per: { 
        type: String, 
        required: true 
    },
    price: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String, 
        required: true 
    },
},
  status: {
    type: String,
    enum: ['In-Progress', 'Completed', 'Cancelled-By-Buyer', 'Cancelled-By-Seller'],
    default: 'In-Progress',
  }, 
});

const Order = model<IOrderDocument>('Order', orderSchema);

export default Order;