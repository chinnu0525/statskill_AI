import type { Metadata } from "next";
import "./globals.css";
import "./assessment.css";
import "./admin.css";
import "./retrieval.css";
import "./ai.css";

export const metadata: Metadata = {
  title: "StatSkill AI",
  description: "AI-powered competency and learning platform for official statistics professionals"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
