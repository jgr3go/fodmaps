# Open datasets and structured community FODMAP data: evaluation notes

Accessed 2026-09-17. Companion to `open-datasets.json` (same directory), which holds the machine-readable dataset table, ingredient keywords and food ratings.

## Headline

There is no openly licensed, primary-source FODMAP dataset anywhere public. Every GitHub/Kaggle/HF artifact that has ratings is second- or third-hand Monash app data, either unlicensed or under a license that does not cure the upstream problem. The only lab-tested data that is independent of Monash and publicly distributed is FODMAP Friendly's 2021 checklist PDF (about 95 foods, copyright but published for consumers). Open Food Facts has essentially no FODMAP tagging but is the right ingredient-list source for packaged foods.

Approach taken: ratings in the JSON were recorded where two or more independent public sources agree; disagreements are written into the `notes` field; untested or ingredient-dependent items carry `null` and are meant to be handled by ingredient-keyword flagging.

## GitHub datasets

| Repo | License | Provenance verdict | Records | Use |
|---|---|---|---|---|
| [ts-sz/fodmap-data](https://github.com/ts-sz/fodmap-data) | MIT (code + structure); README says data "originates from Monash" | Weekly extract of gut-check; gut-check research log cites Monash app, Gourmend, A Little Bit Yummy, The IBS Dietitian per row | 296 (16 alcohol, 23 beverage, 38 condiment) | Cross-check + portion thresholds. Errors spotted: rum "low", beer "moderate" |
| [gut-check/gut-check.github.io](https://github.com/gut-check/gut-check.github.io) | MIT in README, no LICENSE file | Same as above; `FODMAP_RESEARCH.md` is a usable portion-threshold log | 296 | Cross-check |
| [oseparovic/fodmap_list](https://github.com/oseparovic/fodmap_list) | None | Compiled from 10 public clinical handouts (ibsdiets.org, Kate Scarlata, Stanford, IBS Group, etc.); binary low/high plus 0/1/2 per group | 429 (34 drinks, 23 sweeteners, 28 condiments) | Cross-check only; no redistribution. HFCS mis-grouped as oligos |
| [scottenock/fodmap-foss](https://github.com/scottenock/fodmap-foss) | GPL-3.0 | Verbatim oseparovic schema and rows, relicensed | 429 | Duplicate |
| [GoodPigeon/FODMAP](https://github.com/GoodPigeon/FODMAP) | None | Norwegian translation of oseparovic | 429 | Duplicate |
| [fodmap-diet/basket](https://github.com/fodmap-diet/basket) | MIT | Community PRs; sources requested in PR template but not stored | 270 (38 drinks, 35 condiments) | Cross-check; some dubious rows (amaranth flour high, almond meal high) |
| [kwpav/fodsearch-api](https://github.com/kwpav/fodsearch-api) | MIT | Hand-compiled CSV, no citations; "moderate" appears to mean "has a serving limit" | 128 | Cross-check |
| [gautham50050/Fodmap-scanner](https://github.com/gautham50050/Fodmap-scanner) | MIT | Ingredient-substring table (230 rows) with group and weight, written for parsing OFF/USDA ingredient strings; header cites Monash categories + composition DBs | 230 | Most useful artifact for this app. Directly informed `ingredientKeywords`. Also has an OFF client |
| [nathaliatg/safe](https://github.com/nathaliatg/safe) | None | Hand-written plain-language notes with portions | 106 | Notes for condiments/drinks; no redistribution |
| [melaniehuang/fodmap-web](https://github.com/melaniehuang/fodmap-web) (+ [hugomd/fodmap-react](https://github.com/hugomd/fodmap-react) MIT copy) | GPL-3.0 | 2016 list mirroring Monash app categories; good alias arrays | 243 | Alias mining, cross-check |
| [ensadi/FOODS](https://github.com/ensadi/FOODS) | MIT | Flat Eat/Avoid list, US names | 235 | Alias cross-check |
| [jade-hernandez/guide-monf](https://github.com/jade-hernandez/guide-monf) | None; its own `docs/dataset-provenance.md` says license and provenance are unresolved | 104 French rows stamped "Monash University 2024" with no acquisition record | 104 | Excluded. Worth reading as a model of honest provenance auditing |
| jvnn/fodmap-guide, zarhaselene/fodmap-recipe, timbenniks/fodmap-listr, sergiorua/alexa-fodmap | None / GPL | Small, old or binary lists | 74-243 | Skimmed only |
| [IBPA/FODMAPsAndGutMicrobiome](https://github.com/IBPA/FODMAPsAndGutMicrobiome) | CC0 | Microbiome meta-analysis, not food ratings | n/a | Not relevant |
| [arran4/awesome-fodmap-resources](https://github.com/arran4/awesome-fodmap-resources) | MIT | Link index | n/a | Directory of blogs/apps by country |

GitHub repo search (`q=fodmap`) returned 323 repos; the ones above are every repo with a data file. Code search requires auth and was not run.

## Kaggle and Hugging Face

No FODMAP dataset on either. Hugging Face hosts `openfoodfacts/product-database` (ODbL), the full OFF dump, which is the only adjacent asset.

## FODMAP Friendly

- Checklist PDF (July 2021, copyright Fodmap Pty Ltd): about 95 foods with per-category serves (grains 1/2 cup cooked, breads/cereals 30 g, vegetables 75 g, fruit 150 g, milk 250 ml, cheese 40 g, yoghurt 200 g, nuts 30 g, tea 250 ml; golden syrup 1 tsp; canned chickpeas 40 g; canned lentils 50 g; firm tofu 150 g). Notable independent calls: Greek yoghurt low at 200 g (Monash-derived lists give a tiny serve), chamomile tea listed low (Monash-derived lists say high), soy protein milk low.
- Certified products list (`/products/`) and the WordPress REST API (`/wp-json/`) are behind a Cloudflare managed challenge; every fetcher used got 403. No public API exists and the data is proprietary. Recommendation: deep-link users to the site rather than ingest.
- CDHF describes the program as PASS/FAIL against thresholds with "percentage of FODMAPs" and max serve shown in the app; thresholds themselves are not published on the pages reached.

## Open Food Facts API notes

Base: `https://world.openfoodfacts.org`. Docs: https://openfoodfacts.github.io/openfoodfacts-server/api/. License ODbL 1.0 (data), DbCL (contents), CC BY-SA (images): attribution required, and a database that merges OFF data must be shared alike. Send a `User-Agent: AppName/Version (contact)` header.

Endpoints used:

- Product by barcode: `GET /api/v2/product/{barcode}?fields=code,product_name,brands,ingredients_text,ingredients,ingredients_tags,additives_tags,ingredients_analysis_tags,allergens_tags,traces_tags,labels_tags,categories_tags,nova_group,serving_size,nutriments` (v3 is `/api/v3/product/{barcode}`; same fields).
- Search: `GET /api/v2/search?ingredients_tags=en:inulin&fields=code,product_name&page_size=20` (also `additives_tags=`, `labels_tags=`, `categories_tags=`). Full-text search is a separate service (search.openfoodfacts.org).
- Taxonomy lookup: `GET /api/v2/taxonomy?tagtype=ingredients&tags=en:inulin,en:onion-powder&fields=name,synonyms,parents,children` and `tagtype=additives&tags=en:e420,...`.

Product response shape (verified on Coca-Cola 5449000000996):

- `ingredients_text`: raw label string in the product's language.
- `ingredients[]`: parsed tree, each `{id: "en:carbonated-water", text: "Agua carbonatada", percent_estimate: 83.4, is_in_taxonomy: 1, vegan, vegetarian, ciqual_food_code, ingredients: [...] }` (nested sub-ingredients possible).
- `ingredients_tags[]`: flattened canonical ids including parents, e.g. `["en:sugar","en:disaccharide","en:added-sugar","en:e150d","en:caffeine"]`. This is the field to match keywords against, because synonyms and languages are already normalized (e.g. `en:onion-powder` synonyms: granulated onion, dried minced onion; `en:high-fructose-corn-syrup` synonyms: isoglucose, HCFS; parent `en:glucose-fructose-syrup`).
- `additives_tags[]`: E-numbers, e.g. `["en:e150d","en:e338"]`; polyols appear as `en:e420` (sorbitol), `en:e421` (mannitol), `en:e953` (isomalt), `en:e965` (maltitol), `en:e966` (lactitol), `en:e967` (xylitol), `en:e968` (erythritol), `en:e1200` (polydextrose), `en:e960` (steviol glycosides), `en:e955` (sucralose).
- `labels_tags[]`, `categories_tags[]`, `allergens_tags[]` (`en:milk`, `en:gluten` are useful proxies for lactose/wheat), `nova_group`, `serving_size`, `nutriments` (per 100 g and per serving; `sugars_100g`, `fiber_100g`, `polyols_100g` exists when declared).

FODMAP coverage: `labels_tags` `en:low-fodmap` returns 5 products, `en:monash-university-low-fodmap-certified` 4. Effectively none. Ingredient-level counts (2026-09-17): `en:e420` 21,048 products; `en:high-fructose-corn-syrup` 26,623; `en:garlic-powder` 4,821; `en:e421` 1,656. Taxonomy gaps: `en:sorbitol`, `en:isomalt`, `en:maltitol`, `en:erythritol`, `en:polydextrose`, `en:fructo-oligosaccharides`, `en:milk-solids` return no name/synonyms as *ingredients* (they resolve as *additives* instead), so keyword matching should check both `ingredients_tags` and `additives_tags`, and fall back to `ingredients_text` regex for unparsed strings.

Rate limits: docs say 100 product reads/min and 10 searches/min per IP; in practice several search calls spaced 6 s apart returned an HTML "busy" page instead of JSON. Cache aggressively and treat non-JSON as retry-later. `/labels.json` moved to `/facets/labels.json` (301).

## Other sources

- Spoonful "Top 45 FODMAP ingredients in packaged foods" (from 600k+ scanned labels): ranked list that set keyword priorities. App data is proprietary; Spoonful's product pages are indexable but scraping them would be a ToS problem.
- Monash label-reading blog: the rules used for keyword flagging. Onion, garlic, inulin, FOS, GOS: avoid regardless of position. Polyols (E420, 421, 953, 965, 966, 967) and excess-fructose sweeteners: position/quantity dependent. Lactose: milk, yogurt, cream, ice cream, milk powders, milk solids.
- Wikipedia FODMAP / Low-FODMAP diet (CC BY-SA 4.0): group-level lists only.
- Dietitian blogs (A Little Bit Yummy, The IBS Dietitian, FODMAP Everyday, Keren Reiser, fodzyme, Gourmend, wholeisticliving, Casa de Sante, CDHF, InnerBuddies): the only public serving-level data for alcohol, teas, plant milks, sweeteners, condiments. All second-hand Monash/FODMAP Friendly.
- Fody Foods grocery list is a gated PDF (page text has no foods); Casa de Sante soft-drink post gave serving numbers.
- Reddit r/FODMAPS wiki: 403 to all fetchers; not reviewed.
- "Monash FODMAP rip-off" Google Sheet: verbatim Monash copy, export returns 400; deliberately not used.
- Fodmapedia: freemium app, no API.

## Category-specific findings

Alcohol: consensus low at standard serves for beer (375 ml), dry/sparkling wine (150 ml), vodka, gin, whiskey, brandy, tequila (30 ml), junmai sake (85 ml). Consensus high: rum, port, sweet sherry, ice wine, marsala, dessert wines, cider/perry (inferred from apple/pear, formally untested). Untested and flagged null: wheat beer, stout, non-alcoholic beer, hard seltzer, cream and fruit liqueurs, premixed drinks, soju, mulled wine. Mixers: club soda, lemon/lime juice, tomato juice, cane-sugar cola, diet tonic/ginger ale low; HFCS sodas, apple/pear/mango juice high.

Beverages: kombucha is portion-dependent (180 ml low, 250 ml high). Tea strength matters (weak black/chai low, strong moderate; oolong, chamomile, fennel, strong dandelion high). Oat milk is the surprise (30 ml low, 125 ml high in Monash-derived data; FODMAP Friendly certifies some brands). Soy milk depends on whole bean vs soy protein.

Sweeteners: the "1 teaspoon rule" recurs: honey, agave, molasses, golden syrup, coconut sugar, barley malt syrup are low at about 1 tsp and high at 1 tbsp. All polyols except erythritol are high; erythritol, glycerol, allulose, polydextrose untested.

Disagreements to keep in mind: Greek yogurt (FF 200 g low vs Monash-derived tiny serve), chamomile (FF low vs Monash-derived high), molasses (1 tsp vs 1 tbsp), rum and beer (ts-sz outliers), kombucha (blanket high in older lists), edamame, coconut water, tahini, relish.
