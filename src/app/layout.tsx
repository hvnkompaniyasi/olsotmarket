import type { Metadata } from "next";
;
import "./globals.css"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin", "cyrillic"], display: "swap" })
import SWRegister from "@/components/SWRegister"
import InstallPWA from "@/components/InstallPWA"
;
import ThemeScript from "@/components/ThemeScript"
import AuthProvider from "@/components/AuthProvider";

;

export const metadata: Metadata = {
  title: "Olsot Market - Ko'chmas mulk platformasi",
  description: "O'zbekistonning eng zamonaviy ko'chmas mulk platformasi",
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning lang="uz">
      <ThemeScript />
              <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#fb923c" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Olsot Market" />
      <body className={inter.className}>
        <AuthProvider><div className="pb-16 lg:pb-0">{children}</div>
        <SWRegister />
        <InstallPWA />
        </AuthProvider>
      </body>
    </html>
  );
}