import { describe, expect, it } from 'vitest';
import { businessScopeForRole, isPathAllowedForScope } from './role-scope';

describe('manager path scope', () => {
  it('real estate manager can reach commissions but not billing', () => {
    expect(isPathAllowedForScope('/commissions', 'real-estate')).toBe(true);
    expect(isPathAllowedForScope('/billing', 'real-estate')).toBe(false);
    expect(isPathAllowedForScope('/gold-rates', 'real-estate')).toBe(false);
  });

  it('gold manager can reach billing but not brokers', () => {
    expect(isPathAllowedForScope('/billing', 'jewellery')).toBe(true);
    expect(isPathAllowedForScope('/brokers', 'jewellery')).toBe(false);
    expect(isPathAllowedForScope('/commissions', 'jewellery')).toBe(false);
  });

  it('managers cannot open user admin', () => {
    expect(isPathAllowedForScope('/users', 'real-estate')).toBe(false);
    expect(isPathAllowedForScope('/users', 'jewellery')).toBe(false);
  });

  it('scopes roles', () => {
    expect(businessScopeForRole('REAL_ESTATE_MANAGER')).toBe('real-estate');
    expect(businessScopeForRole('GOLD_MANAGER')).toBe('jewellery');
    expect(businessScopeForRole('SUPER_ADMIN')).toBe('all');
  });
});
