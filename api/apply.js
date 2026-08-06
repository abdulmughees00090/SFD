export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const {
    fullname, email, phone, position, experience, skills, portfolio,
    education, coverletter, availability, relocate, source, _honeypot
  } = req.body;

  // Spam trap: real users never fill this hidden field
  if (_honeypot) return res.status(200).json({ ok: true });

  if (!fullname || !email || !phone || !position || !experience || !skills || !coverletter || !availability) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Required: write to Google Sheet — this must succeed for the submission to count
    const sheetResp = await fetch(process.env.SHEETS_WEBAPP_URL, {
      method: 'POST',
      body: JSON.stringify({
        type: 'application', fullname, email, phone, position, experience,
        skills, portfolio, education, coverletter, availability, relocate, source
      })
    });
    if (!sheetResp.ok) throw new Error('Sheet write failed');

    // Optional: email notification via Resend, only if configured. Never blocks success.
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
            subject: `New job application: ${fullname} — ${position}`,
            text: `Name: ${fullname}\nEmail: ${email}\nPhone: ${phone}\nPosition: ${position}\nExperience: ${experience}\nSkills: ${skills}\nPortfolio: ${portfolio || 'N/A'}\nEducation: ${education || 'N/A'}\nAvailability: ${availability}\nRelocate: ${relocate || 'N/A'}\nSource: ${source || 'N/A'}\n\nCover Letter:\n${coverletter}`
          })
        });
      } catch (_) { /* best-effort only — data is already safe in the Sheet */ }
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to save application' });
  }
}
