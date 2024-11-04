import { NextFunction, Request, Response } from "express";
import { Users } from "../model/usermodel";
import createHttpError from "http-errors";
import bcrypt from "bcrypt"



const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, password } = req.body;

    const existinguser = await Users.findOne({ email });

    if (existinguser) {
      throw createHttpError(500, "Users Aleady registered ...");
    }
    const hashpassword = await bcrypt.hash(password,10)
    const user = await Users.create({
      username,
      email,
      password :hashpassword,
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: "User Registered successfully ",
    });
  } catch (error) {
    next(error);
  }
};


const login =async(req :Request ,res :Response ,next : NextFunction)=>{

}

export { register };
