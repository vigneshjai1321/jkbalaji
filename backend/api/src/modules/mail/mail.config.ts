export type MailConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
};

function pickFromAddress(): string {
  const raw =
    process.env.SMTP_FROM_EMAIL?.trim() ||
    process.env.SMTP_FROM?.trim() ||
    process.env.SMTP_USER?.trim() ||
    '';
  return raw;
}

export function loadMailConfig(): MailConfig | null {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim() || process.env.SMTP_PASSWORD?.trim();
  const from = pickFromAddress();
  if (!host || !user || !pass || !from) return null;

  const port = Number(process.env.SMTP_PORT?.trim() || '587');
  const secure =
    process.env.SMTP_SECURE === 'true' || process.env.SMTP_SECURE === '1' || port === 465;

  return { host, port, secure, user, pass, from };
}

/** Safe summary for admin UI / logs — never includes secrets. */
export function mailConfigSummary(cfg: MailConfig | null) {
  if (!cfg) return { configured: false as const };
  const fromMasked = cfg.from.replace(/(.{2}).*(@.*)/, '$1***$2');
  return {
    configured: true as const,
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    from: fromMasked,
    user: cfg.user.replace(/(.{2}).*/, '$1***'),
  };
}
