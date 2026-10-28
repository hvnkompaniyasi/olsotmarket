import { MetadataRoute } from "next"

const BASE_URL = "https://olsotmarket.uz" // TO'G'RILANDI

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",          // API yo'llari
          "/admin/",        // Admin panel
          "/profile",       // Shaxsiy profil
          "/my-listings",   // Mening e'lonlarim
          "/favorites",     // Saqlanganlar
          "/messages",      // Xabarlar (Chat)
          "/settings",      // Sozlamalar
          "/login",         // Kirish sahifasi
          "/register",      // Ro'yxatdan o'tish
          "/edit-listing",  // Tahrirlash sahifalari
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL, // Asosiy domenni belgilaydi
  }
}