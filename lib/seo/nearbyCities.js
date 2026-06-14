    // import { prisma } from "../prisma";

    // export async function getNearbyCities(
    // stateId,
    // cityId
    // ) {
    // return prisma.city.findMany({
    //     where: {
    //     stateId,

    //     NOT: {
    //         id: cityId,
    //     },
    //     },

    //     take: 5,

    //     orderBy: {
    //     name: "asc",
    //     },
    // });
    // }

    import { prisma } from "../prisma";

export async function getNearbyCities(
  stateId,
  cityId
) {
  return prisma.city.findMany({
    where: {
      stateId,

      NOT: {
        id: cityId,
      },
    },

    take: 5,

    orderBy: {
      name: "asc",
    },
  });
}