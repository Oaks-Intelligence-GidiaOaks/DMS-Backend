// Create and send token, save to cookie

const sendToken = (user, statusCode, res) => {
  // Create jwt token
  const token = user.getJwtToken();

  const options = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    user: user,
    // token
  });
};

export default sendToken;
