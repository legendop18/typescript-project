import mongoose, { Schema , Document} from "mongoose";

export interface IOrder extends Document {
    userId: mongoose.Schema.Types.ObjectId;
    items: { bookId: mongoose.Schema.Types.ObjectId; quantity: number; price: number }[];
    totalAmount: number;
    orderDate: Date;
    status: 'pending' | 'shipped' | 'delivered' | 'canceled';
    shippingAddress: string;
    paymentDetails:{
      orderId: string,
      paymentId?:string,
      signature?:string,
      status : 'pending'|'paid'|'failed'
    }
  }
  
  const OrderSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
      {
        bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    orderDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'shipped', 'delivered', 'canceled'], default: 'pending' },
    shippingAddress: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      zipCode: { type: String },
      country: { type: String },
    },
    paymentDetails:{
      orderId: {type:String,required:true},
      paymentId:{type:String},
      signature:{type:String},
      status:{
        type:String,
        enum: ['pending','paid','failed'],
        default:"pending"
      }
    }
  });
  
const Order = mongoose.model<IOrder>('Order', OrderSchema);
  
export {Order}