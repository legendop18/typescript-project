
import mongoose ,{Schema} from "mongoose";



export interface Icartitem extends Document {
    bookId:mongoose.Schema.Types.ObjectId;
    quantity:number;
    price:number;
}


const cartitemschema = new Schema ({
    bookId :{
        type:mongoose.Schema.ObjectId,
        ref:"Book",
        required:true,
    },
    quantity:{
        type:Number,
        required:true,
        min: 1
    },
    price:{
        type:Number,
        required:true,
    }
})


const Cartitem = mongoose.model("Cartitem",cartitemschema)

export {Cartitem}