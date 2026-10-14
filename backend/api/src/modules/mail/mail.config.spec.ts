import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { loadMailConfig, mailConfigSummary } from './mail.config.js';

describe('mail.config', () => {
  const env = process.env;

  beforeEach(() => {
    process.env = { ...env };
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;
    delete process.env.SMTP_PASSWORD;
    delete process.env.SMTP_FROM;
    delete process.env.SMTP_FROM_EMAIL;
  });

  afterEach(() => {
    process.env = env;
  });

  it('returns null when incomplete', () => {
    process.env.SMTP_HOST = 'smtp.example.com';
    expect(loadMailConfig()).toBeNull();
  });

  it('loads when all required vars set', () => {
    process.env.SMTP_HOST = 'smtp.example.com';
    process.env.SMTP_USER = 'user@example.com';
    process.env.SMTP_PASS = 'secret';
    process.env.SMTP_FROM_EMAIL = 'JK Balaji <noreply@jkbalaji.com>';
    const cfg = loadMailConfig();
    expect(cfg?.host).toBe('smtp.example.com');
    expect(mailConfigSummary(cfg).configured).toBe(true);
  });

  it('accepts SMTP_PASSWORD alias', () => {
    process.env.SMTP_HOST = 'smtp.example.com';
    process.env.SMTP_USER = 'user@example.com';
    process.env.SMTP_PASSWORD = 'secret';
    process.env.SMTP_FROM = 'noreply@jkbalaji.com';
    expect(loadMailConfig()?.pass).toBe('secret');
  });
});
