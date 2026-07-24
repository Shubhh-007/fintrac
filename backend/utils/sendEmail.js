const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, name, otp, title, message }) => {
  let user = process.env.EMAIL_USER;
  let pass = process.env.EMAIL_PASS;
  let host = process.env.EMAIL_HOST || 'smtp.gmail.com';
  let port = parseInt(process.env.EMAIL_PORT || '587');
  let secure = process.env.EMAIL_SECURE === 'true';

  if (!user || !pass) {
    try {
      const testAccount = await nodemailer.createTestAccount();
      user = testAccount.user;
      pass = testAccount.pass;
      host = 'smtp.ethereal.email';
      port = 587;
      secure = false;
      console.log('Using Ethereal Test Account for Email:', user);
    } catch (testAccErr) {
      console.warn('Could not create Ethereal test account. OTP for', to, 'is:', otp);
      return;
    }
  }

  // Configure SMTP transporter with timeouts
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 8000
  });

  // HTML template matching the application style
  const htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        background-color: #f8fafc;
        color: #0f172a;
        margin: 0;
        padding: 0;
        -webkit-font-smoothing: antialiased;
      }
      .wrapper {
        width: 100%;
        background-color: #f8fafc;
        padding: 30px 15px;
        box-sizing: border-box;
      }
      .container {
        max-width: 500px;
        margin: 0 auto;
        background: #ffffff;
        border-radius: 16px;
        padding: 36px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.05);
      }
      .logo {
        display: flex;
        align-items: center;
        margin-bottom: 24px;
      }
      .logo-icon {
        width: 32px;
        height: 32px;
        background: linear-gradient(135deg, #10b981, #3b82f6);
        border-radius: 8px;
        display: inline-block;
      }
      .logo-text {
        font-size: 18px;
        font-weight: 700;
        color: #0f172a;
        margin-left: 10px;
        line-height: 32px;
        font-family: inherit;
      }
      .title {
        font-size: 20px;
        font-weight: 700;
        color: #0f172a;
        margin-top: 0;
        margin-bottom: 16px;
      }
      .greeting {
        font-size: 15px;
        font-weight: 500;
        margin-bottom: 12px;
        color: #334155;
      }
      .message {
        font-size: 14.5px;
        line-height: 1.6;
        color: #475569;
        margin-bottom: 24px;
      }
      .otp-container {
        text-align: center;
        margin: 28px 0;
      }
      .otp-code {
        font-size: 32px;
        font-weight: 700;
        letter-spacing: 6px;
        color: #10b981;
        background: #f0fdf4;
        padding: 14px 28px;
        border-radius: 12px;
        display: inline-block;
        border: 1px dashed #a7f3d0;
      }
      .expiry {
        font-size: 12.5px;
        color: #64748b;
        text-align: center;
        margin-bottom: 24px;
      }
      .ignore-text {
        font-size: 13px;
        color: #94a3b8;
        margin-top: 20px;
        border-top: 1px solid #f1f5f9;
        padding-top: 16px;
      }
      .footer {
        font-size: 11.5px;
        color: #94a3b8;
        margin-top: 28px;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="container">
        <div class="logo">
          <span class="logo-text">Fintrac Family Expense Tracker</span>
        </div>
        <div class="title">${title}</div>
        <p class="greeting">Hi ${name || 'there'},</p>
        <p class="message">${message}</p>
        <div class="otp-container">
          <div class="otp-code">${otp}</div>
        </div>
        <p class="expiry">This OTP is valid for <strong>5 minutes</strong>. For security, please do not share this code.</p>
        <p class="ignore-text">If you did not request this verification, please ignore this email or contact support if you have concerns.</p>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Fintrac. All rights reserved.
        </div>
      </div>
    </div>
  </body>
  </html>
  `;

  // If using Brevo, use their HTTP API to bypass SMTP/IP blocking completely!
  if (host.includes('brevo') || host.includes('sendinblue')) {
    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': pass, // Brevo SMTP pass is the same as the API key
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          sender: { email: process.env.EMAIL_FROM || user, name: "Fintrac" },
          to: [{ email: to }],
          subject: subject,
          htmlContent: htmlContent
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Brevo API Error: ${response.status} ${errText}`);
      }
      return; // Success!
    } catch (err) {
      console.error('Brevo API Mail delivery failed:', err.message);
      console.log(`[OTP FALLBACK FOR ${to}]: ${otp}`);
      return;
    }
  }

  // Fallback for regular SMTP (Ethereal / Gmail / etc)
  const mailOptions = {
    from: `"Fintrac" <${process.env.EMAIL_FROM || user}>`,
    to,
    subject,
    html: htmlContent
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    if (host.includes('ethereal')) {
      console.log('Ethereal Email Preview URL:', nodemailer.getTestMessageUrl(info));
    }
  } catch (err) {
    console.error('Mail delivery failed:', err.message);
    console.log(`[OTP FALLBACK FOR ${to}]: ${otp}`);
    // Do not re-throw error so registration flow can continue to OTP screen!
  }
};

module.exports = sendEmail;
