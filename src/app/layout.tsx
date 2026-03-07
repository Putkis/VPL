import "./globals.css";
import type { Metadata } from "next";
import React, { ReactNode } from "react";

export const metadata: Metadata = {
  title: "VPL",
  description: "Veikkausliiga fantasy MVP"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN?.trim();
  const isPlausibleEnabled = Boolean(plausibleDomain);

  return (
    <html lang="en">
      <body>
        {isPlausibleEnabled ? (
          <>
            <script>
              {"window.plausible=window.plausible||function(){(window.plausible.q=window.plausible.q||[]).push(arguments)};"}
            </script>
            <script
              defer
              data-domain={plausibleDomain}
              src="https://plausible.io/js/script.js"
            />
          </>
        ) : null}
        {children}
      </body>
    </html>
  );
}
