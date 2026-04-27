// Source: Installation Management Command (IMCOM), DoD, and service branch websites.
// ZIP codes are city/area ZIPs for the primary housing market surrounding each installation.

import type { Branch } from '@/types/military';

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
  rentalNote: string;
  nearby: string[];
  oconus?: true;
}

export const DUTY_STATIONS: DutyStation[] = [
  // ── ARMY ───────────────────────────────────────────────────────────────────
  {
    name: 'Fort Liberty',
    slug: 'fort-liberty',
    formerName: 'Fort Bragg',
    zip: '28301',
    city: 'Fayetteville',
    state: 'NC',
    stateName: 'North Carolina',
    branches: ['Army'],
    description:
      'Home of the 82nd Airborne Division and the Army Special Operations Command, Fort Liberty is the largest U.S. military installation by population with over 50,000 active-duty soldiers.',
    rentalNote:
      'BAH in the Fayetteville market covers most mid-range rentals, though the large military population has pushed rents upward in recent years. Many families choose to buy, where BAH often exceeds the cost of a mortgage on a starter home.',
    nearby: ['camp-lejeune', 'seymour-johnson-afb', 'marine-corps-air-station-cherry-point'],
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
      'Straddling the Kentucky-Tennessee border, Fort Campbell is home to the 101st Airborne Division (Air Assault) and the Army\'s 5th Special Forces Group.',
    rentalNote:
      'The Clarksville housing market is among the more affordable for a post of this size. E-5 and above BAH typically covers 2-bedroom apartments in most neighborhoods, and homebuyers often find significant BAH surplus.',
    nearby: ['fort-knox', 'redstone-arsenal', 'fort-sill'],
  },
  {
    name: 'Fort Cavazos',
    slug: 'fort-cavazos',
    formerName: 'Fort Hood',
    zip: '76541',
    city: 'Killeen',
    state: 'TX',
    stateName: 'Texas',
    branches: ['Army'],
    description:
      'Fort Cavazos is the primary training and deployment base for III Armored Corps and hosts two heavy combat divisions — the 1st Cavalry Division and the 3rd Cavalry Regiment.',
    rentalNote:
      'Killeen is one of the most affordable large military markets in the country. BAH at most grades has historically exceeded median rents, making homeownership common among the force.',
    nearby: ['joint-base-san-antonio', 'fort-bliss', 'fort-sill'],
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
      'JBLM is the largest military installation on the West Coast, home to I Corps, the 2nd Infantry Division\'s 7th Infantry Brigade, and the 62nd Airlift Wing.',
    rentalNote:
      'The Puget Sound housing market is expensive and competitive. BAH rates are high relative to CONUS averages, but the Seattle metro\'s rapidly rising rents mean some lower-grade members face a shortfall. CONUS COLA was added for this area in 2026.',
    nearby: ['naval-base-kitsap', 'naval-air-station-whidbey-island', 'joint-base-elmendorf-richardson'],
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
      'Fort Carson is home to the 4th Infantry Division and several special operations units, situated at the base of Pikes Peak in Colorado Springs.',
    rentalNote:
      'Colorado Springs has seen rapid housing price appreciation over the past decade. BAH covers most mid-range apartments, but the competitive ownership market means buyers may need additional funds beyond BAH for a down payment.',
    nearby: ['kirtland-afb', 'fort-riley', 'offutt-afb'],
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
      'Fort Drum is home to the 10th Mountain Division (Light Infantry), one of the most deployed divisions in the U.S. Army, located in upstate New York near the Canadian border.',
    rentalNote:
      'Watertown is a small city with a tight rental market driven almost entirely by military demand. BAH typically covers rents, but selection is limited. Many families choose off-post in Carthage, Adams, or Lowville.',
    nearby: ['fort-hamilton', 'joint-base-mcguire-dix-lakehurst', 'naval-submarine-base-new-london'],
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
      'Fort Bliss is home to the 1st Armored Division and the 32nd Army Air and Missile Defense Command, spanning parts of west Texas and New Mexico near the U.S.-Mexico border.',
    rentalNote:
      'El Paso is one of the most affordable major housing markets in the country. BAH at most grades significantly exceeds typical rents, and homeownership is common across the force.',
    nearby: ['fort-cavazos', 'joint-base-san-antonio', 'kirtland-afb'],
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
      'Fort Stewart is the largest Army installation east of the Mississippi River and home to the 3rd Infantry Division, located on the Georgia coast near Savannah.',
    rentalNote:
      'Hinesville is a military-dependent housing market with limited rental inventory. Many families commute from the larger Savannah metro for more options, where BAH still covers most mid-range rentals.',
    nearby: ['fort-jackson', 'marine-corps-air-station-beaufort', 'naval-air-station-pensacola'],
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
      'Fort Knox is the home of Armor School, the U.S. Army Human Resources Command, and the Army\'s gold bullion depository, located southwest of Louisville.',
    rentalNote:
      'The Elizabethtown/Radcliff market offers affordable housing. BAH typically covers 2-bedroom apartments with room to spare at E-5 and above, and homebuyers often find strong BAH surplus in starter-home price ranges.',
    nearby: ['fort-campbell', 'redstone-arsenal', 'wright-patterson-afb'],
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
      'Fort Riley is home to the 1st Infantry Division (the "Big Red One"), one of the oldest and most decorated divisions in the U.S. Army, located in north-central Kansas.',
    rentalNote:
      'The Junction City/Manhattan market is affordable, and BAH is generally sufficient to cover rents at most grades. Families with housing allowances often opt to purchase in Manhattan for the Kansas State University community.',
    nearby: ['fort-leavenworth', 'fort-cavazos', 'offutt-afb'],
  },
  {
    name: 'Fort Moore',
    slug: 'fort-moore',
    formerName: 'Fort Benning',
    zip: '31901',
    city: 'Columbus',
    state: 'GA',
    stateName: 'Georgia',
    branches: ['Army'],
    description:
      'Fort Moore is the center of Infantry and Armor training, home to the Maneuver Center of Excellence, the Ranger Training Brigade, and the 3rd Brigade Combat Team.',
    rentalNote:
      'Columbus has a large, stable military-adjacent rental market with affordable options at most grades. BAH regularly exceeds mid-range rents, and homeownership is common throughout the force.',
    nearby: ['fort-stewart', 'fort-eisenhower', 'redstone-arsenal'],
  },
  {
    name: 'Fort Eisenhower',
    slug: 'fort-eisenhower',
    formerName: 'Fort Gordon',
    zip: '30901',
    city: 'Augusta',
    state: 'GA',
    stateName: 'Georgia',
    branches: ['Army'],
    description:
      'Fort Eisenhower is the home of the U.S. Army Cyber Center of Excellence and the Signal Corps, also hosting the National Security Agency\'s Georgia facility.',
    rentalNote:
      'Augusta has a cost-effective rental market. BAH covers most mid-range apartments comfortably, and the thriving technology and healthcare economy has kept home prices in a range that BAH buyers can access.',
    nearby: ['fort-jackson', 'fort-moore', 'marine-corps-air-station-beaufort'],
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
      'Fort Sill is the home of the Field Artillery School and a major training center, located in southwestern Oklahoma. It also serves as a detention facility under Army control.',
    rentalNote:
      'Lawton is one of the most affordable military housing markets in the country. BAH at most grades significantly exceeds rents, and homeownership is very accessible.',
    nearby: ['fort-cavazos', 'tinker-afb', 'fort-riley'],
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
      'Fort Leavenworth hosts the Command and General Staff College, the premier professional military education institution for field-grade officers, and the United States Disciplinary Barracks.',
    rentalNote:
      'Leavenworth is a small city adjacent to the Kansas City metro. BAH aligns with the Kansas City MHA, providing solid coverage of local rents and solid purchasing power in the housing market.',
    nearby: ['fort-riley', 'offutt-afb', 'whiteman-afb'],
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
      'Fort Wainwright is home to the 1st Brigade Combat Team (Stryker), 25th Infantry Division, located in Fairbanks — the coldest major U.S. military installation.',
    rentalNote:
      'Fairbanks housing costs are elevated due to Alaska\'s remote supply chains. BAH is calibrated to the market, but the limited inventory means competition for quality rentals is real despite the high rates.',
    nearby: ['joint-base-elmendorf-richardson', 'minot-afb', 'ellsworth-afb'],
  },
  {
    name: 'Fort Johnson',
    slug: 'fort-johnson',
    formerName: 'Fort Polk',
    zip: '71446',
    city: 'Leesville',
    state: 'LA',
    stateName: 'Louisiana',
    branches: ['Army'],
    description:
      'Fort Johnson is home to the 3rd Brigade Combat Team, 10th Mountain Division and the Joint Readiness Training Center (JRTC), one of the Army\'s premier combat training centers.',
    rentalNote:
      'Leesville is a small, isolated market. BAH covers local rents comfortably, but rental inventory is limited and many families commute from Natchitoches or Alexandria for more options.',
    nearby: ['barksdale-afb', 'joint-base-san-antonio', 'fort-cavazos'],
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
      'Schofield Barracks is home to the 25th Infantry Division (Lightning) and is the primary Army installation on Oahu, adjacent to Wahiawa and near the North Shore.',
    rentalNote:
      'Hawaii is one of the highest-cost military markets in the country. BAH rates are among the highest in CONUS, but Oahu rents have outpaced BAH in recent years — particularly for single members and junior enlisted with dependents.',
    nearby: ['joint-base-pearl-harbor-hickam', 'camp-pendleton', 'naval-station-san-diego'],
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
    nearby: ['fort-campbell', 'fort-moore', 'fort-knox'],
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
      'Fort Meade is home to the National Security Agency (NSA), U.S. Cyber Command, and the Defense Information Systems Agency, making it the most intelligence-dense installation in the country.',
    rentalNote:
      'Fort Meade falls in the Baltimore MHA. The DC/Baltimore corridor is expensive, but BAH rates reflect this — mid-grade and senior members can typically cover 2-bedroom apartments or purchase starter homes in the suburbs.',
    nearby: ['joint-base-andrews', 'aberdeen-proving-ground', 'joint-base-myer-henderson-hall'],
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
      'Fort Jackson is the Army\'s largest and most active initial entry training center, producing more than 50% of all soldiers who join the Army each year.',
    rentalNote:
      'Columbia is a large, diversified market with affordable housing. BAH provides strong purchasing power at most grades, and homeownership is very accessible.',
    nearby: ['marine-corps-air-station-beaufort', 'fort-eisenhower', 'joint-base-charleston'],
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
      'JBSA is the largest joint base in the DoD, comprising Lackland AFB, Randolph AFB, Fort Sam Houston, and Camp Bullis — the hub of Air Force Basic Military Training and medical education.',
    rentalNote:
      'San Antonio is one of the most affordable large metros in the country. BAH at nearly all grades covers mid-range rentals comfortably, and homeownership is highly accessible.',
    nearby: ['fort-cavazos', 'fort-bliss', 'barksdale-afb'],
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
      'Travis AFB is home to the 60th Air Mobility Wing and is the largest air mobility wing in the Air Force, positioned at the gateway to the Pacific between San Francisco and Sacramento.',
    rentalNote:
      'Travis sits in the Fairfield/Vacaville area, which is more affordable than the Bay Area proper but still expensive by national standards. BAH rates are high, reflecting the Northern California market.',
    nearby: ['naval-base-ventura-county', 'vandenberg-sfb', 'camp-pendleton'],
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
      'MacDill AFB hosts U.S. Central Command (CENTCOM) and U.S. Special Operations Command (SOCSOUTH), and is home to the 6th Air Refueling Wing on the Tampa Bay peninsula.',
    rentalNote:
      'Tampa is a rapidly growing metro with rising rents. BAH covers most mid-range apartments, but Tampa\'s popularity has outpaced BAH rates in some neighborhoods. Officers and senior NCOs have strong purchasing options.',
    nearby: ['eglin-afb', 'naval-air-station-pensacola', 'patrick-sfb'],
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
      'Eglin AFB is the largest Air Force base by area in the continental U.S., spanning 700 square miles in the Florida panhandle. It is the center of Air Force development and test operations.',
    rentalNote:
      'The Fort Walton Beach/Destin area is a popular coastal market. BAH rates are competitive, but coastal demand means lower-grade members may need to look inland toward Crestview or Niceville for BAH-aligned rents.',
    nearby: ['macdill-afb', 'naval-air-station-pensacola', 'barksdale-afb'],
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
      'JBLE hosts Air Combat Command headquarters, the 1st Fighter Wing, and Army aviation, with Langley AFB on the Hampton Roads peninsula and Fort Eustis providing waterfront logistics capability.',
    rentalNote:
      'The Hampton Roads market is one of the largest military housing markets in the country. BAH rates reflect a competitive but not extreme market — most grades can cover 2-bedroom rentals across the region.',
    nearby: ['naval-station-norfolk', 'joint-base-little-creek-fort-story', 'naval-air-station-oceana'],
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
      'Wright-Patterson is home to Air Force Materiel Command and the Air Force Research Laboratory, making it the largest Air Force installation by personnel — a major acquisition and science hub.',
    rentalNote:
      'Dayton is a highly affordable housing market. BAH provides strong purchasing power, and many servicemembers at all grades choose to purchase rather than rent due to the low home prices relative to BAH.',
    nearby: ['fort-knox', 'scott-afb', 'offutt-afb'],
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
      'Scott AFB hosts U.S. Transportation Command (TRANSCOM) and the Air Mobility Command, and serves as the Air Force\'s primary mobility and logistics command center, located east of St. Louis.',
    rentalNote:
      'The Illinois side of the St. Louis metro offers affordable housing relative to BAH. Most grades have significant BAH surplus, and starter homes are highly accessible for buyers.',
    nearby: ['wright-patterson-afb', 'whiteman-afb', 'offutt-afb'],
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
      'Luke AFB is the world\'s largest fighter pilot training base, producing F-35 and F-16 pilots for the U.S. and allied nations, located in the western Phoenix metro.',
    rentalNote:
      'The Phoenix metro BAH is moderate. West Valley rents are generally lower than Scottsdale or central Phoenix, giving servicemembers decent BAH coverage, though Phoenix\'s population boom has tightened supply.',
    nearby: ['davis-monthan-afb', 'fort-huachuca', 'kirtland-afb'],
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
      'Davis-Monthan is home to the 355th Wing and the 309th Aerospace Maintenance and Regeneration Group (AMARG) — the famous "boneyard" where more than 4,200 aircraft are stored.',
    rentalNote:
      'Tucson is an affordable desert market. BAH at most grades covers mid-range rentals comfortably, and the lower home prices give buyers strong purchasing power with BAH-level payments.',
    nearby: ['luke-afb', 'fort-huachuca', 'kirtland-afb'],
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
      'Tinker AFB hosts the Air Force Sustainment Center and performs depot maintenance on the Air Force\'s B-52, E-3, and KC-135 fleets, located in the Oklahoma City metro.',
    rentalNote:
      'Oklahoma City is among the most affordable large metros in the nation. BAH at all grades provides strong purchasing power — homeownership is the norm rather than the exception.',
    nearby: ['fort-sill', 'fort-cavazos', 'barksdale-afb'],
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
      'Barksdale AFB is home to the 2nd Bomb Wing, operating the B-52H Stratofortress, and serves as Global Strike Command\'s nuclear bomber headquarters in northwest Louisiana.',
    rentalNote:
      'Shreveport/Bossier City is one of the most affordable markets in the country. BAH covers most rentals with room to spare, and buyers can often purchase well below their BAH payment level.',
    nearby: ['fort-johnson', 'joint-base-san-antonio', 'tinker-afb'],
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
    nearby: ['fort-liberty', 'camp-lejeune', 'marine-corps-air-station-cherry-point'],
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
      'Minot AFB is one of two bases operating the B-52H bomber and is a dual-mission base with both strategic bombers and ICBM operations — the "Air Power Capital of the North."',
    rentalNote:
      'Minot is one of the most affordable military markets in the country. BAH significantly exceeds local rents at most grades, and homeownership is very common despite the cold climate.',
    nearby: ['ellsworth-afb', 'offutt-afb', 'fort-wainwright'],
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
      'JBER is the primary military installation in Alaska, home to the 3rd Wing and 11th Airborne Division, positioned at the strategic gateway between the Pacific and the Arctic.',
    rentalNote:
      'Anchorage has elevated housing costs relative to the continental U.S. due to Alaska\'s remote supply chains. BAH rates reflect this, but the combination of BAH and Alaska\'s unique pay makes Anchorage financially competitive for career servicemembers.',
    nearby: ['fort-wainwright', 'joint-base-lewis-mcchord', 'naval-base-kitsap'],
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
      'Joint Base Andrews is home of Air Force One, the 11th Wing, and numerous special operations and intelligence units — the primary military air gateway to Washington, D.C.',
    rentalNote:
      'Andrews sits in the DC metro MHA with some of the highest BAH rates in the country. But DC-area rents are equally elevated — junior enlisted and NCOs often find BAH tight, while officers and senior NCOs have more purchasing flexibility.',
    nearby: ['fort-meade', 'joint-base-myer-henderson-hall', 'aberdeen-proving-ground'],
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
      'Kirtland AFB hosts the Air Force Nuclear Weapons Center and Sandia National Laboratories, making it the center of the Air Force\'s nuclear weapons research and sustainment enterprise.',
    rentalNote:
      'Albuquerque is an affordable market with moderate BAH rates. Rents are generally well-covered at mid and senior grades, and the homeownership market is accessible for most BAH-earning servicemembers.',
    nearby: ['fort-bliss', 'luke-afb', 'fort-huachuca'],
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
      'Whiteman AFB is the only base operating the B-2 Spirit stealth bomber and is home to the 509th Bomb Wing, located in west-central Missouri near Kansas City.',
    rentalNote:
      'The Warrensburg/Sedalia area is one of the most affordable markets among Air Force bases. BAH provides substantial surplus over typical rents, and many servicemembers purchase in the Kansas City suburbs.',
    nearby: ['scott-afb', 'offutt-afb', 'fort-leavenworth'],
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
      'Offutt AFB is home to U.S. Strategic Command (STRATCOM) and the 55th Wing, coordinating the U.S. nuclear deterrence mission from the Omaha metro area.',
    rentalNote:
      'Bellevue and greater Omaha offer affordable, stable housing. BAH comfortably covers most rentals, and the Omaha metro\'s steady economy makes homeownership a financially sound choice for most servicemembers.',
    nearby: ['whiteman-afb', 'fort-leavenworth', 'ellsworth-afb'],
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
      'Patrick SFB is home to Space Launch Delta 45, supporting launches from Cape Canaveral Space Force Station, positioned on Florida\'s Space Coast between the launch complexes and the Atlantic.',
    rentalNote:
      'Cocoa Beach and the Space Coast are popular coastal markets. BAH covers most of the rental range, but proximity to the ocean and growing tech sector have pushed rents upward in recent years.',
    nearby: ['macdill-afb', 'eglin-afb', 'naval-air-station-pensacola'],
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
      'Naval Station Norfolk is the largest naval base in the world by area, homeporting more than 75 ships and 130 aircraft and serving as headquarters for Fleet Forces Command.',
    rentalNote:
      'Hampton Roads is a large military housing market with heavy Navy demand. BAH rates are competitive, but the sheer size of the military population creates real competition for housing in desirable Norfolk, Chesapeake, and Virginia Beach neighborhoods.',
    nearby: ['joint-base-langley-eustis', 'joint-base-little-creek-fort-story', 'naval-air-station-oceana'],
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
      'Naval Station San Diego is the primary homeport for the Pacific Fleet surface ships, hosting over 50 ships and supporting the largest naval installation complex on the West Coast.',
    rentalNote:
      'San Diego is one of the most expensive military markets in the country. BAH rates are among the highest in CONUS, but rapidly rising rents mean junior members often struggle to find housing fully covered by BAH alone.',
    nearby: ['camp-pendleton', 'marine-corps-air-station-miramar', 'naval-base-ventura-county'],
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
      'Camp Pendleton is the largest active-duty Marine Corps base on the West Coast, spanning 125,000 acres along 17 miles of California coastline between Los Angeles and San Diego.',
    rentalNote:
      'The Oceanside/Fallbrook market is slightly more affordable than San Diego proper, but still a high-cost California market. BAH rates reflect the San Diego MHA, which is among the highest in CONUS.',
    nearby: ['naval-station-san-diego', 'marine-corps-air-station-miramar', 'travis-afb'],
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
      'Camp Lejeune is home to II Marine Expeditionary Force and is the primary East Coast amphibious assault training base, hosting Marine Corps units and special operations forces.',
    rentalNote:
      'Jacksonville is a military-dominated market with affordable rents. BAH provides solid coverage, but the town\'s rental supply is heavily shaped by military demand cycles. Buyers often find good value in the surrounding Onslow County area.',
    nearby: ['fort-liberty', 'marine-corps-air-station-cherry-point', 'seymour-johnson-afb'],
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
      'JBPHH is the joint headquarters for Pacific Fleet and Pacific Air Forces, combining the historic Pearl Harbor naval complex with Hickam AFB on Oahu\'s south shore.',
    rentalNote:
      'Honolulu is one of the most expensive housing markets in the country. BAH rates are the highest in the DoD, but Hawaii rents consistently outpace BAH — particularly for larger units. Many servicemembers live on base to manage costs.',
    nearby: ['schofield-barracks', 'travis-afb', 'naval-station-san-diego'],
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
      'NAS Pensacola is the "Cradle of Naval Aviation," home to primary flight training, the Naval Aviation Museum, and the Blue Angels flight demonstration squadron.',
    rentalNote:
      'Pensacola is an attractive coastal market with moderate rents relative to Florida averages. BAH covers most mid-range rentals, and buyers find good value in neighborhoods north of downtown.',
    nearby: ['eglin-afb', 'macdill-afb', 'naval-station-mayport'],
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
      'Naval Station Mayport is the third-largest U.S. Navy fleet concentration area, homeporting surface ships and conducting fleet support operations on Florida\'s Atlantic coast near Jacksonville.',
    rentalNote:
      'The Jacksonville Beach / Mayport area commands a coastal premium. BAH covers most 2-bedroom units, but beachside rents can exceed BAH for lower grades. The broader Jacksonville market offers more affordable options inland.',
    nearby: ['naval-air-station-pensacola', 'macdill-afb', 'marine-corps-air-station-beaufort'],
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
      'Naval Base Kitsap is one of the largest naval installations in the world, homeporting several Ohio-class ballistic missile submarines and surface combatants on Puget Sound.',
    rentalNote:
      'Bremerton is more affordable than Seattle but still part of the expensive Puget Sound market. BAH rates are elevated to match, though ferry-dependent commuting from Bremerton can offset some rental cost savings.',
    nearby: ['joint-base-lewis-mcchord', 'naval-air-station-whidbey-island', 'joint-base-elmendorf-richardson'],
  },
  {
    name: 'Naval Air Station Whidbey Island',
    slug: 'naval-air-station-whidbey-island',
    zip: '98277',
    city: 'Oak Harbor',
    state: 'WA',
    stateName: 'Washington',
    branches: ['Navy'],
    description:
      'NAS Whidbey Island is home to the EA-18G Growler electronic attack aircraft and the P-8 Poseidon maritime patrol aircraft, on Whidbey Island north of Seattle.',
    rentalNote:
      'Oak Harbor is an island community with a constrained housing supply. BAH is tied to the Seattle market due to proximity, but island rents are lower — meaning BAH provides strong purchasing power relative to local rents.',
    nearby: ['naval-base-kitsap', 'joint-base-lewis-mcchord', 'joint-base-elmendorf-richardson'],
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
    nearby: ['camp-lejeune', 'fort-liberty', 'seymour-johnson-afb'],
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
      'MCB Quantico is home to the FBI Academy, the DEA Training Academy, Marine Corps officer training, and the Marine Corps Combat Development Command — the "Crossroads of the Marine Corps."',
    rentalNote:
      'Quantico falls in the DC metro BAH zone with very high rates. The Northern Virginia market is expensive, but BAH at mid and senior grades provides meaningful purchasing power — particularly in Prince William County and Stafford.',
    nearby: ['joint-base-myer-henderson-hall', 'fort-meade', 'joint-base-andrews'],
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
      'JB MDL is a tri-service installation combining McGuire AFB, Fort Dix, and Lakehurst Naval Air Engineering Station — the only base in the U.S. hosting all three components of the Total Force.',
    rentalNote:
      'JB MDL is in the New Jersey portion of the Philadelphia/South Jersey MHA. BAH rates are substantial, providing solid purchasing power in Burlington and Ocean counties, which are among New Jersey\'s more affordable markets.',
    nearby: ['fort-hamilton', 'naval-submarine-base-new-london', 'joint-base-cape-cod'],
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
      'NAS Oceana is the East Coast Master Jet Base, home to four F/A-18 carrier air wings and the Navy\'s primary strike fighter training pipeline, located in Virginia Beach.',
    rentalNote:
      'Virginia Beach BAH is competitive for the Hampton Roads market. The premium beach neighborhoods can strain lower-grade BAH, but the broader Virginia Beach market offers solid BAH coverage for most grades.',
    nearby: ['naval-station-norfolk', 'joint-base-little-creek-fort-story', 'joint-base-langley-eustis'],
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
      'Joint Base Charleston hosts the 437th Airlift Wing and serves as the primary East Coast port of embarkation, combining Charleston AFB and Naval Weapons Station Charleston.',
    rentalNote:
      'Charleston is a growing coastal market with rising rents. BAH covers most mid-range apartments, but the city\'s popularity with transplants and retirees has added pricing pressure in desirable neighborhoods.',
    nearby: ['marine-corps-air-station-beaufort', 'fort-jackson', 'fort-stewart'],
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
];

export const STATION_BY_SLUG: Record<string, DutyStation> = Object.fromEntries(
  DUTY_STATIONS.map((s) => [s.slug, s])
);
