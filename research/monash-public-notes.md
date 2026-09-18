# monash-public research notes (accessed 2026-09-17)

Companion to `monash-public.json` (367 foods) and `monash-cutoffs.md`.

## Method

- Web searches restricted to `monashfodmap.com/blog` plus Monash's public about-FODMAP pages, both Wikipedia pages, and open-access papers that cite Varney 2017 for cut-off values.
- Each page was fetched and summarised by an extraction model; food statuses were only recorded when the page itself stated a rating (green/amber/red, low/moderate/high, "high in X", or appearance in an explicit low-FODMAP/high-FODMAP list). Foods a page merely used in a recipe without a rating were not recorded.
- Ratings are "at a typical serve" as stated by the source. `null` in a FODMAP-group column means the source did not attribute that group to the food, not that the food is confirmed free of it.
- Where a food is listed high/low with no group stated (e.g. sugar snap pea, rum, pickled vegetables), all group columns are null and the notes say "group not stated".

## Pages read (73 used as sourceUrl; others read but contributed nothing food-specific)

Monash public non-blog pages
- /about-fodmap-and-ibs/high-and-low-fodmap-foods/ (the main public food list)
- /about-fodmap-and-ibs/
- /about-fodmap-and-ibs/frequently-asked-questions/

Monash blog posts (slug under /blog/)
all-about-onion-garlic-and-infused-oils-on-the-low-fodmap-diet; cooking-with-onion-and-garlic-myths-and; fodmap-stacking-can-i-overeat-green; fodmap-stacking-explained; how-avoid-fodmap-stacking; serving-size-and-fodmaps-why-it-so-important; traffic-light-system; how-traffic-lights-are-determined; 2024-traffic-light-update; avocado-and-fodmaps-a-smashing-new-discovery; how-to-include-plenty-of-fruit-on-low; eating-more-vegetables-on-low-fodmap; tryfor5-tips-for-eating-more-vegetables; including-legumes-on-low-fodmap-diet; lactose-and-dairy-products-on-low; what-is-lactose-intolerance; what-difference-between-dairy-and-lactose; sweeteners-and-low-fodmap-diet; fodmap-sugar-confusion; fructose-changes-vegetables; low-fodmap-shopping-list; getting-enough-fibre; dietary-fibre-series-insoluble-fibre; dietary-fibre-series-soluble-fibre; milk-alternatives; dairy-alternatives-beverage-and-yoghurt-low-fodmap-options; rice-milks-revisited-moving-from-red-to; using-herbs-spices-low-fodmap-diet; low-fodmap-asian-condiments-sauces-and-seasonings; meat-seafood-eggs-and-cooking-fats-low-fodmap; following-low-fodmap-and-vegan-diet; being-vegan-on-low-fodmap-diet (404); a-low-fodmap-mediterranean-style-diet; more-fodmaps (alcohol); going-dry-july-how-alcohol-can-impact-ibs; update-new-fermented-drinks-added-to; fermented-foods-and-fodmaps; what-are-polyols; food-additives-and-fodmaps; update-label-reading; the-fodmap-gentle-diet; gentle-fodmap-diet; can-microwaving-reduce-fodmap-content; update-bananas-re-tested; retested-foods-why-fodmap-content-might-change; reintroduction-update; fructans-fodmap-reintroduction; order-of-fodmap-reintroduction; practical-tips-fodmap-reintroduction; reintroduction-using-diary-function; step-3-personalisation-why-is-it-important; 3-phases-low-fodmap-diet; practical-guide-beginning-low-fodmap-diet; grains-low-fodmap-diet; using-non-traditional-cereals-and-grains; are-all-spelt-products-low-in-fodmaps; sourdough-processing-fodmaps; avoiding-wheat-how-strict-on-low-fodmap_10; gluten-and-ibs; low-fodmap-snacks; tips-for-packing-nutritionally-balanced; low-fodmap-meal-planning; a-guide-to-low-fodmap-meal-planning; wild-summer-berries-scandinavia; low-fodmap-diet-under-the-summer-sun; 7-tips-managing-your-ibs-over-festive-season; happy-easter-low-fodmappers; cranberry-sauce; new-research-enzyme-therapy...gos...; digestive-enzymes-and-ibs; food-processing-and-fodmaps-what-you; maintaining-weight-while-following-low-fodmap-diet; a-dietitians-day-on-plate-part2; a-dietitians-day-on-a-low-fodmap-plate; non-fodmap-dietary-triggers-of-ibs-symptoms; histamines-and-ibs; general-healthy-tips; adding-flavour-without-adding-symptoms; eating-out-on-low-fodmap-diet-italian; dining-out-asian; the-low-fodmap-diet-in-east-and-south; tips-following-fodmap-diet-singapore; top-tips-following-low-fodmap-diet-italy; dutch-specialities-on-low-fodmap-diet; 10-top-tips-cooking-someone-ibs; modifying-recipes-high-fodmap-to-low; not-just-another-stir-fry; talking-garlic-scapes-gourmend-foods; talking-tofu; soy-lecithin-what-is-it-low-fodmap; protein-powders-and-ibs; the-low-fodmap-diet-and-diabetes; newly-tested-and-retested-foods-broccoli-and-broccolini; debunking-myth-behind-superfoods; sprouting-does-it-reduce-fodmap-content; guava-recipes; zespri-kiwifruit...; fodmaps-for-endurance-sports-tuna-pasta.

Wikipedia
- https://en.wikipedia.org/wiki/FODMAP (fructan / GOS / polyol source lists, incl. "moderate, portion-dependent" items)
- https://en.wikipedia.org/wiki/Low-FODMAP_diet (allowed/restricted lists; "almonds max 10 per serving")

Cut-off value sources
- https://pmc.ncbi.nlm.nih.gov/articles/PMC12766106/ (verbatim Varney table)
- https://www.frontiersin.org/journals/nutrition/articles/10.3389/fnut.2022.1007716/full (Pessarelli 2022)
- https://pmc.ncbi.nlm.nih.gov/articles/PMC11853891/ (pasta paper, Table 4)
- Wiley and ResearchGate copies of Varney 2017 returned HTTP 403; PubMed returned 502 at time of access. Abstract confirmed via research.monash.edu.

## Key limitation

Monash's blog deliberately withholds most per-food serve data ("check the app"). Only a minority of posts give gram-level green/amber/red values (sweet potato, red cabbage, avocado, broccoli/broccolini, sweet corn, oat milk, coconut milk, coconut water, cranberry, chocolate, wholemeal bread, spelt pasta, rice milk, kohlrabi, dairy lactose table). For most foods the JSON records the direction (low/high) and the source's stated portion (often "typical serve") only. Do not treat "typical serve" entries as having a verified gram limit.

Several fetched pages contained their data as images (reintroduction food tables, fructose-change vegetable table, Asian condiments table). Those tables could not be read; only surrounding text was captured.

## Ambiguities and judgment calls

- **Names**: US English singular (`scallion`, `eggplant`, `cilantro` as alias of coriander, `bell pepper`, `beet`, `arugula`). Australian/British terms kept as aliases.
- **Bananas** split into `unripe banana` (low) and `ripe banana` (high, fructans) because the rating flips with ripeness.
- **Broccoli** split into `broccoli` (whole/heads, low) and `broccoli stalk` (high at 1 cup) per the Monash test post.
- **Soy milk** split into whole-bean (high GOS) vs soy-protein (low).
- **Herbs and spices**: 33 entries all "low, typical culinary amount" from the Monash herbs guide; individual gram limits not stated.
- **Generic categories** recorded because Monash's public list rates them generically: `dried fruit`, `marinated meat`, `processed meat`, `pickled vegetables`, `sugar-free confectionery`, `wheat muesli`. Group attribution for `processed meat`/`marinated meat` is inferred from the ingredients Monash names (garlic, honey, applesauce) and flagged in notes.
- **Dutch foods** (bitterballen, stroopwafel) and some SE Asian dishes are ingredient-based judgments by Monash dietitians, explicitly "not tested"; noted as such. Kimchi, gyoza, dim sum etc. described as "likely moderate-high" were folded into `wonton wrapper` notes rather than given their own ratings.
- **Coconut sugar**: Monash says only "may contain FODMAPs, check the app"; recorded as moderate fructans with a caveat. Consider dropping if you want only clean ratings.
- **Soda / sparkling water / coffee / spirits / wine**: rated low FODMAP by Monash's non-FODMAP-triggers post but flagged as non-FODMAP triggers (caffeine, carbonation, alcohol). Sodas sweetened with HFCS would be high excess fructose; the JSON notes this.
- **Celery, kimchi, beer, edamame, dates, figs, grapefruit, chai, stevia, monk fruit, mozzarella (plain)**: no clean public Monash statement found; excluded or (mozzarella) recorded with the Italy post's hedged wording. Celery appears only in the Pessarelli paper's high-FODMAP list, outside this source family.
- **Pumpkin (generic)**: Monash posts say "pumpkin" is low in recipes but rate butternut high (GOS) and kabocha/Japanese low; only the specific varieties were recorded.

## Foods where sources disagree

| Food | Disagreement | Resolution in JSON |
|---|---|---|
| Red bell pepper | Pre-2024 fibre post: 75 g low. Current Monash public food list: high (excess fructose) after the 2024 fructose cut-off review | fructose=high, lowServing notes the older 75 g value |
| Maple syrup | Monash food list + recipe swap: low. "Adding flavour" post summary: moderate | low; disagreement noted |
| Erythritol | Label-reading post: low polyol. Sweeteners post lists it among polyols that cause symptoms | low; disagreement noted |
| Hoisin sauce | Shopping list: low. Dietitian day-on-plate: moderate in small amount | low with moderate note |
| Snow pea | Wikipedia: high polyols. Monash recipe post swaps it out (polyols/fructans). Monash stir-fry post lists it as low at app serve; Monash dietitian eats 4-5 pods | polyols=high, fructans=moderate, low="a few pods" |
| Cauliflower | Wikipedia + Fodmapedia: mannitol. Two Monash post summaries said "oligosaccharides" | polyols=high (mannitol); noted |
| Leek | Monash food list: high. Monash Asian-condiments post lists "leek" as a low FODMAP flavouring (leaves). Wikipedia: white part high, green leaves low | fructans=high; notes explain leaves vs bulb |
| Scallion | Green tops low everywhere; Monash Italian eating-out post lists "spring onion" as high (whole) | fructans=high for bulb, lowServing = green tops |
| Beet | Wikipedia: fructans. Monash GOS trial: GOS source. Monash dietitian: 2 slices fine | fructans=high, gos=high, low=2 slices |
| Avocado | Traffic-light post: sorbitol. Later Monash post: the polyol is perseitol, not sorbitol; rating unchanged | polyolType=sorbitol with perseitol note |
| Cranberry | "Wild berries" post: low-moderate (oligo-fructans). Cranberry sauce post: 9 g dried low, fresh untested | fructans=low at 9 g dried |
| Raisins vs dried fruit | Insoluble-fibre post lists raisins low; Monash food list rates dried fruit high | both recorded; raisin notes that portion matters |
| Green tea | Summer post: low FODMAP. General-healthy-tips summary flagged "high" (actually a caffeine caution) | low; caffeine noted |
| Sweet corn | Vegetables post: 1 cob high, 1/2 cob green/amber. Endurance post: <=43 g low, 85 g high, "polyols/oligosaccharides" | fructans=high, polyols=high at typical 1-cob serve; low=43 g |
| Chickpeas | Fresh/dried high (GOS); canned 1/4 cup low; microwaved 3 min low; sprouted slightly higher | gos=high, low=1/4 cup canned |
| Wholemeal/wheat bread | Monash grains post lists wholemeal bread as "low"; serving-size post: 1 slice green, 2 slices red | fructans=high at 2-slice serve; low=1 slice |

## Suggested follow-ups

- The Monash app (paid) is the only place with amber/red gram thresholds for most foods; this dataset should be treated as directional plus a subset of verified green serves.
- FODMAP Friendly (Australia) and the Fodmapedia mirror of Monash values are separate source families worth reconciling against this file.
