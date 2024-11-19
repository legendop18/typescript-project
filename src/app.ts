import express from 'express'
import dotenv from 'dotenv'
import globalErrorhandler from './middleware/globalerror'
import cookieParser from 'cookie-parser'


dotenv.config()
const app =  express()

//middleware
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static("public/data"))
app.use(cookieParser())


app.get("/",(req,res,next)=>{
      res.json("routes is working") 
})


//routes--------
import authroute from './routes/authroutes'
import bookroute from './routes/bookroutes'
import authorroute from './routes/authorroute'
import orderroute from './routes/orderroute'

app.use("/api/auth",authroute)
app.use("/api/book",bookroute)
app.use("/api/author",authorroute)
app.use("/api/order",orderroute)


// global error handler
app.use(globalErrorhandler)



export default app; 