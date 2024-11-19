import nodemailer from "nodemailer"
import dotenv from "dotenv"
dotenv.config()

const transporter = nodemailer.createTransport({
   
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT as string, 10),
    secure:true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  console.log(process.env.SMTP_HOST);
  console.log(process.env.SMTP_PORT);
  
  
  
  export const sendOTPEmail = async (email: string, otp: string) => {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Verify Your Account - OTP',
      text: `Your OTP code is: ${otp}\nPlease enter this code within 10 minutes to verify your email.`,
      html: `<p>Your OTP code is:${otp} </p>`,
      headers: {
        'X-Priority': '1', // Set high priority
        'X-MSMail-Priority': 'High', // For older clients like Outlook
        'Importance': 'High',
    },
    };
  
    await transporter.sendMail(mailOptions);
  };



  export const sendOTPforgot = async(email: string, otp: string) =>{
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Password Reset OTP',
      text: `Your OTP code is: ${otp}\nPlease enter this code within 10 minutes to verify your email.`,
    };
    
    await transporter.sendMail(mailOptions);
  
  }