import express from 'express'
import dotenv from 'dotenv'

import globalErrorhandler from './middleware/globalerror'
import cookieParser from 'cookie-parser'


dotenv.config()
const app =  express()

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static("public/data"))
app.use(cookieParser())

app.get("/",(req,res,next)=>{
      res.json("routes is working") 
})

import useroutes from './routes/useroutes'
import bookroute from './routes/bookroutes'


app.use("/api/auth",useroutes)
app.use("/api/book",bookroute)



app.use(globalErrorhandler)



export default app; 