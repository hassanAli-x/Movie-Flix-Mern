function escapeHtml(s = "") {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

async function sendVerificationCode(email, name, code) {
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: { name: process.env.BREVO_SENDER_NAME || "MovieFlix", email: process.env.BREVO_SENDER_EMAIL },
      to: [{ email, name }],
      subject: `${code} is your MovieFlix verification code`,
      htmlContent: `
        <div style="font-family:Arial,sans-serif;max-width:420px;margin:auto">
          <h2>Verify your email</h2>
          <p>Hi ${escapeHtml(name)}, enter this code to finish creating your account:</p>
          <p style="font-size:32px;letter-spacing:8px;font-weight:bold">${code}</p>
          <p>It expires in 10 minutes. If you didn't sign up, ignore this email.</p>
        </div>`,
      textContent: `Your MovieFlix verification code is ${code}. It expires in 10 minutes.`,
    }),
  });

  if (!res.ok) {
    throw new Error(`Brevo error ${res.status}: ${await res.text()}`);
  }
}

module.exports = sendVerificationCode;