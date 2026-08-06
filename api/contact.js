export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Note: the visible email field on the Contact page is actually named "_replyto"
  const { name, _replyto, phone, service, message, _honeypot } = req.body;
  const email = _replyto;

  if (_honeypot) return res.status(200).json({ ok: true });

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const sheetResp = await fetch(process.env.SHEETS_WEBAPP_URL, {
      method: 'POST',
      body: JSON.stringify({ type: 'contact', name, email, phone, service, message })
    });
    if (!sheetResp.ok) throw new Error('Sheet write failed');

    if (process.env.RESEND_API_KEY && process.env.NOTIFY_EMAIL) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'Silver Fox Dynamics <forms@silverfoxdynamics.com>',
            to: process.env.NOTIFY_EMAIL,
            reply_to: email,
            subject: `New contact form message from ${name}`,
            text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || 'N/A'}\nService: ${service || 'N/A'}\n\nMessage:\n${message}`
          })
        });
      } catch (_) { /* best-effort only — data is already safe in the Sheet */ }
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to send message' });
  }
}
