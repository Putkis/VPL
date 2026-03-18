import { seedUsers } from "./seed-data";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function getAdminEmails() {
  const configuredEmails =
    process.env.ADMIN_EMAILS
      ?.split(",")
      .map((email) => normalizeEmail(email))
      .filter(Boolean) ?? [];

  if (configuredEmails.length > 0) {
    return configuredEmails;
  }

  return [normalizeEmail(seedUsers[0]?.email ?? "aino@example.com")];
}

export function isAdminViewer(viewerKey: string) {
  return getAdminEmails().includes(normalizeEmail(viewerKey));
}
