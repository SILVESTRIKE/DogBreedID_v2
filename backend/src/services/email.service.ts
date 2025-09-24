import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendEmail(
  to: string,
  subject: string,
  text: string
): Promise<void> {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: subject,
    text: text,
  };

  try {
    console.log("Gửi email từ:", process.env.EMAIL_USER);
    await transporter.sendMail(mailOptions);
    console.log("Đã gửi mail đến:", to);
  } catch (error) {
    console.error("Lỗi gửi mail:", error);
    throw new Error("Không thể gửi email");
  }
}