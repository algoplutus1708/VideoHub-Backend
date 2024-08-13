import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"// This library is called File System (Read, write and different operations).

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) =>{
    try{
        if(!localFilePath) return null
        //Upload the file on Cloudinary
        const response = await cloudinary.uploader(localFilePath,{
            resource_type:"auto"
        })
        //File has been uploaded successfully
        console.log("File Uploaded Successfully", response.url);
        return response
    }catch(error){
        fs.unlinkSync(localFilePath) // Remove the locally saved temporary file as the upload operation got failed
        return null
    }
}

export {uploadOnCloudinary}