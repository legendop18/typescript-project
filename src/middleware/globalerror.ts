
import { NextFunction ,Request } from "express";
import { HttpError } from "http-errors";

const globalErrorhandler = (err:HttpError , req:Request,res:any , next:NextFunction)=>{
        const statusCode = err.statusCode || 500


        return res.status(statusCode).json({
                success:false,
                message : err.message ,
                errorstack : process.env.NODE_ENV === "development" ? err.stack :""
        })

        
}


export default globalErrorhandler