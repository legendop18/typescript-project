import mongoose from "mongoose";

export interface User {
   _id : number,
   username:string,
   email:string,
   password:string
}

const userschema = new mongoose.Schema<User>({
    username:{
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
    }
})

const Users = mongoose.model("Users",userschema)

export {Users}