import nodemailer from "nodemailer";

const sendEmail = async (options) => {
 
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    const message = {
      from: process.env.MAIL_USER,
      to: options.email,
      subject: options.subject,
      text: options.message,
    };

    await transporter.sendMail(message);

  } catch (error) {
    throw new Error(error)
  }
};

export default sendEmail;
