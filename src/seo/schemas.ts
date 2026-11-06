/**
 * @file src/seo/schemas.ts
 * Typed Schema.org JSON-LD graph builders for Google Rich Results.
 *
 * Utilizes `schema-dts` for compile-time type safety against official Schema.org standards.
 * Supports multi-language output (English & Hindi) powered by `COMPANY_CONFIG`.
 */

import type {
  Answer,
  BreadcrumbList,
  ContactPoint,
  FAQPage,
  ImageObject,
  ListItem,
  Organization,
  PostalAddress,
  Question,
  SearchAction,
  Thing,
  WebPage,
  WebSite,
} from 'schema-dts';
import {
  COMPANY_CONFIG,
  PAGE_SEO,
  SITE_NAME,
  SITE_ORIGIN,
  SITE_OG_IMAGE,
  SITE_LOGO,
  getCanonicalUrl,
  getPagePath,
  type PageKey,
  type SupportedLang,
} from './config';

export { SITE_NAME, SITE_ORIGIN, SITE_OG_IMAGE, SITE_LOGO, getCanonicalUrl };

/**
 * Builds the primary Organization Schema for Vivah Sambandh.
 */
export function organizationSchema(lang: SupportedLang = 'en'): Organization {
  return {
    '@type': 'Organization',
    '@id': `${COMPANY_CONFIG.siteOrigin}/#organization`,
    name: COMPANY_CONFIG.name,
    legalName: COMPANY_CONFIG.legalName,
    url: `${COMPANY_CONFIG.siteOrigin}/`,
    logo: {
      '@type': 'ImageObject',
      url: COMPANY_CONFIG.logo,
    } as ImageObject,
    image: COMPANY_CONFIG.ogImage,
    description: COMPANY_CONFIG.descriptions[lang],
    email: COMPANY_CONFIG.supportEmail,
    telephone: COMPANY_CONFIG.supportPhone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: COMPANY_CONFIG.address[lang],
      addressLocality: 'Bengaluru',
      addressRegion: 'Karnataka',
      postalCode: '560001',
      addressCountry: 'IN',
    } as PostalAddress,
    sameAs: [],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: COMPANY_CONFIG.supportPhone,
        contactType: 'customer support',
        areaServed: 'IN',
        availableLanguage: ['en', 'hi'],
      } as ContactPoint,
    ],
  };
}

/**
 * Builds the WebSite Schema node with search query capability.
 */
export function websiteSchema(lang: SupportedLang = 'en'): WebSite {
  return {
    '@type': 'WebSite',
    '@id': `${COMPANY_CONFIG.siteOrigin}/#website`,
    name: COMPANY_CONFIG.name,
    url: `${COMPANY_CONFIG.siteOrigin}/`,
    publisher: {
      '@id': `${COMPANY_CONFIG.siteOrigin}/#organization`,
    },
    inLanguage: lang === 'hi' ? ['hi', 'en'] : ['en', 'hi'],
    potentialAction: {
      '@type': 'SearchAction',
      target: `${COMPANY_CONFIG.siteOrigin}/#search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    } as SearchAction,
  };
}

/**
 * Builds BreadcrumbList schema for navigation rich results.
 */
export function breadcrumbSchema(
  lang: SupportedLang = 'en',
  items: Array<{ name: string; path: string }> = [
    { name: lang === 'hi' ? 'होम' : 'Home', path: lang === 'hi' ? '/hi' : '/' },
  ],
): BreadcrumbList {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: getCanonicalUrl(item.path, lang),
    } as ListItem)),
  };
}

/**
 * Builds the WebPage Schema node for the current route with BreadcrumbList.
 */
export function webPageSchema(lang: SupportedLang = 'en', page: PageKey = 'home'): WebPage {
  const pageUrl = getCanonicalUrl(getPagePath(page, lang), lang);
  return {
    '@type': 'WebPage',
    '@id': `${pageUrl}#webpage`,
    url: pageUrl,
    name: PAGE_SEO[page].titles[lang],
    description: PAGE_SEO[page].descriptions[lang],
    isPartOf: {
      '@id': `${COMPANY_CONFIG.siteOrigin}/#website`,
    },
    about: {
      '@id': `${COMPANY_CONFIG.siteOrigin}/#organization`,
    },
    author: {
      '@id': `${COMPANY_CONFIG.siteOrigin}/#organization`,
    },
    publisher: {
      '@id': `${COMPANY_CONFIG.siteOrigin}/#organization`,
    },
    inLanguage: lang === 'hi' ? ['hi', 'en'] : ['en', 'hi'],
    breadcrumb: breadcrumbSchema(lang),
  };
}

/**
 * Builds the FAQPage Schema from the platform FAQs in the specified language.
 */
export function faqPageSchema(lang: SupportedLang = 'en'): FAQPage {
  const pageUrl = getCanonicalUrl('', lang);
  const faqList = COMPANY_CONFIG.faqs[lang];
  return {
    '@type': 'FAQPage',
    '@id': `${pageUrl}#faq`,
    mainEntity: faqList.map((faq) => ({
      '@type': 'Question' as const,
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer' as const,
        text: faq.answer,
      } as Answer,
    } as Question)),
  };
}

/**
 * Assembles a unified `@context/@graph` structured data object containing all active schemas.
 */
export function createCompositeGraph(lang: SupportedLang = 'en', page: PageKey = 'home'): {
  '@context': string;
  '@graph': Thing[];
} {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      organizationSchema(lang),
      websiteSchema(lang),
      webPageSchema(lang, page),
      faqPageSchema(lang),
    ],
  };
}
