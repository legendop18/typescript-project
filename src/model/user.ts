import mongoose, { Schema } from "mongoose";


 

export interface IUser extends Document {
  _id: any;
  name: string;
  email: string;
  password: string;
  role:string;  
  isverified:boolean
  orders?: mongoose.Schema.Types.ObjectId[];
  cart?: { bookId: mongoose.Schema.Types.ObjectId; quantity: number }[];
  address?: string;
  refreshtoken:string,
  otp?:number,
  otpexpireAt?:number,
  
}
const UserSchema  = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String ,enum : ["Customers","Employee","Admin"] ,default:"Customers"},
  isverified:{ type: Boolean ,default: false},
  orders: [{ type: Schema.Types.ObjectId, ref: 'Order' }],
  cart: [
    {
      bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
      quantity: { type: Number, required: true },
    },
  ],
  address: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    zipCode: { type: String },
    country: { type: String },
  },
  refreshtoken:{
    type:String
  },
  otp:{type:Number },
  otpexpireAt:{type:Number }
});

const User = mongoose.model<IUser>('User', UserSchema);

export { User };
 