// Cloudflare Pages Function: POST /api/inquiry
// Emails each inquiry to the coach through Resend (https://resend.com).
//
// Settings (Cloudflare Pages → Settings → Variables and Secrets):
//   RESEND_API_KEY  (secret)  Resend API key
//   INQUIRY_TO                Where inquiries are sent, e.g. ben@example.com
//   INQUIRY_FROM   (optional) Sender, e.g. "Pascoe Performance <inquiries@pascoeperformance.ca>".
//                             Until a domain is verified in Resend, leave unset: Resend's test sender
//                             is used, and it can only deliver to the Resend account's own email.

interface Env {
  RESEND_API_KEY?: string;
  INQUIRY_TO?: string;
  INQUIRY_FROM?: string;
}

const INTERESTS: Record<string, string> = {
  'personal-training': 'Personal Training',
  'group-football': 'Group Football Training',
  'one-on-one-football': 'One-on-One Football Coaching',
  'help-me-choose': 'Help Me Choose',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const clean = (v: FormDataEntryValue | null, max: number) => String(v ?? '').trim().slice(0, max);

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ ok: false, error: 'bad_request' }, 400);
  }

  // Spam trap: real visitors never fill this hidden field. Pretend success so bots move on.
  if (clean(form.get('bot-field'), 200)) return json({ ok: true });

  const name = clean(form.get('name'), 120);
  const email = clean(form.get('email'), 200);
  const interestKey = clean(form.get('interest'), 60);
  const phone = clean(form.get('phone'), 40);
  const goals = clean(form.get('goals'), 4000);
  const page = clean(form.get('page'), 60);

  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !INTERESTS[interestKey]) {
    return json({ ok: false, error: 'invalid' }, 422);
  }
  if (!env.RESEND_API_KEY || !env.INQUIRY_TO) {
    return json({ ok: false, error: 'not_configured' }, 500);
  }

  const interest = INTERESTS[interestKey];
  const rows: [string, string][] = [
    ['Name', name],
    ['Email', email],
    ['Training interest', interest],
    ['Phone', phone || '—'],
    ['Sent from', page ? `${page} page` : 'website'],
  ];

  const html = `
<div style="font-family:Helvetica,Arial,sans-serif;max-width:560px;color:#141a17">
  <div style="border-left:4px solid #006636;padding:4px 0 4px 14px;margin-bottom:18px">
    <div style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#006636;font-weight:700">New website inquiry</div>
    <div style="font-size:20px;font-weight:700;margin-top:4px">${esc(name)} · ${esc(interest)}</div>
  </div>
  <table style="border-collapse:collapse;width:100%;font-size:15px">
    ${rows
      .map(
        ([k, v]) =>
          `<tr><td style="padding:8px 12px 8px 0;color:#5b6660;width:150px;vertical-align:top">${k}</td><td style="padding:8px 0;border-bottom:1px solid #e6ebe8">${esc(v)}</td></tr>`,
      )
      .join('')}
  </table>
  <div style="margin-top:18px;font-size:13px;color:#5b6660;text-transform:uppercase;letter-spacing:.1em;font-weight:700">Training goals</div>
  <div style="margin-top:6px;font-size:15px;line-height:1.55;white-space:pre-wrap">${goals ? esc(goals) : '—'}</div>
  <p style="margin-top:24px;font-size:13px;color:#5b6660">Reply to this email to respond directly to ${esc(name)}.</p>
</div>`;

  const text = [
    `New website inquiry: ${name} · ${interest}`,
    '',
    ...rows.map(([k, v]) => `${k}: ${v}`),
    '',
    'Training goals:',
    goals || '—',
  ].join('\n');

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: env.INQUIRY_FROM || 'Pascoe Performance <onboarding@resend.dev>',
      to: env.INQUIRY_TO.split(',').map((s) => s.trim()).filter(Boolean),
      reply_to: email,
      subject: `New inquiry: ${name} · ${interest}`,
      html,
      text,
    }),
  });

  if (!res.ok) return json({ ok: false, error: 'send_failed' }, 502);
  return json({ ok: true });
};

// Anything other than POST
export const onRequest = () => json({ ok: false, error: 'method_not_allowed' }, 405);
