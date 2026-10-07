import { createHash } from "node:crypto";
import { type CheckSites } from "wasp/server/jobs";

// Грубое приведение HTML к тексту: выкидываем script/style и теги, схлопываем пробелы.
function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// PgBoss-джоб: обходит все сайты, считает sha256 от текста страницы,
// сравнивает с прошлым хешем и пишет Check со статусом ok/changed/error.
// Input джоба обязан быть JSONObject (PgBoss сериализует аргументы в JSON);
// аргументов у нас нет, поэтому пустой объект.
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
      // Первая проверка (хеша ещё нет) — базовая линия, считаем ok.
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
