import { NextFunction, Request, Response } from "express";
import { User } from "../model/user";
import createHttpError from "http-errors";
import bcrypt from 'bcrypt'
import { generateotp, getotpexpire } from "../utils/otputils";
import { sendOTPEmail } from "../utils/nodemailer";



const register = async (req:Request,res:Response,next:NextFunction) =>{

        const {name ,email,password,role} = req.body
   
    try {
        
        //check the field are fill or not
        if(!name || !email || !password){
            throw createHttpError(400 ,"Invaid Credentials")
        }


        //check the user already registered
        const existinguser = await User.findOne({email})
        if(existinguser){
            throw createHttpError(400,"User Already Registered")
        }


        //hash the password
        const passwordhash = await bcrypt.hash(password,10)



        //generate otp 
        const otp = generateotp();
        const otpexpireAt =getotpexpire()

         //create the user
        const user = await User.create({
            name,
            email,
            password :passwordhash,
            role,
            isverified:false,
            otp,
            otpexpireAt
             
        })
        await user.save()


        
        // SEND EMAIL TO USER TO VERIFY
        await sendOTPEmail(email,otp)
        
        //response send
        res.status(201).json({
            success:true,
            message:"Account created. Please verify your email."
       })
        
    } catch (error) {
        next(error)

    }
}

const verifyOTP = async (req: Request, res: Response) => {
    const { email, otp } = req.body;
  
    try {
      const user = await User.findOne({ email });
      if (!user) {
        throw  createHttpError(400,"User not found")
      }
  
      if (user.isverified){
        throw  createHttpError(400,"User already verified")
      } 
  
      // Check if OTP matches
      if (user.otp !== otp) {
        throw  createHttpError(400,"Invalid OTP")
      }
      
  
      // Check if OTP is expired
      if (user.otpexpireAt && user.otpexpireAt < new Date().getTime()) {
        
        throw  createHttpError(400," OTP expired")
      }
  
      // Mark user as verified
      user.isverified = true;
      user.otp = undefined;
      user.otpexpireAt = undefined;
      await user.save();
      
      //response 
      res.status(200).json({ message: 'Email verified successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error' },);
      console.log(error);
      
    }
  };
  


export {register ,verifyOTP}