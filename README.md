# ThawClock

Backward-planning thaw timer for turkey and other frozen meat. Enter weight and the time you want to start cooking.

- Fridge: USDA FSIS turkey table (4-12 lb 1-3 days, 12-16 lb 3-4, 16-20 lb 4-5, 20-24 lb 5-6). Other meat: 24 h per 5 lb, at least one day (rule of thumb). Thawed food keeps 1-2 days.
- Cold water: 30 minutes per pound, change water every 30 minutes, cook right away.
- Counter check: limit 2 hours, 1 hour above 90 F.

Tests match the published USDA tables. Food safety guidance only.

Static client-side. `node test-engine.js` runs the tests.
Sources: https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/poultry/turkey-basics-safe-thawing and https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/steps-keep-food-safe
