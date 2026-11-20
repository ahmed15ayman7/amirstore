import type { StoreData } from "./types";
import { WA_NUMBER } from "./contact";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")
).replace(/\/$/, "");

export const SITE_NAME = "Amir Store";
export const SEO_TITLE = "Amir Store | شحن كوينز eFootball بيس 2027 بأرخص سعر في مصر";
export const SEO_DESC =
  "شحن كوينز eFootball (بيس) أندرويد وآيفون بأقل سعر في مصر، شرعي ومضمون ومن غير ما ندخل على حسابك. عروض يومية، دفع فودافون كاش وإنستاباي، وشحن لكل الألعاب. Amir Store من 2021.";
export const SEO_KEYWORDS = [
  "شحن كوينز",
  "شحن كوينز eFootball",
  "شحن كوينز بيس",
  "كوينز بيس",
  "كوينز بيس 2027",
  "eFootball 2027",
  "اسعار كوينز بيس",
  "شحن كوينز بيس ايفون",
  "شحن كوينز بيس اندرويد",
  "شحن كوينز فودافون كاش",
  "ارخص شحن كوينز في مصر",
  "شحن العاب مصر",
  "eFootball coins Egypt",
  "Amir Store",
];

const platformName = (label: string) => label.replace(/^[^\p{L}]+/u, "").trim() || label;

/** One JSON-LD graph: brand, website, store + price catalog, FAQ. */
export function buildJsonLd(data: StoreData) {
  const orgId = `${SITE_URL}/#org`;
  const offers = data.platforms.flatMap((pl) =>
    pl.items
      .filter((it) => !it.ask && it.p > 0)
      .map((it) => {
        const coins = it.c.toLocaleString("en-US");
        const what = it.kind === "bundle" && it.name ? `${it.name} + ${coins} كوين` : `${coins} كوين eFootball`;
        const kind = it.kind === "offer" ? "عرض" : it.kind === "bundle" ? "باقة لاعب" : "السعر الأساسي";
        return {
          "@type": "Offer",
          price: it.p,
          priceCurrency: "EGP",
          availability: "https://schema.org/InStock",
          url: `${SITE_URL}/#prices`,
          seller: { "@id": orgId },
          itemOffered: {
            "@type": "Product",
            name: `شحن ${what} - ${platformName(pl.label)}`,
            description: `${kind} · شحن ${what} على ${platformName(pl.label)} من Amir Store`,
            brand: { "@id": orgId },
            image: `${SITE_URL}/logo.png`,
          },
        };
      }),
  );

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": orgId,
        name: SITE_NAME,
        alternateName: ["أمير ستور", "Amir Store eFootball"],
        url: SITE_URL,
        logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png`, width: 640, height: 640 },
        image: `${SITE_URL}/logo.png`,
        foundingDate: "2021",
        contactPoint: {
          "@type": "ContactPoint",
          telephone: `+${WA_NUMBER}`,
          contactType: "customer service",
          areaServed: "EG",
          availableLanguage: ["Arabic"],
        },
        sameAs: ["https://www.facebook.com/share/p/1BFrnnuxXy/"],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        alternateName: "أمير ستور",
        inLanguage: "ar-EG",
        publisher: { "@id": orgId },
      },
      {
        "@type": "OnlineStore",
        "@id": `${SITE_URL}/#store`,
        name: `${SITE_NAME} - شحن كوينز eFootball`,
        url: SITE_URL,
        image: `${SITE_URL}/logo.png`,
        description: SEO_DESC,
        parentOrganization: { "@id": orgId },
        areaServed: { "@type": "Country", name: "Egypt" },
        currenciesAccepted: "EGP",
        paymentAccepted: "Vodafone Cash, InstaPay, Etisalat Cash, Orange Cash",
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "أسعار شحن كوينز eFootball",
          itemListElement: offers,
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE_URL}/#faq`,
        inLanguage: "ar-EG",
        mainEntity: data.faq.map(([q, a]) => ({
          "@type": "Question",
          name: q,
          acceptedAnswer: { "@type": "Answer", text: a },
        })),
      },
    ],
  };
}
