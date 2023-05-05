
// Create and send token, save token to cookie

const sendToken = (user, statusCode, res) => {
    // Create Token
    const token = user.getJwtToken();

    // cookie options
    const options = {
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRES_TIME * 24 * 60 * 60 * 1000),
        httpOnly: true
    }

    // send response
    res.status(statusCode).cookie("token", token, options).json({
        success: true
    })
}

export default sendToken