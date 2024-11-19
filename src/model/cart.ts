import mongoose, { Schema, Document } from "mongoose";

// Define the interface for the Cart model
export interface ICart extends Document {
    userId: mongoose.Schema.Types.ObjectId; // User who owns the cart
    items: { 
        bookId: mongoose.Schema.Types.ObjectId; // Book added to the cart
        quantity: number;
        price: number;
    }[]; // List of items in the cart
    totalPrice: number; // Total price of the cart
}

// Define the schema for the Cart
const CartSchema = new Schema<ICart>({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    items: [
        {
            bookId: { 
                type: mongoose.Schema.Types.ObjectId, 
                ref: "book", 
                required: true 
            },
            quantity: { 
                type: Number, 
                required: true, 
                min: 1 
            },
            price: { 
                type: Number, 
                required: true 
            }
        }
    ],
    totalPrice: { 
        type: Number, 
        required: true, 
        default: 0 
    }
});

CartSchema.pre("save", function (next) {
    this.totalPrice = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    next();
});

// Create the Cart model
const Cart = mongoose.model<ICart>("Cart", CartSchema);

export default Cart;
