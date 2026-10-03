-- ═══════════════════════════════════════════════════════════════════════════
-- SHREE BALAJI PROPERTIES — DEMO SEED
-- Run AFTER schema.sql, in the Supabase SQL Editor.
--
-- ⚠️  THIS IS DEMONSTRATION DATA.
--
--     Builder names are invented. Project names are invented. Prices are
--     plausible for each locality but are NOT real listings, and the RERA
--     numbers are structurally correct but fictional.
--
--     Before launch: delete everything this file inserts, then enter the
--     client's real inventory through /studio. The single statement at the
--     very bottom of this file does that cleanly.
--
--     Why invent names rather than seed real Ahmedabad projects? Publishing a
--     real developer's trademark and a fabricated price against it would be
--     both misleading and a liability. Everything here is clearly fictional.
--
-- Localities referenced below all exist in `src/config/site.ts`, so every
-- seeded listing lands on a real locality page.
-- ═══════════════════════════════════════════════════════════════════════════

begin;

-- ───────────────────────────────────────────────────────────────────────────
-- BUILDERS
-- ───────────────────────────────────────────────────────────────────────────

insert into builders (slug, name, established, about, projects_done, is_published, sort_order) values
  ('aarambh-group',      'Aarambh Group',       1994, 'Ahmedabad-based developer with a thirty-year record in west-side residential. Known for delivering ahead of schedule on mid-rise projects and for unusually low common-area loading.', 41, true, 1),
  ('saptak-developers',  'Saptak Developers',   2001, 'Mid-market specialist across the Bopal and Shela corridor. Four consecutive projects handed over within ninety days of the registered date.', 28, true, 2),
  ('vistara-infra',      'Vistara Infra',       2009, 'Premium high-rise developer concentrated on the Iskon-Ambli and Sindhu Bhavan stretch. Smaller output, higher specification.', 12, true, 3),
  ('shaurya-builders',   'Shaurya Builders',    1988, 'One of the oldest continuously trading names in Ahmedabad residential. Conservative, low-leverage, almost entirely referral-driven.', 63, true, 4),
  ('medha-realty',       'Medha Realty',        2014, 'GIFT City and Gandhinagar focused, with a strong institutional leasing relationship base.', 9,  true, 5),
  ('triveni-estates',    'Triveni Estates',     2006, 'North-corridor developer across Chandkheda, Tragad and Zundal. High volume, keen pricing.', 34, true, 6),
  ('anantam-group',      'Anantam Group',       1999, 'Commercial and mixed-use across SG Highway and Prahladnagar.', 22, true, 7),
  ('kshitij-developers', 'Kshitij Developers',  2011, 'Villa and bungalow schemes in Ambli, Shilaj and Bhadaj.', 15, true, 8),
  ('niyati-homes',       'Niyati Homes',        2017, 'Affordable and mid-segment housing on the SP Ring Road corridor.', 7,  true, 9),
  ('oorja-realty',       'Oorja Realty',        2003, 'Established Gandhinagar developer, strong in Kudasan and Randesan.', 26, true, 10)
on conflict (slug) do nothing;

-- ───────────────────────────────────────────────────────────────────────────
-- PROJECTS
-- `is_partnered = true` marks the co-invested projects that drive the
-- "skin in the game" section on the homepage. Four of nine, deliberately —
-- the claim is only credible if it is clearly a minority.
-- ───────────────────────────────────────────────────────────────────────────

insert into projects (
  slug, name, builder_id, city, locality_slug, address, lat, lng,
  category, status, possession, possession_date, rera_id,
  total_units, total_towers, floors, land_area_acres,
  price_min, price_max, tagline, description, highlights, amenities,
  specifications, is_partnered, is_featured, published_at
) values
(
  'serene-heights', 'Serene Heights',
  (select id from builders where slug = 'aarambh-group'),
  'ahmedabad', 'shilaj', 'Off Shilaj Circle, Near Sola Bhagwat', 23.0318, 72.4582,
  'residential', 'published', 'possession-in-2-years', '2028-06-30',
  'PR/GJ/AHMEDABAD/AHMEDABAD/AUDA/MAA11287/310125',
  246, 3, 14, 4.20,
  9800000, 16500000,
  'Three towers on four acres, with 28% loading — the lowest in the corridor.',
  E'Serene Heights is the project we point to when a client asks what "good value" looks like in Shilaj. It is not the most expensive scheme on the corridor and it does not have the largest clubhouse. What it has is a 28% common-area loading, which in a market where 38–42% is normal means roughly 140 more usable square feet for the same money on a 3 BHK.\n\nAarambh has delivered its last four west-side projects within ninety days of the registered date, which is the main reason we were comfortable co-investing here. The towers are set back far enough from each other that the lower floors still get light — worth checking yourself on a site visit, because it is the thing most renderings misrepresent.\n\nThe trade-off is honest: retail and schools on this stretch of Shilaj are still arriving. If you need a school within walking distance today, Bopal is the better answer.',
  array['28% common-area loading, against a 38–42% corridor norm','Developer delivered its last four projects within 90 days of the registered date','3-side open corner units in Tower B','Set-back spacing keeps light on lower floors','Clubhouse completed and handed over before possession'],
  array['Clubhouse','Swimming Pool','Gymnasium','Landscaped Garden','Children''s Play Area','Jogging Track','Indoor Games','Multipurpose Hall','Covered Parking','Visitor Parking','EV Charging','24×7 Security','CCTV Surveillance','Power Backup','Lift','Rainwater Harvesting','Sewage Treatment Plant','Fire Safety','Vastu Compliant','Yoga Deck'],
  '{"structure":"RCC frame, seismic zone III compliant","flooring":"800×800 vitrified tile in living and bedrooms, anti-skid in wet areas","kitchen":"Granite counter, stainless sink, provision for water purifier and chimney","doors":"Teak-finish main door, flush internal doors","windows":"Powder-coated aluminium sliding with mosquito mesh","electrical":"Concealed copper wiring, modular switches, AC points in all bedrooms","lifts":"Two passenger plus one service per tower","water":"Borewell plus AMC supply, overhead and underground tanks"}'::jsonb,
  true, true, now() - interval '18 days'
),
(
  'kalrav-residency', 'Kalrav Residency',
  (select id from builders where slug = 'saptak-developers'),
  'ahmedabad', 'shela', 'Shela–Ambli Link Road', 23.0062, 72.4729,
  'residential', 'published', 'ready-to-move', null,
  'PR/GJ/AHMEDABAD/AHMEDABAD/AUDA/MAA09841/120823',
  180, 2, 12, 2.80,
  7200000, 11800000,
  'Ready to move, OC received, and about 12% below the new-launch rate next door.',
  E'Kalrav is finished. The occupancy certificate is in hand, the clubhouse is running, and the trees in the central garden are four years old rather than four months. That matters more than it sounds: you can walk the actual flat, at the actual time of day you would live in it, and there is no delivery risk at all.\n\nIt trades about 12% below the new launches on the same road, which is the usual discount a completed project carries against an under-construction one with a glossier brochure. For a buyer who is currently paying rent, that discount plus the absence of a two-year wait is normally decisive.\n\nSaptak handed this over seventy days after the registered date, which by Ahmedabad standards is good. Ask us for the full delivery table before you decide.',
  array['Occupancy certificate received — no delivery risk','Roughly 12% below the new-launch rate on the same road','Four-year-old landscaping, fully grown','Clubhouse and pool operational','No GST payable on a completed property'],
  array['Clubhouse','Swimming Pool','Gymnasium','Landscaped Garden','Children''s Play Area','Indoor Games','Multipurpose Hall','Senior Citizen Zone','Covered Parking','Visitor Parking','24×7 Security','CCTV Surveillance','Video Door Phone','Power Backup','Lift','Rainwater Harvesting','Fire Safety','Temple'],
  '{"structure":"RCC frame","flooring":"Vitrified tile throughout","kitchen":"Granite counter with dado tiling","doors":"Laminated flush doors","electrical":"Concealed wiring, AC points in master and living"}'::jsonb,
  false, true, now() - interval '34 days'
),
(
  'the-aurelia', 'The Aurelia',
  (select id from builders where slug = 'vistara-infra'),
  'ahmedabad', 'iskon-ambli', 'Iskon–Ambli Road, Near Ambli Circle', 23.0255, 72.4878,
  'residential', 'published', 'possession-after-2-years', '2029-03-31',
  'PR/GJ/AHMEDABAD/AHMEDABAD/AUDA/MAA12033/150226',
  96, 1, 22, 1.60,
  24500000, 42000000,
  'Ninety-six apartments in twenty-two floors — four to a floor, two lifts each.',
  E'The Aurelia is a low-density tower in a corridor that has mostly gone the other way. Four apartments to a floor means two lifts serve eight homes rather than sixteen, and the lobby is a lobby rather than a corridor.\n\nThis is the most expensive project we represent and we are not going to pretend the premium is purely rational. You are paying for density, for a specification that genuinely is a tier above the corridor, and for an address. Whether that is worth roughly ₹12,000 per square foot is a question about your life rather than a question about arithmetic.\n\nWhat we will say plainly: Vistara builds twelve projects in fifteen years, not sixty. The specification in their handed-over buildings matches the specification in their brochures, which is rarer than it should be.',
  array['Four apartments per floor, two lifts per core','Imported marble in living and dining as standard','Double-height entrance lobby','Private lift lobby on the top four floors','Developer specification matches delivered specification on past projects'],
  array['Clubhouse','Swimming Pool','Gymnasium','Landscaped Garden','Indoor Games','Yoga Deck','Amphitheatre','Co-working Lounge','Covered Parking','Visitor Parking','EV Charging','24×7 Security','CCTV Surveillance','Video Door Phone','Power Backup','Lift','Rainwater Harvesting','Sewage Treatment Plant','Solar Panels','Fire Safety','Terrace Garden','Pet Park'],
  '{"structure":"RCC shear-wall, seismic zone III","flooring":"Imported marble in living and dining, engineered wood in bedrooms","kitchen":"Modular with quartz counter, built-in hob, chimney and oven provision","doors":"Solid-core veneered main door with digital lock","windows":"Double-glazed UPVC","electrical":"VRV-ready, home automation provision, modular switches","lifts":"Two high-speed passenger plus one service per core","water":"Softened supply, dual plumbing"}'::jsonb,
  true, true, now() - interval '9 days'
),
(
  'triveni-skyline', 'Triveni Skyline',
  (select id from builders where slug = 'triveni-estates'),
  'ahmedabad', 'chandkheda', 'New CG Road, Chandkheda', 23.1096, 72.5825,
  'residential', 'published', 'possession-in-1-year', '2027-09-30',
  'PR/GJ/AHMEDABAD/AHMEDABAD/AUDA/MAA10776/040924',
  312, 4, 13, 5.10,
  4900000, 8200000,
  'The most affordable project we represent, in the best-connected part of the north.',
  E'Chandkheda is the answer for buyers who have been priced out of the west and do not want to move to the far edge of the ring road. It has a metro station, direct access to Gandhinagar, and infrastructure that is already built rather than promised.\n\nTriveni Skyline is a volume project and it is priced like one. The specification is standard, the clubhouse is modest, and the towers are closer together than we would ideally like. What you get for that is a 2 BHK in a fully serviced locality under ₹55 lakh, which is genuinely difficult to find anywhere else with a metro connection.\n\nFor a first purchase, or for an investor targeting rental demand from the GIFT City commute, this is sensible. For a family wanting a large flat and a garden, look at Tragad or Jagatpur instead.',
  array['Eleven minutes from Chandkheda metro station','Direct Gandhinagar and GIFT City access','Entry 2 BHK under ₹55 lakh','Phase 1 of 4 already structurally complete','Strong rental demand from the GIFT commute'],
  array['Clubhouse','Gymnasium','Landscaped Garden','Children''s Play Area','Jogging Track','Multipurpose Hall','Covered Parking','Visitor Parking','24×7 Security','CCTV Surveillance','Power Backup','Lift','Rainwater Harvesting','Fire Safety','Temple'],
  '{"structure":"RCC frame","flooring":"Vitrified tile","kitchen":"Granite counter","doors":"Flush doors","electrical":"Concealed wiring, AC point in master bedroom"}'::jsonb,
  false, false, now() - interval '21 days'
),
(
  'medha-one-ifsc', 'Medha One',
  (select id from builders where slug = 'medha-realty'),
  'gandhinagar', 'gift-city', 'GIFT City SEZ, Road 5C', 23.1602, 72.6847,
  'residential', 'published', 'possession-in-2-years', '2028-12-31',
  'PR/GJ/GANDHINAGAR/GANDHINAGAR/GUDA/MAA11902/220226',
  144, 2, 28, 1.10,
  21000000, 38000000,
  'Walk to work inside the IFSC, on the district cooling network.',
  E'Medha One is inside the SEZ, which is the entire proposition. If you work in GIFT City, you walk. If you are investing, your tenant pool is banks and funds leasing on company paper at rents that do not exist four kilometres away in Kudasan.\n\nWe co-invested here on the rental thesis rather than the capital-appreciation one. The residential supply inside the IFSC is small against the employment being created, and institutional tenants renew.\n\nRead our GIFT City guide before you enquire. It explains at length who this is wrong for — which is most people. If you want space, a market you can walk to and a school five minutes away, Kudasan gives you considerably more for considerably less.',
  array['Inside the GIFT City SEZ — genuine walk to work','District cooling, no individual AC plant to own or maintain','Institutional tenant pool leasing on company paper','Automated waste collection and underground utility tunnels','Smallest residential supply relative to employment in the region'],
  array['Clubhouse','Swimming Pool','Gymnasium','Landscaped Garden','Indoor Games','Yoga Deck','Co-working Lounge','Covered Parking','Visitor Parking','EV Charging','24×7 Security','CCTV Surveillance','Video Door Phone','Power Backup','Lift','Rainwater Harvesting','Sewage Treatment Plant','Solar Panels','Fire Safety','Terrace Garden'],
  '{"structure":"RCC shear-wall","cooling":"District cooling system — metered utility, no individual plant","flooring":"Imported marble in living, vitrified in bedrooms","kitchen":"Modular with quartz counter and built-in appliances","windows":"Double-glazed, acoustically rated","utilities":"Underground tunnel-routed, automated waste collection"}'::jsonb,
  true, true, now() - interval '6 days'
),
(
  'kshitij-arbour', 'Kshitij Arbour',
  (select id from builders where slug = 'kshitij-developers'),
  'ahmedabad', 'ambli', 'Ambli–Bopal Road', 23.0211, 72.4772,
  'residential', 'published', 'possession-in-2-years', '2028-09-30',
  'PR/GJ/AHMEDABAD/AHMEDABAD/AUDA/MAA11544/180725',
  34, null, 3, 6.40,
  38000000, 62000000,
  'Thirty-four villas on six and a half acres, gated, with 40% open ground.',
  E'The closest Ahmedabad gets to a gated estate. Thirty-four villas across six and a half acres means roughly 40% of the site stays open — a central green, a tree-lined internal road, and genuine distance between houses.\n\nEach villa sits on 4,000 to 6,500 square feet of plot with a built-up area of 4,200 to 6,800. Private garden, private parking for three cars, and a service entrance that is actually separate.\n\nThis is a long-horizon purchase. Villa resale in Ahmedabad is thinner and slower than apartment resale — fewer buyers at this ticket size, and they take their time. If you might need to exit within five years, an apartment in Iskon-Ambli will be considerably more liquid.',
  array['34 villas on 6.4 acres — about 40% open ground','Plots from 4,000 to 6,500 sq.ft','Private garden and three-car parking per villa','Separate service entrance','Gated with a single controlled access point'],
  array['Clubhouse','Swimming Pool','Gymnasium','Landscaped Garden','Children''s Play Area','Jogging Track','Indoor Games','Yoga Deck','Amphitheatre','Covered Parking','Visitor Parking','EV Charging','24×7 Security','CCTV Surveillance','Video Door Phone','Power Backup','Rainwater Harvesting','Sewage Treatment Plant','Solar Panels','Fire Safety','Pet Park','Temple'],
  '{"structure":"RCC frame, individual footing","plot_sizes":"4,000 – 6,500 sq.ft","built_up":"4,200 – 6,800 sq.ft","flooring":"Imported marble ground floor, engineered wood upper floors","kitchen":"Modular with island, built-in appliances","parking":"Three covered per villa","power":"Individual DG backup provision"}'::jsonb,
  false, true, now() - interval '28 days'
),
(
  'anantam-axis', 'Anantam Axis',
  (select id from builders where slug = 'anantam-group'),
  'ahmedabad', 'sg-highway', 'SG Highway, Near Gurudwara', 23.0312, 72.5063,
  'commercial', 'published', 'ready-to-move', null,
  'PR/GJ/AHMEDABAD/AHMEDABAD/AUDA/MAA08992/110622',
  120, 1, 12, 1.40,
  4500000, 32000000,
  'Grade-A offices on the highway, from 480 sq.ft to a full floor.',
  E'Anantam Axis is where we send clients who want commercial yield rather than residential capital appreciation. Office rents on this stretch of SG Highway support gross yields of 6.5–8%, against 2.5–3.5% on a residential flat in the same postcode.\n\nUnits run from a 480 square foot single-cabin office to a 9,200 square foot full floor. The building is complete and about 70% occupied, which means you can see the actual tenant profile rather than guess at it.\n\nCommercial is a different discipline from residential: leases are longer, tenants are harder to replace, and a vacancy costs more. But for a buyer whose objective is income rather than a home, the arithmetic here is simply better.',
  array['Gross yields of 6.5–8% against 2.5–3.5% residential','Building complete and about 70% occupied','Units from 480 sq.ft to a 9,200 sq.ft full floor','Direct SG Highway frontage with service-road access','Three-level basement parking'],
  array['Covered Parking','Visitor Parking','EV Charging','24×7 Security','CCTV Surveillance','Power Backup','Lift','Fire Safety','Co-working Lounge','Multipurpose Hall'],
  '{"structure":"RCC frame","efficiency":"About 72% carpet efficiency","hvac":"Central VRV, individually metered","power":"100% DG backup","parking":"Three basement levels","floor_plate":"9,200 sq.ft"}'::jsonb,
  false, false, now() - interval '45 days'
),
(
  'oorja-vistas', 'Oorja Vistas',
  (select id from builders where slug = 'oorja-realty'),
  'gandhinagar', 'kudasan', 'Kudasan, Near Infocity Circle', 23.1894, 72.6356,
  'residential', 'published', 'ready-to-move', null,
  'PR/GJ/GANDHINAGAR/GANDHINAGAR/GUDA/MAA09120/080723',
  168, 2, 11, 3.60,
  6800000, 12400000,
  'The sensible alternative to GIFT City: twice the space, ten minutes away.',
  E'Oorja Vistas is the project we recommend to most people who arrive asking about GIFT City. It is ten minutes from the IFSC, it is finished, and it costs roughly 40% less per square foot.\n\nWhat you give up is the walk to work. What you get is a 3 BHK with 1,450 square feet of carpet instead of 850, a proper clubhouse, an established neighbourhood with schools and a market, and a social fabric that already exists.\n\nFor a family, that trade is almost always right. For a single professional whose entire life is inside the SEZ, it probably is not. We will ask which one you are before we recommend either.',
  array['About 40% cheaper per sq.ft than inside the GIFT SEZ','Ten minutes from the IFSC','Occupancy certificate received','Schools, market and clinics within a kilometre','Gandhinagar planned-grid roads'],
  array['Clubhouse','Swimming Pool','Gymnasium','Landscaped Garden','Children''s Play Area','Indoor Games','Jogging Track','Multipurpose Hall','Senior Citizen Zone','Covered Parking','Visitor Parking','24×7 Security','CCTV Surveillance','Video Door Phone','Power Backup','Lift','Rainwater Harvesting','Sewage Treatment Plant','Fire Safety','Temple','Yoga Deck'],
  '{"structure":"RCC frame","flooring":"Vitrified tile throughout, anti-skid in wet areas","kitchen":"Granite counter with dado, chimney provision","doors":"Teak-finish main, flush internal","electrical":"Concealed wiring, AC points in all bedrooms"}'::jsonb,
  true, true, now() - interval '40 days'
),
(
  'shaurya-kinara', 'Shaurya Kinara',
  (select id from builders where slug = 'shaurya-builders'),
  'ahmedabad', 'south-bopal', 'South Bopal, Off Bopal–Ghuma Road', 23.0229, 72.4698,
  'residential', 'published', 'new-launch', '2029-06-30',
  'PR/GJ/AHMEDABAD/AHMEDABAD/AUDA/MAA12410/050326',
  210, 3, 15, 3.90,
  8400000, 14200000,
  'Launch pricing from a developer with sixty-three completed projects behind it.',
  E'Shaurya has been building in Ahmedabad since 1988 and has handed over sixty-three projects. They are conservative, they do not over-leverage, and almost all their sales come from referral rather than advertising. For a new launch — where you are buying a promise — that record is the main thing worth paying attention to.\n\nKinara is at launch pricing, which means the best units and the lowest rates are available now and both will move. It also means a three-year wait and the delivery risk that comes with any under-construction purchase, mitigated here by the developer''s history and the RERA escrow.\n\nIf your finances need certainty, or you are paying rent while you wait, look at Kalrav Residency in Shela instead — ready, OC in hand, and you can move next month.',
  array['Developer has handed over 63 projects since 1988','Launch pricing — best units and lowest rates available now','Three towers with 32% loading','70% of buyer funds in RERA escrow against construction progress','Referral-driven developer with low advertising spend'],
  array['Clubhouse','Swimming Pool','Gymnasium','Landscaped Garden','Children''s Play Area','Indoor Games','Jogging Track','Multipurpose Hall','Senior Citizen Zone','Amphitheatre','Covered Parking','Visitor Parking','EV Charging','24×7 Security','CCTV Surveillance','Video Door Phone','Power Backup','Lift','Rainwater Harvesting','Sewage Treatment Plant','Solar Panels','Fire Safety','Vastu Compliant','Temple'],
  '{"structure":"RCC frame, seismic zone III","flooring":"Large-format vitrified tile","kitchen":"Granite counter, modular provision","doors":"Teak-finish main door","windows":"Powder-coated aluminium sliding","electrical":"Concealed copper, modular switches, AC points throughout"}'::jsonb,
  false, false, now() - interval '3 days'
)
on conflict (slug) do nothing;

-- ───────────────────────────────────────────────────────────────────────────
-- PROPERTIES
-- Individual sellable units. Prices are derived from each locality's
-- ₹/sq.ft band in src/config/site.ts, so the listings are internally
-- consistent with the rates the locality pages advertise.
-- ───────────────────────────────────────────────────────────────────────────

insert into properties (
  slug, title, project_id, builder_id, city, locality_slug, address, lat, lng,
  category, property_type, transaction, status,
  bhk, bathrooms, balconies, floor_no, total_floors, facing, furnishing, age_years,
  carpet_sqft, super_sqft, plot_sqft,
  price, price_on_request, maintenance_psf, booking_amount, is_negotiable,
  possession, possession_date, rera_id, rera_verified,
  description, highlights, amenities, nearby,
  is_featured, is_exclusive, sort_order, view_count, enquiry_count, published_at
) values

-- ── Shilaj / Serene Heights ───────────────────────────────────────────────
(
  '3-bhk-serene-heights-shilaj-tower-b',
  '3 BHK corner unit in Serene Heights, Shilaj',
  (select id from projects where slug = 'serene-heights'),
  (select id from builders where slug = 'aarambh-group'),
  'ahmedabad', 'shilaj', 'Tower B, Serene Heights, Off Shilaj Circle', 23.0318, 72.4582,
  'residential', 'flats', 'sale', 'published',
  3, 3, 2, 9, 14, 'North-East', 'unfurnished', 0,
  1485, 2064, null,
  12900000, false, 3.20, 500000, true,
  'possession-in-2-years', '2028-06-30',
  'PR/GJ/AHMEDABAD/AHMEDABAD/AUDA/MAA11287/310125', true,
  E'A corner unit on the ninth floor of Tower B, open on three sides. North-east facing, which in Ahmedabad means morning light in the living room and no direct afternoon sun on the bedrooms — the single most underrated specification in this climate.\n\n1,485 sq.ft of carpet at a 28% loading. For comparison, a 2,064 sq.ft super built-up flat in most competing Shilaj projects would give you around 1,290 sq.ft of carpet. That is a difference of nearly 200 usable square feet for the same advertised size.\n\nThe ninth floor is above the tree line and below the premium the top four floors carry. Both lifts in Tower B serve this core.\n\nWhat we would check on your visit: the distance to the next tower from the bedroom windows, and the actual depth of the second balcony, which is smaller than the render suggests.',
  array['Corner unit, open on three sides','North-east facing — morning light, no afternoon heat load','1,485 sq.ft carpet at 28% loading, roughly 200 sq.ft more usable than comparable flats','Above the tree line, below the top-floor premium','Two lifts serving this core'],
  array['Clubhouse','Swimming Pool','Gymnasium','Landscaped Garden','Children''s Play Area','Jogging Track','Indoor Games','Covered Parking','EV Charging','24×7 Security','CCTV Surveillance','Power Backup','Lift','Rainwater Harvesting','Fire Safety','Vastu Compliant','Yoga Deck'],
  '[{"name":"Udgam School","type":"school","distance_km":2.4},{"name":"Shilaj Circle","type":"transit","distance_km":0.8},{"name":"Shalby Hospital SG Highway","type":"hospital","distance_km":4.1},{"name":"Rajpath Club","type":"park","distance_km":5.2},{"name":"Iskon Mega Mall","type":"mall","distance_km":5.8}]'::jsonb,
  true, true, 1, 412, 23, now() - interval '18 days'
),
(
  '4-bhk-serene-heights-shilaj',
  '4 BHK in Serene Heights, Shilaj',
  (select id from projects where slug = 'serene-heights'),
  (select id from builders where slug = 'aarambh-group'),
  'ahmedabad', 'shilaj', 'Tower A, Serene Heights, Off Shilaj Circle', 23.0318, 72.4582,
  'residential', 'flats', 'sale', 'published',
  4, 4, 3, 11, 14, 'East', 'unfurnished', 0,
  1920, 2668, null,
  16500000, false, 3.20, 700000, true,
  'possession-in-2-years', '2028-06-30',
  'PR/GJ/AHMEDABAD/AHMEDABAD/AUDA/MAA11287/310125', true,
  E'The largest configuration in Serene Heights, on the eleventh floor of Tower A. East facing, four bedrooms all with attached bathrooms, and a utility balcony that is genuinely usable rather than nominal.\n\nAt 1,920 sq.ft carpet this is a full-family flat rather than a 3 BHK with a study bolted on. The fourth bedroom is 11 by 12 feet, which is a real room.\n\nTower A is the first of the three to be handed over, so this unit should complete slightly ahead of the registered date. We would still plan around June 2028 rather than the developer''s informal estimate.',
  array['Largest configuration in the project','All four bedrooms en-suite','Fourth bedroom is 11×12 — a real room, not a study','Tower A hands over first','Usable utility balcony'],
  array['Clubhouse','Swimming Pool','Gymnasium','Landscaped Garden','Children''s Play Area','Jogging Track','Indoor Games','Multipurpose Hall','Covered Parking','Visitor Parking','EV Charging','24×7 Security','CCTV Surveillance','Power Backup','Lift','Rainwater Harvesting','Sewage Treatment Plant','Fire Safety','Vastu Compliant'],
  '[{"name":"Udgam School","type":"school","distance_km":2.4},{"name":"Shilaj Circle","type":"transit","distance_km":0.8},{"name":"Shalby Hospital SG Highway","type":"hospital","distance_km":4.1}]'::jsonb,
  true, false, 2, 287, 14, now() - interval '16 days'
),

-- ── Shela / Kalrav Residency ──────────────────────────────────────────────
(
  '3-bhk-kalrav-residency-shela-ready',
  '3 BHK ready to move in Kalrav Residency, Shela',
  (select id from projects where slug = 'kalrav-residency'),
  (select id from builders where slug = 'saptak-developers'),
  'ahmedabad', 'shela', 'Kalrav Residency, Shela–Ambli Link Road', 23.0062, 72.4729,
  'residential', 'flats', 'sale', 'published',
  3, 3, 2, 7, 12, 'West', 'semi-furnished', 2,
  1340, 1876, null,
  9600000, false, 2.80, 400000, true,
  'ready-to-move', null,
  'PR/GJ/AHMEDABAD/AHMEDABAD/AUDA/MAA09841/120823', true,
  E'Ready to move, occupancy certificate in hand, and you can be in it next month.\n\nSeventh floor, west facing. West facing in Ahmedabad means afternoon heat, which is a genuine drawback — but it also means this unit is priced about 6% below the equivalent east-facing flat in the same tower, and the previous owner installed reflective film and heavier curtains that are included.\n\nSemi-furnished: modular kitchen, wardrobes in two bedrooms, three air conditioners, and light fittings throughout. On a ₹96 lakh purchase that is easily ₹4–5 lakh of fit-out you do not have to fund separately.\n\nNo GST, because the building is complete. No delivery risk. The clubhouse and pool have been running for two years.',
  array['Occupancy certificate received — move in next month','No GST payable on a completed property','Semi-furnished: modular kitchen, wardrobes, three ACs','About 6% below the east-facing equivalent','Clubhouse and pool operational for two years'],
  array['Clubhouse','Swimming Pool','Gymnasium','Landscaped Garden','Children''s Play Area','Indoor Games','Multipurpose Hall','Senior Citizen Zone','Covered Parking','Visitor Parking','24×7 Security','CCTV Surveillance','Video Door Phone','Power Backup','Lift','Rainwater Harvesting','Fire Safety','Temple'],
  '[{"name":"Anand Niketan School Shilaj","type":"school","distance_km":3.2},{"name":"Shela Circle","type":"transit","distance_km":1.1},{"name":"Sterling Hospital","type":"hospital","distance_km":6.4},{"name":"Ambli Circle","type":"transit","distance_km":2.8}]'::jsonb,
  true, false, 3, 534, 31, now() - interval '30 days'
),
(
  '2-bhk-kalrav-residency-shela',
  '2 BHK in Kalrav Residency, Shela',
  (select id from projects where slug = 'kalrav-residency'),
  (select id from builders where slug = 'saptak-developers'),
  'ahmedabad', 'shela', 'Kalrav Residency, Shela–Ambli Link Road', 23.0062, 72.4729,
  'residential', 'flats', 'sale', 'published',
  2, 2, 1, 4, 12, 'North', 'unfurnished', 2,
  985, 1379, null,
  7200000, false, 2.80, 300000, true,
  'ready-to-move', null,
  'PR/GJ/AHMEDABAD/AHMEDABAD/AUDA/MAA09841/120823', true,
  E'A north-facing 2 BHK on the fourth floor. North facing is the quiet premium in this climate — no direct sun load on any wall for most of the year, which shows up in the electricity bill.\n\n985 sq.ft of carpet is generous for a 2 BHK at this price point. The second bedroom takes a queen bed and a wardrobe without the door fouling, which sounds trivial and is the difference between a bedroom and a box.\n\nReady to move, no GST, and a sensible entry point into Shela for a first purchase or a rental investment. At current Shela rents this yields around 3.1% gross.',
  array['North facing — minimal heat load','985 sq.ft carpet, generous for a 2 BHK at this price','Ready to move, no GST','Around 3.1% gross rental yield at current Shela rents','Fourth floor — lift-independent in an emergency'],
  array['Clubhouse','Swimming Pool','Gymnasium','Landscaped Garden','Children''s Play Area','Indoor Games','Covered Parking','24×7 Security','CCTV Surveillance','Video Door Phone','Power Backup','Lift','Rainwater Harvesting','Fire Safety'],
  '[{"name":"Anand Niketan School Shilaj","type":"school","distance_km":3.2},{"name":"Shela Circle","type":"transit","distance_km":1.1},{"name":"Sterling Hospital","type":"hospital","distance_km":6.4}]'::jsonb,
  false, false, 10, 298, 19, now() - interval '27 days'
),

-- ── Iskon-Ambli / The Aurelia ─────────────────────────────────────────────
(
  '4-bhk-the-aurelia-iskon-ambli',
  '4 BHK in The Aurelia, Iskon–Ambli',
  (select id from projects where slug = 'the-aurelia'),
  (select id from builders where slug = 'vistara-infra'),
  'ahmedabad', 'iskon-ambli', 'The Aurelia, Iskon–Ambli Road', 23.0255, 72.4878,
  'residential', 'flats', 'sale', 'published',
  4, 5, 3, 16, 22, 'North-East', 'unfurnished', 0,
  2640, 3485, null,
  32000000, false, 5.50, 1500000, true,
  'possession-after-2-years', '2029-03-31',
  'PR/GJ/AHMEDABAD/AHMEDABAD/AUDA/MAA12033/150226', true,
  E'Sixteenth floor, north-east corner, one of four apartments on the floor.\n\n2,640 sq.ft of carpet with imported marble in the living and dining as standard specification rather than an upgrade. Five bathrooms for four bedrooms, which means a powder room off the living area — the detail that distinguishes a flat designed for entertaining from one that was not.\n\nThe north-east corner is the best orientation in the tower: morning light into the living room, and the master bedroom on the north wall with no afternoon load.\n\nThis is a ₹3.2 crore purchase and we will not pretend the premium over Shilaj is purely rational. What is rational: Vistara has built twelve projects in fifteen years and the delivered specification has matched the brochure in all of them. At this price that record is what you are actually buying.',
  array['North-east corner — the best orientation in the tower','Four apartments per floor, two lifts per core','Imported marble as standard, not an upgrade','Powder room off the living area','Developer specification has matched brochure on all past projects'],
  array['Clubhouse','Swimming Pool','Gymnasium','Landscaped Garden','Indoor Games','Yoga Deck','Amphitheatre','Co-working Lounge','Covered Parking','Visitor Parking','EV Charging','24×7 Security','CCTV Surveillance','Video Door Phone','Power Backup','Lift','Rainwater Harvesting','Sewage Treatment Plant','Solar Panels','Fire Safety','Terrace Garden','Pet Park'],
  '[{"name":"Calorx Olive School","type":"school","distance_km":1.6},{"name":"Ambli Circle","type":"transit","distance_km":0.9},{"name":"Shalby Hospital","type":"hospital","distance_km":3.4},{"name":"Sindhu Bhavan Road","type":"mall","distance_km":2.2},{"name":"Rajpath Club","type":"park","distance_km":3.1}]'::jsonb,
  true, true, 4, 623, 38, now() - interval '9 days'
),
(
  '3-bhk-the-aurelia-iskon-ambli',
  '3 BHK in The Aurelia, Iskon–Ambli',
  (select id from projects where slug = 'the-aurelia'),
  (select id from builders where slug = 'vistara-infra'),
  'ahmedabad', 'iskon-ambli', 'The Aurelia, Iskon–Ambli Road', 23.0255, 72.4878,
  'residential', 'flats', 'sale', 'published',
  3, 4, 2, 8, 22, 'East', 'unfurnished', 0,
  2010, 2653, null,
  24500000, false, 5.50, 1200000, true,
  'possession-after-2-years', '2029-03-31',
  'PR/GJ/AHMEDABAD/AHMEDABAD/AUDA/MAA12033/150226', true,
  E'The entry configuration at The Aurelia, on the eighth floor. East facing, 2,010 sq.ft of carpet, and the same specification as the larger units — the finish does not step down with the ticket size here, which is not true of every project in this bracket.\n\nEighth floor sits below the price premium the upper floors carry while still clearing most of the surrounding skyline on the east side.\n\nFor a buyer who wants the Iskon-Ambli address and the low-density building but does not need four bedrooms, this is the sensible unit in the project.',
  array['Entry configuration with the same specification as the larger units','East facing, clears the surrounding skyline','Below the upper-floor price premium','Four bathrooms for three bedrooms','Four apartments per floor'],
  array['Clubhouse','Swimming Pool','Gymnasium','Landscaped Garden','Indoor Games','Yoga Deck','Co-working Lounge','Covered Parking','EV Charging','24×7 Security','CCTV Surveillance','Video Door Phone','Power Backup','Lift','Rainwater Harvesting','Solar Panels','Fire Safety','Terrace Garden'],
  '[{"name":"Calorx Olive School","type":"school","distance_km":1.6},{"name":"Ambli Circle","type":"transit","distance_km":0.9},{"name":"Shalby Hospital","type":"hospital","distance_km":3.4}]'::jsonb,
  false, false, 11, 341, 17, now() - interval '8 days'
),

-- ── Thaltej resale ────────────────────────────────────────────────────────
(
  '3-bhk-resale-thaltej-mature-building',
  '3 BHK resale in Thaltej, 2,100 sq.ft',
  null,
  null,
  'ahmedabad', 'thaltej', 'Off Thaltej–Shilaj Road', 23.0469, 72.5096,
  'residential', 'flats', 'sale', 'published',
  3, 3, 2, 5, 8, 'North-East', 'furnished', 11,
  1620, 2100, null,
  14800000, false, 2.40, null, true,
  'ready-to-move', null,
  null, false,
  E'An eleven-year-old building in Thaltej, which is the point. The trees are mature, the society functions, the maintenance is ₹2.40 a square foot rather than ₹5.50, and you know exactly what you are buying because it is standing in front of you.\n\n1,620 sq.ft of carpet in a building with 23% loading — pre-amenity-boom construction, when loading was lower because there was less common area to load. A new project would advertise this as roughly 2,100 sq.ft super built-up.\n\nFully furnished by the current owner: modular kitchen, wardrobes throughout, five air conditioners, and good quality light fittings. Included in the price.\n\nThis is resale, so there is no RERA registration and there does not need to be — the Act governs promoters selling under-construction stock, not an owner reselling their home. The diligence here is the title chain, the encumbrance certificate and the society NOC, all of which we have reviewed and will share.\n\nThe honest drawback: no clubhouse, no pool, and the lift is original. If amenity matters to you, this is the wrong flat.',
  array['Eleven-year-old building — mature trees, functioning society','Maintenance ₹2.40/sq.ft against ₹5.50 in new amenity-heavy towers','23% loading, pre-amenity-boom construction','Fully furnished, included in the price','Title chain, EC and society NOC already reviewed'],
  array['Covered Parking','Visitor Parking','24×7 Security','CCTV Surveillance','Power Backup','Lift','Landscaped Garden','Temple','Fire Safety'],
  '[{"name":"Zebar School","type":"school","distance_km":1.2},{"name":"Thaltej Metro Station","type":"transit","distance_km":1.8},{"name":"Apollo Hospital","type":"hospital","distance_km":2.9},{"name":"Thaltej Cross Roads","type":"transit","distance_km":1.4},{"name":"AlphaOne Mall","type":"mall","distance_km":3.6}]'::jsonb,
  true, true, 5, 489, 27, now() - interval '12 days'
),

-- ── Chandkheda / Triveni Skyline ──────────────────────────────────────────
(
  '2-bhk-triveni-skyline-chandkheda',
  '2 BHK in Triveni Skyline, Chandkheda',
  (select id from projects where slug = 'triveni-skyline'),
  (select id from builders where slug = 'triveni-estates'),
  'ahmedabad', 'chandkheda', 'Triveni Skyline, New CG Road', 23.1096, 72.5825,
  'residential', 'flats', 'sale', 'published',
  2, 2, 1, 6, 13, 'East', 'unfurnished', 0,
  720, 1008, null,
  5400000, false, 2.20, 200000, true,
  'possession-in-1-year', '2027-09-30',
  'PR/GJ/AHMEDABAD/AHMEDABAD/AUDA/MAA10776/040924', true,
  E'A 2 BHK under ₹55 lakh, eleven minutes from a metro station, in a locality that is fully built out rather than promised.\n\nThat combination is genuinely hard to find in Ahmedabad now, and it is why we keep inventory in Chandkheda despite it being a long way from where most of our clients look.\n\n720 sq.ft of carpet is compact. The second bedroom is 10 by 10 and the kitchen is a galley. This is a sensible first flat or a rental asset, not a family home for five people — we would rather say that than have you visit expecting otherwise.\n\nStrong rental demand from the GIFT City commute, which is twenty-five minutes from here by road.',
  array['Under ₹55 lakh — the most affordable listing on our books','Eleven minutes from Chandkheda metro station','Twenty-five minutes to GIFT City','Locality already fully built out','Phase structurally complete, possession in about a year'],
  array['Clubhouse','Gymnasium','Landscaped Garden','Children''s Play Area','Jogging Track','Covered Parking','24×7 Security','CCTV Surveillance','Power Backup','Lift','Rainwater Harvesting','Fire Safety','Temple'],
  '[{"name":"Chandkheda Metro Station","type":"transit","distance_km":1.1},{"name":"Delhi Public School Bopal","type":"school","distance_km":4.8},{"name":"Sterling Hospital Gandhinagar","type":"hospital","distance_km":7.2},{"name":"GIFT City","type":"office","distance_km":14.5}]'::jsonb,
  false, false, 12, 376, 29, now() - interval '20 days'
),
(
  '3-bhk-triveni-skyline-chandkheda',
  '3 BHK in Triveni Skyline, Chandkheda',
  (select id from projects where slug = 'triveni-skyline'),
  (select id from builders where slug = 'triveni-estates'),
  'ahmedabad', 'chandkheda', 'Triveni Skyline, New CG Road', 23.1096, 72.5825,
  'residential', 'flats', 'sale', 'published',
  3, 3, 2, 9, 13, 'North', 'unfurnished', 0,
  1060, 1484, null,
  8200000, false, 2.20, 300000, true,
  'possession-in-1-year', '2027-09-30',
  'PR/GJ/AHMEDABAD/AHMEDABAD/AUDA/MAA10776/040924', true,
  E'North-facing 3 BHK on the ninth floor. 1,060 sq.ft of carpet, which at ₹82 lakh works out to about ₹7,700 per square foot — roughly 20% below the equivalent in Gota and about 40% below Shela.\n\nYou are paying less because Chandkheda is in the north rather than the west. If your work and your family are not on the west side, that discount is free money. If they are, the daily commute will cost you more than the saving.\n\nPossession is about a year out and the phase is structurally complete, which materially reduces the delivery risk compared with a new launch.',
  array['About ₹7,700/sq.ft — roughly 40% below Shela','North facing, minimal heat load','Phase structurally complete','Metro and Gandhinagar access','Possession about a year out'],
  array['Clubhouse','Gymnasium','Landscaped Garden','Children''s Play Area','Jogging Track','Multipurpose Hall','Covered Parking','Visitor Parking','24×7 Security','CCTV Surveillance','Power Backup','Lift','Rainwater Harvesting','Fire Safety','Temple'],
  '[{"name":"Chandkheda Metro Station","type":"transit","distance_km":1.1},{"name":"GIFT City","type":"office","distance_km":14.5}]'::jsonb,
  false, false, 13, 254, 16, now() - interval '19 days'
),

-- ── GIFT City / Medha One ─────────────────────────────────────────────────
(
  '3-bhk-medha-one-gift-city',
  '3 BHK in Medha One, GIFT City',
  (select id from projects where slug = 'medha-one-ifsc'),
  (select id from builders where slug = 'medha-realty'),
  'gandhinagar', 'gift-city', 'Medha One, GIFT City SEZ, Road 5C', 23.1602, 72.6847,
  'residential', 'flats', 'sale', 'published',
  3, 3, 2, 19, 28, 'East', 'unfurnished', 0,
  1450, 1885, null,
  28000000, false, 7.50, 1400000, true,
  'possession-in-2-years', '2028-12-31',
  'PR/GJ/GANDHINAGAR/GANDHINAGAR/GUDA/MAA11902/220226', true,
  E'Nineteenth floor, inside the GIFT City SEZ. East facing, 1,450 sq.ft of carpet, on the district cooling network.\n\nAt roughly ₹19,300 per square foot this is the most expensive thing on our books per unit area, and we want to be direct about why. You are not paying for construction quality three times better than Kudasan — you are paying for the walk to work, the district infrastructure, and a tenant pool of banks and funds leasing on company paper.\n\nIf you work inside the IFSC, that premium is usually worth it. If you do not, read our GIFT City guide first: Oorja Vistas in Kudasan gives you a larger flat, a proper clubhouse and an established neighbourhood for about 40% less, ten minutes away.\n\nTwo running costs to budget that do not apply elsewhere: district cooling is a metered utility, and maintenance has a district-level component on top of the society charge. Ask us for actual bills from an existing resident rather than an estimate.',
  array['Inside the GIFT City SEZ — genuine walk to work','District cooling, no individual AC plant to own','Institutional tenant pool on company-paper leases','Nineteenth floor, east facing','Smallest residential supply relative to employment in the region'],
  array['Clubhouse','Swimming Pool','Gymnasium','Landscaped Garden','Indoor Games','Yoga Deck','Co-working Lounge','Covered Parking','Visitor Parking','EV Charging','24×7 Security','CCTV Surveillance','Video Door Phone','Power Backup','Lift','Rainwater Harvesting','Sewage Treatment Plant','Solar Panels','Fire Safety','Terrace Garden'],
  '[{"name":"GIFT City Business District","type":"office","distance_km":0.4},{"name":"GIFT City Club","type":"park","distance_km":0.6},{"name":"Gandhinagar Railway Station","type":"transit","distance_km":9.8},{"name":"Apollo Hospital Gandhinagar","type":"hospital","distance_km":8.4}]'::jsonb,
  true, false, 6, 718, 44, now() - interval '6 days'
),

-- ── Kudasan / Oorja Vistas ────────────────────────────────────────────────
(
  '3-bhk-oorja-vistas-kudasan-ready',
  '3 BHK ready to move in Oorja Vistas, Kudasan',
  (select id from projects where slug = 'oorja-vistas'),
  (select id from builders where slug = 'oorja-realty'),
  'gandhinagar', 'kudasan', 'Oorja Vistas, Near Infocity Circle, Kudasan', 23.1894, 72.6356,
  'residential', 'flats', 'sale', 'published',
  3, 3, 2, 8, 11, 'North-East', 'unfurnished', 2,
  1450, 1943, null,
  10400000, false, 2.60, 400000, true,
  'ready-to-move', null,
  'PR/GJ/GANDHINAGAR/GANDHINAGAR/GUDA/MAA09120/080723', true,
  E'The same 1,450 sq.ft of carpet as the GIFT City flat above, for ₹1.04 crore instead of ₹2.8 crore.\n\nThat is the whole argument for Kudasan, and for most buyers it wins. Ten minutes from the IFSC, finished and occupied, with schools, a market and clinics inside a kilometre. The clubhouse works, the pool is open, and the landscaping is two years grown.\n\nWhat you give up is the walk to work. If your entire life is inside the SEZ, that matters. If you have a family, a car and a school run, it almost certainly does not.\n\nNorth-east facing on the eighth floor, ready to move, no GST. This is the flat we recommend most often to people who arrive asking about GIFT City.',
  array['Same carpet area as the GIFT City listing, about 63% less','Ten minutes from the IFSC','Ready to move, OC received, no GST','Schools, market and clinics within a kilometre','Two-year-grown landscaping, operational clubhouse'],
  array['Clubhouse','Swimming Pool','Gymnasium','Landscaped Garden','Children''s Play Area','Indoor Games','Jogging Track','Multipurpose Hall','Senior Citizen Zone','Covered Parking','Visitor Parking','24×7 Security','CCTV Surveillance','Video Door Phone','Power Backup','Lift','Rainwater Harvesting','Fire Safety','Temple','Yoga Deck'],
  '[{"name":"DPS Gandhinagar","type":"school","distance_km":2.1},{"name":"Infocity Circle","type":"transit","distance_km":0.7},{"name":"Apollo Hospital Gandhinagar","type":"hospital","distance_km":4.2},{"name":"GIFT City","type":"office","distance_km":6.8},{"name":"Reliance Mall Gandhinagar","type":"mall","distance_km":3.4}]'::jsonb,
  true, false, 7, 592, 36, now() - interval '38 days'
),

-- ── Ambli / Kshitij Arbour villa ──────────────────────────────────────────
(
  '5-bhk-villa-kshitij-arbour-ambli',
  '5 BHK villa in Kshitij Arbour, Ambli',
  (select id from projects where slug = 'kshitij-arbour'),
  (select id from builders where slug = 'kshitij-developers'),
  'ahmedabad', 'ambli', 'Kshitij Arbour, Ambli–Bopal Road', 23.0211, 72.4772,
  'residential', 'villas', 'sale', 'published',
  5, 6, 3, null, 3, 'East', 'unfurnished', 0,
  4850, null, 5200,
  48000000, false, 4.00, 2500000, true,
  'possession-in-2-years', '2028-09-30',
  'PR/GJ/AHMEDABAD/AHMEDABAD/AUDA/MAA11544/180725', true,
  E'A five-bedroom villa on a 5,200 sq.ft plot, with 4,850 sq.ft built across three levels, inside a gated scheme of thirty-four houses.\n\nThe thing that makes Arbour work is the density: thirty-four villas on six and a half acres leaves about 40% of the site open. There is a real distance between houses, a central green that is actually green, and a tree-lined internal road rather than a parking aisle.\n\nEast facing, private garden on two sides, covered parking for three cars, and a service entrance that is genuinely separate from the main one.\n\nThe honest caveat, which we give every villa buyer: resale at this ticket size in Ahmedabad is thin and slow. There are far fewer buyers at ₹4.8 crore than at ₹1 crore, and they take their time. If there is any chance you need to exit within five years, an apartment in Iskon-Ambli will be very much more liquid.',
  array['5,200 sq.ft plot, 4,850 sq.ft built across three levels','34 villas on 6.4 acres — about 40% open ground','Private garden on two sides','Three covered parking bays plus a separate service entrance','Single controlled access point to the scheme'],
  array['Clubhouse','Swimming Pool','Gymnasium','Landscaped Garden','Children''s Play Area','Jogging Track','Indoor Games','Yoga Deck','Amphitheatre','Covered Parking','Visitor Parking','EV Charging','24×7 Security','CCTV Surveillance','Video Door Phone','Power Backup','Rainwater Harvesting','Sewage Treatment Plant','Solar Panels','Fire Safety','Pet Park','Temple'],
  '[{"name":"Calorx Olive School","type":"school","distance_km":2.3},{"name":"Ambli Circle","type":"transit","distance_km":1.4},{"name":"Shalby Hospital","type":"hospital","distance_km":4.6},{"name":"Sindhu Bhavan Road","type":"mall","distance_km":3.8}]'::jsonb,
  true, true, 8, 445, 21, now() - interval '26 days'
),

-- ── South Bopal / Shaurya Kinara ──────────────────────────────────────────
(
  '3-bhk-shaurya-kinara-south-bopal',
  '3 BHK launch unit in Shaurya Kinara, South Bopal',
  (select id from projects where slug = 'shaurya-kinara'),
  (select id from builders where slug = 'shaurya-builders'),
  'ahmedabad', 'south-bopal', 'Shaurya Kinara, Off Bopal–Ghuma Road', 23.0229, 72.4698,
  'residential', 'flats', 'sale', 'published',
  3, 3, 2, 10, 15, 'East', 'unfurnished', 0,
  1290, 1703, null,
  10800000, false, 3.00, 450000, true,
  'new-launch', '2029-06-30',
  'PR/GJ/AHMEDABAD/AHMEDABAD/AUDA/MAA12410/050326', true,
  E'Launch pricing on the tenth floor, east facing, 1,290 sq.ft carpet.\n\nThe case for buying at launch is straightforward: the best units and the lowest rates are available now, and both go first. The case against is equally straightforward — it is a three-year wait and you are buying a promise.\n\nWhat makes this promise better than most is the developer. Shaurya has been building in Ahmedabad since 1988 and has handed over sixty-three projects. They are conservative, low-leverage and almost entirely referral-driven, which is exactly the profile that does not run out of money halfway through. Add the RERA escrow holding 70% of buyer funds against certified construction progress and the risk is as contained as it gets on an under-construction purchase.\n\nIf your finances need certainty, or you are paying rent in the meantime, look at Kalrav Residency in Shela instead — ready, OC in hand, move next month.',
  array['Launch pricing — best units and lowest rates available now','Developer has handed over 63 projects since 1988','70% of buyer funds in RERA escrow against construction progress','32% loading across all three towers','East facing, tenth floor'],
  array['Clubhouse','Swimming Pool','Gymnasium','Landscaped Garden','Children''s Play Area','Indoor Games','Jogging Track','Multipurpose Hall','Senior Citizen Zone','Amphitheatre','Covered Parking','Visitor Parking','EV Charging','24×7 Security','CCTV Surveillance','Video Door Phone','Power Backup','Lift','Rainwater Harvesting','Sewage Treatment Plant','Solar Panels','Fire Safety','Vastu Compliant','Temple'],
  '[{"name":"Anand Niketan School South Bopal","type":"school","distance_km":1.3},{"name":"South Bopal Circle","type":"transit","distance_km":0.9},{"name":"Zydus Hospital","type":"hospital","distance_km":5.1},{"name":"Bopal Market","type":"mall","distance_km":2.4}]'::jsonb,
  false, false, 14, 312, 24, now() - interval '3 days'
),

-- ── SG Highway / Anantam Axis commercial ──────────────────────────────────
(
  'office-1250-sqft-anantam-axis-sg-highway',
  'Grade-A office, 1,250 sq.ft, Anantam Axis, SG Highway',
  (select id from projects where slug = 'anantam-axis'),
  (select id from builders where slug = 'anantam-group'),
  'ahmedabad', 'sg-highway', 'Anantam Axis, SG Highway, Near Gurudwara', 23.0312, 72.5063,
  'commercial', 'offices', 'sale', 'published',
  null, 2, null, 7, 12, 'East', 'unfurnished', 3,
  900, 1250, null,
  11250000, false, 9.00, 500000, true,
  'ready-to-move', null,
  'PR/GJ/AHMEDABAD/AHMEDABAD/AUDA/MAA08992/110622', true,
  E'A 1,250 sq.ft office on the seventh floor, in a completed and roughly 70% occupied building with direct SG Highway frontage.\n\nThis is the listing we point income-focused buyers at. Office rents on this stretch support a gross yield of 6.5–8%, against 2.5–3.5% on a residential flat in the same postcode. At the current asking rent this unit yields about 7.2% gross.\n\n900 sq.ft of carpet at 72% efficiency, two washrooms, central VRV air conditioning that is individually metered, and 100% DG backup — which on SG Highway is not a luxury.\n\nCommercial is a different discipline from residential: leases run three to nine years, a vacancy costs more because fit-out is tenant-specific, and the tenant pool is narrower. But if your objective is income rather than a home, the arithmetic is simply better here.',
  array['About 7.2% gross yield at the current asking rent','Building complete and roughly 70% occupied — visible tenant profile','Direct SG Highway frontage with service-road access','72% carpet efficiency, individually metered VRV','100% DG backup and three-level basement parking'],
  array['Covered Parking','Visitor Parking','EV Charging','24×7 Security','CCTV Surveillance','Power Backup','Lift','Fire Safety','Co-working Lounge'],
  '[{"name":"Gurudwara SG Highway","type":"transit","distance_km":0.3},{"name":"Thaltej Metro Station","type":"transit","distance_km":2.6},{"name":"AlphaOne Mall","type":"mall","distance_km":1.9},{"name":"Sterling Hospital","type":"hospital","distance_km":3.2}]'::jsonb,
  false, false, 15, 203, 11, now() - interval '42 days'
),

-- ── Thaltej penthouse ─────────────────────────────────────────────────────
(
  '4-bhk-penthouse-thaltej',
  '4 BHK penthouse with private terrace, Thaltej',
  null,
  (select id from builders where slug = 'shaurya-builders'),
  'ahmedabad', 'thaltej', 'Off Thaltej–Shilaj Road', 23.0469, 72.5096,
  'residential', 'penthouses', 'sale', 'published',
  4, 5, 4, 8, 8, 'North-East', 'semi-furnished', 6,
  3180, 4120, null,
  36500000, false, 3.80, null, true,
  'ready-to-move', null,
  null, false,
  E'The top floor of an eight-storey building in Thaltej, with a 1,100 sq.ft private terrace that is genuinely private — not shared, not a common-area terrace with access rights.\n\n3,180 sq.ft of carpet across a single level, four bedrooms all en-suite, and a living-dining run of nearly forty feet. North-east facing, so the terrace is usable in the evening for most of the year.\n\nSix years old, which means the building has settled, the society functions, and the maintenance at ₹3.80 a square foot is known rather than projected.\n\nResale, so no RERA registration — the Act does not apply to an owner reselling a completed home. We have reviewed the title chain, the encumbrance certificate and the society NOC, and will share all three.\n\nPenthouses are the thinnest resale market in Ahmedabad. There are very few buyers at ₹3.65 crore who specifically want a top floor, and they are patient. Buy this because you want to live in it, not because you plan to trade it.',
  array['1,100 sq.ft genuinely private terrace, not shared','3,180 sq.ft carpet on a single level','All four bedrooms en-suite','North-east facing — terrace usable in the evenings','Title chain, EC and society NOC reviewed'],
  array['Covered Parking','Visitor Parking','24×7 Security','CCTV Surveillance','Power Backup','Lift','Landscaped Garden','Gymnasium','Terrace Garden','Fire Safety','Temple'],
  '[{"name":"Zebar School","type":"school","distance_km":1.4},{"name":"Thaltej Metro Station","type":"transit","distance_km":2.0},{"name":"Apollo Hospital","type":"hospital","distance_km":3.1},{"name":"AlphaOne Mall","type":"mall","distance_km":3.4}]'::jsonb,
  true, true, 9, 561, 25, now() - interval '15 days'
),

-- ── Gota ──────────────────────────────────────────────────────────────────
(
  '2-bhk-resale-gota-value',
  '2 BHK resale in Gota, 1,050 sq.ft',
  null,
  null,
  'ahmedabad', 'gota', 'Gota, Near Vande Mataram Circle', 23.1017, 72.5411,
  'residential', 'flats', 'sale', 'published',
  2, 2, 1, 3, 7, 'South-East', 'unfurnished', 8,
  780, 1050, null,
  5900000, false, 2.00, null, true,
  'ready-to-move', null,
  null, false,
  E'An eight-year-old 2 BHK in Gota at under ₹60 lakh. Gota is the north-west workhorse — big supply, every budget, and the widest spread of 2 and 3 BHK stock in the city. If you need options rather than a specific address, this is where to look.\n\n780 sq.ft of carpet in a 1,050 sq.ft super built-up flat. Third floor, south-east facing. The society is modest — covered parking, security, a lift, a small garden, no clubhouse.\n\nAt current Gota rents this yields around 3.4% gross, which is at the upper end for Ahmedabad residential and reflects both the low entry price and genuine rental demand from the SG Highway office corridor.\n\nResale, no RERA, diligence done on the title chain and EC. A sensible first purchase or a straightforward rental asset.',
  array['Under ₹60 lakh — strong entry point','About 3.4% gross yield, upper end for Ahmedabad residential','Established eight-year-old building, low ₹2.00/sq.ft maintenance','Rental demand from the SG Highway office corridor','Title chain and EC reviewed'],
  array['Covered Parking','Visitor Parking','24×7 Security','CCTV Surveillance','Power Backup','Lift','Landscaped Garden','Children''s Play Area','Fire Safety'],
  '[{"name":"Vande Mataram Circle","type":"transit","distance_km":0.6},{"name":"Nirma Vidyavihar","type":"school","distance_km":3.2},{"name":"SG Highway","type":"office","distance_km":4.1},{"name":"Vande Mataram Mall","type":"mall","distance_km":1.2}]'::jsonb,
  false, false, 16, 428, 33, now() - interval '24 days'
),

-- ── A draft, so /studio has something to demonstrate with ─────────────────
(
  '3-bhk-draft-example-bodakdev',
  '3 BHK in Bodakdev — draft, not yet live',
  null,
  (select id from builders where slug = 'aarambh-group'),
  'ahmedabad', 'bodakdev', 'Bodakdev, Off Judges Bungalow Road', 23.0390, 72.5121,
  'residential', 'flats', 'sale', 'draft',
  3, 3, 2, 4, 9, 'North', 'unfurnished', 4,
  1380, 1820, null,
  13200000, false, 3.00, null, true,
  'ready-to-move', null,
  null, false,
  E'This listing is deliberately left in DRAFT status so the studio has something to demonstrate the publish workflow with.\n\nIt is not visible anywhere on the public site — the row-level security policy only exposes rows with status published or under_offer, so this is invisible to the anon key entirely rather than merely hidden by the UI.\n\nOpen it in the studio, set the status to Published, and watch it appear on the Bodakdev locality page. Then set it back to Draft.',
  array['Draft status — invisible to the public site via RLS, not just hidden by the UI','Use this to test the publish workflow'],
  array['Covered Parking','24×7 Security','Power Backup','Lift','Landscaped Garden'],
  '[]'::jsonb,
  false, false, 999, 0, 0, null
)
on conflict (slug) do nothing;

-- ───────────────────────────────────────────────────────────────────────────
-- FLOOR PLANS — for the two projects whose pages show a configuration table
-- ───────────────────────────────────────────────────────────────────────────

-- `floor_plans` has no natural unique key, so the NOT EXISTS guard is what
-- keeps this file safe to re-run without duplicating every plan.
insert into floor_plans (project_id, label, bhk, carpet_sqft, super_sqft, price, sort_order)
select p.id, v.label, v.bhk, v.carpet, v.super, v.price, v.ord
from projects p
join (
  values
    ('serene-heights', '2 BHK — Type A', 2.0,  985, 1368,  9800000, 1),
    ('serene-heights', '3 BHK — Type B', 3.0, 1485, 2064, 12900000, 2),
    ('serene-heights', '4 BHK — Type C', 4.0, 1920, 2668, 16500000, 3),
    ('the-aurelia',    '3 BHK — East',   3.0, 2010, 2653, 24500000, 1),
    ('the-aurelia',    '4 BHK — Corner', 4.0, 2640, 3485, 32000000, 2),
    ('the-aurelia',    '4 BHK — Duplex', 4.0, 3260, 4302, 42000000, 3)
) as v(project_slug, label, bhk, carpet, super, price, ord)
  on v.project_slug = p.slug
where not exists (
  select 1 from floor_plans fp
  where fp.project_id = p.id and fp.label = v.label
);

-- ───────────────────────────────────────────────────────────────────────────
-- TESTIMONIALS
-- The `role` field carries the transaction — a named locality and a year is
-- what makes a testimonial checkable, and checkable is the only kind worth
-- publishing.
-- ───────────────────────────────────────────────────────────────────────────

-- Guarded on `author`, so re-running the file does not stack duplicates.
-- (`on conflict do nothing` would be a no-op here — there is no unique key.)
delete from testimonials
where author in (
  'Rahul & Priyanka Shah', 'Dr. Meera Desai', 'Jignesh Patel',
  'Aditi & Karan Mehta', 'Hemant Trivedi', 'Nilam Joshi',
  'Sanjay & Ritu Bhavsar'
);

insert into testimonials (author, role, locality, quote, rating, is_published, is_featured, sort_order) values
(
  'Rahul & Priyanka Shah', 'Bought a 3 BHK in Shela, 2024', 'Shela',
  'They talked us out of the first flat we fell in love with. The builder had slipped eighteen months on their previous project and they showed us the dates rather than just saying it. We ended up in a completed building for the same money and moved in six weeks later instead of waiting three years. I still think about how differently that would have gone with anyone else.',
  5, true, true, 1
),
(
  'Dr. Meera Desai', 'Bought a 4 BHK in Iskon-Ambli, 2023', 'Iskon-Ambli',
  'I had been looking for eight months on my own and had seen perhaps thirty flats. They asked four questions, told me two of my constraints were incompatible, and then showed me three options. I bought the second one. What I was paying for was the judgement, not the viewings.',
  5, true, true, 2
),
(
  'Jignesh Patel', 'Sold a 3 BHK in Thaltej, 2024', 'Thaltej',
  'I wanted sixteen percent more than they said it was worth. They declined the mandate rather than take it and grind me down later, which irritated me considerably at the time. I listed with someone else, sat unsold for five months, and eventually took almost exactly the number they had quoted. I used them for the purchase on the other side.',
  5, true, true, 3
),
(
  'Aditi & Karan Mehta', 'Bought a 2 BHK in Chandkheda, 2025', 'Chandkheda',
  'First home, and we had no idea what we did not know. They explained carpet versus super built-up on the first call and it changed which flats we were even looking at. They also put our file in front of four banks at once so we were negotiating from a sanction letter. Nothing was charged to us for any of that.',
  5, true, false, 4
),
(
  'Hemant Trivedi', 'Bought an office on SG Highway, 2023', 'SG Highway',
  'I went in wanting residential for the rental income. They ran the actual numbers against commercial on the same road and the difference was not close. Nobody else I spoke to even raised it — the residential commission is easier to earn. Three years in, the office has been let continuously.',
  5, true, false, 5
),
(
  'Nilam Joshi', 'Bought a 3 BHK in Kudasan, 2024', 'Kudasan',
  'I came in asking about GIFT City because that is what everyone talks about. They asked whether I actually worked there, and when I said no, they explained exactly what I would be paying the premium for and what I would get in Kudasan instead. Same carpet area, substantially less money, and a school my daughter can walk to. That conversation cost them a bigger commission.',
  5, true, false, 6
),
(
  'Sanjay & Ritu Bhavsar', 'Bought a villa in Ambli, 2022', 'Ambli',
  'They were blunt that villa resale here is slow and that we should buy it to live in rather than to trade. Three years later that is exactly right, and we are glad we went in knowing it rather than discovering it. The paperwork was handled properly — they found an issue with the title chain that the builder had not mentioned.',
  5, true, false, 7
);

-- ───────────────────────────────────────────────────────────────────────────
-- LOCALITY PRICE TRENDS
-- Eight quarters per featured locality, powering the trend data on locality
-- pages. Generated from each locality's current band with a plausible
-- quarter-on-quarter trajectory.
-- ───────────────────────────────────────────────────────────────────────────

insert into locality_stats (locality_slug, quarter, avg_psf, yoy_change_pct, inventory)
select
  l.slug,
  q.quarter,
  -- Walk backwards from the current mid-rate at roughly 1.8% per quarter.
  round(l.base * power(1.018, q.idx - 8))::int,
  round((power(1.018, 4) - 1) * 100, 2),
  l.inv + (q.idx * 3)
from (
  values
    ('thaltej',      10150, 24),
    ('shilaj',        8350, 41),
    ('shela',         7100, 58),
    ('south-bopal',   7650, 33),
    ('iskon-ambli',  10100, 19),
    ('bopal',         7150, 29),
    ('gota',          6600, 44),
    ('chandkheda',    6200, 37),
    ('zundal',        5950, 31),
    ('gift-city',    12750, 12),
    ('kudasan',       7300, 26),
    ('sindhubhavan', 10850, 14)
) as l(slug, base, inv)
cross join (
  values ('2025-Q1',1),('2025-Q2',2),('2025-Q3',3),('2025-Q4',4),
         ('2026-Q1',5),('2026-Q2',6),('2026-Q3',7),('2026-Q4',8)
) as q(quarter, idx)
on conflict (locality_slug, quarter) do nothing;

commit;

-- ═══════════════════════════════════════════════════════════════════════════
-- VERIFY
-- ═══════════════════════════════════════════════════════════════════════════
--
--   select
--     (select count(*) from builders)                                  as builders,
--     (select count(*) from projects)                                  as projects,
--     (select count(*) from projects where is_partnered)                as co_invested,
--     (select count(*) from properties where status = 'published')      as live_listings,
--     (select count(*) from properties where status = 'draft')          as drafts,
--     (select count(*) from testimonials where is_published)            as testimonials,
--     (select count(*) from locality_stats)                            as trend_points;
--
-- Expected: 10 builders · 9 projects · 4 co-invested · 16 live · 1 draft
--           7 testimonials · 96 trend points
--
-- ═══════════════════════════════════════════════════════════════════════════
-- REMOVE THE DEMO DATA BEFORE LAUNCH
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Run this once the client's real inventory is in. Order matters — children
-- before parents — and `leads` is deliberately NOT touched, because by then
-- it may hold real enquiries.
--
--   begin;
--     delete from floor_plans    where project_id in (select id from projects);
--     delete from property_images where property_id in (select id from properties);
--     delete from project_images  where project_id  in (select id from projects);
--     delete from properties;
--     delete from projects;
--     delete from builders;
--     delete from testimonials;
--     delete from locality_stats;
--   commit;
--
-- ═══════════════════════════════════════════════════════════════════════════
