import { generatePageContent } from "./contentEngine";

/**
 * Safely truncates text at a word boundary
 */
function smartTruncate(text, maxLength) {
  if (!text || text.length <= maxLength) {
    return text;
  }

  let truncated = text.slice(0, maxLength - 3);

  const lastSpace = truncated.lastIndexOf(" ");

  if (lastSpace > 0) {
    truncated = truncated.slice(0, lastSpace);
  }

  return `${truncated}...`;
}

/**
 * Extracts display names from strings or Prisma objects
 */
function getDisplayName(value) {
  if (!value) return "";

  if (typeof value === "object") {
    return value.name ?? "";
  }

  return String(value);
}

export function generateSeoMetadata({
  serviceSlug,
  city,
  state,
  country,
  canonicalUrl,
}) {
  const content = generatePageContent(
    serviceSlug,
    city,
    state,
    country
  );

  if (!content) {
    return {
      title: "Service Location Not Found",

      description:
        "Explore our range of digital services and business solutions.",

      robots: {
        index: false,
        follow: true,
      },
    };
  }

  const cityName = getDisplayName(city);
  const stateName = getDisplayName(state);
  const countryName = getDisplayName(country);

  const serviceKeyword = serviceSlug
    ?.replace(/-/g, " ")
    ?.replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );

  const serviceName =
    content.serviceName ||
    serviceKeyword ||
    "Professional Services";

  const headline =
    content.headline ||
    `${serviceName} in ${cityName}, ${stateName}`;

  const bodyDescription =
    content.description ||
    `Professional ${serviceName} available in ${cityName}, ${stateName}, ${countryName}. Contact our experts today for reliable and affordable solutions.`;

  const title = smartTruncate(
    headline,
    65
  );

  const description =
    smartTruncate(
      bodyDescription,
      155
    );

  return {
    title,

    description,

    robots: {
      index: true,
      follow: true,

      googleBot: {
        index: true,
        follow: true,
      },
    },

    alternates: {
      canonical:
        canonicalUrl || undefined,
    },

    openGraph: {
      title,

      description,

      url: canonicalUrl,

      type: "website",

      siteName:
        process.env
          .NEXT_PUBLIC_SITE_NAME ||
        "Global Digital Services",

      locale: "en_US",

      images: [
        {
          url: "/og-default.jpg",

          width: 1200,

          height: 630,

          alt: title,
        },
      ],
    },

    twitter: {
      card:
        "summary_large_image",

      title,

      description,

      images: [
        "/og-default.jpg",
      ],
    },
  };
}