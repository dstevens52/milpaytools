// Source: Installation Management Command (IMCOM), DoD, and service branch websites.
// ZIP codes are city/area ZIPs for the primary housing market surrounding each installation.

import type { Branch } from '@/types/military';

export interface NeighborhoodTip {
  name: string;
  highlight: string;
  commute: string;
  bestFor: string;
  typicalRent3br?: string;
}

export interface BahVsHousing {
  medianRent: number;
  medianRentSource: string;
  medianHomePrice: number;
  medianHomePriceSource: string;
  mortgageMin: number;
  mortgageMax: number;
  mortgageAssumptions: string;
}

export interface LocalHousingTips {
  coliNote: string;
  groceryNote?: string;
  stateTaxNote: string;
  neighborhoods: NeighborhoodTip[];
  mistakeToAvoid: string;
}

export interface DutyStation {
  name: string;
  slug: string;
  formerName?: string;
  zip: string;
  city: string;
  state: string;
  stateName: string;
  branches: Branch[];
  description: string;
  installationDetail?: string;
  rentalNote: string;
  rentalContext?: string;
  nearby: string[];
  oconus?: true;
  heroImage?: string;       // path like '/images/bases/fort-bragg.jpg'
  heroImageCredit?: string; // e.g. 'Photo: U.S. Army / DVIDS'
  bahVsHousing?: BahVsHousing;
  localHousingTips?: LocalHousingTips;
}

export const DUTY_STATIONS: DutyStation[] = [
  // ── ARMY ───────────────────────────────────────────────────────────────────
  {
    name: 'Fort Bragg',
    slug: 'fort-bragg',
    formerName: 'Fort Liberty (2023–2025)',
    zip: '28301',
    city: 'Fayetteville',
    state: 'NC',
    stateName: 'North Carolina',
    branches: ['Army'],
    description:
      'An E-5 with dependents at Fort Bragg receives $1,806/month in tax-free BAH. Fayetteville\'s median 3-bedroom rent is approximately $1,300/month — a difference of about $506/month before utilities and other housing costs. (Rental data: Zillow / RentCafe 2025–2026)',
    installationDetail:
      'Home of the 82nd Airborne and USASOC — the largest installation by population with over 50,000 active-duty soldiers.',
    rentalNote:
      "Fort Bragg BAH for E-5 with dependents is below the national median — Fayetteville's cost of living is approximately 6–10% below the national average. (Cost of living data: BestPlaces 2025–2026)",
    rentalContext:
      "Fayetteville's cost of living is approximately 6–10% below the national average. (Cost of living data: BestPlaces 2025–2026)",
    nearby: ['camp-lejeune', 'seymour-johnson-afb', 'marine-corps-air-station-cherry-point'],
    bahVsHousing: {
      medianRent: 1300,
      medianRentSource: 'Zillow / RentCafe 2025–2026',
      medianHomePrice: 240000,
      medianHomePriceSource: 'Redfin Feb 2026',
      mortgageMin: 1550,
      mortgageMax: 1650,
      mortgageAssumptions: '$0 down, ~6.5% rate, ~1.0% property tax + insurance',
    },
    localHousingTips: {
      coliNote: '6–10% below the national average',
      groceryNote: '5–8% below national average',
      stateTaxNote: 'For North Carolina residents, military base pay is generally subject to NC income tax. BAH and BAS are not taxable income at the federal or state level. Domicile and residency rules may affect your state tax situation.',
      neighborhoods: [
        {
          name: 'Hope Mills',
          highlight: 'Often recommended by families prioritizing schools (7–8/10 area ratings)',
          commute: '15–20 min to main gate',
          bestFor: 'Families with school-age children',
          typicalRent3br: '$1,100–$1,400/mo',
        },
        {
          name: "Gray's Creek",
          highlight: 'Rural feel, good schools, more space',
          commute: 'Slightly longer commute',
          bestFor: 'Families seeking more square footage',
          typicalRent3br: '$1,200–$1,500/mo',
        },
        {
          name: 'Spring Lake',
          highlight: 'Generally more affordable, school ratings vary',
          commute: '8–15 min to main gate',
          bestFor: 'Service members prioritizing shorter commute',
          typicalRent3br: '$900–$1,200/mo',
        },
        {
          name: 'Downtown Fayetteville',
          highlight: 'Improving area — breweries, restaurants, walkable',
          commute: 'Varies by unit',
          bestFor: 'Service members seeking walkable dining and entertainment',
          typicalRent3br: '$1,000–$1,350/mo',
        },
      ],
      mistakeToAvoid:
        'Rental prices in the Fayetteville area vary significantly by neighborhood. Within a 20-minute commute radius of Fort Bragg, monthly rent for a comparable 3-bedroom home can differ by $400 or more depending on the area. Comparing multiple neighborhoods before signing a lease gives families a clearer picture of the local market. (Rental data: Zillow / RentCafe 2025–2026)',
    },
  },
  {
    name: 'Fort Campbell',
    slug: 'fort-campbell',
    zip: '37040',
    city: 'Clarksville',
    state: 'TN',
    stateName: 'Tennessee',
    branches: ['Army'],
    description:
      'Fort Campbell is one of the most financially favorable Army duty stations. Clarksville\'s cost of living is well below the national average, Tennessee has no income tax, and {rank} has {surplus}/month of buffer between BAH and median rent. Homeownership is very realistic here.',
    installationDetail:
      'Fort Campbell straddles the Tennessee-Kentucky border and is home to the 101st Airborne Division (Air Assault) — the \'Screaming Eagles.\'',
    rentalNote:
      'The Clarksville housing market is among the more affordable for a post of this size. E-5 and above BAH typically covers 2-bedroom apartments in most neighborhoods, and homebuyers often find significant BAH surplus.',
    rentalContext:
      'Clarksville housing costs run roughly 10–15% below the national median — your purchasing power here is well above average.',
    nearby: ['fort-knox', 'redstone-arsenal', 'fort-sill'],
    bahVsHousing: {
      medianRent: 1400,
      medianRentSource: 'Zumper / Homes.com 2025–2026',
      medianHomePrice: 315000,
      medianHomePriceSource: 'Zillow / Redfin 2026',
      mortgageMin: 2050,
      mortgageMax: 2250,
      mortgageAssumptions: '$0 down, ~6.5% rate, ~0.7% TN property tax + insurance',
    },
    localHousingTips: {
      coliNote: 'roughly 10–15% below the national average',
      stateTaxNote:
        'Tennessee has no state income tax on military pay (or any earned income). Your entire paycheck goes further here.',
      neighborhoods: [
        {
          name: 'Tiny Town (near KY border)',
          highlight: 'Clarksville-Montgomery County Schools — varies',
          commute: '5–10 min to most base gates',
          bestFor: 'Single soldiers or families wanting the shortest commute',
          typicalRent3br: '$1,100–$1,400/mo',
        },
        {
          name: 'Sango',
          highlight: 'Rossview schools — highest-rated in area (7–8/10)',
          commute: '20–25 min to Gate 1',
          bestFor: 'Families who prioritize schools and want suburban feel',
          typicalRent3br: '$1,400–$1,800/mo',
        },
        {
          name: 'St. Bethlehem',
          highlight: 'Clarksville-Montgomery County Schools — decent',
          commute: '15–20 min to main gates',
          bestFor: 'Families wanting shopping access and mid-range prices',
          typicalRent3br: '$1,200–$1,600/mo',
        },
        {
          name: 'Downtown Clarksville',
          highlight: 'Clarksville-Montgomery County Schools — varies',
          commute: '15–20 min to Gate 4',
          bestFor: 'Those wanting walkable restaurants, breweries, and arts scene',
          typicalRent3br: '$1,000–$1,400/mo',
        },
      ],
      mistakeToAvoid:
        'Fort Campbell sits on the TN-KY border, and which side you live on matters for taxes and schools. Tennessee has no income tax; Kentucky does. Many families default to the closest apartment and miss that Clarksville\'s Sango or Rossview areas offer better schools and newer housing for the same rent. {rank} at {bahAmount}/month has strong options on the Tennessee side.',
    },
  },
  {
    name: 'Fort Hood',
    slug: 'fort-hood',
    formerName: 'Fort Cavazos (2023–2025)',
    zip: '76541',
    city: 'Killeen',
    state: 'TX',
    stateName: 'Texas',
    branches: ['Army'],
    description:
      'Fort Hood is one of the most affordable large Army installations in the country. Killeen\'s housing market runs well below the national average — {rank} has {surplus}/month of room between BAH and median rent. That surplus is one of the reasons homeownership rates among Fort Hood families are high.',
    installationDetail:
      'Home of III Armored Corps and the 1st Cavalry Division, Fort Hood is one of the largest military installations in the world with over 45,000 assigned service members.',
    rentalNote:
      'Killeen is one of the most affordable large military markets in the country. BAH at most grades has historically exceeded median rents, making homeownership common among the force.',
    rentalContext:
      'Killeen housing costs run roughly 8–10% below the national median — your purchasing power here stretches further than the raw BAH number suggests.',
    nearby: ['joint-base-san-antonio', 'fort-bliss', 'fort-sill'],
    bahVsHousing: {
      medianRent: 1250,
      medianRentSource: 'Zillow / Zumper 2025–2026',
      medianHomePrice: 227000,
      medianHomePriceSource: 'Zillow 2026',
      mortgageMin: 1450,
      mortgageMax: 1600,
      mortgageAssumptions: '$0 down, ~6.5% rate, ~1.8% property tax + insurance',
    },
    localHousingTips: {
      coliNote: 'roughly 8–10% below the national average',
      stateTaxNote:
        'Texas has no state income tax on military pay, meaning your BAH, base pay, and special pays go further here than in high-tax states.',
      neighborhoods: [
        {
          name: 'Harker Heights',
          highlight: 'Harker Heights ISD — highest-rated district in the area (7–8/10)',
          commute: '15–20 min to main gate',
          bestFor: 'Families who prioritize schools',
          typicalRent3br: '$1,200–$1,500/mo',
        },
        {
          name: 'Nolanville',
          highlight: 'Killeen ISD — newer construction area with improving schools',
          commute: '10–15 min to Clear Creek Gate',
          bestFor: 'Families wanting new-build neighborhoods',
          typicalRent3br: '$1,300–$1,600/mo',
        },
        {
          name: 'Copperas Cove',
          highlight: 'Copperas Cove ISD — decent ratings, rural feel',
          commute: '20–25 min to West Fort Hood Gate',
          bestFor: 'Families wanting space and a country feel',
          typicalRent3br: '$1,000–$1,300/mo',
        },
        {
          name: 'South Killeen',
          highlight: 'Killeen ISD — ratings vary, research specific zones',
          commute: '5–10 min to main gate',
          bestFor: 'Single soldiers or couples prioritizing short commute',
          typicalRent3br: '$900–$1,200/mo',
        },
      ],
      mistakeToAvoid:
        'Many families PCSing to Fort Hood sign a lease before learning the area. Killeen neighborhoods vary dramatically in quality — South Killeen and areas near the gates tend to be older and less maintained, while Harker Heights and Nolanville offer better schools and newer homes for similar or slightly higher rent. {rank} at {bahAmount}/month can rent a solid 3-bedroom and still have room in the budget.',
    },
  },
  {
    name: 'Joint Base Lewis-McChord',
    slug: 'joint-base-lewis-mcchord',
    zip: '98499',
    city: 'Lakewood',
    state: 'WA',
    stateName: 'Washington',
    branches: ['Army', 'Air Force'],
    description:
      'JBLM is a high-cost duty station where BAH covers rent but may not cover homeownership for junior enlisted. The Tacoma area rental market is competitive, but neighborhoods south of base — Lakewood, DuPont, Lacey — offer more affordable options with shorter commutes than Tacoma proper.',
    installationDetail:
      'JBLM is the largest U.S. Army installation on the West Coast, home to I Corps, the 7th Infantry Division, and the 62nd Airlift Wing flying C-17s.',
    rentalNote:
      'The Puget Sound housing market is expensive and competitive. BAH rates are high relative to CONUS averages, but the Seattle metro\'s rapidly rising rents mean some lower-grade members face a shortfall. CONUS COLA was added for this area in 2026.',
    rentalContext:
      'The Puget Sound area runs 10–15% above the national median in overall housing costs, which limits how far BAH stretches compared to CONUS averages.',
    nearby: ['naval-base-kitsap', 'naval-air-station-whidbey-island', 'joint-base-elmendorf-richardson'],
    bahVsHousing: {
      medianRent: 1800,
      medianRentSource: 'RentCafe / Zumper 2025–2026',
      medianHomePrice: 510000,
      medianHomePriceSource: 'Herring Bank / Zillow 2026',
      mortgageMin: 3300,
      mortgageMax: 3600,
      mortgageAssumptions: '$0 down, ~6.5% rate, ~1.1% property tax + insurance',
    },
    localHousingTips: {
      coliNote: 'roughly 10–15% above the national average',
      stateTaxNote:
        'Washington has no state income tax — a significant net-pay advantage over most West Coast duty stations.',
      neighborhoods: [
        {
          name: 'Lakewood',
          highlight: 'Clover Park School District — ratings vary (5–7/10)',
          commute: '5–15 min to Lewis main gate',
          bestFor: 'Shortest commute and most affordable rents near base',
          typicalRent3br: '$1,400–$1,800/mo',
        },
        {
          name: 'DuPont',
          highlight: 'Steilacoom Historical School District — solid (7–8/10)',
          commute: '10–15 min to main gate',
          bestFor: 'Families wanting a master-planned community feel',
          typicalRent3br: '$1,800–$2,300/mo',
        },
        {
          name: 'Lacey / Olympia',
          highlight: 'North Thurston Public Schools — good (7–8/10)',
          commute: '15–25 min to main gate',
          bestFor: 'Families wanting lower property taxes (Thurston County)',
          typicalRent3br: '$1,600–$2,000/mo',
        },
        {
          name: 'Tacoma (South)',
          highlight: 'Tacoma Public Schools — varies widely by neighborhood',
          commute: '20–30 min to main gate',
          bestFor: 'Those wanting urban amenities and food scene',
          typicalRent3br: '$1,700–$2,200/mo',
        },
      ],
      mistakeToAvoid:
        'The most common PCS mistake at JBLM is buying a home without understanding the price tier. The median home price near $510,000 means an E-5\'s BAH won\'t cover a mortgage — many junior enlisted families who buy end up house-poor or underwater at PCS. Renting in Lakewood or DuPont keeps housing costs within BAH, and you can explore buying only if you have dual income or plan to keep the property as a rental.',
    },
  },
  {
    name: 'Fort Carson',
    slug: 'fort-carson',
    zip: '80903',
    city: 'Colorado Springs',
    state: 'CO',
    stateName: 'Colorado',
    branches: ['Army'],
    description:
      'Fort Carson BAH covers rent in most neighborhoods, but homeownership requires careful math. The Fountain and Security-Widefield corridor south of base offers the best balance of affordability and commute. Colorado Springs proper — especially the north side — commands premium rents that can exceed BAH for junior enlisted.',
    installationDetail:
      'Fort Carson — \'The Mountain Post\' — is home to the 4th Infantry Division, located at the base of the Rocky Mountains with Pikes Peak as a backdrop.',
    rentalNote:
      'Colorado Springs has seen rapid housing price appreciation over the past decade. BAH covers most mid-range apartments, but the competitive ownership market means buyers may need additional funds beyond BAH for a down payment.',
    rentalContext:
      'Colorado Springs runs roughly 12–15% above the national median — BAH covers median rents, but leaves less surplus than comparable-grade members at most inland installations.',
    nearby: ['kirtland-afb', 'fort-riley', 'offutt-afb'],
    bahVsHousing: {
      medianRent: 1825,
      medianRentSource: 'PCS Pay It Forward / Zillow 2025–2026',
      medianHomePrice: 460000,
      medianHomePriceSource: 'Zillow / Redfin 2026',
      mortgageMin: 3000,
      mortgageMax: 3300,
      mortgageAssumptions: '$0 down, ~6.5% rate, ~0.6% property tax + insurance',
    },
    localHousingTips: {
      coliNote: 'roughly 12–15% above the national average',
      stateTaxNote:
        'Colorado has a flat income tax of 4.40% on military pay. BAH and BAS remain tax-free.',
      neighborhoods: [
        {
          name: 'Fountain / Security-Widefield',
          highlight: 'Fountain-Fort Carson D8 / Widefield D3 — decent (6–7/10)',
          commute: '10–15 min to Gate 1',
          bestFor: 'Best value near base — where most enlisted families live',
          typicalRent3br: '$1,400–$1,800/mo',
        },
        {
          name: 'Colorado Springs (South / Powers Corridor)',
          highlight: 'District 49 — growing, newer schools (6–7/10)',
          commute: '15–20 min to Gate 20',
          bestFor: 'Families wanting more retail and dining options',
          typicalRent3br: '$1,600–$2,100/mo',
        },
        {
          name: 'Colorado Springs (North / District 20)',
          highlight: 'Academy District 20 — top-rated (8–9/10)',
          commute: '25–35 min to Fort Carson',
          bestFor: 'Families prioritizing schools above all else',
          typicalRent3br: '$2,100–$2,800/mo',
        },
        {
          name: 'Monument / Palmer Lake',
          highlight: 'Lewis-Palmer D38 — excellent (9/10)',
          commute: '35–45 min to Fort Carson',
          bestFor: 'Officers or dual-income families wanting premium schools and small-town feel',
          typicalRent3br: '$2,200–$2,800/mo',
        },
      ],
      mistakeToAvoid:
        'Colorado Springs has become genuinely expensive. The median home price around $460,000 means an {grade}\'s BAH won\'t cover a mortgage without dual income. Many families buy anyway, then struggle at PCS when the rental market won\'t cover their payment. Rent first in the Fountain/Security-Widefield corridor — it\'s affordable, close to base, and lets you learn the market before committing.',
    },
  },
  {
    name: 'Fort Drum',
    slug: 'fort-drum',
    zip: '13601',
    city: 'Watertown',
    state: 'NY',
    stateName: 'New York',
    branches: ['Army'],
    description:
      'Fort Drum is affordable to rent but can be expensive to own due to New York\'s high property taxes. The Watertown area has a low cost of living, and BAH gives most families a comfortable buffer over median rent. Buying here is riskier than other duty stations — the resale market is thin since demand is almost entirely military.',
    installationDetail:
      'Fort Drum is home to the 10th Mountain Division (Light Infantry) — the most deployed division in the Army — located in northern New York near the Canadian border.',
    rentalNote:
      'Watertown is a small city with a tight rental market driven almost entirely by military demand. BAH typically covers rents, but selection is limited. Many families choose off-post in Carthage, Adams, or Lowville.',
    rentalContext:
      'The Watertown area runs roughly 5–8% below the national median for housing, though NY property taxes can add significantly to ownership costs.',
    nearby: ['fort-hamilton', 'joint-base-mcguire-dix-lakehurst', 'naval-submarine-base-new-london'],
    bahVsHousing: {
      medianRent: 1300,
      medianRentSource: 'BestPlaces / Zillow 2025–2026',
      medianHomePrice: 215000,
      medianHomePriceSource: 'BestPlaces / Zillow 2026',
      mortgageMin: 1800,
      mortgageMax: 2100,
      mortgageAssumptions: '$0 down, ~6.5% rate, ~2.5% property tax + insurance',
    },
    localHousingTips: {
      coliNote: 'roughly 5–8% below the national average (but NY property taxes are high)',
      stateTaxNote:
        'New York taxes military pay at up to 10.9% at the top marginal rate — one of the highest in the country. However, active-duty military domiciled outside New York are generally exempt from NY state income tax. Verify your domicile status.',
      neighborhoods: [
        {
          name: 'Watertown',
          highlight: 'Watertown City Schools — decent (6/10)',
          commute: '15–20 min to main gate',
          bestFor: 'Most options for shopping, dining, and services',
          typicalRent3br: '$1,100–$1,500/mo',
        },
        {
          name: 'Evans Mills / LeRay',
          highlight: 'Indian River Central Schools — military-heavy (6–7/10)',
          commute: '5–10 min to main gate',
          bestFor: 'Shortest commute, closest military community',
          typicalRent3br: '$1,200–$1,600/mo',
        },
        {
          name: 'Sackets Harbor',
          highlight: 'Sackets Harbor Central — small, solid (7/10)',
          commute: '20–25 min to main gate',
          bestFor: 'Families wanting a charming lakeside village',
          typicalRent3br: '$1,100–$1,400/mo',
        },
        {
          name: 'Carthage',
          highlight: 'Carthage Central Schools — decent (6/10)',
          commute: '20–25 min to main gate',
          bestFor: 'Families wanting a quiet small town and rural feel',
          typicalRent3br: '$1,000–$1,300/mo',
        },
      ],
      mistakeToAvoid:
        'Fort Drum winters are no joke — snow starts in October and can last through April, with 100+ inches annually. The mistake is not budgeting for heating costs ($300–$500/month in winter) and not investing in quality winter gear before you arrive. Also, New York property taxes are among the highest in the nation — factor that into any buy-vs-rent decision.',
    },
  },
  {
    name: 'Fort Bliss',
    slug: 'fort-bliss',
    zip: '79901',
    city: 'El Paso',
    state: 'TX',
    stateName: 'Texas',
    branches: ['Army'],
    description:
      'Fort Bliss offers one of the best BAH-to-cost ratios in the Army. El Paso\'s housing market is well below the national average, Texas has no income tax, and {rank} has a substantial surplus over median rent. Homeownership is easily within reach — many families buy here even on short tours.',
    installationDetail:
      'Fort Bliss is one of the Army\'s largest installations by area, home to the 1st Armored Division — located on the Texas-New Mexico border in El Paso.',
    rentalNote:
      'El Paso is one of the most affordable major housing markets in the country. BAH at most grades significantly exceeds typical rents, and homeownership is common across the force.',
    rentalContext:
      'El Paso housing costs run roughly 15–18% below the national median — your purchasing power here is well above average, and Texas has no income tax to erode it further.',
    nearby: ['fort-hood', 'joint-base-san-antonio', 'kirtland-afb'],
    bahVsHousing: {
      medianRent: 1200,
      medianRentSource: 'Zillow / RentCafe 2025–2026',
      medianHomePrice: 240000,
      medianHomePriceSource: 'Redfin / Zillow 2026',
      mortgageMin: 1600,
      mortgageMax: 1800,
      mortgageAssumptions: '$0 down, ~6.5% rate, ~2.0% property tax + insurance',
    },
    localHousingTips: {
      coliNote: 'roughly 15–18% below the national average',
      stateTaxNote:
        'Texas has no state income tax on military pay, meaning your BAH, base pay, and special pays go further here than in high-tax states.',
      neighborhoods: [
        {
          name: 'East El Paso (near base)',
          highlight: 'El Paso ISD / Socorro ISD — mixed (5–6/10)',
          commute: '5–15 min to main gate',
          bestFor: 'Shortest commute, most affordable near base',
          typicalRent3br: '$900–$1,200/mo',
        },
        {
          name: 'Northeast El Paso',
          highlight: 'El Paso ISD — improving, newer schools (6–7/10)',
          commute: '15–20 min to main gate',
          bestFor: 'Families wanting newer construction and better schools',
          typicalRent3br: '$1,100–$1,400/mo',
        },
        {
          name: 'West El Paso / Las Cruces NM',
          highlight: 'El Paso ISD West / Las Cruces Public Schools (7–8/10)',
          commute: '25–35 min to main gate',
          bestFor: 'Families willing to commute for best schools in the region',
          typicalRent3br: '$1,200–$1,600/mo',
        },
        {
          name: 'Central El Paso',
          highlight: 'El Paso ISD — varies',
          commute: '15–20 min to main gate',
          bestFor: 'Those wanting walkability and downtown access',
          typicalRent3br: '$900–$1,200/mo',
        },
      ],
      mistakeToAvoid:
        'El Paso is affordable, but many families underestimate the isolation. The nearest major city (Albuquerque) is 4 hours north, and Dallas is 9+ hours east. Also, the east side neighborhoods near Bliss have the shortest commute but the weakest schools. Northeast El Paso or the west side offers better school options with 15–20 minutes more commute.',
    },
  },
  {
    name: 'Fort Stewart',
    slug: 'fort-stewart',
    zip: '31313',
    city: 'Hinesville',
    state: 'GA',
    stateName: 'Georgia',
    branches: ['Army'],
    description:
      'Fort Stewart is one of the most affordable Army installations in the country. Hinesville\'s cost of living is roughly 17–20% below the national average, and {rank} has a healthy buffer between BAH and median rent. Homeownership is very realistic here — many families find their mortgage payment is actually less than comparable rent.',
    installationDetail:
      'Fort Stewart is the largest Army installation east of the Mississippi — home of the 3rd Infantry Division, one of the Army\'s most deployed combat divisions.',
    rentalNote:
      'Hinesville is a military-dependent housing market with limited rental inventory. Many families commute from the larger Savannah metro for more options, where BAH still covers most mid-range rentals.',
    rentalContext:
      'Hinesville housing costs run roughly 17–20% below the national median — your purchasing power here is well above average for a duty station of this size.',
    nearby: ['fort-jackson', 'marine-corps-air-station-beaufort', 'naval-air-station-pensacola'],
    bahVsHousing: {
      medianRent: 1575,
      medianRentSource: 'BiggerPockets / Zillow 2025–2026',
      medianHomePrice: 236000,
      medianHomePriceSource: 'Zillow / BiggerPockets 2026',
      mortgageMin: 1550,
      mortgageMax: 1750,
      mortgageAssumptions: '$0 down, ~6.5% rate, ~1.1% property tax + insurance',
    },
    localHousingTips: {
      coliNote: 'roughly 17–20% below the national average',
      stateTaxNote:
        'Georgia taxes military pay at up to 5.75%. BAH and BAS remain tax-free at the federal and state level.',
      neighborhoods: [
        {
          name: 'Hinesville',
          highlight: 'Liberty County Schools — mixed ratings (5–6/10)',
          commute: '5–10 min to main gate',
          bestFor: 'Shortest commute and most affordable housing',
          typicalRent3br: '$1,200–$1,600/mo',
        },
        {
          name: 'Richmond Hill',
          highlight: 'Bryan County Schools — top 10% in Georgia (8–9/10)',
          commute: '20–25 min to Fort Stewart, 15 min to Hunter AAF',
          bestFor: 'Families who prioritize schools above all else',
          typicalRent3br: '$1,800–$2,300/mo',
        },
        {
          name: 'Flemington / Gum Branch',
          highlight: 'Liberty County Schools — varies',
          commute: '10–15 min to main gate',
          bestFor: 'Families wanting a rural feel close to base',
          typicalRent3br: '$1,300–$1,700/mo',
        },
        {
          name: 'Savannah / Pooler',
          highlight: 'Savannah-Chatham County Schools — varies widely',
          commute: '35–45 min to Fort Stewart, 10–15 min to Hunter AAF',
          bestFor: 'Hunter AAF families wanting city amenities and beach access',
          typicalRent3br: '$1,600–$2,100/mo',
        },
      ],
      mistakeToAvoid:
        'The biggest mistake at Fort Stewart is not exploring Richmond Hill. Hinesville is closest and cheapest, but Richmond Hill — halfway between Stewart and Hunter Army Airfield in Savannah — has the best schools in the region (Bryan County, top 10% in Georgia). The commute is only 20–25 minutes, and the quality-of-life jump is significant.',
    },
  },
  {
    name: 'Fort Knox',
    slug: 'fort-knox',
    zip: '40160',
    city: 'Radcliff',
    state: 'KY',
    stateName: 'Kentucky',
    branches: ['Army'],
    description:
      'Fort Knox is an affordable duty station in central Kentucky. The Radcliff-Elizabethtown area has a low cost of living, and BAH leaves a healthy surplus at most pay grades. Homeownership is very realistic — median home prices are well below $250K, making this a strong VA loan market.',
    installationDetail:
      'Fort Knox is home to the Army\'s Human Resources Command and the U.S. Army Cadet Command — plus the United States Bullion Depository (the Gold Vault).',
    rentalNote:
      'The Elizabethtown/Radcliff market offers affordable housing. BAH typically covers 2-bedroom apartments with room to spare at E-5 and above, and homebuyers often find strong BAH surplus in starter-home price ranges.',
    rentalContext:
      'The Radcliff-Elizabethtown area runs roughly 15–18% below the national median — your purchasing power here is well above average, and Kentucky\'s modest flat tax is manageable.',
    nearby: ['fort-campbell', 'redstone-arsenal', 'wright-patterson-afb'],
    bahVsHousing: {
      medianRent: 1100,
      medianRentSource: 'Zillow / BestPlaces 2025–2026',
      medianHomePrice: 200000,
      medianHomePriceSource: 'Zillow / BestPlaces 2026',
      mortgageMin: 1450,
      mortgageMax: 1650,
      mortgageAssumptions: '$0 down, ~6.5% rate, ~1.0% property tax + insurance',
    },
    localHousingTips: {
      coliNote: 'roughly 15–18% below the national average',
      stateTaxNote:
        'Kentucky taxes military pay at a flat rate of 4.0%. BAH and BAS remain tax-free at the federal and state level.',
      neighborhoods: [
        {
          name: 'Radcliff',
          highlight: 'Hardin County Schools — decent (6/10)',
          commute: '5–10 min to main gate',
          bestFor: 'Closest to base, most affordable',
          typicalRent3br: '$800–$1,100/mo',
        },
        {
          name: 'Elizabethtown',
          highlight: 'Elizabethtown Independent Schools — strong (7–8/10)',
          commute: '15–20 min to main gate',
          bestFor: 'Best schools and most amenities near Knox',
          typicalRent3br: '$1,000–$1,400/mo',
        },
        {
          name: 'Vine Grove',
          highlight: 'Hardin County Schools — decent',
          commute: '5–10 min to main gate',
          bestFor: 'Small town feel right next to base',
          typicalRent3br: '$800–$1,100/mo',
        },
        {
          name: 'Brandenburg / Meade County',
          highlight: 'Meade County Schools — decent (6–7/10)',
          commute: '20–25 min to main gate',
          bestFor: 'Families wanting rural acreage and lower prices',
          typicalRent3br: '$800–$1,100/mo',
        },
      ],
      mistakeToAvoid:
        'Fort Knox isn\'t the same base it was before BRAC — it\'s smaller and quieter now. Radcliff and Vine Grove are the closest towns but have limited amenities. Elizabethtown (E-town), 15 minutes south, has significantly more shopping, dining, and school options. Louisville is 45 minutes north for city amenities.',
    },
  },
  {
    name: 'Fort Riley',
    slug: 'fort-riley',
    zip: '66441',
    city: 'Junction City',
    state: 'KS',
    stateName: 'Kansas',
    branches: ['Army'],
    description:
      'Fort Riley is one of the most affordable Army installations in the country. Junction City\'s housing costs are far below the national average, and BAH leaves substantial surplus at every pay grade. {rank} can easily afford to buy with a VA loan — many homes are well under $200K.',
    installationDetail:
      'Fort Riley is home to the 1st Infantry Division — the \'Big Red One\' — located in the Flint Hills of central Kansas between Junction City and Manhattan.',
    rentalNote:
      'The Junction City/Manhattan market is affordable, and BAH is generally sufficient to cover rents at most grades. Families with housing allowances often opt to purchase in Manhattan for the Kansas State University community.',
    rentalContext:
      'Junction City housing costs run roughly 15–18% below the national median — your purchasing power here is exceptional, with strong BAH surplus at virtually every pay grade.',
    nearby: ['fort-leavenworth', 'fort-hood', 'offutt-afb'],
    bahVsHousing: {
      medianRent: 1100,
      medianRentSource: 'BestPlaces / Zillow 2025–2026',
      medianHomePrice: 200000,
      medianHomePriceSource: 'Zillow / BestPlaces 2026',
      mortgageMin: 1450,
      mortgageMax: 1650,
      mortgageAssumptions: '$0 down, ~6.5% rate, ~1.4% property tax + insurance',
    },
    localHousingTips: {
      coliNote: 'roughly 15–18% below the national average',
      stateTaxNote:
        'Kansas recently exempted active-duty military pay from state income tax. BAH and BAS remain tax-free. Verify current exemption status.',
      neighborhoods: [
        {
          name: 'Junction City',
          highlight: 'Geary County Schools — decent (6/10)',
          commute: '5–10 min to main gate',
          bestFor: 'Closest to base, most affordable',
          typicalRent3br: '$800–$1,100/mo',
        },
        {
          name: 'Manhattan',
          highlight: 'Manhattan-Ogden USD 383 — strong (7–8/10), K-State campus',
          commute: '20–25 min to main gate',
          bestFor: 'Families wanting better schools and a college-town feel',
          typicalRent3br: '$1,000–$1,400/mo',
        },
        {
          name: 'Milford / Wakefield',
          highlight: 'Geary County Schools',
          commute: '15–20 min to main gate',
          bestFor: 'Families wanting lakeside living near Milford Lake',
          typicalRent3br: '$800–$1,100/mo',
        },
      ],
      mistakeToAvoid:
        'Fort Riley is isolated — Junction City is small and Manhattan (home of K-State) is the nearest college town, 20 minutes west. The mistake is expecting city amenities. Kansas City is 2+ hours east. Budget for road trips, embrace the small-town life, and take advantage of the incredible BAH surplus to save aggressively.',
    },
  },
  {
    name: 'Fort Benning',
    slug: 'fort-benning',
    formerName: 'Fort Moore (2023–2025)',
    zip: '31901',
    city: 'Columbus',
    state: 'GA',
    stateName: 'Georgia',
    branches: ['Army'],
    description:
      'Fort Benning sits in one of the most affordable housing markets of any large Army installation. {rank} at {bahAmount}/month has a significant surplus over median rent, and the median home price keeps VA loan homeownership well within reach.',
    installationDetail:
      'Fort Benning is the Home of the Infantry and Armor — the Army\'s Maneuver Center of Excellence, training tens of thousands of soldiers annually.',
    rentalNote:
      'Columbus has a large, stable military-adjacent rental market with affordable options at most grades. BAH regularly exceeds mid-range rents, and homeownership is common throughout the force.',
    rentalContext:
      'Columbus housing costs run roughly 20–22% below the national median — your BAH gives you significantly more purchasing power here than the national average.',
    nearby: ['fort-stewart', 'fort-gordon', 'redstone-arsenal'],
    bahVsHousing: {
      medianRent: 1100,
      medianRentSource: 'Zillow / Zumper 2025–2026',
      medianHomePrice: 230000,
      medianHomePriceSource: 'Redfin / Zillow 2026',
      mortgageMin: 1500,
      mortgageMax: 1700,
      mortgageAssumptions: '$0 down, ~6.5% rate, ~1.0% property tax + insurance',
    },
    localHousingTips: {
      coliNote: 'roughly 20–22% below the national average',
      stateTaxNote:
        'Georgia taxes military pay at up to 5.75%. However, active-duty pay earned outside Georgia may be partially exempt depending on domicile. BAH and BAS remain tax-free.',
      neighborhoods: [
        {
          name: 'North Columbus',
          highlight: 'Muscogee County — improving, research specific zones',
          commute: '15–25 min to main gate',
          bestFor: 'Families wanting newer homes and more retail/dining options',
          typicalRent3br: '$1,100–$1,500/mo',
        },
        {
          name: 'Midtown / Lakebottom',
          highlight: 'Muscogee County — varies',
          commute: '15–20 min to main gate',
          bestFor: 'Those wanting historic charm and walkability near downtown',
          typicalRent3br: '$1,000–$1,400/mo',
        },
        {
          name: 'Phenix City, AL',
          highlight: 'Phenix City Schools / Lee County Schools — solid options',
          commute: '15–25 min to main gate (across river)',
          bestFor: 'Families open to living in Alabama for potentially better schools',
          typicalRent3br: '$900–$1,300/mo',
        },
        {
          name: 'Fortson / Harris County',
          highlight: 'Harris County Schools — strong (8/10)',
          commute: '20–30 min to main gate',
          bestFor: 'Families willing to commute for the best schools in the area',
          typicalRent3br: '$1,200–$1,600/mo',
        },
      ],
      mistakeToAvoid:
        'Columbus is affordable, but neighborhood quality varies dramatically. Areas very close to the gates tend to have older housing and lower school ratings. Families who look 15–20 minutes north into North Columbus or across the river into Phenix City, AL find newer homes, better schools, and still stay well within BAH.',
    },
  },
  {
    name: 'Fort Gordon',
    slug: 'fort-gordon',
    formerName: 'Fort Eisenhower (2023–2025)',
    zip: '30901',
    city: 'Augusta',
    state: 'GA',
    stateName: 'Georgia',
    branches: ['Army'],
    description:
      'Fort Gordon is the home of the U.S. Army Cyber Center of Excellence and the Signal Corps, also hosting the National Security Agency\'s Georgia facility.',
    rentalNote:
      'Augusta has a cost-effective rental market. BAH covers most mid-range apartments comfortably, and the thriving technology and healthcare economy has kept home prices in a range that BAH buyers can access.',
    nearby: ['fort-jackson', 'fort-benning', 'marine-corps-air-station-beaufort'],
  },
  {
    name: 'Fort Sill',
    slug: 'fort-sill',
    zip: '73501',
    city: 'Lawton',
    state: 'OK',
    stateName: 'Oklahoma',
    branches: ['Army'],
    description:
      'Fort Sill is one of the cheapest duty stations in the Army. Lawton\'s cost of living is 20–25% below the national average, and BAH creates a massive surplus at every pay grade. This is a station where aggressive saving and investing can set you up for years — if you budget intentionally.',
    installationDetail:
      'Fort Sill is the Home of the Fires — the Army\'s Field Artillery and Air Defense Artillery center of excellence, located in southwest Oklahoma.',
    rentalNote:
      'Lawton is one of the most affordable military housing markets in the country. BAH at most grades significantly exceeds rents, and homeownership is very accessible.',
    rentalContext:
      'Lawton housing costs run roughly 20–25% below the national median — one of the highest BAH-to-cost ratios in the Army, with massive surplus at every pay grade.',
    nearby: ['fort-hood', 'tinker-afb', 'fort-riley'],
    bahVsHousing: {
      medianRent: 1000,
      medianRentSource: 'Zillow / BestPlaces 2025–2026',
      medianHomePrice: 160000,
      medianHomePriceSource: 'Zillow / Redfin 2026',
      mortgageMin: 1150,
      mortgageMax: 1350,
      mortgageAssumptions: '$0 down, ~6.5% rate, ~1.0% property tax + insurance',
    },
    localHousingTips: {
      coliNote: 'roughly 20–25% below the national average',
      stateTaxNote:
        'Oklahoma taxes military pay at up to 4.75%. However, Oklahoma exempts 100% of active-duty military pay from state income tax for residents. Verify your eligibility.',
      neighborhoods: [
        {
          name: 'Lawton (west side)',
          highlight: 'Lawton Public Schools — decent (6/10)',
          commute: '10–15 min to main gate',
          bestFor: 'Most housing options and shopping access',
          typicalRent3br: '$800–$1,100/mo',
        },
        {
          name: 'Elgin',
          highlight: 'Elgin Public Schools — better than Lawton (7/10)',
          commute: '15–20 min to main gate',
          bestFor: 'Families wanting better schools and rural feel',
          typicalRent3br: '$900–$1,200/mo',
        },
        {
          name: 'Medicine Park',
          highlight: 'Cache Public Schools — decent',
          commute: '15 min to main gate',
          bestFor: 'Charming artsy village near the Wichita Mountains',
          typicalRent3br: '$800–$1,100/mo',
        },
      ],
      mistakeToAvoid:
        'Lawton is isolated and small. The mistake is expecting anything beyond basic amenities. Oklahoma City is 90 minutes north. The upside: your BAH goes incredibly far here. An {grade} can rent a large house for half their BAH or buy a home with a mortgage well under $1,000/month. Use this assignment to save aggressively.',
    },
  },
  {
    name: 'Fort Leavenworth',
    slug: 'fort-leavenworth',
    zip: '66048',
    city: 'Leavenworth',
    state: 'KS',
    stateName: 'Kansas',
    branches: ['Army'],
    description:
      'Fort Leavenworth is a unique duty station — most residents are mid-career officers attending CGSC. The Leavenworth-Lansing area is affordable with a small-town feel, and Kansas City\'s metro amenities are 30–40 minutes south. BAH comfortably covers rent with surplus.',
    installationDetail:
      'Fort Leavenworth is the Army\'s oldest active installation west of the Mississippi — home to the Command and General Staff College, where the Army\'s future leaders train.',
    rentalNote:
      'Leavenworth is a small city adjacent to the Kansas City metro. BAH aligns with the Kansas City MHA, providing solid coverage of local rents and solid purchasing power in the housing market.',
    rentalContext:
      'Leavenworth housing costs run roughly 10–12% below the national median — BAH covers rent comfortably with surplus.',
    nearby: ['fort-riley', 'offutt-afb', 'whiteman-afb'],
    bahVsHousing: {
      medianRent: 1300,
      medianRentSource: 'BestPlaces / Zillow 2025–2026',
      medianHomePrice: 250000,
      medianHomePriceSource: 'Zillow / BestPlaces 2026',
      mortgageMin: 1800,
      mortgageMax: 2000,
      mortgageAssumptions: '$0 down, ~6.5% rate, ~1.4% property tax + insurance',
    },
    localHousingTips: {
      coliNote: 'roughly 10–12% below the national average',
      stateTaxNote:
        'Kansas taxes military pay at up to 5.7%. However, recent legislation exempts active-duty military pay from Kansas income tax. Verify current exemption status with a tax professional.',
      neighborhoods: [
        {
          name: 'Leavenworth (off-post)',
          highlight: 'Leavenworth USD 453 — decent (6–7/10)',
          commute: '5–10 min to main gate',
          bestFor: 'Walkable small-town feel, closest to post',
          typicalRent3br: '$1,000–$1,400/mo',
        },
        {
          name: 'Lansing',
          highlight: 'Lansing USD 469 — strong (7–8/10)',
          commute: '10–15 min to main gate',
          bestFor: 'Families wanting better schools and newer neighborhoods',
          typicalRent3br: '$1,200–$1,600/mo',
        },
        {
          name: 'On-post housing',
          highlight: 'Fort Leavenworth schools (DoDEA elementary, Leavenworth for middle/high)',
          commute: 'Walk or 2–3 min drive',
          bestFor: 'CGSC students wanting maximum convenience and community',
          typicalRent3br: 'BAH covers 100% (no out-of-pocket)',
        },
      ],
      mistakeToAvoid:
        'Leavenworth is a short-tour assignment for most families (CGSC is about 10 months). The mistake is buying a home for a tour this short — transaction costs alone eat any equity. Rent near the post or in Lansing, save the BAH surplus, and invest the difference.',
    },
  },
  {
    name: 'Fort Huachuca',
    slug: 'fort-huachuca',
    zip: '85635',
    city: 'Sierra Vista',
    state: 'AZ',
    stateName: 'Arizona',
    branches: ['Army'],
    description:
      'Fort Huachuca is home to the U.S. Army Intelligence Center of Excellence and hosts the Army\'s network enterprise operations, located in southeastern Arizona near the Mexican border.',
    rentalNote:
      'Sierra Vista is an isolated, affordable market where BAH provides significant purchasing power. Most servicemembers can cover rents well, and homeownership is very common at all grades.',
    nearby: ['davis-monthan-afb', 'luke-afb', 'kirtland-afb'],
  },
  {
    name: 'Fort Wainwright',
    slug: 'fort-wainwright',
    zip: '99701',
    city: 'Fairbanks',
    state: 'AK',
    stateName: 'Alaska',
    branches: ['Army'],
    description:
      'Fort Wainwright is considered an overseas tour — your dependents need concurrent travel authorization to come with you. Fairbanks housing is surprisingly affordable by Alaska standards, but extreme winter utility costs change the math. Most families choose on-post housing for the included utilities and shorter commute on icy roads.',
    installationDetail:
      "Fort Wainwright is home to the 1st Stryker Brigade Combat Team, 25th Infantry Division — the Army's Arctic warfare specialists in the interior of Alaska, near Fairbanks.",
    rentalNote:
      'Fairbanks housing is affordable by Alaska standards, but heating costs ($400–$600/month from October through March) dramatically change the off-post math. On-post housing includes utilities and is strongly recommended for first-time Alaska families.',
    rentalContext:
      'heating costs ($400–$600/month in winter) make on-post housing the financially smarter choice for most Wainwright families.',
    nearby: ['joint-base-elmendorf-richardson', 'minot-afb', 'ellsworth-afb'],
    bahVsHousing: {
      medianRent: 1500,
      medianRentSource: 'PCSgrades / Zillow 2025–2026',
      medianHomePrice: 260000,
      medianHomePriceSource: 'Zillow / PCSgrades 2026',
      mortgageMin: 1800,
      mortgageMax: 2000,
      mortgageAssumptions: '$0 down, ~6.5% rate, ~1.1% property tax + insurance',
    },
    localHousingTips: {
      coliNote: 'roughly 25–30% above the national average (driven by groceries and energy)',
      stateTaxNote: 'Alaska has no state income tax and no state sales tax. Your military pay stretches further on the tax side — but higher costs for food, fuel, and heating offset some of that advantage.',
      neighborhoods: [
        {
          name: 'On-post housing (North Haven Communities)',
          highlight: 'Fairbanks North Star Borough Schools',
          commute: 'Walk or 2–3 min drive',
          bestFor: 'Strongly recommended — utilities included, critical in -40°F winters',
          typicalRent3br: 'BAH covers 100% (utilities included)',
        },
        {
          name: 'Fairbanks',
          highlight: 'Fairbanks North Star Borough Schools — solid (7/10)',
          commute: '10–15 min to main gate',
          bestFor: 'Families wanting more shopping, dining, and community options',
          typicalRent3br: '$1,400–$1,800/mo',
        },
        {
          name: 'North Pole',
          highlight: 'North Pole schools — small, military-heavy (6–7/10)',
          commute: '15–20 min to Wainwright, 10 min to Eielson',
          bestFor: 'Families splitting commute between Wainwright and Eielson',
          typicalRent3br: '$1,200–$1,600/mo',
        },
      ],
      mistakeToAvoid:
        'Fort Wainwright shares Fairbanks with Eielson AFB 26 miles south. The same winter heating warning applies — $400–$600/month from October through March if you live off-post. On-post housing includes utilities and is strongly recommended, especially for first-time Alaska families. If you do go off-post, budget heating as a line item, not an afterthought.',
    },
  },
  {
    name: 'Fort Polk',
    slug: 'fort-polk',
    formerName: 'Fort Johnson (2023–2025)',
    zip: '71446',
    city: 'Leesville',
    state: 'LA',
    stateName: 'Louisiana',
    branches: ['Army'],
    description:
      "Fort Polk is the Army's most affordable major installation. The Leesville-DeRidder area has rock-bottom housing costs, and BAH creates a massive surplus at every pay grade. This is a station where intentional saving and investing can change your financial trajectory — if you embrace the simplicity.",
    installationDetail:
      "Fort Polk is the Army's Joint Readiness Training Center (JRTC) — where combat brigades from across the Army come to train before deployment.",
    rentalNote:
      'Leesville is a small, isolated market. BAH covers local rents with a large surplus — most grades can pocket $200–$400/month extra or buy a home with a mortgage under $1,000.',
    rentalContext:
      'the Leesville area has rock-bottom housing costs — BAH creates one of the largest surpluses of any Army installation.',
    nearby: ['barksdale-afb', 'joint-base-san-antonio', 'fort-hood'],
    bahVsHousing: {
      medianRent: 1000,
      medianRentSource: 'Zillow / BestPlaces 2025–2026',
      medianHomePrice: 165000,
      medianHomePriceSource: 'Zillow / BestPlaces 2026',
      mortgageMin: 1200,
      mortgageMax: 1400,
      mortgageAssumptions: '$0 down, ~6.5% rate, ~0.6% LA property tax + insurance',
    },
    localHousingTips: {
      coliNote: 'roughly 20–25% below the national average',
      stateTaxNote: 'Louisiana taxes military pay at up to 4.25%. BAH and BAS remain tax-free at the federal and state level.',
      neighborhoods: [
        {
          name: 'Leesville',
          highlight: 'Vernon Parish Schools — decent (6/10)',
          commute: '5–10 min to main gate',
          bestFor: 'Closest to base, most options for a small town',
          typicalRent3br: '$700–$1,000/mo',
        },
        {
          name: 'DeRidder',
          highlight: 'Beauregard Parish Schools — solid (7/10)',
          commute: '25–30 min to main gate',
          bestFor: 'Better schools and slightly more amenities',
          typicalRent3br: '$700–$1,000/mo',
        },
        {
          name: 'New Llano',
          highlight: 'Vernon Parish Schools',
          commute: '5 min to main gate',
          bestFor: 'Walking distance to gate, very small community',
          typicalRent3br: '$600–$900/mo',
        },
      ],
      mistakeToAvoid:
        "Fort Polk is one of the most isolated Army installations. Leesville and DeRidder are tiny towns with limited amenities. Lake Charles is an hour south, Alexandria an hour north. The mistake is not mentally preparing for the isolation — but the upside is your BAH goes incredibly far. An E-5 can pocket hundreds per month in surplus or buy a home with a mortgage under $1,000.",
    },
  },
  {
    name: 'Schofield Barracks',
    slug: 'schofield-barracks',
    zip: '96786',
    city: 'Wahiawa',
    state: 'HI',
    stateName: 'Hawaii',
    branches: ['Army'],
    description:
      'Schofield Barracks shares Oahu\'s expensive housing market. {rank} receives {bahAmount}/month — enough to cover a modest rental, but Oahu\'s cost of living eats into every other budget category. Many families choose on-base housing to simplify finances and avoid the island\'s brutal traffic.',
    installationDetail:
      'Schofield Barracks is the largest Army installation in Hawaii — home to the 25th Infantry Division (\'Tropic Lightning\') in central Oahu.',
    rentalNote:
      'Hawaii is one of the highest-cost military markets in the country. BAH rates are among the highest in CONUS, but Oahu rents have outpaced BAH in recent years — particularly for single members and junior enlisted with dependents.',
    rentalContext:
      'Oahu housing costs run 30–50% above the national median — BAH is set to cover median rent, but Oahu\'s broader cost of living eats into every other budget category.',
    nearby: ['joint-base-pearl-harbor-hickam', 'camp-pendleton', 'naval-station-san-diego'],
    bahVsHousing: {
      medianRent: 3000,
      medianRentSource: 'Zillow / PCS Pay It Forward 2025–2026',
      medianHomePrice: 850000,
      medianHomePriceSource: 'Zillow / Redfin 2026',
      mortgageMin: 5800,
      mortgageMax: 6400,
      mortgageAssumptions: '$0 down, ~6.5% rate, ~0.35% property tax + insurance',
    },
    localHousingTips: {
      coliNote: 'roughly 30–50% above the national average',
      stateTaxNote:
        'Hawaii taxes military pay at up to 11% at the top marginal rate. BAH and BAS remain tax-free.',
      neighborhoods: [
        {
          name: 'Wahiawa',
          highlight: 'Leilehua Complex — mixed (5–6/10)',
          commute: '5–10 min to main gate',
          bestFor: 'Closest to base, most affordable on Oahu',
          typicalRent3br: '$2,200–$2,800/mo',
        },
        {
          name: 'Mililani',
          highlight: 'Mililani Complex — strong (8/10)',
          commute: '10–15 min to main gate',
          bestFor: 'Best school option near Schofield',
          typicalRent3br: '$2,800–$3,500/mo',
        },
        {
          name: 'Waipio / Waikele',
          highlight: 'Waipahu Complex — decent (6/10)',
          commute: '15–20 min to main gate',
          bestFor: 'Good shopping access (Waikele outlets), newer homes',
          typicalRent3br: '$2,500–$3,200/mo',
        },
        {
          name: 'On-base housing',
          highlight: 'On-base schools / Leilehua Complex',
          commute: 'Walk or 2–3 min drive',
          bestFor: 'Families wanting simplified finances and avoiding Oahu traffic',
          typicalRent3br: 'BAH covers 100% (utilities included)',
        },
      ],
      mistakeToAvoid:
        'Schofield families often look at Kapolei or Ewa Beach because they\'re newer — but those neighborhoods are 30–40 minutes away in Oahu traffic. Mililani and Wahiawa are much closer to Schofield and offer good options. Also, don\'t skip the on-base housing waitlist — get on it the day you receive orders, even if you plan to live off-base.',
    },
  },
  {
    name: 'Aberdeen Proving Ground',
    slug: 'aberdeen-proving-ground',
    zip: '21001',
    city: 'Aberdeen',
    state: 'MD',
    stateName: 'Maryland',
    branches: ['Army'],
    description:
      'Aberdeen Proving Ground is the Army\'s primary research, development, and testing center, home to Army Materiel Command and the Chemical Corps, located northeast of Baltimore on the Chesapeake Bay.',
    rentalNote:
      'APG falls within the Baltimore MHA, providing competitive BAH rates. The base\'s location north of Baltimore gives servicemembers access to both the Baltimore and Philadelphia commuter belts.',
    nearby: ['fort-meade', 'joint-base-andrews', 'joint-base-myer-henderson-hall'],
  },
  {
    name: 'Redstone Arsenal',
    slug: 'redstone-arsenal',
    zip: '35801',
    city: 'Huntsville',
    state: 'AL',
    stateName: 'Alabama',
    branches: ['Army'],
    description:
      'Redstone Arsenal is the center of Army aviation and missile development, home to Army Aviation and Missile Command and NASA\'s Marshall Space Flight Center, located in Huntsville.',
    rentalNote:
      'Huntsville has a highly educated, technology-driven housing market with moderate costs. BAH aligns well with local rents, and Huntsville\'s thriving tech economy creates a healthy ownership market.',
    nearby: ['fort-campbell', 'fort-benning', 'fort-knox'],
  },
  {
    name: 'Fort Hamilton',
    slug: 'fort-hamilton',
    zip: '11209',
    city: 'Brooklyn',
    state: 'NY',
    stateName: 'New York',
    branches: ['Army'],
    description:
      'Fort Hamilton is the only active-duty military installation in New York City, serving as a garrison command and providing Army support to the greater New York metropolitan area.',
    rentalNote:
      'NYC BAH rates are among the highest in the country, but so is rent. BAH for most grades covers a studio or modest one-bedroom in the outer boroughs; officers and senior NCOs have more flexibility.',
    nearby: ['joint-base-mcguire-dix-lakehurst', 'naval-submarine-base-new-london', 'naval-station-newport'],
  },
  {
    name: 'Fort George G. Meade',
    slug: 'fort-meade',
    zip: '20755',
    city: 'Odenton',
    state: 'MD',
    stateName: 'Maryland',
    branches: ['Army'],
    description:
      'Fort Meade sits in the Baltimore-DC corridor — expensive but with strong BAH. The Odenton-Severn area immediately surrounding the base offers the best value. Many families here are in intelligence or cyber roles with longer tours, making homeownership a more viable option than at rapid-rotation bases.',
    installationDetail:
      'Fort Meade is home to the National Security Agency (NSA), U.S. Cyber Command, and the Defense Information Systems Agency (DISA) — one of the most intelligence-dense installations in the country.',
    rentalNote:
      'Fort Meade falls in the Baltimore MHA. The DC/Baltimore corridor is expensive, but BAH rates reflect the market — Odenton and Severn offer the best value closest to the gate. Columbia has better schools at a higher price point.',
    rentalContext:
      'the Odenton-Severn corridor closest to the gate offers the best value in the Baltimore-DC market.',
    nearby: ['joint-base-andrews', 'aberdeen-proving-ground', 'joint-base-myer-henderson-hall'],
    bahVsHousing: {
      medianRent: 2100,
      medianRentSource: 'Zillow / Zumper 2025–2026',
      medianHomePrice: 430000,
      medianHomePriceSource: 'Zillow / Redfin 2026',
      mortgageMin: 3050,
      mortgageMax: 3350,
      mortgageAssumptions: '$0 down, ~6.5% rate, ~1.1% property tax + insurance',
    },
    localHousingTips: {
      coliNote: 'roughly 20–25% above the national average',
      stateTaxNote: 'Maryland taxes military pay at up to 5.75%. Military retirement pay is exempt. BAH and BAS remain tax-free.',
      neighborhoods: [
        {
          name: 'Odenton',
          highlight: 'Anne Arundel County — good (7/10)',
          commute: '5–10 min to main gate',
          bestFor: 'Closest to base with decent schools',
          typicalRent3br: '$1,800–$2,300/mo',
        },
        {
          name: 'Severn / Hanover',
          highlight: 'Anne Arundel County — good (7/10)',
          commute: '10–15 min to main gate',
          bestFor: 'Affordable options with quick base access',
          typicalRent3br: '$1,700–$2,200/mo',
        },
        {
          name: 'Columbia',
          highlight: 'Howard County — excellent (9/10)',
          commute: '15–20 min to main gate',
          bestFor: 'Families wanting the best schools in the region',
          typicalRent3br: '$2,200–$2,800/mo',
        },
        {
          name: 'Laurel',
          highlight: "Prince George's / Howard County line — varies (6–8/10)",
          commute: '10–15 min to main gate',
          bestFor: 'Affordable option between Meade and DC',
          typicalRent3br: '$1,600–$2,100/mo',
        },
      ],
      mistakeToAvoid:
        "Fort Meade sits between Baltimore and DC, which sounds convenient but means you're paying metro-area prices everywhere. The mistake is looking at Annapolis or Columbia without checking commute times — both can be 30+ minutes in rush hour. Odenton, Severn, and Jessup are 5–15 minutes from the gate and significantly cheaper.",
    },
  },
  {
    name: 'Fort Jackson',
    slug: 'fort-jackson',
    zip: '29201',
    city: 'Columbia',
    state: 'SC',
    stateName: 'South Carolina',
    branches: ['Army'],
    description:
      'Fort Jackson sits in Columbia, SC — an affordable college town (University of South Carolina) with a cost of living well below the national average. BAH creates a comfortable surplus at every pay grade, and the housing market is accessible for families who plan to stay beyond a single tour.',
    installationDetail:
      "Fort Jackson is the Army's largest basic training installation — training over 50,000 soldiers annually in Columbia, South Carolina.",
    rentalNote:
      'Columbia is a large, diversified market with affordable housing. BAH provides strong purchasing power at most grades — Northeast Columbia near the gate has the best schools, while Elgin and Lugoff offer newer construction at lower prices.',
    rentalContext:
      "Columbia's cost of living is well below the national average, and BAH creates a comfortable surplus at most pay grades.",
    nearby: ['marine-corps-air-station-beaufort', 'fort-gordon', 'joint-base-charleston'],
    bahVsHousing: {
      medianRent: 1400,
      medianRentSource: 'Zillow / Zumper 2025–2026',
      medianHomePrice: 260000,
      medianHomePriceSource: 'Zillow / Redfin 2026',
      mortgageMin: 1750,
      mortgageMax: 1950,
      mortgageAssumptions: '$0 down, ~6.5% rate, ~0.6% SC property tax + insurance',
    },
    localHousingTips: {
      coliNote: 'roughly 8–12% below the national average',
      stateTaxNote: 'South Carolina taxes military pay at up to 6.5%. However, SC offers a partial exemption on military retirement pay. BAH and BAS remain tax-free.',
      neighborhoods: [
        {
          name: 'Northeast Columbia (near gate)',
          highlight: 'Richland 2 School District — strong (7–8/10)',
          commute: '5–15 min to main gate',
          bestFor: 'Best schools closest to Fort Jackson',
          typicalRent3br: '$1,200–$1,600/mo',
        },
        {
          name: 'Elgin / Lugoff',
          highlight: 'Kershaw County Schools — decent (6–7/10)',
          commute: '15–20 min to main gate',
          bestFor: 'Families wanting newer construction at lower prices',
          typicalRent3br: '$1,100–$1,400/mo',
        },
        {
          name: 'Lexington',
          highlight: 'Lexington-Richland 5 — excellent (8–9/10)',
          commute: '25–30 min to Fort Jackson',
          bestFor: 'Families willing to commute for the best schools in the metro',
          typicalRent3br: '$1,400–$1,800/mo',
        },
        {
          name: 'Downtown Columbia / Shandon',
          highlight: 'Richland 1 — varies (5–7/10)',
          commute: '15–20 min to Fort Jackson',
          bestFor: 'Singles or couples wanting walkable neighborhoods near USC campus',
          typicalRent3br: '$1,100–$1,500/mo',
        },
      ],
      mistakeToAvoid:
        'Fort Jackson is primarily a training installation, so most permanent party assignments are shorter. The mistake is buying a home on a 2-year assignment in a market where resale can be slow. Rent in Northeast Columbia or Elgin — your BAH surplus here is substantial — and invest the savings instead.',
    },
  },
  {
    name: 'Fort Detrick',
    slug: 'fort-detrick',
    zip: '21701',
    city: 'Frederick',
    state: 'MD',
    stateName: 'Maryland',
    branches: ['Army'],
    description:
      'Fort Detrick hosts the U.S. Army Medical Research and Development Command and several federal agencies including USAMRIID, NIH campus, and the National Cancer Institute, located in Frederick, Maryland.',
    rentalNote:
      'Frederick falls in the DC-area BAH zone with elevated rates. The town itself is more affordable than closer-in suburbs, giving servicemembers good BAH purchasing power in a desirable area.',
    nearby: ['fort-meade', 'joint-base-andrews', 'aberdeen-proving-ground'],
  },
  {
    name: 'Fort Irwin (National Training Center)',
    slug: 'fort-irwin',
    zip: '92311',
    city: 'Barstow',
    state: 'CA',
    stateName: 'California',
    branches: ['Army'],
    description:
      'Fort Irwin is home to the National Training Center (NTC), the Army\'s primary large-scale combat training exercise site, located in the Mojave Desert.',
    rentalNote:
      'Barstow is an isolated desert market with minimal rental inventory. BAH rates reflect the Victorville/Hesperia area; many servicemembers choose to live on-post due to limited off-post options.',
    nearby: ['edwards-afb', 'marine-corps-air-ground-combat-center', 'vandenberg-sfb'],
  },
  {
    name: 'United States Military Academy at West Point',
    slug: 'west-point',
    zip: '10996',
    city: 'West Point',
    state: 'NY',
    stateName: 'New York',
    branches: ['Army'],
    description:
      'West Point is the nation\'s premier military university, graduating Army officers since 1802 and located along the Hudson River 50 miles north of New York City.',
    rentalNote:
      'West Point falls in the New York City metro MHA with very high BAH rates. Officers and faculty assigned here benefit from those rates, though the area\'s high cost of living consumes much of the BAH advantage.',
    nearby: ['fort-hamilton', 'joint-base-mcguire-dix-lakehurst', 'fort-drum'],
  },

  // ── AIR FORCE / SPACE FORCE ────────────────────────────────────────────────
  {
    name: 'Joint Base San Antonio',
    slug: 'joint-base-san-antonio',
    zip: '78201',
    city: 'San Antonio',
    state: 'TX',
    stateName: 'Texas',
    branches: ['Air Force', 'Army', 'Navy', 'Marine Corps', 'Space Force'],
    description:
      'San Antonio is one of the best BAH-to-cost ratio duty stations in the military. Housing is affordable, there\'s no state income tax, and the metro offers big-city amenities at a fraction of coastal prices. {rank} can comfortably rent or realistically buy with a VA loan.',
    installationDetail:
      'JBSA is a tri-base complex — Lackland AFB (basic training), Fort Sam Houston (military medical), and Randolph AFB (pilot training) — supporting over 80,000 personnel across San Antonio.',
    rentalNote:
      'San Antonio is one of the most affordable large metros in the country. BAH at nearly all grades covers mid-range rentals comfortably, and homeownership is highly accessible.',
    rentalContext:
      'San Antonio housing costs run 8–12% below the national median — your BAH goes significantly further here than at most duty stations.',
    nearby: ['fort-hood', 'fort-bliss', 'barksdale-afb'],
    bahVsHousing: {
      medianRent: 1400,
      medianRentSource: 'Zillow / Zumper 2025–2026',
      medianHomePrice: 295000,
      medianHomePriceSource: 'Redfin / Zillow 2026',
      mortgageMin: 1950,
      mortgageMax: 2150,
      mortgageAssumptions: '$0 down, ~6.5% rate, ~2.0% property tax + insurance',
    },
    localHousingTips: {
      coliNote: 'roughly 8–12% below the national average',
      stateTaxNote:
        'Texas has no state income tax on military pay, meaning your BAH, base pay, and special pays go further here than in high-tax states.',
      neighborhoods: [
        {
          name: 'Converse / Live Oak (near Randolph)',
          highlight: 'Judson ISD — decent (6–7/10)',
          commute: '10–15 min to Randolph AFB',
          bestFor: 'Families stationed at Randolph wanting affordable housing',
          typicalRent3br: '$1,200–$1,500/mo',
        },
        {
          name: 'Alamo Ranch (near Lackland)',
          highlight: 'Northside ISD — strong (7–8/10)',
          commute: '15–20 min to Lackland AFB',
          bestFor: 'Families with kids, near Lackland, newer neighborhoods',
          typicalRent3br: '$1,400–$1,800/mo',
        },
        {
          name: 'Schertz / Cibolo',
          highlight: 'Schertz-Cibolo-Universal City ISD — strong (7–8/10)',
          commute: '15–25 min to Randolph, 30+ to Lackland',
          bestFor: 'Families wanting small-town feel with good schools',
          typicalRent3br: '$1,300–$1,700/mo',
        },
        {
          name: 'Government Hill (near Fort Sam)',
          highlight: 'San Antonio ISD — varies',
          commute: '5–10 min to Fort Sam Houston',
          bestFor: 'Singles or couples wanting walkable historic neighborhood near Fort Sam',
          typicalRent3br: '$1,000–$1,400/mo',
        },
      ],
      mistakeToAvoid:
        'JBSA families often pick a neighborhood without checking which base they\'ll actually commute to. San Antonio is a big city — living near Lackland on the west side adds a 40+ minute commute to Randolph on the northeast side. Figure out your daily commute first, then pick your neighborhood. {rank} at {bahAmount}/month has plenty of options in every part of the city.',
    },
  },
  {
    name: 'Travis AFB',
    slug: 'travis-afb',
    zip: '94533',
    city: 'Fairfield',
    state: 'CA',
    stateName: 'California',
    branches: ['Air Force'],
    description:
      "Travis AFB sits in Solano County — cheaper than San Francisco or the East Bay, but still California-priced. BAH covers rent in Fairfield and Vacaville with a modest buffer, but homeownership requires careful math. California's income tax is a real hit to take-home pay.",
    installationDetail:
      "Travis AFB is the Air Force's largest air mobility base on the West Coast — home to the 60th Air Mobility Wing flying C-5M Super Galaxies and C-17s, located between San Francisco and Sacramento.",
    rentalNote:
      'Travis sits in Fairfield and Vacaville — more affordable than the Bay Area proper but still expensive by national standards. BAH rates are high, reflecting the Northern California market, but California income tax significantly reduces net take-home pay.',
    rentalContext:
      "Fairfield and Vacaville offer dramatically lower rents than the Bay Area or Sacramento — and that's where BAH goes the furthest for Travis families.",
    nearby: ['naval-base-ventura-county', 'vandenberg-sfb', 'camp-pendleton'],
    bahVsHousing: {
      medianRent: 2200,
      medianRentSource: 'Zillow / Zumper 2025–2026',
      medianHomePrice: 550000,
      medianHomePriceSource: 'Zillow / Redfin 2026',
      mortgageMin: 3600,
      mortgageMax: 3900,
      mortgageAssumptions: '$0 down, ~6.5% rate, ~1.1% property tax + insurance',
    },
    localHousingTips: {
      coliNote: 'roughly 20–25% above the national average',
      stateTaxNote: 'California taxes military pay. The top marginal rate can reach 9.3%+ depending on income. BAH and BAS remain tax-free.',
      neighborhoods: [
        {
          name: 'Fairfield',
          highlight: 'Fairfield-Suisun USD — mixed (5–7/10)',
          commute: '5–15 min to Travis gate',
          bestFor: 'Closest to base with the most options',
          typicalRent3br: '$1,800–$2,300/mo',
        },
        {
          name: 'Vacaville',
          highlight: 'Vacaville USD — better than Fairfield (6–7/10)',
          commute: '15–20 min to Travis gate',
          bestFor: 'Families wanting better schools and a nicer downtown',
          typicalRent3br: '$2,000–$2,500/mo',
        },
        {
          name: 'Suisun City',
          highlight: 'Fairfield-Suisun USD — varies',
          commute: '5–10 min to Travis gate',
          bestFor: 'Most affordable option right next to base',
          typicalRent3br: '$1,700–$2,100/mo',
        },
        {
          name: 'Dixon',
          highlight: 'Dixon USD — small, decent (6–7/10)',
          commute: '15–20 min to Travis gate',
          bestFor: 'Families wanting a small-town feel at lower prices',
          typicalRent3br: '$1,800–$2,200/mo',
        },
      ],
      mistakeToAvoid:
        "Travis sits between the Bay Area and Sacramento — both expensive metros that pull housing prices up. The mistake is looking at Napa or Walnut Creek for the lifestyle when Vacaville and Fairfield are right next to the base with dramatically lower rents. Also, Bay Area commuters drive through this corridor, so I-80 traffic can be brutal during rush hour.",
    },
  },
  {
    name: 'MacDill AFB',
    slug: 'macdill-afb',
    zip: '33607',
    city: 'Tampa',
    state: 'FL',
    stateName: 'Florida',
    branches: ['Air Force'],
    description:
      'MacDill AFB puts you in Tampa — a major metro with beaches, theme parks, and a thriving food scene. The trade-off is cost: Tampa\'s housing market runs above the national average, and South Tampa near base commands premium prices. Most enlisted families live east in Brandon or Riverview for better value.',
    installationDetail:
      'MacDill AFB sits on a peninsula in Tampa Bay — headquarters of U.S. Central Command (CENTCOM) and U.S. Special Operations Command (SOCOM).',
    rentalNote:
      'Tampa is a rapidly growing metro with rising rents. BAH covers most mid-range apartments, but Tampa\'s popularity has outpaced BAH rates in some neighborhoods. Officers and senior NCOs have strong purchasing options.',
    rentalContext:
      'The Tampa metro runs roughly 5–10% above the national median — a growing city premium that BAH accounts for, with Florida\'s no income tax helping offset the difference.',
    nearby: ['eglin-afb', 'naval-air-station-pensacola', 'patrick-sfb'],
    bahVsHousing: {
      medianRent: 2100,
      medianRentSource: 'Zumper / Zillow 2025–2026',
      medianHomePrice: 400000,
      medianHomePriceSource: 'PCSgrades / Zillow 2026',
      mortgageMin: 2700,
      mortgageMax: 3000,
      mortgageAssumptions: '$0 down, ~6.5% rate, ~1.0% property tax + insurance',
    },
    localHousingTips: {
      coliNote: 'roughly 5–10% above the national average',
      stateTaxNote:
        'Florida has no state income tax on military pay. Your entire paycheck goes further here than at duty stations in income-tax states.',
      neighborhoods: [
        {
          name: 'Brandon / Riverview',
          highlight: 'Hillsborough County — strong options (7–8/10)',
          commute: '20–25 min to MacDill',
          bestFor: 'Best value for families, popular military neighborhoods',
          typicalRent3br: '$1,700–$2,200/mo',
        },
        {
          name: 'South Tampa',
          highlight: 'Hillsborough County — varies, magnet options available',
          commute: '5–15 min to MacDill',
          bestFor: 'Urban lifestyle closest to base (premium pricing)',
          typicalRent3br: '$2,300–$3,200/mo',
        },
        {
          name: 'Valrico',
          highlight: 'Hillsborough County — strong (7–8/10)',
          commute: '25–30 min to MacDill',
          bestFor: 'Families wanting newer construction and good schools',
          typicalRent3br: '$1,800–$2,400/mo',
        },
        {
          name: 'St. Petersburg',
          highlight: 'Pinellas County Schools — varies',
          commute: '25–35 min to MacDill (bridge dependent)',
          bestFor: 'Those wanting a different vibe — arts, waterfront, walkable downtown',
          typicalRent3br: '$1,800–$2,400/mo',
        },
      ],
      mistakeToAvoid:
        'South Tampa near MacDill is premium real estate — beautiful but expensive. The mistake is looking only at South Tampa and getting sticker shock. Brandon, Riverview, and Valrico are 15–25 minutes from base with significantly lower rents, better school options, and family-friendly neighborhoods. Also budget for Florida homeowners insurance — it\'s skyrocketed in recent years.',
    },
  },
  {
    name: 'Eglin AFB',
    slug: 'eglin-afb',
    zip: '32547',
    city: 'Fort Walton Beach',
    state: 'FL',
    stateName: 'Florida',
    branches: ['Air Force', 'Army'],
    description:
      'Eglin AFB is a beach-premium market — BAH reflects the area\'s higher costs, and Florida has no income tax, giving you an immediate advantage. Most enlisted families find BAH covers rent comfortably in Niceville or Fort Walton Beach. Destin and beachfront areas push past BAH for lower grades.',
    installationDetail:
      'Eglin AFB is the largest Air Force base by area in the continental U.S. — 700 square miles in the Florida panhandle, home to the 96th Test Wing and Air Force development and test operations.',
    rentalNote:
      'The Fort Walton Beach/Destin area is a popular coastal market. BAH rates are competitive, but coastal demand means lower-grade members may need to look inland toward Crestview or Niceville for BAH-aligned rents.',
    rentalContext:
      'The Fort Walton Beach/Niceville area runs roughly 5–8% above the national median — a beach-premium that BAH reflects, with Florida\'s no income tax softening the impact.',
    nearby: ['macdill-afb', 'naval-air-station-pensacola', 'barksdale-afb'],
    bahVsHousing: {
      medianRent: 1800,
      medianRentSource: 'PCS Pay It Forward / RentCafe 2025–2026',
      medianHomePrice: 380000,
      medianHomePriceSource: 'Zillow / Redfin 2026',
      mortgageMin: 2450,
      mortgageMax: 2700,
      mortgageAssumptions: '$0 down, ~6.5% rate, ~0.9% property tax + insurance',
    },
    localHousingTips: {
      coliNote: 'roughly 5–8% above the national average (beach-area premium)',
      stateTaxNote:
        'Florida has no state income tax on military pay. Your entire paycheck goes further here than at duty stations in income-tax states.',
      neighborhoods: [
        {
          name: 'Niceville',
          highlight: 'Okaloosa County Schools — excellent (8–9/10)',
          commute: '10–15 min to Eglin main gate',
          bestFor: 'Top pick for families — best schools near Eglin',
          typicalRent3br: '$1,600–$2,100/mo',
        },
        {
          name: 'Fort Walton Beach',
          highlight: 'Okaloosa County Schools — good (7–8/10)',
          commute: '10–15 min to Eglin, 5 min to Hurlburt',
          bestFor: 'Most options for dining, shopping, and beach access',
          typicalRent3br: '$1,500–$2,000/mo',
        },
        {
          name: 'Crestview',
          highlight: 'Okaloosa County Schools — solid (7/10)',
          commute: '20–25 min to Eglin main gate',
          bestFor: 'Most affordable option with good schools',
          typicalRent3br: '$1,300–$1,700/mo',
        },
        {
          name: 'Destin',
          highlight: 'Okaloosa County Schools — good',
          commute: '20–25 min to Eglin',
          bestFor: 'Beach lifestyle (expect to pay above BAH)',
          typicalRent3br: '$2,200–$3,000/mo',
        },
      ],
      mistakeToAvoid:
        'The Emerald Coast is tourist country — Destin and beachfront rentals look amazing but will blow past your BAH. The mistake is renting on or near the beach when Niceville and Crestview offer the same Eglin commute with dramatically lower rent. An {grade}\'s BAH covers Niceville or Fort Walton Beach comfortably but gets tight fast in Destin.',
    },
  },
  {
    name: 'Joint Base Langley-Eustis',
    slug: 'joint-base-langley-eustis',
    zip: '23665',
    city: 'Hampton',
    state: 'VA',
    stateName: 'Virginia',
    branches: ['Air Force', 'Army'],
    description:
      'JB Langley-Eustis offers a solid BAH-to-cost ratio on the Peninsula side of Hampton Roads. Housing is more affordable than Norfolk or Virginia Beach across the water, and {rank} has a comfortable buffer over median rent. The York County school district is one of the draws for families willing to commute a bit further.',
    installationDetail:
      'JB Langley-Eustis combines Langley AFB (Air Combat Command headquarters, home of the F-22 Raptor) with Fort Eustis (Army Transportation Corps) in Hampton Roads, Virginia.',
    rentalNote:
      'The Hampton Roads market is one of the largest military housing markets in the country. BAH rates reflect a competitive but not extreme market — most grades can cover 2-bedroom rentals across the region.',
    rentalContext:
      'Hampton Roads housing costs run roughly 5–8% below the national median on the Peninsula side — your purchasing power is solid here compared to most East Coast metro duty stations.',
    nearby: ['naval-station-norfolk', 'joint-base-little-creek-fort-story', 'naval-air-station-oceana'],
    bahVsHousing: {
      medianRent: 1500,
      medianRentSource: 'Zillow / Zumper 2025–2026',
      medianHomePrice: 300000,
      medianHomePriceSource: 'Zillow / Redfin 2026',
      mortgageMin: 2050,
      mortgageMax: 2250,
      mortgageAssumptions: '$0 down, ~6.5% rate, ~1.0% property tax + insurance',
    },
    localHousingTips: {
      coliNote: 'roughly 5–8% below the national average',
      stateTaxNote:
        'Virginia taxes military pay. The top marginal rate is 5.75%. BAH and BAS remain tax-free at the federal and state level.',
      neighborhoods: [
        {
          name: 'Hampton',
          highlight: 'Hampton City Schools — mixed (5–6/10)',
          commute: '5–15 min to Langley, 10–20 min to Eustis',
          bestFor: 'Closest to both Langley and Eustis, most affordable',
          typicalRent3br: '$1,200–$1,600/mo',
        },
        {
          name: 'Poquoson',
          highlight: 'Poquoson City Schools — strong (8/10)',
          commute: '10–15 min to Langley',
          bestFor: 'Families wanting a small-town feel with excellent schools',
          typicalRent3br: '$1,500–$1,900/mo',
        },
        {
          name: 'York County / Yorktown',
          highlight: 'York County Schools — excellent (8–9/10)',
          commute: '15–20 min to Langley, 10–15 min to Eustis',
          bestFor: 'Best schools on the Peninsula, historic area',
          typicalRent3br: '$1,500–$2,000/mo',
        },
        {
          name: 'Newport News (north)',
          highlight: 'Newport News Public Schools — varies (5–7/10)',
          commute: '15–20 min to Eustis, 20–25 min to Langley',
          bestFor: 'Families stationed at Eustis wanting more space',
          typicalRent3br: '$1,200–$1,600/mo',
        },
      ],
      mistakeToAvoid:
        'Langley-Eustis sits on the Peninsula side of Hampton Roads. The mistake is looking at Virginia Beach or Norfolk without realizing the Hampton Roads Bridge-Tunnel makes that a 45–90 minute commute during rush hour. Stay on the Peninsula — Hampton, Poquoson, and York County offer good options without tunnel drama.',
    },
  },
  {
    name: 'Wright-Patterson AFB',
    slug: 'wright-patterson-afb',
    zip: '45431',
    city: 'Dayton',
    state: 'OH',
    stateName: 'Ohio',
    branches: ['Air Force'],
    description:
      "Wright-Patterson is one of the most affordable Air Force bases with a major metro feel. Dayton's cost of living is well below the national average, and BAH creates a strong surplus at every pay grade. The Beavercreek-Centerville corridor south of base has excellent schools and is the top choice for families.",
    installationDetail:
      "Wright-Patterson AFB is home to Air Force Materiel Command, the Air Force Research Laboratory, and the National Museum of the U.S. Air Force — the world's largest military aviation museum.",
    rentalNote:
      'Dayton is a highly affordable housing market. BAH provides strong purchasing power at all grades, and many servicemembers choose to purchase rather than rent. Beavercreek south of base is the top school corridor.',
    rentalContext:
      "Dayton's cost of living is well below the national average, making Wright-Patt one of the most financially favorable Air Force duty stations.",
    nearby: ['fort-knox', 'scott-afb', 'offutt-afb'],
    bahVsHousing: {
      medianRent: 1200,
      medianRentSource: 'Zillow / BestPlaces 2025–2026',
      medianHomePrice: 240000,
      medianHomePriceSource: 'Zillow / Redfin 2026',
      mortgageMin: 1700,
      mortgageMax: 1900,
      mortgageAssumptions: '$0 down, ~6.5% rate, ~1.5% property tax + insurance',
    },
    localHousingTips: {
      coliNote: 'roughly 12–15% below the national average',
      stateTaxNote: 'Ohio taxes military pay at up to 3.5%. BAH and BAS remain tax-free.',
      neighborhoods: [
        {
          name: 'Beavercreek',
          highlight: 'Beavercreek City Schools — excellent (8–9/10)',
          commute: '10–15 min to main gate',
          bestFor: 'Top choice for families — best schools near Wright-Patt',
          typicalRent3br: '$1,100–$1,500/mo',
        },
        {
          name: 'Fairborn',
          highlight: 'Fairborn City Schools — decent (6/10)',
          commute: '5–10 min to main gate',
          bestFor: 'Shortest commute and most affordable',
          typicalRent3br: '$900–$1,200/mo',
        },
        {
          name: 'Centerville',
          highlight: 'Centerville City Schools — excellent (8–9/10)',
          commute: '15–20 min to main gate',
          bestFor: 'Families wanting suburban polish with top schools',
          typicalRent3br: '$1,200–$1,600/mo',
        },
        {
          name: 'Huber Heights',
          highlight: 'Huber Heights City Schools — decent (6–7/10)',
          commute: '15–20 min to main gate',
          bestFor: 'Affordable option north of base',
          typicalRent3br: '$900–$1,200/mo',
        },
      ],
      mistakeToAvoid:
        "Wright-Patt has a huge civilian workforce (30,000+), which means off-base amenities are better than most Air Force bases. The mistake is living in older neighborhoods close to the Fairborn gate without exploring Beavercreek or Centerville, which have significantly better schools and are only 10–15 minutes further.",
    },
  },
  {
    name: 'Scott AFB',
    slug: 'scott-afb',
    zip: '62025',
    city: "O'Fallon",
    state: 'IL',
    stateName: 'Illinois',
    branches: ['Air Force'],
    description:
      "Scott AFB offers affordable housing in the Metro East area near St. Louis. BAH creates a healthy surplus at most pay grades. O'Fallon and Shiloh are the most popular off-base choices for families — strong schools, close to base, and access to St. Louis metro amenities across the river.",
    installationDetail:
      "Scott AFB is headquarters of U.S. Transportation Command (TRANSCOM) and Air Mobility Command — the military's global logistics nerve center, located near Belleville, Illinois across the river from St. Louis.",
    rentalNote:
      "The Illinois side of the St. Louis metro offers affordable housing relative to BAH. Most grades have a significant BAH surplus. Note: IL property taxes are high — compare O'Fallon IL vs. O'Fallon MO carefully before buying.",
    rentalContext:
      'the Metro East area near St. Louis offers some of the most favorable BAH-to-rent ratios of any Air Force base.',
    nearby: ['wright-patterson-afb', 'whiteman-afb', 'offutt-afb'],
    bahVsHousing: {
      medianRent: 1200,
      medianRentSource: 'Zillow / BestPlaces 2025–2026',
      medianHomePrice: 220000,
      medianHomePriceSource: 'Zillow / Redfin 2026',
      mortgageMin: 1600,
      mortgageMax: 1800,
      mortgageAssumptions: '$0 down, ~6.5% rate, ~2.0% IL property tax + insurance',
    },
    localHousingTips: {
      coliNote: 'roughly 10–12% below the national average',
      stateTaxNote: "Illinois has a flat income tax of 4.95% on military pay. BAH and BAS remain tax-free. Note: IL property taxes are high — factor this into buy-vs-rent decisions.",
      neighborhoods: [
        {
          name: "O'Fallon, IL",
          highlight: "O'Fallon CCSD / O'Fallon Township HSD — excellent (8–9/10)",
          commute: '10–15 min to Scott gate',
          bestFor: 'Top pick for families — best schools in the area',
          typicalRent3br: '$1,100–$1,500/mo',
        },
        {
          name: 'Shiloh',
          highlight: "Shiloh Village School District / O'Fallon Township — solid (7–8/10)",
          commute: '5–10 min to Scott gate',
          bestFor: 'Closest to base with good schools',
          typicalRent3br: '$1,000–$1,400/mo',
        },
        {
          name: 'Belleville',
          highlight: 'Belleville School District — mixed (5–7/10)',
          commute: '10–15 min to Scott gate',
          bestFor: 'Most affordable with downtown dining and entertainment',
          typicalRent3br: '$900–$1,200/mo',
        },
        {
          name: "O'Fallon, MO (across the river)",
          highlight: 'Fort Zumwalt R-II — excellent (8–9/10)',
          commute: '25–30 min to Scott gate',
          bestFor: 'Families willing to commute for lower MO taxes and top schools',
          typicalRent3br: '$1,200–$1,600/mo',
        },
      ],
      mistakeToAvoid:
        "Scott AFB is in Illinois, but many families live in Missouri across the river for lower property taxes and state tax advantages. Illinois property taxes can run $5,000–$8,000/year on a modest home. If you're buying, compare O'Fallon IL (closest, best schools) against O'Fallon MO (lower taxes, slightly longer commute) before committing.",
    },
  },
  {
    name: 'Luke AFB',
    slug: 'luke-afb',
    zip: '85301',
    city: 'Glendale',
    state: 'AZ',
    stateName: 'Arizona',
    branches: ['Air Force'],
    description:
      "Luke AFB puts you in the Phoenix metro — 5th largest city in the US, with all the amenities that comes with. Arizona's low income tax (2.5%) and the West Valley's growing housing stock make this an attractive duty station. BAH covers rent comfortably in the surrounding suburbs, and homeownership is realistic with a VA loan.",
    installationDetail:
      'Luke AFB is the world\'s largest fighter pilot training base — home to the 56th Fighter Wing training F-35 Lightning II pilots in the Phoenix West Valley.',
    rentalNote:
      "West Valley rents (Surprise, Goodyear, Litchfield Park) are lower than Scottsdale or central Phoenix, giving solid BAH coverage. Phoenix's population boom has tightened supply in some areas — the West Valley still has good inventory.",
    rentalContext:
      'the Phoenix West Valley offers newer construction and solid BAH coverage — significantly more affordable than Scottsdale or central Phoenix.',
    nearby: ['davis-monthan-afb', 'fort-huachuca', 'kirtland-afb'],
    bahVsHousing: {
      medianRent: 1700,
      medianRentSource: 'Zillow / RentCafe 2025–2026',
      medianHomePrice: 400000,
      medianHomePriceSource: 'Zillow / Redfin 2026',
      mortgageMin: 2700,
      mortgageMax: 2950,
      mortgageAssumptions: '$0 down, ~6.5% rate, ~0.7% property tax + insurance',
    },
    localHousingTips: {
      coliNote: 'roughly 5–8% above the national average',
      stateTaxNote: 'Arizona has a flat income tax of 2.5% on military pay — one of the lowest in the country. BAH and BAS remain tax-free.',
      neighborhoods: [
        {
          name: 'Surprise',
          highlight: 'Dysart Unified — good (7/10)',
          commute: '15–20 min to Luke gate',
          bestFor: 'Families wanting newer homes, good schools, and suburban amenities',
          typicalRent3br: '$1,500–$2,000/mo',
        },
        {
          name: 'Goodyear',
          highlight: 'Litchfield Elementary / Agua Fria Union — decent (6–7/10)',
          commute: '10–15 min to Luke gate',
          bestFor: 'Growing area with lots of new construction',
          typicalRent3br: '$1,600–$2,100/mo',
        },
        {
          name: 'Litchfield Park',
          highlight: 'Litchfield Elementary — strong (7–8/10)',
          commute: '5–10 min to Luke gate',
          bestFor: 'Closest to base with established charm',
          typicalRent3br: '$1,700–$2,200/mo',
        },
        {
          name: 'Glendale / Peoria',
          highlight: 'Peoria Unified — strong (7–8/10)',
          commute: '10–20 min to Luke',
          bestFor: 'Families wanting more urban access and restaurant/entertainment options',
          typicalRent3br: '$1,500–$2,000/mo',
        },
      ],
      mistakeToAvoid:
        "Luke is in the Phoenix West Valley, and Phoenix traffic is real. The mistake is living in east Phoenix or Scottsdale for the lifestyle and then sitting in 45+ minutes of I-10 traffic every morning. Surprise, Goodyear, and Litchfield Park are all within 15–20 minutes of Luke's gate with newer construction and good schools.",
    },
  },
  {
    name: 'Davis-Monthan AFB',
    slug: 'davis-monthan-afb',
    zip: '85701',
    city: 'Tucson',
    state: 'AZ',
    stateName: 'Arizona',
    branches: ['Air Force'],
    description:
      "Davis-Monthan offers 330+ days of sunshine and surprisingly affordable desert living. BAH covers rent comfortably in most Tucson neighborhoods, and Arizona's 2.5% flat income tax is one of the lowest in the country. Rita Ranch is the unofficial military neighborhood — great schools, safe, and 10 minutes from base.",
    installationDetail:
      "Davis-Monthan AFB is home to the A-10 Thunderbolt II and the famous 'Boneyard' (309th AMARG) — the world's largest aircraft storage facility with 4,000+ aircraft on 2,600 acres.",
    rentalNote:
      "Tucson is an affordable desert market. BAH at most grades covers mid-range rentals comfortably, with room to spare in many neighborhoods. Rita Ranch east of base has the top-rated Vail school district — the best schools in Tucson.",
    rentalContext:
      "Tucson is affordable by Arizona standards, and Arizona's 2.5% flat income tax means more of your paycheck stays in your pocket.",
    nearby: ['luke-afb', 'fort-huachuca', 'kirtland-afb'],
    bahVsHousing: {
      medianRent: 1500,
      medianRentSource: 'Zillow / PCS Pay It Forward 2025–2026',
      medianHomePrice: 320000,
      medianHomePriceSource: 'Zillow / Redfin 2026',
      mortgageMin: 2150,
      mortgageMax: 2350,
      mortgageAssumptions: '$0 down, ~6.5% rate, ~0.8% property tax + insurance',
    },
    localHousingTips: {
      coliNote: 'roughly 3–5% below the national average',
      stateTaxNote: 'Arizona has a flat income tax of 2.5% on military pay — one of the lowest in the country. BAH and BAS remain tax-free.',
      neighborhoods: [
        {
          name: 'Rita Ranch',
          highlight: 'Vail School District — top-rated in Tucson (8–9/10)',
          commute: '10–15 min to DM gate',
          bestFor: 'Top pick for families — best schools and strong military community',
          typicalRent3br: '$1,400–$1,800/mo',
        },
        {
          name: 'East Tucson / Pantano',
          highlight: 'Tucson USD / Sunnyside — varies (5–7/10)',
          commute: '10–15 min to DM gate',
          bestFor: "More options closer to Tucson's dining and shopping",
          typicalRent3br: '$1,200–$1,600/mo',
        },
        {
          name: 'Sahuarita / Green Valley',
          highlight: 'Sahuarita USD — solid (7/10)',
          commute: '20–25 min to DM gate',
          bestFor: 'Families wanting a quieter suburban feel south of Tucson',
          typicalRent3br: '$1,300–$1,700/mo',
        },
        {
          name: 'Vail',
          highlight: 'Vail School District — top-rated (8–9/10)',
          commute: '15–20 min to DM gate',
          bestFor: 'Families wanting the best schools with newer construction',
          typicalRent3br: '$1,500–$1,900/mo',
        },
      ],
      mistakeToAvoid:
        "Tucson is affordable by Arizona standards, but neighborhood quality varies widely. The mistake is renting close to the base gate on the south side without checking Rita Ranch or the Vail school district (top-rated in Tucson, 15 minutes from base). The school quality difference is dramatic, and the rent difference is only $100–$200/month.",
    },
  },
  {
    name: 'Vandenberg Space Force Base',
    slug: 'vandenberg-sfb',
    zip: '93436',
    city: 'Lompoc',
    state: 'CA',
    stateName: 'California',
    branches: ['Space Force', 'Air Force'],
    description:
      'Vandenberg SFB is the primary West Coast launch facility for the U.S. Space Force and the 30th Space Wing, conducting satellite launches and ICBM test flights along the California coast.',
    rentalNote:
      'Lompoc is an isolated coastal California market with limited rental inventory. BAH rates are elevated relative to the small market, but Santa Barbara — the reference MHA — has very high costs that drive up BAH.',
    nearby: ['travis-afb', 'edwards-afb', 'naval-base-ventura-county'],
  },
  {
    name: 'Edwards AFB',
    slug: 'edwards-afb',
    zip: '93534',
    city: 'Lancaster',
    state: 'CA',
    stateName: 'California',
    branches: ['Air Force'],
    description:
      'Edwards AFB is the Air Force\'s primary flight test center, home to the Air Force Test Center and the Air Force Research Laboratory, located in the high desert northeast of Los Angeles.',
    rentalNote:
      'Lancaster and Palmdale offer affordable desert housing well below Los Angeles BAH levels. BAH for Edwards is calibrated to the Antelope Valley market, providing strong coverage of local rents.',
    nearby: ['vandenberg-sfb', 'fort-irwin', 'luke-afb'],
  },
  {
    name: 'Tinker AFB',
    slug: 'tinker-afb',
    zip: '73110',
    city: 'Midwest City',
    state: 'OK',
    stateName: 'Oklahoma',
    branches: ['Air Force'],
    description:
      "Tinker AFB puts you in Oklahoma City — a major metro with surprisingly affordable housing. OKC's cost of living is well below the national average, Oklahoma exempts military pay from state income tax, and BAH creates a strong surplus at every pay grade. Homeownership here is very realistic.",
    installationDetail:
      "Tinker AFB is one of the Air Force's largest maintenance and logistics centers — home to the Oklahoma City Air Logistics Complex, the 552nd Air Control Wing (AWACS), and Air Force Sustainment Center.",
    rentalNote:
      'Oklahoma City is among the most affordable large metros in the nation. BAH at all grades provides strong purchasing power — homeownership is the norm rather than the exception. Midwest City right next to base is the most convenient option.',
    rentalContext:
      "Oklahoma City's cost of living is well below the national average and Oklahoma exempts military pay from state income tax — a rare combination.",
    nearby: ['fort-sill', 'fort-hood', 'barksdale-afb'],
    bahVsHousing: {
      medianRent: 1200,
      medianRentSource: 'Zillow / BestPlaces 2025–2026',
      medianHomePrice: 230000,
      medianHomePriceSource: 'Zillow / Redfin 2026',
      mortgageMin: 1600,
      mortgageMax: 1800,
      mortgageAssumptions: '$0 down, ~6.5% rate, ~1.0% property tax + insurance',
    },
    localHousingTips: {
      coliNote: 'roughly 12–15% below the national average',
      stateTaxNote: 'Oklahoma taxes military pay at up to 4.75%. However, Oklahoma exempts 100% of active-duty military pay from state income tax for residents. Verify your eligibility.',
      neighborhoods: [
        {
          name: 'Midwest City',
          highlight: 'Mid-Del Schools — decent (6–7/10)',
          commute: '5–10 min to Tinker gate',
          bestFor: 'Closest to base, established military community',
          typicalRent3br: '$900–$1,200/mo',
        },
        {
          name: 'Moore',
          highlight: 'Moore Public Schools — solid (7/10)',
          commute: '15–20 min to Tinker',
          bestFor: 'Families wanting better schools and newer construction',
          typicalRent3br: '$1,100–$1,400/mo',
        },
        {
          name: 'Norman',
          highlight: 'Norman Public Schools — strong (7–8/10), OU campus',
          commute: '20–25 min to Tinker',
          bestFor: 'Families wanting a college-town feel with top schools',
          typicalRent3br: '$1,100–$1,500/mo',
        },
        {
          name: 'Edmond',
          highlight: 'Edmond Public Schools — excellent (8–9/10)',
          commute: '30–35 min to Tinker',
          bestFor: 'Families willing to commute for the best schools in the OKC metro',
          typicalRent3br: '$1,300–$1,700/mo',
        },
      ],
      mistakeToAvoid:
        "Tinker is on the southeast side of OKC, and Oklahoma City is sprawling. The mistake is living on the north side of the metro for lifestyle and then driving 30–40 minutes to Tinker every day. Midwest City, Del City, and Moore are all within 15 minutes of the gate with affordable housing and solid school options.",
    },
  },
  {
    name: 'Barksdale AFB',
    slug: 'barksdale-afb',
    zip: '71111',
    city: 'Bossier City',
    state: 'LA',
    stateName: 'Louisiana',
    branches: ['Air Force'],
    description:
      'Barksdale AFB offers one of the best BAH-to-cost ratios in the Air Force. The Bossier City-Shreveport metro has a low cost of living, and BAH creates a strong surplus at most pay grades. Homeownership is very realistic — many families buy here even on 3-year tours.',
    installationDetail:
      "Barksdale AFB is home to the 2nd Bomb Wing flying B-52H Stratofortresses and Air Force Global Strike Command headquarters — the Air Force's nuclear bomber mission.",
    rentalNote:
      'Shreveport/Bossier City is one of the most affordable markets in the country. BAH covers most rentals with significant room to spare. Haughton northeast of base has the best schools in the Barksdale corridor.',
    rentalContext:
      'the Bossier City area offers one of the best BAH-to-cost ratios in the Air Force — homeownership is realistic even on a 3-year tour.',
    nearby: ['fort-polk', 'joint-base-san-antonio', 'tinker-afb'],
    bahVsHousing: {
      medianRent: 1100,
      medianRentSource: 'Zillow / BestPlaces 2025–2026',
      medianHomePrice: 210000,
      medianHomePriceSource: 'Zillow / Redfin 2026',
      mortgageMin: 1450,
      mortgageMax: 1650,
      mortgageAssumptions: '$0 down, ~6.5% rate, ~0.6% LA property tax + insurance',
    },
    localHousingTips: {
      coliNote: 'roughly 15–18% below the national average',
      stateTaxNote: 'Louisiana taxes military pay at up to 4.25%. BAH and BAS remain tax-free at the federal and state level.',
      neighborhoods: [
        {
          name: 'Bossier City',
          highlight: 'Bossier Parish Schools — solid (7/10)',
          commute: '5–15 min to Barksdale gate',
          bestFor: 'Closest to base with the most amenities',
          typicalRent3br: '$900–$1,200/mo',
        },
        {
          name: 'Haughton',
          highlight: 'Bossier Parish — Haughton zone is the strongest (8/10)',
          commute: '10–15 min to Barksdale gate',
          bestFor: 'Top pick for families — best schools near Barksdale',
          typicalRent3br: '$1,000–$1,400/mo',
        },
        {
          name: 'Shreveport',
          highlight: 'Caddo Parish Schools — mixed (4–7/10, varies by zone)',
          commute: '15–25 min to Barksdale gate',
          bestFor: 'Those wanting more urban options and dining',
          typicalRent3br: '$900–$1,200/mo',
        },
        {
          name: 'Benton',
          highlight: 'Bossier Parish — strong (7–8/10)',
          commute: '15–20 min to Barksdale gate',
          bestFor: 'Families wanting rural feel with good schools',
          typicalRent3br: '$1,000–$1,300/mo',
        },
      ],
      mistakeToAvoid:
        "Bossier City and Shreveport are twin cities split by the Red River. The mistake is living in Shreveport for the slightly more urban feel without realizing that Bossier City has better schools (Bossier Parish) and shorter commutes to Barksdale. Haughton is the top family pick — great schools, 10 minutes from the gate.",
    },
  },
  {
    name: 'Seymour Johnson AFB',
    slug: 'seymour-johnson-afb',
    zip: '27530',
    city: 'Goldsboro',
    state: 'NC',
    stateName: 'North Carolina',
    branches: ['Air Force'],
    description:
      'Seymour Johnson AFB is home to the 4th Fighter Wing and its F-15E Strike Eagles, located in Goldsboro in eastern North Carolina.',
    rentalNote:
      'Goldsboro is a small market with affordable housing. BAH provides solid coverage of local rents, and the proximity to the Research Triangle provides an opportunity for buyers to look toward more dynamic markets.',
    nearby: ['fort-bragg', 'camp-lejeune', 'marine-corps-air-station-cherry-point'],
  },
  {
    name: 'Ellsworth AFB',
    slug: 'ellsworth-afb',
    zip: '57701',
    city: 'Rapid City',
    state: 'SD',
    stateName: 'South Dakota',
    branches: ['Air Force'],
    description:
      'Ellsworth AFB is home to the 28th Bomb Wing operating the B-1B Lancer supersonic bomber, located near Rapid City and the Black Hills of South Dakota.',
    rentalNote:
      'Rapid City is an affordable Black Hills market. BAH covers most rentals easily, and buyers can find strong value in the local real estate market with no state income tax on military pay.',
    nearby: ['minot-afb', 'offutt-afb', 'whiteman-afb'],
  },
  {
    name: 'Minot AFB',
    slug: 'minot-afb',
    zip: '58701',
    city: 'Minot',
    state: 'ND',
    stateName: 'North Dakota',
    branches: ['Air Force'],
    description:
      "Minot AFB is remote and cold, but the community is tight and your BAH goes far. The housing market is affordable, North Dakota's income tax is minimal, and many families find the assignment grows on them. Save aggressively, embrace the outdoor lifestyle, and take advantage of the dual nuclear mission — career-wise, it's a resume builder.",
    installationDetail:
      'Minot AFB is home to the 5th Bomb Wing (B-52H) and the 91st Missile Wing (Minuteman III ICBMs) — one of only two Air Force bases with both nuclear bomber and ICBM missions.',
    rentalNote:
      "Minot is one of the most affordable military markets in the country. BAH significantly exceeds local rents at most grades, and homeownership is very common. On-base housing is popular for families who want shorter commutes in brutal winter conditions.",
    rentalContext:
      "Minot's housing market is highly affordable — BAH creates a strong surplus at most grades, and homeownership is common even on short tours.",
    nearby: ['ellsworth-afb', 'offutt-afb', 'fort-wainwright'],
    bahVsHousing: {
      medianRent: 1000,
      medianRentSource: 'Zillow / BestPlaces 2025–2026',
      medianHomePrice: 240000,
      medianHomePriceSource: 'Zillow / BestPlaces 2026',
      mortgageMin: 1700,
      mortgageMax: 1900,
      mortgageAssumptions: '$0 down, ~6.5% rate, ~1.0% property tax + insurance',
    },
    localHousingTips: {
      coliNote: 'roughly 8–10% below the national average',
      stateTaxNote: 'North Dakota taxes military pay at a low flat rate of 1.95%. BAH and BAS remain tax-free.',
      neighborhoods: [
        {
          name: 'South Minot',
          highlight: 'Minot Public Schools — solid (7/10)',
          commute: '10–15 min to Minot AFB gate',
          bestFor: 'Most housing options and shopping access',
          typicalRent3br: '$900–$1,200/mo',
        },
        {
          name: 'North Minot / Surrey',
          highlight: 'Minot Public Schools — solid',
          commute: '15–20 min to Minot AFB gate',
          bestFor: 'Newer construction areas north of town',
          typicalRent3br: '$1,000–$1,300/mo',
        },
        {
          name: 'On-base housing',
          highlight: 'Minot AFB schools / Minot Public Schools',
          commute: 'Walk or 2–3 min drive',
          bestFor: 'Families wanting short commute and included utilities in extreme cold',
          typicalRent3br: 'BAH covers 100% (utilities included)',
        },
      ],
      mistakeToAvoid:
        "Minot's unofficial motto is 'Why Not Minot? Freezin's the Reason.' Winters are brutal — expect -30°F windchills from November through March. The mistake is not preparing for the cold: plug-in block heaters for your car, quality winter gear, and budgeting for heating costs. The upside: BAH goes far, the community is tight-knit, and there's nothing quite like the Northern Lights from your backyard.",
    },
  },
  {
    name: 'Joint Base Elmendorf-Richardson',
    slug: 'joint-base-elmendorf-richardson',
    zip: '99501',
    city: 'Anchorage',
    state: 'AK',
    stateName: 'Alaska',
    branches: ['Air Force', 'Army'],
    description:
      "JBER puts you in Anchorage — Alaska's largest city with actual urban amenities. BAH is generous, and while Anchorage is expensive, it's more manageable than Hawaii or coastal California. No state income tax and the annual Permanent Fund Dividend are real financial perks.",
    installationDetail:
      "JBER is Alaska's largest military installation — home to the 11th Airborne Division, the 3rd Wing flying F-22 Raptors, and the headquarters of Alaskan Command, located in Anchorage.",
    rentalNote:
      "Anchorage has elevated housing costs but BAH rates reflect the market. Eagle River north of the city has the best schools in the JBER corridor. Get on the on-base waitlist immediately — it fills fast.",
    rentalContext:
      "Anchorage is expensive but more manageable than Hawaii or coastal California — and Alaska's no-income-tax advantage is a real financial benefit.",
    nearby: ['fort-wainwright', 'joint-base-lewis-mcchord', 'naval-base-kitsap'],
    bahVsHousing: {
      medianRent: 1900,
      medianRentSource: 'Zillow / PCS Pay It Forward 2025–2026',
      medianHomePrice: 380000,
      medianHomePriceSource: 'Zillow / Redfin 2026',
      mortgageMin: 2600,
      mortgageMax: 2900,
      mortgageAssumptions: '$0 down, ~6.5% rate, ~1.1% property tax + insurance',
    },
    localHousingTips: {
      coliNote: 'roughly 25–35% above the national average',
      stateTaxNote: 'Alaska has no state income tax and no state sales tax. Plus every Alaska resident receives an annual Permanent Fund Dividend (typically $1,000–$2,000 per person, including children).',
      neighborhoods: [
        {
          name: 'Eagle River',
          highlight: 'Anchorage School District — Eagle River zone is strong (7–8/10)',
          commute: '15–20 min to JBER-Richardson gate',
          bestFor: 'Top pick for families — best schools in the JBER corridor',
          typicalRent3br: '$1,700–$2,200/mo',
        },
        {
          name: 'Anchorage (east/south)',
          highlight: 'Anchorage School District — varies by zone (5–8/10)',
          commute: '10–20 min to JBER-Elmendorf gate',
          bestFor: 'Most options for shopping, dining, and urban amenities',
          typicalRent3br: '$1,600–$2,100/mo',
        },
        {
          name: 'Government Hill / Mountain View',
          highlight: 'Anchorage School District — improving (5–6/10)',
          commute: '5–10 min to Elmendorf gate',
          bestFor: 'Shortest commute and most affordable off-base option',
          typicalRent3br: '$1,400–$1,800/mo',
        },
        {
          name: 'On-base housing (Aurora Military Housing)',
          highlight: 'On-base schools / Anchorage School District',
          commute: 'Walk or 2–3 min drive',
          bestFor: 'Families wanting included utilities and the JBER community',
          typicalRent3br: 'BAH covers 100% (utilities included)',
        },
      ],
      mistakeToAvoid:
        "JBER has two sides — Elmendorf (Air Force, north) and Richardson (Army, south) — and your daily gate matters for housing. The mistake is not asking which side you'll report to before picking a neighborhood. Also, Anchorage's housing market is tighter than Fairbanks — start your housing search 60–90 days early and get on the on-base waitlist immediately.",
    },
  },
  {
    name: 'Joint Base Andrews',
    slug: 'joint-base-andrews',
    zip: '20748',
    city: 'Camp Springs',
    state: 'MD',
    stateName: 'Maryland',
    branches: ['Air Force', 'Army'],
    description:
      "JB Andrews puts you in the DC metro — one of the most expensive areas in the country, but with a critical advantage: Prince George's County is significantly more affordable than Northern Virginia or Montgomery County while still offering reasonable commutes to the base. BAH covers rent in most PG County neighborhoods.",
    installationDetail:
      'JB Andrews is home to Air Force One — the 89th Airlift Wing — and serves as the air gateway to the National Capital Region, located just outside Washington, DC.',
    rentalNote:
      "Andrews sits in the DC metro MHA with some of the highest BAH rates in the country. Prince George's County is more affordable than Northern Virginia or Montgomery County — but school quality varies dramatically by neighborhood. Research specific school zones before signing a lease.",
    rentalContext:
      "Prince George's County is significantly more affordable than Northern Virginia or Montgomery County — and BAH covers rent comfortably in most PG County neighborhoods.",
    nearby: ['fort-meade', 'joint-base-myer-henderson-hall', 'aberdeen-proving-ground'],
    bahVsHousing: {
      medianRent: 2100,
      medianRentSource: 'Zillow / Zumper 2025–2026',
      medianHomePrice: 420000,
      medianHomePriceSource: 'Zillow / Redfin 2026',
      mortgageMin: 3000,
      mortgageMax: 3300,
      mortgageAssumptions: '$0 down, ~6.5% rate, ~1.1% property tax + insurance',
    },
    localHousingTips: {
      coliNote: 'roughly 20–25% above the national average',
      stateTaxNote: 'Maryland taxes military pay at up to 5.75%. However, military retirement pay is exempt from Maryland income tax. BAH and BAS remain tax-free.',
      neighborhoods: [
        {
          name: 'Bowie',
          highlight: "Prince George's County — Bowie zone is among the strongest (7/10)",
          commute: '15–20 min to Andrews',
          bestFor: 'Best schools in the Andrews corridor, suburban feel',
          typicalRent3br: '$1,800–$2,300/mo',
        },
        {
          name: 'Upper Marlboro',
          highlight: "Prince George's County — decent in this zone (6–7/10)",
          commute: '10–15 min to Andrews',
          bestFor: 'Close to base with a more rural feel',
          typicalRent3br: '$1,600–$2,100/mo',
        },
        {
          name: 'Clinton / Camp Springs',
          highlight: "Prince George's County — mixed (5–6/10)",
          commute: '5–10 min to Andrews',
          bestFor: 'Shortest commute and most affordable',
          typicalRent3br: '$1,500–$2,000/mo',
        },
        {
          name: 'Crofton / Odenton',
          highlight: 'Anne Arundel County — strong (7–8/10)',
          commute: '20–25 min to Andrews',
          bestFor: 'Families willing to commute for better schools and proximity to Fort Meade',
          typicalRent3br: '$2,000–$2,500/mo',
        },
      ],
      mistakeToAvoid:
        "Andrews is in Prince George's County, which is more affordable than Northern Virginia or Montgomery County — but school quality varies dramatically by neighborhood. The mistake is picking housing based on price alone without researching the specific school zone. Bowie, Upper Marlboro, and Crofton have the strongest schools in the Andrews commute corridor.",
    },
  },
  {
    name: 'Kirtland AFB',
    slug: 'kirtland-afb',
    zip: '87101',
    city: 'Albuquerque',
    state: 'NM',
    stateName: 'New Mexico',
    branches: ['Air Force'],
    description:
      "Kirtland AFB puts you in Albuquerque — a mid-size city with affordable housing, 310+ days of sunshine, and world-class outdoor recreation in the Sandia Mountains. New Mexico exempts military pay from state income tax, and BAH covers rent with a healthy surplus. Homeownership is realistic at most pay grades.",
    installationDetail:
      "Kirtland AFB is home to the Air Force Nuclear Weapons Center, Sandia National Laboratories, and the Air Force Research Laboratory's Directed Energy Directorate — the military's hub for nuclear weapons management and advanced energy research.",
    rentalNote:
      "Albuquerque is an affordable market with moderate BAH rates. Rents are generally well-covered at mid and senior grades. The east side and northeast heights are the most popular areas for Kirtland families.",
    rentalContext:
      "New Mexico exempts military pay from state income tax, and Albuquerque's affordable housing makes Kirtland one of the more financially favorable Air Force duty stations.",
    nearby: ['fort-bliss', 'luke-afb', 'fort-huachuca'],
    bahVsHousing: {
      medianRent: 1350,
      medianRentSource: 'Zillow / Zumper 2025–2026',
      medianHomePrice: 320000,
      medianHomePriceSource: 'Zillow / Redfin 2026',
      mortgageMin: 2200,
      mortgageMax: 2400,
      mortgageAssumptions: '$0 down, ~6.5% rate, ~0.8% property tax + insurance',
    },
    localHousingTips: {
      coliNote: 'roughly 5–8% below the national average',
      stateTaxNote: 'New Mexico exempts active-duty military pay from state income tax. BAH and BAS are also tax-free. This makes Kirtland one of the more tax-friendly duty stations.',
      neighborhoods: [
        {
          name: 'Four Hills / SE Albuquerque',
          highlight: 'Albuquerque Public Schools — varies (5–7/10)',
          commute: '5–10 min to Kirtland gate',
          bestFor: 'Closest to base with established neighborhoods',
          typicalRent3br: '$1,100–$1,400/mo',
        },
        {
          name: 'NE Heights (Tramway corridor)',
          highlight: 'Albuquerque Public Schools — stronger in this zone (6–8/10)',
          commute: '15–20 min to Kirtland gate',
          bestFor: 'Families wanting safer neighborhoods and Sandia Mountain access',
          typicalRent3br: '$1,300–$1,700/mo',
        },
        {
          name: 'East Mountains (Tijeras / Edgewood)',
          highlight: 'East Mountain Charter / APS — small (6/10)',
          commute: '20–25 min to Kirtland gate',
          bestFor: 'Families wanting rural mountain living with space',
          typicalRent3br: '$1,200–$1,500/mo',
        },
        {
          name: 'Rio Rancho',
          highlight: 'Rio Rancho Public Schools — strong (7–8/10)',
          commute: '25–35 min to Kirtland gate',
          bestFor: 'Families willing to commute for better schools and newer construction',
          typicalRent3br: '$1,300–$1,700/mo',
        },
      ],
      mistakeToAvoid:
        "Albuquerque is affordable and sunny, but crime rates in some neighborhoods are above the national average. The mistake is renting based on price alone without checking neighborhood safety data. The east side of the city (near Kirtland) and the Four Hills/SE Heights area are close to base but vary in safety. Families often prefer the northeast heights or the far east (Tramway corridor) for a better overall feel.",
    },
  },
  {
    name: 'Whiteman AFB',
    slug: 'whiteman-afb',
    zip: '64093',
    city: 'Warrensburg',
    state: 'MO',
    stateName: 'Missouri',
    branches: ['Air Force'],
    description:
      'Whiteman AFB received one of the largest BAH increases in the Air Force for 2026 (9.3%). Combined with Missouri\'s low cost of living, your BAH goes further here than at almost any other Air Force base. {rank} can easily afford to buy with a VA loan.',
    installationDetail:
      'Whiteman AFB is the only base in the world that operates the B-2 Spirit stealth bomber — home of the 509th Bomb Wing.',
    rentalNote:
      'The Warrensburg/Sedalia area is one of the most affordable markets among Air Force bases. BAH provides substantial surplus over typical rents, and many servicemembers purchase in the Kansas City suburbs.',
    rentalContext:
      'The Warrensburg/Knob Noster area runs roughly 7–10% below the national median — one of the most favorable BAH-to-cost ratios in the Air Force.',
    nearby: ['scott-afb', 'offutt-afb', 'fort-leavenworth'],
    bahVsHousing: {
      medianRent: 1200,
      medianRentSource: 'PCS Pay It Forward / BestPlaces 2025–2026',
      medianHomePrice: 195000,
      medianHomePriceSource: 'Zillow / BestPlaces 2026',
      mortgageMin: 1350,
      mortgageMax: 1500,
      mortgageAssumptions: '$0 down, ~6.5% rate, ~1.0% property tax + insurance',
    },
    localHousingTips: {
      coliNote: 'roughly 7–10% below the national average',
      stateTaxNote:
        'Missouri taxes military pay at up to 4.95%. Active-duty pay may qualify for partial deductions — verify with a tax professional. BAH and BAS remain tax-free.',
      neighborhoods: [
        {
          name: 'Knob Noster',
          highlight: 'Knob Noster R-VIII — small, decent (6–7/10)',
          commute: '5–10 min to base gate',
          bestFor: 'Closest to base, tight-knit military community',
          typicalRent3br: '$800–$1,200/mo',
        },
        {
          name: 'Warrensburg',
          highlight: 'Warrensburg R-VI — solid, includes UCM campus area (7/10)',
          commute: '10–15 min to base gate',
          bestFor: 'Families wanting more shopping, dining, and a college-town feel',
          typicalRent3br: '$1,000–$1,400/mo',
        },
        {
          name: 'Sedalia',
          highlight: 'Sedalia 200 — decent (6/10)',
          commute: '20–25 min to base',
          bestFor: 'Families wanting a slightly larger town with more options',
          typicalRent3br: '$900–$1,200/mo',
        },
      ],
      mistakeToAvoid:
        'Whiteman is remote — Knob Noster is tiny and Warrensburg is small. The mistake is not realizing how isolated this base is before you arrive. Kansas City is 70 miles northwest. If you need urban amenities, budget for regular KC trips. On the upside, your BAH goes incredibly far here — an {grade} can rent a house with a big yard for well under BAH.',
    },
  },
  {
    name: 'Offutt AFB',
    slug: 'offutt-afb',
    zip: '68005',
    city: 'Bellevue',
    state: 'NE',
    stateName: 'Nebraska',
    branches: ['Air Force'],
    description:
      'Offutt offers one of the best BAH-to-purchasing-power ratios in the Air Force. The Bellevue-Papillion corridor has affordable homes, strong schools, and Omaha\'s amenities are 15 minutes north. {rank} can realistically buy a home here on BAH alone with a VA loan.',
    installationDetail:
      'Offutt AFB is headquarters of U.S. Strategic Command (USSTRATCOM) — the nation\'s nuclear command and control center — located just south of Omaha.',
    rentalNote:
      'Bellevue and greater Omaha offer affordable, stable housing. BAH comfortably covers most rentals, and the Omaha metro\'s steady economy makes homeownership a financially sound choice for most servicemembers.',
    rentalContext:
      'The Bellevue-Omaha area runs roughly 5–8% below the national median — your BAH stretches well here, and homeownership is within reach on a single income.',
    nearby: ['whiteman-afb', 'fort-leavenworth', 'ellsworth-afb'],
    bahVsHousing: {
      medianRent: 1500,
      medianRentSource: 'Zillow / PCS Pay It Forward 2025–2026',
      medianHomePrice: 300000,
      medianHomePriceSource: 'Redfin / Zillow 2026',
      mortgageMin: 2050,
      mortgageMax: 2250,
      mortgageAssumptions: '$0 down, ~6.5% rate, ~1.7% property tax + insurance',
    },
    localHousingTips: {
      coliNote: 'roughly 5–8% below the national average',
      stateTaxNote:
        'Nebraska taxes military pay. The top marginal rate is 6.64%, though recent legislation has been reducing rates. BAH and BAS remain tax-free.',
      neighborhoods: [
        {
          name: 'Bellevue',
          highlight: 'Bellevue Public Schools — solid (7/10), military-friendly',
          commute: '5–15 min to main gate',
          bestFor: 'Shortest commute, established military community',
          typicalRent3br: '$1,200–$1,600/mo',
        },
        {
          name: 'Papillion',
          highlight: 'Papillion-La Vista Schools — top-rated in Nebraska (8–9/10)',
          commute: '15–20 min to main gate',
          bestFor: 'Families who prioritize schools',
          typicalRent3br: '$1,400–$1,800/mo',
        },
        {
          name: 'La Vista',
          highlight: 'Papillion-La Vista Schools — top-rated',
          commute: '15–20 min to main gate',
          bestFor: 'Newer construction, good retail/dining access',
          typicalRent3br: '$1,300–$1,700/mo',
        },
        {
          name: 'South Omaha / Sarpy County',
          highlight: 'Varies — Millard or Papillion-La Vista districts',
          commute: '20–25 min to main gate',
          bestFor: 'Those wanting urban access to Omaha\'s food and entertainment scene',
          typicalRent3br: '$1,300–$1,700/mo',
        },
      ],
      mistakeToAvoid:
        'Offutt families sometimes default to the closest housing without comparing school districts. Bellevue Public Schools are solid, but the Papillion-La Vista district next door consistently ranks among the best in Nebraska. The commute difference is only 5–10 minutes, and at an {grade}\'s {bahAmount}/month BAH, both districts are well within reach.',
    },
  },
  {
    name: 'Patrick Space Force Base',
    slug: 'patrick-sfb',
    zip: '32931',
    city: 'Cocoa Beach',
    state: 'FL',
    stateName: 'Florida',
    branches: ['Space Force', 'Air Force'],
    description:
      "Patrick SFB puts you on Florida's Space Coast — beachside living, no state income tax, and a front-row seat to rocket launches. The housing market is more affordable than South Florida but carries a coastal premium. Melbourne and Viera offer the best value, while beachside communities push closer to BAH limits.",
    installationDetail:
      "Patrick SFB is the gateway to space — home to Space Launch Delta 45 supporting all launches from Cape Canaveral and Kennedy Space Center on Florida's Space Coast.",
    rentalNote:
      'Cocoa Beach and the Space Coast carry a coastal premium. BAH covers most rentals but beach-adjacent units push the limit. Melbourne and Viera are 15 minutes inland with significantly lower rents and newer construction.',
    rentalContext:
      "Melbourne and Viera offer 15-minute access to the beach with significantly lower rents than beachside communities — and Florida's no-income-tax advantage applies everywhere.",
    nearby: ['macdill-afb', 'eglin-afb', 'naval-air-station-pensacola'],
    bahVsHousing: {
      medianRent: 1800,
      medianRentSource: 'Zillow / Zumper 2025–2026',
      medianHomePrice: 380000,
      medianHomePriceSource: 'Zillow / Redfin 2026',
      mortgageMin: 2500,
      mortgageMax: 2800,
      mortgageAssumptions: '$0 down, ~6.5% rate, ~0.9% property tax + insurance',
    },
    localHousingTips: {
      coliNote: 'roughly 5–8% above the national average',
      stateTaxNote: 'Florida has no state income tax on military pay. Your entire paycheck goes further here than at duty stations in income-tax states.',
      neighborhoods: [
        {
          name: 'Melbourne / Viera',
          highlight: 'Brevard County Schools — Viera zone is strong (7–8/10)',
          commute: '15–20 min to Patrick gate',
          bestFor: 'Best schools and most options, slightly inland',
          typicalRent3br: '$1,500–$1,900/mo',
        },
        {
          name: 'Satellite Beach',
          highlight: 'Brevard County Schools — decent (6–7/10)',
          commute: '5–10 min to Patrick gate',
          bestFor: 'Closest beachside community to base',
          typicalRent3br: '$1,700–$2,200/mo',
        },
        {
          name: 'Palm Bay',
          highlight: 'Brevard County Schools — varies (5–7/10)',
          commute: '20–25 min to Patrick gate',
          bestFor: 'Most affordable option in the area',
          typicalRent3br: '$1,300–$1,700/mo',
        },
        {
          name: 'Cocoa Beach',
          highlight: 'Brevard County Schools — decent',
          commute: '15–20 min to Patrick gate (north)',
          bestFor: 'Classic beach-town living (expect to pay near or above BAH)',
          typicalRent3br: '$1,800–$2,400/mo',
        },
      ],
      mistakeToAvoid:
        "The Space Coast is a beach community, and beachside rents reflect it. The mistake is renting in Cocoa Beach or Satellite Beach without checking Melbourne or Viera, which are 10–15 minutes inland with significantly lower rents, newer construction, and better school options. You can still hit the beach in 15 minutes.",
    },
  },

  // ── NAVY / MARINE CORPS ────────────────────────────────────────────────────
  {
    name: 'Naval Station Norfolk',
    slug: 'naval-station-norfolk',
    zip: '23503',
    city: 'Norfolk',
    state: 'VA',
    stateName: 'Virginia',
    branches: ['Navy'],
    description:
      'Norfolk offers a solid BAH-to-cost ratio despite being in a major metro area. {rank} has enough BAH to cover median rent with a meaningful buffer, and the median home price keeps homeownership in reach — especially with a VA loan.',
    installationDetail:
      'Naval Station Norfolk is the world\'s largest naval base, home port for aircraft carriers, destroyers, and amphibious ships — the anchor of the Atlantic Fleet.',
    rentalNote:
      'Hampton Roads is a large military housing market with heavy Navy demand. BAH rates are competitive, but the sheer size of the military population creates real competition for housing in desirable Norfolk, Chesapeake, and Virginia Beach neighborhoods.',
    rentalContext:
      'Hampton Roads housing costs run roughly 6% below the national median — your BAH goes further here than in most major metro areas.',
    nearby: ['joint-base-langley-eustis', 'joint-base-little-creek-fort-story', 'naval-air-station-oceana'],
    bahVsHousing: {
      medianRent: 1550,
      medianRentSource: 'Zillow 2025–2026',
      medianHomePrice: 283000,
      medianHomePriceSource: 'Zillow 2026',
      mortgageMin: 1900,
      mortgageMax: 2100,
      mortgageAssumptions: '$0 down, ~6.5% rate, ~1.1% property tax + insurance',
    },
    localHousingTips: {
      coliNote: 'roughly 6% below the national average',
      stateTaxNote:
        'Virginia taxes military pay. The top marginal rate is 5.75%. BAH and BAS remain tax-free at the federal and state level.',
      neighborhoods: [
        {
          name: 'Ghent',
          highlight: 'Norfolk Public Schools — ratings vary by zone',
          commute: '10–15 min to Naval Station',
          bestFor: 'Young officers and singles wanting walkable urban living',
          typicalRent3br: '$1,300–$1,700/mo',
        },
        {
          name: 'Chesapeake (Great Bridge)',
          highlight: 'Chesapeake Public Schools — strong ratings (7–8/10)',
          commute: '20–30 min to Naval Station',
          bestFor: 'Families who prioritize schools over commute',
          typicalRent3br: '$1,500–$1,900/mo',
        },
        {
          name: 'Norfolk (Colonial Place)',
          highlight: 'Norfolk Public Schools — varies',
          commute: '10–15 min to Naval Station',
          bestFor: 'Families wanting character homes close to base',
          typicalRent3br: '$1,400–$1,800/mo',
        },
        {
          name: 'Virginia Beach (Town Center area)',
          highlight: 'Virginia Beach City Schools — strong overall (7–9/10)',
          commute: '25–35 min without tunnel traffic',
          bestFor: 'Families willing to trade commute for beach lifestyle and schools',
          typicalRent3br: '$1,600–$2,100/mo',
        },
      ],
      mistakeToAvoid:
        'The biggest mistake PCSing families make in Hampton Roads is not factoring in tunnel traffic. Living in Virginia Beach or the Peninsula side can mean a 45–60 minute commute through the Hampton Roads Bridge-Tunnel during rush hour. Families stationed at Naval Station Norfolk should look at Norfolk proper, Ghent, or Chesapeake for the best commute-to-cost ratio.',
    },
  },
  {
    name: 'Naval Station San Diego',
    slug: 'naval-station-san-diego',
    zip: '92106',
    city: 'San Diego',
    state: 'CA',
    stateName: 'California',
    branches: ['Navy'],
    description:
      'San Diego is one of the most expensive duty stations in the entire military. {rank} receives {bahAmount}/month — generous on paper, but a typical 3-bedroom in a decent neighborhood runs $2,800–$3,500+. Homeownership is out of reach for most single-income enlisted families. This is a duty station where you trade financial surplus for world-class weather and lifestyle.',
    installationDetail:
      'Naval Base San Diego is the principal home port of the Pacific Fleet, supporting over 20,000 military personnel and 50+ ships.',
    rentalNote:
      'San Diego is one of the most expensive military markets in the country. BAH rates are among the highest in CONUS, but rapidly rising rents mean junior members often struggle to find housing fully covered by BAH alone.',
    rentalContext:
      'San Diego housing costs run 45–50% above the national median — BAH is set to cover median rent, but there\'s little surplus for most enlisted members.',
    nearby: ['camp-pendleton', 'marine-corps-air-station-miramar', 'naval-base-ventura-county'],
    bahVsHousing: {
      medianRent: 2800,
      medianRentSource: 'Garrison Ledger / Zillow 2025–2026',
      medianHomePrice: 850000,
      medianHomePriceSource: 'Redfin / Zillow 2026',
      mortgageMin: 5400,
      mortgageMax: 5900,
      mortgageAssumptions: '$0 down, ~6.5% rate, ~1.1% property tax + insurance',
    },
    localHousingTips: {
      coliNote: 'roughly 45–50% above the national average',
      stateTaxNote:
        'California taxes military pay. The top marginal rate can reach 9.3%+ depending on income. BAH and BAS remain tax-free.',
      neighborhoods: [
        {
          name: 'Chula Vista / Eastlake',
          highlight: 'Sweetwater Union HSD — decent (6–7/10)',
          commute: '20–25 min to 32nd Street Naval Station',
          bestFor: 'Families wanting the best value relative to BAH',
          typicalRent3br: '$2,400–$3,000/mo',
        },
        {
          name: 'National City',
          highlight: 'National School District — varies (5–6/10)',
          commute: '10–15 min to 32nd Street Naval Station',
          bestFor: 'Short commute, most affordable near base',
          typicalRent3br: '$2,000–$2,600/mo',
        },
        {
          name: 'Coronado',
          highlight: 'Coronado Unified — excellent (9/10)',
          commute: '10–15 min to Naval Station (via bridge)',
          bestFor: 'Officers or dual-income families wanting top schools',
          typicalRent3br: '$3,500–$5,000/mo',
        },
        {
          name: 'La Mesa / El Cajon',
          highlight: 'Grossmont Union HSD — decent (6–7/10)',
          commute: '20–30 min to 32nd Street',
          bestFor: 'Families wanting more space at lower cost, inland',
          typicalRent3br: '$2,200–$2,800/mo',
        },
      ],
      mistakeToAvoid:
        'San Diego BAH is the 3rd highest in the Navy — but it still doesn\'t fully cover rent in top school districts like Poway or Del Mar, where 3-bedroom homes run $3,800–$5,500/month. The mistake is expecting BAH to give you a comfortable surplus here. Budget to spend every dollar of your BAH on housing, and look at Chula Vista or National City for the best value.',
    },
  },
  {
    name: 'Marine Corps Base Camp Pendleton',
    slug: 'camp-pendleton',
    zip: '92054',
    city: 'Oceanside',
    state: 'CA',
    stateName: 'California',
    branches: ['Marine Corps'],
    description:
      'Camp Pendleton is one of the most expensive duty stations in the military. BAH is high but so is everything else — rent, groceries, gas, and taxes. Most families find BAH covers rent with a modest buffer, but homeownership is out of reach for junior enlisted without dual income. This is a \'sunshine tax\' duty station.',
    installationDetail:
      'Camp Pendleton is the Marine Corps\' largest West Coast base with approximately 38,000 active-duty personnel, located on the Southern California coast between LA and San Diego.',
    rentalNote:
      'The Oceanside/Fallbrook market is slightly more affordable than San Diego proper, but still a high-cost California market. BAH rates reflect the San Diego MHA, which is among the highest in CONUS.',
    rentalContext:
      'Southern California housing costs run 40–50% above the national median — BAH is set to cover median rent, leaving little room for error in this market.',
    nearby: ['naval-station-san-diego', 'marine-corps-air-station-miramar', 'travis-afb'],
    bahVsHousing: {
      medianRent: 2800,
      medianRentSource: 'RentCafe / Zillow 2025–2026',
      medianHomePrice: 750000,
      medianHomePriceSource: 'MLS / Redfin 2026',
      mortgageMin: 4800,
      mortgageMax: 5200,
      mortgageAssumptions: '$0 down, ~6.5% rate, ~1.1% property tax + insurance',
    },
    localHousingTips: {
      coliNote: 'roughly 40–50% above the national average',
      stateTaxNote:
        'California taxes military pay. The top marginal rate can reach 9.3%+ depending on income. BAH and BAS remain tax-free.',
      neighborhoods: [
        {
          name: 'Oceanside',
          highlight: 'Oceanside Unified — mixed ratings (5–7/10)',
          commute: '10–20 min to main gate',
          bestFor: 'Marines wanting beach proximity and base access',
          typicalRent3br: '$2,200–$2,800/mo',
        },
        {
          name: 'Vista',
          highlight: 'Vista Unified — improving (5–7/10)',
          commute: '15–25 min to main gate',
          bestFor: 'Families looking for more space at lower cost',
          typicalRent3br: '$2,000–$2,600/mo',
        },
        {
          name: 'Fallbrook',
          highlight: 'Fallbrook Union — decent (6–7/10)',
          commute: '15–20 min to back gate',
          bestFor: 'Families wanting a small-town feel with more space',
          typicalRent3br: '$1,800–$2,400/mo',
        },
        {
          name: 'San Clemente',
          highlight: 'Capistrano Unified — strong (8–9/10)',
          commute: '15–20 min to north gate (I-5 traffic dependent)',
          bestFor: 'Families willing to pay more for top schools and beach town living',
          typicalRent3br: '$2,800–$3,500/mo',
        },
      ],
      mistakeToAvoid:
        'BAH at Camp Pendleton is among the highest in the country — but so is rent. {rank} at {bahAmount}/month will find that quality 3-bedroom rentals in Oceanside start around $2,800 and climb fast. The mistake is assuming BAH gives you a big surplus here. Budget carefully and look at Vista or Fallbrook for more affordable options if Oceanside coastal rents push past your allowance.',
    },
  },
  {
    name: 'Marine Corps Base Camp Lejeune',
    slug: 'camp-lejeune',
    zip: '28540',
    city: 'Jacksonville',
    state: 'NC',
    stateName: 'North Carolina',
    branches: ['Marine Corps', 'Navy'],
    description:
      'Camp Lejeune is an affordable Marine Corps duty station. Jacksonville\'s median 3-bedroom rental runs about $1,400/month, meaning most families with dependents have meaningful BAH surplus. The VA loan market here is strong — homes in the $200K–$350K range are accessible at every enlisted pay grade.',
    installationDetail:
      'Camp Lejeune is one of the Marine Corps\' largest bases with 14 miles of beach on the Atlantic Ocean — home to II Marine Expeditionary Force and multiple infantry battalions.',
    rentalNote:
      'Jacksonville is a military-dominated market with affordable rents. BAH provides solid coverage, but the town\'s rental supply is heavily shaped by military demand cycles. Buyers often find good value in the surrounding Onslow County area.',
    rentalContext:
      'Jacksonville housing costs run roughly 10–12% below the national median — your BAH goes further here than at most CONUS Marine Corps installations.',
    nearby: ['fort-bragg', 'marine-corps-air-station-cherry-point', 'seymour-johnson-afb'],
    bahVsHousing: {
      medianRent: 1400,
      medianRentSource: 'PCS Pay It Forward / MilitaryByOwner 2025–2026',
      medianHomePrice: 275000,
      medianHomePriceSource: 'Redfin / PCS Pay It Forward 2026',
      mortgageMin: 1800,
      mortgageMax: 2000,
      mortgageAssumptions: '$0 down, ~6.5% rate, ~0.8% property tax + insurance',
    },
    localHousingTips: {
      coliNote: 'roughly 10–12% below the national average',
      stateTaxNote:
        'North Carolina taxes military base pay at approximately 4.5%. BAH and BAS remain tax-free at the federal and state level.',
      neighborhoods: [
        {
          name: 'Jacksonville',
          highlight: 'Onslow County Schools — mixed (5–7/10)',
          commute: '5–15 min to main gate',
          bestFor: 'Most affordable and convenient for base access',
          typicalRent3br: '$1,100–$1,500/mo',
        },
        {
          name: 'Swansboro',
          highlight: 'Onslow County — strongest off-base schools (7–8/10)',
          commute: '20–25 min to main gate',
          bestFor: 'Families who prioritize schools and want coastal charm',
          typicalRent3br: '$1,500–$1,900/mo',
        },
        {
          name: 'Sneads Ferry',
          highlight: 'Onslow County Schools — decent',
          commute: '15–20 min to Stone Bay gate',
          bestFor: 'Quiet fishing village with coastal living',
          typicalRent3br: '$1,400–$1,800/mo',
        },
        {
          name: 'Hubert / Holly Ridge',
          highlight: 'Onslow County Schools — improving',
          commute: '10–15 min to back gate',
          bestFor: 'Families wanting newer construction at lower prices',
          typicalRent3br: '$1,200–$1,600/mo',
        },
      ],
      mistakeToAvoid:
        'Jacksonville is a classic military town — affordable but not much beyond base-supporting businesses. The mistake is not knowing about Swansboro, which has the best off-base schools in the area and a charming coastal feel, only 20 minutes south. It costs a bit more, but the school quality jump from Jacksonville to Swansboro is significant.',
    },
  },
  {
    name: 'Joint Base Pearl Harbor-Hickam',
    slug: 'joint-base-pearl-harbor-hickam',
    zip: '96818',
    city: 'Honolulu',
    state: 'HI',
    stateName: 'Hawaii',
    branches: ['Navy', 'Air Force'],
    description:
      'Hawaii is a dream assignment for lifestyle and a challenging one for finances. {rank} receives {bahAmount}/month in BAH — high nationally, but Oahu rents often exceed $3,000/month for a 3-bedroom. Homeownership is out of reach for most enlisted families without dual income. Budget every dollar and embrace the commissary.',
    installationDetail:
      'Joint Base Pearl Harbor-Hickam is the strategic hub of the Pacific — home to U.S. Pacific Fleet, U.S. Indo-Pacific Command, and multiple Navy and Air Force wings on the island of Oahu.',
    rentalNote:
      'Honolulu is one of the most expensive housing markets in the country. BAH rates are the highest in the DoD, but Hawaii rents consistently outpace BAH — particularly for larger units. Many servicemembers live on base to manage costs.',
    rentalContext:
      'Oahu housing costs run 30–50% above the national median — BAH is set to cover median rent, but there\'s little room in the budget for error in this market.',
    nearby: ['schofield-barracks', 'travis-afb', 'naval-station-san-diego'],
    bahVsHousing: {
      medianRent: 3000,
      medianRentSource: 'Zillow / PCS Pay It Forward 2025–2026',
      medianHomePrice: 850000,
      medianHomePriceSource: 'Zillow / Redfin 2026',
      mortgageMin: 5800,
      mortgageMax: 6400,
      mortgageAssumptions: '$0 down, ~6.5% rate, ~0.35% property tax + insurance',
    },
    localHousingTips: {
      coliNote: 'roughly 30–50% above the national average (groceries, utilities, and transportation all run significantly higher)',
      stateTaxNote:
        'Hawaii taxes military pay at up to 11% at the top marginal rate. BAH and BAS remain tax-free. The high state tax rate eats into take-home pay more than most duty stations.',
      neighborhoods: [
        {
          name: 'Ewa Beach / Ocean Pointe',
          highlight: 'Campbell Complex — decent (6–7/10)',
          commute: '15–20 min to Hickam/Pearl Harbor',
          bestFor: 'Most popular for Hickam families, newer homes, military-dense',
          typicalRent3br: '$2,600–$3,200/mo',
        },
        {
          name: 'Mililani',
          highlight: 'Mililani Complex — strong (8/10)',
          commute: '20–25 min to Pearl Harbor, 15 min to Schofield',
          bestFor: 'Families who prioritize schools, central Oahu',
          typicalRent3br: '$2,800–$3,500/mo',
        },
        {
          name: 'Kapolei',
          highlight: 'Campbell Complex — decent, newer schools (6–7/10)',
          commute: '20–25 min to Pearl Harbor',
          bestFor: 'Families wanting newer construction in a growing area',
          typicalRent3br: '$2,500–$3,200/mo',
        },
        {
          name: 'Pearl City / Aiea',
          highlight: 'Aiea Complex — decent (6–7/10)',
          commute: '10–15 min to Pearl Harbor',
          bestFor: 'Closest off-base option to JBPHH',
          typicalRent3br: '$2,400–$3,000/mo',
        },
      ],
      mistakeToAvoid:
        'Hawaii BAH is among the highest in the nation, but so is everything else. Groceries run 30–50% above mainland prices. A gallon of milk costs $7+. The mistake is budgeting like you\'re on the mainland — you need to factor in island pricing for food, gas, and utilities on top of housing costs. Also, on-base housing waitlists are real — contact Housing the day you get orders.',
    },
  },
  {
    name: 'Naval Air Station Pensacola',
    slug: 'naval-air-station-pensacola',
    zip: '32501',
    city: 'Pensacola',
    state: 'FL',
    stateName: 'Florida',
    branches: ['Navy'],
    description:
      "NAS Pensacola is one of the more affordable Navy duty stations in the country. Northwest Florida's cost of living is below the national average, Florida has no income tax, and BAH covers rent with a comfortable buffer. The Gulf Coast lifestyle — white sand beaches, fishing, warm weather — is the bonus.",
    installationDetail:
      "NAS Pensacola is the 'Cradle of Naval Aviation' — home to Naval Air Technical Training Command, the Blue Angels flight demonstration team, and the National Naval Aviation Museum.",
    rentalNote:
      'Pensacola is an attractive coastal market with moderate rents relative to Florida averages. BAH covers most mid-range rentals with room to spare. Neighborhoods north of downtown and in Santa Rosa County offer the best balance of price and quality.',
    rentalContext:
      "Northwest Florida's cost of living is below the national average, and Florida's no-income-tax advantage makes Pensacola one of the better financial deals in the Navy.",
    nearby: ['eglin-afb', 'macdill-afb', 'naval-station-mayport'],
    bahVsHousing: {
      medianRent: 1500,
      medianRentSource: 'Zillow / Zumper 2025–2026',
      medianHomePrice: 280000,
      medianHomePriceSource: 'Zillow / Redfin 2026',
      mortgageMin: 1850,
      mortgageMax: 2050,
      mortgageAssumptions: '$0 down, ~6.5% rate, ~0.8% property tax + insurance',
    },
    localHousingTips: {
      coliNote: 'roughly 5–8% below the national average',
      stateTaxNote: 'Florida has no state income tax on military pay. Your entire paycheck goes further here than at duty stations in income-tax states.',
      neighborhoods: [
        {
          name: 'Pensacola (east/north)',
          highlight: 'Escambia County Schools — varies (5–7/10)',
          commute: '10–15 min to NAS Pensacola',
          bestFor: 'Most options closest to base',
          typicalRent3br: '$1,200–$1,600/mo',
        },
        {
          name: 'Pace / Milton',
          highlight: 'Santa Rosa County Schools — strong (7–8/10)',
          commute: '20–25 min to NAS Pensacola',
          bestFor: 'Families wanting the best schools in the area',
          typicalRent3br: '$1,300–$1,700/mo',
        },
        {
          name: 'Gulf Breeze',
          highlight: 'Santa Rosa County Schools — strong (7–8/10)',
          commute: '15–20 min to NAS Pensacola',
          bestFor: 'Families wanting a waterfront community with good schools',
          typicalRent3br: '$1,500–$1,900/mo',
        },
        {
          name: 'Cantonment / Gonzalez',
          highlight: 'Escambia County — improving (6–7/10)',
          commute: '20–25 min to NAS Pensacola',
          bestFor: 'Most affordable with a rural feel',
          typicalRent3br: '$1,100–$1,400/mo',
        },
      ],
      mistakeToAvoid:
        "Pensacola Beach and Perdido Key are gorgeous — but rentals there are priced for tourists, not military families. The mistake is paying beach-premium rent when Pace, Gulf Breeze, or Cantonment offer solid neighborhoods 15–20 minutes from the gate at prices BAH actually covers. Save the beach for weekends.",
    },
  },
  {
    name: 'Naval Station Mayport',
    slug: 'naval-station-mayport',
    zip: '32233',
    city: 'Atlantic Beach',
    state: 'FL',
    stateName: 'Florida',
    branches: ['Navy'],
    description:
      "NS Mayport gives you Jacksonville's beach lifestyle without Miami prices. Florida has no income tax, and BAH covers rent comfortably in most neighborhoods. The Beaches area is walkable to base but commands premium rents. Families looking for the best schools often look south to St. Johns County — consistently the top-rated district in Florida.",
    installationDetail:
      "Naval Station Mayport is the third-largest Navy base in the country — home port for guided-missile destroyers, littoral combat ships, and the future home of a carrier strike group on Jacksonville's Atlantic coast.",
    rentalNote:
      "The Beaches area (Atlantic Beach, Neptune Beach) is walkable to Mayport but commands a coastal premium. BAH covers most rentals — but families after the best schools often commute south to St. Johns County, the top-ranked district in Florida.",
    rentalContext:
      "Florida's no-income-tax advantage and Jacksonville's below-average cost of living make Mayport one of the more financially favorable Navy assignments on the East Coast.",
    nearby: ['naval-air-station-pensacola', 'macdill-afb', 'marine-corps-air-station-beaufort'],
    bahVsHousing: {
      medianRent: 1600,
      medianRentSource: 'Zillow / Zumper 2025–2026',
      medianHomePrice: 350000,
      medianHomePriceSource: 'Zillow / Redfin 2026',
      mortgageMin: 2350,
      mortgageMax: 2550,
      mortgageAssumptions: '$0 down, ~6.5% rate, ~0.9% property tax + insurance',
    },
    localHousingTips: {
      coliNote: 'roughly 5–8% below the national average',
      stateTaxNote: 'Florida has no state income tax on military pay. Your entire paycheck goes further here than at duty stations in income-tax states.',
      neighborhoods: [
        {
          name: 'Atlantic Beach / Neptune Beach',
          highlight: 'Duval County Schools — decent (6–7/10)',
          commute: '5–10 min to Mayport gate',
          bestFor: 'Beach lifestyle closest to base',
          typicalRent3br: '$1,700–$2,200/mo',
        },
        {
          name: 'Jacksonville (Arlington / Southside)',
          highlight: 'Duval County Schools — varies (5–7/10)',
          commute: '20–25 min to Mayport',
          bestFor: 'Most affordable with access to city amenities',
          typicalRent3br: '$1,300–$1,700/mo',
        },
        {
          name: 'St. Johns County (Ponte Vedra)',
          highlight: 'St. Johns County Schools — best in Florida (9/10)',
          commute: '25–30 min to Mayport',
          bestFor: 'Families who prioritize schools above all else',
          typicalRent3br: '$1,800–$2,300/mo',
        },
        {
          name: 'Mandarin',
          highlight: 'Duval County — Mandarin zone is stronger (7/10)',
          commute: '30–35 min to Mayport',
          bestFor: 'Families wanting suburban feel with more space',
          typicalRent3br: '$1,500–$1,900/mo',
        },
      ],
      mistakeToAvoid:
        "Mayport sits on the northeast tip of Jacksonville, and the Beaches area (Atlantic Beach, Neptune Beach, Jax Beach) is right next door — beautiful but pricey. The mistake is blowing your BAH on a beach rental when Arlington, Mandarin, or even Orange Park offer solid neighborhoods 20–25 minutes from the gate at prices that leave BAH surplus for saving.",
    },
  },
  {
    name: 'Naval Base Kitsap',
    slug: 'naval-base-kitsap',
    zip: '98312',
    city: 'Bremerton',
    state: 'WA',
    stateName: 'Washington',
    branches: ['Navy'],
    description:
      'Naval Base Kitsap is more affordable than JBLM or Seattle despite being in western Washington. Bremerton and Silverdale offer reasonable housing costs, no state income tax, and a scenic Pacific Northwest lifestyle. The ferry to Seattle is a bonus for weekend trips, not a daily commute strategy.',
    installationDetail:
      "Naval Base Kitsap is the Navy's largest installation in the Pacific Northwest — supporting the Trident submarine fleet at Bangor and surface ships at Bremerton, across Puget Sound from Seattle.",
    rentalNote:
      "Bremerton is more affordable than Seattle but still part of the Puget Sound market. BAH rates are elevated to match. Note: Kitsap has two main sites — Bangor (north, submarines) and Bremerton (south, surface ships). Know which site you'll work from before house-hunting.",
    rentalContext:
      "Washington's no state income tax advantage gives Kitsap families a meaningful net-pay edge over most other duty stations.",
    nearby: ['joint-base-lewis-mcchord', 'naval-air-station-whidbey-island', 'joint-base-elmendorf-richardson'],
    bahVsHousing: {
      medianRent: 1800,
      medianRentSource: 'Zillow / Zumper 2025–2026',
      medianHomePrice: 420000,
      medianHomePriceSource: 'Zillow / Redfin 2026',
      mortgageMin: 2800,
      mortgageMax: 3100,
      mortgageAssumptions: '$0 down, ~6.5% rate, ~1.0% property tax + insurance',
    },
    localHousingTips: {
      coliNote: 'roughly 10–15% above the national average',
      stateTaxNote: 'Washington has no state income tax — a significant net-pay advantage over most duty stations.',
      neighborhoods: [
        {
          name: 'Silverdale',
          highlight: 'Central Kitsap Schools — good (7/10)',
          commute: '10–15 min to Bangor, 20 min to Bremerton',
          bestFor: 'Best option for Bangor-assigned families, most shopping',
          typicalRent3br: '$1,600–$2,100/mo',
        },
        {
          name: 'Bremerton',
          highlight: 'Bremerton Schools — mixed (5–6/10)',
          commute: '5–10 min to Bremerton shipyard, 25 min to Bangor',
          bestFor: 'Shortest commute to the shipyard, most affordable',
          typicalRent3br: '$1,400–$1,800/mo',
        },
        {
          name: 'Port Orchard',
          highlight: 'South Kitsap Schools — decent (6–7/10)',
          commute: '10–15 min to Bremerton, 30 min to Bangor',
          bestFor: 'Families wanting more space at lower cost',
          typicalRent3br: '$1,500–$1,900/mo',
        },
        {
          name: 'Poulsbo',
          highlight: 'North Kitsap Schools — solid (7/10)',
          commute: '15–20 min to Bangor, 25 min to Bremerton',
          bestFor: 'Charming waterfront town with Scandinavian heritage',
          typicalRent3br: '$1,700–$2,200/mo',
        },
      ],
      mistakeToAvoid:
        "Naval Base Kitsap has two main locations — Bangor (submarines, north) and Bremerton (surface ships, south) — 20 minutes apart. The mistake is picking housing before knowing which site you'll report to daily. Silverdale works for Bangor, Bremerton/Port Orchard for the shipyard. Also, the Seattle ferry is scenic but not a reliable daily commute.",
    },
  },
  {
    name: 'Naval Air Station Whidbey Island',
    slug: 'naval-air-station-whidbey-island',
    zip: '98277',
    city: 'Oak Harbor',
    state: 'WA',
    stateName: 'Washington',
    branches: ['Navy'],
    description: 'NAS Whidbey Island offers Pacific Northwest island living — no state income tax, stunning scenery, and a tight-knit military community. Oak Harbor is the main town and has grown significantly with new restaurants and shops. BAH covers rent, but the island\'s limited inventory means starting your housing search early is critical.',
    installationDetail: 'NAS Whidbey Island is home to all Navy EA-18G Growler electronic attack squadrons — the fleet\'s premier electronic warfare capability, on a scenic island in Puget Sound.',
    rentalNote: 'Oak Harbor is an island community with a constrained housing supply. BAH is tied to the Seattle market due to proximity, but island rents are lower — meaning BAH provides strong purchasing power relative to local rents.',
    rentalContext: 'Oak Harbor\'s island housing market runs tight, so starting your search 60–90 days before arrival is essential',
    nearby: ['naval-base-kitsap', 'joint-base-lewis-mcchord', 'joint-base-elmendorf-richardson'],
    bahVsHousing: {
      medianRent: 1600,
      medianRentSource: 'Zillow / BestPlaces 2025–2026',
      medianHomePrice: 450000,
      medianHomePriceSource: 'Zillow / Redfin 2026',
      mortgageMin: 3000,
      mortgageMax: 3300,
      mortgageAssumptions: '$0 down, ~6.5% rate, ~0.9% property tax + insurance',
    },
    localHousingTips: {
      coliNote: 'roughly 10–12% above the national average',
      stateTaxNote: 'Washington has no state income tax — a significant net-pay advantage over most duty stations.',
      neighborhoods: [
        {
          name: 'Oak Harbor',
          highlight: 'Oak Harbor School District — solid (7/10)',
          commute: '5–15 min to NAS Whidbey',
          bestFor: 'Only real option — most housing, schools, and amenities on the island',
          typicalRent3br: '$1,400–$1,800/mo',
        },
        {
          name: 'Coupeville',
          highlight: 'Coupeville School District — small, strong (7–8/10)',
          commute: '15–20 min to NAS Whidbey',
          bestFor: 'Historic waterfront town with charm',
          typicalRent3br: '$1,500–$2,000/mo',
        },
        {
          name: 'Anacortes (mainland)',
          highlight: 'Anacortes School District — strong (7–8/10)',
          commute: '25–35 min to NAS Whidbey (via Deception Pass)',
          bestFor: 'Families wanting mainland access with a small-city feel',
          typicalRent3br: '$1,600–$2,100/mo',
        },
      ],
      mistakeToAvoid: 'Whidbey Island is exactly that — an island. The Deception Pass bridge connects to the mainland, but it\'s a 30+ minute drive to I-5. The mistake is not embracing island life. Oak Harbor has everything you need day-to-day, but plan ahead for bigger shopping trips or specialist appointments. The ferry to the mainland is scenic but not a daily commute solution.',
    },
  },
  {
    name: 'MCAS Miramar',
    slug: 'marine-corps-air-station-miramar',
    zip: '92108',
    city: 'San Diego',
    state: 'CA',
    stateName: 'California',
    branches: ['Marine Corps'],
    description:
      'MCAS Miramar (formerly the Navy\'s "Top Gun" base) is home to Marine Aircraft Group 11 and several fixed-wing and helicopter squadrons, located in the northern San Diego metro.',
    rentalNote:
      'Miramar is in the San Diego MHA — one of the most expensive markets in CONUS. BAH is high, but so are rents. Many Marines opt to live farther north in Poway or Santee for better BAH coverage.',
    nearby: ['naval-station-san-diego', 'camp-pendleton', 'naval-base-ventura-county'],
  },
  {
    name: 'MCAS Cherry Point',
    slug: 'marine-corps-air-station-cherry-point',
    zip: '28532',
    city: 'Havelock',
    state: 'NC',
    stateName: 'North Carolina',
    branches: ['Marine Corps', 'Navy'],
    description:
      'MCAS Cherry Point is the largest Marine Corps air station on the East Coast, home to 2nd Marine Aircraft Wing squadrons and the Fleet Readiness Center East, located in coastal North Carolina.',
    rentalNote:
      'Havelock is a military-centric market with affordable rents. BAH provides excellent coverage, and buyers often find strong value in the adjacent New Bern area.',
    nearby: ['camp-lejeune', 'fort-bragg', 'seymour-johnson-afb'],
  },
  {
    name: 'Marine Corps Base Quantico',
    slug: 'marine-corps-base-quantico',
    zip: '22134',
    city: 'Quantico',
    state: 'VA',
    stateName: 'Virginia',
    branches: ['Marine Corps', 'Navy'],
    description:
      "MCB Quantico puts you in the Northern Virginia/DC corridor — one of the most expensive housing markets in the country. BAH is generous but the market is competitive. Stafford County offers the best balance of commute and affordability for Quantico families. Many officers live in the Fredericksburg area for more space.",
    installationDetail:
      "MCB Quantico is the 'Crossroads of the Marine Corps' — home to Marine Corps University, OCS, TBS, FBI Academy, and the DEA Training Academy, located 35 miles south of Washington, DC.",
    rentalNote:
      "Quantico falls in the DC metro BAH zone with very high rates. The Northern Virginia market is expensive, but Stafford County offers the best value closest to the base. Fredericksburg is more affordable but adds I-95 commute risk.",
    rentalContext:
      'Stafford County offers the best balance of price and commute for Quantico families — Northern Virginia and DC proper will significantly exceed BAH.',
    nearby: ['joint-base-myer-henderson-hall', 'fort-meade', 'joint-base-andrews'],
    bahVsHousing: {
      medianRent: 2200,
      medianRentSource: 'Zillow / Zumper 2025–2026',
      medianHomePrice: 500000,
      medianHomePriceSource: 'Zillow / Redfin 2026',
      mortgageMin: 3400,
      mortgageMax: 3700,
      mortgageAssumptions: '$0 down, ~6.5% rate, ~1.0% property tax + insurance',
    },
    localHousingTips: {
      coliNote: 'roughly 25–30% above the national average',
      stateTaxNote: 'Virginia taxes military pay. The top marginal rate is 5.75%. BAH and BAS remain tax-free at the federal and state level.',
      neighborhoods: [
        {
          name: 'Stafford',
          highlight: 'Stafford County Schools — strong (7–8/10)',
          commute: '10–15 min to Quantico main gate',
          bestFor: 'Best balance of schools, commute, and price for Quantico',
          typicalRent3br: '$1,800–$2,300/mo',
        },
        {
          name: 'Dumfries / Triangle',
          highlight: 'Prince William County Schools — decent (6–7/10)',
          commute: '5–10 min to Quantico',
          bestFor: 'Closest to base, most affordable in the corridor',
          typicalRent3br: '$1,700–$2,200/mo',
        },
        {
          name: 'Fredericksburg',
          highlight: 'Spotsylvania / Stafford County — solid (7/10)',
          commute: '20–25 min to Quantico (I-95 dependent)',
          bestFor: 'Families wanting more space and lower prices',
          typicalRent3br: '$1,500–$2,000/mo',
        },
        {
          name: 'Woodbridge / Lake Ridge',
          highlight: 'Prince William County Schools — varies (6–8/10)',
          commute: '15–20 min to Quantico (north on I-95)',
          bestFor: 'Families wanting suburban amenities between Quantico and DC',
          typicalRent3br: '$2,000–$2,500/mo',
        },
      ],
      mistakeToAvoid:
        "Quantico sits on I-95 between DC and Fredericksburg — two of the worst commute corridors in America. The mistake is living north toward DC for nightlife and then sitting in 60+ minutes of I-95 traffic every morning. Stafford and Dumfries are closest to the gates. Fredericksburg is more affordable but adds commute time.",
    },
  },
  {
    name: 'Naval Station Great Lakes',
    slug: 'naval-station-great-lakes',
    zip: '60064',
    city: 'North Chicago',
    state: 'IL',
    stateName: 'Illinois',
    branches: ['Navy'],
    description:
      'Naval Station Great Lakes is the Navy\'s only boot camp and its largest training installation, producing all enlisted Navy recruits and hosting the Naval Health Sciences School.',
    rentalNote:
      'The North Chicago/Waukegan market on Lake Michigan\'s shore is moderately priced. BAH comfortably covers mid-range rentals, and the Chicago metro\'s rail access means some servicemembers commute from further south.',
    nearby: ['wright-patterson-afb', 'scott-afb', 'fort-knox'],
  },
  {
    name: 'Joint Base Little Creek-Fort Story',
    slug: 'joint-base-little-creek-fort-story',
    zip: '23459',
    city: 'Virginia Beach',
    state: 'VA',
    stateName: 'Virginia',
    branches: ['Navy', 'Army'],
    description:
      'JBLCFS is home to the Navy Expeditionary Combat Command and SEAL Team Six (DEVGRU), hosting the primary East Coast training and staging areas for amphibious and special operations.',
    rentalNote:
      'Virginia Beach is a popular coastal market with high demand. BAH is competitive for the region, and the oceanfront premium means many servicemembers choose neighborhoods further from the beach for better value.',
    nearby: ['naval-station-norfolk', 'naval-air-station-oceana', 'joint-base-langley-eustis'],
  },
  {
    name: 'Naval Submarine Base New London',
    slug: 'naval-submarine-base-new-london',
    zip: '06340',
    city: 'Groton',
    state: 'CT',
    stateName: 'Connecticut',
    branches: ['Navy'],
    description:
      'NSB New London is the U.S. Navy\'s primary submarine base and home to the Naval Submarine School, homeporting Virginia-class and Ohio-class submarines on the Thames River.',
    rentalNote:
      'Groton/New London is a mid-sized Connecticut market. BAH is elevated relative to national averages, reflecting Connecticut\'s high cost of living, and covers most mid-range rentals comfortably.',
    nearby: ['naval-station-newport', 'fort-hamilton', 'joint-base-mcguire-dix-lakehurst'],
  },
  {
    name: 'MCAS Beaufort',
    slug: 'marine-corps-air-station-beaufort',
    zip: '29902',
    city: 'Beaufort',
    state: 'SC',
    stateName: 'South Carolina',
    branches: ['Marine Corps', 'Navy'],
    description:
      'MCAS Beaufort is home to Marine Fighter Attack Training Squadron 501 and F-35B operational squadrons, located on Port Royal Sound in the South Carolina Lowcountry.',
    rentalNote:
      'Beaufort is a small coastal market with a charming historic district. BAH typically covers local rents, and the Lowcountry lifestyle makes the assignment popular despite the small market.',
    nearby: ['fort-jackson', 'fort-stewart', 'naval-station-mayport'],
  },
  {
    name: 'Joint Base McGuire-Dix-Lakehurst',
    slug: 'joint-base-mcguire-dix-lakehurst',
    zip: '08640',
    city: 'Wrightstown',
    state: 'NJ',
    stateName: 'New Jersey',
    branches: ['Air Force', 'Army', 'Navy'],
    description:
      'JB MDL puts you in central New Jersey — close to Philadelphia, the Jersey Shore, and a train ride from NYC. BAH covers rent comfortably in the surrounding communities, but NJ\'s high property taxes make homeownership math tricky. Most families rent and enjoy the location advantages.',
    installationDetail:
      'JB McGuire-Dix-Lakehurst is the only joint base in the Department of Defense combining Air Force, Army, and Navy installations — located in south-central New Jersey between Philadelphia and the Jersey Shore.',
    rentalNote:
      "JB MDL is in the New Jersey portion of the Philadelphia/South Jersey MHA. Burlington and Ocean counties are among NJ's more affordable markets — but NJ property taxes are brutal. Run full PITI numbers before buying.",
    rentalContext:
      'NJ property taxes ($8,000–$12,000/year on a modest home) make homeownership more expensive than it appears — rent first, learn the market.',
    nearby: ['fort-hamilton', 'naval-submarine-base-new-london', 'joint-base-cape-cod'],
    bahVsHousing: {
      medianRent: 1800,
      medianRentSource: 'PCSgrades / Zillow 2025–2026',
      medianHomePrice: 350000,
      medianHomePriceSource: 'Zillow / Redfin 2026',
      mortgageMin: 2700,
      mortgageMax: 3000,
      mortgageAssumptions: '$0 down, ~6.5% rate, ~2.2% NJ property tax + insurance',
    },
    localHousingTips: {
      coliNote: 'roughly 10–15% above the national average (driven by NJ property taxes)',
      stateTaxNote: 'New Jersey taxes military pay at up to 10.75% at the top marginal rate. However, active-duty military domiciled outside NJ are generally exempt. NJ property taxes are among the highest in the nation — factor this into any buy decision.',
      neighborhoods: [
        {
          name: 'Mount Holly / Lumberton',
          highlight: 'Rancocas Valley Regional — decent (6–7/10)',
          commute: '10–15 min to McGuire gate',
          bestFor: 'Affordable small towns close to base',
          typicalRent3br: '$1,500–$1,900/mo',
        },
        {
          name: 'Medford',
          highlight: 'Medford Township Schools — strong (7–8/10)',
          commute: '20–25 min to McGuire gate',
          bestFor: 'Families wanting top schools in a charming town',
          typicalRent3br: '$1,800–$2,300/mo',
        },
        {
          name: 'Browns Mills / Pemberton',
          highlight: 'Pemberton Township Schools — mixed (5–6/10)',
          commute: '5–10 min to Dix gate',
          bestFor: 'Most affordable and closest to base',
          typicalRent3br: '$1,200–$1,600/mo',
        },
        {
          name: 'Bordentown / Hamilton',
          highlight: 'Bordentown Regional — solid (7/10)',
          commute: '20–25 min to McGuire',
          bestFor: 'Families wanting access to Trenton/NJ Transit train corridor',
          typicalRent3br: '$1,600–$2,100/mo',
        },
      ],
      mistakeToAvoid:
        'NJ property taxes are brutal — often $8,000–$12,000/year on a modest home. The mistake is buying without factoring taxes into your PITI. What looks affordable as a mortgage becomes much less so when you add $800–$1,000/month in property taxes. Rent first, learn the market, and run the full numbers before buying.',
    },
  },
  {
    name: 'Naval Air Station Oceana',
    slug: 'naval-air-station-oceana',
    zip: '23460',
    city: 'Virginia Beach',
    state: 'VA',
    stateName: 'Virginia',
    branches: ['Navy'],
    description:
      'NAS Oceana puts you in Virginia Beach — great schools, beach lifestyle, and a strong military community. BAH covers most VB neighborhoods comfortably, though oceanfront areas push past the allowance. The Virginia Beach school system is one of the stronger districts in Hampton Roads.',
    installationDetail:
      "NAS Oceana is the Navy's East Coast master jet base — home to 17 strike fighter squadrons flying F/A-18E/F Super Hornets, the largest concentration of tactical aircraft on the East Coast.",
    rentalNote:
      'Virginia Beach BAH is competitive for the Hampton Roads market. The premium beach neighborhoods can strain lower-grade BAH, but the Kempsville, Great Neck, and Landstown areas offer more affordable options 10–15 minutes from the Oceana gates.',
    rentalContext:
      'the Kempsville and Landstown areas of Virginia Beach offer the best value for Oceana families — significantly more affordable than oceanfront neighborhoods while still in VB.',
    nearby: ['naval-station-norfolk', 'joint-base-little-creek-fort-story', 'joint-base-langley-eustis'],
    bahVsHousing: {
      medianRent: 1800,
      medianRentSource: 'Zillow / Zumper 2025–2026',
      medianHomePrice: 370000,
      medianHomePriceSource: 'Zillow / Redfin 2026',
      mortgageMin: 2500,
      mortgageMax: 2800,
      mortgageAssumptions: '$0 down, ~6.5% rate, ~1.0% property tax + insurance',
    },
    localHousingTips: {
      coliNote: 'roughly 5–8% above the national average',
      stateTaxNote: 'Virginia taxes military pay. The top marginal rate is 5.75%. BAH and BAS remain tax-free at the federal and state level.',
      neighborhoods: [
        {
          name: 'Kempsville / Landstown',
          highlight: 'Virginia Beach City Schools — strong (7–8/10)',
          commute: '10–15 min to Oceana',
          bestFor: 'Best value in VB with good schools and base access',
          typicalRent3br: '$1,500–$1,900/mo',
        },
        {
          name: 'Great Neck / Shore Drive',
          highlight: 'Virginia Beach City Schools — strong (7–8/10)',
          commute: '10–15 min to Oceana',
          bestFor: 'Waterfront feel near Chesapeake Bay',
          typicalRent3br: '$1,700–$2,200/mo',
        },
        {
          name: 'Chesapeake (Great Bridge)',
          highlight: 'Chesapeake Public Schools — strong (7–8/10)',
          commute: '15–20 min to Oceana',
          bestFor: 'Families wanting more space at slightly lower cost',
          typicalRent3br: '$1,500–$1,900/mo',
        },
        {
          name: 'Oceanfront / Town Center',
          highlight: 'Virginia Beach City Schools — varies',
          commute: '10–15 min to Oceana',
          bestFor: 'Singles or couples wanting walkable beach/urban lifestyle',
          typicalRent3br: '$1,800–$2,500/mo',
        },
      ],
      mistakeToAvoid:
        "NAS Oceana shares the Norfolk/Portsmouth MHA with Naval Station Norfolk, but Oceana is in Virginia Beach — which means higher rents than Norfolk proper. The mistake is assuming Norfolk BAH covers Virginia Beach beach-area rents. The Kempsville, Great Neck, and Landstown areas of VB offer more affordable options 10–15 minutes from the Oceana gates.",
    },
  },
  {
    name: 'Naval Base Ventura County',
    slug: 'naval-base-ventura-county',
    zip: '93041',
    city: 'Port Hueneme',
    state: 'CA',
    stateName: 'California',
    branches: ['Navy'],
    description:
      'NBVC hosts Naval Air Station Point Mugu and Naval Construction Battalion Center Port Hueneme, supporting aircraft testing, the Pacific Seabees, and Naval Air Warfare Center Weapons Division.',
    rentalNote:
      'Port Hueneme and Oxnard are among the more affordable Ventura County communities, but Southern California BAH rates are needed to compete in this market. BAH covers most rents but leaves little surplus.',
    nearby: ['camp-pendleton', 'naval-station-san-diego', 'travis-afb'],
  },
  {
    name: 'MCAGCC Twentynine Palms',
    slug: 'marine-corps-air-ground-combat-center',
    zip: '92277',
    city: 'Twentynine Palms',
    state: 'CA',
    stateName: 'California',
    branches: ['Marine Corps'],
    description:
      'The Marine Corps Air Ground Combat Center Twentynine Palms is the world\'s largest Marine Corps base and the home of large-scale combined-arms training in the Mojave Desert.',
    rentalNote:
      'Twentynine Palms is an isolated desert market with very limited rental inventory. On-post housing is the norm for most Marines; off-post options in the 29 Palms/Yucca Valley area are affordable but sparse.',
    nearby: ['camp-pendleton', 'fort-irwin', 'marine-corps-air-station-miramar'],
  },
  {
    name: 'Naval Station Newport',
    slug: 'naval-station-newport',
    zip: '02841',
    city: 'Newport',
    state: 'RI',
    stateName: 'Rhode Island',
    branches: ['Navy'],
    description:
      'Naval Station Newport is home to the Naval War College, Naval Undersea Warfare Center, and Surface Warfare Officers School, located on Aquidneck Island in Rhode Island.',
    rentalNote:
      'Newport is a high-cost New England coastal market. BAH is elevated to reflect Rhode Island\'s costs, and the historic Newport area commands premium rents — many servicemembers look to Middletown or Portsmouth for more affordable options.',
    nearby: ['naval-submarine-base-new-london', 'joint-base-mcguire-dix-lakehurst', 'joint-base-cape-cod'],
  },

  // ── MULTI-BRANCH ──────────────────────────────────────────────────────────
  {
    name: 'Joint Base Myer-Henderson Hall',
    slug: 'joint-base-myer-henderson-hall',
    zip: '22201',
    city: 'Arlington',
    state: 'VA',
    stateName: 'Virginia',
    branches: ['Army'],
    description:
      'JBMHH is the Army installation adjacent to the Pentagon, home of the 3rd U.S. Infantry Regiment ("The Old Guard"), Arlington National Cemetery, and multiple senior headquarters commands.',
    rentalNote:
      'Arlington is one of the most expensive markets in the DC area. BAH is among the highest in the country for the DC MHA, but Northern Virginia rents are equally extreme — many senior members find tight coverage at lower grades.',
    nearby: ['fort-meade', 'joint-base-andrews', 'marine-corps-base-quantico'],
  },
  {
    name: 'Joint Base Charleston',
    slug: 'joint-base-charleston',
    zip: '29405',
    city: 'North Charleston',
    state: 'SC',
    stateName: 'South Carolina',
    branches: ['Air Force', 'Navy'],
    description:
      "JB Charleston puts you in one of the Southeast's most charming cities — historic downtown, beaches, and a nationally recognized food scene. The trade-off is cost: Charleston's housing market has appreciated significantly and BAH doesn't stretch as far as at most Air Force bases. Look north and west of the base for the best value.",
    installationDetail:
      "JB Charleston is the Air Force's primary East Coast airlift hub — home to the 437th Airlift Wing flying C-17 Globemaster IIIs, plus a Navy Weapons Station.",
    rentalNote:
      "Charleston is a growing coastal market with rising rents. BAH covers most mid-range apartments, but the city's popularity with transplants has added pricing pressure. North Charleston, Goose Creek, and Summerville are where BAH actually goes the distance.",
    rentalContext:
      'North Charleston, Goose Creek, and Summerville offer strong military communities at prices BAH can cover — downtown Charleston and Mount Pleasant will test your limits.',
    nearby: ['marine-corps-air-station-beaufort', 'fort-jackson', 'fort-stewart'],
    bahVsHousing: {
      medianRent: 2000,
      medianRentSource: 'RentCafe / Zumper 2025–2026',
      medianHomePrice: 420000,
      medianHomePriceSource: 'Zillow / Redfin 2026',
      mortgageMin: 2700,
      mortgageMax: 3000,
      mortgageAssumptions: '$0 down, ~6.5% rate, ~0.6% SC property tax + insurance',
    },
    localHousingTips: {
      coliNote: 'roughly 10–15% above the national average (coastal premium)',
      stateTaxNote: 'South Carolina taxes military pay at up to 6.5%. However, SC has one of the lowest property tax rates in the country. BAH and BAS remain tax-free.',
      neighborhoods: [
        {
          name: 'Goose Creek',
          highlight: 'Berkeley County Schools — decent (6–7/10)',
          commute: '10–15 min to JB Charleston',
          bestFor: 'Most popular military neighborhood — affordable and close',
          typicalRent3br: '$1,500–$1,900/mo',
        },
        {
          name: 'Summerville',
          highlight: 'Dorchester District 2 — strong (7–8/10)',
          commute: '20–25 min to JB Charleston',
          bestFor: 'Families wanting better schools and a charming downtown',
          typicalRent3br: '$1,600–$2,100/mo',
        },
        {
          name: 'North Charleston',
          highlight: 'Charleston County — mixed (5–7/10)',
          commute: '10–15 min to JB Charleston',
          bestFor: 'Most affordable option near base',
          typicalRent3br: '$1,400–$1,800/mo',
        },
        {
          name: 'Mount Pleasant',
          highlight: 'Charleston County — strong in this zone (7–8/10)',
          commute: '20–30 min to JB Charleston',
          bestFor: 'Families willing to pay more for beach proximity and top schools',
          typicalRent3br: '$2,200–$2,800/mo',
        },
      ],
      mistakeToAvoid:
        "Charleston is one of the most desirable cities in the Southeast, and housing prices reflect it. The mistake is looking only at downtown Charleston or Mount Pleasant — both are beautiful but will blow past your BAH. North Charleston, Goose Creek, and Summerville offer strong military communities at prices BAH can actually cover.",
    },
  },
  {
    name: 'Joint Base Cape Cod',
    slug: 'joint-base-cape-cod',
    zip: '02532',
    city: 'Bourne',
    state: 'MA',
    stateName: 'Massachusetts',
    branches: ['Air Force', 'Army', 'Coast Guard'],
    description:
      'Joint Base Cape Cod is a multi-service installation on Cape Cod hosting the 102nd Intelligence Wing, Army Reserve, and Coast Guard, located near the Cape Cod Canal.',
    rentalNote:
      'Cape Cod BAH reflects the high cost of coastal Massachusetts. Seasonal tourism drives rental prices, and year-round options are limited. Many servicemembers commute from the Brockton or Plymouth areas for better value.',
    nearby: ['naval-station-newport', 'naval-submarine-base-new-london', 'joint-base-mcguire-dix-lakehurst'],
  },

  // ── OCONUS (OHA, not BAH) ──────────────────────────────────────────────────
  {
    name: 'Yokota Air Base',
    slug: 'yokota-air-base',
    zip: '',
    city: 'Fussa',
    state: 'JP',
    stateName: 'Japan',
    branches: ['Air Force'],
    description:
      'Yokota AB is the headquarters for U.S. Forces Japan and 5th Air Force, located in the western Tokyo metropolitan area. Members assigned here receive Overseas Housing Allowance (OHA), not BAH.',
    rentalNote:
      'OCONUS members receive OHA, which is calculated differently than BAH. The Tokyo metro is one of the most expensive markets in the world — verify your OHA entitlement through your gaining unit\'s housing office.',
    nearby: ['kadena-air-base', 'camp-humphreys', 'joint-base-pearl-harbor-hickam'],
    oconus: true,
  },
  {
    name: 'Kadena Air Base',
    slug: 'kadena-air-base',
    zip: '',
    city: 'Okinawa',
    state: 'JP',
    stateName: 'Japan',
    branches: ['Air Force', 'Army', 'Marine Corps', 'Navy'],
    description:
      'Kadena is the largest U.S. Air Force base in Asia, home to the 18th Wing, located on Okinawa and serving as a keystone of the Pacific air defense network.',
    rentalNote:
      'OCONUS members at Kadena receive Overseas Housing Allowance (OHA), not BAH. Okinawa off-base housing ranges from affordable local neighborhoods to Japanese-style homes. Contact the housing referral office at your gaining unit.',
    nearby: ['yokota-air-base', 'camp-humphreys', 'joint-base-pearl-harbor-hickam'],
    oconus: true,
  },
  {
    name: 'Camp Humphreys (K-6)',
    slug: 'camp-humphreys',
    zip: '',
    city: 'Pyeongtaek',
    state: 'KR',
    stateName: 'South Korea',
    branches: ['Army', 'Air Force'],
    description:
      'Camp Humphreys is the U.S. military headquarters in South Korea and the largest U.S. overseas military base in the world, hosting U.S. Forces Korea and 8th Army headquarters.',
    rentalNote:
      'Most servicemembers at Camp Humphreys live on base. OCONUS members receive Overseas Housing Allowance (OHA) if living off-base. The South Korean Won market and local lease norms are significantly different from U.S. practices — always work through the housing office.',
    nearby: ['yokota-air-base', 'kadena-air-base', 'joint-base-pearl-harbor-hickam'],
    oconus: true,
  },
  {
    name: 'Ramstein Air Base',
    slug: 'ramstein-air-base',
    zip: '',
    city: 'Ramstein-Miesenbach',
    state: 'DE',
    stateName: 'Germany',
    branches: ['Air Force', 'Army'],
    description:
      'Ramstein AB hosts U.S. Air Forces in Europe and Air Forces Africa (USAFE-AFAFRICA) and serves as the hub of U.S. military operations in Europe, located in the Kaiserslautern Military Community.',
    rentalNote:
      'OCONUS members at Ramstein receive Overseas Housing Allowance (OHA). The KMC (Kaiserslautern Military Community) is a large American community with a developed off-base rental market — your gaining unit\'s housing office has current rates.',
    nearby: ['yokota-air-base', 'camp-humphreys', 'joint-base-andrews'],
    oconus: true,
  },

  // ── ARMY (additional) ─────────────────────────────────────────────────────
  {
    name: 'Fort Rucker',
    slug: 'fort-rucker',
    formerName: 'Fort Novosel (2023–2025)',
    zip: '36362',
    city: 'Daleville',
    state: 'AL',
    stateName: 'Alabama',
    branches: ['Army'],
    description:
      'Fort Rucker is one of the most affordable Army installations. The Wiregrass region of southeast Alabama has a very low cost of living, and BAH creates a substantial surplus at every pay grade. Most residents are flight school students on shorter tours — renting is the default, and the surplus is significant.',
    installationDetail:
      "Fort Rucker is the Home of Army Aviation — the U.S. Army Aviation Center of Excellence where virtually every Army helicopter pilot earns their wings, located in southeast Alabama's Wiregrass region.",
    rentalNote:
      'Daleville and Ozark offer affordable housing near the gate. Dothan to the south provides more options — rents are well below national averages. Enterprise has the strongest schools and most amenities in the area.',
    rentalContext:
      'the Wiregrass region has some of the lowest housing costs of any Army installation — BAH creates a substantial surplus at every pay grade.',
    nearby: ['fort-benning', 'maxwell-afb', 'naval-air-station-pensacola'],
    bahVsHousing: {
      medianRent: 1000,
      medianRentSource: 'Zillow / BestPlaces 2025–2026',
      medianHomePrice: 180000,
      medianHomePriceSource: 'Zillow / BestPlaces 2026',
      mortgageMin: 1300,
      mortgageMax: 1500,
      mortgageAssumptions: '$0 down, ~6.5% rate, ~0.5% AL property tax + insurance',
    },
    localHousingTips: {
      coliNote: 'roughly 18–22% below the national average',
      stateTaxNote: "Alabama taxes military pay at up to 5.0%. However, Alabama's property taxes are among the lowest in the nation. BAH and BAS remain tax-free.",
      neighborhoods: [
        {
          name: 'Daleville',
          highlight: 'Dale County Schools — decent (6/10)',
          commute: '5 min to main gate',
          bestFor: 'Walking distance to gate, flight school convenience',
          typicalRent3br: '$700–$1,000/mo',
        },
        {
          name: 'Enterprise',
          highlight: 'Enterprise City Schools — strong for the area (7/10)',
          commute: '15–20 min to main gate',
          bestFor: 'Best schools and most amenities in the Wiregrass',
          typicalRent3br: '$800–$1,100/mo',
        },
        {
          name: 'Ozark',
          highlight: 'Ozark City Schools — decent (6/10)',
          commute: '10–15 min to main gate',
          bestFor: 'Small-town option close to base',
          typicalRent3br: '$700–$1,000/mo',
        },
        {
          name: 'Dothan',
          highlight: 'Dothan City Schools — solid (7/10)',
          commute: '20–25 min to main gate',
          bestFor: 'Largest nearby city with the most shopping and dining',
          typicalRent3br: '$900–$1,200/mo',
        },
      ],
      mistakeToAvoid:
        "Fort Rucker is rural and isolated — Daleville and Ozark are tiny, and Dothan (the nearest real city) is 20 minutes south. The mistake is expecting amenities that don't exist. The upside: Alabama has some of the lowest property taxes in the country, and your BAH goes incredibly far. Enterprise and Dothan offer more options if you're willing to commute 15–20 minutes.",
    },
  },
  {
    name: 'Fort Lee',
    slug: 'fort-lee',
    formerName: 'Fort Gregg-Adams (2023–2025)',
    zip: '23801',
    city: 'Petersburg',
    state: 'VA',
    stateName: 'Virginia',
    branches: ['Army'],
    description: 'Fort Lee hosts the Army Combined Arms Support Command (CASCOM) and is the service\'s sustainment hub, home to the Quartermaster, Ordnance, and Transportation Schools.',
    rentalNote: 'Petersburg and Colonial Heights offer affordable mid-Atlantic housing. Richmond (~25 miles north) provides more inventory. Rents are modest for the Virginia market.',
    nearby: ['fort-belvoir', 'fort-meade', 'joint-base-langley-eustis'],
  },
  {
    name: 'Fort Leonard Wood',
    slug: 'fort-leonard-wood',
    zip: '65473',
    city: 'Waynesville',
    state: 'MO',
    stateName: 'Missouri',
    branches: ['Army'],
    description: 'Fort Leonard Wood hosts the Maneuver Support Center of Excellence (MANSCEN) and is home to the Engineer, Chemical, and Military Police schools — one of the Army\'s largest training installations.',
    rentalNote: 'Waynesville and St. Robert provide the most convenient housing. Lebanon and Rolla offer additional options. Rural Missouri rents run well below national averages.',
    nearby: ['scott-afb', 'whiteman-afb', 'fort-campbell'],
  },
  {
    name: 'Fort Belvoir',
    slug: 'fort-belvoir',
    zip: '22060',
    city: 'Alexandria',
    state: 'VA',
    stateName: 'Virginia',
    branches: ['Army'],
    description: 'Fort Belvoir is a major National Capital Region installation hosting the Defense Intelligence Agency, National Geospatial-Intelligence Agency, and numerous other defense organizations.',
    rentalNote: 'Northern Virginia housing (Springfield, Woodbridge, Lorton, Alexandria) is expensive and competitive. BAH reflects higher NoVA costs. Many personnel commute from Fredericksburg or Stafford for more affordable rents.',
    nearby: ['joint-base-myer-henderson-hall', 'joint-base-andrews', 'marine-corps-base-quantico'],
  },
  {
    name: 'Fort McCoy',
    slug: 'fort-mccoy',
    zip: '54656',
    city: 'Sparta',
    state: 'WI',
    stateName: 'Wisconsin',
    branches: ['Army'],
    description: 'Fort McCoy is a major Army Reserve and National Guard training center in western Wisconsin, operating as a power-projection platform for reserve component forces.',
    rentalNote: 'Sparta and Tomah provide the closest housing. The active-duty permanent-party population is small. The local rental market is very affordable by national standards.',
    nearby: ['naval-station-great-lakes', 'offutt-afb', 'minot-afb'],
  },
  {
    name: 'Fort Shafter',
    slug: 'fort-shafter',
    zip: '96819',
    city: 'Honolulu',
    state: 'HI',
    stateName: 'Hawaii',
    branches: ['Army'],
    description: 'Fort Shafter is the headquarters of U.S. Army Pacific (USARPAC) and the oldest active Army post in Hawaii, serving as the Army\'s command presence on Oahu.',
    rentalNote: 'The Honolulu/Oahu rental market is among the most expensive in the nation. BAH rates for Hawaii are significantly elevated. Aiea, Pearl City, and Ewa Beach offer more affordable options than Honolulu proper.',
    nearby: ['joint-base-pearl-harbor-hickam', 'schofield-barracks', 'mcb-hawaii'],
  },
  {
    name: 'Presidio of Monterey',
    slug: 'presidio-of-monterey',
    zip: '93940',
    city: 'Monterey',
    state: 'CA',
    stateName: 'California',
    branches: ['Army'],
    description: 'The Presidio of Monterey is home to the Defense Language Institute (DLI), the U.S. military\'s premier foreign language school, training linguists across all services in more than 25 languages.',
    rentalNote: 'Monterey Peninsula rents are high. Pacific Grove, Seaside, and Salinas offer lower-cost alternatives. BAH reflects the elevated Monterey/Salinas area market — plan accordingly before arrival.',
    nearby: ['travis-afb', 'naval-postgraduate-school', 'vandenberg-sfb'],
  },
  {
    name: 'Carlisle Barracks',
    slug: 'carlisle-barracks',
    zip: '17013',
    city: 'Carlisle',
    state: 'PA',
    stateName: 'Pennsylvania',
    branches: ['Army'],
    description: 'Carlisle Barracks is home to the U.S. Army War College, training senior military officers and civilian leaders in national security strategy and senior leadership.',
    rentalNote: 'Carlisle offers comfortable, affordable central Pennsylvania housing. Harrisburg (~20 miles east) provides more inventory. This is one of the more affordable mid-Atlantic duty stations.',
    nearby: ['fort-meade', 'joint-base-mcguire-dix-lakehurst', 'west-point'],
  },
  {
    name: 'Walter Reed National Military Medical Center',
    slug: 'walter-reed-nmmc',
    zip: '20814',
    city: 'Bethesda',
    state: 'MD',
    stateName: 'Maryland',
    branches: ['Army', 'Navy'],
    description: 'Walter Reed National Military Medical Center in Bethesda is the flagship military hospital, providing tertiary care to senior DoD officials, combat-injured servicemembers, and their families.',
    rentalNote: 'Bethesda and northern Maryland carry some of the highest rents in the National Capital Region. Silver Spring, Rockville, and Gaithersburg offer relatively more affordable options. BAH reflects the elevated DC-area market.',
    nearby: ['joint-base-myer-henderson-hall', 'joint-base-andrews', 'fort-meade'],
  },
  {
    name: 'Fort McNair',
    slug: 'fort-mcnair',
    zip: '20319',
    city: 'Washington',
    state: 'DC',
    stateName: 'District of Columbia',
    branches: ['Army'],
    description: 'Fort McNair in Washington, D.C., is home to the National Defense University (NDU) and is one of the oldest continuously operated U.S. Army installations, hosting senior defense leadership organizations.',
    rentalNote: 'DC rents are high across all neighborhoods. Anacostia/Navy Yard, Northern Virginia suburbs, and Maryland communities all have options. BAH reflects full DC market rates.',
    nearby: ['joint-base-anacostia-bolling', 'joint-base-myer-henderson-hall', 'joint-base-andrews'],
  },

  // ── AIR FORCE / SPACE FORCE (additional) ──────────────────────────────────
  {
    name: 'McConnell AFB',
    slug: 'mcconnell-afb',
    zip: '67221',
    city: 'Wichita',
    state: 'KS',
    stateName: 'Kansas',
    branches: ['Air Force'],
    description: 'McConnell AFB is home to the 22nd Air Refueling Wing and a key Air Mobility Command installation, also hosting the Kansas Air National Guard\'s 184th Intelligence Wing.',
    rentalNote: 'Wichita offers affordable housing with good inventory. McConnell is consistently one of the lower-cost Air Force duty stations — BAH typically covers most rental options comfortably.',
    nearby: ['fort-leavenworth', 'fort-riley', 'tinker-afb'],
  },
  {
    name: 'Nellis AFB',
    slug: 'nellis-afb',
    zip: '89115',
    city: 'Las Vegas',
    state: 'NV',
    stateName: 'Nevada',
    branches: ['Air Force'],
    description:
      'Nellis AFB puts you in Las Vegas — no state income tax, 300+ days of sunshine, and more entertainment than any other duty station. The northeast valley near base is more affordable than the Strip corridor, and BAH covers rent with a modest buffer. The outdoor recreation (Red Rock Canyon, Lake Mead, skiing at Mt. Charleston) surprises most newcomers.',
    installationDetail:
      "Nellis AFB is home to the USAF Weapons School and the famous Red Flag exercises — the Air Force's premier air combat training center in the Nevada desert outside Las Vegas.",
    rentalNote:
      "Las Vegas has ample rental inventory. North Las Vegas and Aliante are closest to Nellis, with Henderson and Summerlin offering better schools further west. Nevada's no-income-tax advantage is a meaningful financial benefit.",
    rentalContext:
      'Nevada has no state income tax, and the northeast Las Vegas valley near Nellis is more affordable than the Strip corridor or west-side suburbs.',
    nearby: ['nas-fallon', 'edwards-afb', 'kirtland-afb'],
    bahVsHousing: {
      medianRent: 1700,
      medianRentSource: 'Niche / Zillow 2025–2026',
      medianHomePrice: 400000,
      medianHomePriceSource: 'Zillow / Redfin 2026',
      mortgageMin: 2700,
      mortgageMax: 3000,
      mortgageAssumptions: '$0 down, ~6.5% rate, ~0.7% NV property tax + insurance',
    },
    localHousingTips: {
      coliNote: 'roughly 5–10% above the national average',
      stateTaxNote: 'Nevada has no state income tax — a significant advantage that puts more of your paycheck in your pocket.',
      neighborhoods: [
        {
          name: 'North Las Vegas / Aliante',
          highlight: 'Clark County Schools — varies, Aliante zone is newer (6–7/10)',
          commute: '10–15 min to Nellis gate',
          bestFor: 'Closest to base with newer master-planned communities',
          typicalRent3br: '$1,400–$1,800/mo',
        },
        {
          name: 'Centennial Hills',
          highlight: 'Clark County Schools — strong in this zone (7–8/10)',
          commute: '15–20 min to Nellis gate',
          bestFor: 'Families wanting better schools and suburban feel',
          typicalRent3br: '$1,600–$2,100/mo',
        },
        {
          name: 'Henderson',
          highlight: 'Clark County — Henderson zone is strong (7–8/10)',
          commute: '25–35 min to Nellis (across the valley)',
          bestFor: 'Families willing to commute for a quieter, upscale suburb',
          typicalRent3br: '$1,700–$2,200/mo',
        },
        {
          name: 'Summerlin',
          highlight: 'Clark County — Summerlin zone is top-rated (8/10)',
          commute: '30–40 min to Nellis (west side)',
          bestFor: 'Best schools in Vegas but long commute to Nellis',
          typicalRent3br: '$1,900–$2,500/mo',
        },
      ],
      mistakeToAvoid:
        "Nellis is on the northeast side of Las Vegas, and the Strip is 15 miles south. The mistake is living near the Strip for the entertainment and then dealing with tourist traffic and high rents. North Las Vegas, Aliante, and Centennial Hills are all within 15 minutes of Nellis with family-friendly neighborhoods at prices BAH actually covers.",
    },
  },
  {
    name: 'Hill AFB',
    slug: 'hill-afb',
    zip: '84401',
    city: 'Ogden',
    state: 'UT',
    stateName: 'Utah',
    branches: ['Air Force'],
    description:
      "Hill AFB puts you along the Wasatch Front — stunning mountain views, world-class skiing within an hour, and a growing metro area. Utah's housing market has appreciated substantially, but the areas immediately surrounding Hill (Layton, Clearfield, Roy) remain more affordable than Salt Lake City proper. BAH covers rent comfortably.",
    installationDetail:
      "Hill AFB is home to the Ogden Air Logistics Complex and the 388th Fighter Wing — the Air Force's first operational F-35A Lightning II unit, located between Ogden and Salt Lake City.",
    rentalNote:
      "Ogden, Layton, and Clearfield are the most convenient housing areas. Utah's housing market has appreciated significantly since 2020 — verify current prices before assuming affordability. Layton immediately south of base has the best Davis School District schools.",
    rentalContext:
      'the Layton-Clearfield corridor immediately adjacent to Hill offers more affordable options than Salt Lake City, with excellent Davis School District schools.',
    nearby: ['fe-warren-afb', 'peterson-sfb', 'kirtland-afb'],
    bahVsHousing: {
      medianRent: 1600,
      medianRentSource: 'Zillow / BestPlaces 2025–2026',
      medianHomePrice: 420000,
      medianHomePriceSource: 'Zillow / Redfin 2026',
      mortgageMin: 2800,
      mortgageMax: 3100,
      mortgageAssumptions: '$0 down, ~6.5% rate, ~0.6% UT property tax + insurance',
    },
    localHousingTips: {
      coliNote: 'roughly 5–8% above the national average',
      stateTaxNote: 'Utah has a flat income tax of 4.65% on military pay. BAH and BAS remain tax-free.',
      neighborhoods: [
        {
          name: 'Layton',
          highlight: 'Davis School District — excellent (8–9/10)',
          commute: '5–10 min to Hill south gate',
          bestFor: 'Top pick for families — best schools and closest to base',
          typicalRent3br: '$1,400–$1,800/mo',
        },
        {
          name: 'Clearfield',
          highlight: 'Davis School District — strong (7–8/10)',
          commute: '5–10 min to Hill south gate',
          bestFor: 'Most affordable option immediately adjacent to base',
          typicalRent3br: '$1,200–$1,600/mo',
        },
        {
          name: 'Roy / Sunset',
          highlight: 'Weber School District — decent (6–7/10)',
          commute: '5–10 min to Hill west gate',
          bestFor: 'Affordable west-side option with quick base access',
          typicalRent3br: '$1,100–$1,500/mo',
        },
        {
          name: 'Ogden',
          highlight: 'Ogden City Schools / Weber — varies (5–7/10)',
          commute: '10–15 min to Hill gate',
          bestFor: 'Those wanting downtown restaurants, breweries, and mountain access',
          typicalRent3br: '$1,300–$1,700/mo',
        },
      ],
      mistakeToAvoid:
        "Hill AFB sits between Ogden and Salt Lake City, and both directions have appeal. The mistake is defaulting to Ogden without exploring Layton and Clearfield, which are immediately adjacent to base with newer construction and strong schools. Also, Utah's housing market has appreciated significantly — don't assume 2020 prices still apply.",
    },
  },
  {
    name: 'Peterson Space Force Base',
    slug: 'peterson-sfb',
    zip: '80914',
    city: 'Colorado Springs',
    state: 'CO',
    stateName: 'Colorado',
    branches: ['Space Force', 'Air Force'],
    description:
      'An E-5 with dependents at Peterson SFB receives $2,058/month in tax-free BAH. Peterson shares the Colorado Springs Military Housing Area with Fort Carson, Schriever SFB, and the Air Force Academy. Median 3-bedroom rent in the Colorado Springs area is approximately $1,825/month. (Rental data: PCS Pay It Forward / Zillow 2025–2026)',
    installationDetail:
      'Peterson SFB is the nerve center of U.S. military space operations — home to Space Operations Command, U.S. Northern Command (NORTHCOM), and NORAD.',
    rentalNote:
      'Colorado Springs shares its MHA with three other major installations — competition for housing is real. The Powers Corridor east of base offers the best balance of commute time and price, but inventory moves fast. Start your search 60–90 days before PCS.',
    rentalContext:
      "Colorado Springs' cost of living is approximately 12–15% above the national average. (Cost of living data: BestPlaces 2025–2026)",
    nearby: ['schriever-sfb', 'usaf-academy', 'buckley-sfb'],
    bahVsHousing: {
      medianRent: 1825,
      medianRentSource: 'PCS Pay It Forward / Zillow 2025–2026',
      medianHomePrice: 460000,
      medianHomePriceSource: 'Zillow / Redfin 2026',
      mortgageMin: 3000,
      mortgageMax: 3300,
      mortgageAssumptions: '$0 down, ~6.5% rate, ~0.6% property tax + insurance',
    },
    localHousingTips: {
      coliNote: 'roughly 12–15% above the national average',
      stateTaxNote: 'Colorado has a flat income tax of 4.40% on military pay. BAH and BAS remain tax-free.',
      neighborhoods: [
        {
          name: 'Powers Corridor (east)',
          highlight: 'Falcon District 49 — growing, decent (6–7/10)',
          commute: '10–15 min to Peterson West Gate',
          bestFor: 'Peterson-assigned families balancing commute and housing costs',
          typicalRent3br: '$1,600–$2,100/mo',
        },
        {
          name: 'Briargate / Northgate',
          highlight: 'Academy District 20 — top-rated (8–9/10)',
          commute: '15–20 min to Peterson',
          bestFor: 'Families with school-age children',
          typicalRent3br: '$2,100–$2,800/mo',
        },
        {
          name: 'Falcon / Peyton',
          highlight: 'Falcon District 49 — newer schools',
          commute: '15–20 min to Peterson',
          bestFor: 'Families seeking newer construction',
          typicalRent3br: '$1,500–$2,000/mo',
        },
        {
          name: 'Downtown Colorado Springs',
          highlight: 'District 11 — mixed (5–7/10)',
          commute: '10–15 min to Peterson',
          bestFor: 'Service members without dependents',
          typicalRent3br: '$1,400–$1,900/mo',
        },
      ],
      mistakeToAvoid:
        'Peterson SFB shares the Colorado Springs Military Housing Area with Fort Carson, Schriever SFB, and the U.S. Air Force Academy. The combined military population creates consistent demand for rental housing across the market. Families who begin their housing search 60–90 days before a PCS report date generally have more options available. (Market context: PCS Pay It Forward / Zillow 2025–2026)',
    },
  },
  {
    name: 'Schriever Space Force Base',
    slug: 'schriever-sfb',
    zip: '80912',
    city: 'Colorado Springs',
    state: 'CO',
    stateName: 'Colorado',
    branches: ['Space Force'],
    description:
      'Schriever SFB shares the Colorado Springs MHA with Peterson, Fort Carson, and USAFA. The base itself is isolated east of the city, so commute direction matters more here than at other Colorado Springs installations. Families stationed at Schriever should look east — Falcon and Peyton offer the best balance.',
    installationDetail:
      "Schriever SFB operates the GPS satellite constellation and multiple space surveillance systems — a critical node in the U.S. Space Force's global network, located east of Colorado Springs.",
    rentalNote:
      'The east side of Colorado Springs — Powers Corridor, Falcon, Peyton — is closest to Schriever with solid rental inventory at mid-range prices. Avoid living on the west side of the city, where commute times balloon past 30 minutes.',
    rentalContext:
      "living east of Colorado Springs (Falcon/Peyton) cuts your commute to Schriever significantly compared to the popular west-side neighborhoods.",
    nearby: ['peterson-sfb', 'usaf-academy', 'buckley-sfb'],
    bahVsHousing: {
      medianRent: 1825,
      medianRentSource: 'PCS Pay It Forward / Zillow 2025–2026',
      medianHomePrice: 460000,
      medianHomePriceSource: 'Zillow / Redfin 2026',
      mortgageMin: 3000,
      mortgageMax: 3300,
      mortgageAssumptions: '$0 down, ~6.5% rate, ~0.6% property tax + insurance',
    },
    localHousingTips: {
      coliNote: 'roughly 12–15% above the national average',
      stateTaxNote: 'Colorado has a flat income tax of 4.40% on military pay. BAH and BAS remain tax-free.',
      neighborhoods: [
        {
          name: 'Falcon / Peyton',
          highlight: 'Falcon District 49 — growing, newer schools (6–7/10)',
          commute: '10–15 min to Schriever gate',
          bestFor: 'Closest to Schriever with best commute',
          typicalRent3br: '$1,500–$2,000/mo',
        },
        {
          name: 'Powers Corridor (east)',
          highlight: 'Falcon District 49 — decent',
          commute: '15–20 min to Schriever',
          bestFor: 'More shopping and dining access with reasonable commute',
          typicalRent3br: '$1,600–$2,100/mo',
        },
        {
          name: 'Ellicott / Calhan',
          highlight: 'Ellicott District 22 — small, rural (5–6/10)',
          commute: '10–15 min to Schriever',
          bestFor: 'Families wanting rural acreage and the shortest commute',
          typicalRent3br: '$1,200–$1,600/mo',
        },
      ],
      mistakeToAvoid:
        "Schriever is 10 miles east of Colorado Springs in a rural area — there's nothing near the base itself. The mistake is living too far west in Colorado Springs and having a 30+ minute commute through morning traffic. The Falcon, Peyton, and eastern Powers Corridor areas keep you closer to Schriever's gate while still having access to city amenities.",
    },
  },
  {
    name: 'Buckley Space Force Base',
    slug: 'buckley-sfb',
    zip: '80011',
    city: 'Aurora',
    state: 'CO',
    stateName: 'Colorado',
    branches: ['Space Force', 'Air Force'],
    description:
      "Buckley SFB has the highest BAH of any Space Force base, but it sits in the Denver metro where housing costs are elevated. Aurora — the immediate surrounding city — offers the best balance of price and proximity. The Denver metro's job market is a major advantage for military spouses.",
    installationDetail:
      'Buckley SFB carries the highest BAH of any Space Force installation in the country — home to Space Delta 4 (Missile Warning) in the Denver metro area.',
    rentalNote:
      'Aurora and the eastern Denver suburbs are the most convenient housing areas. Denver metro rents are competitive but more manageable than coastal cities. Centennial and Parker trade a slightly longer commute for significantly better schools.',
    rentalContext:
      'Aurora and the southeast Denver suburbs offer the best balance of commute and cost in this metro — Denver proper is significantly pricier.',
    nearby: ['peterson-sfb', 'schriever-sfb', 'fe-warren-afb'],
    bahVsHousing: {
      medianRent: 2000,
      medianRentSource: 'PCS Pay It Forward / Zillow 2025–2026',
      medianHomePrice: 450000,
      medianHomePriceSource: 'PCS Pay It Forward / Zillow 2026',
      mortgageMin: 2950,
      mortgageMax: 3200,
      mortgageAssumptions: '$0 down, ~6.5% rate, ~0.7% property tax + insurance',
    },
    localHousingTips: {
      coliNote: 'roughly 20–25% above the national average',
      stateTaxNote: 'Colorado has a flat income tax of 4.40% on military pay. BAH and BAS remain tax-free.',
      neighborhoods: [
        {
          name: 'Aurora (east/south)',
          highlight: 'Aurora Public Schools / Cherry Creek Schools — varies (5–8/10)',
          commute: '5–15 min to Buckley gate',
          bestFor: 'Shortest commute, most affordable near base',
          typicalRent3br: '$1,700–$2,200/mo',
        },
        {
          name: 'Centennial / Highlands Ranch',
          highlight: 'Cherry Creek Schools / Douglas County — excellent (8–9/10)',
          commute: '15–20 min to Buckley',
          bestFor: 'Families prioritizing top schools south of Denver',
          typicalRent3br: '$2,200–$2,800/mo',
        },
        {
          name: 'Parker / Castle Rock',
          highlight: 'Douglas County Schools — excellent (8–9/10)',
          commute: '20–30 min to Buckley',
          bestFor: 'Families wanting newer construction and suburban feel',
          typicalRent3br: '$2,000–$2,600/mo',
        },
        {
          name: 'Denver (southeast)',
          highlight: 'Denver Public Schools — varies widely',
          commute: '15–25 min to Buckley',
          bestFor: "Those wanting urban access to Denver's food and entertainment scene",
          typicalRent3br: '$1,900–$2,500/mo',
        },
      ],
      mistakeToAvoid:
        'Buckley is in Aurora, not Colorado Springs — it uses the Denver MHA, which has higher BAH but also higher costs. The mistake is house-hunting in Denver proper where prices are astronomical. Aurora itself and the southeast suburbs (Centennial, Parker, Castle Rock) offer much better value with 15–25 minute commutes to base.',
    },
  },
  {
    name: 'Cannon AFB',
    slug: 'cannon-afb',
    zip: '88101',
    city: 'Clovis',
    state: 'NM',
    stateName: 'New Mexico',
    branches: ['Air Force'],
    description: 'Cannon AFB is remote and won\'t win any \'best duty station\' awards — but your BAH goes further here than at almost any other Air Force base. Clovis is affordable, New Mexico exempts military pay from income tax, and the AFSOC mission means the community is tight. Use this assignment to save.',
    installationDetail: 'Cannon AFB is home to the 27th Special Operations Wing — Air Force Special Operations Command\'s only wing in the continental U.S., operating CV-22 Ospreys and AC-130J Ghostriders near Clovis, New Mexico.',
    rentalNote: 'Clovis is a small eastern New Mexico city with very affordable housing. BAH typically covers rent comfortably, often with room to spare — a favorable financial situation for most pay grades.',
    rentalContext: 'Clovis rents are among the lowest near any Air Force base, so even a small BAH surplus adds up fast',
    nearby: ['kirtland-afb', 'holloman-afb', 'goodfellow-afb'],
    bahVsHousing: {
      medianRent: 1000,
      medianRentSource: 'Zillow / BestPlaces 2025–2026',
      medianHomePrice: 210000,
      medianHomePriceSource: 'Zillow / BestPlaces 2026',
      mortgageMin: 1500,
      mortgageMax: 1700,
      mortgageAssumptions: '$0 down, ~6.5% rate, ~0.8% property tax + insurance',
    },
    localHousingTips: {
      coliNote: 'roughly 15–18% below the national average',
      stateTaxNote: 'New Mexico exempts active-duty military pay from state income tax. BAH and BAS are also tax-free.',
      neighborhoods: [
        {
          name: 'Clovis',
          highlight: 'Clovis Municipal Schools — decent (6/10)',
          commute: '10–15 min to Cannon gate',
          bestFor: 'Only real option — most housing, schools, and services',
          typicalRent3br: '$800–$1,100/mo',
        },
        {
          name: 'Portales',
          highlight: 'Portales Municipal Schools — decent, ENMU campus',
          commute: '20–25 min to Cannon gate',
          bestFor: 'College-town alternative with slightly different feel',
          typicalRent3br: '$700–$1,000/mo',
        },
        {
          name: 'On-base housing',
          highlight: 'Clovis Municipal Schools',
          commute: 'Walk or 2–3 min drive',
          bestFor: 'Families wanting community and convenience in a remote location',
          typicalRent3br: 'BAH covers 100%',
        },
      ],
      mistakeToAvoid: 'Cannon is consistently ranked among the least-desirable Air Force bases — Clovis is isolated, flat, and windy with limited amenities. The mistake is letting the reputation ruin the assignment. The AFSOC mission is elite, the BAH surplus is enormous, and the tight-knit community surprises most families. Budget for regular trips to Albuquerque (3.5 hours) or Lubbock (1.5 hours) and save aggressively.',
    },
  },
  {
    name: 'Dyess AFB',
    slug: 'dyess-afb',
    zip: '79601',
    city: 'Abilene',
    state: 'TX',
    stateName: 'Texas',
    branches: ['Air Force'],
    description: 'Dyess AFB is one of the most affordable Air Force bases. Abilene\'s cost of living is well below the national average, Texas has no income tax, and BAH creates substantial surplus at every pay grade. This is a saving-and-investing station — embrace the simplicity and build wealth.',
    installationDetail: 'Dyess AFB is home to the 7th Bomb Wing (B-1B Lancers) and the 317th Airlift Wing (C-130J Super Hercules) — one of only two bases operating the B-1B bomber, located in Abilene, Texas.',
    rentalNote: 'Abilene has a very affordable housing market. Dyess is consistently one of the lower-cost Air Force duty stations — BAH covers most rental options comfortably.',
    rentalContext: 'Abilene is one of the most affordable Air Force markets — save the difference aggressively',
    nearby: ['goodfellow-afb', 'sheppard-afb', 'joint-base-san-antonio'],
    bahVsHousing: {
      medianRent: 1000,
      medianRentSource: 'Zillow / BestPlaces 2025–2026',
      medianHomePrice: 195000,
      medianHomePriceSource: 'Zillow / BestPlaces 2026',
      mortgageMin: 1450,
      mortgageMax: 1650,
      mortgageAssumptions: '$0 down, ~6.5% rate, ~2.0% property tax + insurance',
    },
    localHousingTips: {
      coliNote: 'roughly 15–18% below the national average',
      stateTaxNote: 'Texas has no state income tax on military pay, meaning your BAH, base pay, and special pays go further here than in high-tax states.',
      neighborhoods: [
        {
          name: 'South Abilene (near base)',
          highlight: 'Abilene ISD — decent (6/10)',
          commute: '5–10 min to Dyess gate',
          bestFor: 'Shortest commute, established military community',
          typicalRent3br: '$800–$1,100/mo',
        },
        {
          name: 'Southwest Abilene',
          highlight: 'Wylie ISD — strong (7–8/10)',
          commute: '10–15 min to Dyess gate',
          bestFor: 'Best schools in the Abilene area',
          typicalRent3br: '$1,000–$1,300/mo',
        },
        {
          name: 'Buffalo Gap / Tuscola',
          highlight: 'Jim Ned CISD — small, solid',
          commute: '15–20 min to Dyess gate',
          bestFor: 'Families wanting rural Texas feel with acreage',
          typicalRent3br: '$900–$1,200/mo',
        },
      ],
      mistakeToAvoid: 'Abilene is a small West Texas city — the nearest major metro (Dallas-Fort Worth) is 3 hours east. The mistake is expecting big-city amenities. The upside: no state income tax, incredibly affordable housing, and BAH surplus that lets you save aggressively. The south side of Abilene near the base has the most convenient housing.',
    },
  },
  {
    name: 'Laughlin AFB',
    slug: 'laughlin-afb',
    zip: '78840',
    city: 'Del Rio',
    state: 'TX',
    stateName: 'Texas',
    branches: ['Air Force'],
    description: 'Laughlin AFB hosts the 47th Flying Training Wing and is one of the Air Force\'s primary undergraduate pilot training bases, training U.S. and international partner nation aviators.',
    rentalNote: 'Del Rio is a small Texas border city with extremely affordable housing. BAH typically exceeds local rents — families can live comfortably near the base without financial strain.',
    nearby: ['goodfellow-afb', 'dyess-afb', 'nas-corpus-christi'],
  },
  {
    name: 'Sheppard AFB',
    slug: 'sheppard-afb',
    zip: '76301',
    city: 'Wichita Falls',
    state: 'TX',
    stateName: 'Texas',
    branches: ['Air Force'],
    description: 'Sheppard AFB sits in Wichita Falls — one of the most affordable cities near any Air Force installation. The cost of living is 23% below the national average, and BAH creates a massive surplus. Most residents are students on temporary training, so the rental market is geared toward short-term flexibility.',
    installationDetail: 'Sheppard AFB is the largest technical training base in the Air Force — training over 60,000 students annually in aircraft maintenance, medical, and logistics career fields.',
    rentalNote: 'Wichita Falls offers affordable housing with good options near the base. The rental market is modest, and BAH typically provides solid coverage of local costs.',
    rentalContext: 'Wichita Falls rents run 23% below the national average — ideal for BAH surplus savings on a training assignment',
    nearby: ['dyess-afb', 'altus-afb', 'tinker-afb'],
    bahVsHousing: {
      medianRent: 1000,
      medianRentSource: 'Zillow / BestPlaces 2025–2026',
      medianHomePrice: 170000,
      medianHomePriceSource: 'Zillow / BestPlaces 2026',
      mortgageMin: 1250,
      mortgageMax: 1450,
      mortgageAssumptions: '$0 down, ~6.5% rate, ~2.0% property tax + insurance',
    },
    localHousingTips: {
      coliNote: 'roughly 23% below the national average',
      stateTaxNote: 'Texas has no state income tax on military pay, meaning your BAH, base pay, and special pays go further here than in high-tax states.',
      neighborhoods: [
        {
          name: 'Wichita Falls (southwest)',
          highlight: 'Wichita Falls ISD — decent (6/10)',
          commute: '10–15 min to Sheppard gate',
          bestFor: 'Most housing options, shopping, and dining',
          typicalRent3br: '$800–$1,100/mo',
        },
        {
          name: 'Burkburnett',
          highlight: 'Burkburnett ISD — solid (7/10)',
          commute: '10–15 min to Sheppard gate',
          bestFor: 'Families wanting better schools and a small-town feel',
          typicalRent3br: '$900–$1,200/mo',
        },
        {
          name: 'Near base (Missile Road area)',
          highlight: 'Wichita Falls ISD — Sheppard Elementary on base',
          commute: '5 min to Sheppard gate',
          bestFor: 'Students wanting the shortest commute',
          typicalRent3br: '$700–$1,000/mo',
        },
      ],
      mistakeToAvoid: 'Most people at Sheppard are students on short tours (3–12 months). The mistake is signing a long lease or buying for a training assignment. Rent month-to-month if possible, and pocket the BAH surplus — Wichita Falls is one of the cheapest housing markets near any Air Force base.',
    },
  },
  {
    name: 'Altus AFB',
    slug: 'altus-afb',
    zip: '73521',
    city: 'Altus',
    state: 'OK',
    stateName: 'Oklahoma',
    branches: ['Air Force'],
    description: 'Altus AFB hosts the 97th Air Mobility Wing and trains mobility aircrew for the C-17 Globemaster III and KC-46 Pegasus — Air Mobility Command\'s primary tanker/airlift training base.',
    rentalNote: 'Altus is a small southwestern Oklahoma city with very affordable housing. Rural rental markets mean BAH goes far — a common assignment for servicemembers looking to maximize housing savings.',
    nearby: ['sheppard-afb', 'tinker-afb', 'vance-afb'],
  },
  {
    name: 'Columbus AFB',
    slug: 'columbus-afb',
    zip: '39705',
    city: 'Columbus',
    state: 'MS',
    stateName: 'Mississippi',
    branches: ['Air Force'],
    description: 'Columbus AFB hosts the 14th Flying Training Wing and trains undergraduate pilots on the T-6 Texan II and T-38 Talon — one of the Air Force\'s primary pilot production bases.',
    rentalNote: 'Columbus, MS, offers affordable housing close to the base. The local rental market is modest, and BAH consistently covers local rents with margin.',
    nearby: ['maxwell-afb', 'keesler-afb', 'moody-afb'],
  },
  {
    name: 'Goodfellow AFB',
    slug: 'goodfellow-afb',
    zip: '76901',
    city: 'San Angelo',
    state: 'TX',
    stateName: 'Texas',
    branches: ['Air Force'],
    description: 'Goodfellow AFB hosts the 17th Training Wing and provides intelligence, surveillance, and fire protection training to servicemembers from all military branches.',
    rentalNote: 'San Angelo has affordable housing with good inventory. The city provides solid amenities for a mid-sized Texas market, and BAH generally covers local rents comfortably.',
    nearby: ['dyess-afb', 'laughlin-afb', 'cannon-afb'],
  },
  {
    name: 'Holloman AFB',
    slug: 'holloman-afb',
    zip: '88310',
    city: 'Alamogordo',
    state: 'NM',
    stateName: 'New Mexico',
    branches: ['Air Force'],
    description: 'Holloman AFB is affordable and scenic — the Tularosa Basin offers dramatic desert landscapes and the Sacramento Mountains are right there for skiing and hiking. New Mexico exempts military pay from income tax, and BAH creates a healthy surplus. White Sands National Park is practically in your backyard.',
    installationDetail: 'Holloman AFB is home to the 49th Wing — operating F-16 fighter training and MQ-9 Reaper remotely piloted aircraft in southern New Mexico\'s Tularosa Basin, adjacent to White Sands Missile Range.',
    rentalNote: 'Alamogordo is a small New Mexico desert city with very affordable housing. Rents are well below national averages, and BAH typically provides excellent coverage.',
    rentalContext: 'Alamogordo\'s desert housing market is very affordable, with New Mexico\'s military pay exemption adding to the advantage',
    nearby: ['kirtland-afb', 'cannon-afb', 'davis-monthan-afb'],
    bahVsHousing: {
      medianRent: 1000,
      medianRentSource: 'Zillow / BestPlaces 2025–2026',
      medianHomePrice: 195000,
      medianHomePriceSource: 'Zillow / BestPlaces 2026',
      mortgageMin: 1400,
      mortgageMax: 1600,
      mortgageAssumptions: '$0 down, ~6.5% rate, ~0.8% property tax + insurance',
    },
    localHousingTips: {
      coliNote: 'roughly 12–15% below the national average',
      stateTaxNote: 'New Mexico exempts active-duty military pay from state income tax. BAH and BAS are also tax-free.',
      neighborhoods: [
        {
          name: 'Alamogordo',
          highlight: 'Alamogordo Public Schools — decent (6/10)',
          commute: '5–15 min to Holloman gate',
          bestFor: 'Only real option — all housing, schools, and services',
          typicalRent3br: '$800–$1,100/mo',
        },
        {
          name: 'La Luz / Tularosa',
          highlight: 'Tularosa Municipal Schools — small',
          commute: '10–15 min to Holloman gate',
          bestFor: 'Families wanting rural feel with mountain views',
          typicalRent3br: '$700–$1,000/mo',
        },
        {
          name: 'Cloudcroft (mountains)',
          highlight: 'Cloudcroft Municipal Schools — tiny',
          commute: '30–35 min to Holloman gate',
          bestFor: 'Mountain lifestyle — cooler temps, pine forests, skiing nearby',
          typicalRent3br: '$900–$1,200/mo',
        },
      ],
      mistakeToAvoid: 'Alamogordo is a small desert city in a mountain basin. The mistake is expecting Las Cruces (an hour south) or El Paso (1.5 hours south) amenities. Alamogordo has the basics, and the Sacramento Mountains to the east offer skiing at Ski Apache and cool mountain escapes in Cloudcroft — 30 minutes from base. Your BAH goes very far here.',
    },
  },
  {
    name: 'Hurlburt Field',
    slug: 'hurlburt-field',
    zip: '32547',
    city: 'Mary Esther',
    state: 'FL',
    stateName: 'Florida',
    branches: ['Air Force'],
    description: 'Hurlburt Field is the home of Air Force Special Operations Command (AFSOC) and the 1st Special Operations Wing — the primary SOF aviation hub in the United States.',
    rentalNote: 'The Eglin/Hurlburt/Fort Walton Beach area has strong military housing demand. Niceville, Navarre, and Crestview are popular at varying price points. The Emerald Coast market has risen significantly — verify current BAH coverage before signing a lease.',
    nearby: ['eglin-afb', 'naval-air-station-pensacola', 'tyndall-afb'],
  },
  {
    name: 'Keesler AFB',
    slug: 'keesler-afb',
    zip: '39531',
    city: 'Biloxi',
    state: 'MS',
    stateName: 'Mississippi',
    branches: ['Air Force'],
    description: 'Keesler AFB hosts the 81st Training Wing, training airmen in cyber, communications, and weather. The 403rd Wing also operates C-130J aircraft here.',
    rentalNote: 'Biloxi and the Gulf Coast offer a moderate rental market. D\'Iberville, Gulfport, and Ocean Springs are alternatives. Mississippi has some of the lowest costs of living in the country.',
    nearby: ['columbus-afb', 'maxwell-afb', 'moody-afb'],
  },
  {
    name: 'Little Rock AFB',
    slug: 'little-rock-afb',
    zip: '72076',
    city: 'Jacksonville',
    state: 'AR',
    stateName: 'Arkansas',
    branches: ['Air Force'],
    description: 'Little Rock AFB hosts the 19th Airlift Wing and is the Air Force center of excellence for the C-130 Hercules, operating the world\'s largest C-130 training program.',
    rentalNote: 'Jacksonville, Conway, and Little Rock suburbs offer affordable mid-South housing. Arkansas has a low overall cost of living, and BAH typically covers local rental costs comfortably.',
    nearby: ['barksdale-afb', 'whiteman-afb', 'scott-afb'],
  },
  {
    name: 'Malmstrom AFB',
    slug: 'malmstrom-afb',
    zip: '59401',
    city: 'Great Falls',
    state: 'MT',
    stateName: 'Montana',
    branches: ['Air Force'],
    description: 'Malmstrom AFB hosts the 341st Missile Wing and operates Minuteman III ICBMs across a large missile field in central Montana — one of three ICBM bases in the U.S.',
    rentalNote: 'Great Falls is a mid-sized Montana city with affordable housing. Cold winters are a significant factor, but the cost of living is low and BAH generally covers most rental options.',
    nearby: ['minot-afb', 'ellsworth-afb', 'fe-warren-afb'],
  },
  {
    name: 'Moody AFB',
    slug: 'moody-afb',
    zip: '31601',
    city: 'Valdosta',
    state: 'GA',
    stateName: 'Georgia',
    branches: ['Air Force'],
    description: 'Moody AFB is one of the most affordable Air Force bases. Valdosta\'s cost of living is well below the national average, and BAH creates a strong surplus at every pay grade. Valdosta State University adds a college-town element with more dining and entertainment than you\'d expect for a city this size.',
    installationDetail: 'Moody AFB is home to the 23rd Wing — the \'Flying Tigers\' — operating A-29 Super Tucanos, HH-60W Jolly Green II rescue helicopters, and HC-130J Combat King II aircraft in south Georgia.',
    rentalNote: 'Valdosta has affordable southern Georgia housing near the main gate. BAH is modest but reflects the local cost of living — most rentals in the area are within BAH range.',
    rentalContext: 'Valdosta\'s below-average cost of living means most pay grades keep a meaningful BAH surplus',
    nearby: ['maxwell-afb', 'seymour-johnson-afb', 'marine-corps-air-station-beaufort'],
    bahVsHousing: {
      medianRent: 1100,
      medianRentSource: 'Zillow / BestPlaces 2025–2026',
      medianHomePrice: 200000,
      medianHomePriceSource: 'Zillow / BestPlaces 2026',
      mortgageMin: 1400,
      mortgageMax: 1600,
      mortgageAssumptions: '$0 down, ~6.5% rate, ~1.0% property tax + insurance',
    },
    localHousingTips: {
      coliNote: 'roughly 15–18% below the national average',
      stateTaxNote: 'Georgia taxes military pay at up to 5.75%. BAH and BAS remain tax-free at the federal and state level.',
      neighborhoods: [
        {
          name: 'North Valdosta',
          highlight: 'Valdosta City Schools — decent (6/10)',
          commute: '10–15 min to Moody gate',
          bestFor: 'Most shopping, dining, and VSU campus access',
          typicalRent3br: '$900–$1,200/mo',
        },
        {
          name: 'Lowndes County (east/south)',
          highlight: 'Lowndes County Schools — solid (7/10)',
          commute: '10–15 min to Moody gate',
          bestFor: 'Best schools in the area, more suburban feel',
          typicalRent3br: '$1,000–$1,300/mo',
        },
        {
          name: 'Lake Park / Hahira',
          highlight: 'Lowndes County Schools — solid',
          commute: '15–20 min to Moody gate',
          bestFor: 'Small-town feel with newer construction',
          typicalRent3br: '$900–$1,200/mo',
        },
        {
          name: 'On-base housing',
          highlight: 'Lowndes County Schools',
          commute: 'Walk or 2–3 min drive',
          bestFor: 'Families wanting convenience and community',
          typicalRent3br: 'BAH covers 100%',
        },
      ],
      mistakeToAvoid: 'Valdosta is a small south Georgia city — the Florida border is 15 minutes south. The mistake is not knowing that some families live across the state line in Lake Park or Madison, FL for slightly different housing options. Also, Valdosta gets hot and humid — budget for AC costs April through October.',
    },
  },
  {
    name: 'Mountain Home AFB',
    slug: 'mountain-home-afb',
    zip: '83647',
    city: 'Mountain Home',
    state: 'ID',
    stateName: 'Idaho',
    branches: ['Air Force'],
    description: 'Mountain Home AFB hosts the 366th Fighter Wing (F-15E Strike Eagle) and is one of the most isolated major Air Force installations in the continental U.S., located in the high desert of southern Idaho.',
    rentalNote: 'Mountain Home city has extremely affordable housing. Boise (~50 miles west) offers more options but at significantly higher cost driven by recent in-migration. Many choose to live on base or in town to keep commutes short.',
    nearby: ['fairchild-afb', 'hill-afb', 'joint-base-lewis-mcchord'],
  },
  {
    name: 'Robins AFB',
    slug: 'robins-afb',
    zip: '31088',
    city: 'Warner Robins',
    state: 'GA',
    stateName: 'Georgia',
    branches: ['Air Force'],
    description:
      'Robins AFB sits in Warner Robins — one of the most affordable Air Force bases in the country. The cost of living runs 12–15% below the national average, and BAH creates a strong surplus at every pay grade. Homeownership is very realistic, and Houston County schools are a draw for families.',
    installationDetail:
      "Robins AFB is home to the Warner Robins Air Logistics Complex — the Air Force's largest single-site industrial complex, maintaining and overhauling aircraft, engines, and electronics for the entire fleet.",
    rentalNote:
      'Warner Robins is a mid-sized central Georgia city with affordable housing. Bonaire and Kathleen offer the strongest school zones in Houston County — only 10 minutes from base with rents well within BAH.',
    rentalContext:
      'Warner Robins is 12–15% below the national cost of living average — BAH creates a strong surplus at every pay grade.',
    nearby: ['maxwell-afb', 'moody-afb', 'marine-corps-air-station-beaufort'],
    bahVsHousing: {
      medianRent: 1300,
      medianRentSource: 'Zillow / Apartments.com 2025–2026',
      medianHomePrice: 230000,
      medianHomePriceSource: 'Zillow / Redfin 2026',
      mortgageMin: 1550,
      mortgageMax: 1750,
      mortgageAssumptions: '$0 down, ~6.5% rate, ~1.0% property tax + insurance',
    },
    localHousingTips: {
      coliNote: 'roughly 12–15% below the national average',
      stateTaxNote: 'Georgia taxes military pay at up to 5.75%. BAH and BAS remain tax-free at the federal and state level.',
      neighborhoods: [
        {
          name: 'Bonaire',
          highlight: 'Houston County Schools — strongest zone (7–8/10)',
          commute: '10–15 min to Robins gate',
          bestFor: 'Top pick for families — best schools near Robins',
          typicalRent3br: '$1,100–$1,400/mo',
        },
        {
          name: 'Warner Robins (south)',
          highlight: 'Houston County Schools — good (7/10)',
          commute: '5–10 min to Robins gate',
          bestFor: 'Closest to base with good school options',
          typicalRent3br: '$1,000–$1,300/mo',
        },
        {
          name: 'Kathleen',
          highlight: 'Houston County Schools — solid (7/10)',
          commute: '10–15 min to Robins gate',
          bestFor: 'Families wanting a quieter suburban feel',
          typicalRent3br: '$1,000–$1,300/mo',
        },
        {
          name: 'Perry',
          highlight: 'Houston County Schools — decent',
          commute: '15–20 min to Robins gate',
          bestFor: 'Small-town charm south of base',
          typicalRent3br: '$900–$1,200/mo',
        },
      ],
      mistakeToAvoid:
        "Warner Robins is a mid-size Georgia city, and the housing market is straightforward — but school quality varies by neighborhood. The mistake is picking housing on the north side near the gate without checking Bonaire or Kathleen, which have the strongest Houston County school zones. The commute difference is only 5–10 minutes.",
    },
  },
  {
    name: 'Shaw AFB',
    slug: 'shaw-afb',
    zip: '29150',
    city: 'Sumter',
    state: 'SC',
    stateName: 'South Carolina',
    branches: ['Air Force'],
    description: 'Shaw AFB hosts the 20th Fighter Wing (F-16CM) and is the headquarters of Air Forces Central Command (AFCENT) — the Air Force component of U.S. Central Command.',
    rentalNote: 'Sumter has an affordable housing market with solid inventory. Columbia (~50 miles west) and Florence provide alternatives. South Carolina\'s low overall cost of living means BAH generally provides good coverage here.',
    nearby: ['marine-corps-air-station-beaufort', 'seymour-johnson-afb', 'joint-base-charleston'],
  },
  {
    name: 'Tyndall AFB',
    slug: 'tyndall-afb',
    zip: '32407',
    city: 'Panama City',
    state: 'FL',
    stateName: 'Florida',
    branches: ['Air Force'],
    description: 'Tyndall AFB hosts the 325th Fighter Wing (F-35A) and is being rebuilt as the Air Force\'s Installation of the Future following major damage from Hurricane Michael in 2018.',
    rentalNote: 'The Panama City area has seen shifting rents during post-hurricane reconstruction. Lynn Haven, Callaway, and Marianna are nearby alternatives. Verify current rental availability as the local market continues to evolve.',
    nearby: ['hurlburt-field', 'eglin-afb', 'naval-air-station-pensacola'],
  },
  {
    name: 'Vance AFB',
    slug: 'vance-afb',
    zip: '73701',
    city: 'Enid',
    state: 'OK',
    stateName: 'Oklahoma',
    branches: ['Air Force'],
    description: 'Vance AFB hosts the 71st Flying Training Wing and produces Air Force and allied-nation undergraduate pilots on the T-6 Texan II and T-38 Talon.',
    rentalNote: 'Enid is a small northwestern Oklahoma city with very affordable housing. BAH generally covers local rents comfortably. Small-city amenities are limited, but the cost of living is very low.',
    nearby: ['altus-afb', 'tinker-afb', 'sheppard-afb'],
  },
  {
    name: 'Beale AFB',
    slug: 'beale-afb',
    zip: '95901',
    city: 'Marysville',
    state: 'CA',
    stateName: 'California',
    branches: ['Air Force'],
    description: 'Beale AFB hosts the 9th Reconnaissance Wing, operating U-2 and RQ-4 Global Hawk high-altitude reconnaissance aircraft — the Air Force\'s ISR hub for the Pacific.',
    rentalNote: 'Marysville and Yuba City provide the most convenient housing. Sacramento (~50 miles south) offers more options at higher cost. Northern California costs are elevated compared to many Air Force installations.',
    nearby: ['travis-afb', 'nas-lemoore', 'vandenberg-sfb'],
  },
  {
    name: 'Fairchild AFB',
    slug: 'fairchild-afb',
    zip: '99011',
    city: 'Airway Heights',
    state: 'WA',
    stateName: 'Washington',
    branches: ['Air Force'],
    description: 'Fairchild AFB puts you in Spokane — a mid-size city with four real seasons, no state income tax, and a cost of living below the national average. BAH covers rent comfortably, and the housing market is accessible for homebuyers. The outdoor recreation (skiing, lakes, hiking) rivals Colorado at a fraction of the price.',
    installationDetail: 'Fairchild AFB is home to the 92nd Air Refueling Wing flying KC-135 Stratotankers — the Air Force\'s aerial refueling mission in the Inland Northwest near Spokane.',
    rentalNote: 'Airway Heights, Spokane, and Medical Lake provide housing options ranging from affordable to moderate. Spokane\'s market is competitive but not extreme by national standards.',
    rentalContext: 'Spokane\'s market is accessible and growing, with plenty of options 15 minutes from the gate',
    nearby: ['joint-base-lewis-mcchord', 'naval-air-station-whidbey-island', 'mountain-home-afb'],
    bahVsHousing: {
      medianRent: 1400,
      medianRentSource: 'Zillow / BestPlaces 2025–2026',
      medianHomePrice: 360000,
      medianHomePriceSource: 'Zillow / Redfin 2026',
      mortgageMin: 2400,
      mortgageMax: 2700,
      mortgageAssumptions: '$0 down, ~6.5% rate, ~0.9% property tax + insurance',
    },
    localHousingTips: {
      coliNote: 'roughly 5–8% below the national average',
      stateTaxNote: 'Washington has no state income tax — a significant net-pay advantage over most duty stations.',
      neighborhoods: [
        {
          name: 'Airway Heights',
          highlight: 'Cheney School District — decent (6/10)',
          commute: '5–10 min to Fairchild gate',
          bestFor: 'Closest to base, growing rapidly with new construction',
          typicalRent3br: '$1,100–$1,500/mo',
        },
        {
          name: 'West Spokane / West Plains',
          highlight: 'West Valley or Cheney School District (6–7/10)',
          commute: '10–15 min to Fairchild gate',
          bestFor: 'More options than Airway Heights with quick base access',
          typicalRent3br: '$1,200–$1,600/mo',
        },
        {
          name: 'Cheney',
          highlight: 'Cheney School District — decent, Eastern Washington University campus',
          commute: '15 min to Fairchild gate',
          bestFor: 'College-town feel with family-friendly neighborhoods',
          typicalRent3br: '$1,100–$1,400/mo',
        },
        {
          name: 'Spokane (south/central)',
          highlight: 'Spokane Public Schools — varies (5–7/10)',
          commute: '20–25 min to Fairchild gate',
          bestFor: 'Those wanting urban amenities, dining, and downtown access',
          typicalRent3br: '$1,300–$1,700/mo',
        },
      ],
      mistakeToAvoid: 'Fairchild is on the west side of Spokane, and the city spreads east. The mistake is living on the far east side or in Spokane Valley for more amenities and then dealing with a 30+ minute commute on I-90. Airway Heights, Medical Lake, and Cheney are all within 15 minutes of the gate and more affordable.',
    },
  },
  {
    name: 'Grand Forks AFB',
    slug: 'grand-forks-afb',
    zip: '58201',
    city: 'Grand Forks',
    state: 'ND',
    stateName: 'North Dakota',
    branches: ['Air Force'],
    description: 'Grand Forks AFB hosts the 319th Air Base Wing and operates RQ-4 Global Hawks for ISR missions. It is one of the more remote and cold-weather CONUS Air Force installations.',
    rentalNote: 'Grand Forks is a small North Dakota university city with very affordable housing. The University of North Dakota creates rental demand, but rents overall remain well below national averages. Severe winter weather is a significant lifestyle factor.',
    nearby: ['minot-afb', 'malmstrom-afb', 'ellsworth-afb'],
  },
  {
    name: 'Hanscom AFB',
    slug: 'hanscom-afb',
    zip: '01730',
    city: 'Bedford',
    state: 'MA',
    stateName: 'Massachusetts',
    branches: ['Air Force'],
    description: 'Hanscom AFB hosts the Air Force Life Cycle Management Center (AFLCMC) and is one of the Air Force\'s primary acquisition and program management installations, with no flying mission.',
    rentalNote: 'Hanscom is in the Greater Boston/Route 128 tech corridor — one of the most expensive rental markets in the country. Many personnel commute from Lowell, Nashua, or further west for more affordable options. BAH reflects the elevated Boston-area market.',
    nearby: ['joint-base-cape-cod', 'naval-submarine-base-new-london', 'joint-base-mcguire-dix-lakehurst'],
  },
  {
    name: 'Los Angeles AFB',
    slug: 'los-angeles-afb',
    zip: '90245',
    city: 'El Segundo',
    state: 'CA',
    stateName: 'California',
    branches: ['Space Force', 'Air Force'],
    description: 'Los Angeles AFB is the headquarters for Space Systems Command (SSC) and serves as the Air Force and Space Force\'s center for space systems acquisition and development.',
    rentalNote: 'The LA South Bay area (El Segundo, Torrance, Redondo Beach) is expensive. Inland alternatives offer lower rents but significant commutes. BAH reflects the elevated Los Angeles market.',
    nearby: ['vandenberg-sfb', 'edwards-afb', 'camp-pendleton'],
  },
  {
    name: 'Maxwell AFB',
    slug: 'maxwell-afb',
    zip: '36108',
    city: 'Montgomery',
    state: 'AL',
    stateName: 'Alabama',
    branches: ['Air Force'],
    description: 'Maxwell AFB hosts Air University, the Air Force\'s graduate education center, including the Air War College, Air Command and Staff College, and Squadron Officer School.',
    rentalNote: 'Montgomery, AL, has very affordable housing. BAH for this duty station typically exceeds local rents — one of the most financially favorable housing situations in the Air Force.',
    nearby: ['fort-rucker', 'robins-afb', 'keesler-afb'],
  },
  {
    name: 'F.E. Warren AFB',
    slug: 'fe-warren-afb',
    zip: '82001',
    city: 'Cheyenne',
    state: 'WY',
    stateName: 'Wyoming',
    branches: ['Air Force'],
    description: 'F.E. Warren AFB hosts the 90th Missile Wing, operating Minuteman III ICBMs across Wyoming, Colorado, and Nebraska. It is the nation\'s oldest continuously active Air Force base.',
    rentalNote: 'Cheyenne has affordable high-plains housing. The base sits on the northern edge of Cheyenne, providing easy access to city amenities. Denver (~90 miles south) is accessible but significantly more expensive.',
    nearby: ['peterson-sfb', 'malmstrom-afb', 'hill-afb'],
  },
  {
    name: 'U.S. Air Force Academy',
    slug: 'usaf-academy',
    zip: '80840',
    city: 'Colorado Springs',
    state: 'CO',
    stateName: 'Colorado',
    branches: ['Air Force', 'Space Force'],
    description:
      'The Academy shares the Colorado Springs MHA. Families stationed here benefit from living on the north side of the city, which has the best school districts in the region. Housing costs are higher in Briargate and Monument, but the school quality makes it worthwhile for families.',
    installationDetail:
      'The United States Air Force Academy trains the next generation of Air Force and Space Force officers — located at the foot of the Rampart Range, north of Colorado Springs.',
    rentalNote:
      "Permanent-party faculty and staff typically live in Colorado Springs or Monument. The Academy's north side location puts you near the top-rated Lewis-Palmer and Academy District 20 school districts — among the best in Colorado.",
    rentalContext:
      'the north side of Colorado Springs (Monument, Briargate, Northgate) is the ideal location for Academy-assigned families, with top schools and 10–15 minute commutes.',
    nearby: ['peterson-sfb', 'schriever-sfb', 'buckley-sfb'],
    bahVsHousing: {
      medianRent: 1825,
      medianRentSource: 'PCS Pay It Forward / Zillow 2025–2026',
      medianHomePrice: 460000,
      medianHomePriceSource: 'Zillow / Redfin 2026',
      mortgageMin: 3000,
      mortgageMax: 3300,
      mortgageAssumptions: '$0 down, ~6.5% rate, ~0.6% property tax + insurance',
    },
    localHousingTips: {
      coliNote: 'roughly 12–15% above the national average',
      stateTaxNote: 'Colorado has a flat income tax of 4.40% on military pay. BAH and BAS remain tax-free.',
      neighborhoods: [
        {
          name: 'Monument / Palmer Lake',
          highlight: 'Lewis-Palmer D38 — excellent (9/10)',
          commute: '10–15 min to Academy north gate',
          bestFor: 'Top schools and small-town feel',
          typicalRent3br: '$2,200–$2,800/mo',
        },
        {
          name: 'Briargate / Northgate',
          highlight: 'Academy District 20 — top-rated (8–9/10)',
          commute: '10–15 min to Academy',
          bestFor: 'Best combination of schools, shopping, and Academy access',
          typicalRent3br: '$2,100–$2,800/mo',
        },
        {
          name: 'Gleneagle / Black Forest',
          highlight: 'Academy D20 / Lewis-Palmer D38',
          commute: '10–15 min to Academy',
          bestFor: 'Families wanting space and semi-rural feel near Academy',
          typicalRent3br: '$2,000–$2,600/mo',
        },
      ],
      mistakeToAvoid:
        "The Academy is on the north side of Colorado Springs, so families who rent in Fountain or Security-Widefield (popular for Fort Carson) face a 35–45 minute commute. Look at Monument, Briargate, or Northgate instead — they're 10–15 minutes from the Academy's north gate with access to the top-rated Lewis-Palmer and Academy D20 school districts.",
    },
  },
  {
    name: 'Eielson AFB',
    slug: 'eielson-afb',
    zip: '99702',
    city: 'Fairbanks',
    state: 'AK',
    stateName: 'Alaska',
    branches: ['Air Force'],
    description:
      'Eielson is a unique duty station — extreme cold, limited amenities, but no state income tax and surprisingly affordable housing. The North Pole area near base has homes well within BAH reach. Fairbanks offers more options but adds 25+ minutes of commute on icy winter roads. Many families choose on-base housing to avoid the heating cost surprise.',
    installationDetail:
      'Eielson AFB is home to the 354th Fighter Wing, operating F-35A Lightning II jets — the Air Force\'s newest stealth fighters in the extreme Arctic environment, 26 miles southeast of Fairbanks.',
    rentalNote:
      'Fairbanks-area housing is available but limited. Extreme cold (regularly -40°F or colder) shapes housing and lifestyle decisions. BAH reflects the remote, high-cost Alaska market. Most servicemembers live on base or in Fairbanks proper.',
    rentalContext:
      'Fairbanks-area housing costs are roughly 25–30% above the national median overall, though winter utilities — not rent — are the real budget challenge here.',
    nearby: ['joint-base-elmendorf-richardson', 'fort-wainwright', 'joint-base-pearl-harbor-hickam'],
    bahVsHousing: {
      medianRent: 1500,
      medianRentSource: 'Zillow / AskDoss 2025–2026',
      medianHomePrice: 260000,
      medianHomePriceSource: 'Zillow / AskDoss 2026',
      mortgageMin: 1800,
      mortgageMax: 2000,
      mortgageAssumptions: '$0 down, ~6.5% rate, ~1.1% property tax + insurance',
    },
    localHousingTips: {
      coliNote: 'roughly 25–30% above the national average (driven by groceries and energy)',
      stateTaxNote:
        'Alaska has no state income tax and no state sales tax. Your military pay stretches further here on the tax side — but higher costs for food, fuel, and heating offset some of that advantage.',
      neighborhoods: [
        {
          name: 'North Pole',
          highlight: 'North Pole schools — small, military-heavy (6–7/10)',
          commute: '10–15 min to Eielson main gate',
          bestFor: 'Closest to base, most affordable off-base option',
          typicalRent3br: '$1,200–$1,600/mo',
        },
        {
          name: 'Fairbanks',
          highlight: 'Fairbanks North Star Borough Schools — solid (7/10)',
          commute: '25–35 min to Eielson (weather dependent)',
          bestFor: 'Families wanting more shopping, dining, and community options',
          typicalRent3br: '$1,400–$1,800/mo',
        },
        {
          name: 'On-base housing',
          highlight: 'On-base schools available',
          commute: 'Walk or 2–3 min drive',
          bestFor: 'Families wanting included utilities (critical in -40°F winters)',
          typicalRent3br: 'BAH covers 100% (utilities included)',
        },
      ],
      mistakeToAvoid:
        'The biggest shock at Eielson is winter utility costs. Heating a home at -40°F can cost $400–$600/month from October through March. On-base housing includes utilities, but if you live off-base in North Pole or Fairbanks, budget for heating as a major expense that eats into your BAH surplus fast.',
    },
  },

  // ── NAVY / MARINE CORPS (additional) ──────────────────────────────────────
  {
    name: 'NAS Jacksonville',
    slug: 'nas-jacksonville',
    zip: '32212',
    city: 'Jacksonville',
    state: 'FL',
    stateName: 'Florida',
    branches: ['Navy'],
    description:
      "NAS Jacksonville puts you in a major Florida city with no state income tax and a cost of living below the national average. BAH covers rent with a comfortable buffer, and Jacksonville's housing market is more affordable than Tampa, Miami, or the Space Coast. The St. Johns County school district is a major draw for families willing to commute.",
    installationDetail:
      "NAS Jacksonville is one of the Navy's largest air stations — home to multiple P-8A Poseidon maritime patrol squadrons and helicopter squadrons on the St. Johns River.",
    rentalNote:
      "Jacksonville has a large and diverse rental market. Orange Park and Westside Jacksonville are closest to NAS Jax — but St. Johns County to the south has the best schools in Florida and is worth the commute for families.",
    rentalContext:
      "Jacksonville's cost of living is below the national average and Florida has no income tax — a strong combination for military families.",
    nearby: ['naval-station-mayport', 'camp-lejeune', 'nas-corpus-christi'],
    bahVsHousing: {
      medianRent: 1600,
      medianRentSource: 'Zillow / Zumper 2025–2026',
      medianHomePrice: 320000,
      medianHomePriceSource: 'Zillow / Redfin 2026',
      mortgageMin: 2150,
      mortgageMax: 2350,
      mortgageAssumptions: '$0 down, ~6.5% rate, ~0.9% property tax + insurance',
    },
    localHousingTips: {
      coliNote: 'roughly 5–8% below the national average',
      stateTaxNote: 'Florida has no state income tax on military pay. Your entire paycheck goes further here than at duty stations in income-tax states.',
      neighborhoods: [
        {
          name: 'Orange Park',
          highlight: 'Clay County Schools — strong (7–8/10)',
          commute: '10–15 min to NAS Jax',
          bestFor: 'Best combination of schools and commute',
          typicalRent3br: '$1,300–$1,700/mo',
        },
        {
          name: 'Westside Jacksonville',
          highlight: 'Duval County Schools — varies by zone (5–7/10)',
          commute: '5–15 min to NAS Jax',
          bestFor: 'Shortest commute and most affordable',
          typicalRent3br: '$1,200–$1,600/mo',
        },
        {
          name: 'Fleming Island / Middleburg',
          highlight: 'Clay County Schools — strong (7–8/10)',
          commute: '15–20 min to NAS Jax',
          bestFor: 'Families wanting newer construction with good schools',
          typicalRent3br: '$1,500–$1,900/mo',
        },
        {
          name: 'St. Johns County (Julington Creek)',
          highlight: 'St. Johns County Schools — best in Florida (9/10)',
          commute: '25–35 min to NAS Jax',
          bestFor: 'Families willing to commute for the best schools in the state',
          typicalRent3br: '$1,800–$2,300/mo',
        },
      ],
      mistakeToAvoid:
        "Jacksonville is a massive city — one of the largest by area in the US. The mistake is not factoring commute distance. NAS Jax is on the west side near the river, while many newer neighborhoods are on the south side (St. Johns County) 30+ minutes away. Orange Park and Westside Jacksonville keep you within 15 minutes of the gate.",
    },
  },
  {
    name: 'NAS Lemoore',
    slug: 'nas-lemoore',
    zip: '93245',
    city: 'Lemoore',
    state: 'CA',
    stateName: 'California',
    branches: ['Navy'],
    description: 'NAS Lemoore is the Navy\'s only master jet base on the West Coast, homeport for all carrier-based strike fighter aircraft (F/A-18 and F-35C).',
    rentalNote: 'Lemoore is a small San Joaquin Valley city with affordable housing. Fresno (~45 miles north) offers more options. Coastal California costs are far higher — this assignment offers relatively favorable housing economics for California.',
    nearby: ['nas-north-island', 'travis-afb', 'nas-fallon'],
  },
  {
    name: 'NAS Fallon',
    slug: 'nas-fallon',
    zip: '89406',
    city: 'Fallon',
    state: 'NV',
    stateName: 'Nevada',
    branches: ['Navy'],
    description: 'NAS Fallon is home to the Naval Strike and Air Warfare Center (NSAWC) and hosts the Navy Fighter Weapons School (TOPGUN) — the primary tactical air warfare training base for the Navy.',
    rentalNote: 'Fallon, NV, is a small agricultural community with very affordable housing. Most personnel live on base or in Fallon\'s limited housing stock. The rental market is minimal compared to other Navy duty stations.',
    nearby: ['nellis-afb', 'nas-lemoore', 'naval-base-ventura-county'],
  },
  {
    name: 'NAS Patuxent River',
    slug: 'nas-patuxent-river',
    zip: '20670',
    city: 'Lexington Park',
    state: 'MD',
    stateName: 'Maryland',
    branches: ['Navy'],
    description: 'NAS Patuxent River hosts Naval Air Systems Command (NAVAIR) and the Naval Test Wing Atlantic — the center of Navy and Marine Corps aviation research, development, testing, and evaluation.',
    rentalNote: 'The Lexington Park/Great Mills/California, MD area provides most local housing at moderate mid-Atlantic prices. Washington, DC suburbs are about 1.5 hours north. Pax River has a well-developed local military community.',
    nearby: ['joint-base-andrews', 'naval-station-norfolk', 'marine-corps-base-quantico'],
  },
  {
    name: 'Naval Station Everett',
    slug: 'naval-station-everett',
    zip: '98201',
    city: 'Everett',
    state: 'WA',
    stateName: 'Washington',
    branches: ['Navy'],
    description: 'Naval Station Everett is the homeport of Carrier Strike Group 9 and associated surface combatants — the Navy\'s most northerly major installation on the West Coast.',
    rentalNote: 'Everett, Marysville, and Mukilteo are popular housing areas. The Puget Sound region has seen significant rent increases. BAH reflects elevated Seattle-metro costs. Commuting from further north can offer savings but adds commute time.',
    nearby: ['naval-air-station-whidbey-island', 'naval-base-kitsap', 'joint-base-lewis-mcchord'],
  },
  {
    name: 'NAS Corpus Christi',
    slug: 'nas-corpus-christi',
    zip: '78412',
    city: 'Corpus Christi',
    state: 'TX',
    stateName: 'Texas',
    branches: ['Navy'],
    description: 'NAS Corpus Christi is the Navy\'s primary helicopter pilot training installation, home to Training Air Wing Four and the Naval Air Training Command.',
    rentalNote: 'Corpus Christi has an affordable coastal Texas rental market. The base is on the south side of the bay, with housing in Corpus Christi proper, Calallen, and Portland. BAH generally covers local rents.',
    nearby: ['nas-kingsville', 'joint-base-san-antonio', 'nas-jacksonville'],
  },
  {
    name: 'NAS Kingsville',
    slug: 'nas-kingsville',
    zip: '78363',
    city: 'Kingsville',
    state: 'TX',
    stateName: 'Texas',
    branches: ['Navy'],
    description: 'NAS Kingsville hosts Training Air Wing Two and trains jet pilots on the T-45 Goshawk — one of the Navy\'s two undergraduate jet pilot training installations.',
    rentalNote: 'Kingsville is a small south Texas city with very affordable housing. The local rental market is minimal, and BAH is modest but typically sufficient for the area.',
    nearby: ['nas-corpus-christi', 'joint-base-san-antonio', 'laughlin-afb'],
  },
  {
    name: 'Naval Submarine Base Kings Bay',
    slug: 'naval-submarine-base-kings-bay',
    zip: '31547',
    city: 'Kings Bay',
    state: 'GA',
    stateName: 'Georgia',
    branches: ['Navy'],
    description: 'Naval Submarine Base Kings Bay is the Atlantic Fleet homeport for Ohio-class ballistic missile submarines (SSBNs) — one of only two submarine bases capable of supporting the SSBN fleet.',
    rentalNote: 'The Kings Bay/Kingsland/St. Marys (GA) and Fernandina Beach (FL) areas offer affordable housing near the base. The coastal Georgia market is reasonably priced. Jacksonville, FL (~40 miles south) provides additional options.',
    nearby: ['naval-station-mayport', 'nas-jacksonville', 'seymour-johnson-afb'],
  },
  {
    name: 'Naval Amphibious Base Coronado',
    slug: 'nab-coronado',
    zip: '92118',
    city: 'Coronado',
    state: 'CA',
    stateName: 'California',
    branches: ['Navy'],
    description: 'Naval Amphibious Base Coronado is home to Naval Special Warfare Command, SEAL Team commands, and special operations support units — the heart of the Navy SEAL community.',
    rentalNote: 'Coronado is among the most expensive ZIP codes in the U.S. Most military families live in San Diego proper, Chula Vista, or El Cajon. BAH reflects the elevated San Diego market, but Coronado rentals far exceed BAH for most pay grades.',
    nearby: ['naval-station-san-diego', 'nas-north-island', 'camp-pendleton'],
  },
  {
    name: 'NAS Key West',
    slug: 'nas-key-west',
    zip: '33040',
    city: 'Key West',
    state: 'FL',
    stateName: 'Florida',
    branches: ['Navy'],
    description: 'NAS Key West hosts Fighter Composite Squadron Four (VFC-4) and serves as an air combat training facility for Navy and joint aviation units, including Boca Chica Field and the Sigsbee Annex.',
    rentalNote: 'Key West is one of the most expensive and constrained housing markets in the U.S. On-base housing is highly competitive. BAH is elevated but may not cover Key West proper for all pay grades. Many families commute from Summerland Key, Big Pine Key, or Marathon.',
    nearby: ['naval-air-station-pensacola', 'naval-station-mayport', 'nas-jacksonville'],
  },
  {
    name: 'MCAS New River',
    slug: 'mcas-new-river',
    zip: '28540',
    city: 'Jacksonville',
    state: 'NC',
    stateName: 'North Carolina',
    branches: ['Marine Corps'],
    description: 'MCAS New River is the Marine Corps\' largest helicopter base, home to Marine Aircraft Group 26 with MV-22 Osprey, CH-53, and UH-1Y/AH-1Z squadrons supporting II Marine Expeditionary Force.',
    rentalNote: 'MCAS New River is co-located with Camp Lejeune. Jacksonville, NC, and surrounding communities (Richlands, Swansboro, Sneads Ferry) serve both installations with a well-supplied military housing market.',
    nearby: ['camp-lejeune', 'seymour-johnson-afb', 'marine-corps-air-station-cherry-point'],
  },
  {
    name: 'Marine Corps Base Hawaii',
    slug: 'mcb-hawaii',
    zip: '96734',
    city: 'Kailua',
    state: 'HI',
    stateName: 'Hawaii',
    branches: ['Marine Corps'],
    description: 'MCB Hawaii sits on Oahu\'s windward coast — arguably the most beautiful side of the island. Kailua\'s beach-town charm comes with premium prices, and the Honolulu MHA\'s high BAH still gets stretched thin. Many Marine families choose on-base housing to simplify the math and enjoy the stunning Kaneohe Bay setting.',
    installationDetail: 'Marine Corps Base Hawaii at Kaneohe Bay is home to the 3rd Marine Regiment and Marine Aircraft Group 24 — the Marine Corps\' forward-deployed force in the Pacific, on Oahu\'s windward coast.',
    rentalNote: 'Oahu\'s rental market is among the most expensive in the nation. Kailua, Kaneohe, and windward communities have limited and costly rentals. BAH reflects Hawaii\'s elevated costs. On-base housing is highly sought-after — get on waiting lists early.',
    rentalContext: 'the Honolulu MHA is one of the highest in the country, though Kailua rents still stretch it thin',
    nearby: ['joint-base-pearl-harbor-hickam', 'schofield-barracks', 'fort-shafter'],
    bahVsHousing: {
      medianRent: 3000,
      medianRentSource: 'Zillow / PCS Pay It Forward 2025–2026',
      medianHomePrice: 900000,
      medianHomePriceSource: 'Zillow / Redfin 2026',
      mortgageMin: 6000,
      mortgageMax: 6600,
      mortgageAssumptions: '$0 down, ~6.5% rate, ~0.35% property tax + insurance',
    },
    localHousingTips: {
      coliNote: 'roughly 30–50% above the national average',
      stateTaxNote: 'Hawaii taxes military pay at up to 11% at the top marginal rate. BAH and BAS remain tax-free.',
      neighborhoods: [
        {
          name: 'Kailua',
          highlight: 'Kailua Complex — decent (6–7/10)',
          commute: '5–10 min to MCB Hawaii gate',
          bestFor: 'Beach-town living closest to base',
          typicalRent3br: '$2,800–$3,500/mo',
        },
        {
          name: 'Kaneohe',
          highlight: 'Castle Complex — decent (6/10)',
          commute: '5–10 min to MCB Hawaii gate',
          bestFor: 'Most affordable windward option near base',
          typicalRent3br: '$2,400–$3,000/mo',
        },
        {
          name: 'Mililani',
          highlight: 'Mililani Complex — strong (8/10)',
          commute: '20–25 min to MCB Hawaii (via H-3)',
          bestFor: 'Best schools on Oahu, central location',
          typicalRent3br: '$2,800–$3,500/mo',
        },
        {
          name: 'On-base housing',
          highlight: 'On-base / Kailua Complex',
          commute: 'Walk or 2–3 min drive',
          bestFor: 'Stunning Kaneohe Bay setting with simplified finances',
          typicalRent3br: 'BAH covers 100% (utilities included)',
        },
      ],
      mistakeToAvoid: 'Kaneohe Bay is on the windward (east) side of Oahu, and the H-3 tunnel to Honolulu is the only quick route over the mountains. The mistake is living in Ewa Beach or Kapolei (leeward side) for newer homes and then sitting in 45+ minutes of cross-island traffic. Kailua and Kaneohe are right next to base — more expensive, but the commute savings are worth it.',
    },
  },
  {
    name: 'MCAS Yuma',
    slug: 'mcas-yuma',
    zip: '85365',
    city: 'Yuma',
    state: 'AZ',
    stateName: 'Arizona',
    branches: ['Marine Corps'],
    description: 'MCAS Yuma hosts Marine Aircraft Group 13 and Marine Air Weapons and Tactics Squadron One (MAWTS-1), which runs the Marine Corps\' Weapons and Tactics Instructor (WTI) course.',
    rentalNote: 'Yuma has one of the most affordable housing markets in the Marine Corps. Extreme summer heat (115°F+) is a factor, but the cost of living is very favorable for servicemembers looking to maximize their BAH.',
    nearby: ['davis-monthan-afb', 'luke-afb', 'nas-north-island'],
  },
  {
    name: 'NAS North Island',
    slug: 'nas-north-island',
    zip: '92135',
    city: 'Coronado',
    state: 'CA',
    stateName: 'California',
    branches: ['Navy'],
    description: 'NAS North Island is one of the oldest and largest naval air stations in the country, homeport for carrier air wings and Fleet Readiness Center Southwest — serving the Pacific Fleet.',
    rentalNote: 'San Diego North County coastal communities (Point Loma, Chula Vista, National City) serve North Island personnel. The San Diego rental market is highly competitive. BAH reflects elevated Southern California costs.',
    nearby: ['naval-station-san-diego', 'nab-coronado', 'camp-pendleton'],
  },
  {
    name: 'Naval Air Weapons Station China Lake',
    slug: 'naws-china-lake',
    zip: '93555',
    city: 'Ridgecrest',
    state: 'CA',
    stateName: 'California',
    branches: ['Navy'],
    description: 'NAWS China Lake is the Navy\'s largest landholding (over 1.1 million acres) and premier test and evaluation installation for air-launched weapons and electronic warfare systems.',
    rentalNote: 'Ridgecrest is a small high-desert city with very affordable housing. The isolation means BAH goes far — most rentals are well within local BAH rates. Summers are extremely hot (115°F+).',
    nearby: ['edwards-afb', 'los-angeles-afb', 'vandenberg-sfb'],
  },
  {
    name: 'NAS Meridian',
    slug: 'nas-meridian',
    zip: '39307',
    city: 'Meridian',
    state: 'MS',
    stateName: 'Mississippi',
    branches: ['Navy'],
    description: 'NAS Meridian hosts Training Air Wing One and trains undergraduate jet pilots on the T-45 Goshawk — one of the Navy\'s two undergraduate jet pilot training bases.',
    rentalNote: 'Meridian is a small Mississippi city with very affordable housing. The local rental market is modest, and BAH provides excellent coverage. Cost of living is well below national averages.',
    nearby: ['keesler-afb', 'maxwell-afb', 'columbus-afb'],
  },
  {
    name: 'NAS Whiting Field',
    slug: 'nas-whiting-field',
    zip: '32578',
    city: 'Milton',
    state: 'FL',
    stateName: 'Florida',
    branches: ['Navy'],
    description: 'NAS Whiting Field hosts Training Air Wing Five and trains all U.S. Navy, Marine Corps, and Coast Guard helicopter pilots — the busiest Naval Air Station in the world by flight operations.',
    rentalNote: 'Milton and the Pace/Navarre area of the Florida Panhandle offer affordable housing convenient to Whiting Field. The Pensacola area provides more inventory and amenities for the shared regional military housing market.',
    nearby: ['naval-air-station-pensacola', 'hurlburt-field', 'eglin-afb'],
  },
  {
    name: 'MCRD San Diego',
    slug: 'mcrd-san-diego',
    zip: '92140',
    city: 'San Diego',
    state: 'CA',
    stateName: 'California',
    branches: ['Marine Corps'],
    description: 'Marine Corps Recruit Depot San Diego trains all male recruits from west of the Mississippi River and is one of only two MCRD installations in the country.',
    rentalNote: 'San Diego\'s rental market is among the most competitive on the West Coast. Mission Valley, El Cajon, Chula Vista, and National City are more affordable than coastal neighborhoods. BAH reflects the elevated San Diego market.',
    nearby: ['naval-station-san-diego', 'camp-pendleton', 'nab-coronado'],
  },
  {
    name: 'MCRD Parris Island',
    slug: 'mcrd-parris-island',
    zip: '29905',
    city: 'Beaufort',
    state: 'SC',
    stateName: 'South Carolina',
    branches: ['Marine Corps'],
    description: 'Marine Corps Recruit Depot Parris Island trains all female recruits and male recruits from east of the Mississippi River — the birthplace of every East Coast Marine.',
    rentalNote: 'The Beaufort, SC area has a growing and moderately priced housing market. Bluffton offers upscale alternatives while Port Royal provides lower-cost options. BAH reflects the Beaufort/Hilton Head area.',
    nearby: ['marine-corps-air-station-beaufort', 'joint-base-charleston', 'seymour-johnson-afb'],
  },
  {
    name: 'Naval Medical Center Portsmouth',
    slug: 'naval-medical-center-portsmouth',
    zip: '23708',
    city: 'Portsmouth',
    state: 'VA',
    stateName: 'Virginia',
    branches: ['Navy'],
    description: 'Naval Medical Center Portsmouth is the Navy\'s oldest continually operating hospital, providing tertiary medical care to military beneficiaries in the Hampton Roads region.',
    rentalNote: 'Portsmouth, Chesapeake, and the Hampton Roads area provide a wide range of housing options. The region has a large military community with well-developed rental infrastructure across all price points.',
    nearby: ['naval-station-norfolk', 'joint-base-langley-eustis', 'joint-base-little-creek-fort-story'],
  },
  {
    name: 'U.S. Naval Academy',
    slug: 'us-naval-academy',
    zip: '21402',
    city: 'Annapolis',
    state: 'MD',
    stateName: 'Maryland',
    branches: ['Navy'],
    description: 'The United States Naval Academy in Annapolis is the four-year undergraduate commissioning program for Navy and Marine Corps officers. Permanent-party staff and faculty serve alongside midshipmen.',
    rentalNote: 'Annapolis has a premium waterfront housing market. Odenton, Glen Burnie, and Severn offer more affordable alternatives with easy access to Baltimore-Washington transit. BAH reflects the elevated DC/Annapolis area market.',
    nearby: ['naval-station-norfolk', 'fort-meade', 'joint-base-andrews'],
  },
  {
    name: 'Dam Neck Annex',
    slug: 'dam-neck-annex',
    zip: '23461',
    city: 'Virginia Beach',
    state: 'VA',
    stateName: 'Virginia',
    branches: ['Navy'],
    description: 'Naval Station Dam Neck Annex is the home of Naval Special Warfare Development Group (DEVGRU) and several intelligence and electronic warfare commands in Virginia Beach.',
    rentalNote: 'Virginia Beach offers a large military housing market ranging from oceanfront to suburban. The Hampton Roads market is large and competitive but generally more affordable than DC, NYC, or West Coast metros.',
    nearby: ['naval-station-norfolk', 'joint-base-little-creek-fort-story', 'naval-air-station-oceana'],
  },

  // ── COAST GUARD ───────────────────────────────────────────────────────────
  {
    name: 'Training Center Cape May',
    slug: 'tracen-cape-may',
    zip: '08204',
    city: 'Cape May',
    state: 'NJ',
    stateName: 'New Jersey',
    branches: ['Coast Guard'],
    description: 'Training Center Cape May is the only Coast Guard recruit training center in the United States, training all enlisted Coast Guard recruits at the southern tip of New Jersey.',
    rentalNote: 'Cape May is a popular vacation destination with a seasonal rental market. The off-season market is more affordable. Rio Grande, Middle Township, and Wildwood provide lower-cost alternatives for permanent-party personnel.',
    nearby: ['joint-base-mcguire-dix-lakehurst', 'joint-base-cape-cod', 'naval-station-newport'],
  },
  {
    name: 'U.S. Coast Guard Academy',
    slug: 'us-coast-guard-academy',
    zip: '06320',
    city: 'New London',
    state: 'CT',
    stateName: 'Connecticut',
    branches: ['Coast Guard'],
    description: 'The United States Coast Guard Academy in New London, CT, is the undergraduate commissioning program for Coast Guard officers. Permanent-party staff and faculty serve alongside cadets.',
    rentalNote: 'New London/Groton, CT, has an established military housing market shared with Naval Submarine Base New London. Mystic, Norwich, and Waterford provide additional options. Connecticut\'s cost of living is elevated compared to national averages.',
    nearby: ['naval-submarine-base-new-london', 'joint-base-cape-cod', 'joint-base-mcguire-dix-lakehurst'],
  },
  {
    name: 'Coast Guard Base Kodiak',
    slug: 'base-kodiak',
    zip: '99615',
    city: 'Kodiak',
    state: 'AK',
    stateName: 'Alaska',
    branches: ['Coast Guard'],
    description: 'Coast Guard Base Kodiak is the Coast Guard\'s largest installation, supporting search and rescue, law enforcement, and environmental response operations across western Alaska and the Bering Sea.',
    rentalNote: 'Kodiak Island has a very limited and expensive rental market due to its remote island location. Most Coast Guard personnel live on base. BAH reflects the remote Alaska cost premium. Weather and isolation are significant lifestyle factors.',
    nearby: ['joint-base-elmendorf-richardson', 'fort-wainwright', 'eielson-afb'],
  },

  // ── MULTI-BRANCH ──────────────────────────────────────────────────────────
  {
    name: 'Joint Base Anacostia-Bolling',
    slug: 'joint-base-anacostia-bolling',
    zip: '20032',
    city: 'Washington',
    state: 'DC',
    stateName: 'District of Columbia',
    branches: ['Navy', 'Air Force'],
    description: 'Joint Base Anacostia-Bolling combines Naval Support Facility Anacostia and Bolling AFB in Washington, D.C., hosting DIA, the Defense Intelligence Agency, and the Air Force District of Washington.',
    rentalNote: 'JBAB is located in Southeast D.C. DC rents are high across all neighborhoods. Congress Heights, Oxon Hill (MD), and Alexandria (VA) are nearby options. BAH reflects the full DC market.',
    nearby: ['fort-mcnair', 'joint-base-myer-henderson-hall', 'joint-base-andrews'],
  },
  {
    name: 'Naval Postgraduate School',
    slug: 'naval-postgraduate-school',
    zip: '93943',
    city: 'Monterey',
    state: 'CA',
    stateName: 'California',
    branches: ['Navy'],
    description: 'The Naval Postgraduate School in Monterey offers advanced degrees and research programs for military officers from all services and international partners, focused on defense-relevant science and engineering.',
    rentalNote: 'Monterey has an expensive coastal California rental market. Seaside and Marina offer lower-cost options within easy commuting distance. Salinas (~20 miles inland) provides the most affordable housing in the region.',
    nearby: ['presidio-of-monterey', 'travis-afb', 'vandenberg-sfb'],
  },
];

export const STATION_BY_SLUG: Record<string, DutyStation> = Object.fromEntries(
  DUTY_STATIONS.map((s) => [s.slug, s])
);
