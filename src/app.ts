import express from 'express'
import dotenv from 'dotenv'
import useroutes from '../src/routes/useroutes'
import globalErrorhandler from './middleware/globalerror'
import createHttpError from 'http-errors'
import cookieParser from 'cookie-parser'


dotenv.config()
const app =  express()

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())

app.get("/",(req,res,next)=>{
      res.json("routes is working") 
})


app.use(useroutes)



app.use(globalErrorhandler)



export default app; 