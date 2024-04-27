const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "live.smtp.mailtrap.io",
  port: 587,
  secure: false, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: "api",
    pass: "3ab2aaeb82eaf02d0477abe63fc6f1b6",
  },
});

// Define the sendEmail function
const sendEmail = async (to, otp) => {
    try {
        // Send email
        const info = await transporter.sendMail({
            from: 'info@demomailtrap.com', // Sender address
            to, // Receiver address
            subject: "Your OTP for password reset", // Email subject
            text: `Your OTP for password reset is: ${otp}`, // Plain text body
            html: `<p>Your OTP for password reset is: <strong>${otp}</strong></p>`, // HTML body
        });

        console.log("Message sent: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
};

// Export the sendEmail function
module.exports = { sendEmail };
