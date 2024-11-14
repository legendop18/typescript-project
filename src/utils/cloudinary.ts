import fs from 'fs'
import  {v2 as cloudinary} from 'cloudinary'



const option  = {
    cloud_name: 'dkkq714mc', 
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure : true
}


cloudinary.config(option)


export const Folders : {pdfurl : string,coverImage : string} = {
    pdfurl :"Pdfurl",
    coverImage : "coverImage"
}



const uploadtocloudinary = async(localfilepath :string,folder :string)=>{
    try {
        if(!localfilepath) return null

        const response = await cloudinary.uploader.upload(localfilepath,{
            folder:folder,
            resource_type:"auto"
        })

        console.log("uploaded to cloudinary !!", response.url);
        

        return response

    } catch (error) {
        fs.unlinkSync(localfilepath),
        console.log("upload cloudinary error",error);

        return null
        
    }
}

export const deleteFromCloudinary = async (publicId: string) => {
    try {
        // Delete the image from Cloudinary
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        console.error("Error deleting image from Cloudinary:", error);
        throw new Error("Error deleting image from Cloudinary");
    }
};

export {uploadtocloudinary}
