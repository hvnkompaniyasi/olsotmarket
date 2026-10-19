/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

// Bepul tashqi rasmlar (Unsplash)
const IMAGES = [
  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
]

// Test e'lonlari — barchasi ACTIVE, bittasi premium
const LISTINGS = [
  {
    id: "seed-listing-1",
    title: "Chilonzor, 3 xonali zamonaviy kvartira",
    description:
      "Yorug' va shinam kvartira. Gaz, suv, elektr va internet mavjud. Hujjatlar tayyor.",
    type: "SALE",
    category: "APARTMENT",
    price: 1250000000,
    currency: "UZS",
    region: "Toshkent",
    district: "Chilonzor",
    address: "Chilonzor 12-kvartal",
    rooms: 3,
    area: 78,
    floor: 4,
    totalFloors: 9,
    isPremium: true,
  },
  {
    id: "seed-listing-2",
    title: "Yunusobod, 2 xonali kvartira",
    description: "Metroga yaqin, ta'mirlangan, jihozlangan kvartira.",
    type: "SALE",
    category: "APARTMENT",
    price: 780000000,
    currency: "UZS",
    region: "Toshkent",
    district: "Yunusobod",
    address: "Yunusobod 4-kvartal",
    rooms: 2,
    area: 56,
    floor: 7,
    totalFloors: 16,
    isPremium: false,
  },
  {
    id: "seed-listing-3",
    title: "Olmazor, 1 xonali studiya (ijara)",
    description: "Markazga yaqin, to'liq jihozlangan studiya. Uzoq muddatga.",
    type: "RENT",
    category: "APARTMENT",
    price: 4500000,
    currency: "UZS",
    region: "Toshkent",
    district: "Olmazor",
    address: "Olmazor tumani",
    rooms: 1,
    area: 34,
    floor: 2,
    totalFloors: 4,
    isPremium: false,
  },
  {
    id: "seed-listing-4",
    title: "Samarqand, yangi qurilish, 2 xonali",
    description: "Yangi topshirilgan uy, evro remont, hovli va avtoturargoh.",
    type: "NEW_BUILDING",
    category: "APARTMENT",
    price: 620000000,
    currency: "UZS",
    region: "Samarqand",
    district: "Samarqand",
    address: "Registon ko'chasi",
    rooms: 2,
    area: 60,
    floor: 3,
    totalFloors: 5,
    isPremium: false,
  },
]

async function main() {
  // 1. Test user (Listing uchun userId majburiy)
  const user = await prisma.user.upsert({
    where: { phone: "+998901234567" },
    update: { name: "Test Admin" },
    create: {
      phone: "+998901234567",
      name: "Test Admin",
      role: "ADMIN",
    },
  })
  console.log(`✅ User tayyor: ${user.name} (${user.phone})`)

  // 2. E'lonlar — har biri ACTIVE, bittasi premium
  for (let i = 0; i < LISTINGS.length; i++) {
    const listing = LISTINGS[i]
    await prisma.listing.upsert({
      where: { id: listing.id },
      update: { status: "ACTIVE" },
      create: {
        ...listing,
        status: "ACTIVE",
        images: [IMAGES[i % IMAGES.length]],
        userId: user.id,
      },
    })
  }

  console.log(`✅ ${LISTINGS.length} ta ACTIVE e'lon qo'shildi`)
  console.log("🎉 Seed muvaffaqiyatli yakunlandi")
}

main()
  .catch((error) => {
    console.error("❌ Seed xatosi:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
