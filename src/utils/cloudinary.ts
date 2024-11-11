import fs from 'fs'
import  {v2 as cloudinary} from 'cloudinary'



const option  = {
    cloud_name: 'dkkq714mc', 
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure : true
}


cloudinary.config(option)




const uploadtocloudinary = async(localfilepath :string)=>{
    try {
        if(!localfilepath) return null

        const response = await cloudinary.uploader.upload(localfilepath,{
            
            resource_type:"image"
        })

        console.log("uploaded to cloudinary !!", response.url);
        

        return response

    } catch (error) {
        fs.unlinkSync(localfilepath),
        console.log("upload cloudinary error",error);

        return null
        
    }
}

export {uploadtocloudinary}