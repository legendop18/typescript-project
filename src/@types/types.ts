import { User } from "../model/user";

export type UserPayload =  {
    id : string,
    email : string,
    role : string
}

declare global {
    namespace Express {
        interface Request {
            user ?: UserPayload,
            
        }
    }
}