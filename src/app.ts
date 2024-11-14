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
import useroutes from './routes/useroutes'
import bookroute from './routes/bookroutes'
import authorroute from './routes/authorroute'

app.use("/api/auth",useroutes)
app.use("/api/book",bookroute)
app.use("/api/author",authorroute)


// global error handler
app.use(globalErrorhandler)



export default app; 