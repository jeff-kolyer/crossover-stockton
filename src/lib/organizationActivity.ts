export const organizationsActivityHref = "/work/dogs/activity/#organizations";

export const organizationActivityHref = (slug: string) =>
  `/work/dogs/activity/#organization-${encodeURIComponent(slug)}`;
