import { createTransport } from 'nodemailer';
import config from '../config/env';

const transporter = createTransport({
  host: config.smtpHost,
  port: config.smtpPort,
  secure: false,
  auth: {
    user: config.smtpEmail,
    pass: config.smtpPassword,
  },
});

const sendEmail = async ({
  toEmail,
  subject,
  message,
}: {
  toEmail: string;
  subject: string;
  message: string;
}) => {
  try {
    await transporter.sendMail({
      from: config.smtpEmail,
      to: toEmail,
      subject,
      html: message,
    });
    console.info(`Email sent to ${toEmail} to ${subject}`);
    return true
  } catch (e: any) {
    console.error(`Error sending email: ${e.message}`);
    return false
  }
};

export { sendEmail };
