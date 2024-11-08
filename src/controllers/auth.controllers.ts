import { NextFunction, Request, Response } from "express";
import { User } from "../model/user";
import createHttpError from "http-errors";
import bcrypt from 'bcrypt'
import { generateotp, getotpexpire } from "../utils/otputils";
import { sendOTPEmail } from "../utils/nodemailer";
import { generateAccessToken, generateRefreshToken } from "../utils/token";



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

const verifyOTP = async (req: Request, res: Response ,next : NextFunction) => {
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
      next(error)
      console.log(error);
      
    }
  };


  const login = async (req:Request ,res :Response,next:NextFunction )=>{
    const {email ,password} = req.body
    try {

      //check the field are fill or not

      if(!email || !password){
        throw createHttpError(400," Credentials required")
      }
      //check email exist or not

      const existinguser = await  User.findOne({email})

      if(!existinguser || existinguser.role.includes("Admin")){
        throw createHttpError(400,"User not found,sigup first")
      }

      //check password match or not

      const ispasswordvalid = await bcrypt.compare(password,existinguser.password)

      if(!ispasswordvalid){
        throw createHttpError(404,"invalid password")
      }


      const payload = {
        id : existinguser.id,
        email: existinguser.email,
        role:existinguser.role
      }

      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload)

      res.cookie("refreshToken",refreshToken,{httpOnly:true,secure:true})

      res.status(201).json({
        success:true,
        message:"User loggedin successfully",
        token : accessToken
      })
    } catch (error) {
      next(error)
    }
  }

const logout = async(req:Request,res:Response,next:NextFunction) =>{
 
    try {
      const refreshToken = req.cookies?.refreshToken;
      
      // Check if refresh token exists in request
      if (!refreshToken) {
           throw createHttpError (204,"No content to logout") // No refresh token found, nothing to logout
      }
  
      // Find the user by refresh token
      const user = await User.findOne({ refreshtoken: refreshToken });
  
      if (!user) {
        // Clear any tokens in cookies
        res.clearCookie('accessToken', { httpOnly: true, secure: true });
        res.clearCookie('refreshToken', { httpOnly: true, secure: true });
          throw createHttpError (204,"User already logged out")
      }
  
      // Remove refresh token from user in the database
      user.refreshtoken = '';
      await user.save();
  
      // Clear tokens from cookies
      res.clearCookie('accessToken', { httpOnly: true, secure: true });
      res.clearCookie('refreshToken', { httpOnly: true, secure: true });
  
      return res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      next(error)
    }
  };


const forgotpassword = async(req:Request,res:Response,next:NextFunction) =>{

}


const resetpassword = async(req:Request,res:Response,next:NextFunction) =>{

}


const updateprofile = async(req:Request,res:Response,next:NextFunction) =>{

}
  


export {register ,verifyOTP ,login , logout}
