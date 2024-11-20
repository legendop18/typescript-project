import { NextFunction, Request, Response } from "express";
import { User } from "../model/user";
import createHttpError from "http-errors";
import bcrypt from 'bcrypt'
import { generateotp, getotpexpire } from "../utils/otputils";
import { sendOTPEmail, sendOTPforgot } from "../utils/nodemailer";
import { generateAccessToken, generateRefreshToken } from "../utils/token";
import jwt ,{JwtPayload} from "jsonwebtoken";
import { log } from "console";


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
        await sendOTPEmail(email,otp.toString())
        
        //response send
        res.status(201).json({
            success:true,
            message:"Account created. Please verify your email."
       })
        
    } catch (error) {
        next(error)

    }
}



const verifyEmail = async (req: Request, res: Response ,next : NextFunction) => {
    const { email, otp} = req.body;
    const userId = req.user?.id
    try {
      const user = await User.findOne({ email });
      if (!user) {
        throw  createHttpError(400,"User not found")
      }
  
      if (user.isverified){
        throw  createHttpError(400,"User already verified")
      } 

      console.log(user.otp)
      console.log(otp);
      
      const storedotp = await User.findOne({ where: { userId } });
  
      // Check if OTP matches
      if (storedotp?.otp !== otp) {
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

      if(!existinguser ){
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

      
      existinguser.refreshtoken = refreshToken
      await existinguser.save()
      
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
      
  
      // Find the user by refresh token
      const user = await User.findOne({ refreshtoken: refreshToken });
  
      if (!user) {
        // Clear any tokens in cookies
        res.clearCookie('accessToken', { httpOnly: true, secure: true });
        res.clearCookie('refreshToken', { httpOnly: true, secure: true });
          throw createHttpError (404,"User already logged out")
      }
  
  
      // Clear tokens from cookies
      res.clearCookie('accessToken', { httpOnly: true, secure: true });
      res.clearCookie('refreshToken', { httpOnly: true, secure: true });

      
      // Remove refresh token from user in the database
      user.refreshtoken = '';
      await user.save();
  
      res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      next(error)
    }
  };


const forgotpassword = async(req:Request,res:Response,next:NextFunction) =>{
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      throw createHttpError(404,"User not found")
    }

    // Generate OTP and expiration time
    const otp = generateotp();
    const otpexpireAt =getotpexpire()


    // Update user document
    user.resetotp = otp;
    user.resetotpexpireAt = otpexpireAt ;

    await user.save();

    // Use sendEmail from emailService

    await sendOTPforgot(email,otp.toString())

    //response
    res.status(200).json({ message: "OTP sent to email" });

  } catch (error) {
    console.error("Error in forgotPassword:", error);
    next()
  }
}


const resetpassword = async(req:Request,res:Response,next:NextFunction) =>{
  try {
    const { email, otp, newPassword ,confirmpassword} = req.body;
    const userId = req.user?.id
    // Validate input fields
    if (!email || !otp || !newPassword || !confirmpassword) {
      throw createHttpError(400, "Email, otp, and new password are required");
    }


    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      throw createHttpError(404, "User not found");
    }
    console.log(email,otp,newPassword,confirmpassword,);
    console.log(user?.resetotp);
      
    // Check if OTP is correct and has not expired
    const currentTime = Date.now();
    if ( Number(user.resetotp) !== Number(otp)||!user.resetotpexpireAt || user.resetotpexpireAt < currentTime) {
      throw createHttpError(400, "Invalid or expired OTP");
    }

    if(newPassword !== confirmpassword){
      throw createHttpError(404,"password does'nt match")
    }
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password and clear OTP fields
    user.password = hashedPassword;
    user.resetotp= undefined ; 
    user.resetotpexpireAt = undefined;
    await user.save();

    // Respond with success message
    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    next(error);
  }
}
export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
      const refreshToken = req.cookies.refreshToken

      if (!refreshToken) {
          throw  createHttpError(400,"token must required")
      }

      const decode = jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET!) as JwtPayload

      const existingUser = await User.findOne({where:{id:decode.id}})

      if (!existingUser) {
          throw createHttpError(404,"User not found");
      }

      const payload = {
          id : existingUser.id,
          email : existingUser.email,
          role : existingUser.role
      }

      const newAcesstoken = generateAccessToken(payload)

      res.status(201).json({
          token : newAcesstoken
      })

  } catch (error) {
      next(error)
  }
}




export {register ,verifyEmail ,login , logout ,forgotpassword,resetpassword}
