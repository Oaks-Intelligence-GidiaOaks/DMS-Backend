// Create and send token, save to cookie
import * as dotenv from "dotenv";
import jwt from "jsonwebtoken";

const sendToken = (user) => {
  // Create jwt token
  // const token = user.getJwtToken();

  // const options = {
  //   expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  //   httpOnly: true,
  // };
  const token = jwt.sign({ user: user }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  // res.status(statusCode).cookie("token", token, options).json({
  //   success: true,
  //   user: user,
  //   // token
  // });
  return token;
};

export default sendToken;
