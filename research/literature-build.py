#!/usr/bin/env python3
"""Build /Users/jon/code/fodmap/research/literature.json from literature values gathered 2026-09-17.

Rating rule (Varney 2017 Table 1 cutoffs, per serving):
  oligosaccharides (fructans + GOS): <0.30 g for core grain products, legumes, nuts, seeds; <0.20 g for vegetables, fruit, all other products
  sorbitol or mannitol individually: <0.20 g; total polyols: <0.40 g
  excess fructose (fructose - glucose): <0.15 g; or <0.40 g for fresh fruit/vegetables where excess fructose is the only FODMAP present
  lactose: <1.00 g
  low  = amount at the typical serving is below the cutoff
  moderate = at or above the cutoff but below 2x the cutoff (our operational band; Varney defines only the low cutoff)
  high = at or above 2x the cutoff
"""
import json, math

URL = {
 'muir2007': 'https://pubmed.ncbi.nlm.nih.gov/17625872/',
 'muir2007tab': 'https://foodintolerances.org/en/food-dictionary/fructan-and-fructooligosaccharide-content-of-food',
 'muir2009': 'https://pubmed.ncbi.nlm.nih.gov/19123815/',
 'bies2011': 'https://pubmed.ncbi.nlm.nih.gov/21332832/',
 'varney': 'https://www.semanticscholar.org/paper/838d6fe0e6f7feb34f1e7e70fc576827409cf4f3',
 'yao': 'https://www.semanticscholar.org/paper/5a63460256c27ead902862cdb9741b93a18c6dba',
 'tuck': 'https://pubmed.ncbi.nlm.nih.gov/29473657/',
 'tuckblog2': 'https://www.monashfodmap.com/blog/new-research-fermentable-short-chain-carbohydrate-fodmap-content-common-plant-based-foods-and-processed-foods-suitable-vegetarian-and-vegan-based-eating-patterns-part-2/',
 'tuckblog1': 'https://www.monashfodmap.com/blog/new-research-fermentable-short-chain-carbohydrate-fodmap-content-common-plant-based-foods-and-processed-foods-suitable-vegetarian-and-vegan-based-eating-patterns-part-1/',
 'lomer': 'https://pubmed.ncbi.nlm.nih.gov/27002546/',
 'ispiryan': 'https://iris.uniroma1.it/bitstream/11573/1660901/1/Ispiryan_FODMAP-modulation_2022.pdf',
 'chump': 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6063767/',
 'pejcz24': 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10820302/',
 'torbica': 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11853891/',
 'pejcz23': 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10572427/',
 'ziegler': 'https://www.sciencedirect.com/science/article/abs/pii/S1756464616301463',
 'whelan': 'https://figshare.com/articles/journal_contribution/Fructan_content_of_commonly_consumed_wheat_rye_and_gluten-free_breads/20774788',
 'italy25': 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11858256/',
 'spain24': 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11178640/',
 'austria21': 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8074121/',
 'cnf': 'https://food-nutrition.canada.ca/api/canadian-nutrient-file/',
 'usda': 'https://fdc.nal.usda.gov/',
 'pmc9967297': 'https://pmc.ncbi.nlm.nih.gov/articles/PMC9967297/',
}

OLIGO_03 = {'grain', 'legume', 'nut-seed'}

def rate(amount, cutoff):
    if amount is None:
        return None
    if amount < cutoff:
        return 'low'
    if amount < 2 * cutoff:
        return 'moderate'
    return 'high'

def fmt(x):
    if x is None:
        return None
    return round(x, 3)

F = []  # food records

def add(name, category, serving, aliases=None, fr=None, gos=None, lac=None, fru=None, glu=None, sor=None, man=None,
        ef_sole=False, oligo_cutoff=None, note='', url=None, manual=None, ef_override=None, servingLabel=None):
    """Values are g per 100 g as eaten unless the note says otherwise. manual = dict of rating overrides when no number exists."""
    F.append(dict(name=name, category=category, serving=serving, aliases=aliases or [], fr=fr, gos=gos, lac=lac, fru=fru, glu=glu,
                  sor=sor, man=man, ef_sole=ef_sole, oligo_cutoff=oligo_cutoff, note=note, url=url, manual=manual or {},
                  ef_override=ef_override, servingLabel=servingLabel))

# ------------------------------------------------------------------ VEGETABLES (fructans: Muir 2007 as tabulated; polyols: Yao 2014 Table 1 incl. Muir 2009 published data)
add('garlic', 'vegetable', 3, ['garlic clove'], fr=17.4, sor=0, man=0,
    note='Muir 2007 (JAFC 55:6619) fructan 17.4 g/100 g fw (top of the 1.2-17.4 g/100 g garlic/artichoke/shallot/leek/onion range; foodintolerances.org tabulation lists 9.8-17.4); quoted at 17.4 in PMC9967297. Serving 1 clove 3 g = 0.52 g fructan vs 0.2 g cutoff -> high.', url=URL['muir2007'])
add('jerusalem artichoke', 'vegetable', 75, ['sunchoke'], fr=12.2,
    note='Muir 2007 fructan 12.2 g/100 g (PMC9967297 quoting Muir; tabulated range 12.2-20). 75 g = 9.2 g fructan vs 0.2 g -> high.', url=URL['pmc9967297'])
add('shallot', 'vegetable', 30, [], fr=8.9,
    note='Muir 2007 fructan 8.9 g/100 g (PMC9967297 quoting Muir; tabulated range 0.9-8.9). 30 g = 2.7 g vs 0.2 g -> high.', url=URL['pmc9967297'])
add('leek', 'vegetable', 75, ['leek bulb'], fr=7.1, sor=0, man=0,
    note='Muir 2007 fructan, leek bulb (white part) 7.1 g/100 g (tabulated by foodintolerances.org citing Muir 2007). Yao 2014: sorbitol 0, mannitol 0. 75 g = 5.3 g fructan vs 0.2 g -> high. Green leaves not analysed here (Monash rates leaves low).', url=URL['muir2007tab'])
add('onion', 'vegetable', 75, ['brown onion', 'white onion', 'red onion', 'spanish onion'], fr=1.8, gos=0.19, sor=0, man=0,
    note='Varney 2017 Table 2: onion uncooked 36 g = 0.65 g total fructan + 0.07 g GOS -> 1.8 g fructan and 0.19 g GOS per 100 g. Muir 2007 tabulated: brown onion 2.1, white onion 1.1-7.5, Spanish onion 0.1-1.8 g/100 g. 75 g = 1.35 g fructan vs 0.2 g cutoff -> high; low only at <=11 g.', url=URL['varney'])
add('onion powder', 'herb-spice', 2, [], fr=4.5, fru=1.67, glu=0.73,
    note='Fructan 4.5 g/100 g (foodintolerances.org tabulation citing Muir 2007/FSANZ); CNF 194 fructose 1.67, glucose 0.73. 1 tsp 2 g = 0.09 g fructan vs 0.2 g -> low; moderate 5-8 g; high >=9 g.', url=URL['muir2007tab'])
add('artichoke', 'vegetable', 120, ['globe artichoke'], fr=1.2, sor=0, man=0,
    note='Muir 2007 globe artichoke fructan 1.2 g/100 g (lower bound of the 1.2-17.4 high-fructan group; tabulated range 1.2-6.8). Yao 2014 artichoke hearts sorbitol 0, mannitol 0. 120 g (1 medium, hearts) = 1.4 g fructan vs 0.2 g -> high.', url=URL['muir2007'])
add('asparagus', 'vegetable', 75, [], fru=1.0, glu=0.65, sor=0, man=0.1,
    note='Muir 2009: asparagus among vegetables with >0.2 g/100 g kestose+nystose (FOS) - exact value not accessible, fructans left null. Yao 2014 (Muir 2009 published data): sorbitol 0, mannitol 0.1 g/100 g. CNF 1990 fructose 1.00, glucose 0.65 -> excess fructose 0.35 g/100 g; 75 g = 0.26 g vs 0.15 g (other FODMAPs present) -> moderate; mannitol 0.075 g -> low.', url=URL['muir2009'])
add('beet', 'vegetable', 75, ['beetroot'], fr=0.4,
    note='Muir 2007 beetroot fructan 0.4 g/100 g (tabulated). 75 g = 0.30 g vs 0.2 g -> moderate; low <=50 g; high >=100 g.', url=URL['muir2007tab'])
add('beet, pickled', 'processed', 60, ['pickled beetroot'], fr=0.03,
    note='Derived: Tuck 2018 reports pickling lowered FODMAP content of beetroot, onion and garlic by 89-97% (Monash blog part 2). 0.4 g/100 g x (1-0.93) ~= 0.03 g/100 g (range 0.01-0.04). 60 g (Tuck meal-plan serve) = 0.02 g vs 0.2 g -> low.', url=URL['tuckblog2'])
add('brussels sprouts', 'vegetable', 75, [], fr=0.3, sor=0.2, man=0, fru=0.93, glu=0.81,
    note='Muir 2007 fructan 0.3 g/100 g (tabulated); Yao 2014/Muir 2009 sorbitol 0.2, mannitol 0; CNF 2378 fructose 0.93, glucose 0.81. 75 g: fructan 0.225 g vs 0.2 -> moderate; sorbitol 0.15 vs 0.2 -> low; excess fructose 0.09 vs 0.15 -> low. Low <=66 g.', url=URL['yao'])
add('cabbage', 'vegetable', 75, ['green cabbage', 'common cabbage'], sor=0.2, man=0, fru=1.45, glu=1.67,
    note='Yao 2014 (Muir 2009 data) common cabbage sorbitol 0.2, mannitol 0 g/100 g; CNF 2361 fructose 1.45 < glucose 1.67 (no excess). Muir 2009 notes FOS >0.2 g/100 g in cabbage (value not accessible). 75 g sorbitol 0.15 g vs 0.2 -> low.', url=URL['yao'])
add('cabbage, red', 'vegetable', 75, [], fru=1.48, glu=1.74,
    note='CNF 2034 fructose 1.48 < glucose 1.74 -> no excess fructose -> low for fructose; fructans/polyols not measured here.', url=URL['cnf'])
add('bok choy', 'vegetable', 75, ['pak choi'], sor=0.2, man=0,
    note='Yao 2014 (Muir 2009 data) sorbitol 0.2, mannitol 0 g/100 g. 75 g = 0.15 g sorbitol vs 0.2 -> low; moderate from 100 g.', url=URL['yao'])
add('broccoli', 'vegetable', 75, [], sor=0.4, man=0, fru=0.68, glu=0.49,
    note='Yao 2014 (Muir 2009 data) sorbitol 0.4, mannitol 0 g/100 g; Chumpitazi 2018 frozen broccoli sorbitol 0.04. CNF 2374 fructose 0.68, glucose 0.49 (excess 0.19). 75 g: sorbitol 0.30 g vs 0.2 -> moderate (low <=50 g, high >=100 g); excess fructose 0.14 vs 0.15 -> low. Monash app rates broccoli heads low at 75 g - cultivar/portion differences.', url=URL['yao'])
add('cauliflower', 'vegetable', 75, [], sor=0, man=2.6, fru=0.97, glu=0.94,
    note='Yao 2014 (Muir 2009 data) mannitol 2.6 g/100 g (1 cup 132 g = 3.4 g); CNF 2385 fructose 0.97, glucose 0.94. 75 g = 1.95 g mannitol vs 0.2 -> high; low only <=7 g.', url=URL['yao'])
add('mushroom, button', 'vegetable', 75, ['white mushroom', 'mushroom'], sor=0.1, man=2.6, fru=0.17, glu=1.48,
    note='Yao 2014 (Muir 2009 data) mushrooms sorbitol 0.1, mannitol 2.6 g/100 g; Varney 2017 Table 2 mushroom 74 g = 1.95 g mannitol + 0.08 g sorbitol -> high (total polyols >0.4). CNF 2399 fructose 0.17 < glucose 1.48. 75 g = 1.95 g mannitol -> high; low <=7 g.', url=URL['varney'])
add('mushroom, oyster', 'vegetable', 75, [], fru=0, glu=1.11,
    note='CNF 4866 fructose 0, glucose 1.11 -> no excess fructose. Mannitol not measured in CNF; Monash rates oyster mushroom low (mannitol lower than button). Only fructose rated.', url=URL['cnf'])
add('mushroom, shiitake', 'vegetable', 75, [], fru=0, glu=2.38,
    note='CNF 6904 fructose 0, glucose 2.38 -> no excess fructose. Mannitol not measured in CNF.', url=URL['cnf'])
add('mushroom, portobello', 'vegetable', 75, ['portabella'], fru=0.49, glu=2.01,
    note='CNF 4973 fructose 0.49 < glucose 2.01 -> no excess fructose. Mannitol not measured in CNF.', url=URL['cnf'])
add('snow pea', 'vegetable', 75, ['mangetout'], sor=0, man=1.2,
    note='Yao 2014 (Muir 2009 data) mannitol 1.2 g/100 g (10 pods 33 g = 0.4 g). 75 g = 0.9 g mannitol vs 0.2 -> high; low <=16 g.', url=URL['yao'])
add('sugar snap pea', 'vegetable', 75, [], sor=0, man=0,
    note='Yao 2014 sorbitol 0, mannitol 0 g/100 g -> polyols low. Fructans/GOS not measured here (Monash rates sugar snap peas moderate/high for fructans at 75 g).', url=URL['yao'])
add('sweet potato', 'vegetable', 75, [], sor=0, man=0.3, fru=0.7, glu=0.96,
    note='Yao 2014 (Muir 2009 data) mannitol 0.3, sorbitol 0 g/100 g; CNF 2240 fructose 0.70 < glucose 0.96. 75 g = 0.225 g mannitol vs 0.2 -> moderate; low <=66 g; high >=134 g.', url=URL['yao'])
add('celery', 'vegetable', 75, [], sor=0, man=1.5, fru=0.37, glu=0.4,
    note='Yao 2014 present-study mannitol 1.5 g/100 g (1 cup 127 g = 1.9 g); USDA 0.2. CNF 2386 mannitol 0.1, fructose 0.37, glucose 0.40. Using Yao: 75 g = 1.1 g vs 0.2 -> high; low <=13 g. Large analytical disagreement (Yao 1.5 vs CNF/USDA 0.1-0.2).', url=URL['yao'])
add('celeriac', 'vegetable', 75, ['celery root'], sor=0, man=0.1,
    note='Yao 2014 mannitol 0.1, sorbitol 0 g/100 g. 75 g = 0.075 g vs 0.2 -> low.', url=URL['yao'])
add('pumpkin, butternut', 'vegetable', 75, ['butternut squash'], sor=0, man=0.4, fru=1.28, glu=0.94,
    note='Yao 2014 butternut pumpkin mannitol 0.4, sorbitol 0 g/100 g; CNF 2451 fructose 1.28, glucose 0.94 (excess 0.34). 75 g: mannitol 0.30 vs 0.2 -> moderate (low <=50 g); excess fructose 0.26 vs 0.15 -> moderate.', url=URL['yao'])
add('parsnip', 'vegetable', 75, [], sor=0, man=0,
    note='Yao 2014 sorbitol 0, mannitol 0 -> polyols low; other FODMAPs not measured here.', url=URL['yao'])
add('water chestnut', 'vegetable', 75, [], sor=0, man=0,
    note='Yao 2014 sorbitol 0, mannitol 0 -> polyols low.', url=URL['yao'])
add('arugula', 'vegetable', 35, ['rocket'], sor=0, man=0,
    note='Yao 2014 lettuce (rocket) sorbitol 0, mannitol 0 -> polyols low.', url=URL['yao'])
add('seaweed', 'vegetable', 40, ['nori', 'kelp'], sor=0, man=0,
    note='Yao 2014 seaweed sorbitol 0, mannitol trace -> polyols low. Tuck 2018: dulse 0.02 g FODMAP/serve, kelp noodles no FODMAPs detected -> low.', url=URL['yao'])
add('tomato, sun-dried', 'vegetable', 7, [], sor=0, man=0,
    note='Yao 2014 sundried tomatoes sorbitol 0, mannitol 0 -> polyols low (1 tbsp 7 g). Fructans not measured (Monash: moderate at larger serves).', url=URL['yao'])
add('radish', 'vegetable', 75, [], sor=0, man=0.1, fru=0.71, glu=1.05,
    note='Yao 2014 sorbitol 0, mannitol 0 (USDA 0.1); CNF 2443 mannitol 0.1, fructose 0.71 < glucose 1.05. 75 g mannitol 0.075 -> low.', url=URL['yao'])
add('carrot', 'vegetable', 75, [], sor=0, man=0.2, fru=0.55, glu=0.59,
    note='Yao 2014 published data sorbitol 0, mannitol 0; USDA/CNF 2380 mannitol 0.2 g/100 g; CNF fructose 0.55 < glucose 0.59. Using 0.2: 75 g = 0.15 g vs 0.2 -> low.', url=URL['cnf'])
add('cucumber', 'vegetable', 75, [], sor=0, man=0.1, fru=0.87, glu=0.76,
    note='Yao 2014/Muir 2009 sorbitol 0, mannitol 0; USDA/CNF 2363 mannitol 0.1; CNF fructose 0.87, glucose 0.76 (excess 0.11). 75 g: mannitol 0.075 -> low; excess fructose 0.08 vs 0.4 (sole FODMAP) -> low.', url=URL['cnf'], ef_sole=True)
add('corn, sweet', 'vegetable', 85, ['sweetcorn'], sor=0.5, man=0, fru=1.94, glu=3.43,
    note='Yao 2014 (Muir 2009 data) sweet corn sorbitol 0.5 g/100 g (1 cob 85 g = 0.4 g); Chumpitazi frozen corn sorbitol 0.04. CNF 2388 fructose 1.94 < glucose 3.43. 1 cob 85 g = 0.43 g sorbitol vs 0.2 -> high; low <=40 g; moderate 41-79 g.', url=URL['yao'])
add('bell pepper, green', 'vegetable', 75, ['green capsicum'], sor=0.4, man=0, fru=1.12, glu=1.16,
    note='Yao 2014 (Muir 2009 data) green capsicum sorbitol 0.4 g/100 g; CNF 2413 fructose 1.12 < glucose 1.16. 75 g = 0.30 g sorbitol vs 0.2 -> moderate; low <=50 g; high >=100 g.', url=URL['yao'])
add('bell pepper, red', 'vegetable', 75, ['red capsicum'], fru=2.26, glu=1.94,
    note='CNF 2484 fructose 2.26, glucose 1.94 -> excess 0.32 g/100 g; 75 g = 0.24 g vs 0.4 g (treated as sole FODMAP, fresh vegetable) -> low. Polyols not measured for red pepper.', url=URL['cnf'], ef_sole=True)
add('zucchini', 'vegetable', 75, ['courgette'], fr=0.29, fru=1.38, glu=1.07,
    note='Varney 2017 Table 2: zucchini uncooked 66 g = 0.19 g total fructan -> 0.29 g/100 g (Muir 2007 tabulated 0.3). CNF 2225 fructose 1.38, glucose 1.07 (excess 0.31). 75 g: fructan 0.22 g vs 0.2 -> moderate (low <=68 g, matches Monash 65 g low serve); excess fructose 0.23 vs 0.15 -> moderate.', url=URL['varney'])
add('spinach', 'vegetable', 75, ['baby spinach'], fr=0.1, fru=0.15, glu=0.11,
    note='Muir 2007 baby spinach fructan 0.1 g/100 g (tabulated); Chumpitazi frozen spinach FOS 0.14; CNF 2213 fructose 0.15, glucose 0.11. 75 g = 0.075 g fructan vs 0.2 -> low.', url=URL['muir2007tab'])
add('lettuce', 'vegetable', 75, ['romaine', 'butterhead'], fr=0.01, fru=0.8, glu=0.39,
    note='Chumpitazi 2018 fresh lettuce FOS 0.01, fructose 0.10, glucose 0.12; CNF 2116 romaine fructose 0.80, glucose 0.39 (excess 0.41 -> 75 g = 0.31 g vs 0.4 sole-FODMAP cutoff -> low). Low.', url=URL['chump'], ef_sole=True)
add('tomato', 'vegetable', 75, [], fru=1.37, glu=1.25,
    note='CNF 2460 fructose 1.37, glucose 1.25 -> excess 0.12; Chumpitazi tomato fructose 1.01 < glucose 1.21. 75 g = 0.09 g vs 0.4 -> low.', url=URL['cnf'], ef_sole=True)
add('potato', 'vegetable', 150, [], fru=0.27, glu=0.33,
    note='CNF 2505 fructose 0.27 < glucose 0.33 -> no excess; Chumpitazi cooked rice/potato products: fries FOS 0.27 g/100 g. Potato low.', url=URL['cnf'])
add('eggplant', 'vegetable', 75, ['aubergine'], fru=1.54, glu=1.58,
    note='CNF 2088 fructose 1.54 < glucose 1.58 -> no excess fructose -> low.', url=URL['cnf'])
add('green bean', 'vegetable', 75, ['snap bean'], sor=0.01, man=0.02,
    note='Chumpitazi 2018 frozen green beans sorbitol 0.01, mannitol 0.02 g/100 g, no fructose/FOS detected. 75 g polyols 0.02 -> low.', url=URL['chump'])
add('okra', 'vegetable', 75, [], fru=0.57, glu=0.32,
    note='CNF 2134 fructose 0.57, glucose 0.32 -> excess 0.25; 75 g = 0.19 g vs 0.4 (sole) -> low.', url=URL['cnf'], ef_sole=True)
add('rutabaga', 'vegetable', 75, ['swede'], fru=1.61, glu=2.3,
    note='CNF 2444 fructose 1.61 < glucose 2.30 -> no excess -> low (fructose only).', url=URL['cnf'])
add('bitter melon', 'vegetable', 75, ['karela'], fr=0, gos=1.12,
    note='Lomer 2016 (Int J Food Sci Nutr 67:383) karela: fructans not detected, GOS 1.12 g/100 g. 75 g = 0.84 g GOS vs 0.2 -> high; low <=17 g.', url=URL['lomer'])

# ------------------------------------------------------------------ FRUIT
add('apple', 'fruit', 165, ['pink lady', 'apple with skin'], fr=0, gos=0, sor=1.2, man=0, fru=5.9, glu=2.43,
    note='Varney 2017 Table 2 pink lady 165 g: sorbitol 1.37 g, excess fructose 10.6 g -> high. Yao 2014/Muir 2009 sorbitol 1.2 g/100 g (USDA/CNF 0.3). CNF 1696 fructose 5.90, glucose 2.43 -> excess 3.47 g/100 g. 165 g: sorbitol 1.98 g vs 0.2 -> high; excess fructose 5.7 g vs 0.15 -> high. Low only <=4 g.', url=URL['varney'])
add('apple, dried', 'fruit', 45, [], sor=1.9, man=0,
    note='Yao 2014 dried apple sorbitol 1.9 g/100 g (0.5 cup 45 g = 0.9 g). 45 g = 0.86 g vs 0.2 -> high; low <=10 g.', url=URL['yao'])
add('apple juice', 'beverage', 250, [], sor=0.5, man=0, fru=5.73, glu=2.63,
    note='Yao 2014 apple juice sorbitol 0.5 g/100 g (USDA/CNF 1495: 1.0); CNF fructose 5.73, glucose 2.63 -> excess 3.1 g/100 g. 250 mL: sorbitol 1.25 g vs 0.2 -> high; excess fructose 7.75 g vs 0.15 -> high.', url=URL['yao'])
add('pear', 'fruit', 166, [], sor=2.3, man=0, fru=6.42, glu=2.6,
    note='Yao 2014/Muir 2009 sorbitol 2.3 g/100 g (USDA 2.3; 1 fruit 166 g = 3.8 g); CNF 1731 fructose 6.42, glucose 2.60 -> excess 3.82. 166 g: sorbitol 3.8 g -> high; excess fructose 6.3 g -> high. Low only <=4 g.', url=URL['yao'])
add('pear, dried', 'fruit', 27, [], sor=8.1, man=0,
    note='Yao 2014 dried pear sorbitol 8.1 g/100 g (6 pieces 27 g = 2.2 g) -> high; low <=2 g.', url=URL['yao'])
add('plum', 'fruit', 66, [], sor=2.4, man=0, fru=3.07, glu=5.07,
    note='Yao 2014 present study plum sorbitol 2.4 g/100 g (USDA 0.6; CNF 1740 0.6); 1 fruit 66 g = 1.6 g vs 0.2 -> high. CNF fructose 3.07 < glucose 5.07 (no excess). Low <=8 g.', url=URL['yao'])
add('prune', 'fruit', 30, ['dried plum'], sor=10.8, man=0, fru=12.45, glu=25.46,
    note='Yao 2014 prunes sorbitol 10.8 g/100 g (USDA 12.0); CNF 1742 fructose 12.45 < glucose 25.46. 30 g (~4 prunes) = 3.2 g sorbitol vs 0.2 -> high; low <=1 g -> any serving high.', url=URL['yao'])
add('apricot', 'fruit', 112, [], sor=1.2, man=0, fru=0.94, glu=2.37,
    note='Yao 2014 present study apricot sorbitol 1.2 g/100 g (USDA 0.8; CNF 1498 0.8); 1 fruit 112 g = 1.3 g vs 0.2 -> high. CNF fructose 0.94 < glucose 2.37. Low <=16 g.', url=URL['yao'])
add('apricot, dried', 'fruit', 30, [], sor=6.0, man=0, fru=12.47, glu=33.08,
    note='Yao 2014 dried apricot sorbitol 6.0 g/100 g (0.5 cup 67 g = 4.1 g); CNF 1507 fructose 12.47 < glucose 33.08. 30 g = 1.8 g sorbitol -> high; low <=3 g.', url=URL['yao'])
add('cherry, sweet', 'fruit', 75, ['cherries'], sor=0.7, man=0, fru=5.37, glu=6.59,
    note='Yao 2014 present study cherries sorbitol 0.7 g/100 g (USDA 1.0-2.1; CNF 1531 2.1); CNF fructose 5.37 < glucose 6.59 (no excess by CNF, although Monash reports excess fructose in cherries). 75 g = 0.53 g sorbitol vs 0.2 -> high; 5 cherries 35 g = 0.25 -> moderate; low <=28 g.', url=URL['yao'])
add('cherry, sour', 'fruit', 75, ['tart cherry'], sor=1.0, fru=3.51, glu=4.18,
    note='CNF 1526 sour red cherry sorbitol 1.0 g/100 g, fructose 3.51 < glucose 4.18. 75 g = 0.75 g sorbitol vs 0.2 -> high; low <=20 g.', url=URL['cnf'])
add('nectarine', 'fruit', 151, [], sor=1.0, man=0, fru=1.37, glu=1.57,
    note='Yao 2014/Muir 2009 nectarine sorbitol 1.0 g/100 g (USDA 0.6; CNF 1611 0.6); CNF fructose 1.37 < glucose 1.57. 1 fruit 151 g = 1.5 g sorbitol vs 0.2 -> high; low <=20 g.', url=URL['yao'])
add('peach', 'fruit', 145, ['yellow peach'], sor=0.9, man=0.5, fru=1.53, glu=1.95,
    note='Yao 2014/Muir 2009 peach sorbitol 0.9 + mannitol 0.5 g/100 g (USDA 0.2/0; CNF 1728 sorbitol 0.2); CNF fructose 1.53 < glucose 1.95. 145 g: sorbitol 1.3 g, mannitol 0.73 g, total 2.0 g vs 0.4 -> high; low <=22 g.', url=URL['yao'])
add('peach, white', 'fruit', 145, [], fr=0.4,
    note='Muir 2007 white peach fructan 0.4 g/100 g (abstract range 0.21-0.46 for longan/white peach/persimmon/melon). 145 g = 0.58 g vs 0.2 -> high; low <=50 g.', url=URL['muir2007'])
add('blackberry', 'fruit', 50, ['blackberries'], sor=4.1, man=0, fru=2.4, glu=2.31,
    note='Yao 2014 (Muir 2009 data) blackberries sorbitol 4.1 g/100 g (10 berries 50 g = 2.1 g); CNF 1515 fructose 2.40, glucose 2.31. 50 g = 2.05 g sorbitol vs 0.2 -> high; low <=4 g.', url=URL['yao'])
add('boysenberry', 'fruit', 80, [], sor=0, man=0,
    note='Yao 2014 boysenberries sorbitol 0, mannitol 0 -> polyols low.', url=URL['yao'])
add('carambola', 'fruit', 116, ['star fruit'], sor=0, man=0,
    note='Yao 2014 carambola sorbitol 0, mannitol 0 -> polyols low. Fructose: foodintolerances.org F 8 / G 7 g/100 g (F/G 1.1).', url=URL['yao'])
add('grape', 'fruit', 150, ['grapes'], sor=0, man=0, fru=8.13, glu=7.2,
    note='Yao 2014/Muir 2009 grapes sorbitol 0 (USDA 0.1), mannitol 0. CNF 1718 fructose 8.13, glucose 7.20 -> excess 0.93 g/100 g -> 150 g = 1.4 g vs 0.4 (sole FODMAP) -> high; low <=43 g. Chumpitazi 2018 red grapes fructose 7.04 < glucose 12.11 (no excess). Databases disagree; Monash re-tested grapes (2023) and now limits serves for excess fructose.', url=URL['cnf'], ef_sole=True)
add('longan', 'fruit', 75, [], fr=0.5, sor=0.7, man=0,
    note='Muir 2007 longan fructan 0.5 g/100 g (tabulated; abstract 0.21-0.46 group); Yao 2014/Muir 2009 sorbitol 0.7. 75 g: fructan 0.375 vs 0.2 -> moderate; sorbitol 0.525 vs 0.2 -> high. Low <=28 g (5 fruits 15 g low).', url=URL['yao'])
add('persimmon', 'fruit', 168, [], fr=0.3, fru=5.56, glu=5.44,
    note='Muir 2007 persimmon fructan 0.3 g/100 g; CNF 1653 fructose 5.56, glucose 5.44 (excess 0.12). 1 medium 168 g: fructan 0.50 g vs 0.2 -> high (low <=66 g); excess fructose 0.20 vs 0.15 -> moderate.', url=URL['muir2007'])
add('rambutan', 'fruit', 75, [], fr=0.4,
    note='Muir 2007 rambutan fructan 0.4 g/100 g (tabulated). 75 g = 0.30 g vs 0.2 -> moderate; low <=50 g; high >=100 g.', url=URL['muir2007tab'])
add('watermelon', 'fruit', 150, [], fr=0.3, fru=3.36, glu=1.58,
    note='Muir 2007 seedless watermelon fructan 0.3 g/100 g; Muir 2009: watermelon contains excess fructose and mannitol (mannitol value not accessible). CNF 1691 fructose 3.36, glucose 1.58 -> excess 1.78. 150 g: fructan 0.45 g vs 0.2 -> high; excess fructose 2.7 g vs 0.15 -> high. Low <=8 g.', url=URL['muir2009'])
add('melon, honeydew', 'fruit', 150, ['honeydew'], fr=0.2, fru=2.96, glu=2.68,
    note='Muir 2007 honeydew fructan 0.2 g/100 g (abstract melon 0.21-0.46 group); CNF 1605 fructose 2.96, glucose 2.68 -> excess 0.28. 150 g: fructan 0.30 vs 0.2 -> moderate (low <=100 g); excess fructose 0.42 vs 0.15 -> high. Small F-G differences from generic databases are within analytical noise; Monash rates honeydew low at 90 g.', url=URL['muir2007'])
add('melon, cantaloupe', 'fruit', 150, ['rockmelon', 'cantaloupe'], fr=0.2, fru=1.87, glu=1.54,
    note='Muir 2007 cantaloupe fructan 0.2 g/100 g; CNF 1721 fructose 1.87, glucose 1.54 -> excess 0.33. 150 g: fructan 0.30 vs 0.2 -> moderate (low <=100 g); excess fructose 0.5 vs 0.15 -> high. See honeydew caveat; Monash rates cantaloupe low at 120 g.', url=URL['muir2007'])
add('mango', 'fruit', 150, [], fru=4.68, glu=2.01,
    note='Muir 2009: mango contains fructose in excess of glucose. CNF 1603 fructose 4.68, glucose 2.01 -> excess 2.67 g/100 g. 150 g = 4.0 g vs 0.4 (sole FODMAP) -> high; low <=15 g.', url=URL['muir2009'], ef_sole=True)
add('banana', 'fruit', 100, ['firm banana', 'unripe banana'], fr=0.15, fru=4.85, glu=4.98,
    note='Chumpitazi 2018 firm banana FOS 0.15 g/100 g, fructose 3.21 < glucose 5.93; Muir 2007 tabulated banana fructan 0.0-0.7 (rises with ripening); CNF 1704 fructose 4.85 < glucose 4.98. 100 g: fructan 0.15 vs 0.2 -> low (ripe bananas approach/exceed cutoff at 100 g per Monash).', url=URL['chump'])
add('orange', 'fruit', 130, ['navel orange'], fr=0, gos=0, sor=0, man=0, fru=2.01, glu=3.01,
    note='Varney 2017 Table 2 orange 130 g: no FODMAPs detected -> low. Chumpitazi navel orange fructose 2.01 < glucose 3.01.', url=URL['varney'])
add('orange juice', 'beverage', 250, [], sor=0, man=0, fru=2.23, glu=2.08,
    note='Yao 2014 orange juice sorbitol 0, mannitol 0; CNF 1620 fructose 2.23, glucose 2.08 -> excess 0.15; 250 mL = 0.375 g vs 0.4 (sole) -> low, borderline (Monash: low at 100 mL, higher serves moderate).', url=URL['yao'], ef_sole=True)
add('tangerine', 'fruit', 130, ['mandarin'], fru=2.4, glu=2.13,
    note='CNF 1623 fructose 2.40, glucose 2.13 -> excess 0.27; 130 g = 0.35 g vs 0.4 (sole) -> low.', url=URL['cnf'], ef_sole=True)
add('clementine', 'fruit', 130, [], fru=1.64, glu=1.59,
    note='CNF 5956 fructose 1.64, glucose 1.59 -> excess 0.05 -> low.', url=URL['cnf'], ef_sole=True)
add('grapefruit', 'fruit', 150, [], fr=0.2, fru=1.77, glu=1.61,
    note='Fructan 0.2 g/100 g (foodintolerances.org tabulation citing Muir 2007/Van Loo); CNF 1562 fructose 1.77, glucose 1.61 (excess 0.16). 150 g: fructan 0.30 vs 0.2 -> moderate (low <=100 g); excess fructose 0.24 vs 0.15 -> moderate.', url=URL['muir2007tab'])
add('lemon', 'fruit', 30, [], fru=0.9, glu=1.0,
    note='CNF 1587 fructose 0.90 < glucose 1.00 -> low.', url=URL['cnf'])
add('lime', 'fruit', 30, [], fru=0.61, glu=0.6,
    note='CNF 1593 fructose 0.61, glucose 0.60 -> excess 0.01 -> low.', url=URL['cnf'], ef_sole=True)
add('kiwifruit', 'fruit', 150, ['kiwi'], fru=4.35, glu=4.11,
    note='CNF 1585 fructose 4.35, glucose 4.11 -> excess 0.24; 150 g = 0.36 g vs 0.4 (sole) -> low.', url=URL['cnf'], ef_sole=True)
add('strawberry', 'fruit', 150, ['strawberries'], sor=0, man=0, fru=2.44, glu=1.99,
    note='Yao 2014 strawberries sorbitol 0, mannitol 0. CNF 1749 fructose 2.44, glucose 1.99 -> excess 0.45 g/100 g; 150 g = 0.68 g vs 0.4 (sole) -> moderate; low <=88 g (Monash 2022 re-test: low at 65 g). Chumpitazi strawberry fructose 1.31 < glucose 1.71.', url=URL['cnf'], ef_sole=True)
add('raspberry', 'fruit', 150, ['raspberries'], gos=0, fr=0.016, fru=2.35, glu=1.86,
    note='CNF 1747 fructose 2.35, glucose 1.86 -> excess 0.49; 150 g = 0.74 g vs 0.4 (sole) -> moderate; low <=81 g. Italian 2025 (PMC11858256) raspberries kestose 0.0159 g/100 g, GOS <LOQ.', url=URL['cnf'], ef_sole=True)
add('blueberry', 'fruit', 150, ['blueberries'], fr=0.011, fru=4.97, glu=4.88,
    note='CNF 1705 fructose 4.97, glucose 4.88 -> excess 0.09 -> 150 g = 0.14 g vs 0.4 -> low. Italian 2025 nystose 0.0106 g/100 g.', url=URL['cnf'], ef_sole=True)
add('cranberry', 'fruit', 75, [], fru=0.63, glu=3.28,
    note='CNF 1538 fructose 0.63 < glucose 3.28 -> no excess -> low (fresh).', url=URL['cnf'])
add('cranberry juice cocktail', 'beverage', 250, ['cranberry juice, sweetened (US)'], fr=0.01, fru=5.81, glu=2.84,
    note='Chumpitazi 2018 Ocean Spray cranberry juice: fructose 5.81, glucose 2.84 -> excess 2.97 g/100 g (HFCS-sweetened); 250 mL = 7.4 g vs 0.15 -> high.', url=URL['chump'])
add('pineapple', 'fruit', 150, [], fru=2.12, glu=1.73,
    note='CNF 1734 fructose 2.12, glucose 1.73 -> excess 0.39; 150 g = 0.59 g vs 0.4 (sole) -> moderate; low <=102 g. Chumpitazi pineapple fructose 1.91 < glucose 2.97.', url=URL['cnf'], ef_sole=True)
add('papaya', 'fruit', 150, [], fru=3.73, glu=4.09,
    note='CNF 1628 fructose 3.73 < glucose 4.09 -> low.', url=URL['cnf'])
add('jackfruit', 'fruit', 150, [], fru=9.19, glu=9.48,
    note='CNF 1581 fructose 9.19 < glucose 9.48 -> low for fructose (fructans not measured).', url=URL['cnf'])
add('pomegranate', 'fruit', 75, ['pomegranate arils'], sor=0.005, man=0.3, fru=6.37, glu=6.28,
    note='Yao 2014 pomegranate sorbitol trace, mannitol 0.3 g/100 g; CNF 6661 juice fructose 6.37 ~ glucose 6.28. 75 g arils = 0.225 g mannitol vs 0.2 -> moderate; low <=66 g.', url=URL['yao'])
add('fig', 'fruit', 50, ['fresh fig'], sor=0, man=0,
    note='Yao 2014 figs sorbitol 0, mannitol 0 -> polyols low. Fresh-fig sugars not in CNF; Monash lists excess fructose as the FODMAP in figs (not rated here).', url=URL['yao'])
add('fig, dried', 'fruit', 30, [], fru=22.93, glu=24.79,
    note='CNF 1549 dried fig fructose 22.93 < glucose 24.79 -> no excess by CNF (foodintolerances.org F 24 / G 26). Fructans not measured (Monash rates dried figs high for fructans).', url=URL['cnf'])
add('date', 'fruit', 30, ['medjool date'], fru=31.95, glu=33.68,
    note='CNF 5401 medjool fructose 31.95 < glucose 33.68 -> no excess fructose; fructans not measured here (Monash rates dates high for fructans at 30 g).', url=URL['cnf'])
add('raisin', 'fruit', 30, ['sultana'], fru=29.68, glu=27.75, gos=0.055,
    note='CNF 1745 fructose 29.68, glucose 27.75 -> excess 1.93 g/100 g; 30 g = 0.58 g vs 0.4 (dried fruit treated as sole) -> moderate; low <=20 g. Italian 2025 raisins raffinose 0.0545 g/100 g. Fructans not measured (Monash: fructans limit raisins to 13 g).', url=URL['cnf'], ef_sole=True)
add('rhubarb', 'fruit', 104, [], sor=0, man=0,
    note='Yao 2014 rhubarb sorbitol 0, mannitol 0 -> polyols low.', url=URL['yao'])
add('tamarillo', 'fruit', 44, [], sor=0, man=0,
    note='Yao 2014 tamarillo sorbitol 0, mannitol 0 -> polyols low.', url=URL['yao'])
add('guava', 'fruit', 100, [], fr=0.41, gos=0,
    note='Lomer 2016 guava fructan 0.41 g/100 g, GOS not detected. 100 g = 0.41 g vs 0.2 -> high; low <=48 g.', url=URL['lomer'])
add('tamarind', 'condiment', 20, ['tamarind paste'], fr=2.35, gos=0.02,
    note='Lomer 2016 tamarind fructan 2.35, GOS 0.02 g/100 g. 20 g = 0.47 g oligos vs 0.2 -> high; low <=8 g.', url=URL['lomer'])
add('lychee', 'fruit', 75, ['litchi'],
    note='foodintolerances.org (NUTTAB/USDA-derived) litchi fructose 3, glucose 5 g/100 g -> no excess fructose -> low for fructose. No polyol/fructan measurement found.', url='https://foodintolerances.org/en/food-dictionary/fructose-content-of-food', fru=3, glu=5)
add('coconut, dried', 'fruit', 37, ['shredded coconut', 'desiccated coconut'], sor=0.6, man=0,
    note='Yao 2014 dried shredded coconut sorbitol 0.6 g/100 g (0.5 cup 37 g = 0.2 g). 37 g = 0.22 g vs 0.2 -> moderate; low <=33 g; high >=67 g.', url=URL['yao'])
add('coconut milk, canned', 'beverage', 125, ['coconut milk'], sor=0.1, man=0,
    note='Yao 2014 coconut milk sorbitol 0.1 g/100 g (1 cup 250 mL = 0.3 g); Tuck 2018 canned coconut milk 0.24 g total FODMAP per serve -> low. 125 mL = 0.125 g sorbitol vs 0.2 -> low; moderate 200-399 mL.', url=URL['tuck'])
add('avocado', 'fruit', 60, [], fru=0.12, glu=0.37,
    note='CNF 1511 fructose 0.12 < glucose 0.37 -> no excess. Sorbitol not in CNF for avocado (Monash: sorbitol limits avocado to ~30 g). Only fructose rated.', url=URL['cnf'])

# ------------------------------------------------------------------ SWEETENERS / CONDIMENTS / BEVERAGES / ALCOHOL
add('honey', 'sweetener', 20, [], fru=40.94, glu=35.75,
    note='CNF 4294 honey fructose 40.94, glucose 35.75 -> excess 5.2 g/100 g (foodintolerances.org 39/34). 1 tbsp 20 g = 1.04 g vs 0.15 -> high; low <=2 g (using the 0.4 g cutoff instead: low <=7 g, matching the Monash 7 g serve).', url=URL['cnf'])
add('molasses', 'sweetener', 20, ['fancy molasses'], fru=12.79, glu=11.92,
    note='CNF 4299 fancy molasses fructose 12.79, glucose 11.92 -> excess 0.87; 20 g = 0.17 g vs 0.15 -> moderate; low <=17 g. Blackstrap (CNF 4300) fructose 7.9, glucose 7.4 -> 20 g = 0.10 g -> low.', url=URL['cnf'])
add('maple syrup', 'sweetener', 20, [], fru=0.336, glu=0.651,
    note='CNF 4326 maple syrup fructose 0.34 < glucose 0.65 -> no excess -> low.', url=URL['cnf'])
add('brown sugar', 'sweetener', 20, [], fru=1.11, glu=1.35,
    note='CNF 4317 fructose 1.11 < glucose 1.35 -> low.', url=URL['cnf'])
add('lemonade, sweetened (US)', 'beverage', 250, [], fr=0.01, fru=6.34, glu=3.19,
    note='Chumpitazi 2018 Simply Lemonade fructose 6.34, glucose 3.19 -> excess 3.15 g/100 g (HFCS); 250 mL = 7.9 g vs 0.15 -> high.', url=URL['chump'])
add('sweet tea, bottled (US)', 'beverage', 250, [], fr=0.01, fru=4.99, glu=2.09,
    note='Chumpitazi 2018 Gold Peak sweet tea fructose 4.99, glucose 2.09 -> excess 2.9; 250 mL = 7.3 g -> high.', url=URL['chump'])
add('rice milk', 'beverage', 250, [], lac=0, fru=0.01, glu=0,
    note='Chumpitazi 2018 Rice Dream: fructose 0.01, no lactose/FOS/GOS -> low.', url=URL['chump'])
add('balsamic vinegar', 'condiment', 15, [], fru=7.38, glu=7.57,
    note='CNF 6196 fructose 7.38 < glucose 7.57 -> no excess -> low at 15 g.', url=URL['cnf'])
add('cider vinegar', 'condiment', 15, ['apple cider vinegar'], fru=0.3, glu=0.1, sor=0, man=0,
    note='CNF 13 fructose 0.3, glucose 0.1, sorbitol 0, mannitol 0 -> 15 g excess fructose 0.03 -> low.', url=URL['cnf'])
add('ketchup', 'condiment', 15, ['tomato ketchup'], fru=8.72, glu=10.25,
    note='CNF 2494 (Canadian, sucrose-sweetened) fructose 8.72 < glucose 10.25 -> low. US HFCS ketchups may carry excess fructose (Varney 2017 notes HFCS raises excess fructose in US processed foods).', url=URL['cnf'])
add('mayonnaise', 'condiment', 15, [], fr=0, gos=0, lac=0, fru=0, glu=0, sor=0, man=0,
    note="Chumpitazi 2018 Hellmann's mayonnaise: no FODMAPs detected -> low.", url=URL['chump'])
add('mustard', 'condiment', 10, [], fr=0, gos=0, lac=0, fru=0, glu=0, sor=0, man=0,
    note="Chumpitazi 2018 French's mustard: no FODMAPs detected -> low.", url=URL['chump'])
add('soy sauce', 'condiment', 15, [], fru=0, glu=0.7, lac=0,
    note='CNF 3330 soy sauce fructose 0, glucose 0.7 -> low.', url=URL['cnf'])
add('horseradish sauce', 'condiment', 5, ['wasabi paste'], sor=11.1, man=0.3,
    note='Yao 2014 horseradish sauce (wasabi) sorbitol 11.1, mannitol 0.3 g/100 g (1 tsp 5 g = 0.6 g). 5 g = 0.56 g sorbitol vs 0.2 -> high (added sorbitol); low <=1 g.', url=URL['yao'])
add('chewing gum, sugar-free', 'processed', 4, ['sugarless gum'], sor=41.9, man=0,
    note='Yao 2014 sugarless chewing gum sorbitol 41.9 g/100 g; 2 strips 4 g = 1.7 g vs 0.2 -> high.', url=URL['yao'])
add('beer', 'alcohol', 375, [], sor=0, man=0, fru=0, glu=0,
    note='Yao 2014 beer sorbitol 0, mannitol 0; CNF 2943 regular beer fructose 0, glucose 0 -> low.', url=URL['yao'])
add('wine, red', 'alcohol', 150, [], sor=0, man=0,
    note='Yao 2014 red wine sorbitol 0, mannitol 0 -> polyols low (sugars not measured here).', url=URL['yao'])
add('wine, white', 'alcohol', 150, [], sor=0, man=0,
    note='Yao 2014 white wine sorbitol 0, mannitol 0 -> polyols low.', url=URL['yao'])
add('gin', 'alcohol', 30, [], sor=0, man=0, note='Yao 2014 gin sorbitol 0, mannitol 0 -> low.', url=URL['yao'])
add('rum', 'alcohol', 30, [], sor=0, man=0, note='Yao 2014 rum sorbitol 0, mannitol 0 -> low.', url=URL['yao'])
add('vodka', 'alcohol', 30, [], sor=0, man=0, note='Yao 2014 vodka sorbitol 0, mannitol 0 -> low.', url=URL['yao'])
add('whiskey', 'alcohol', 30, [], sor=0, man=0, note='Yao 2014 whiskey sorbitol 0, mannitol 0 -> low.', url=URL['yao'])

# ------------------------------------------------------------------ DAIRY (lactose: CNF / USDA FoodData Central / Chumpitazi 2018)
add('milk, whole', 'dairy', 250, ['full-fat milk', "cow's milk"], lac=5.05,
    note='CNF 113 / USDA SR 171265 lactose 5.05 g/100 g (USDA Foundation 746782: 4.81). 250 mL = 12.6 g vs 1 g -> high; low <=19 mL.', url=URL['cnf'])
add('milk, 2%', 'dairy', 250, ['reduced-fat milk'], lac=5.01, note='CNF 61 lactose 5.01 g/100 g; 250 mL = 12.5 g -> high.', url=URL['cnf'])
add('milk, skim', 'dairy', 250, ['nonfat milk'], lac=5.09, note='CNF 114 lactose 5.09 g/100 g; 250 mL = 12.7 g -> high.', url=URL['cnf'])
add('milk, lactose-free', 'dairy', 250, ['Lactaid milk'], lac=0, fru=0, glu=0, fr=0, gos=0,
    note='Chumpitazi 2018 Lactaid 2% milk: lactose not detected -> low. (Lactose is hydrolysed to glucose + galactose.)', url=URL['chump'])
add('chocolate milk', 'dairy', 250, [], lac=3.83, fru=0.41, glu=0.53, note='CNF 69 lactose 3.83 g/100 g; 250 mL = 9.6 g -> high.', url=URL['cnf'])
add('yogurt, plain', 'dairy', 170, ['yoghurt', 'natural yogurt'], lac=2.46,
    note='CNF 6961 plain yogourt 2-3.9% fat lactose 2.46 g/100 g (Balkan 2.5, rich 2.9, low-fat 3.22, fat-free 3.2). 170 g = 4.2 g vs 1 g -> high; low <=40 g.', url=URL['cnf'])
add('yogurt, greek, plain', 'dairy', 170, ['strained yogurt'], lac=2.5,
    note='CNF 6979 Greek-style plain fat-free lactose 2.5 g/100 g (rich 8-12% fat: 3.8). 170 g = 4.25 g -> high; low <=40 g.', url=URL['cnf'])
add('yogurt, lactose-free', 'dairy', 170, [], lac=0.03, note='CNF 6959 lactose-reduced plain yogourt lactose 0.03 g/100 g; 170 g = 0.05 g -> low.', url=URL['cnf'])
add('quark', 'dairy', 100, ['fresh cheese'], lac=3.5, note='CNF 6995 quark (fresh cheese-type yogourt) lactose 3.5 g/100 g; 100 g = 3.5 g -> high; low <=28 g.', url=URL['cnf'])
add('kefir', 'dairy', 250, [], lac=3.78, note='CNF 6291 kefir 2-3.9% fat lactose 3.78 g/100 g (low-fat 3.0); 250 mL = 9.5 g -> high; low <=26 mL.', url=URL['cnf'])
add('cottage cheese', 'dairy', 100, ['cottage cheese, creamed'], lac=2.67, note='CNF 25 / USDA 172179 creamed cottage cheese lactose 2.67 g/100 g; 100 g = 2.67 g -> high; low <=37 g.', url=URL['cnf'])
add('cream cheese', 'dairy', 30, [], lac=3.21, note='CNF 28 cream cheese lactose 3.21 g/100 g; 30 g = 0.96 g vs 1 g -> low (borderline); moderate 32-62 g.', url=URL['cnf'])
add('cheddar cheese', 'dairy', 40, ['cheddar'], lac=0.18,
    note='CNF 119 lactose 0.18 g/100 g (USDA Foundation 328637: 0.16; Chumpitazi Kraft mild cheddar 1.91 - outlier). 40 g = 0.07 g -> low.', url=URL['cnf'])
add('mozzarella cheese', 'dairy', 40, ['mozzarella'], lac=0.07, note='CNF 110 lactose 0.07 g/100 g (USDA 170845: 0.0). 40 g = 0.03 g -> low.', url=URL['cnf'])
add('swiss cheese', 'dairy', 40, ['emmental'], lac=0.06, note='CNF 47 lactose 0.06 g/100 g -> low.', url=URL['cnf'])
add('parmesan cheese', 'dairy', 30, ['parmesan'], lac=0.0, note='CNF 39 dry grated parmesan lactose 0.0 (shredded 0.15) -> low.', url=URL['cnf'])
add('string cheese', 'dairy', 28, ['cheese sticks'], lac=2.13, note='Chumpitazi 2018 Frigo Cheese Heads lactose 2.13 g/100 g; 28 g stick = 0.6 g -> low; moderate >=47 g.', url=URL['chump'])
add('cheese, processed slices', 'dairy', 40, ['american cheese', 'cheese singles'], lac=5.6,
    note='CNF 7005 processed cheddar slices lactose 5.6 g/100 g (mozzarella slices 5.9, fat-free 6.7-7.1, spread 7.4-8.7). 2 slices 40 g = 2.2 g vs 1 g -> high; low <=17 g. Processed cheese carries added milk solids/whey.', url=URL['cnf'])
add('heavy cream', 'dairy', 30, ['whipping cream'], lac=2.92, note='USDA SR 170859 heavy whipping cream lactose 2.92 g/100 g; 30 mL = 0.88 g -> low; moderate 35-68 mL.', url=URL['usda'])
add('sour cream, light', 'dairy', 30, [], lac=5.64, note='CNF 5299 light sour cream lactose 5.64 g/100 g; 30 g = 1.7 g vs 1 g -> moderate; low <=17 g.', url=URL['cnf'])
add('butter', 'dairy', 10, [], lac=0.58, note='USDA Foundation 790508 butter lactose 0.58 g/100 g (Chumpitazi 1.54). 10 g = 0.06 g -> low.', url=URL['usda'])
add('ice cream', 'dairy', 100, [], lac=4.43, note='CNF 4289 frozen dessert/ice cream (strawberry) lactose 4.43 g/100 g; 100 g = 4.4 g -> high; low <=22 g.', url=URL['cnf'])
add('soy milk', 'beverage', 250, ['soy milk from whole soybeans'], gos=0.27, fr=0,
    note='Italian 2025 (PMC11858256) soy milk raffinose 0.0389 + stachyose 0.23 = GOS 0.27 g/100 g. 250 mL = 0.67 g vs 0.3 (legume-derived) -> high; low <=111 mL. Soy-protein-isolate milks are lower (Tuck 2018).', url=URL['italy25'], oligo_cutoff=0.3)
add('soy yogurt', 'processed', 170, [], gos=0.138, fr=0,
    note='Italian 2025 soy yogurt raffinose 0.0263 + stachyose 0.112 = GOS 0.14 g/100 g; 170 g = 0.24 g vs 0.3 -> low (borderline). Tuck 2018 rated Australian soy yoghurts HIGH for GOS at 1 serve - product dependent.', url=URL['italy25'], oligo_cutoff=0.3)
add('macadamia milk', 'beverage', 250, [], manual={'fructans': 'low', 'gos': 'low', 'fructose': 'low', 'polyols': 'low', 'lactose': 'low'},
    note='Tuck 2018 (Monash blog part 1): macadamia milk, calcium fortified, 1 serve -> LOW FODMAP. No per-100 g values published.', url=URL['tuckblog1'])
add('quinoa milk', 'beverage', 250, [], manual={'fructans': 'high', 'fructose': 'high'},
    note='Tuck 2018 (Monash blog part 1): quinoa milk (agave sweetened) 1 serve -> HIGH (excess fructose and fructans). No per-100 g values published.', url=URL['tuckblog1'])
add('coconut yogurt', 'processed', 125, [], manual={'fructans': 'low', 'gos': 'low', 'fructose': 'low', 'polyols': 'low', 'lactose': 'low'},
    note='Tuck 2018: coconut yoghurt 1 serve (125 g in the meal plan) -> LOW.', url=URL['tuckblog1'])

# ------------------------------------------------------------------ GRAINS
add('bread, white wheat', 'grain', 49, ['wheat bread', 'white bread'], fr=0.67, gos=0.2, fru=0.16, glu=0, sor=0.001, man=0.001,
    note='Varney 2017 Table 2 wheat bread 2 slices 49 g: GOS 0.10 + total fructan 0.33 = 0.43 g oligos (>0.30 -> high FODMAP), excess fructose 0.08 (<0.15), polyol traces -> per 100 g fructan 0.67, GOS 0.20, excess fructose 0.16. Whelan 2011 UK breads 0.61-1.94 g/100 g fructan. 49 g: oligos 0.43 vs 0.3 -> moderate (1.4x); 1 slice (<=34 g) low.', url=URL['varney'])
add('bread, rye', 'grain', 50, ['rye bread'], fr=1.94, sor=0, man=0,
    note='Whelan 2011 (Int J Food Sci Nutr 62:498) rye bread fructan 1.94 g/100 g (richest of 9 bread types, AOAC 999.03). Biesiekierski 2011 dark rye bread 0.6 g fructan per portion. Yao 2014 pumpernickel polyols 0. 1 slice 50 g = 0.97 g vs 0.3 -> high; low <=15 g.', url=URL['whelan'])
add('bread, gluten-free (UK)', 'grain', 52, [], fr=1.0,
    note='Whelan 2011 gluten-free breads mean fructan 1.00 g/100 g (brand range 0.36-1.79; many UK GF breads add inulin/chicory fibre). 2 slices 52 g = 0.52 g vs 0.3 -> moderate; low <=30 g. Contrast Varney/Chumpitazi GF breads (low).', url=URL['whelan'])
add('bread, gluten-free', 'grain', 52, ['gluten-free bread'], fr=0.19, gos=0.13, fru=0.23, glu=0,
    note='Varney 2017 Table 2 gluten-free bread 2 slices 52 g: GOS 0.07 + fructan 0.10 = 0.17 g oligos, excess fructose 0.12 -> low. Per 100 g fructan 0.19, GOS 0.13, excess fructose 0.23.', url=URL['varney'])
add("bread, gluten-free (US, Udi's)", 'grain', 60, [], fr=0.06, gos=0.03, fru=0.52, glu=0.27,
    note="Chumpitazi 2018 Udi's GF bread: fructose 0.52, glucose 0.27 -> excess 0.25; FOS 0.06; GOS 0.03 g/100 g. 2 slices 60 g: oligos 0.05 -> low; excess fructose 0.15 = cutoff -> moderate (borderline).", url=URL['chump'])
add("muffin, gluten-free banana (US, Udi's)", 'processed', 85, [], fr=0.01, fru=3.27, glu=1.29,
    note="Chumpitazi 2018 Udi's GF banana bread muffin: fructose 3.27, glucose 1.29 -> excess 1.98 g/100 g; 85 g muffin = 1.7 g vs 0.15 -> high.", url=URL['chump'])
add('bread, granary/multigrain (UK)', 'grain', 50, ['granary bread'], fr=0.92,
    note='Whelan 2011 granary breads fructan 0.76-1.09 g/100 g (midpoint 0.92). 1 slice 50 g = 0.46 g vs 0.3 -> moderate; low <=32 g.', url=URL['whelan'])
add('bread, wheat (Spain, market mean)', 'grain', 50, [], fr=0.31, gos=0.14, fru=0.29, glu=0, sor=0.01,
    note='PMC11178640 (2024) Spanish gluten-containing breads mean: total fructan 0.31, raffinose 0.14, excess fructose 0.29, sorbitol 0.01 g/100 g edible. 50 g: oligos 0.225 vs 0.3 -> low; excess fructose 0.145 vs 0.15 -> low (borderline).', url=URL['spain24'])
add('bread, gluten-free (Spain, market mean)', 'grain', 50, [], fr=0.09, gos=0.03, fru=0.03, glu=0,
    note='PMC11178640 Spanish GF breads mean: fructan 0.09, raffinose 0.03, excess fructose 0.03 g/100 g -> 50 g oligos 0.06 -> low.', url=URL['spain24'])
add('bread, wheat, yeast-leavened (Pejcz 2023 control)', 'grain', 50, [], fr=0.22,
    note='Pejcz 2023 (Foods, PMC10572427) control wheat bread from type-650 flour (flour fructan 1.15 g/100 g): bread fructan 0.22 g/100 g (standard yeast fermentation already removes ~80% relative to flour). 50 g = 0.11 g vs 0.3 -> low.', url=URL['pejcz23'])
add('bread, wheat sourdough (72 h)', 'grain', 50, ['sourdough bread'], fr=0.09,
    note='Pejcz 2023: 72 h sourdough (spontaneous 0.10; L. casei 0.09; L. plantarum 0.09 g/100 g) = 58-62% below control bread and 92% below flour. 50 g = 0.045 g vs 0.3 -> low. Ziegler 2016: >4 h proofing cuts wheat-bread FODMAPs up to 90%. Ispiryan 2022 review: conventional sourdough hydrolyses fructans without high mannitol.', url=URL['pejcz23'])
add('bread, wheat, long-proofed (>4 h)', 'grain', 50, [],
    note='Ziegler 2016 (J Funct Foods 25:257): flours of 5 wheat species 1.24 (emmer) - 2.01 (einkorn) g FODMAP/100 g DM; extending proofing >4 h lowered FODMAPs in the final bread by up to 90%; process matters more than wheat species. Rating derived qualitatively (fructans low).', url=URL['ziegler'], manual={'fructans': 'low'})
add('bread, mixed wheat-rye (Austria)', 'grain', 50, ['farmhouse bread', 'Kornspitz'], fr=4.1,
    note='PMC8074121 (Foods 2021, HPAEC-PAD/CAD) Austrian breads: FOS DP2-7 + DP>7 = 8.3 (hard roll) to 52 g/kg (farmhouse bread) i.e. 0.8-5.2 g/100 g; wheat-rye breads 3.0-5.2 (midpoint 4.1). 50 g = 2.05 g vs 0.3 -> high. Method quantifies DP>7 fructans and gives much higher values than Whelan/Varney.', url=URL['austria21'])
add('bread roll, white (Austria hard roll)', 'grain', 50, ['kaiser roll'], fr=0.83, fru=0.19, glu=0,
    note='PMC8074121 hard roll FOS 5.09 + 3.19 g/kg = 0.83 g/100 g, fructose 0.19. 50 g = 0.41 g vs 0.3 -> moderate; low <=36 g.', url=URL['austria21'])
add('wheat flour, white', 'grain', 30, ['plain flour', 'all-purpose flour'], fr=0.94,
    note='PMC8074121 W550 flours FOS 1.7-1.8 + 7.7-7.8 g/kg = 0.94 g/100 g; Pejcz 2023 type-650 flour 1.15; Pejcz 2020 type-450 1.18, type-1650 1.59 g/100 g DM. 30 g = 0.28 g vs 0.3 -> low (borderline); moderate >=32 g.', url=URL['austria21'])
add('wheat flour, whole-grain', 'grain', 30, ['wholemeal flour'], fr=1.69, fru=0.24,
    note='PMC8074121 wheat whole grain flour FOS 3.82 + 13.05 g/kg = 1.69 g/100 g; Ziegler 2016 1.2-2.0 g/100 g DM. 30 g = 0.51 g vs 0.3 -> moderate; low <=17 g.', url=URL['austria21'])
add('wheat bran', 'grain', 15, [], fr=0.75, gos=1.23, sor=0, man=0,
    note='Italian 2025 (PMC11858256) wheat bran kestose 0.73 + nystose 0.023 (FOS 0.75) and raffinose 1.21 + stachyose 0.021 (GOS 1.23) g/100 g; Yao 2014 wheat bran polyols 0. 2 tbsp 15 g = 0.30 g oligos = cutoff -> moderate; low <=15 g.', url=URL['italy25'])
add('rye flour, light', 'grain', 30, ['rye flour R960'], fr=3.0,
    note='PMC8074121 R960 rye flours FOS 3.4-3.9 + 23.6-28.1 g/kg = 2.7-3.2 g/100 g (midpoint 3.0); rye whole grain 3.36; R2500 4.55. 30 g = 0.9 g vs 0.3 -> high; low <=10 g.', url=URL['austria21'])
add('rye flour, whole-meal (Italy)', 'grain', 30, [], fr=0.77, gos=0.31,
    note='Italian 2025 whole-meal rye flour kestose 0.501 + nystose 0.165 + FF-nystose 0.108 (FOS 0.77) + raffinose 0.307 g/100 g (HPAEC-PAD measures only DP3-5; total fructan is higher). 30 g = 0.32 g vs 0.3 -> moderate.', url=URL['italy25'])
add('spelt flour, white', 'grain', 30, [], fr=0.78,
    note='PMC8074121 spelt flour FOS 1.68 + 6.07 g/kg = 0.78 g/100 g (spelt whole grain 1.53). 30 g = 0.23 g vs 0.3 -> low; moderate >=39 g.', url=URL['austria21'])
add('spelt, whole grain', 'grain', 50, ['spelt berries'], fr=0.39, gos=0.41,
    note='Italian 2025 spelt grains kestose 0.371 + nystose 0.019 (FOS 0.39) + raffinose 0.409 g/100 g dry. 50 g dry = 0.40 g oligos vs 0.3 -> moderate; low <=37 g dry.', url=URL['italy25'])
add('semolina', 'grain', 50, ['durum semolina'], fr=0.195, gos=0.237,
    note='Italian 2025 semolina kestose 0.195 + raffinose 0.237 g/100 g dry (Pejcz 2024 cooked semolina 0.83 g/100 g DM -> ~0.19 g/100 g cooked at 77% moisture). 50 g dry = 0.22 g vs 0.3 -> low.', url=URL['italy25'])
add('couscous, cooked', 'grain', 150, [], fr=0.48,
    note='Pejcz 2024 (Molecules 29:282) couscous fructan 2.04 g/100 g dry mass; cooked moisture 76.57% -> 0.48 g/100 g cooked (our conversion). Biesiekierski 2011: couscous 1.12 g fructan per portion (highest grain). 150 g cooked = 0.72 g vs 0.3 -> high; low <=62 g.', url=URL['pejcz24'])
add('bulgur, cooked', 'grain', 150, ['bulgur wheat'], fr=0.2,
    note='Pejcz 2024 bulgur 0.50 g/100 g DM, moisture 59.53% -> 0.20 g/100 g cooked (authors note heat-induced fructan degradation in bulgur). Italian 2025 dry bulgur FOS 0.29 + raffinose 0.32. 150 g cooked = 0.30 g = cutoff -> moderate; low <=148 g.', url=URL['pejcz24'])
add('barley, pearl, cooked', 'grain', 150, ['pearl barley'], fr=0.33,
    note='Pejcz 2024 fine pearl barley groats 1.44 g/100 g DM, moisture 76.93% -> 0.33 g/100 g cooked; barley groats 0.59 DM/55% moisture -> 0.26; country-style 0.80/75.8% -> 0.19. 150 g cooked fine pearl barley = 0.50 g vs 0.3 -> moderate; low <=90 g.', url=URL['pejcz24'])
add('rice, white, cooked', 'grain', 150, ['long-grain rice', 'basmati', 'jasmine', 'arborio'], fr=0.015, sor=0, man=0,
    note='Pejcz 2024 cooked white long-grain rice 0.05 g/100 g DM (fresh 0.015), basmati 0.03 DM, jasmine 0, arborio 0; Biesiekierski 2011 rice 0 g fructan/portion; Chumpitazi cooked white rice no FODMAPs; Yao basmati polyols 0. 150 g = 0.02 g -> low.', url=URL['pejcz24'])
add('rice, brown, cooked', 'grain', 150, [], fr=0.096,
    note='Pejcz 2024 brown rice 0.26 g/100 g DM, moisture 63.15% -> 0.096 g/100 g cooked; Chumpitazi cooked brown rice no FODMAPs detected. 150 g = 0.14 g vs 0.3 -> low.', url=URL['pejcz24'])
add('buckwheat, cooked', 'grain', 150, ['buckwheat groats', 'kasha'], fr=0.06, gos=0.002,
    note='Pejcz 2024 white buckwheat groats 0.19 g/100 g DM (71% moisture -> 0.055 cooked), roasted 0.19 DM -> 0.07; Italian 2025 buckwheat flour kestose 0.003, raffinose 0.002. 150 g = 0.09 g -> low. Ispiryan 2022 cautions buckwheat contains fagopyritols (possible FODMAP-like).', url=URL['pejcz24'])
add('polenta, cooked', 'grain', 150, ['cornmeal', 'corn groats'], fr=0.041, sor=0, man=0,
    note='Pejcz 2024 corn groats 0.37 g/100 g DM, 88.97% moisture -> 0.04 g/100 g cooked; Yao 2014 polenta polyols 0; Italian corn flour raffinose 0.006. 150 g = 0.06 g -> low.', url=URL['pejcz24'])
add('pasta, wheat, cooked', 'grain', 140, ['spaghetti', 'penne'], fr=0.76, gos=0.003, sor=0, man=0,
    note='Torbica 2025 (Foods, PMC11853891) Serbian wheat spaghetti cooked: kestose 0.687 + nystose 0.059 + kestopentaose 0.010 = FOS 0.76 g/100 g as-eaten (dry pasta 1.39); cooked-pasta FOS range across 13 pastas 0.04-0.81 (cooking removes 31-84%, more with larger water ratio/shorter shapes). 140 g cooked = 1.06 g vs 0.3 -> high; low <=39 g. Durum penne cooked (sample 3) only 0.13 g/100 g -> 140 g = 0.18 low.', url=URL['torbica'])
add('pasta, wheat, dry', 'grain', 55, [], fr=1.39, gos=0.006, fru=0.049, glu=0,
    note='Torbica 2025 dry wheat spaghetti FOS 1.39 g/100 g (range across pastas 0.62-1.83), GOS 0.006-0.27, excess fructose 0.01-0.21, polyols 0.01-0.16. 55 g dry = 0.76 g vs 0.3 -> high.', url=URL['torbica'])
add('pasta, whole-grain spelt, cooked', 'grain', 140, [], fr=0.75, gos=0.038, sor=0, man=0.083,
    note='Torbica 2025 sample 13 (100% wholegrain spelt tagliatelle) cooked: FOS 0.672+0.026+0.051 = 0.75, stachyose 0.038, xylitol 0.083 g/100 g. 140 g = 1.05 g FOS vs 0.3 -> high.', url=URL['torbica'])
add('pasta, whole-grain rye, cooked', 'grain', 140, [], fr=0.69, gos=0.02, fru=0.079, glu=0.094,
    note='Torbica 2025 sample 11 (wholegrain rye macaroni) cooked: FOS 0.600+0.056+0.032 = 0.69 g/100 g. 140 g = 0.96 g -> high.', url=URL['torbica'])
add('pasta, buckwheat, cooked', 'grain', 140, [], fr=0.074, gos=0.015, sor=0.032, man=0, fru=0.047, glu=0.135,
    note='Torbica 2025 sample 12 (buckwheat pipe rigate; contains some wheat flour) cooked: FOS 0.051+0.023 = 0.074, stachyose 0.015, xylitol 0.032, sorbitol 0.032 g/100 g. 140 g = 0.10 g oligos -> low; the only pasta classified low FODMAP.', url=URL['torbica'])
add('pasta, quinoa, cooked', 'grain', 155, ['quinoa pasta'], fr=0.14, gos=0, sor=0, man=0,
    note='Varney 2017 Table 2 quinoa pasta cooked 155 g: fructan 0.22 g (<0.30) -> low; per 100 g 0.14.', url=URL['varney'])
add('pasta, gluten-free (Spain, market mean)', 'grain', 55, [], fr=0.06, gos=0.04, sor=0.02,
    note='PMC11178640 Spanish GF pasta (dry): fructan 0.06, raffinose 0.04, sorbitol 0.02 g/100 g vs gluten-containing pasta fructan 0.70, raffinose 0.08. 55 g dry = 0.06 g -> low.', url=URL['spain24'])
add('oats', 'grain', 40, ['rolled oats', 'oat flour'], fr=0.004, gos=0.265, sor=0, man=0,
    note='Italian 2025 oat flour kestose 0.0038, raffinose 0.101 + stachyose 0.164 (GOS 0.265) g/100 g; Biesiekierski 2011 oats 0.11 g fructan/portion; Yao oat bran polyols 0. 40 g dry = 0.11 g oligos vs 0.3 -> low; moderate >=112 g dry.', url=URL['italy25'])
add('quinoa, dry', 'grain', 50, [], gos=0.103, fr=0,
    note='Italian 2025 quinoa grains raffinose 0.0569 + stachyose 0.0464 = GOS 0.10 g/100 g dry. 50 g dry (~150 g cooked) = 0.05 g -> low.', url=URL['italy25'])
add('amaranth, dry', 'grain', 40, [], fr=0.028, gos=0.9,
    note='Italian 2025 amaranth kestose 0.0279, raffinose 0.688 + stachyose 0.212 (GOS 0.90) g/100 g dry. 40 g dry = 0.37 g vs 0.3 -> moderate; low <=32 g dry.', url=URL['italy25'])
add('millet, dry', 'grain', 50, [], fr=0.004, gos=0.064, note='Italian 2025 millet kestose 0.004, raffinose 0.0535 + stachyose 0.0107 g/100 g dry. 50 g = 0.03 g -> low.', url=URL['italy25'])
add('teff, dry', 'grain', 40, [], gos=0.141, fr=0, note='Italian 2025 teff raffinose 0.141 g/100 g dry. 40 g = 0.06 g -> low.', url=URL['italy25'])
add('rice, basmati, dry', 'grain', 50, [], gos=0.009, fr=0, note='Italian 2025 basmati raffinose 0.009 g/100 g; red rice 0.049; Venere black rice 0.086 -> low.', url=URL['italy25'])
add('corn flour', 'grain', 50, ['maize flour'], gos=0.006, fr=0, note='Italian 2025 coarse corn flour raffinose 0.006 g/100 g -> low.', url=URL['italy25'])
add('breakfast cereal, wheat-based (Spain, market mean)', 'grain', 40, [], fr=0.36, gos=0.11, fru=0.09, glu=0, sor=0.45,
    note='PMC11178640 gluten-containing breakfast cereals mean: fructan 0.36, raffinose 0.11, excess fructose 0.09, sorbitol 0.45 g/100 g (GF cereals: fructan 0.29, sorbitol 1.26 - added polyols). 40 g: oligos 0.19 -> low; sorbitol 0.18 -> low (borderline).', url=URL['spain24'])
add('corn chex cereal', 'grain', 30, ['corn flake cereal (US)'], fr=0.61, fru=1.53, glu=1.81,
    note='Chumpitazi 2018 Corn Chex FOS 0.61 g/100 g, fructose 1.53 < glucose 1.81. 30 g = 0.18 g FOS vs 0.3 -> low.', url=URL['chump'])
add('rice chex cereal', 'grain', 30, ['rice cereal (US)'], fr=0.42, fru=0.81, glu=0.43,
    note='Chumpitazi 2018 Rice Chex FOS 0.42, fructose 0.81, glucose 0.43 -> excess 0.38 g/100 g. 30 g: FOS 0.13 -> low; excess fructose 0.11 vs 0.15 -> low.', url=URL['chump'])
add('biscuit, wheat (Spain, market mean)', 'processed', 30, ['cookie'], fr=1.04, gos=0.2,
    note='PMC11178640 gluten-containing biscuits mean fructan 1.04, raffinose 0.20 g/100 g (GF biscuits 1.82 +/- 2.52 - some with added inulin). 30 g = 0.37 g vs 0.3 -> moderate; low <=24 g.', url=URL['spain24'], oligo_cutoff=0.3)
add('muesli, wheat-free', 'grain', 45, [], manual={'fructans': 'high'},
    note='Biesiekierski 2011 abstract: wheat-free muesli 0.96 g total fructan per portion as eaten (>0.3 g) -> high; per-100 g value not accessible.', url=URL['bies2011'])
add('muesli bar, fruit', 'processed', 35, [], manual={'fructans': 'high'},
    note='Biesiekierski 2011 abstract: muesli fruit bar 0.81 g fructan per portion -> high.', url=URL['bies2011'])
add('bread, spelt', 'grain', 50, ['spelt bread'], manual={'fructans': 'low', 'polyols': 'low'}, sor=0, man=0,
    note='Biesiekierski 2011 abstract: spelt bread 0.07 g fructan per portion (lowest bread) -> low; Yao 2014 organic spelt bread polyols 0. Per-100 g fructan not accessible.', url=URL['bies2011'])
add('bread, dark rye', 'grain', 50, [], manual={'fructans': 'high'},
    note='Biesiekierski 2011 abstract: dark rye bread 0.6 g fructan per portion (>0.3) -> high.', url=URL['bies2011'])
add('potato chips', 'processed', 30, ['crisps'], fr=0.31, fru=0.45, glu=0.23,
    note="Chumpitazi 2018 Lay's potato chips FOS 0.31, fructose 0.45, glucose 0.23 (excess 0.22) g/100 g; Biesiekierski 2011 potato chips 0.05 g fructan/portion. 30 g: FOS 0.09 vs 0.2 -> low; excess fructose 0.07 -> low.", url=URL['chump'])
add('pretzel', 'processed', 30, [], fr=0.53, fru=0.21, glu=0.12, sor=0.02,
    note="Chumpitazi 2018 Snyder's pretzels FOS 0.53, excess fructose 0.09, sorbitol 0.02 g/100 g. 30 g = 0.16 g FOS vs 0.3 (grain product) -> low; moderate >=57 g.", url=URL['chump'], oligo_cutoff=0.3)
add('french fries, frozen', 'processed', 100, ['fries'], fr=0.27, fru=0.25, glu=0.19,
    note='Chumpitazi 2018 Ore-Ida crinkle fries FOS 0.27, excess fructose 0.06 g/100 g. 100 g = 0.27 g FOS vs 0.2 -> moderate; low <=74 g.', url=URL['chump'])
add('saltine cracker', 'grain', 30, [], fr=0, gos=0, lac=0, fru=0, glu=0, sor=0, man=0,
    note='Chumpitazi 2018 Nabisco saltines: no FODMAPs detected -> low.', url=URL['chump'])
add('naan', 'grain', 46, [], sor=0, man=0, note='Yao 2014 naan bread polyols 0 -> polyols low; fructans not measured here (wheat-based, expect moderate/high).', url=URL['yao'])
add('raisin toast', 'grain', 75, [], sor=0, man=0, note='Yao 2014 raisin toast polyols 0 -> polyols low; fructans not measured here.', url=URL['yao'])

# ------------------------------------------------------------------ LEGUMES
add('haricot bean, boiled', 'legume', 88, ['navy bean', 'white bean'], gos=1.09, fr=0.26, sor=0, man=0,
    note='Varney 2017 Table 2 haricot beans boiled 88 g: GOS 0.96 + fructan 0.23 = 1.19 g oligos (>0.30) -> high; per 100 g GOS 1.09, fructan 0.26. Low <=22 g.', url=URL['varney'])
add('lentil, raw', 'legume', 30, ['dried lentils'], fru=0.27, glu=0,
    note='CNF 3392 raw lentils fructose 0.27, glucose 0 (dry). GOS not in CNF. Tuck 2018: lentils lost only 13% FODMAP with >30 min cooking (vs 32% red kidney beans).', url=URL['cnf'])
add('lentil, canned, drained', 'legume', 46, ['canned lentils'], manual={'gos': 'low', 'fructans': 'low'},
    note='Tuck 2018: all canned legumes had lower FODMAP content than unprocessed (GOS leach into canning liquid); Monash (authors) low serve for drained canned lentils 1/4 cup ~46 g. No per-100 g value accessible; rating from Tuck/Monash.', url=URL['tuckblog2'])
add('lentil, boiled', 'legume', 90, ['cooked lentils'], manual={'gos': 'high'},
    note='Tuck 2018: boiled-from-dry lentils retain GOS (13% reduction with prolonged cooking); Monash low serve for boiled green/red lentils is only ~23-29 g, so a 90 g serve is high. No per-100 g value accessible.', url=URL['tuckblog2'])
add('chickpea, canned, drained', 'legume', 42, ['canned chickpeas'], manual={'gos': 'low', 'fructans': 'low'},
    note='Tuck 2018: canning reduces GOS; Monash low serve for drained canned chickpeas ~42 g (3 tbsp). Chickpea flour (Italian 2025) GOS 2.11 g/100 g shows the dry-legume baseline.', url=URL['tuckblog2'])
add('chickpea flour', 'legume', 30, ['besan', 'gram flour'], gos=2.11, fr=0,
    note='Italian 2025 chickpea flour raffinose 0.473 + stachyose 1.64 = GOS 2.11 g/100 g. 30 g = 0.63 g vs 0.3 -> high; low <=14 g.', url=URL['italy25'])
add('chana dal, cooked', 'legume', 90, ['split chickpea'], fr=0.13, gos=0.36,
    note='Lomer 2016 channa dal fructan 0.13, GOS 0.36 g/100 g (as analysed). 90 g = 0.44 g oligos vs 0.3 -> moderate; low <=61 g.', url=URL['lomer'])
add('red kidney bean, canned', 'legume', 95, ['canned kidney beans'], manual={'gos': 'low'}, fru=0.1, glu=0.23,
    note='Tuck 2018 meal plan limits canned red kidney beans to 95 g per serve (low); >30 min boiling reduced kidney-bean FODMAPs 32%. CNF 7081 drained canned red kidney beans fructose 0.10, glucose 0.23. GOS per 100 g not accessible.', url=URL['tuckblog2'])
add('adzuki bean, dried', 'legume', 30, [], gos=2.82, fr=0,
    note='Italian 2025 adzuki (dried) raffinose 0.124 + stachyose 2.70 = GOS 2.82 g/100 g. 30 g dry = 0.85 g vs 0.3 -> high.', url=URL['italy25'])
add('mung bean, dried', 'legume', 30, [], gos=1.88, fr=0,
    note='Italian 2025 mung beans (dried) raffinose 0.328 + stachyose 1.55 = GOS 1.88 g/100 g. 30 g dry = 0.56 g vs 0.3 -> high; low <=15 g dry.', url=URL['italy25'])
add('mung bean, sprouted', 'legume', 95, ['bean sprouts'], manual={'gos': 'low', 'fructans': 'low'},
    note='Tuck 2018: sprouting lowers GOS (endogenous alpha-galactosidase during germination; Ispiryan 2022 Table 1); meal plan uses 95 g sprouted mung beans as low FODMAP. Italian 2025 soy sprouts GOS <LOQ. No per-100 g value.', url=URL['tuck'])
add('broad bean, dried', 'legume', 30, ['fava bean, dried'], gos=0.76, fr=0,
    note='Italian 2025 dried shelled broad beans raffinose 0.171 + stachyose 0.588 = GOS 0.76 g/100 g. 30 g dry = 0.23 g vs 0.3 -> low; moderate >=40 g dry.', url=URL['italy25'])
add('broad bean, fresh', 'legume', 75, ['fava bean'], gos=0, fr=0,
    note='Italian 2025 fresh broad beans FOS and GOS all <LOQ (0.01) -> low.', url=URL['italy25'])
add('lupin bean, fresh', 'legume', 75, ['lupini'], gos=0, fr=0, note='Italian 2025 fresh lupin beans FOS/GOS <LOQ -> low.', url=URL['italy25'])
add('lima bean, boiled', 'legume', 90, ['butter bean'], sor=0, man=0.1, fru=0.21, glu=0,
    note='Yao 2014 (Biesiekierski 2011 data) lima beans sorbitol 0, mannitol 0.1 g/100 g; CNF 2007 fructose 0.21, glucose 0 -> 90 g: mannitol 0.09 low; excess fructose 0.19 vs 0.15 -> moderate. GOS not accessible (Monash: canned butter beans low at 35-42 g).', url=URL['yao'])
add('baked beans, canned', 'legume', 90, [], sor=0, man=0, fru=1.56, glu=1.59,
    note='Yao 2014 baked beans polyols 0; CNF 3248 plain baked beans fructose 1.56 < glucose 1.59. GOS not accessible (Biesiekierski 2011: raffinose/stachyose common in pulses). Only polyols/fructose rated.', url=URL['yao'])
add('soybean, dried', 'legume', 30, ['soy beans'], gos=3.32, fr=0,
    note='Italian 2025 dried soybeans raffinose 0.513 + stachyose 2.81 = GOS 3.32 g/100 g (toasted 3.77; soy flour 3.90). 30 g = 1.0 g vs 0.3 -> high; low <=9 g.', url=URL['italy25'])
add('soy flour', 'legume', 30, [], gos=3.9, fr=0, note='Italian 2025 soy flour raffinose 0.677 + stachyose 3.22 = 3.90 g/100 g -> 30 g = 1.17 g -> high.', url=URL['italy25'])
add('textured vegetable protein, dry', 'legume', 30, ['TVP', 'soy mince'], gos=4.81, fr=0,
    note='Italian 2025 soy TVP-based steak (dried) raffinose 1.17 + stachyose 3.64 = GOS 4.81 g/100 g. 30 g dry = 1.44 g -> high.', url=URL['italy25'])
add('tofu, firm', 'legume', 170, ['tofu'], gos=0.14, fr=0,
    note='Italian 2025 tofu raffinose 0.0263 + stachyose 0.114 = GOS 0.14 g/100 g; 170 g = 0.24 g vs 0.3 -> low (Tuck 2018: firm tofu low; silken tofu high as GOS stay in the whey-rich curd).', url=URL['italy25'])
add('tofu, silken', 'legume', 170, [], manual={'gos': 'high'},
    note='Tuck 2018 (via veganhealth.org summary and Monash): silken tofu HIGH FODMAP (GOS) while firm tofu low. No per-100 g value accessible.', url=URL['tuck'])
add('tempeh', 'legume', 100, [], gos=0.035, fr=0,
    note='Italian 2025 tempeh stachyose 0.0349 g/100 g (fermentation degrades GOS); Tuck 2018 tempeh 0.26 g total FODMAP per serve -> low. 100 g = 0.035 g -> low.', url=URL['italy25'])
add('soybean sprouts', 'legume', 75, ['soy sprouts'], gos=0, fr=0, note='Italian 2025 fresh soy sprouts FOS/GOS <LOQ -> low (germination consumes GOS).', url=URL['italy25'])
add('edamame, frozen', 'legume', 90, ['green soybeans'], fru=0.21, glu=0,
    note='CNF 6217 frozen edamame fructose 0.21, glucose 0 -> 90 g excess fructose 0.19 vs 0.15 -> moderate (borderline). GOS not in CNF (Monash: edamame low at 90 g).', url=URL['cnf'])
add('pinto bean, boiled', 'legume', 90, [], fru=0, glu=0, note='CNF 3270 boiled pinto beans fructose 0, glucose 0 -> no excess fructose; GOS not in CNF (expect high GOS as for other dried beans).', url=URL['cnf'])
add('wheat gluten', 'protein', 100, ['seitan', 'false chicken'], manual={'fructans': 'low', 'gos': 'low', 'fructose': 'low', 'polyols': 'low'},
    note='Tuck 2018 wheat gluten 0.13 g total FODMAP per serve -> low (Ispiryan 2022: vital gluten fractions carry only fructan traces).', url=URL['tuck'])
add('nutritional yeast', 'other', 16, [], manual={'fructans': 'low', 'gos': 'low', 'fructose': 'low', 'polyols': 'low'},
    note='Tuck 2018 nutritional yeast 0.01 g FODMAP per serve -> low.', url=URL['tuck'])
add('soy cheese', 'processed', 40, [], manual={'gos': 'low', 'lactose': 'low', 'fructans': 'low'},
    note='Tuck 2018 soy cheese 0.03 g FODMAP per serve -> low.', url=URL['tuck'])
add('dulse', 'vegetable', 10, [], manual={'fructans': 'low', 'gos': 'low', 'polyols': 'low', 'fructose': 'low'}, note='Tuck 2018 dulse 0.02 g FODMAP per serve -> low.', url=URL['tuck'])
add('wheat grass', 'other', 3.5, [], manual={'fructans': 'low', 'fructose': 'low'}, note='Tuck 2018 wheat grass 0.05 g FODMAP per serve (3.5 g powder) -> low.', url=URL['tuck'])
add('wheat germ', 'grain', 15, [], manual={'fructans': 'high', 'gos': 'high'},
    note='Tuck 2018 (Monash blog part 1): wheat germ HIGH (FOS and GOS). No per-100 g value published.', url=URL['tuckblog1'])
add('agar-agar', 'other', 5, [], manual={'fructans': 'low', 'gos': 'low', 'fructose': 'low', 'polyols': 'low'}, note='Tuck 2018: no FODMAPs detected in agar-agar, egg replacer, vegan egg yolk, kelp noodles, spirulina.', url=URL['tuck'])
add('spirulina', 'other', 5, [], manual={'fructans': 'low', 'gos': 'low', 'fructose': 'low', 'polyols': 'low'}, note='Tuck 2018: no FODMAPs detected -> low.', url=URL['tuck'])
add('kelp noodles', 'other', 113, [], manual={'fructans': 'low', 'gos': 'low', 'fructose': 'low', 'polyols': 'low'}, note='Tuck 2018: no FODMAPs detected -> low (113 g in meal plan).', url=URL['tuck'])
add('egg replacer', 'other', 10, [], manual={'fructans': 'low', 'gos': 'low', 'fructose': 'low', 'polyols': 'low'}, note='Tuck 2018: no FODMAPs detected in EnerG egg replacer or Vegg vegan egg yolk -> low.', url=URL['tuck'])

# ------------------------------------------------------------------ NUTS & SEEDS
add('almond', 'nut-seed', 30, ['almonds'], sor=0, man=0, fru=0.11, glu=0.17,
    note='Yao 2014 almonds sorbitol 0, mannitol 0; CNF 2534 fructose 0.11 < glucose 0.17. GOS not measured here (Monash: GOS makes >10 almonds moderate). Polyols/fructose low.', url=URL['yao'])
add('cashew', 'nut-seed', 30, ['cashews'], sor=0, man=0,
    note='Yao 2014 cashews sorbitol 0, mannitol 0 -> polyols low; GOS not measured (Monash rates cashews high for GOS).', url=URL['yao'])
add('peanut', 'nut-seed', 30, ['peanuts'], sor=0, man=0, fru=0, glu=0,
    note='Yao 2014 peanuts sorbitol 0, mannitol 0; CNF 3302 fructose 0, glucose 0 -> low.', url=URL['yao'])
add('peanut butter', 'nut-seed', 30, [], fr=0.02, fru=0.91, glu=1.01,
    note='Chumpitazi 2018 Skippy peanut butter FOS 0.02, fructose 0.91 < glucose 1.01 -> low.', url=URL['chump'])
add('walnut', 'nut-seed', 30, ['walnuts'], gos=0.134, fr=0, fru=0.09, glu=0.08,
    note='Italian 2025 shelled dried walnuts raffinose 0.087 + stachyose 0.047 = GOS 0.13 g/100 g; CNF 2590 fructose 0.09, glucose 0.08. 30 g = 0.04 g -> low.', url=URL['italy25'])
add('chestnut, steamed', 'nut-seed', 50, ['chestnuts'], fr=0.015, gos=0.229,
    note='Italian 2025 steamed chestnut kestose 0.0152, raffinose 0.119 + stachyose 0.110 = GOS 0.23 g/100 g. 50 g = 0.12 g vs 0.3 -> low; moderate >=123 g.', url=URL['italy25'])
add('hazelnut', 'nut-seed', 30, ['filbert'], fru=0.07, glu=0.07, note='CNF 2567 fructose 0.07, glucose 0.07 -> low (fructose); GOS not measured.', url=URL['cnf'])
add('macadamia', 'nut-seed', 30, [], fru=0.07, glu=0.07, note='CNF 2575 fructose 0.07, glucose 0.07 -> low (fructose).', url=URL['cnf'])
add('pecan', 'nut-seed', 30, [], fru=0.04, glu=0.04, note='CNF 2582 fructose 0.04, glucose 0.04 -> low.', url=URL['cnf'])
add('pine nut', 'nut-seed', 30, [], fru=0.07, glu=0.07, note='CNF 2586 fructose 0.07, glucose 0.07 -> low.', url=URL['cnf'])
add('brazil nut', 'nut-seed', 30, [], fru=0, glu=0, note='CNF 2544 fructose 0, glucose 0 -> low.', url=URL['cnf'])
add('pistachio', 'nut-seed', 30, [], fru=0.24, glu=0.32, note='CNF 2644 fructose 0.24 < glucose 0.32 -> low (fructose); GOS not measured (Monash rates pistachio high for GOS/fructans).', url=URL['cnf'])
add('pumpkin seed', 'nut-seed', 30, ['pepita'], fru=0.15, glu=0.13, note='CNF 2516 fructose 0.15, glucose 0.13 -> excess 0.02 -> low.', url=URL['cnf'])
add('sunflower seed', 'nut-seed', 30, [], fru=0, glu=0.03, note='CNF 2620 fructose 0, glucose 0.03 -> low.', url=URL['cnf'])
add('sesame seed', 'nut-seed', 15, [], fru=0.07, glu=0.1, note='CNF 2611 fructose 0.07 < glucose 0.10 -> low.', url=URL['cnf'])
add('flaxseed', 'nut-seed', 15, ['linseed'], fru=0, glu=0.4, note='CNF 4528 fructose 0, glucose 0.40 -> low.', url=URL['cnf'])
add('fenugreek seed', 'herb-spice', 3.7, [], fr=1.11, gos=1.27,
    note='Lomer 2016 fenugreek seeds fructan 1.11 + GOS 1.27 = 2.38 g/100 g. 1 tsp 3.7 g = 0.09 g vs 0.2 -> low; moderate >=9 g; high >=17 g.', url=URL['lomer'])
add('garlic powder', 'herb-spice', 3, [], fru=0.31, glu=0.07,
    note='CNF 188 garlic powder fructose 0.31, glucose 0.07 -> 3 g excess fructose 0.007 -> low for fructose. Fructans not measured here but expected very high (dehydrated garlic ~3x fresh garlic 17.4 g/100 g) -> treat as high fructan; left null.', url=URL['cnf'])

# ------------------------------------------------------------------ PROCESSING ENTRIES (derived)
add('onion, pickled', 'processed', 45, ['pickled onion'], fr=0.14,
    note='Derived: onion fructan 1.8 g/100 g x (1 - 0.93) using Tuck 2018 pickling reduction 89-97% -> 0.05-0.20 g/100 g (midpoint 0.14). 45 g (Tuck meal-plan serve) = 0.06 g vs 0.2 -> low; moderate >=143 g.', url=URL['tuckblog2'])
add('garlic, pickled', 'processed', 6, ['pickled garlic'], fr=1.2,
    note='Derived: garlic fructan 17.4 g/100 g x (1 - 0.93) = 0.5-1.9 g/100 g (midpoint 1.2) after pickling (Tuck 2018: 89-97% reduction in garlic). 2 cloves 6 g = 0.07 g vs 0.2 -> low; moderate >=17 g; high >=33 g.', url=URL['tuckblog2'])
add('red kidney bean, boiled >30 min', 'legume', 90, [], manual={'gos': 'high'},
    note='Tuck 2018 (Monash blog part 2): prolonged cooking (>30 min) reduced red kidney bean FODMAPs by 32% (lentils only 13%), but "not all foods changed from a high to a low rating"; boiled kidney beans remain high at a 90 g serve. No per-100 g value accessible.', url=URL['tuckblog2'])

# ==================================================================== build
def build():
    foods = []
    for r in F:
        cat = r['category']
        serving = r['serving']
        oligo_cut = r['oligo_cutoff'] or (0.3 if cat in OLIGO_03 else 0.2)
        fr, gos, lac, fru, glu, sor, man = r['fr'], r['gos'], r['lac'], r['fru'], r['glu'], r['sor'], r['man']
        ef = None
        if fru is not None and glu is not None:
            ef = max(0.0, fru - glu)
        ef_cut = 0.4 if r['ef_sole'] else 0.15
        per = lambda v: None if v is None else v * serving / 100.0
        fr_s, gos_s, lac_s, ef_s, sor_s, man_s = map(per, (fr, gos, lac, ef, sor, man))
        oligo_s = (fr_s or 0) + (gos_s or 0) if (fr_s is not None or gos_s is not None) else None
        rating = {
            'fructans': rate(fr_s, oligo_cut) if fr_s is not None else None,
            'gos': rate(gos_s, oligo_cut) if gos_s is not None else None,
            'lactose': rate(lac_s, 1.0) if lac_s is not None else None,
            'fructose': rate(ef_s, ef_cut) if ef_s is not None else None,
        }
        if oligo_s is not None:
            tot = rate(oligo_s, oligo_cut)
            for k in ('fructans', 'gos'):
                if rating[k] is not None and ['low', 'moderate', 'high'].index(tot) > ['low', 'moderate', 'high'].index(rating[k]):
                    pass  # keep component ratings individual; total handled in thresholds/notes
        pol = None
        ptype = None
        if sor_s is not None or man_s is not None:
            worst = 'low'
            cands = []
            if sor_s is not None: cands.append(rate(sor_s, 0.2))
            if man_s is not None: cands.append(rate(man_s, 0.2))
            cands.append(rate((sor_s or 0) + (man_s or 0), 0.4))
            order = ['low', 'moderate', 'high']
            pol = max(cands, key=order.index)
            types = []
            if sor and sor > 0: types.append('sorbitol')
            if man and man > 0: types.append('mannitol')
            ptype = '+'.join(types) if types else None
        rating['polyols'] = pol
        for k, v in r['manual'].items():
            rating[k] = v
        # serving thresholds: most restrictive FODMAP
        lows, highs = [], []
        governing = []
        def thr(conc, cut, label):
            if conc and conc > 0:
                lo_ = math.floor(100 * cut / conc); hi_ = math.ceil(100 * 2 * cut / conc)
                lows.append(lo_); highs.append(hi_); governing.append((lo_, label, conc, cut))
        oligo_conc = (fr or 0) + (gos or 0) if (fr is not None or gos is not None) else None
        thr(oligo_conc, oligo_cut, 'total oligosaccharides')
        thr(lac, 1.0, 'lactose')
        thr(ef, ef_cut, 'excess fructose')
        thr(sor, 0.2, 'sorbitol'); thr(man, 0.2, 'mannitol')
        thr((sor or 0) + (man or 0) if (sor is not None or man is not None) else None, 0.4, 'total polyols')
        lowServing = moderateServing = highServing = None
        if lows:
            lo, hi = min(lows), min(highs)
            g = min(governing, key=lambda t: t[0])
            r['note'] += f' [computed thresholds governed by {g[1]} ({g[2]:.2f} g/100 g vs {g[3]} g cutoff): low <={lo} g, moderate {lo + 1}-{hi - 1} g, high >={hi} g]'
            if lo < 5:
                highServing = 'any'
            else:
                lowServing = f'<={lo} g'
                if hi - 1 > lo:
                    moderateServing = f'{lo + 1}-{hi - 1} g'
                highServing = f'>={hi} g'
        else:
            if any(v is not None for v in (fr, gos, lac, ef, sor, man)):
                lowServing = 'any (no FODMAP detected in the components measured)'
            # manual-only entries
            if r['manual'] and not any(v is not None for v in (fr, gos, lac, ef, sor, man)):
                vals = set(r['manual'].values())
                if vals == {'low'}:
                    lowServing = f'{serving} g (tested serve)'
                elif 'high' in vals:
                    highServing = f'{serving} g (tested serve)'
        q = {
            'fructans_g_per_100g': fmt(fr), 'gos_g_per_100g': fmt(gos), 'lactose_g_per_100g': fmt(lac),
            'fructose_g_per_100g': fmt(fru), 'glucose_g_per_100g': fmt(glu), 'sorbitol_g_per_100g': fmt(sor),
            'mannitol_g_per_100g': fmt(man), 'servingG': serving,
        }
        note = r['note']
        if r['name'] == 'onion':
            note = note.replace('low only at <=11 g.', 'low only at <=10 g (total oligos 1.99 g/100 g).')
        if ef is not None and fru is not None and glu is not None:
            note += f' [excess fructose = {fru} - {glu} = {ef:.2f} g/100 g; cutoff {ef_cut} g/serve]'
        note += f' [oligo cutoff {oligo_cut} g/serve]'
        foods.append({
            'name': r['name'].lower(), 'aliases': r['aliases'], 'category': cat,
            'fructans': rating['fructans'], 'gos': rating['gos'], 'lactose': rating['lactose'], 'fructose': rating['fructose'],
            'polyols': rating['polyols'], 'polyolType': ptype,
            'lowServing': lowServing, 'moderateServing': moderateServing, 'highServing': highServing,
            'quantitative': q, 'notes': note, 'sourceUrl': r['url'],
        })
    return foods

foods = build()
out = {
    'source': {
        'family': 'literature',
        'urls': sorted(set(URL.values())),
        'accessed': '2026-09-17',
        'notes': ('cutoffs used: Varney et al. 2017 (J Gastroenterol Hepatol 32 Suppl 1:53-61) Table 1, grams per standard serve of a single food: '
                  'oligosaccharides (total fructans + GOS) <0.30 g for core grain products, legumes, nuts and seeds, <0.20 g for vegetables, fruit and all other products; '
                  'sorbitol or mannitol individually <0.20 g; total polyols <0.40 g; excess fructose (fructose minus glucose) <0.15 g, or <0.40 g for fresh fruit/vegetables when excess fructose is the only FODMAP present; lactose <1.00 g. '
                  'Rating bands used here: low = below cutoff at the stated typical serving; moderate = at/above cutoff but below 2x cutoff; high = at/above 2x cutoff (Varney defines only the low cutoff; the moderate band is our operational convention). '
                  'lowServing/moderateServing/highServing are computed from the most restrictive FODMAP as 100*cutoff/concentration; "any" = high even at <5 g. '
                  'Quantitative values are g per 100 g as eaten unless the note says dry/DM. Sources: Muir 2007/2009 and Biesiekierski 2011 (abstracts + values reproduced in Varney 2017 Table 2, Yao 2014 Table 1 and secondary tabulations), Yao 2014 Table 1 (sorbitol/mannitol), Varney 2017 Tables 1-2, Tuck 2018 (abstract + Monash author blog), Lomer 2016 (UK ethnic foods), Chumpitazi 2018 (US foods), Whelan 2011 (UK breads), Pejcz 2023/2024, Torbica 2025, Ziegler 2016, Italian prebiotic survey 2025 (PMC11858256), Spanish GF/GC survey 2024 (PMC11178640), Austrian bakery survey 2021 (PMC8074121), Ispiryan 2022 review; fructose/glucose/lactose/sorbitol/mannitol for foods without FODMAP-specific analyses from the Canadian Nutrient File 2015 (CNF, food codes in notes) and USDA FoodData Central. '
                  'CNF/USDA-derived excess-fructose ratings are generic composition data, not FODMAP-specific analyses, and small fructose-glucose differences are within analytical variability.'),
    },
    'foods': foods,
}
with open('/Users/jon/code/fodmap/research/literature.json', 'w') as f:
    json.dump(out, f, indent=2, ensure_ascii=False)
n_quant = sum(1 for x in foods if any(v is not None for k, v in x['quantitative'].items() if k != 'servingG'))
n_rated = sum(1 for x in foods if any(x[k] is not None for k in ('fructans', 'gos', 'lactose', 'fructose', 'polyols')))
print('foods', len(foods), 'with quantitative', n_quant, 'with ratings', n_rated)
