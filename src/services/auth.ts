import type { Locale } from "../i18n/messages";
import { createClient } from "../lib/supabase/client";

function getEmailRedirectUrl() {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/`;
  }

  return undefined;
}

export async function signIn(email: string, password: string) {
  const supabase = createClient();
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signUp(email: string, password: string, fullName: string, locale: Locale) {
  const supabase = createClient();
  return supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: getEmailRedirectUrl(),
      data: {
        full_name: fullName,
        locale,
      },
    },
  });
}

export async function signOut() {
  const supabase = createClient();
  return supabase.auth.signOut();
}

export async function getCurrentUser() {
  const supabase = createClient();
  return supabase.auth.getUser();
}
