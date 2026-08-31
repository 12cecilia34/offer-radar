import { eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { profiles } from "../../../db/schema";

type ProfilePayload = {
  clientId?: string;
  countries?: string[];
  roles?: string[];
  locations?: string;
  needsSponsor?: boolean;
  resumeSkills?: string[];
};

export async function GET(request: Request) {
  const clientId = new URL(request.url).searchParams.get("clientId")?.trim();
  if (!clientId) return Response.json({ profile: null });

  const rows = await getDb().select().from(profiles).where(eq(profiles.clientId, clientId)).limit(1);
  const row = rows[0];
  if (!row) return Response.json({ profile: null });

  return Response.json({
    profile: {
      ...row,
      countries: JSON.parse(row.countries),
      roles: JSON.parse(row.roles),
      resumeSkills: JSON.parse(row.resumeSkills),
    },
  });
}

export async function POST(request: Request) {
  const payload = (await request.json()) as ProfilePayload;
  const clientId = payload.clientId?.trim();
  const countries = payload.countries?.filter(Boolean) ?? [];
  const roles = payload.roles?.filter(Boolean) ?? [];
  if (!clientId || !countries.length || !roles.length) {
    return Response.json({ error: "Missing profile fields" }, { status: 400 });
  }

  const values = {
    clientId,
    countries: JSON.stringify(countries.slice(0, 3)),
    roles: JSON.stringify(roles.slice(0, 8)),
    locations: (payload.locations ?? "").slice(0, 240),
    needsSponsor: Boolean(payload.needsSponsor),
    resumeSkills: JSON.stringify((payload.resumeSkills ?? []).slice(0, 30)),
    updatedAt: new Date().toISOString(),
  };

  await getDb().insert(profiles).values(values).onConflictDoUpdate({
    target: profiles.clientId,
    set: values,
  });

  return Response.json({ ok: true, profile: payload });
}

