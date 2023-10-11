import sgMail from "@sendgrid/mail";
import config from "../config/env";

sgMail.setApiKey(config.sendgrigApiKey);

const msg: any = {
  from: `Backish <${config.sendgridEmail}>`,
  mail_settings: { sandbox_mode: { enable: false } },
};

() => {
  msg.mail_settings.sandbox_mode.enable = true;
};

const sendEmail = async ({
  email,
  subject,
  message,
}: {
  email: string;
  subject: string;
  message: string;
}) => {
  try {
    msg.to = email;
    msg.subject = subject;
    msg.text = message;
    await sgMail.send(msg);
    console.log("message sent...");
  } catch (err) {
    return err;
  }
};

export default sendEmail;
