import type { MetadataRoute } from 'next';
import { getAllPostMeta } from '@/lib/blog';
import { GUIDE_PAGES } from '@/data/guides/pages';
import { DUTY_STATIONS } from '@/data/duty-stations/stations';
import { OCONUS_V2_STATIONS } from '@/data/oconus';
import { PAY_PAGE_RANKS, PAY_PAGES_LAST_UPDATED } from '@/data/pay-pages/ranks';
import { BAH_YEAR } from '@/data/bah/current';
import { bahRelease } from '@/data/bah/releaseHistory';
import { getMHACode, getBahMidYearChange } from '@/lib/calculations/bah';
import { CALCULATOR_LAST_REVIEWED, PAGE_LAST_REVIEWED, type CalculatorSlug } from '@/data/lastReviewed';

const BASE_URL = 'https://www.milpaytools.com';

type Entry = MetadataRoute.Sitemap[number];
type Freq = NonNullable<Entry['changeFrequency']>;

// Every lastModified is a real content or data date (YYYY-MM-DD), never the build
// time: see src/data/lastReviewed.ts for where each group's date comes from.
// tests/e2e/sitemap-dates.spec.ts checks this.

/** The newest of a set of ISO dates. */
function newest(dates: string[]): string {
  if (dates.length === 0) throw new Error('sitemap: newest() of an empty date list');
  return dates.reduce((a, b) => (b > a ? b : a));
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** "July 30, 2026" → "2026-07-30". Throws on anything else, so a reworded constant can't slip through. */
function isoFromLongDate(s: string): string {
  const m = /^([A-Z][a-z]+) (\d{1,2}), (\d{4})$/.exec(s);
  const month = m ? MONTHS.indexOf(m[1]) + 1 : 0;
  if (!m || month === 0) throw new Error(`sitemap: unparseable date "${s}"`);
  return `${m[3]}-${String(month).padStart(2, '0')}-${m[2].padStart(2, '0')}`;
}

/** BAH data date for the current BAH year: DoD's release date. */
function bahDataDate(): string {
  const release = bahRelease(BAH_YEAR);
  if (!release) throw new Error(`sitemap: no BAH release recorded for ${BAH_YEAR} (src/data/bah/releaseHistory.ts)`);
  return release.releasedDate;
}

/** A station's BAH data date: the release date, or its MHA's mid-year change if later. */
function stationBahDate(zip: string): string {
  const change = getBahMidYearChange(getMHACode(zip));
  return change ? newest([bahDataDate(), change.effective]) : bahDataDate();
}

export default function sitemap(): MetadataRoute.Sitemap {
  const calc = (slug: CalculatorSlug, priority = 1.0): Entry => ({
    url: `${BASE_URL}/calculators/${slug}`,
    lastModified: CALCULATOR_LAST_REVIEWED[slug],
    changeFrequency: 'monthly',
    priority,
  });
  const page = (path: keyof typeof PAGE_LAST_REVIEWED, changeFrequency: Freq, priority: number): Entry => ({
    url: `${BASE_URL}${path}`,
    lastModified: PAGE_LAST_REVIEWED[path],
    changeFrequency,
    priority,
  });

  // NOTE: calculator list is hand-maintained — add new calculators here and in
  // CALCULATOR_LAST_REVIEWED.
  const calculatorPages: Entry[] = [
    calc('total-compensation'),
    calc('va-disability'),
    calc('tsp'),
    calc('retirement'),
    calc('pcs'),
    calc('guard-reserve'),
    calc('education'),
    calc('cola', 0.9),
    calc('dual-military-bah'),
    calc('compare'),
    calc('transition-readiness'),
    calc('separation-timeline'),
    calc('healthcare-comparison'),
    calc('va-loan'),
    calc('deployment'),
    calc('va-refinance'),
  ];

  const blogPages: Entry[] = getAllPostMeta().map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: (post.updated ?? post.date).slice(0, 10),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // Derived from the routed guide pages, not from MDX filenames — the MDX scan
  // used to drop /guides/navigating-service, which has a route but no MDX file.
  const guidePages: Entry[] = GUIDE_PAGES.map((guide) => ({
    url: `${BASE_URL}/guides/${guide.slug}`,
    lastModified: guide.date,
    changeFrequency: 'monthly',
    priority: 0.85,
  }));

  const stationChildren: Entry[] = [
    ...DUTY_STATIONS.filter((s) => !s.oconus).map((s) => ({
      url: `${BASE_URL}/bah/${s.slug}`,
      lastModified: stationBahDate(s.zip),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    // Overseas stations come from the v2 registry only (published entries).
    // Redirecting slugs (raf-mildenhall) stay out.
    ...OCONUS_V2_STATIONS.filter((s) => s.published).map((s) => ({
      url: `${BASE_URL}/bah/${s.slug}`,
      lastModified: s.lastReviewed,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];

  // Rank pages: pay tables change each January — yearly is accurate, not optimistic.
  const rankDate = isoFromLongDate(PAY_PAGES_LAST_UPDATED);
  const rankPages: Entry[] = PAY_PAGE_RANKS.map((r) => ({
    url: `${BASE_URL}/pay/${r.slug}`,
    lastModified: rankDate,
    changeFrequency: 'yearly' as const,
    priority: 0.7,
  }));

  const raise = page('/pay/raise', 'weekly', 0.9);
  // Same priority as /pay/raise (Fable SEO Spec 5B).
  const bahChanges = page('/bah/changes', 'weekly', 0.9);
  // Same priority as /pay/raise (Fable SEO Spec 4).
  const vaRates = page('/va-disability-rates', 'weekly', 0.9);
  const payDates = page('/pay/dates', 'monthly', 0.8);

  const dateOf = (entries: Entry[]) => newest(entries.map((e) => String(e.lastModified)));

  // Hubs: the newest date among their children.
  const bahHub: Entry = {
    url: `${BASE_URL}/bah`,
    lastModified: dateOf([...stationChildren, bahChanges]),
    changeFrequency: 'monthly',
    priority: 1.0,
  };
  // /pay is the pay-charts calculator hub, so it matches the calculator entries.
  const payHub: Entry = {
    url: `${BASE_URL}/pay`,
    lastModified: dateOf([...rankPages, raise, payDates]),
    changeFrequency: 'monthly',
    priority: 1.0,
  };
  const calculatorsHub: Entry = {
    url: `${BASE_URL}/calculators`,
    lastModified: dateOf([...calculatorPages, bahHub, payHub]),
    changeFrequency: 'monthly',
    priority: 1.0,
  };
  const blogHub: Entry = { url: `${BASE_URL}/blog`, lastModified: dateOf(blogPages), changeFrequency: 'weekly', priority: 0.8 };
  const guidesHub: Entry = { url: `${BASE_URL}/guides`, lastModified: dateOf(guidePages), changeFrequency: 'monthly', priority: 0.9 };

  const transition = page('/transition', 'monthly', 0.9);
  const about = page('/about', 'yearly', 0.5);
  // Both set robots index:true,follow:true in their own metadata but were
  // absent from the sitemap — the only two indexable routes with that gap.
  const privacy = page('/privacy', 'yearly', 0.3);
  const terms = page('/terms', 'yearly', 0.3);
  const partners = page('/partners', 'monthly', 0.9);

  const home: Entry = {
    url: BASE_URL,
    lastModified: dateOf([calculatorsHub, blogHub, guidesHub, transition, vaRates]),
    changeFrequency: 'monthly',
    priority: 1.0,
  };

  const staticPages: Entry[] = [
    home,
    calculatorsHub,
    ...calculatorPages,
    transition,
    about,
    privacy,
    terms,
    partners,
    blogHub,
    guidesHub,
  ];
  const stationPages: Entry[] = [bahHub, ...stationChildren];
  const payPages: Entry[] = [payHub, raise, bahChanges, vaRates, payDates, ...rankPages];

  return [...staticPages, ...blogPages, ...guidePages, ...stationPages, ...payPages];
}
