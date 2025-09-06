import nodemailer from "nodemailer"
import crypto from "crypto"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

export function getVerificationExpiry(): Date {
  const expiry = new Date()
  expiry.setHours(expiry.getHours() + 24) // 24 hours
  return expiry
}

export async function sendVerificationEmail(email: string, name: string, token: string): Promise<void> {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/verify?token=${token}`
  
  const mailOptions = {
    from: process.env.SMTP_FROM || "noreply@journalapp.com",
    to: email,
    subject: "Verify your Journal App account",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to Journal App!</h2>
        <p>Hi ${name},</p>
        <p>Thank you for signing up! Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
        <p style="color: #666; font-size: 14px;">
          This link will expire in 24 hours. If you didn't create an account, please ignore this email.
        </p>
      </div>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
  } catch (error) {
    console.error("Email sending failed:", error)
    throw new Error("Failed to send verification email")
  }
}

export async function sendPasswordResetEmail(email: string, name: string, token: string): Promise<void> {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/reset-password?token=${token}`
  
  const mailOptions = {
    from: process.env.SMTP_FROM || "noreply@journalapp.com",
    to: email,
    subject: "Reset your Journal App password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>Hi ${name},</p>
        <p>You requested to reset your password. Click the button below to create a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${resetUrl}</p>
        <p style="color: #666; font-size: 14px;">
          This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
        </p>
      </div>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
  } catch (error) {
    console.error("Email sending failed:", error)
    throw new Error("Failed to send password reset email")
  }
}
