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
    try {
        const  userId  = req.params.userId; // Get author ID from route parameters
        const updateData = req.body; // Updated data from request body

        // Check if user ID is provided
        if (!userId) {
            throw createHttpError(400, "user ID is required");
        }

        // Find the user by ID and apply updates
        const updateduser= await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true} // Return updated user 
        );

        // Check if author exists
        if (!updateduser) {
            throw createHttpError(404, "User not found");
        }

        // Send the updated author as response
        res.status(200).json({
            success: true,
            message: "User updated successfully",
            user: updateduser
        });
    } catch (error) {
        console.error("Error in updateuser:", error);
        next(error); // Pass error to the error handler middleware
    }
}


