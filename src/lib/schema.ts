const BASE_URL = 'https://www.milpaytools.com';

// Appends Central Time offset if the date string is bare (YYYY-MM-DD).
function toISODateTime(dateStr: string): string {
  if (dateStr.includes('T')) return dateStr;
  return `${dateStr}T00:00:00-05:00`;
}

const PUBLISHER = {
  '@type': 'Organization' as const,
  name: 'MilPayTools',
  url: BASE_URL,
};

const AUTHOR = {
  '@type': 'Person' as const,
  name: 'Dan Stevens',
  url: BASE_URL,
};

export function articleSchema({
  title,
  description,
  datePublished,
  url,
}: {
  title: string;
  description: string;
  datePublished: string;
  url: string;
}) {
  const isoDate = toISODateTime(datePublished);
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    // No `image`: it is optional on Article, and the only candidate the repo
    // has is the /api/og share card — a social preview, not a content image
    // representing the article. Pointing at it made every Article block emit a
    // crawlable /api/og URL, which is how those URLs entered the index.
    author: AUTHOR,
    publisher: PUBLISHER,
    datePublished: isoDate,
    dateModified: isoDate,
    url: `${BASE_URL}${url}`,
  };
}

export function webApplicationSchema({
  name,
  description,
  url,
}: {
  name: string;
  description: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name,
    description,
    url: `${BASE_URL}${url}`,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };
}

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'MilPayTools',
    url: BASE_URL,
    description: 'Free military financial calculators using official 2026 DoD data',
    sameAs: [
      'https://www.instagram.com/milpaytools/',
      'https://www.tiktok.com/@milpaytools',
      'https://x.com/milpaytools',
      'https://www.youtube.com/@milpaytools',
      'https://www.facebook.com/milpaytools',
    ],
  };
}

export function faqPageSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: answer,
      },
    })),
  };
}

export function breadcrumbListSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(({ name, url }, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name,
      item: url.startsWith('http') ? url : `${BASE_URL}${url}`,
    })),
  };
}
