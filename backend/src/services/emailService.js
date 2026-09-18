const { transporter } = require('../config/mail');

async function sendEmail({ to, subject, html }) {
  if (!to) return;

  if (!transporter) {
    console.log(`[EMAIL DEMO] to=${to} subject=${subject}`);
    return;
  }

  await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.MAIL_USER,
    to,
    subject,
    html
  });
}

module.exports = { sendEmail };
