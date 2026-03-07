import "./globals.css";
import type { Metadata } from "next";
import React, { ReactNode } from "react";

export const metadata: Metadata = {
  title: "VPL",
  description: "Veikkausliiga fantasy MVP"
};

export default function RootLayout({ children }: { children: ReactNode }) {
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
        {children}
      </body>
    </html>
  );
}
