import { NextRequest, NextResponse } from "next/server";

const REGISTER_PAGE =
  "https://www.gov.uk/government/publications/register-of-licensed-sponsors-workers";
const CACHE_MS = 60 * 60 * 1000;

type SponsorRecord = {
  organisation: string;
  city: string;
  rating: string;
  route: string;
};

type SponsorCache = {
  records: SponsorRecord[];
  csvUrl: string;
  registerDate: string;
  loadedAt: number;
};

let sponsorCache: SponsorCache | null = null;

function parseCsvLine(line: string) {
  const fields: string[] = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"') {
      if (quoted && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      fields.push(current.trim());
      current = "";
    } else {
      current += character;
    }
  }
  fields.push(current.trim());
  return fields;
}

function normalizeCompany(value: string) {
  return value
    .toLowerCase()
    .replace(/&amp;/g, "and")
    .replace(/&/g, "and")
    .replace(/\b(the|uk|limited|ltd|llp|plc|inc|corporation|corp)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function registerDateFromUrl(url: string) {
  const match = url.match(/(20\d{2})-(\d{2})-(\d{2})/);
  return match ? `${match[1]}-${match[2]}-${match[3]}` : "官方最新版本";
}

async function loadSponsorRegister(): Promise<SponsorCache> {
  if (sponsorCache && Date.now() - sponsorCache.loadedAt < CACHE_MS) {
    return sponsorCache;
  }

  const pageResponse = await fetch(REGISTER_PAGE, {
    headers: { "User-Agent": "Offer Radar sponsorship checker" },
    cf: { cacheTtl: 1800, cacheEverything: true },
  });
  if (!pageResponse.ok) throw new Error("Unable to load GOV.UK register page");
  const pageHtml = await pageResponse.text();
  const csvMatch = pageHtml.match(
    /https:\/\/assets\.publishing\.service\.gov\.uk\/media\/[^"'<>\s]+\.csv/i,
  );
  if (!csvMatch) throw new Error("Unable to locate current sponsor CSV");

  const csvUrl = csvMatch[0].replace(/&amp;/g, "&");
  const csvResponse = await fetch(csvUrl, {
    headers: { "User-Agent": "Offer Radar sponsorship checker" },
    cf: { cacheTtl: 1800, cacheEverything: true },
  });
  if (!csvResponse.ok) throw new Error("Unable to load sponsor CSV");
  const csv = await csvResponse.text();
  const records = csv
    .split(/\r?\n/)
    .slice(1)
    .map(parseCsvLine)
    .filter((fields) => fields.length >= 5 && fields[0])
    .map((fields) => ({
      organisation: fields[0],
      city: fields[1],
      rating: fields[3],
      route: fields[4],
    }));

  sponsorCache = {
    records,
    csvUrl,
    registerDate: registerDateFromUrl(csvUrl),
    loadedAt: Date.now(),
  };
  return sponsorCache;
}

function findCompany(records: SponsorRecord[], query: string) {
  const normalizedQuery = normalizeCompany(query);
  if (normalizedQuery.length < 2) return [];

  const exact = records.filter(
    (record) => normalizeCompany(record.organisation) === normalizedQuery,
  );
  if (exact.length) return exact;

  return records
    .filter((record) => {
      const organisation = normalizeCompany(record.organisation);
      return (
        normalizedQuery.length >= 5 &&
        (organisation.startsWith(normalizedQuery) || normalizedQuery.startsWith(organisation))
      );
    })
    .slice(0, 12);
}

export async function GET(request: NextRequest) {
  const queries = (request.nextUrl.searchParams.get("companies") ?? "")
    .split("|")
    .map((query) => query.trim())
    .filter(Boolean)
    .slice(0, 20);

  if (!queries.length) {
    return NextResponse.json({ error: "Provide at least one employer name." }, { status: 400 });
  }

  try {
    const register = await loadSponsorRegister();
    const results = queries.map((query) => {
      const matches = findCompany(register.records, query);
      const skilledWorkerMatches = matches.filter((record) =>
        record.route.toLowerCase().includes("skilled worker"),
      );
      return {
        query,
        found: matches.length > 0,
        skilledWorker: skilledWorkerMatches.length > 0,
        matches: matches.slice(0, 8),
      };
    });

    return NextResponse.json(
      {
        sourcePage: REGISTER_PAGE,
        sourceCsv: register.csvUrl,
        registerDate: register.registerDate,
        checkedAt: new Date().toISOString(),
        results,
        disclaimer:
          "A sponsor licence does not guarantee that a specific vacancy offers sponsorship.",
      },
      { headers: { "Cache-Control": "public, max-age=900, s-maxage=1800" } },
    );
  } catch {
    return NextResponse.json(
      { error: "The official sponsor register is temporarily unavailable." },
      { status: 503 },
    );
  }
}
