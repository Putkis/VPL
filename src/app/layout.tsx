import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import React, { ReactNode } from "react";

export const metadata: Metadata = {
  title: "VPL",
  description: "Veikkausliiga fantasy MVP"
};

type RootLayoutProps = Readonly<{ children: ReactNode }>;

const demoLinks = [
  { href: "/", label: "Home" },
  { href: "/auth", label: "Auth" },
  { href: "/players", label: "Players" },
  { href: "/team-builder", label: "Team Builder" },
  { href: "/admin/results", label: "Admin" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/transfers", label: "Transfers" },
  { href: "/leagues", label: "Leagues" },
  { href: "/week-view", label: "Week View" }
] as const;

export default function RootLayout({ children }: RootLayoutProps) {
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
  const isGaEnabled = Boolean(gaMeasurementId);

  return (
    <html lang="en">
      <body>
        {isGaEnabled ? (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
            />
            <script
            >{`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());
gtag('config', '${gaMeasurementId}');`}</script>
          </>
        ) : null}
        <header className="topbar">
          <div className="topbar-inner">
            <Link href="/" className="topbar-title">
              VPL Demo
            </Link>
            <nav className="topbar-nav" aria-label="Demo pages">
              {demoLinks.map((link) => (
                <Link key={link.href} href={link.href} className="topbar-link">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
