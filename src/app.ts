import express from 'express'
import dotenv from 'dotenv'
import useroutes from '../src/routes/useroutes'
import globalErrorhandler from './middleware/globalerror'
import createHttpError from 'http-errors'


dotenv.config()
const app =  express()

app.use(express.json())
app.use(express.urlencoded({extended:true}))


app.get("/",(req,res,next)=>{
   const error = createHttpError(500,"error")
   throw error
    
})


app.use(useroutes)



app.use(globalErrorhandler)



export default app; 