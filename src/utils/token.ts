import jwt from"jsonwebtoken"
import { IUser } from "../model/user";




const accessTokenSecret = process.env.JWT_ACCESS_SECRET as string;
const refreshTokenSecret = process.env.JWT_REFRESH_SECRET as string;

// Generate Access Token (Short-lived)
export const generateAccessToken = (user: IUser) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    accessTokenSecret,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

// Generate Refresh Token (Long-lived)
export const generateRefreshToken = (user: IUser) => {
  return jwt.sign(
    { id: user._id ,email:user.email },
    refreshTokenSecret,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};