// import { prisma } from "../prisma";

// /**
//  * Fetches a city securely by verifying both its slug AND its parent state structure.
//  * This guarantees no multi-state city name collisions.
//  *
//  * @param {string} citySlug
//  * @param {string} stateIsoCode
//  */
// export async function getCityBySlug(
//   citySlug,
//   stateIsoCode
// ) {
//   return prisma.city.findFirst({
//     where: {
//       slug: citySlug,
//       state: {
//         isoCode: stateIsoCode,
//       },
//     },
//     include: {
//       state: {
//         include: {
//           country: true,
//         },
//       },
//     },
//   });
// }
import { prisma } from "../prisma";

export async function getCityByRoute(
  citySlug,
  stateIsoCode,
  countryIsoCode
) {
  return prisma.city.findFirst({
    where: {
      slug: citySlug,

      state: {
        isoCode: stateIsoCode,

        country: {
          isoCode: countryIsoCode,
        },
      },
    },

    include: {
      state: {
        include: {
          country: true,
        },
      },
    },
  });
}