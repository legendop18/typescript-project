import { json ,NextFunction  ,Request ,Response } from "express"
import createHttpError from "http-errors"
import jwt,{ JwtPayload  } from "jsonwebtoken"
import { UserPayload } from "../@types/types"

export const isAuthenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(" ")[1] || null
        

        if (!token) {
            throw  createHttpError(404,"User is not Authenticated!!")
        }

        const decode = await jwt.verify(token,process.env.JWT_ACCESS_SECRET as string) as JwtPayload

        if (!decode) {
            throw  createHttpError(404,"User is not Authenticated!!")
        }

        const userPayload = {
            email : decode.email,
            id : decode.id,
            role : decode.role
        }
        

        req.user = userPayload as UserPayload
        
        next()

    } catch (error) {
        console.log(error);
        next(error)
    }
}
