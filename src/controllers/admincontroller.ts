import { NextFunction, Request, Response } from "express";
import { Admin } from "../model/admin";
import createHttpError from "http-errors";
import bcrypt from 'bcrypt'
import { generateAccessToken, generateRefreshToken } from "../utils/token";
import jwt,{ JwtPayload } from "jsonwebtoken";


const registeradmin = async(req:Request,res:Response,next:NextFunction)=>{
    const {name,email,password} = req.body

    try {
        //Check field are fill or not
        if(!name||!email||!password){
            throw createHttpError(404,"invalid credentials")
        }

        const existingadmin = await Admin.findOne({email})

        if(existingadmin){
            throw createHttpError(400,"Admin alreadu registered")
        }

        const hashpassword = await bcrypt.hash("password",10)

        const admin = await Admin.create({
            name,
            email,
            password:hashpassword
        })

        await admin.save()


        res.status(201).json({
            message:"Admin Registered successfully"
        })

    } catch (error) {
        next(error)
    }
}


const adminlogin = async(req:Request,res:Response,next:NextFunction)=>{
    const {email,password}= req.body

    try {
         //check the field are fill or not

      if(!email || !password){
        throw createHttpError(400," Credentials required")
      }
        const existingadmin = await Admin.findOne({email})
        if(!existingadmin){
            throw createHttpError(404,"Admin not found Please registered admin ")
        }

        const isvalidpassword = await bcrypt.compare("password",existingadmin.password)

        if(!isvalidpassword){
            throw createHttpError(400,"Incorrect password")
        }

        const payload = {
            id : existingadmin.id,
            email: existingadmin.email,
            role:existingadmin.role
          }

        const accessToken = generateAccessToken(payload)
        const refreshToken = generateRefreshToken(payload)
          
        
    res.cookie("refreshToken",refreshToken,{httpOnly:true,secure:true})

          existingadmin.refreshtoken = refreshToken
          await existingadmin.save()

      res.status(201).json({
        success:true,
        message:"Admin loggedin successfully",existingadmin,
        token : accessToken
      })
        
    } catch (error) {
        next(error)
    }
}

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const refreshToken = req.cookies.refreshToken
  
        if (!refreshToken) {
            throw  createHttpError(400,"token must required")
        }
  
        const decode = jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET!) as JwtPayload
  
        const existingadmin = await Admin.findOne({where:{id:decode.id}})
  
        if (!existingadmin) {
            throw createHttpError(404,"User not found");
        }
  
        const payload = {
            id : existingadmin.id,
            email : existingadmin.email,
            role : existingadmin.role
        }
  
        const newAcesstoken = generateAccessToken(payload)
  
        res.status(201).json({
            token : newAcesstoken
        })
  
    } catch (error) {
        next(error)
    }
  }

  const adminlogout = async (req:Request,res:Response,next:NextFunction)=>{
    try {
        const refreshToken = req.cookies?.refreshToken;
        
    
        // Find the user by refresh token
        const admin = await Admin.findOne({ refreshtoken: refreshToken });
    
        if (!admin) {
          // Clear any tokens in cookies
          res.clearCookie('accessToken', { httpOnly: true, secure: true });
          res.clearCookie('refreshToken', { httpOnly: true, secure: true });
            throw createHttpError (404,"User already logged out")
        }
    
    
        // Clear tokens from cookies
        res.clearCookie('accessToken', { httpOnly: true, secure: true });
        res.clearCookie('refreshToken', { httpOnly: true, secure: true });
  
        
        // Remove refresh token from user in the database
        admin.refreshtoken = '';
        await admin.save();
    
        res.status(200).json(
            {
            success:true,
            message: 'Logged out successfully',
            admin
            
            });
      } catch (error) {
        console.error('Logout error:', error);
        next(error)
      }
  }




export {registeradmin ,adminlogin,adminlogout}