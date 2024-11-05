import mongoose, { Schema } from "mongoose";
import { Cartitem, Icartitem } from "./cartitem";

export interface Icart extends Document{
    userId : mongoose.Schema.Types.ObjectId;
    items:  Icartitem[];
    totalprice : number;
}
const cartschema = new Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    items:{
        type : Cartitem,
    },
    totalprice:{
        type:Number,
        default :  0
    }
})


cartschema.pre<Icart>('save', async function (next) {
    // Ensure `items` array is accessible and calculate total price
    this.totalprice = await this.items ? this.items.reduce((total, item) => total + item.price * item.quantity, 0) : 0;
    next();
  });

const Cart = mongoose.model("Cart",cartschema)

export {Cart}