import jwt from"jsonwebtoken"



interface tokenPayload {
  id:string,
  email:string,
  role:string
}

const accessTokenSecret = process.env.JWT_ACCESS_SECRET as string;
const refreshTokenSecret = process.env.JWT_REFRESH_SECRET as string;

// Generate Access Token (Short-lived)
export const generateAccessToken = (payload : tokenPayload) => {
  return jwt.sign(
    { id: payload.id, email: payload.email },
    accessTokenSecret,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

// Generate Refresh Token (Long-lived)
export const generateRefreshToken = (payload : tokenPayload) => {
  return jwt.sign(
    { id: payload.id ,email:payload.email },
    refreshTokenSecret,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};