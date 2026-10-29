const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // E'lonlarni biriktirish uchun admin foydalanuvchini topamiz
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (!admin) {
    console.log("Admin topilmadi. Iltimos, avval seed qiling.");
    return;
  }

  const demoListings = [
    {
      title: "Toshkent shahar, Yunusobod tumanida 3 xonali kvartira",
      description: "Zamonaviy ta'mir qilingan, barcha sharoitlarga ega. Metroga yaqin. Mebel va texnika qoladi.",
      type: "SALE", category: "APARTMENT", status: "ACTIVE",
      price: 120000, currency: "USD", region: "Toshkent shahri", district: "Yunusobod",
      address: "Yunusobod 4-kvartal, 12-uy", latitude: 41.3692, longitude: 69.2898,
      rooms: 3, area: 75, floor: 4, totalFloors: 9, hasGas: true, hasWater: true, hasElectricity: true,
      furniture: true, images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80"]
    },
    {
      title: "Samarqand shahar, markazdan 2 xonali kvartira",
      description: "Registon maydoniga yaqin. Hovlisi keng, tinch va osoyishta joy.",
      type: "SALE", category: "APARTMENT", status: "PENDING",
      price: 55000, currency: "USD", region: "Samarqand viloyati", district: "Samarqand shahri",
      address: "Registon ko'chasi, 4-uy", latitude: 39.6547, longitude: 66.9597,
      rooms: 2, area: 50, floor: 1, totalFloors: 2, hasGas: true, hasWater: true, hasElectricity: true,
      furniture: false, images: ["https://images.unsplash.com/photo-1502672260266-1c1e5211774c?w=800&q=80"]
    },
    {
      title: "Buxoro viloyati, 5 xonali hovli",
      description: "Qadimiy shahar markazida joylashgan, katta hovli. Ijaraga ham, sotuvga ham.",
      type: "SALE", category: "HOUSE", status: "ACTIVE",
      price: 85000, currency: "USD", region: "Buxoro viloyati", district: "Buxoro shahri",
      address: "Labi Hovuz ko'chasi", latitude: 39.7747, longitude: 64.4286,
      rooms: 5, area: 150, floor: 1, totalFloors: 1, hasGas: true, hasWater: true, hasElectricity: true,
      furniture: true, images: ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80"]
    },
    {
      title: "Andijon shahar, 1 xonali ofis ijaraga",
      description: "Biznes markaz ichida, barcha kommunal xizmatlar bilan. Kirish qulay.",
      type: "RENT", category: "OFFICE", status: "ACTIVE",
      price: 4000000, currency: "UZS", region: "Andijon viloyati", district: "Andijon shahri",
      address: "Boburshoh shoh ko'chasi, 1-uy", latitude: 40.7829, longitude: 72.3442,
      rooms: 1, area: 35, floor: 2, totalFloors: 5, hasGas: false, hasWater: true, hasElectricity: true,
      furniture: false, images: ["https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80"]
    },
    {
      title: "Toshkent shahar, Yakkasaroy tumani, 3 xonali kvartira",
      description: "Yevroremont, qulay joylashgan. Oila uchun juda mos.",
      type: "RENT", category: "APARTMENT", status: "ACTIVE",
      price: 8000000, currency: "UZS", region: "Toshkent shahri", district: "Yakkasaroy",
      address: "Shota Rustaveli ko'chasi, 15-uy", latitude: 41.2891, longitude: 69.2565,
      rooms: 3, area: 80, floor: 3, totalFloors: 9, hasGas: true, hasWater: true, hasElectricity: true,
      furniture: true, images: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80"]
    },
    {
      title: "Namangan viloyati, 10 sotix yer uchastkasi",
      description: "Shahar chekkasida, qurilish uchun qulay. Gaz, suv, svet bor.",
      type: "SALE", category: "LAND", status: "REJECTED",
      price: 15000, currency: "USD", region: "Namangan viloyati", district: "Namangan shahri",
      address: "Navoiy ko'chasi, yangi qurilish hududi", latitude: 41.0011, longitude: 71.6673,
      area: 1000, hasGas: true, hasWater: true, hasElectricity: true,
      images: ["https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80"]
    }
  ];

  for (const listing of demoListings) {
    await prisma.listing.create({
      data: {
        ...listing,
        userId: admin.id
      }
    });
    console.log(`✅ Yaratildi: ${listing.title}`);
  }
  console.log("🎉 Barcha demo e'lonlar muvaffaqiyatli qo'shildi!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
