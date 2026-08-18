const nodemailer = require("nodemailer");

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT);
const smtpUser = process.env.EMAIL_USER;
const smtpPass = process.env.EMAIL_PASS;

const isConfigured = Boolean(smtpHost && smtpPort && smtpUser && smtpPass);

let transporter = null;

const getTransporter = () => {
  if (!isConfigured) {
    throw new Error("SMTP email configuration is missing. Set SMTP_HOST, SMTP_PORT, EMAIL_USER, and EMAIL_PASS in .env");
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
  }

  return transporter;
};

const sendNotificationEmail = async ({ to, subject, html, replyTo }) => {
  const mailer = getTransporter();
  return mailer.sendMail({
    from: smtpUser,
    to,
    subject,
    html,
    replyTo,
  });
};

module.exports = {
  getTransporter,
  sendNotificationEmail,
  smtpUser,
  isConfigured,
};
