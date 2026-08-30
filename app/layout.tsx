import type { Metadata } from "next";
import "./globals.css";
import "./portal.css";
import "./auth-portal.css";
import "./assessment.css";
import "./admin.css";
import "./retrieval.css";
import "./ai.css";

export const metadata: Metadata = {
  title: "StatSkill AI | National Competency & Learning Portal",
  description: "AI-powered competency intelligence, grounded assessment and personalized learning platform for India's Official Statistical System"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
