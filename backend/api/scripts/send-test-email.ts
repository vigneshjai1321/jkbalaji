/**
 * Send SMTP test email using backend/api/.env (never logs secrets).
 * Usage: npm run mail:test -- tmlcheyyar@gmail.com
 */
import { config } from 'dotenv';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import nodemailer from 'nodemailer';
import { loadMailConfig } from '../src/modules/mail/mail.config.js';
import { adminTestEmailHtml, adminTestEmailText } from '../src/modules/mail/mail-templates.js';

const __dir = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dir, '../.env') });

const to = (process.argv[2] || 'tmlcheyyar@gmail.com').trim().toLowerCase();
const cfg = loadMailConfig();

async function main() {
  if (!cfg) {
    console.error('FAILED: SMTP not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS (or SMTP_PASSWORD), SMTP_FROM or SMTP_FROM_EMAIL in backend/api/.env');
    process.exit(1);
  }
  const transport = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: { user: cfg.user, pass: cfg.pass },
  });
  await transport.verify();
  const info = await transport.sendMail({
    from: cfg.from,
    to,
    subject: 'JK Balaji — Admin email configuration test',
    html: adminTestEmailHtml(),
    text: adminTestEmailText(),
  });
  console.log('OK: messageId=', info.messageId, 'accepted=', info.accepted?.join(', '));
}

main().catch((e) => {
  console.error('FAILED:', e instanceof Error ? e.message : e);
  process.exit(1);
});
