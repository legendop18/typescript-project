import app from '../src/app'
import connectDB from './config/db'



const serverstart = async () =>{

    await connectDB()

    const port  = process.env.PORT || 4000

    
    app.listen(port,()=>{
        console.log(`server started to port : ${port}...`)
        
    })
} 


serverstart()







