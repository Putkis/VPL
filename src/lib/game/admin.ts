import { createClient } from "@supabase/supabase-js";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function getAdminEmails() {
  return process.env.ADMIN_EMAILS?.split(",").map(normalizeEmail).filter(Boolean) ?? [];
}

export function isAdminViewer(viewerKey: string) {
  return getAdminEmails().includes(normalizeEmail(viewerKey));
}

export async function getAuthenticatedAdminEmail(request: Request) {
  const accessToken = request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!accessToken) return null;
  if (!url || !anonKey) throw new Error("Supabase Auth is not configured");

  const supabase = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
  });
  const { data, error } = await supabase.auth.getUser(accessToken);
  const email = data.user?.email;
  return !error && email && isAdminViewer(email) ? normalizeEmail(email) : null;
}
