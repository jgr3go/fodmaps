# FODMAP reference table: sources and provenance

Generated 2026-09-18 by scripts/merge-fodmap.mjs from research/*.json.

Ratings are compiled from public sources only (no Monash app data). Every food carries its source URLs.
When sources disagree, priority is: Monash public statements > quantitative literature > clinical handouts > open datasets, tie-breaking toward the more cautious rating. Serving text prefers Monash public, then handouts, with literature-derived servings last. Conflicts are kept on the record.

## Source families

| Family | File | Foods | Notes |
|---|---|---|---|
| clinical-handouts | clinical-handouts.json | 377 | Compiled from hospital/clinic patient handouts (Stanford 2012, Kaiser Permanente SF 2023, MNGI Digestive Health 2026, GastroClinic (Stanford derivative), Cleveland Clinic, Johns Hopkins (via Wayback), |
| literature | literature.json | 264 | cutoffs used: Varney et al. 2017 (J Gastroenterol Hepatol 32 Suppl 1:53-61) Table 1, grams per standard serve of a single food: oligosaccharides (total fructans + GOS) <0.30 g for core grain products, |
| monash-public | monash-public.json | 367 | Compiled from Monash University public web pages (blog + about-FODMAP pages, NOT the paid app database), Wikipedia FODMAP / Low-FODMAP diet pages, and secondary citations of Varney et al. 2017 for cut |
| open-datasets | open-datasets.json | 361 | Synthesis of open GitHub datasets, FODMAP Friendly's public checklist, Open Food Facts taxonomy/ingredient tags, Wikipedia (CC BY-SA), Monash's public label-reading rules and registered-dietitian blog |

## Coverage

Total foods: **811** (25 untested/unrated, kept so the app can flag them as unknown rather than silently "low")

| Category | Count |
|---|---|
| additive | 23 |
| alcohol | 37 |
| beverage | 77 |
| condiment | 76 |
| dairy | 66 |
| fruit | 80 |
| grain | 104 |
| herb-spice | 45 |
| legume | 40 |
| nut-seed | 23 |
| other | 7 |
| processed | 47 |
| protein | 34 |
| sweetener | 53 |
| vegetable | 99 |

| Confidence (source families agreeing) | Count |
|---|---|
| low | 480 |
| medium | 159 |
| high | 172 |

## Foods with conflicting ratings (124)

- **carob powder**: fructans: monash-public=high, open-datasets=moderate
- **beer**: fructans: clinical-handouts=moderate, open-datasets=low
- **wine**: [clinical-handouts] FODMAP Everyday: sweet wine low; [clinical-handouts] Kaiser: 'not dessert'; [clinical-handouts] CUH/Glos: dessert wine avoid
- **chai tea**: fructans: clinical-handouts=high, open-datasets=low
- **coconut water**: fructans: clinical-handouts=moderate, monash-public=low, open-datasets=high; polyols: clinical-handouts=moderate, monash-public=low, open-datasets=high; [clinical-handouts] CDHF: high; [clinical-handouts] FODMAP Everyday: low; [clinical-handouts] IBS Diets/CUH/MNGI: 100 ml
- **coffee**: [clinical-handouts] Kaiser: instant/freeze-dried coffee avoid; [clinical-handouts] IBS Diets/FE: instant coffee low
- **diet soda**: [clinical-handouts] ACG/IBS Diets: low; [clinical-handouts] CDHF: diet cola high; [clinical-handouts] Kaiser: drinks with erythritol avoid
- **hot chocolate**: fructans: clinical-handouts=moderate, open-datasets=low; [clinical-handouts] IBS Diets: malted chocolate drink high; FE: low; [clinical-handouts] Kaiser: hot chocolate avoid; [clinical-handouts] CUH: powder 2 tsp
- **kombucha**: fructans: clinical-handouts=high, monash-public=moderate, open-datasets=high; [clinical-handouts] IBS Diets/Kate/Kaiser: high; [clinical-handouts] CUH: 180 ml limited; [clinical-handouts] FODMAP Everyday 2017: low
- **oat milk**: fructans: clinical-handouts=moderate, monash-public=high, open-datasets=high; gos: clinical-handouts=moderate, monash-public=high; [clinical-handouts] Kaiser: avoid; [clinical-handouts] IBS Diets/CUH/Glos: 30-50 ml only; [clinical-handouts] FODMAP Everyday: low
- **orange juice**: fructose: clinical-handouts=moderate, literature=low, open-datasets=low; [clinical-handouts] CDHF: orange juice high; [clinical-handouts] FODMAP Everyday: low (half fresh/half reconstituted); [clinical-handouts] IBS Diets/CUH/Kaiser: ~100 ml
- **quinoa milk**: fructans: literature=high, open-datasets=low
- **soy milk**: [clinical-handouts] Kaiser/MNGI/ACG/CDHF: soy milk high; [clinical-handouts] IBS Diets/Kate/FE/GastroClinic: low if made from soy protein; [clinical-handouts] CUH/Glos: 50-60 ml
- **tomato juice**: fructose: clinical-handouts=moderate, open-datasets=low; [clinical-handouts] CDHF: tomato juice high; [clinical-handouts] IBS Diets/MNGI/CUH: 1/2 cup-200 ml low
- **barbecue sauce**: fructans: clinical-handouts=high, open-datasets=moderate; fructose: clinical-handouts=high, open-datasets=moderate
- **chutney**: fructans: clinical-handouts=high, open-datasets=low; fructose: clinical-handouts=high, open-datasets=low
- **gravy**: [clinical-handouts] FODMAP Everyday: soup concentrate cubes low; [clinical-handouts] IBS Diets/UHS/CUH/Glos/Kaiser: stock cubes and gravy high
- **jam**: [clinical-handouts] Stanford: jams and jellies limit; [clinical-handouts] IBS Diets/Kaiser/MNGI/Glos/CUH: low if suitable fruit and sweetener
- **ketchup**: fructans: clinical-handouts=moderate, open-datasets=low; fructose: clinical-handouts=moderate, literature=low, open-datasets=low; [clinical-handouts] IBS Diets/Kate/FE: 1 tbsp low (no HFCS); [clinical-handouts] Kaiser/GastroClinic: avoid
- **miso**: [clinical-handouts] Kaiser/GastroClinic: avoid; [clinical-handouts] IBS Diets/Kate/FE/CUH: low
- **pesto**: [clinical-handouts] IBS Diets page: <1 tbsp low; [clinical-handouts] IBS Diets chart/UHS: standard pesto high (garlic); [clinical-handouts] FE/Stanford: low
- **pickle**: [clinical-handouts] Stanford: pickle limit; [clinical-handouts] MNGI/IBS Diets/FE: plain dill pickles low
- **sriracha**: fructans: clinical-handouts=moderate, open-datasets=high
- **tomato paste**: fructose: clinical-handouts=moderate, open-datasets=low; [clinical-handouts] IBS Diets: 2 tbsp low; [clinical-handouts] Kaiser/MNGI: avoid
- **tzatziki**: lactose: clinical-handouts=high, open-datasets=moderate
- **wasabi**: [clinical-handouts] IBS Diets: high; [clinical-handouts] CUH/FE/Kate: low
- **american cheese**: [clinical-handouts] IBS Diets/MNGI: 1 slice low; [clinical-handouts] CUH/Glos/UHS: avoid
- **brie**: [clinical-handouts] Stanford: brie limit; [clinical-handouts] Kate/Kaiser/MNGI/CUH/Glos/JH/IBS Diets/FE: low
- **coconut milk**: polyols: clinical-handouts=moderate, monash-public=low; [clinical-handouts] Stanford: limit; [clinical-handouts] ACG: carton high; [clinical-handouts] Kaiser: low unlimited; [clinical-handouts] IBS Diets/CUH/MNGI: 125 ml
- **cottage cheese**: lactose: clinical-handouts=moderate, literature=high, monash-public=low, open-datasets=low; [clinical-handouts] ACG/FE: low; [clinical-handouts] IBS Diets/CUH/Glos: 2 tbsp; [clinical-handouts] Kate/Kaiser/MNGI/Stanford/CDHF: avoid unless lactose-free
- **cream**: lactose: clinical-handouts=moderate, monash-public=moderate, open-datasets=low
- **cream cheese**: lactose: clinical-handouts=moderate, literature=low, monash-public=moderate, open-datasets=low; [clinical-handouts] Kaiser/IBS Diets/CUH/Glos: 2 tbsp; [clinical-handouts] Kate/MNGI/CDHF/FE: avoid
- **half and half**: lactose: clinical-handouts=moderate, open-datasets=low; [clinical-handouts] Kaiser: 2 tbsp low; [clinical-handouts] Stanford/GastroClinic/FE: high
- **kefir**: [clinical-handouts] IBS Diets/Kaiser: high; [clinical-handouts] MNGI: allowed; [clinical-handouts] Kate grocery: plain Lifeway kefir low; [clinical-handouts] CUH: 1 tbsp
- **mozzarella**: lactose: clinical-handouts=low, monash-public=moderate
- **ricotta**: lactose: clinical-handouts=moderate, monash-public=moderate, open-datasets=low; [clinical-handouts] Kaiser: 1/3 cup allowed AND ricotta in avoid list; [clinical-handouts] IBS Diets/CUH: 2 tbsp; [clinical-handouts] Kate/MNGI/Stanford/CDHF/FE: avoid
- **sour cream**: lactose: clinical-handouts=moderate, monash-public=moderate, open-datasets=low; [clinical-handouts] IBS Diets/Kaiser: 2 tbsp; [clinical-handouts] Stanford/MNGI/FE/CUH: avoid
- **soy yogurt**: gos: clinical-handouts=moderate, literature=low, monash-public=high
- **whipped cream**: [clinical-handouts] Stanford: limit; [clinical-handouts] CDHF/Kaiser/CUH/IBS Diets/Kate/FE: low
- **yogurt**: [clinical-handouts] GastroClinic: Greek yogurt low-moderate; [clinical-handouts] MNGI: Greek 4 oz limit; [clinical-handouts] IBS Diets: Greek 23 g; [clinical-handouts] Others: avoid
- **avocado**: polyols: clinical-handouts=moderate, monash-public=high, open-datasets=moderate; [clinical-handouts] Stanford/GastroClinic: avocado listed as a stone fruit to avoid; [clinical-handouts] Kaiser: 1/8 allowed but 'avocado' also appears in the vegetables-to-avoid list; [clinical-handouts] MNGI: 1/8; [clinical-handouts] IBS Diets: 60 g; [clinical-handouts] Kate: 3 slices; [clinical-handouts] CUH/Glos: <1/4; [clinical-handouts] FODMAP Everyday 2017 & Kate grocery list: listed low without limit
- **blueberry**: [clinical-handouts] MNGI (2026): limit 1/4 cup; [clinical-handouts] Kaiser: 1/2 cup; [clinical-handouts] IBS Diets/CDHF/ALBY/FE: 1 cup
- **boysenberry**: polyols: clinical-handouts=high, literature=low
- **coconut**: [clinical-handouts] Stanford/GastroClinic: coconut, coconut milk, coconut cream in Foods to Limit; [clinical-handouts] Kate/IBS Diets/CDHF/CUH/Kaiser/FE: low at stated serves
- **cranberry**: [clinical-handouts] IBS Diets: 1 tbsp; [clinical-handouts] Kaiser: 1/2 cup; [clinical-handouts] MNGI/Kate/Glos: low, no limit
- **date**: fructose: literature=low, open-datasets=moderate; [clinical-handouts] FODMAP Everyday: fresh dates low; [clinical-handouts] Kate/Kaiser/MNGI/CUH/ACG: avoid; [clinical-handouts] IBS Diets: 1 date
- **dried cranberry**: fructans: clinical-handouts=moderate, monash-public=low
- **grape**: fructose: clinical-handouts=low, literature=high, monash-public=low, open-datasets=low; [clinical-handouts] CDHF 'Understanding': grapes excess fructose high; CDHF 'What can I eat': grapes low; [clinical-handouts] IBS Diets: 10-15 grapes; [clinical-handouts] Stanford/Kate/JH/ACG/CUH: low unlimited
- **grapefruit**: fructans: clinical-handouts=high, literature=moderate, open-datasets=low; fructose: literature=moderate, open-datasets=low; [clinical-handouts] Stanford: grapefruit in Foods to Eat; [clinical-handouts] Kate Scarlata/Kaiser/ACG/CDHF: high; [clinical-handouts] IBS Diets/CUH/Glos: half a fruit low
- **guava**: [clinical-handouts] Stanford: limit; [clinical-handouts] IBS Diets: ripe low / unripe high; [clinical-handouts] CDHF/Kaiser/FE: ripe low
- **honeydew melon**: [clinical-handouts] CDHF: high; [clinical-handouts] IBS Diets/Kaiser: 1/2 cup; [clinical-handouts] Kate/Glos/CUH/FE: low unlimited
- **lychee**: polyols: clinical-handouts=high, monash-public=high, open-datasets=moderate; [clinical-handouts] CDHF 'What can I eat': lychee listed low; [clinical-handouts] IBS Diets/Kaiser/Stanford: high; [clinical-handouts] CUH/Glos: <5 low
- **nectarine**: fructans: clinical-handouts=high, open-datasets=moderate
- **papaya**: [clinical-handouts] Stanford/GastroClinic: papaya in Foods to Limit; [clinical-handouts] IBS Diets/Kate/Kaiser/CDHF/ACG/CUH/FE: low
- **peach**: fructans: clinical-handouts=high, open-datasets=moderate
- **persimmon**: fructans: clinical-handouts=high, literature=high, open-datasets=moderate
- **pineapple**: fructose: literature=moderate, open-datasets=low
- **pomegranate**: [clinical-handouts] IBS Diets/Kaiser/MNGI/CDHF: avoid; [clinical-handouts] Kate/CUH/Glos: small serve low; [clinical-handouts] FODMAP Everyday: low
- **prune**: fructose: literature=low, monash-public=high
- **raspberry**: fructose: literature=moderate, open-datasets=low
- **ripe banana**: [clinical-handouts] CDHF/Kate/IBS Diets/MNGI: ripe banana high (fructans); [clinical-handouts] Cleveland Clinic: fructose, up to 1/3 in cereal; [clinical-handouts] FE3: polyols; [clinical-handouts] FODMAP Everyday 2017 list: 'banana, firm/ripe' low
- **strawberry**: fructose: clinical-handouts=low, literature=moderate, monash-public=low, open-datasets=low; [clinical-handouts] ALBY/IBS Diets: 5 berries; [clinical-handouts] Stanford/Kate/Kaiser/CDHF/JH/ACG: low unlimited
- **amaranth**: [clinical-handouts] IBS Diets/CUH/Glos: high; [clinical-handouts] MNGI: 1/2 cup; [clinical-handouts] FODMAP Everyday: puffed low
- **bulgur**: fructans: clinical-handouts=high, monash-public=low; [clinical-handouts] IBS Diets/FE: 1/4 cup cooked low; [clinical-handouts] Kaiser/GastroClinic/CUH/Glos: avoid
- **cheerios**: [clinical-handouts] Stanford, Kate Scarlata grocery list, MNGI: low; [clinical-handouts] Gloucestershire NHS: avoid (UK Cheerios are multigrain with wheat)
- **cracker**: [clinical-handouts] IBS Diets: 4 cream crackers low; FE: saltines low; [clinical-handouts] CUH/Glos: cream crackers, water biscuits avoid
- **quinoa**: [clinical-handouts] Stanford: 1/2 cup if symptomatic; [clinical-handouts] CDHF: 1 cup; [clinical-handouts] Others: unlimited
- **rice cake**: [clinical-handouts] ALBY: 2 low, 4 high; [clinical-handouts] CDHF: 4 low
- **semolina**: fructans: clinical-handouts=high, literature=low
- **sourdough bread**: [clinical-handouts] CDHF: 2 slices; [clinical-handouts] MNGI: 1 slice; [clinical-handouts] Kate/FE/ACG/CDHF2: low; [clinical-handouts] CUH/Glos NHS: wheat sourdough avoid; spelt sourdough only; [clinical-handouts] UHS: only 100% spelt sourdough
- **spelt bread**: [clinical-handouts] Stanford/CUH/Glos: spelt = wheat, avoid; [clinical-handouts] FODMAP Everyday/Kaiser: spelt flour low/allowed; [clinical-handouts] IBS Diets: spelt flour high
- **wheat bran**: fructans: clinical-handouts=high, literature=low
- **wheat bread**: [clinical-handouts] IBS Diets: 1 slice low; [clinical-handouts] All hospital handouts: avoid; [clinical-handouts] FODMAP Everyday 2017: 'white bread' listed low (Monash small serve)
- **wheat pasta**: fructans: clinical-handouts=high, monash-public=high, open-datasets=moderate; [clinical-handouts] IBS Diets/FE: 1/2 cup cooked low; [clinical-handouts] Stanford/Kaiser/MNGI/CUH/Glos/UHS/Mayo: avoid
- **chili powder**: [clinical-handouts] MNGI: chipotle chili dried avoid; [clinical-handouts] IBS Diets: chipotle chili powder low
- **onion powder**: fructans: literature=low, monash-public=high, open-datasets=high
- **black bean**: [clinical-handouts] IBS Diets/CDHF: canned 1/4 cup low; [clinical-handouts] Kate/MNGI/FE/Mayo: avoid
- **chickpea**: [clinical-handouts] Kaiser/Stanford/Glos/UHS: avoid; [clinical-handouts] IBS Diets/Kate/CDHF/MNGI/CUH/ACG: canned 1/4 cup low
- **edamame**: gos: clinical-handouts=moderate, open-datasets=low; [clinical-handouts] IBS Diets/MNGI: high; [clinical-handouts] Kate/CUH/CDHF/ACG/FE: low at ~1/2 cup
- **kidney bean**: [clinical-handouts] CUH: canned 100 g limited portion; [clinical-handouts] IBS Diets: >85 g high; [clinical-handouts] Kate/MNGI/ACG/Mayo/Glos: avoid
- **lentil**: [clinical-handouts] Stanford/Kaiser/JH/Glos/UHS/Mayo: avoid; [clinical-handouts] Kate/MNGI: canned 1/2 cup; [clinical-handouts] CUH: 2 tbsp canned, 1 tbsp boiled; [clinical-handouts] ACG/FE: low
- **lima bean**: [clinical-handouts] FODMAP Everyday: low at small serve; [clinical-handouts] Others: avoid
- **soy flour**: fructans: literature=low, open-datasets=high
- **almond**: gos: clinical-handouts=moderate, monash-public=low, open-datasets=moderate; [clinical-handouts] Stanford/Kate: handful / no limit; [clinical-handouts] IBS Diets/CUH/Glos/FE3: 10 nuts; [clinical-handouts] FE3: 20 nuts high
- **almond flour**: [clinical-handouts] IBS Diets: high; [clinical-handouts] FODMAP Everyday: low
- **cashew**: [clinical-handouts] FODMAP Everyday: activated cashews low; [clinical-handouts] All others: avoid
- **hazelnut**: gos: clinical-handouts=moderate, open-datasets=low; [clinical-handouts] IBS Diets page: 24 hazelnuts; [clinical-handouts] IBS Diets chart/CUH/Glos: 10
- **pretzel**: fructans: clinical-handouts=moderate, literature=low, open-datasets=low; [clinical-handouts] IBS Diets/Stanford/FE: pretzels low; [clinical-handouts] MNGI/Kaiser/Kate: gluten-free only
- **textured vegetable protein**: [clinical-handouts] Glos/CUH: suitable; [clinical-handouts] Kaiser: avoid
- **tofu**: [clinical-handouts] CDHF 'What can I eat': tofu listed high; [clinical-handouts] All others: firm tofu low; silken tofu high
- **carob**: [clinical-handouts] IBS Diets/MNGI: high; [clinical-handouts] CUH: 1 tsp; [clinical-handouts] FE: low
- **cocoa powder**: [clinical-handouts] Kaiser: avoid (label list); [clinical-handouts] IBS Diets/MNGI/Kate/FE: 1 tbsp low
- **coconut sugar**: fructans: clinical-handouts=moderate, monash-public=moderate, open-datasets=high
- **corn syrup**: [clinical-handouts] Kaiser/MNGI: allowed; [clinical-handouts] CDHF: high
- **erythritol**: [clinical-handouts] IBS Diets: low; [clinical-handouts] Kaiser/MNGI/CUH: avoid
- **molasses**: fructose: clinical-handouts=high, literature=moderate, open-datasets=high; [clinical-handouts] Glos NHS: treacle suitable; [clinical-handouts] CUH NHS: treacle avoid; [clinical-handouts] Kate: small amounts in a product OK; [clinical-handouts] Kaiser/MNGI/IBS Diets: avoid
- **asparagus**: fructans: clinical-handouts=high, monash-public=moderate, open-datasets=high; fructose: clinical-handouts=high, literature=moderate, monash-public=high, open-datasets=high; [clinical-handouts] Glos NHS: tolerated in very small quantities (<3 tbsp/day); all others: avoid
- **beet**: fructans: clinical-handouts=high, literature=moderate, monash-public=high; [clinical-handouts] FODMAP Everyday: beets low; [clinical-handouts] MNGI/Kate/Kaiser/Stanford: fresh beet avoid; [clinical-handouts] IBS Diets/CDHF: canned/pickled only
- **bell pepper**: fructose: clinical-handouts=moderate, open-datasets=low; [clinical-handouts] CDHF: red/yellow/orange high, green 1/4 medium; [clinical-handouts] Kaiser/Stanford/Kate/CUH/FE: all colors low unlimited; [clinical-handouts] IBS Diets/ALBY: red capped at 1/3-1/2 cup
- **broccoli**: fructans: clinical-handouts=moderate, open-datasets=low; [clinical-handouts] Stanford (2012): broccoli in Foods to Limit; [clinical-handouts] Kate Scarlata, ACG, FE, CUH: low with no stated limit; [clinical-handouts] IBS Diets/CDHF: heads 3/4 cup; [clinical-handouts] Kaiser/MNGI: 1/2 cup; [clinical-handouts] Glos NHS: very small quantities (<3 tbsp)
- **brussels sprout**: fructans: clinical-handouts=high, literature=moderate, monash-public=high, open-datasets=low; [clinical-handouts] Kate Scarlata/Kaiser/Stanford/Mayo/CDHF: avoid; [clinical-handouts] IBS Diets: 2 sprouts low; [clinical-handouts] CUH: <3 (60 g); [clinical-handouts] FODMAP Everyday: low (no limit stated)
- **butternut squash**: gos: clinical-handouts=moderate, monash-public=high; [clinical-handouts] Stanford: low unlimited; [clinical-handouts] IBS Diets: 1/4 cup; [clinical-handouts] MNGI: 1/3 cup; [clinical-handouts] Kaiser: 1/2 cup
- **cabbage**: [clinical-handouts] Stanford 2012 and Kaiser 2023: cabbage in avoid list (no variety stated); [clinical-handouts] IBS Diets/CDHF: 3/4 cup; [clinical-handouts] MNGI: 1/2 cup; [clinical-handouts] Kate/CUH/Glos/FE: low unlimited
- **cassava**: [clinical-handouts] IBS Diets: cassava root high; [clinical-handouts] CUH/FODMAP Everyday: low
- **celery**: polyols: clinical-handouts=moderate, literature=high, open-datasets=moderate; [clinical-handouts] Stanford/Kate/FE: low, no limit; [clinical-handouts] IBS Diets: <5 cm; [clinical-handouts] MNGI: 1/4 stalk; [clinical-handouts] Kaiser: 1 stalk; [clinical-handouts] CDHF: polyol high (no low serve given)
- **corn**: fructans: clinical-handouts=moderate, monash-public=high; polyols: clinical-handouts=moderate, monash-public=high; [clinical-handouts] Stanford: low, unlimited; [clinical-handouts] CDHF: polyol high (canned 1/2 cup low); [clinical-handouts] CUH: loose sweetcorn only 1 tbsp (15 g), cob 1/2
- **fennel**: [clinical-handouts] Stanford: fennel in Foods to Limit; [clinical-handouts] Glos: very small quantities; [clinical-handouts] IBS Diets/Kaiser/MNGI: 1/2 cup
- **garlic**: [clinical-handouts] Stanford lists 'garlic powder' and 'garlic flavored oil' as Foods to Eat while listing garlic in Foods to Limit; all other sources treat garlic powder as high
- **green bean**: [clinical-handouts] Stanford: limit; [clinical-handouts] All Monash-based sources: low at 15 beans
- **green pea**: fructans: clinical-handouts=high, open-datasets=moderate; gos: clinical-handouts=high, monash-public=high, open-datasets=moderate; [clinical-handouts] Kaiser: 1/2 cup allowed; [clinical-handouts] CUH: 1 tbsp; [clinical-handouts] Kate/MNGI/FE/IBS Diets: avoid
- **mushroom**: [clinical-handouts] FODMAP Everyday 2017 list includes fresh 'Mushroom, button' as low; IBS Diets, Kate Scarlata, Kaiser, MNGI, CUH, Glos, UHS, ACG list fresh button mushrooms high
- **okra**: [clinical-handouts] Stanford: okra in Foods to Limit; [clinical-handouts] Glos: very small quantities; [clinical-handouts] CDHF/CUH/MNGI/Kaiser: 6-7 pods low
- **onion**: [clinical-handouts] Stanford lists 'onion powder' in the Foods to Eat column while listing onions in Foods to Limit; every other source treats onion powder as a concentrated high-fructan ingredient
- **pumpkin**: fructans: clinical-handouts=moderate, open-datasets=low; [clinical-handouts] CDHF: pumpkin high; [clinical-handouts] Glos/CUH/MNGI/GastroClinic: pumpkin suitable; [clinical-handouts] IBS Diets: canned 1/4 cup, fresh 63 g
- **sauerkraut**: polyols: clinical-handouts=moderate, monash-public=high, open-datasets=high; [clinical-handouts] IBS Diets/CDHF/FE: low at 1/3-1/2 cup; [clinical-handouts] MNGI/CUH: avoid
- **savoy cabbage**: [clinical-handouts] Kate Scarlata: high; [clinical-handouts] IBS Diets: <1/2 cup low; [clinical-handouts] FODMAP Everyday: low
- **seaweed**: [clinical-handouts] CUH: generic seaweed avoid, nori OK; [clinical-handouts] IBS Diets: kelp/kombu high
- **snow pea**: fructans: clinical-handouts=high, monash-public=moderate; [clinical-handouts] Kate/Kaiser/MNGI/Stanford/CDHF: avoid; [clinical-handouts] IBS Diets/CUH: 5 pods low
- **sugar snap pea**: [clinical-handouts] Glos NHS: listed as suitable; [clinical-handouts] IBS Diets/Kate/Kaiser/MNGI/ACG/CDHF: avoid
- **sun-dried tomato**: [clinical-handouts] IBS Diets/CUH: 4 pieces low; [clinical-handouts] Kate Scarlata/Kaiser/MNGI: high
- **sweet potato**: polyols: clinical-handouts=moderate, literature=moderate, monash-public=low, open-datasets=low; [clinical-handouts] CDHF: 1/3 cup; [clinical-handouts] IBS Diets/Kaiser/MNGI/CUH/ALBY: 1/2 cup (75 g); [clinical-handouts] Glos: very small quantities (<3 tbsp); [clinical-handouts] Kate Scarlata: 1/2 small potato; [clinical-handouts] Stanford: not listed (yam low)
- **taro**: [clinical-handouts] IBS Diets: high; [clinical-handouts] CUH/FE: low
- **yellow squash**: [clinical-handouts] Stanford: limit; [clinical-handouts] IBS Diets/Kaiser/MNGI/FE: low
- **zucchini**: fructans: clinical-handouts=moderate, literature=moderate, open-datasets=low; [clinical-handouts] Stanford/Kaiser/CUH/Glos/FE: low, unlimited; [clinical-handouts] IBS Diets/ALBY/MNGI/Kate: ~65 g cap

## Open datasets evaluated

| Name | License | Provenance | Usable |
|---|---|---|---|
| [ts-sz/fodmap-data (mirror of gut-check)](https://github.com/ts-sz/fodmap-data) | MIT (code and JSON structure); README says underlying food data 'originates from Monash University research' | Weekly auto-extract of gut-check/gut-check.github.io (MIT) foodData/foodDetails; gut-check's FODMAP_RESEARCH.md cites Monash app, Gourmend, A Little Bit Yummy, The IBS Dietitian per row | yes |
| [gut-check/gut-check.github.io](https://github.com/gut-check/gut-check.github.io) | MIT (README); no LICENSE file in tree | Single-file PWA; food DB embedded in index.html; FODMAP_RESEARCH.md logs per-food sources (Monash app, Gourmend, A Little Bit Yummy, The IBS Dietitian) | yes |
| [oseparovic/fodmap_list](https://github.com/oseparovic/fodmap_list) | None declared (all rights reserved by default) | Community-compiled; README lists 10 public handout sources (ibsdiets.org, Kate Scarlata, Diet vs Disease, Stanford handout, IBS Group brochure, etc.) and says items are only added when cross-referenced across several sources | yes |
| [scottenock/fodmap-foss](https://github.com/scottenock/fodmap-foss) | GPL-3.0 | src/data/fodmap.ts uses oseparovic's exact schema (id/name/fodmap/category/details) - a relicensed copy of that dataset | no |
| [GoodPigeon/FODMAP](https://github.com/GoodPigeon/FODMAP) | None | Norwegian translation of oseparovic fodmap_repo.json (file named fodmap_repo_NO.json) | no |
| [fodmap-diet/basket](https://github.com/fodmap-diet/basket) | MIT | Community PRs; per-item 'source' requested in PR template but not stored in JSON | yes |
| [jvnn/fodmap-guide](https://github.com/jvnn/fodmap-guide) | None | 2013 Android app data.json, author disclaims accuracy | no |
| [kwpav/fodsearch-api](https://github.com/kwpav/fodsearch-api) | MIT | Hand-compiled ingredients.csv; no sources cited; categories mirror Monash app layout | yes |
| [zarhaselene/fodmap-recipe](https://github.com/zarhaselene/fodmap-recipe) | None | App demo data; no sources | no |
| [jade-hernandez/guide-monf](https://github.com/jade-hernandez/guide-monf) | None (docs/dataset-provenance.md explicitly records that license and provenance are unresolved) | 104 French records each stamped 'Monash University 2024' with no acquisition record; owner says assembled from public online info | no |
| [melaniehuang/fodmap-web (also hugomd/fodmap-react copy)](https://github.com/melaniehuang/fodmap-web) | GPL-3.0 (hugomd copy MIT) | 2016 personal project; categories match Monash app; no sources | yes |
| [timbenniks/fodmap-listr](https://github.com/timbenniks/fodmap-listr) | None | en.json/nl.json Allowed/Not Allowed list, category ids; includes a 'Prebiotic Foods' category | no |
| [ensadi/FOODS](https://github.com/ensadi/FOODS) | MIT | Flat Food/Disposition/Classification JSON, no sources | yes |
| [sergiorua/alexa-fodmap](https://github.com/sergiorua/alexa-fodmap) | GPL-3.0 | high/low YAML lists, UK terms, no sources | no |
| [gautham50050/Fodmap-scanner](https://github.com/gautham50050/Fodmap-scanner) | MIT | Header says compiled from Monash published categories, peer-reviewed composition studies, USDA/AFCD; it is an ingredient-substring table for parsing OFF/USDA ingredient lists | yes |
| [nathaliatg/safe](https://github.com/nathaliatg/safe) | None | Hand-written explanations with portion guidance, no citations | yes |
| [arran4/awesome-fodmap-resources](https://github.com/arran4/awesome-fodmap-resources) | MIT | Link list | no |
| [IBPA/FODMAPsAndGutMicrobiome](https://github.com/IBPA/FODMAPsAndGutMicrobiome) | CC0-1.0 | Meta-analysis code/metadata for microbiome studies | no |
| [Kaggle / Hugging Face](https://huggingface.co/datasets?search=fodmap) | n/a | Searched both; no FODMAP-specific dataset found. Hugging Face hosts openfoodfacts/product-database (ODbL) which is the full OFF dump | no |
| [FODMAP Friendly - Low FODMAP Foods Checklist (PDF)](https://fodmapfriendly.com/wp-content/uploads/2021/07/Low-FODMAP-Foods-Checklist.pdf) | Copyright Fodmap Pty Ltd, July 2021; no reuse license | FODMAP Friendly's own lab-tested program, summary handout | yes |
| [FODMAP Friendly certified products list](https://fodmapfriendly.com/products/) | Proprietary; no API or reuse terms | Lab-tested certified packaged products with max serve size, filterable by country/brand/category | no |
| [Open Food Facts](https://world.openfoodfacts.org/api/v2/product/{barcode}) | ODbL 1.0 (data) / DbCL (contents) / CC BY-SA (images); attribution required, share-alike for derived databases | Crowd-sourced packaged-food database; ingredients parsed against a taxonomy | yes |
| [Spoonful blog: Top 45 FODMAP ingredients in packaged foods](https://blog.spoonfulapp.com/top-fodmap-ingredients/) | Editorial content, copyright Spoonful; facts used, text not copied | Derived from Spoonful's scan of 600,000+ grocery labels; app data itself is proprietary | yes |
| [Monash FODMAP blog: Label reading and FODMAPs](https://www.monashfodmap.com/blog/update-label-reading/) | Copyright Monash University; public educational post; facts used only | Primary authority | yes |
| [Wikipedia: FODMAP / Low-FODMAP diet](https://en.wikipedia.org/wiki/FODMAP) | CC BY-SA 4.0 | Cites Monash 2012 guidelines and peer-reviewed reviews | yes |
| [Dietitian/educational blogs (A Little Bit Yummy, The IBS Dietitian, FODMAP Everyday, Keren Reiser, fodzyme, Gourmend, wholeisticliving, Casa de Sante, CDHF, InnerBuddies)](https://alittlebityummy.com/blog/what-alcohol-is-low-fodmap/) | Copyright each publisher; facts used, wording not copied | Registered dietitians summarizing Monash and FODMAP Friendly app entries with servings | yes |
| [Fodmapedia](https://blog.fodmapedia.com/en/fodmapedia-sources/) | Proprietary (freemium app); started from Canadian Nutrient File | Monash, papers, USDA/Ciqual/AFCD, expert books | no |
| [Google Sheet 'Monash FODMAP rip-off [compact] v2.4.0'](https://docs.google.com/spreadsheets/d/1aDeHiIYbPdd355BBQrxr7rz7xPIc0KEKQw-ADFQ6wUc/edit) | Unauthorized copy of Monash app data | Self-described rip-off of the Monash app | no |
| [Reddit r/FODMAPS wiki](https://www.reddit.com/r/FODMAPS/wiki/index) | User content | Community | no |
| [Fody Foods / Casa de Sante educational lists](https://www.fodyfoods.com/blogs/news/the-ultimate-low-fodmap-grocery-list) | Brand marketing content | Brand blogs; Fody's grocery list is a gated PDF, Casa de Sante soft-drink post is text | yes |

## All source URLs

- https://stanfordhealthcare.org/content/dam/SHC/for-patients-component/programs-services/clinical-nutrition-services/docs/pdf-lowfodmapdiet.pdf
- https://www.gastroclinic.com/wp-content/uploads/TheLowFODMAPDiet.pdf
- https://my.clevelandclinic.org/health/treatments/22466-low-fodmap-diet
- https://www.hopkinsmedicine.org/health/wellness-and-prevention/fodmap-diet-what-you-need-to-know
- https://mcpress.mayoclinic.org/nutrition-fitness/what-is-a-low-fodmap-diet-foods-meal-plan-and-benefits/
- https://connect.mayoclinic.org/blog/gastroenterology-and-gi-surgery/newsfeed-post/a-map-for-the-fodmap-diet/
- https://www.med.umich.edu/1libr/Gastro/LowFODMAPDietIntroduction.pdf
- https://www.kcl.ac.uk/slcps/assets/fodmap/SAMPLE-Reducing-FODMAPs-UPDATE2014.pdf
- https://www.cuh.nhs.uk/patient-information/low-fodmap-diet-reducing-fermentable-carbohydrates-in-your-diet/
- https://www.gloshospitals.nhs.uk/media/documents/FODMAP_dietsheet_for_website.pdf
- https://www.uhs.nhs.uk/Media/UHS-website-2019/Patientinformation/Digestionandurinaryhealth/Gentle-low-FODMAP-diet-3924-PIL.pdf
- https://cdhf.ca/en/understanding-the-fodmap-diet/
- https://cdhf.ca/en/the-low-fodmap-diet-what-can-i-eat/
- https://cdhf.ca/en/low-fodmap-diet-dietitian-tips-for-getting-enough-fibre/
- https://www.katescarlata.com/s/Low-FODMAP-Checklist-2020_tab.pdf
- https://www.katescarlata.com/s/High_FODMAP_2020.pdf
- https://www.katescarlata.com/s/grocery_list_katescarlata2020.pdf
- https://www.ibsdiets.org/fodmap-diet/fodmap-food-list/
- https://www.ibsdiets.org/wp-content/uploads/2016/03/IBSDiets-FODMAP-chart.pdf
- https://www.fodmapeveryday.com/wp-content/uploads/2017/11/Copy-of-FODMAP-Everyday-Low-FODMAP-Foods-List-Full-Color-FINAL-9.26.17.pdf
- https://www.fodmapeveryday.com/no-fodmap-content-foods/
- https://www.fodmapeveryday.com/what-is-a-low-fodmap-serving-size/
- https://mydoctor.kaiserpermanente.org/ncal/Images/Low_FODMAP_Diet_Handout_tcm75-2407402.pdf
- https://www.mngi.com/media/353/download
- https://gi.org/topics/low-fodmap-diet/
- https://alittlebityummy.com/blog/10-low-fodmap-foods-that-need-portion-control-the-foods-might-surprise-you/
- https://alittlebityummy.com/blog/low-fodmap-foods-you-can-enjoy-in-large-servings/
- https://fdc.nal.usda.gov/
- https://figshare.com/articles/journal_contribution/Fructan_content_of_commonly_consumed_wheat_rye_and_gluten-free_breads/20774788
- https://food-nutrition.canada.ca/api/canadian-nutrient-file/
- https://foodintolerances.org/en/food-dictionary/fructan-and-fructooligosaccharide-content-of-food
- https://iris.uniroma1.it/bitstream/11573/1660901/1/Ispiryan_FODMAP-modulation_2022.pdf
- https://pmc.ncbi.nlm.nih.gov/articles/PMC10572427/
- https://pmc.ncbi.nlm.nih.gov/articles/PMC10820302/
- https://pmc.ncbi.nlm.nih.gov/articles/PMC11178640/
- https://pmc.ncbi.nlm.nih.gov/articles/PMC11853891/
- https://pmc.ncbi.nlm.nih.gov/articles/PMC11858256/
- https://pmc.ncbi.nlm.nih.gov/articles/PMC6063767/
- https://pmc.ncbi.nlm.nih.gov/articles/PMC8074121/
- https://pmc.ncbi.nlm.nih.gov/articles/PMC9967297/
- https://pubmed.ncbi.nlm.nih.gov/17625872/
- https://pubmed.ncbi.nlm.nih.gov/19123815/
- https://pubmed.ncbi.nlm.nih.gov/21332832/
- https://pubmed.ncbi.nlm.nih.gov/27002546/
- https://pubmed.ncbi.nlm.nih.gov/29473657/
- https://www.monashfodmap.com/blog/new-research-fermentable-short-chain-carbohydrate-fodmap-content-common-plant-based-foods-and-processed-foods-suitable-vegetarian-and-vegan-based-eating-patterns-part-1/
- https://www.monashfodmap.com/blog/new-research-fermentable-short-chain-carbohydrate-fodmap-content-common-plant-based-foods-and-processed-foods-suitable-vegetarian-and-vegan-based-eating-patterns-part-2/
- https://www.sciencedirect.com/science/article/abs/pii/S1756464616301463
- https://www.semanticscholar.org/paper/5a63460256c27ead902862cdb9741b93a18c6dba
- https://www.semanticscholar.org/paper/838d6fe0e6f7feb34f1e7e70fc576827409cf4f3
- https://en.wikipedia.org/wiki/FODMAP
- https://en.wikipedia.org/wiki/Low-FODMAP_diet
- https://www.monashfodmap.com/about-fodmap-and-ibs/
- https://www.monashfodmap.com/about-fodmap-and-ibs/frequently-asked-questions/
- https://www.monashfodmap.com/about-fodmap-and-ibs/high-and-low-fodmap-foods/
- https://www.monashfodmap.com/blog/a-dietitians-day-on-a-low-fodmap-plate/
- https://www.monashfodmap.com/blog/a-dietitians-day-on-plate-part2/
- https://www.monashfodmap.com/blog/a-guide-to-low-fodmap-meal-planning/
- https://www.monashfodmap.com/blog/a-low-fodmap-mediterranean-style-diet/
- https://www.monashfodmap.com/blog/adding-flavour-without-adding-symptoms/
- https://www.monashfodmap.com/blog/all-about-onion-garlic-and-infused-oils-on-the-low-fodmap-diet/
- https://www.monashfodmap.com/blog/are-all-spelt-products-low-in-fodmaps/
- https://www.monashfodmap.com/blog/avoiding-wheat-how-strict-on-low-fodmap_10/
- https://www.monashfodmap.com/blog/cooking-with-onion-and-garlic-myths-and/
- https://www.monashfodmap.com/blog/cranberry-sauce/
- https://www.monashfodmap.com/blog/dairy-alternatives-beverage-and-yoghurt-low-fodmap-options/
- https://www.monashfodmap.com/blog/debunking-myth-behind-superfoods/
- https://www.monashfodmap.com/blog/dietary-fibre-series-insoluble-fibre/
- https://www.monashfodmap.com/blog/dietary-fibre-series-soluble-fibre/
- https://www.monashfodmap.com/blog/digestive-enzymes-and-ibs/
- https://www.monashfodmap.com/blog/dining-out-asian/
- https://www.monashfodmap.com/blog/dutch-specialities-on-low-fodmap-diet/
- https://www.monashfodmap.com/blog/eating-out-on-low-fodmap-diet-italian/
- https://www.monashfodmap.com/blog/fermented-foods-and-fodmaps/
- https://www.monashfodmap.com/blog/fodmap-stacking-can-i-overeat-green/
- https://www.monashfodmap.com/blog/fodmap-stacking-explained/
- https://www.monashfodmap.com/blog/fodmap-sugar-confusion/
- https://www.monashfodmap.com/blog/fodmaps-for-endurance-sports-tuna-pasta/
- https://www.monashfodmap.com/blog/following-low-fodmap-and-vegan-diet/
- https://www.monashfodmap.com/blog/food-additives-and-fodmaps/
- https://www.monashfodmap.com/blog/food-processing-and-fodmaps-what-you/
- https://www.monashfodmap.com/blog/fructans-fodmap-reintroduction/
- https://www.monashfodmap.com/blog/fructose-changes-vegetables/
- https://www.monashfodmap.com/blog/getting-enough-fibre/
- https://www.monashfodmap.com/blog/gluten-and-ibs/
- https://www.monashfodmap.com/blog/going-dry-july-how-alcohol-can-impact-ibs/
- https://www.monashfodmap.com/blog/grains-low-fodmap-diet/
- https://www.monashfodmap.com/blog/guava-recipes/
- https://www.monashfodmap.com/blog/happy-easter-low-fodmappers/
- https://www.monashfodmap.com/blog/how-avoid-fodmap-stacking/
- https://www.monashfodmap.com/blog/including-legumes-on-low-fodmap-diet/
- https://www.monashfodmap.com/blog/low-fodmap-diet-under-the-summer-sun/
- https://www.monashfodmap.com/blog/low-fodmap-meal-planning/
- https://www.monashfodmap.com/blog/low-fodmap-shopping-list/
- https://www.monashfodmap.com/blog/low-fodmap-snacks/
- https://www.monashfodmap.com/blog/maintaining-weight-while-following-low-fodmap-diet/
- https://www.monashfodmap.com/blog/meat-seafood-eggs-and-cooking-fats-low-fodmap/
- https://www.monashfodmap.com/blog/milk-alternatives/
- https://www.monashfodmap.com/blog/modifying-recipes-high-fodmap-to-low/
- https://www.monashfodmap.com/blog/new-research-enzyme-therapy-can-help-reduce-symptoms-ibs-patients-sensitive-galacto-oligosaccharides-gos-present-legumes-soy-milk-and-nuts/
- https://www.monashfodmap.com/blog/newly-tested-and-retested-foods-broccoli-and-broccolini/
- https://www.monashfodmap.com/blog/non-fodmap-dietary-triggers-of-ibs-symptoms/
- https://www.monashfodmap.com/blog/not-just-another-stir-fry/
- https://www.monashfodmap.com/blog/protein-powders-and-ibs/
- https://www.monashfodmap.com/blog/rice-milks-revisited-moving-from-red-to/
- https://www.monashfodmap.com/blog/serving-size-and-fodmaps-why-it-so-important/
- https://www.monashfodmap.com/blog/soy-lecithin-what-is-it-low-fodmap/
- https://www.monashfodmap.com/blog/sweeteners-and-low-fodmap-diet/
- https://www.monashfodmap.com/blog/talking-garlic-scapes-gourmend-foods/
- https://www.monashfodmap.com/blog/talking-tofu/
- https://www.monashfodmap.com/blog/the-fodmap-gentle-diet/
- https://www.monashfodmap.com/blog/the-low-fodmap-diet-and-diabetes/
- https://www.monashfodmap.com/blog/tips-following-fodmap-diet-singapore/
- https://www.monashfodmap.com/blog/tips-for-packing-nutritionally-balanced/
- https://www.monashfodmap.com/blog/top-tips-following-low-fodmap-diet-italy/
- https://www.monashfodmap.com/blog/traffic-light-system/
- https://www.monashfodmap.com/blog/update-bananas-re-tested/
- https://www.monashfodmap.com/blog/update-label-reading/
- https://www.monashfodmap.com/blog/update-new-fermented-drinks-added-to/
- https://www.monashfodmap.com/blog/using-herbs-spices-low-fodmap-diet/
- https://www.monashfodmap.com/blog/what-is-lactose-intolerance/
- https://www.monashfodmap.com/blog/wild-summer-berries-scandinavia/
- https://www.monashfodmap.com/blog/zespri-kiwifruit-low-fodmap-certified-monash-university-now-listed-our-app/
- https://alittlebityummy.com/blog/low-fodmap-milk-options/
- https://alittlebityummy.com/blog/the-ultimate-guide-to-low-fodmap-sugars-sweeteners/
- https://alittlebityummy.com/blog/what-alcohol-is-low-fodmap/
- https://blog.spoonfulapp.com/top-fodmap-ingredients/
- https://casadesante.com/blogs/low-fodmap-life/low-fodmap-soft-drinks
- https://cdhf.ca/en/what-can-you-drink-on-the-low-fodmap-diet/
- https://fodmapfriendly.com/wp-content/uploads/2021/07/Low-FODMAP-Foods-Checklist.pdf
- https://fodzyme.com/blogs/resources/low-fodmap-sweeteners
- https://github.com/gautham50050/Fodmap-scanner/blob/main/src/data/fodmapList.js
- https://github.com/gut-check/gut-check.github.io/blob/main/FODMAP_RESEARCH.md
- https://github.com/kwpav/fodsearch-api/blob/main/resources/ingredients.csv
- https://github.com/melaniehuang/fodmap-web/blob/master/data/fodmap.json
- https://github.com/nathaliatg/safe/blob/main/src/data/fodmap-foods.json
- https://github.com/oseparovic/fodmap_list/blob/master/fodmap_repo.json
- https://github.com/ts-sz/fodmap-data/blob/main/fodmap.json
- https://kerenreiser.com/low-fodmap-alcohol/
- https://theibsdietitian.com/blog/35-low-fodmap-snacks
- https://theibsdietitian.com/blog/inulin-and-fodmaps
- https://theibsdietitian.com/blog/low-fodmap-alcohol
- https://theibsdietitian.com/blog/which-sweeteners-are-low-fodmap-dietitian-advice-for-ibs
- https://wholeisticliving.com/2023/09/25/low-fodmap-teas/
- https://world.openfoodfacts.org/api/v2/taxonomy?tagtype=additives&tags=en:e420,en:e421,en:e953,en:e965,en:e967,en:e968,en:e1200
- https://www.fodmapeveryday.com/drinking-alcohol-low-fodmap-diet/
- https://www.fodmapeveryday.com/the-ultimate-guide-to-alt-milks-non-dairy-milks-and-lactose-free-milks-for-the-low-fodmap-diet/
- https://www.fodmapeveryday.com/the-ultimate-guide-to-low-fodmap-condiments/
- https://www.gourmendfoods.com/blogs/learn/low-fodmap-sweeteners
- https://www.innerbuddies.com/blogs/gut-health/low-fodmap-fermented-foods