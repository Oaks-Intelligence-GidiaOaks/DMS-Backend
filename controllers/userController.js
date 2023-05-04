import User from "../models/userModel.js"
import Enumerator from "../models/enumeratorModel.js"
import catchAsyncErrors from "../middlewares/catchAsyncError.js"
import ErrorHandler from "../utils/errorHandler.js"
import sendToken from "../utils/sendToken.js"

// Create team lead/admin api/v1/register ****
export const createUser = catchAsyncErrors(async (req, res, next) => {

    const {firstName, lastName, email, password, LGA} = req.body
    const user = await User.findOne({email: email});

    if(user){
        return next(new ErrorHandler("User already exists", 409))
    }

    const newUser = await User.create({
        firstName,
        lastName,
        email,
        password,
        LGA,
    })

    sendToken(newUser, 200, res)
})