
import connectDB from "./db/index.js "

//require('dotenv').config({path:'./env'})
import dotenv from "dotenv" // This is an experimental feature so we have to config the package.json file. we have to config the 'dev' script in package.json file.
dotenv.config({  //5th and 6th line are important for configuring dotenv using module type.
    path:'./env'
})

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server is running at port:${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("MongoDB connection failed",err)
})














/* In this approach we are doing everything in the index.js file only. This is not done in production
import mongoose from "mongoose"
import {DB_NAME} from "./constants.js"
import express from "express"
const app = express()
( async()=>{
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error",(error)=>{
            console.error("Mongoose connection error:", error);
            throw error
        })
        app.listen(process.env.PORT,()=>{
            console.log(`Server is running on port ${process.env.PORT}`)
        })
    } catch(error){
        console.error("Error",error);
        throw TypeError
    }
})
*/
