/**
 * Utility to dynamically set page titles based on portal type
 */

export const setPageTitle = (title?: string) => {
  const baseTitle = "OrganLink";
  
  if (title) {
    document.title = `${title} - ${baseTitle}`;
  } else {
    document.title = baseTitle;
  }
};

export const PORTAL_TITLES = {
  ADMIN: "Admin Portal",
  HOSPITAL: "Hospital Portal",
  ORGANIZATION: "Organization Portal",
  PUBLIC: "OrganLink",
} as const;

export const setPortalTitle = (portal: keyof typeof PORTAL_TITLES) => {
  if (portal === "PUBLIC") {
    document.title = PORTAL_TITLES.PUBLIC;
  } else {
    document.title = `${PORTAL_TITLES[portal]} - OrganLink`;
  }
};
