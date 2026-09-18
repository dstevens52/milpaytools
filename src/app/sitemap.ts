import type { MetadataRoute } from 'next';
import { getAllPostMeta } from '@/lib/blog';
import { GUIDE_PAGES } from '@/data/guides/pages';
import { DUTY_STATIONS } from '@/data/duty-stations/stations';
import { PAY_PAGE_RANKS } from '@/data/pay-pages/ranks';

const BASE_URL = 'https://www.milpaytools.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/calculators`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/calculators/total-compensation`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/calculators/va-disability`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/calculators/tsp`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/calculators/retirement`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/calculators/pcs`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/calculators/guard-reserve`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/calculators/education`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/calculators/cola`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/calculators/dual-military-bah`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/calculators/compare`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/calculators/transition-readiness`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/calculators/separation-timeline`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/calculators/healthcare-comparison`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/calculators/va-loan`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 1.0,
    },
    // NOTE: calculator list is hand-maintained — update this when adding new calculators.
    {
      url: `${BASE_URL}/calculators/deployment`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/calculators/va-refinance`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/transition`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    // Both set robots index:true,follow:true in their own metadata but were
    // absent from the sitemap — the only two indexable routes with that gap.
    {
      url: `${BASE_URL}/privacy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/partners`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/guides`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
  ];

  const blogPages: MetadataRoute.Sitemap = getAllPostMeta().map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // Derived from the routed guide pages, not from MDX filenames — the MDX scan
  // used to drop /guides/navigating-service, which has a route but no MDX file.
  const guidePages: MetadataRoute.Sitemap = GUIDE_PAGES.map((guide) => ({
    url: `${BASE_URL}/guides/${guide.slug}`,
    lastModified: new Date(guide.date),
    changeFrequency: 'monthly',
    priority: 0.85,
  }));

  const stationPages: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/bah`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 1.0,
    },
    ...DUTY_STATIONS.map((s) => ({
      url: `${BASE_URL}/bah/${s.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];

  // /pay is the pay-charts calculator hub, so it matches the calculator entries.
  // Rank pages: pay tables change each January — yearly is accurate, not optimistic.
  const payPages: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/pay`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 1.0,
    },
    ...PAY_PAGE_RANKS.map((r) => ({
      url: `${BASE_URL}/pay/${r.slug}`,
      lastModified: now,
      changeFrequency: 'yearly' as const,
      priority: 0.7,
    })),
  ];

  return [...staticPages, ...blogPages, ...guidePages, ...stationPages, ...payPages];
}
