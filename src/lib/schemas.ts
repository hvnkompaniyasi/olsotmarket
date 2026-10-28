import { z } from "zod"

// Listing yaratish
export const listingSchema = z.object({
  title: z.string().trim().min(3, "Sarlavha kamida 3 belgi").max(120, "Sarlavha 120 belgidan oshmasin"),
  description: z.string().trim().max(2000, "Tavsif 2000 belgidan oshmasin").optional(),
  type: z.enum(["SALE", "RENT", "DAILY", "NEW_BUILDING"]),
  category: z.enum(["APARTMENT", "HOUSE", "OFFICE", "LAND", "WAREHOUSE"]),
  price: z.coerce.number().positive("Narx musbat bo'lishi kerak").max(1_000_000_000_000),
  currency: z.enum(["UZS", "USD"]).default("USD"),
  region: z.string().trim().min(2, "Viloyat kamida 2 belgi").max(50),
  district: z.string().trim().min(2, "Tuman kamida 2 belgi").max(50),
  address: z.string().trim().min(5, "Manzil kamida 5 belgi").max(200),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  rooms: z.coerce.number().int().min(0).max(20).optional(),
  area: z.coerce.number().positive("Maydon musbat bo'lishi kerak").max(100_000).optional(),
  renovation: z.string().trim().max(80).optional(),
  floor: z.number().int().min(0).max(200).optional(),
  totalFloors: z.number().int().min(1).max(200).optional(),
  hasGas: z.boolean(),
  hasWater: z.boolean(),
  hasElectricity: z.boolean(),
  hasSewage: z.boolean().optional(),
  livingArea: z.coerce.number().positive().max(100_000).optional(),
  landArea: z.coerce.number().positive().max(1_000_000).optional(),
  purpose: z.string().trim().max(100).optional(),
  buildingType: z.string().trim().max(100).optional(),
  electricityPower: z.coerce.number().int().positive().max(1_000_000).optional(),
  parking: z.boolean().optional(),
  entrance: z.string().trim().max(100).optional(),
  bathroom: z.coerce.number().int().min(0).max(100).optional(),
  elevator: z.boolean().optional(),
  furniture: z.boolean().optional(),
  deposit: z.coerce.number().min(0).max(1_000_000_000_000).optional(),
  utilitiesCondition: z.string().trim().max(200).optional(),
  images: z.array(z.string().url()).min(1, "Kamida 1 ta rasm kerak").max(10),
})

// Eski importlar uchun alias (yagona manba — listingSchema)
export const CreateListingSchema = listingSchema
export type ListingInput = z.infer<typeof listingSchema>

// Profil yangilash
export const UpdateProfileSchema = z.object({
  name: z.string().min(2).max(50).nullable().optional(),
  phone: z.string().regex(/^\+?[0-9]{9,15}$/, "Telefon raqam noto'g'ri").optional(),
})

// Parol o'zgartirish
export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6, "Yangi parol kamida 6 belgi").max(100),
})

// Xabar yuborish
export const CreateMessageSchema = z.object({
  text: z.string().min(1, "Xabar bo'sh bo'lmasligi kerak").max(1000),
})

// Conversation yaratish
export const CreateConversationSchema = z.object({
  listingId: z.string().min(1, "listingId kerak"),
})

// E'lonni tahrirlash so'rovi
export const EditListingSchema = z.object({
  title: z.string().min(3, "Sarlavha kamida 3 belgi").max(100).optional(),
  description: z.string().max(2000).optional(),
  price: z.number().positive("Narx musbat bo'lishi kerak").max(1_000_000_000_000).optional(),
  category: z.enum(["APARTMENT", "HOUSE", "OFFICE", "LAND", "WAREHOUSE"]).optional(),
  type: z.enum(["SALE", "RENT", "DAILY", "NEW_BUILDING"]).optional(),
  images: z.array(z.string().url()).max(10).optional(),
  region: z.string().min(2).max(50).optional(),
  district: z.string().max(50).optional(),
  address: z.string().max(200).optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  rooms: z.number().int().min(0).max(20).nullable().optional(),
  area: z.number().min(0).max(100_000).nullable().optional(),
  floor: z.number().int().min(0).max(200).nullable().optional(),
  totalFloors: z.number().int().min(1).max(200).nullable().optional(),
  hasGas: z.boolean().optional(),
  hasWater: z.boolean().optional(),
  hasElectricity: z.boolean().optional(),
  hasSewage: z.boolean().optional(),
  livingArea: z.number().positive().max(100_000).nullable().optional(),
  landArea: z.number().positive().max(1_000_000).nullable().optional(),
  purpose: z.string().trim().max(100).nullable().optional(),
  buildingType: z.string().trim().max(100).nullable().optional(),
  electricityPower: z.number().int().positive().max(1_000_000).nullable().optional(),
  parking: z.boolean().optional(),
  entrance: z.string().trim().max(100).nullable().optional(),
  bathroom: z.number().int().min(0).max(100).nullable().optional(),
  elevator: z.boolean().optional(),
  furniture: z.boolean().optional(),
  deposit: z.number().min(0).max(1_000_000_000_000).nullable().optional(),
  utilitiesCondition: z.string().trim().max(200).nullable().optional(),
})

export const RegisterSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  email: z.string().trim().toLowerCase().email("Email noto'g'ri"),
  phone: z
    .string()
    .optional()
    .refine((v) => !v || /^\d+$/.test(v), "Telefon faqat raqamlar"),
  password: z.string().min(6, "Parol kamida 6 belgi"),
})

export const sendEmailOtpSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email noto'g'ri").max(254),
})
