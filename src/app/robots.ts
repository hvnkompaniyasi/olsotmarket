import { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/", "/profile", "/my-listings", "/favorites"] },
    ],
    sitemap: "https://www.senest.uz/sitemap.xml",
  }
}
