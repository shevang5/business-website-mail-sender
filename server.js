import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify transporter on startup to catch auth/network issues early
transporter.verify().then(() => {
  console.log('SMTP transporter is ready');
}).catch((err) => {
  console.error('SMTP transporter verification failed:', err && err.message ? err.message : err);
});

// Route
app.post("/send-email", async (req, res) => {
  const { firstName, lastName, company, email, phoneNumber, message, country } = req.body;

  const mailOptions = {
    from: email,
    to: process.env.EMAIL_USER,
    subject: `New Contact Form Submission from ${firstName} ${lastName}`,
    text: `
Name: ${firstName} ${lastName}
Company: ${company}
Email: ${email}
Phone: ${phoneNumber} (${country})

Message:
${message}
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    // Return additional error information when debugging is enabled
    const responseBody = { message: "Failed to send email." };
    if (process.env.DEBUG === 'true' || process.env.NODE_ENV !== 'production') {
      responseBody.error = error && error.message ? error.message : String(error);
    }
    res.status(500).json(responseBody);
  }
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Default route
app.get("/", (req, res) => {
  res.send("Contact Form Backend is Running 🚀");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
