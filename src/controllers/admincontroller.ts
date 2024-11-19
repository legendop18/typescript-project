import { NextFunction, Request, Response } from "express";
import { Admin } from "../model/admin";
import createHttpError from "http-errors";
import bcrypt from 'bcrypt'
import { generateAccessToken, generateRefreshToken } from "../utils/token";
import jwt,{ JwtPayload } from "jsonwebtoken";


const registeradmin = async(req:Request,res:Response,next:NextFunction)=>{
    const {name,email,password} = req.body

    try {

        if(!name||!email||!password){
            throw createHttpError(404,"invalid credentials")
        }
        const existingadmin = await Admin.findOne(email)

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
        const existingadmin = await Admin.findOne(email)
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

      res.status(201).json({
        success:true,
        message:"Admin loggedin successfully",
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


export {registeradmin ,adminlogin}