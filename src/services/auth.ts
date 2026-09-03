import type { Locale } from "../i18n/messages";
import { createClient } from "../lib/supabase/client";

export type SignupProfile = {
  fullName: string;
  designation?: string;
  department?: string;
  cadre?: string;
  assignment?: string;
  qualification?: string;
  experienceYears?: number | null;
  priorTraining?: string;
};

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

export async function signUp(email: string, password: string, profile: SignupProfile, locale: Locale) {
  const supabase = createClient();
  return supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: getEmailRedirectUrl(),
      data: {
        full_name: profile.fullName,
        locale,
        designation: profile.designation || null,
        department: profile.department || null,
        cadre: profile.cadre || null,
        assignment: profile.assignment || null,
        qualification: profile.qualification || null,
        experience_years: profile.experienceYears ?? null,
        prior_training: profile.priorTraining || null,
      },
    },
  });
}

export async function resendSignupConfirmation(email: string) {
  const supabase = createClient();
  return supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: getEmailRedirectUrl(),
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
