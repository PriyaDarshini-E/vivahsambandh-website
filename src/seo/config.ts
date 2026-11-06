import { COMPANY } from "../constants/company";

/**
 * Single source of truth for company constants and multi-language SEO metadata.
 * Updating values here or in `src/constants/company.ts` updates all metadata,
 * schemas, OpenGraph tags, and SSG prerendered HTML across English and Hindi automatically.
 */
export const COMPANY_CONFIG = {
  name: COMPANY.name,
  legalName: COMPANY.legalName,

  taglines: {
    en: "Tradition Meets New Beginnings",
    hi: "परंपरा से जुड़ें, नए रिश्तों की शुरुआत",
  },

  titles: {
    en: "Vivah Sambandh — Premium Community Matrimony | Tradition Meets New Beginnings",
    hi: "विवाहसंबंध — विश्वसनीय समुदाय मैट्रिमोनी | परंपरा से जुड़ें",
  },

  descriptions: {
    en: "Vivah Sambandh is India’s trusted premium Community Matrimony platform connecting verified Agarwal, Jain, Khandelwal and Maheshwari families through shared traditions, Gotra compatibility, and values for lifelong relationships.",
    hi: "विवाहसंबंध अग्रवाल, जैन, खंडेलवाल और माहेश्वरी परिवारों के लिए एक विश्वसनीय समुदाय मैट्रिमोनी मंच है, जो साझा संस्कारों, मूल्यों और परंपराओं के साथ जीवनसाथी खोजने में आपकी सहायता करता है।",
  },

  keywords: {
    en: "community matrimony, Agarwal matrimony, Vivah Sambandh, Agarwal shaadi, Agarwal brides, Agarwal grooms, Bansal gotra, Mittal gotra, Jindal gotra, Agarwal marriage bureau, premium matrimony India",
    hi: "समुदाय मैट्रिमोनी, अग्रवाल मैट्रिमोनी, विवाहसंबंध, अग्रवाल शादी, अग्रवाल रिश्ते, बंसल गोत्र, मित्तल गोत्र, जिंदल गोत्र, अग्रवाल वैवाहिक मंच",
  },

  siteOrigin: "https://vivahsambandh.com",
  canonicalUrl: "https://vivahsambandh.com/",
  logo: "https://vivahsambandh.com/crmapi/public/assets/images/company_images/logo.webp",
  ogImage: "https://vivahsambandh.com/images/home/home_banner_image.webp",

  author: COMPANY.name,
  publisher: COMPANY.name,
  robots:
    "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",

  supportEmail: COMPANY.supportEmail,
  supportPhone: COMPANY.supportPhoneDisplay,
  supportPhoneLink: COMPANY.supportPhoneLink,
  supportHours: COMPANY.supportHours,
  address: COMPANY.address,

  community: COMPANY.community,
  priceRange: "₹₹",

  faqs: {
    en: [
      {
        question: "Is my information secure on Vivah Sambandh?",
        answer:
          "Yes. We use strict verification, privacy controls and secure communication to protect every member and family.",
      },
      {
        question: "Can I search by Agarwal gotra or city?",
        answer:
          "Yes. Browse verified matches across all 18 Agarwal Gotras (Bansal, Mittal, Jindal, Singhal, etc.), cities, professions, and education.",
      },
      {
        question: "Are profiles on Vivah Sambandh verified?",
        answer:
          "Every profile passes strict screening plus optional official ID and family background verification before going live.",
      },
      {
        question: "How does the matching process work?",
        answer:
          "Create your profile, set your partner preferences, receive curated Agarwal matches with Kundali compatibility, and connect directly with families.",
      },
    ],
    hi: [
      {
        question: "क्या विवाहसंबंध पर मेरी जानकारी सुरक्षित है?",
        answer:
          "हाँ, हम हर सदस्य की सुरक्षा के लिए कड़े सत्यापन, गोपनीयता नियंत्रण और सुरक्षित संचार का उपयोग करते हैं।",
      },
      {
        question: "क्या मैं गोत्र या शहर के अनुसार जीवनसाथी खोज सकता हूँ?",
        answer:
          "हाँ, आप शहर, सभी 18 अग्रवाल गोत्र, व्यवसाय, शिक्षा और कई अन्य फ़िल्टर के आधार पर प्रोफाइल देख सकते हैं।",
      },
      {
        question: "क्या विवाहसंबंध पर सभी प्रोफाइल सत्यापित हैं?",
        answer:
          "हर प्रोफाइल लाइव होने से पहले सख्त जांच और पहचान सत्यापन से गुजरती है।",
      },
      {
        question: "रिश्ता खोजने की प्रक्रिया कैसे काम करती है?",
        answer:
          "अपनी प्रोफाइल बनाएं, प्राथमिकताएं चुनें, उपयुक्त रिश्ते देखें और परिवारों से सीधे संपर्क करें।",
      },
    ],
  },
} as const;

export type CompanyConfig = typeof COMPANY_CONFIG;
export type SupportedLang = "en" | "hi";
export const SUPPORTED_SSG_ROUTES = [
  "/",
  "/hi",
  "/registration",
  "/hi/registration",
  "/register",
  "/hi/register",
  "/about",
  "/hi/about",
  "/stories",
  "/hi/stories",
  "/success-stories",
  "/hi/success-stories",
  // "/membership",
  // "/hi/membership",
  "/contact",
  "/hi/contact",
  "/blogs",
  "/hi/blogs",
  "/privacy",
  "/hi/privacy",
  "/terms",
  "/hi/terms",
  "/guidelines",
  "/hi/guidelines",
  "/help-center",
  "/hi/help-center",
  "/admin-register",
  "/hi/admin-register",
  "/download",
  "/hi/download",
] as const;

/** Standalone pages that carry their own SEO metadata. */
export type PageKey =
  | "home"
  | "about"
  | "stories"
  | "membership"
  | "contact"
  | "blogs"
  | "privacy"
  | "terms"
  | "guidelines"
  | "help-center"
  | "registration"
  | "download"
  | "admin-register";

/**
 * Per-page SEO metadata (both languages). Home entries intentionally mirror
 * COMPANY_CONFIG.titles/descriptions above — single source stays here.
 */
export const PAGE_SEO: Record<
  PageKey,
  {
    titles: Record<SupportedLang, string>;
    descriptions: Record<SupportedLang, string>;
  }
> = {
  home: {
    titles: {
      en: "Vivah Sambandh — Premium Community Matrimony | Tradition Meets New Beginnings",
      hi: "विवाहसंबंध — विश्वसनीय समुदाय मैट्रिमोनी | परंपरा से जुड़ें",
    },
    descriptions: {
      en: "Vivah Sambandh is India’s trusted premium Community Matrimony platform connecting verified Agarwal, Jain, Khandelwal and Maheshwari families through shared traditions, Gotra compatibility, and values for lifelong relationships.",
      hi: "विवाहसंबंध अग्रवाल, जैन, खंडेलवाल और माहेश्वरी परिवारों के लिए एक विश्वसनीय समुदाय मैट्रिमोनी मंच है, जो साझा संस्कारों, मूल्यों और परंपराओं के साथ जीवनसाथी खोजने में आपकी सहायता करता है।",
    },
  },
  about: {
    titles: {
      en: "About Us — Vivah Sambandh | Trusted Community Matrimony Platform",
      hi: "हमारे बारे में — विवाहसंबंध | विश्वसनीय समुदाय मैट्रिमोनी मंच",
    },
    descriptions: {
      en: "Learn about Vivah Sambandh — India’s trusted Community Matrimony platform built on tradition, strict verification and family values to help families find their perfect match.",
      hi: "विवाहसंबंध के बारे में जानें — परंपरा, कड़े सत्यापन और पारिवारिक मूल्यों पर आधारित समुदाय मैट्रिमोनी मंच जो परिवारों को सही जीवनसाथी खोजने में मदद करता है।",
    },
  },
  stories: {
    titles: {
      en: "Success Stories — Vivah Sambandh | Community Matrimony Weddings",
      hi: "सफलता की कहानियां — विवाहसंबंध | सफल सामुदायिक विवाह",
    },
    descriptions: {
      en: "Read inspiring wedding stories of 500+ couples who found their life partner through Vivah Sambandh with shared values and family trust.",
      hi: "विवाहसंबंध के माध्यम से जुड़े 500+ दंपत्तियों की सुखद विवाह गाथाएं पढ़ें और अपनी शादी की कहानी साझा करें।",
    },
  },
  membership: {
    titles: {
      en: "Membership Plans — Vivah Sambandh | Premium Community Matrimony",
      hi: "सदस्यता योजनाएं — विवाहसंबंध | पारदर्शी एवं भरोसेमंद प्लान",
    },
    descriptions: {
      en: "Explore transparent membership plans for Agarwal, Jain, Khandelwal and Maheshwari families. Verified profile access, Kundali matching, and dedicated matchmaker guidance.",
      hi: "अग्रवाल, जैन, खंडेलवाल और माहेश्वरी परिवारों के लिए पारदर्शी सदस्यता योजनाएं देखें — सत्यापित प्रोफाइल, कुंडली मिलान और व्यक्तिगत परामर्शदाता सहायता।",
    },
  },
  contact: {
    titles: {
      en: "Contact Us — Vivah Sambandh | Community Matrimony Support",
      hi: "संपर्क करें — विवाहसंबंध | समुदाय मैट्रिमोनी सहायता",
    },
    descriptions: {
      en: "Have a question or need support? Contact the Vivah Sambandh team by phone, email or visit our office — we reply within 24 hours.",
      hi: "कोई प्रश्न है या सहायता चाहिए? फोन, ईमेल द्वारा विवाहसंबंध टीम से संपर्क करें या हमारे कार्यालय पधारें — हम 24 घंटों के भीतर उत्तर देते हैं।",
    },
  },
  blogs: {
    titles: {
      en: "Blogs — Vivah Sambandh | Relationship Guides & Community Stories",
      hi: "ब्लॉग — विवाहसंबंध | रिश्तों की जानकारियां और सामुदायिक कहानियां",
    },
    descriptions: {
      en: "Browse every Vivah Sambandh article — relationship guidance, wedding tips and community matrimony updates.",
      hi: "विवाहसंबंध के सभी लेख देखें — रिश्तों का मार्गदर्शन, शादी के टिप्स और सामुदायिक अपडेट।",
    },
  },
  privacy: {
    titles: {
      en: "Privacy Policy — Vivah Sambandh | How We Protect Your Data",
      hi: "गोपनीयता नीति — विवाहसंबंध | आपका डेटा कैसे सुरक्षित है",
    },
    descriptions: {
      en: "Read the Vivah Sambandh privacy policy — what information we collect, how we use it and the choices you have.",
      hi: "विवाहसंबंध गोपनीयता नीति पढ़ें — हम कौन सी जानकारी लेते हैं, उसका उपयोग कैसे होता है और आपके विकल्प।",
    },
  },
  terms: {
    titles: {
      en: "Terms & Conditions — Vivah Sambandh | Terms of Use",
      hi: "नियम व शर्तें — विवाहसंबंध | उपयोग की शर्तें",
    },
    descriptions: {
      en: "Read the Vivah Sambandh terms of use — eligibility, verification, acceptable use and membership terms.",
      hi: "विवाहसंबंध उपयोग की शर्तें पढ़ें — पात्रता, सत्यापन, स्वीकार्य उपयोग व सदस्यता नियम।",
    },
  },
  guidelines: {
    titles: {
      en: "Community Guidelines — Vivah Sambandh | A Respectful Community",
      hi: "समुदाय दिशानिर्देश — विवाहसंबंध | सम्मानजनक समुदाय",
    },
    descriptions: {
      en: "Vivah Sambandh community guidelines — genuine profiles, respectful communication and staying safe.",
      hi: "विवाहसंबंध समुदाय दिशानिर्देश — वास्तविक प्रोफाइल, सम्मानजनक संवाद और सुरक्षा।",
    },
  },
  "help-center": {
    titles: {
      en: "Help Center — Vivah Sambandh | Support & FAQs",
      hi: "हेल्प सेंटर — विवाहसंबंध | सहायता व प्रश्न",
    },
    descriptions: {
      en: "Vivah Sambandh help center — profile help, match search, membership, safety and how to reach our team.",
      hi: "विवाहसंबंध हेल्प सेंटर — प्रोफाइल सहायता, रिश्ता खोज, सदस्यता, सुरक्षा व टीम से संपर्क।",
    },
  },
  registration: {
    titles: {
      en: "Bio-Data Registration — Vivah Sambandh Community Matrimony | Register Your Profile",
      hi: "विवाह संबंध पंजीकरण — बायोडाटा रजिस्टर करें | समुदाय मैट्रिमोनी",
    },
    descriptions: {
      en: "Register your verified bio-data on Vivah Sambandh. Trusted community matrimony matchmaking for Agarwal, Jain, Khandelwal, and Maheshwari communities.",
      hi: "विवाह संबंध में अपना सत्यापित बायोडाटा पंजीकृत करें। अग्रवाल, जैन, खंडेलवाल और माहेश्वरी समाज के लिए विश्वसनीय समुदाय मैट्रिमोनी मंच।",
    },
  },
  download: {
    titles: {
      en: "Download Vivah Sambandh App — Premium Community Matrimony on Android & iOS",
      hi: "विवाहसंबंध ऐप डाउनलोड करें — Android व iOS पर विश्वसनीय समुदाय मैट्रिमोनी",
    },
    descriptions: {
      en: "Download the Vivah Sambandh mobile app for Android and iOS. Connect with verified matches, receive instant alerts, and find your life partner on the go.",
      hi: "Android और iOS के लिए विवाहसंबंध मोबाइल ऐप डाउनलोड करें। सत्यापित रिश्ते खोजें, तुरंत सूचनाएं पाएं और कहीं भी जीवनसाथी से जुड़ें।",
    },
  },
  "admin-register": {
    titles: {
      en: "Admin Registration — Vivah Sambandh Community Matrimony Portal",
      hi: "एडमिन पंजीकरण — विवाहसंबंध समुदाय मैट्रिमोनी पोर्टल",
    },
    descriptions: {
      en: "Administrative registration portal for Vivah Sambandh community coordinators and verified managers.",
      hi: "विवाहसंबंध समुदाय समन्वयकों और प्रबंधकों के लिए प्रशासनिक पंजीकरण पोर्टल।",
    },
  },
};

/**
 * Maps any app pathname to its SEO page key. Language prefixes, casing
 * and trailing slashes are normalized — unknown paths fall back to home.
 */
export function resolvePageKey(pathname = "/"): PageKey {
  const clean = pathname.toLowerCase().replace(/\/+$/, "");
  const withoutLang = clean === "/hi" ? "" : clean.replace(/^\/hi(?=\/|$)/, "");
  if (withoutLang === "/about") return "about";
  if (withoutLang === "/stories" || withoutLang === "/success-stories")
    return "stories";
  // if (withoutLang === "/membership") return "membership";
  if (withoutLang === "/contact") return "contact";
  if (withoutLang === "/blogs" || withoutLang.startsWith("/blogs/"))
    return "blogs";
  if (withoutLang === "/privacy") return "privacy";
  if (withoutLang === "/terms") return "terms";
  if (withoutLang === "/guidelines") return "guidelines";
  if (withoutLang === "/help-center") return "help-center";
  if (withoutLang === "/registration" || withoutLang === "/register")
    return "registration";
  if (withoutLang === "/download") return "download";
  if (withoutLang === "/admin-register") return "admin-register";
  return "home";
}

/** Absolute app path of a page in a language ('/about' / '/hi/about'). */
export function getPagePath(page: PageKey, lang: SupportedLang): string {
  const base = page === "home" ? "" : `/${page}`;
  return lang === "hi" ? `/hi${base}` : base || "/";
}

export const LANG_METADATA: Record<
  SupportedLang,
  { label: string; nativeName: string; locale: string }
> = {
  en: { label: "English", nativeName: "English", locale: "en_IN" },
  hi: { label: "Hindi", nativeName: "हिन्दी", locale: "hi_IN" },
};

export const SITE_NAME = COMPANY_CONFIG.name;
export const SITE_ORIGIN = COMPANY_CONFIG.siteOrigin;
export const SITE_OG_IMAGE = COMPANY_CONFIG.ogImage;
export const SITE_LOGO = COMPANY_CONFIG.logo;

/**
 * Computes an absolute, normalized canonical URL for any route and language.
 * Page path is always preserved (including under the `/hi` prefix), so every
 * prerendered route and every client navigation resolves its own canonical.
 */
export function getCanonicalUrl(
  pathname = "",
  lang: SupportedLang = "en",
): string {
  const lower = pathname.toLowerCase().replace(/\/+$/, "");
  const isHiPath = lower === "/hi" || lower.startsWith("/hi/");
  const hi = lang === "hi" || isHiPath;
  const withoutLang = isHiPath ? lower.replace(/^\/hi(?=\/|$)/, "") : lower;
  const page = withoutLang.replace(/^\/+/, "");
  if (!page)
    return hi
      ? `${COMPANY_CONFIG.siteOrigin}/hi`
      : `${COMPANY_CONFIG.siteOrigin}/`;
  return hi
    ? `${COMPANY_CONFIG.siteOrigin}/hi/${page}`
    : `${COMPANY_CONFIG.siteOrigin}/${page}`;
}
