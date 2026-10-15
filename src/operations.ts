import { Site, Check } from "wasp/entities";
import { HttpError } from "wasp/server";
import { type GetSites, type AddSite } from "wasp/server/operations";

type GetSitesResult = {
  sites: Site[];
  recentChecks: (Check & { site: Site })[];
};

// Dashboard: the user's sites plus the last 10 checks across all of them.
export const getSites: GetSites<void, GetSitesResult> = async (_args, context) => {
  if (!context.user) {
    throw new HttpError(401);
  }
  const sites = await context.entities.Site.findMany({
    where: { ownerId: context.user.id },
    orderBy: { label: "asc" },
  });
  const recentChecks = await context.entities.Check.findMany({
    where: { site: { ownerId: context.user.id } },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { site: true },
  });
  return { sites, recentChecks };
};

type AddSiteArgs = Pick<Site, "url" | "label">;

export const addSite: AddSite<AddSiteArgs, Site> = async ({ url, label }, context) => {
  if (!context.user) {
    throw new HttpError(401);
  }
  return context.entities.Site.create({
    data: {
      url,
      label,
      owner: { connect: { id: context.user.id } },
    },
  });
};
