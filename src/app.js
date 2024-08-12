import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"


const app= express()

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
})) // This is a middleware, whenever we use a middleware we mostly use the .use() function.

app.use(express.json({limit:"16kb"})) // Here we limit the download space.
app.use(express.urlencoded({extended: true, limit : "16kb"}))// Here we encode the URL
app.use(express.static("public"))// Sometimes we want to store assets (image, pdf) in the public folder
app.use(cookieParser()) //For operations in cookies in the browser of the user.



export {app}