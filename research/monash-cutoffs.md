# Monash FODMAP cut-off values (per serving)

Source paper: Varney J, Barrett J, Scarlata K, Catsos P, Gibson PR, Muir JG. "FODMAPs: food composition, defining cutoff values and international application." *J Gastroenterol Hepatol* 2017;32 Suppl 1:53-61. doi:10.1111/jgh.13698.

- PubMed: https://pubmed.ncbi.nlm.nih.gov/28244665/
- Wiley: https://onlinelibrary.wiley.com/doi/10.1111/jgh.13698 (paywalled; returned 403 to automated fetch)
- Monash research record (abstract only): https://research.monash.edu/en/publications/fodmaps-food-composition-defining-cutoff-values-and-international/

The paper's full text was not reachable, so the numbers below are taken from peer-reviewed papers that quote the Varney 2017 table verbatim. The two independent citations agree with each other.

## The "low FODMAP" thresholds (a food is LOW if it is under ALL applicable values at the serving analysed)

| FODMAP group | Cut-off (per serving) | Applies to | Notes |
|---|---|---|---|
| Total oligosaccharides (fructans + GOS) | **< 0.30 g** | Grain/cereal products, pulses/legumes, nuts and seeds | Higher allowance because these are staple carbohydrate foods |
| Total oligosaccharides (fructans + GOS) | **< 0.20 g** | Vegetables, fruits and all other foods | |
| Excess fructose (fructose in excess of glucose) | **< 0.15 g** | All foods, when other FODMAPs are also present | |
| Excess fructose | **< 0.40 g** | When excess fructose is the *only* FODMAP present | Monash's 2024 vegetable review notes the fresh fruit/veg cut-off was set higher so a whole piece of fruit eaten alone could pass, while a lower value is used for foods eaten in combination |
| Lactose | **< 1.0 g** | All foods | Only relevant to lactose-intolerant individuals |
| Sorbitol *or* mannitol individually | **< 0.20 g** | All foods | |
| Total polyols (sorbitol + mannitol) | **< 0.40 g** | All foods | |

Verbatim quote as cited by PMC12766106 (Pre-packaged food targeted to gastrointestinal pathologies: are they low in FODMAP?), which attributes it to Varney 2017 (ref 16) and Pessarelli 2022 (ref 2):

> "< 0.30 g per serving of oligosaccharides (grain products, pulses, nuts and seeds) and < 0.20 g per serving (vegetables, fruits and all other food products) – including fructans and oligosaccharides; < 0.15 g per serving of fructose or < 0.40 g when is only FODMAP present; < 0.40 g per serving of total polyols or < 0.20 g only sorbitol or mannitol; < 1.0 g per serving of lactose"

Source: https://pmc.ncbi.nlm.nih.gov/articles/PMC12766106/

Cross-check (Pessarelli et al. 2022, *Front Nutr* 9:1007716, citing Varney 2017): oligosaccharides < 0.3 g/serve for core grain products, legumes, nuts and seeds, or < 0.2 g/serve for vegetables, fruits and all other products; total polyols < 0.4 g/serve; excess fructose < 0.4 g/serve [the "only FODMAP present" case]; lactose < 1 g/serve.
Source: https://www.frontiersin.org/journals/nutrition/articles/10.3389/fnut.2022.1007716/full

Cross-check (FODMAP Profile of Wholegrain Pasta, PMC11853891, Table 4, dry pasta): oligosaccharides 0.3 g, excess fructose 0.15 g, polyols 0.4 g, lactose 1 g per serve; also a bread-specific rule quoted in the search results: a 50 g bread serve is low FODMAP if it does not exceed 0.3 g oligosaccharides, 0.15 g excess fructose, 0.4 g polyols, and 0.5 g total FODMAPs excluding lactose.
Source: https://pmc.ncbi.nlm.nih.gov/articles/PMC11853891/

## Moderate vs high

Varney 2017 (as publicly cited) defines only the LOW threshold. Monash's app "traffic light" system adds a MODERATE (amber) band above the low cut-off and a HIGH (red) band above that; the amber/red boundary values are **not published** on Monash's public pages. Monash's own blog ("How are traffic lights determined?", https://www.monashfodmap.com/blog/how-traffic-lights-are-determined/) confirms cut-off levels exist but does not quantify them. Monash also states the cut-offs "represent the amount of FODMAPs that the majority of people with IBS can consume without experiencing IBS symptoms."

Practical reading for the app: a food's *green serve* is the largest portion under the low cut-off; the *amber* serve exceeds the low cut-off but below an unpublished high threshold; *red* exceeds it. Per-food green/amber/red gram values in `monash-public.json` come from Monash blog posts that state them explicitly (e.g. sweet potato 75 g / >100 g / >112 g).

## Named exceptions to "dose makes the poison"

Monash label-reading guidance (https://www.monashfodmap.com/blog/update-label-reading/) says onion, garlic (including powders) and purified FODMAP additives (inulin, FOS, GOS) are treated as high FODMAP at *any* amount because "even very small amounts will contribute significantly to the overall FODMAP load of the food."

## Other numeric anchors from Monash public pages

- Standard serve used for vegetables in the app: 75 g (about 1/2 cup cooked / 1 cup raw leaves). Standard fruit serve: ~150 g (1 medium orange or banana, 2 small kiwis, 1 cup grapes). Sources: low-fodmap-shopping-list, low-fodmap-diet-and-diabetes.
- Lactose tolerance: "most people with lactose intolerance can tolerate 12-15 g of lactose per day (about 250 ml regular milk)"; up to 2 cups/day if spread across meals. Sources: what-is-lactose-intolerance, lactose-and-dairy-products-on-low.
- Polyol symptom dose: a 10 g dose of sorbitol or mannitol significantly increased GI symptoms in IBS. Source: sweeteners-and-low-fodmap-diet.
- Garlic: 3 g considered high in fructans; Brussels sprouts: 75 g considered high. Source: fructans-fodmap-reintroduction.
- Sourdough: traditional spelt sourdough proved >12 h tests low. Source: sourdough-processing-fodmaps.
- 2024 vegetable review changed the excess-fructose cut-off applied to vegetables so green serves of several fructose-containing vegetables shrank (e.g. broccolini heads 58 g -> 21 g). Source: fructose-changes-vegetables.
