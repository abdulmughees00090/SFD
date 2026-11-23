// Job application handler.
// Hardening added in the 2026-10 audit: body/shape validation, length caps,
// email validation, origin check, request timeouts, and neutralising
// spreadsheet-formula injection before anything reaches the Google Sheet.
// Field names, status codes and the Sheet/Resend flow are unchanged.

const LIMITS = {
  fullname: 100, email: 254, phone: 40, position: 200, experience: 200, skills: 2000,
  portfolio: 500, education: 500, coverletter: 8000, availability: 200, relocate: 100, source: 200
};
const FIELDS = Object.keys(LIMITS);

function allowedOrigins() {
  const list = new Set(['https://silverfoxdynamics.com', 'https://www.silverfoxdynamics.com']);
  if (process.env.VERCEL_URL) list.add(`https://${process.env.VERCEL_URL}`);
  if (process.env.VERCEL_BRANCH_URL) list.add(`https://${process.env.VERCEL_BRANCH_URL}`);
  if (process.env.VERCEL_ENV === 'development') {
    list.add('http://localhost:3000');
    list.add('http://127.0.0.1:3000');
  }
  return list;
}

function readBody(req) {
  let b = req.body;
  if (typeof b === 'string') {
    try { b = JSON.parse(b); } catch (_) { return null; }
  }
  return b && typeof b === 'object' && !Array.isArray(b) ? b : null;
}

// Returns a trimmed string, '' for absent values, or null if the value is not a string.
function str(v) {
  if (v === undefined || v === null) return '';
  return typeof v === 'string' ? v.trim() : null;
}

// Google Sheets treats a cell starting with = + - @ (or tab/CR) as a formula.
// A leading apostrophe forces plain text and is not displayed in the cell.
function sheetSafe(v) {
  return typeof v === 'string' && /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
}

const oneLine = (v) => v.replace(/[\r\n]+/g, ' ');

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const origin = req.headers.origin;
  if (origin && !allowedOrigins().has(origin)) return res.status(403).json({ error: 'Forbidden' });

  const body = readBody(req);
  if (!body) return res.status(400).json({ error: 'Invalid request' });

  // Spam trap: real users never fill this hidden field
  if (body._honeypot) return res.status(200).json({ ok: true });

  const v = {};
  for (const f of FIELDS) {
    v[f] = str(body[f]);
    if (v[f] === null) return res.status(400).json({ error: 'Invalid request' });
  }

  const { fullname, email, phone, position, experience, skills, portfolio,
          education, coverletter, availability, relocate, source } = v;

  if (!fullname || !email || !phone || !position || !experience || !skills || !coverletter || !availability) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (FIELDS.some((f) => v[f].length > LIMITS[f])) {
    return res.status(400).json({ error: 'Input too long' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }
  if (!process.env.SHEETS_WEBAPP_URL) {
    return res.status(500).json({ error: 'Failed to save application' });
  }

  try {
    // Required: write to Google Sheet — this must succeed for the submission to count
    const sheetResp = await fetch(process.env.SHEETS_WEBAPP_URL, {
      method: 'POST',
      body: JSON.stringify({
        type: 'application',
        fullname: sheetSafe(fullname), email: sheetSafe(email), phone: sheetSafe(phone),
        position: sheetSafe(position), experience: sheetSafe(experience), skills: sheetSafe(skills),
        portfolio: sheetSafe(portfolio), education: sheetSafe(education),
        coverletter: sheetSafe(coverletter), availability: sheetSafe(availability),
        relocate: sheetSafe(relocate), source: sheetSafe(source)
      }),
      signal: AbortSignal.timeout(10000)
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
            subject: `New job application: ${oneLine(fullname)} — ${oneLine(position)}`,
            text: `Name: ${fullname}\nEmail: ${email}\nPhone: ${phone}\nPosition: ${position}\nExperience: ${experience}\nSkills: ${skills}\nPortfolio: ${portfolio || 'N/A'}\nEducation: ${education || 'N/A'}\nAvailability: ${availability}\nRelocate: ${relocate || 'N/A'}\nSource: ${source || 'N/A'}\n\nCover Letter:\n${coverletter}`
          }),
          signal: AbortSignal.timeout(8000)
        });
      } catch (_) { /* best-effort only — data is already safe in the Sheet */ }
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to save application' });
  }
}
