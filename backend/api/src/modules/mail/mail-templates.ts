const BRAND = 'JK Balaji';
const FOOTER = 'Jamavisa Enterprises · JK Balaji Enterprise ERP';

function layout(opts: { title: string; preheader: string; bodyHtml: string }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(opts.title)}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(opts.preheader)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f1f5f9;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="background:linear-gradient(135deg,#064e3b 0%,#047857 100%);padding:28px 32px;text-align:center;">
              <p style="margin:0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#a7f3d0;">Enterprise Admin</p>
              <h1 style="margin:8px 0 0;font-size:22px;font-weight:600;color:#ffffff;letter-spacing:0.04em;">${escapeHtml(BRAND)}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 32px 24px;font-size:15px;line-height:1.65;">
              ${opts.bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 28px;border-top:1px solid #e2e8f0;background:#f8fafc;font-size:12px;line-height:1.5;color:#64748b;text-align:center;">
              <p style="margin:0 0 6px;">${escapeHtml(FOOTER)}</p>
              <p style="margin:0;">This is an automated message. Do not reply with passwords or sensitive data.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function adminTestEmailHtml() {
  const body = `
    <p style="margin:0 0 16px;">Hello,</p>
    <p style="margin:0 0 16px;">This is a <strong>configuration test</strong> from the JK Balaji admin email service. If you received this message, SMTP settings are working correctly.</p>
    <p style="margin:0 0 16px;padding:14px 16px;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:8px;color:#065f46;font-size:14px;">
      No passwords or access tokens are included in this email.
    </p>
    <p style="margin:0;color:#64748b;font-size:13px;">Sent at ${escapeHtml(new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }))} (IST).</p>`;
  return layout({
    title: 'JK Balaji — Email test',
    preheader: 'SMTP configuration test for JK Balaji admin',
    bodyHtml: body,
  });
}

export function adminNotificationHtml(opts: { heading: string; message: string; detailLines?: string[] }) {
  const details =
    opts.detailLines?.length ?
      `<ul style="margin:16px 0 0;padding-left:20px;color:#334155;">${opts.detailLines.map((l) => `<li style="margin-bottom:6px;">${escapeHtml(l)}</li>`).join('')}</ul>`
    : '';
  const body = `
    <h2 style="margin:0 0 12px;font-size:18px;font-weight:600;color:#064e3b;">${escapeHtml(opts.heading)}</h2>
    <p style="margin:0 0 8px;">${escapeHtml(opts.message)}</p>
    ${details}`;
  return layout({
    title: opts.heading,
    preheader: opts.message.slice(0, 120),
    bodyHtml: body,
  });
}

export function adminTestEmailText() {
  return `JK Balaji — Email configuration test\n\nIf you received this message, SMTP is configured correctly.\nNo passwords are included.\n\n${FOOTER}`;
}

export function adminNotificationText(opts: { heading: string; message: string; detailLines?: string[] }) {
  const lines = opts.detailLines?.length ? `\n\n${opts.detailLines.map((l) => `- ${l}`).join('\n')}` : '';
  return `${opts.heading}\n\n${opts.message}${lines}\n\n${FOOTER}`;
}
