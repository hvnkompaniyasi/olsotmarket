import { createUploadthing, type FileRouter } from "uploadthing/next"
import { UploadThingError } from "uploadthing/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"

const f = createUploadthing()

export const ourFileRouter = {
  // "listingImage" endpointi
  listingImage: f({ 
    image: { 
      maxFileSize: "5MB", // Frontendga moslashtirildi
      maxFileCount: 10,  // Frontendga moslashtirildi (10 ta rasm)
    } 
  })
    .middleware(async () => {
      const session = await getServerSession(authOptions)
      
      // Xavfsizlik: Faqat tizimga kirgan foydalanuvchilar yuklay oladi
      if (!session?.user?.id) {
        throw new UploadThingError("Faqat tizimga kirganlar rasm yuklay oladi")
      }
      
      // Metadataga foydalanuvchi ID sini saqlaymiz (keyinchalik bazaga yozish uchun kerak bo'ladi)
      return { userId: session.user.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Konsolga log yozish (xatoliklarni kuzatish uchun)
      console.log(`Rasm yuklandi. Foydalanuvchi: ${metadata.userId}, URL: ${file.url}`)
      
      // Frontendga foydalanuvchi ID va rasm URL manzilini qaytaramiz
      return { uploadedBy: metadata.userId, url: file.url }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter