import mongoose,{Schema} from "mongoose";// This {Schema} is written , so that we don't have to write mongoose.Schema everytime instead we can write Schema directly.
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new Schema(
    {

        username:{
            type: String,
            required: true,
            unique:true,
            lowercase:true,
            trim:true,
            index:true // This field is done inorder to make the field searchable.
        },
        email:{
            type: String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true
        },
        fullName:{
            type: String,
            required:true,
            trim:true,
            index:true
        },
        avatar:{
            type:String, // Cloudinary URL, A cloud like AWS but its free
            required:true
        },
        coverImage:{
            type: String
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password:{
            type:String,
            required:[true,"Password is required"]     
        },
        refreshToken:{
            type:String,
        }
    },{timestamps:true}
)// We have written Schema instead of mongoose.Schema

//We are using this pre plugin to take the password field just before saving and encrypt it.
userSchema.pre("save", async function(next){// These functions takes time, thats why we use async function, and as it is a middleware so we use next as an argument.
    if(!this.isModified("password")) next() // We are using this to ensure that the password doesn't change everytime the user changes any of the characteristics. The password will only be encrypted only if the the password field is set or updated.
    this.password= await bcrypt.hash(this.password,10) // This number given is hash rounds, it gives the number of round to hash.
    next()
})// We are not using arrow function as there is no reference for this(keyword).

// Here we are checking if the password is correct. We are making methods using middlewares.
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}



userSchema.methods.generateAccessToken= function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken= function(){
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


export const User = mongoose.model("User", userSchema)