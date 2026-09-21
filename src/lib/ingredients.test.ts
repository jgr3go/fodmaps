import { describe, expect, it } from 'vitest';
import { parseIngredientText, positionWeight } from './ingredients';

describe('parseIngredientText', () => {
  it('splits, flattens parentheses, strips noise and percentages', () => {
    const list = parseIngredientText('INGREDIENTS: Enriched Flour (Wheat Flour, Niacin, Reduced Iron), Water, Contains 2% or less of: Salt, Garlic Powder*, Natural Flavors. *Added for freshness.');
    expect(list).toEqual(['flour', 'wheat flour', 'niacin', 'reduced iron', 'water', 'salt', 'garlic powder', 'flavors']);
  });
  it('handles semicolons and newlines from a pasted label', () => {
    expect(parseIngredientText('Cultured pasteurized milk and cream; salt\nenzymes')).toEqual(['milk', 'cream', 'salt', 'enzymes']);
  });
  it('weights garlic fully even at the end of a long list', () => {
    expect(positionWeight('garlic powder', 9)).toBe(1);
    expect(positionWeight('salt', 9)).toBe(0.4);
    expect(positionWeight('salt', 1)).toBe(1);
  });
});
