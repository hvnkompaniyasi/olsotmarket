import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import SWRegister from "@/components/SWRegister"
import InstallPWA from "@/components/InstallPWA"
import ThemeScript from "@/components/ThemeScript"
import AuthProvider from "@/components/AuthProvider"

const inter = Inter({ subsets: ["latin", "cyrillic"], display: "swap" })

// 1. NEXT.JS 14 VIEWPORT (Mobil qurilmalar va brend rangi uchun)
export const viewport: Viewport = {
  themeColor: "#0A7C4E", // Brend yashil rangi
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover", // iPhone "notch" uchun moslashuv
}

// 2. NEXT.JS 14 METADATA (SEO va ijtimoiy tarmoqlar uchun)
export const metadata: Metadata = {
  metadataBase: new URL("https://olsotmarket.uz"),
  title: {
    default: "Olsot Market - Ko'chmas mulk platformasi",
    template: "%s | Olsot Market",
  },
  description: "O'zbekistonning eng zamonaviy ko'chmas mulk platformasi. Kvartira, uy, ofis va yer e'lonlari.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Olsot Market",
  },
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
  openGraph: {
    type: "website",
    locale: "uz_UZ",
    url: "https://olsotmarket.uz",
    siteName: "Olsot Market",
    title: "Olsot Market - Ko'chmas mulk platformasi",
    description: "O'zbekistonning eng zamonaviy ko'chmas mulk platformasi.",
    images: [{ url: "/logo.svg" }], // Yaxshiroq preview rasm qo'yishingiz mumkin
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html suppressHydrationWarning lang="uz" className="scroll-smooth">
      <body className={`${inter.className} antialiased min-h-screen bg-background text-foreground`}>
        {/* ThemeScript terni (Dark/Light) yuklanishdan oldin ishga tushishi kerak */}
        <ThemeScript />
        
        <AuthProvider>
          <div className="pb-16 lg:pb-0">
            {children}
          </div>
          <SWRegister />
          <InstallPWA />
        </AuthProvider>
      </body>
    </html>
  )
}