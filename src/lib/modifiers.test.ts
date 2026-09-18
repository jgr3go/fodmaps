import { describe, expect, it } from 'vitest';
import { applyModifiers, decompose } from './modifiers';

describe('modifiers', () => {
  it('strips brand and lactose-free from cream cheese', () => {
    const d = decompose('Lactaid cream cheese');
    expect(d.base).toBe('cream cheese');
    expect(d.modifiers.map((m) => m.key)).toEqual(['lactose-free']);
    expect(applyModifiers({ fructans: null, gos: null, lactose: 'high', fructose: null, polyols: null }, d.modifiers).lactose).toBe('low');
  });
  it('steps fructans down for gluten-free bread and drops wheat tags', () => {
    const d = decompose('gluten-free bread');
    expect(d.base).toBe('bread');
    expect(applyModifiers({ fructans: 'high', gos: null, lactose: null, fructose: null, polyols: null }, d.modifiers).fructans).toBe('moderate');
    expect(d.modifiers[0].removeTags).toContain('wheat');
  });
  it('leaves plain names alone', () => {
    const d = decompose('banana');
    expect(d.changed).toBe(false); expect(d.modifiers).toHaveLength(0);
  });
  it('stacks canned + rinsed once', () => {
    const d = decompose('canned chickpeas, rinsed');
    expect(d.base).toBe('chickpeas');
    expect(d.modifiers.map((m) => m.key)).toEqual(['canned']);
  });
});
