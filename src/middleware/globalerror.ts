
import { Response,NextFunction ,Request } from "express"
import { HttpError } from "http-errors"

export interface customerror extends Error {
        statuscode : number
}

const globalErrorhandler = (err:HttpError, req:Request,res:any , next:NextFunction)=>{
        //const statusCode = err.statusCode || 500
        const message = err.message || "Internal Server Error"
        const statuscode = err.statuscode || 500

        return res.status(statuscode).json({
                success:false,
                message : message,
                errorstack : process.env.NODE_ENV === "development" ? err.stack :""
        })

        
}


export default globalErrorhandler