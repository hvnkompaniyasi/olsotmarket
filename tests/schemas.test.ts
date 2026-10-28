import { describe, it, expect } from "vitest"
import { listingSchema } from "../src/lib/schemas"

const validListing = {
  title: "Markazda keng kvartira",
  description: "Yaxshi ta'mirlangan, yorug' va barcha qulayliklarga ega kvartira.",
  type: "SALE",
  category: "APARTMENT",
  price: 50_000,
  currency: "USD",
  region: "Toshkent shahri",
  district: "Chilonzor",
  address: "Chilonzor tumani, 1-mavze, 10-uy",
  hasGas: true,
  hasWater: true,
  hasElectricity: true,
  images: ["https://example.com/listing.jpg"],
}

describe("listingSchema", () => {
  it("requires a positive price", () => {
    expect(listingSchema.safeParse({ ...validListing, price: 0 }).success).toBe(false)
    expect(listingSchema.safeParse({ ...validListing, price: 50_000 }).success).toBe(true)
  })

  it("allows an optional description and requires utility answers", () => {
    expect(listingSchema.safeParse({ ...validListing, title: "Uy1", description: undefined }).success).toBe(true)
    expect(listingSchema.safeParse({ ...validListing, hasWater: undefined }).success).toBe(false)
  })
})
