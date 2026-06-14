import { services } from "../services";
import { parseTemplate } from "./templateEngine";

/**
 * Generates dynamic SEO content.
 *
 * Supports:
 * - Prisma models
 * - Plain strings
 *
 * Example:
 * generatePageContent(
 *   "web-hosting",
 *   cityRecord,
 *   cityRecord.state,
 *   cityRecord.state.country
 * )
 */
export function generatePageContent(
  serviceSlug,
  city,
  state,
  country
) {
  const service = services[serviceSlug];

  if (!service) {
    return null;
  }

  const cityName =
    typeof city === "object"
      ? city?.name ?? ""
      : city ?? "";

  const stateName =
    typeof state === "object"
      ? state?.name ?? ""
      : state ?? "";

  const countryName =
    typeof country === "object"
      ? country?.name ?? ""
      : country ?? "";

  const variables = {
    city: cityName,
    state: stateName,
    country: countryName,
    service: service.name,
  };

  return {
    serviceName: service.name,

    headline: parseTemplate(
      service.headline,
      variables
    ),

    description: parseTemplate(
      service.description,
      variables
    ),

    variables,
  };
}