import { PrismaClient } from '@prisma/client';

type CountryTimezone = {
  zoneName: string;
  gmtOffset: number;
  gmtOffsetName: string;
  abbreviation?: string;
  tzName?: string;
};

type CountryRow = {
  name: string;
  isoCode: string;
  flag?: string;
  phonecode?: string;
  currency?: string;
  flagImage?: string;
  latitude?: string;
  longitude?: string;
  timezones?: CountryTimezone[];
};

type StateRow = {
  name: string;
  isoCode: string;
  countryCode: string;
  latitude?: string;
  longitude?: string;
};

type CityRow = {
  name: string;
  countryCode: string;
  stateCode: string;
  latitude?: string;
  longitude?: string;
};

type CountryModule = { CountriesData: CountryRow[] };
type StateModule = { StatesData: StateRow[] };
type CityModule = { CitiesData: CityRow[] };

const CHUNK_SIZE = 1000;

function normalizeText(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function normalizeRegion(value: string): string {
  return normalizeText(value).replace(/\b(province|state|emirate|territory)\b/g, '').replace(/\s+/g, ' ').trim();
}

function toDecimal(value?: string): string | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? value : null;
}

function chunkArray<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

export async function seedCountryData(prisma: PrismaClient): Promise<void> {
  const { CountriesData } = require('../country-data/countries.js') as CountryModule;
  const { StatesData } = require('../country-data/states.js') as StateModule;
  const { CitiesData } = require('../country-data/cities.js') as CityModule;

  const countryIdByIso = new Map<string, string>();
  const stateIdByKey = new Map<string, string>();
  const stateNameByKey = new Map<string, string>();
  const timezoneIdByCountry = new Map<string, string>();

  for (const country of CountriesData) {
    const upserted = await prisma.country.upsert({
      where: { isoCode: country.isoCode },
      update: {
        name: country.name,
        flag: country.flag ?? null,
        phoneCode: country.phonecode ?? null,
        currency: country.currency ?? null,
        flagImage: country.flagImage ?? null,
        latitude: toDecimal(country.latitude),
        longitude: toDecimal(country.longitude),
        isActive: true,
      },
      create: {
        name: country.name,
        isoCode: country.isoCode,
        flag: country.flag ?? null,
        phoneCode: country.phonecode ?? null,
        currency: country.currency ?? null,
        flagImage: country.flagImage ?? null,
        latitude: toDecimal(country.latitude),
        longitude: toDecimal(country.longitude),
        isActive: true,
      },
      select: { id: true, isoCode: true },
    });
    countryIdByIso.set(upserted.isoCode, upserted.id);
  }

  for (const state of StatesData) {
    const countryId = countryIdByIso.get(state.countryCode);
    if (!countryId) continue;

    const upserted = await prisma.state.upsert({
      where: {
        countryId_isoCode: {
          countryId,
          isoCode: state.isoCode,
        },
      },
      update: {
        name: state.name,
        latitude: toDecimal(state.latitude),
        longitude: toDecimal(state.longitude),
        isActive: true,
      },
      create: {
        countryId,
        name: state.name,
        isoCode: state.isoCode,
        latitude: toDecimal(state.latitude),
        longitude: toDecimal(state.longitude),
        isActive: true,
      },
      select: { id: true, countryId: true, isoCode: true, name: true },
    });

    const key = `${state.countryCode}:${state.isoCode}`;
    stateIdByKey.set(key, upserted.id);
    stateNameByKey.set(key, upserted.name);
  }

  for (const country of CountriesData) {
    const countryId = countryIdByIso.get(country.isoCode);
    if (!countryId) continue;
    const timezones = country.timezones ?? [];

    for (let index = 0; index < timezones.length; index += 1) {
      const tz = timezones[index];
      const upserted = await prisma.timezone.upsert({
        where: {
          countryId_zoneName: {
            countryId,
            zoneName: tz.zoneName,
          },
        },
        update: {
          gmtOffset: tz.gmtOffset,
          gmtOffsetName: tz.gmtOffsetName,
          abbreviation: tz.abbreviation ?? null,
          tzName: tz.tzName ?? null,
        },
        create: {
          countryId,
          zoneName: tz.zoneName,
          gmtOffset: tz.gmtOffset,
          gmtOffsetName: tz.gmtOffsetName,
          abbreviation: tz.abbreviation ?? null,
          tzName: tz.tzName ?? null,
        },
        select: { id: true },
      });

      if (index === 0) {
        timezoneIdByCountry.set(country.isoCode, upserted.id);
      }
    }
  }

  const existingCities = await prisma.city.findMany({
    select: {
      id: true,
      nameEn: true,
      province: true,
      externalKey: true,
      countryId: true,
    },
  });

  const legacyCityIdByMatch = new Map<string, string>();
  for (const city of existingCities) {
    if (city.externalKey || city.countryId) continue;
    const key = `${normalizeText(city.nameEn)}|${normalizeRegion(city.province ?? '')}`;
    if (!legacyCityIdByMatch.has(key)) {
      legacyCityIdByMatch.set(key, city.id);
    }
  }

  const createRows: Array<{
    externalKey: string;
    nameEn: string;
    countryId: string;
    stateId: string | null;
    timezoneId: string | null;
    province: string | null;
    latitude: string | null;
    longitude: string | null;
    isActive: boolean;
  }> = [];

  const updateRows: Array<{
    id: string;
    data: {
      externalKey: string;
      nameEn: string;
      countryId: string;
      stateId: string | null;
      timezoneId: string | null;
      province: string | null;
      latitude: string | null;
      longitude: string | null;
      isActive: boolean;
    };
  }> = [];

  const seenExternalKeys = new Set<string>();
  const usedLegacyCityIds = new Set<string>();

  for (const city of CitiesData) {
    const countryId = countryIdByIso.get(city.countryCode);
    if (!countryId) continue;

    const stateKey = `${city.countryCode}:${city.stateCode}`;
    const stateId = stateIdByKey.get(stateKey) ?? null;
    const stateName = stateNameByKey.get(stateKey) ?? null;
    const timezoneId = timezoneIdByCountry.get(city.countryCode) ?? null;
    const externalKey = `${city.countryCode}:${city.stateCode}:${normalizeText(city.name)}`;
    if (seenExternalKeys.has(externalKey)) continue;
    seenExternalKeys.add(externalKey);

    const cityPayload = {
      externalKey,
      nameEn: city.name,
      countryId,
      stateId,
      timezoneId,
      province: stateName,
      latitude: toDecimal(city.latitude),
      longitude: toDecimal(city.longitude),
      isActive: true,
    };

    const legacyMatchKey = `${normalizeText(city.name)}|${normalizeRegion(stateName ?? '')}`;
    const legacyCityId = legacyCityIdByMatch.get(legacyMatchKey);

    if (legacyCityId && !usedLegacyCityIds.has(legacyCityId)) {
      usedLegacyCityIds.add(legacyCityId);
      updateRows.push({ id: legacyCityId, data: cityPayload });
      continue;
    }

    createRows.push(cityPayload);
  }

  for (const row of updateRows) {
    await prisma.city.update({
      where: { id: row.id },
      data: row.data,
    });
  }

  for (const chunk of chunkArray(createRows, CHUNK_SIZE)) {
    await prisma.city.createMany({
      data: chunk,
      skipDuplicates: true,
    });
  }
}
