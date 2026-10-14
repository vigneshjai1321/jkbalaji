import { describe, expect, it } from 'vitest';
import { amountInWordsInr } from './amount-in-words.js';

describe('amountInWordsInr', () => {
  it('formats round rupees', () => {
    expect(amountInWordsInr(10300)).toContain('Rupees Only');
  });
});
