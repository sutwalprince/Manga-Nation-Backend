import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async function (localFilePath) {
  try {
    if (!localFilePath) return null;

    const uploadResult = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    console.log("File uploaded on cloudinary ", uploadResult.url);
    fs.unlinkSync(localFilePath);
    return uploadResult;
    
  } catch (error) {
    console.log("error on cloudinary")
    fs.unlinkSync(localFilePath);
    return null;
  }
};

const deleteFromCloudinary =async (publicId)=>{
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    console.log("deleted from cloudinary , publicid = " + publicId)
  } catch (error) {
    console.log("error deleting from cloudinary " , error )
    return null
  }
}

export { uploadOnCloudinary , deleteFromCloudinary };
