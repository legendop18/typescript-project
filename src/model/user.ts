import mongoose, { Schema } from "mongoose";
export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  isAdmin: boolean;
  orders?: mongoose.Schema.Types.ObjectId[];
  cart?: { bookId: mongoose.Schema.Types.ObjectId; quantity: number }[];
  address?: string;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
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
});

const User = mongoose.model<IUser>('User', UserSchema);

export { User };
