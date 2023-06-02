import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  // const transporter = nodemailer.createTransport({
  //   host: process.env.SMTP_HOST,
  //   port: process.env.SMTP_PORT,
  //   auth: {
  //     user: process.env.SMTP_USER,
  //     pass: process.env.SMTP_PASSWORD,
  //   },
  // });
  try {
    const transporter = nodemailer.createTransport({
      type: "OAuth2",
      user: process.env.MAIL_USER,
      clientId: process.env.MY_CLIENT_ID,
      clientSecret: process.env.MY_CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
      accessToken: process.env.ACCESS_TOKEN,
    });

    const message = {
      from: process.env.MAIL_USER,
      to: options.email,
      subject: options.subject,
      text: options.message,
    };

    await transporter.sendMail(message);
  } catch (error) {}
};

export default sendEmail;
