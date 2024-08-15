import {Router} from "express"
import { registerUser, loginUser, logoutUser, refreshAccessToken } from "../controllers/user.controller.js"
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router()

router.route("/register").post( // We are injecting middleware in it.
    upload.fields([
        {
            name:"avatar", // This names should be same in frontend also, this communication should be there.
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser
) // The url will be https://localhost:8000/api/v1/users/register

router.route("/login").post(loginUser)

//secured routes
router.route("/logout").post(verifyJWT,  logoutUser)
router.route("/refresh-token").post(refreshAccessToken)

export default router