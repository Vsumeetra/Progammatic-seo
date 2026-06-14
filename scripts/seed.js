const { PrismaClient } = require("@prisma/client");
const { Country, State, City } = require("country-state-city");
const slugify = require("slugify");

const prisma = new PrismaClient();

function generateSlug(city, stateCode, countryCode) {
  return slugify(`${city}-${stateCode}-${countryCode}`, {
    lower: true,
    strict: true,
    trim: true,
  });
}

// Safe batch chunking
function chunkArray(array, size) {
  const chunks = [];

  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }

  return chunks;
}

async function seedServices() {
  await prisma.service.createMany({
    data: [
      {
        name: "Web Hosting",
        slug: "web-hosting",
      },
      {
        name: "Domain Registration",
        slug: "domain-registration",
      },
      {
        name: "SSL Certificates",
        slug: "ssl-certificates",
      },
      {
        name: "SEO Services",
        slug: "seo-services",
      },
    ],
    skipDuplicates: true,
  });

  console.log("Services seeded.");
}

async function seedLocations() {
  const countries = Country.getAllCountries();

  for (const country of countries) {
    // Country Upsert
    const createdCountry = await prisma.country.upsert({
      where: {
        isoCode: country.isoCode,
      },
      update: {},
      create: {
        name: country.name,
        isoCode: country.isoCode,
      },
    });

    // Fetch existing states once
    const existingStates = await prisma.state.findMany({
      where: {
        countryId: createdCountry.id,
      },
      select: {
        id: true,
        isoCode: true,
      },
    });

    // In-memory cache
    const stateCache = new Map(
      existingStates.map((state) => [
        state.isoCode,
        state.id,
      ])
    );

    const states = State.getStatesOfCountry(country.isoCode);

    for (const state of states) {
      let stateId = stateCache.get(state.isoCode);

      // Create state only if missing
      if (!stateId) {
        const createdState = await prisma.state.create({
          data: {
            name: state.name,
            isoCode: state.isoCode,
            countryId: createdCountry.id,
          },
        });

        stateId = createdState.id;

        // Update cache immediately
        stateCache.set(state.isoCode, stateId);
      }

      const cities = City.getCitiesOfState(
        country.isoCode,
        state.isoCode
      );

      if (cities.length === 0) continue;

      const cityData = cities.map((city) => ({
        name: city.name,
        slug: generateSlug(
          city.name,
          state.isoCode,
          country.isoCode
        ),
        stateId,
      }));

      // Safe chunking for MySQL
      const cityChunks = chunkArray(cityData, 1000);

      for (const chunk of cityChunks) {
        await prisma.city.createMany({
          data: chunk,
          skipDuplicates: true,
        });
      }
    }

    console.log(`Seeded: ${country.name}`);
  }
}

async function main() {
  console.log("Seeding started...");

  await seedServices();

  await seedLocations();

  console.log("Seeding completed successfully! ");
}

main()
  .catch((error) => {
    console.error("Seeding failed:");
    console.error(error);

    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });