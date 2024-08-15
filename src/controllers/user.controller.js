import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";


// Basically we are making a method to generate Access and Refresh token.
const generateAccessAndRefreshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken // Here we are adding the refreshToken inside the user database.
        await user.save({ validateBeforeSave: false }) // We are saving these. It is a database operation, so it takes time. Thats why we are using await keyword.

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}


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


    const {fullName, email, username, password}=req.body // In this step we are gathering data from the frontend, if the data is from form or json then we can us req.body(), but if its URL then we have to consider other case which we will discuss later.
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


const loginUser = asyncHandler(async (req, res) =>{
    // Take data from req.body
    // Username or email
    // Find the user
    // Password Check
    // Access and refresh token
    // Send Cookies for jwts

    // Take data from req.body
    const {email, username, password} = req.body
    console.log(email);

    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }
    // Here we are trying to find the user on the basis of its username or email, we want any of them.
    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }
    // Password Check
    // Important thing - We are applying method not on "User"- It is thing thing imported from the module of the model. We will be using "user" which we have taken an instance from req.body
   const isPasswordValid = await user.isPasswordCorrect(password)

   if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials")
    }
    //Generate refresh and access token
   const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken") // This is an optional step
    
    
    //Send Cookies for jwts
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )

})


const logoutUser = asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    }
    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200, {}, "User Logged Out Successfully"))
})

const refreshAccessToken = asyncHandler( async (req,res)=>{

    const incommingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(incommingRefreshToken){
        this new ApiError(401,"unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(incommingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id)
    
        if(!user){
            throw new ApiError(401,"Invalid refresh token")
        }
    
        if(incommingRefreshToken != user?.refreshToken){
            throw new ApiError(401,"Refresh token is expired or used")
        }
        
        // We are generating cookies here
        const options={
            httpOnly: true,
            secure: true
        }
    
        const {accessToken,newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("newRefreshToken",refreshToken,options)
        .json(
            new ApiResponse(
                200,
                {accessToken, newRefreshToken},
                "Access Token Refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid Refresh Token")
    }
})


export {registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}