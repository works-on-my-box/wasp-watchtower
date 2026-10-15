import { createHash } from "node:crypto";
import { type CheckSites } from "wasp/server/jobs";

// Rough HTML-to-text: drop script/style blocks and tags, collapse whitespace.
function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// PgBoss job: visits every site, hashes the page text with sha256,
// compares it with the previous hash and writes a Check with status ok/changed/error.
// Job input must be a JSONObject (PgBoss serializes arguments to JSON);
// the job takes no arguments, hence the empty object type.
export const checkSites: CheckSites<Record<string, never>, void> = async (_args, context) => {
  const sites = await context.entities.Site.findMany({});
  for (const site of sites) {
    let status: string;
    let note: string | undefined = undefined;
    let newHash: string | undefined = undefined;
    try {
      const res = await fetch(site.url);
      const text = htmlToText(await res.text());
      newHash = createHash("sha256").update(text).digest("hex");
      // The first check (no hash yet) sets the baseline and counts as ok.
      status = site.lastHash && site.lastHash !== newHash ? "changed" : "ok";
    } catch (e) {
      status = "error";
      note = e instanceof Error ? e.message : String(e);
    }
    await context.entities.Check.create({
      data: { status, note, site: { connect: { id: site.id } } },
    });
    await context.entities.Site.update({
      where: { id: site.id },
      data: {
        lastCheckedAt: new Date(),
        ...(newHash ? { lastHash: newHash } : {}),
      },
    });
  }
};
