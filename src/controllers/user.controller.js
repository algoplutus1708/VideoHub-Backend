import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/apiResponse.js"

const registerUser = asyncHandler(async (req,res)=>{
    // Steps for registering User
    // Get details from frontend
    // Validation - Not Empty
    // Check if user already exists - username and email
    // Check for images - avatar
    // Upload them to cloudinary, avatar
    // Create user object - create entry in database
    // Checking if the the object is not empty
    // Remove password and refresh token from response
    // Check for user creation
    // return res


    const {fullName, email, username, password}=req./* In the provided JavaScript code snippet,
    `req.body` is used to access the data sent in
    the body of the HTTP request. When a client
    sends a POST or PUT request with data, that data
    is typically included in the body of the
    request. */
    body // In this step we are gathering data from the frontend, if the data is from form or json then we can us req.body(), but if its URL then we have to consider other case which we will discuss later.
    // Checking Email - console.log("email:",email)

    // Now we are checking if any field is empty or not
    if(
        [fullName,email,username,password].some((field)=>
        field?.trim()==="")
    ){
            throw new ApiError(400,"All field are required")
    }

    //Checking if user already exits or not
    const existedUser = await User.findOne({
        $or: [{username},{email}]
    })
    if(existedUser){
        throw new ApiError(409,"User already exists")
    }

    // Check for images
    // Multer gives us acces to req.files
    const avatarLocalPath = req.files?.avatar[0]?.path // This [0] means we are taking the first property. Multer gives many property of the file if its .png or .jpg, so we only want its first property.
    
    // In this way of extracting cover, we encounter an error if the user doesn't upload a cover image
    // const coverImageLocalPath = req.files?.coverImage[0]?.path

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage)  && req.files.coverImage.length>0){
        coverImageLocalPath = req.files?.coverImage[0]?.path
    }

    /*console.log("Start")
    console.log(req.files)
    console.log("End")*/

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar not Uploaded")
    }

    // Upload them to cloudinary, avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath) // As uploading takes time so thats why we are using await
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400,"Avatar not Uploaded")
    }

    // Create user object - create entry in database

    const user = await User.create({
        fullName,
        avatar: avatar.url, // In the uploadOnCloudinary() fun we are just returning the response. So we will fetch url from it.
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    // Checking if the the object is not empty
    const createdUser = await User.findById(user._id).select(// Whenever we give entry in MongoDB, it always associates an ID to it and we are checking that only.
        "-password -refreshToken"
    ) // .select() method deletes the given fields (Or unselects the given fields). The -(minus) sign denotes we want to delete the fields.


    // Check for user creation
    if(!createdUser){
        throw new ApiError(500,"User not created")
    }

    // Return response
    return res.status(201).json(
        new ApiResponse(200, createdUser,"User Registered Successfully")
    )


})

export {registerUser}