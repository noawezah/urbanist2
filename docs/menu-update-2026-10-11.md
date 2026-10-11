# October 11 menu source review

Menu source: `reference-files/59032204_1.pdf`, supplied by the user. The PDF was created on September 29, 2026. Its complete tall page was extracted and visually reviewed in ten rendered slices against the previous `58906129_1.pdf` and `data/menu.json`.

All 176 priced rows and the unpriced Red Bull Long entry remain represented as 177 items across 26 categories. Thirty-two source rows changed, including spelling corrections already normalized in the displayed menu. Existing item IDs are retained for expanded names and spelling corrections; the replacement blueberry pancakes and Prosecco use new IDs. Source rows remain attached to every entry for audit.

## Item and price changes

| Item | Previous menu | Updated menu |
| --- | --- | --- |
| Banana Bread French Toast | 29 lei | Replaced by XXL Pancakes With Blueberries, 35 lei |
| Mashed Potatoes | 26 lei | Regular / Vegan Mashed Potatoes, 26 / 26 lei |
| Maschio Prosecco Extra Dry | 29 / 149 lei, 11.5% alc | Replaced by Rocca Dei Forti Prosecco DOC Brut, 29 / 149 lei, 10.5% alc |
| Luc Belaire Fantome Rose | 390 lei | 290 lei |
| McQueen Ultraviolet Fog | 38 lei | McQueen Violet / Ultraviolet Fog, 34 lei |
| Bumbu Original / Cream, 40 ml | 38 lei | 34 lei |
| Ostoya Black | 38 lei | 34 lei |
| Deacon | 38 lei | 34 lei |
| Chivas 12 YO | 38 lei | 34 lei |
| The Glenlivet 15 YO | 44 lei | 38 lei |
| Del Maguey Vida Mezcal, 40 ml | 38 lei | 34 lei |
| Villon | 38 lei | 34 lei |
| Altos Reposado, shot and 40 ml | Reposado only | Reposado / Plata, same 18 and 29 lei prices |

## Ingredient and name changes

- Feta & Roasted Pepper now specifies Underdough pesto.
- Shakshouka now specifies Underdough marinara; the new description omits salad mix.
- Turkish Eggs adds mint, parsley, dill and fried chickpeas; the new description omits salad mix.
- Mushrooms 'N Feta Omelette now specifies Underdough basil pesto and mushrooms mix.
- Veggies Omelette changes pleurotus mushroom to mushrooms mix.
- Avocado Benedict now specifies mashed avocado.
- No Eggs Pink Hummus & Mushroom Mix adds "On Bread" to its name and uses the updated pink hummus / mushrooms mix description.
- Garlic, Hot Honey and Buffalo Wings and Crispy Chicken descriptions now explicitly include the mashed-potato alternative. Crispy Pleurotus and Crispy Cauliflower explicitly include vegan mashed potatoes.
- The mashed-potato side now has two 350 g variants: potatoes, milk and butter; or potatoes, oat cream and olive oil.
- The hummus side is renamed Pink Hummus With Beetroot.
- Blueberry pancakes list American pancakes, blueberries, pistachio, maple syrup and mascarpone cream, 300 g, allergens 1, 3, 5, 7, 8.
- Parsley, strawberry and homemade spellings are corrected in the retained source text.

All other serving quantities, category hours and prices match the new PDF. The user-confirmed kitchen closing time remains 21:00.

## Conditional allergens and source ambiguities

The optional salmon fish warning and sauce-specific allergen notes are preserved. The importer now recognizes both the old "HOMADE" and corrected "HOMEMADE" sauce heading.

Regular mashed potatoes list milk (7); vegan mashed potatoes explicitly print peanuts (5). Both source values are preserved with a note identifying the variant and asking staff to confirm the vegan option. The vegan mains still print gluten (1) for fries and gluten / milk (1, 7) for the mashed option, despite naming vegan mash. Their existing base gluten handling and vegan note are preserved, with an added note disclosing the conflicting printed milk entry and requesting staff confirmation. No corrected allergen list was inferred.

Becks bottle volume is still printed as 3300 ml and retains the existing staff-confirmation note. Red Bull Long remains unpriced. Hugo, Petroni Aperitivo Spritz and Italicus Spritz still name Maschio prosecco in their recipes, so those printed descriptions are preserved despite the wine-section brand change.

## Validation

The updated JSON has 177 unique item IDs and 26 populated categories. Every price has a label, all allergen IDs are between 1 and 14, all 176 priced rows match their PDF prices, and conditional warnings remain. The copied reference PDF matches the supplied file byte for byte. Changed rows were checked against rendered food, shots, wine and spirits slices.
