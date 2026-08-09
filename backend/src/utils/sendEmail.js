const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendVerificationEmail(to, token) {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  await resend.emails.send({
    from: "onboarding@resend.dev",
    to,
    subject: "Verify your MovieFlix account",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Welcome to MovieFlix</h2>
        <p>Click the button below to verify your email address and activate your account.</p>
        <a href="${verifyUrl}" style="display:inline-block; background:#dc2626; color:#fff; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:600;">
          Verify Email
        </a>
        <p style="color:#666; font-size:13px; margin-top:24px;">
          This link expires in 1 hour. If you didn't create this account, you can ignore this email.
        </p>
      </div>
    `,
  });
}

module.exports = sendVerificationEmail;