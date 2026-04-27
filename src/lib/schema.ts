const BASE_URL = 'https://www.milpaytools.com';
const DEFAULT_IMAGE = `${BASE_URL}/og-image.png`;

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
    image: DEFAULT_IMAGE,
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
      'https://www.instagram.com/milpaytools',
      'https://www.tiktok.com/@milpaytools',
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
