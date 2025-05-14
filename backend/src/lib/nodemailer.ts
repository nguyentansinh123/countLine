import nodemailer from "nodemailer";

export const createTransporter = () => {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  console.log("SMTP_USER:", user); // sanity check
  console.log("SMTP_PASS:", pass);

  return nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    auth: {
      user,
      pass,
    },
    logger: true,
    debug: true,
  });
};
