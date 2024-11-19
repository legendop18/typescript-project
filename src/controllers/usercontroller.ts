import { NextFunction, Request, Response } from "express";
import { User } from "../model/user";
import createHttpError from "http-errors";

export const getuserbyid = async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const { userId } = req.params;

        // Find the user
        const user = await User.findById(userId).select("-password");
        if (!user) {
            throw createHttpError(404, "User not found.");
        }

        res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        next(error);
    }

}

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await User.find().select("-password").sort({ name: 1 });

        res.status(200).json({
            success: true,
            totalUsers: users.length,
            users,
        });
    } catch (error) {
        next(error);
    }
};


export const updateuser = async(req:Request,res:Response,next:NextFunction)=>{

}


