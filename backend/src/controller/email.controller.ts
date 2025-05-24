import { Request, Response } from 'express';
import { transporter } from '../lib/nodemailer';

export const sendEmail = async (req: Request, res: Response): Promise<void> => {
  const { to, subject, text } = req.body;
  if (!to || !subject || !text) {
    res.status(400).json({ success: false, message: 'to, subject and text are required' });
    return;
  }
  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject,
      text,
    });
    res.status(200).json({ success: true, message: 'Email sent' });
  } catch (err) {
    console.error('sendEmail error:', err);
    res.status(500).json({ success: false, message: 'Failed to send email' });
  }
};