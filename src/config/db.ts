import mongoose from "mongoose";




const connectDB = async ()=>{
    try {
        

        mongoose.connection.on("connected",()=>{
            console.log('connected to database successfully');
            
        })

        mongoose.connection.on("error",(err)=>{
            console.log('Error in connecting database',err);
            
        })

        await  mongoose.connect(process.env.DB as string)

    } catch (error) {
        console.error("failed to connect to DB",error)
        process.exit(1)
    }
}


export default connectDB