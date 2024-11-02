import express from 'express'
import dotenv from 'dotenv'

import globalErrorhandler from './middleware/globalerror'
import createHttpError from 'http-errors'


dotenv.config()
const app =  express()




app.get("/",(req,res,next)=>{
   const error = createHttpError(500,"error")
   throw error
    
})






app.use(globalErrorhandler)



export default app; 