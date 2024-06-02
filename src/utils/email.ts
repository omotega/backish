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
      to:toEmail,
      subject,
      html: message,
    });
    console.info(`Email sent to ${toEmail} to ${subject}`);
  } catch (e: any) {
    // console.log(e);
    console.error(`Error sending email: ${e.message}`);
    return false;
  }
};

// // send mail with defined transport object
// let info = await transporter.sendMail({
//   from: 'tomoyibo@gmail.com',
//   to: 'onarogheneomoyibo@gmail.com',
//   subject: 'Hello ✔',
//   text: 'Hello tega , This is an SMTP message with customizations',
// });

// console.log('Message sent: %s', info.messageId);

export default sendEmail 