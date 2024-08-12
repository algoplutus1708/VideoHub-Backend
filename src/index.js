//require('dotenv').config({path:'./env'})
import dotenv from "dotenv" // This is an experimental feature so we have to config the package.json file. we have to config the dev script in package.json file.

import connectDB from "./db/index.js "

dotenv.config({
    path:'./env'
})


// We are connecting to the database in the index.js file. This is a better practice than doing it in the db folder.
connectDB() // Whenever we use async function, it always returns a promise. So, we have to use .then() and .catch()
.then(()=>{
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`Server is running : ${process.env.PORT}`)
    })
})
.catch((error)=>{
    console.log("MongoDB Connection Error",error)

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