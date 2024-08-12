//require('dotenv').config({path:'./env'})
import dotenv from "dotenv"

import connectDB from "./db/index.js "

dotenv.config({
    path:'./env'
})

connectDB()
















/* In this approach we are doing everything in the index.js file only. This is not done in production
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
