// Assign non-FODMAP sensitivity tags to every reference food by rule, so the analysis engine can
// report lift by tag family (allergens, gluten, histamine, caffeine, high-fat, alcohol).
// Hand corrections live in data/tags-overrides.json ({ "<food id>": { add: [], remove: [] } }).
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const foods = JSON.parse(readFileSync('data/fodmap.json', 'utf8')).foods;
const overrides = existsSync('data/tags-overrides.json') ? JSON.parse(readFileSync('data/tags-overrides.json', 'utf8')) : {};

export const TAGS = {
  milk: 'Milk (dairy protein)', egg: 'Egg', peanut: 'Peanut', 'tree-nut': 'Tree nut', soy: 'Soy',
  wheat: 'Wheat', gluten: 'Gluten', fish: 'Fish', shellfish: 'Shellfish', sesame: 'Sesame',
  histamine: 'High histamine', caffeine: 'Caffeine', 'high-fat': 'High fat', alcohol: 'Alcohol',
  spicy: 'Spicy / capsaicin', nightshade: 'Nightshade', 'sugar-alcohol': 'Sugar alcohol', 'artificial-sweetener': 'Artificial sweetener',
};

const R = (re) => (f) => re.test(f.name) || f.aliases.some((a) => re.test(a));
const CAT = (...c) => (f) => c.includes(f.category);
const NOT = (fn) => (f) => !fn(f);
const ALL = (...fns) => (f) => fns.every((fn) => fn(f));
const ANY = (...fns) => (f) => fns.some((fn) => fn(f));

const dairyFree = (f) => /lactose-free|dairy-free|plant|almond milk|oat milk|soy milk|rice milk|coconut milk|cashew milk|hemp milk|macadamia milk|pea milk|quinoa milk|vegan|non-dairy|coconut yogurt|coconut cream/.test(f.name);
const rules = {
  milk: ALL(ANY(CAT('dairy'), R(/\b(milk|cheese|cheddar|mozzarella|parmesan|brie|feta|ricotta|cottage|halloumi|paneer|butter|ghee|cream|yogurt|yoghurt|kefir|whey|casein|custard|ice cream|gelato|condensed|evaporated|buttermilk|quark|mascarpone|gouda|swiss|camembert|blue cheese|havarti|colby|provolone|pecorino|gruyere|cream liqueur|milk chocolate|white chocolate|pizza|lasagna|mac and cheese|alfredo)\b/)), NOT(dairyFree), NOT(R(/\bghee\b/))),
  egg: R(/\b(egg|mayonnaise|mayo|aioli|meringue|custard|hollandaise|quiche|frittata|omelet|carbonara|egg noodle)\b/),
  peanut: R(/\bpeanut|satay\b/),
  'tree-nut': ALL(ANY(R(/\b(almond|cashew|pistachio|walnut|pecan|hazelnut|macadamia|brazil nut|pine nut|chestnut|marzipan|praline|nutella|mixed nuts?)\b/), ALL(CAT('nut-seed'), NOT(R(/seed|peanut|pepita|pumpkin|sunflower|chia|flax|linseed|hemp|sesame|tahini|poppy/)))), NOT(R(/\bcoconut\b/))),
  soy: R(/\b(soy|soya|tofu|tempeh|edamame|miso|natto|shoyu|tamari|teriyaki|hoisin|oyster sauce|yakitori)\b/),
  wheat: ALL(R(/\b(wheat|bread|bun|roll|bagel|pita|naan|tortilla|pasta|spaghetti|penne|macaroni|noodle|couscous|bulgur|semolina|farro|freekeh|spelt|kamut|durum|seitan|gnocchi|dumpling|wonton|croissant|pastry|pie|cake|cookie|biscuit|cracker|pretzel|muffin|pancake|waffle|crumpet|scone|breadcrumb|batter|breaded|pizza|lasagna|ravioli|udon|ramen|cereal|wheat beer|malt|soy sauce|hoisin|gravy)\b/), NOT(R(/gluten-free|rice noodle|rice pasta|corn tortilla|buckwheat|soba|rice cake|rice cracker|corn flake|corn cake|quinoa pasta|chickpea pasta|lentil pasta|oat|tamari|almond flour/))),
  gluten: (f) => rules.wheat(f) || (R(/\b(rye|barley|malt|beer|stout|ale|lager|kvass)\b/)(f) && !R(/gluten-free/)(f)),
  fish: R(/\b(fish|salmon|tuna|cod|haddock|sardine|anchovy|mackerel|trout|tilapia|halibut|snapper|barramundi|herring|kipper|fish sauce|worcestershire|caesar)\b/),
  shellfish: R(/\b(shrimp|prawn|crab|lobster|crayfish|scallop|mussel|clam|oyster|squid|calamari|octopus|shellfish|oyster sauce)\b/),
  sesame: R(/\b(sesame|tahini|hummus|halva|za'?atar|gomashio)\b/),
  histamine: R(/\b(aged|cured|smoked|fermented|pickled|sauerkraut|kimchi|kombucha|kefir|miso|natto|tempeh|soy sauce|tamari|fish sauce|vinegar|wine|champagne|beer|cider|spirits?|sausage|salami|pepperoni|prosciutto|bacon|ham|jerky|deli|canned fish|tuna|sardine|anchovy|mackerel|shellfish|shrimp|prawn|crab|lobster|tomato|ketchup|passata|spinach|eggplant|avocado|banana|citrus|orange|lemon|lime|grapefruit|pineapple|papaya|strawberry|chocolate|cocoa|cacao|parmesan|cheddar|blue cheese|gouda|swiss|camembert|brie|feta|pecorino|gruyere|provolone|yogurt|yeast extract|vegemite|marmite|bouillon|stock cube|walnut|cashew|peanut|leftover)\b/),
  caffeine: R(/\b(coffee|espresso|latte|cappuccino|americano|mocha|cold brew|black tea|green tea|oolong|matcha|chai|yerba mate|guarana|energy drink|cola|coke|pepsi|dark chocolate|cocoa|cacao|kombucha)\b/),
  'high-fat': ANY(R(/\b(fried|deep-fried|chips|fries|crisps|butter|ghee|lard|tallow|cream|ice cream|cheese|cheddar|brie|mascarpone|bacon|sausage|salami|pepperoni|pork belly|ribs|wings|burger|pizza|nut|almond|cashew|walnut|pecan|macadamia|peanut|coconut|avocado|oil|mayonnaise|aioli|alfredo|carbonara|croissant|pastry|donut|doughnut|chocolate|tahini|hummus)\b/), ALL(CAT('nut-seed'), NOT(R(/chia|flax|psyllium/)))),
  alcohol: ALL(ANY(CAT('alcohol'), R(/\b(beer|wine|cider|vodka|gin|rum|whisk(e)?y|bourbon|tequila|brandy|cognac|liqueur|sake|soju|champagne|prosecco|sherry|port|vermouth|cocktail|seltzer|kombucha)\b/)), NOT(R(/non-alcoholic|alcohol-free|0\.0/))),
  spicy: R(/\b(chili|chilli|chile|jalape[nñ]o|habanero|cayenne|sriracha|hot sauce|tabasco|harissa|sambal|gochujang|curry|wasabi|horseradish|pepper flakes|paprika|kimchi|buffalo)\b/),
  nightshade: R(/\b(tomato|passata|ketchup|salsa|marinara|potato|eggplant|aubergine|bell pepper|capsicum|chili|chilli|paprika|cayenne|goji|tomatillo|pimento)\b/),
  'sugar-alcohol': R(/\b(sorbitol|mannitol|xylitol|maltitol|isomalt|erythritol|lactitol|polyol|sugar-free gum|sugar-free mint|sugar-free candy)\b/),
  'artificial-sweetener': R(/\b(sucralose|aspartame|saccharin|acesulfame|diet soda|diet cola|zero sugar|splenda|equal|sweet'?n low)\b/),
};

const out = {};
for (const f of foods) {
  const tags = new Set(Object.keys(rules).filter((t) => rules[t](f)));
  const o = overrides[f.id];
  if (o) { for (const t of o.add ?? []) tags.add(t); for (const t of o.remove ?? []) tags.delete(t); }
  if (tags.size) out[f.id] = [...tags].sort();
}
writeFileSync('data/tags.json', JSON.stringify({ tags: TAGS, foods: out }, null, 2));
const counts = {};
for (const ts of Object.values(out)) for (const t of ts) counts[t] = (counts[t] ?? 0) + 1;
console.log(`tagged ${Object.keys(out).length}/${foods.length} foods`, counts);
