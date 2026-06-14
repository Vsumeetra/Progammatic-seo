import { notFound } from "next/navigation";
import Link from "next/link";

import { getCityByRoute } from "@/lib/seo/cityQueries";
import { getNearbyCities } from "@/lib/seo/nearbyCities";

import { generatePageContent } from "@/lib/seo/contentEngine";
import { generateSeoMetadata } from "@/lib/seo/metadata";

// ISR: Rebuild page every 24 hours
export const revalidate = 86400;

/**
 * Dynamic Metadata Generator
 */
export async function generateMetadata({ params }) {
  const { service, country, state, city } = await params;

  const cityRecord = await getCityByRoute(
    city,
    state.toUpperCase(),
    country.toUpperCase()
  );

  if (!cityRecord) {
    return {
      title: "Page Not Found",
      robots: {
        index: false,
      },
    };
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000";

  const canonicalUrl =
    `${baseUrl}/${service}/${country.toLowerCase()}/${state.toLowerCase()}/${city.toLowerCase()}`;

  return generateSeoMetadata({
    serviceSlug: service,

    city: cityRecord,

    state: cityRecord.state,

    country: cityRecord.state.country,

    canonicalUrl,
  });
}

/**
 * Dynamic SEO Page
 */
export default async function Page({ params }) {
  const { service, country, state, city } = await params;

  const cityRecord = await getCityByRoute(
    city,
    state.toUpperCase(),
    country.toUpperCase()
  );

  // Invalid city/state/country combination
  if (!cityRecord) {
    notFound();
  }

  const content = generatePageContent(
    service,
    cityRecord,
    cityRecord.state,
    cityRecord.state.country
  );

  // Invalid service
  if (!content) {
    notFound();
  }

  const nearbyCities = await getNearbyCities(
    cityRecord.stateId,
    cityRecord.id
  );

  return (
    <main className="container mx-auto max-w-5xl px-4 py-12">

      {/* HERO */}
      <section className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-6">
          {content.headline}
        </h1>

        <p className="text-lg text-gray-600 leading-relaxed max-w-3xl">
          {content.description}
        </p>
      </section>

      {/* SERVICE CONTENT */}
      <section className="mb-12">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">

          <h2 className="text-2xl font-semibold mb-4">
            {content.serviceName} in {cityRecord.name}
          </h2>

          <p className="text-gray-600 leading-relaxed">
            Looking for reliable {content.serviceName.toLowerCase()} in{" "}
            {cityRecord.name}, {cityRecord.state.name}? Our solutions help
            businesses and individuals establish a strong online presence with
            trusted services, transparent pricing, and professional support.
          </p>

        </div>
      </section>

      {/* LOCATION INFO */}
      <section className="mb-12">
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8">

          <h2 className="text-2xl font-semibold mb-4">
            Service Coverage
          </h2>

          <ul className="space-y-2 text-gray-700">
            <li>
              <strong>City:</strong> {cityRecord.name}
            </li>

            <li>
              <strong>State:</strong> {cityRecord.state.name}
            </li>

            <li>
              <strong>Country:</strong> {cityRecord.state.country.name}
            </li>

            <li>
              <strong>Service:</strong> {content.serviceName}
            </li>
          </ul>

        </div>
      </section>

      {/* INTERNAL LINKING SECTION */}
      {nearbyCities?.length > 0 && (
        <section className="border-t border-gray-200 pt-10">

          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Nearby Cities We Serve
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">

            {nearbyCities.map((nearby) => (
              <Link
                key={nearby.id}
                href={`/${service}/${country.toLowerCase()}/${state.toLowerCase()}/${nearby.slug}`}
                className="block p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-blue-300 transition text-center"
              >
                <span className="text-blue-600 font-medium">
                  {content.serviceName} in {nearby.name}
                </span>
              </Link>
            ))}

          </div>

        </section>
      )}

    </main>
  );
}