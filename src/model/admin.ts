import mongoose, { Schema } from "mongoose";


export interface Iadmin extends Document{
    name:string,
    email:string,
    password:string,
    role:string,
    refreshtoken:string,
}



const adminschema = new Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        default:"admin"
    },
    refreshtoken:{
        type:String
    }
    

})

const Admin = mongoose.model<Iadmin>("Admin",adminschema)

export{Admin}