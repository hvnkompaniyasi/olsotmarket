import { createUploadthing, type FileRouter } from "uploadthing/next"
import { UploadThingError } from "uploadthing/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"

const f = createUploadthing()

export const ourFileRouter = {
  // "listingImage" endpointi
  listingImage: f({ 
    image: { 
      maxFileSize: "8MB", // 5MB o'rniga 8MB (UploadThing qo'llab-quvvatlaydigan qiymat)
      maxFileCount: 10,   // 10 ta rasm
    } 
  })
    .middleware(async () => {
      const session = await getServerSession(authOptions)
      
      // Xavfsizlik: Faqat tizimga kirgan foydalanuvchilar yuklay oladi
      if (!session?.user?.id) {
        throw new UploadThingError("Faqat tizimga kirganlar rasm yuklay oladi")
      }
      
      // Metadataga foydalanuvchi ID sini saqlaymiz
      return { userId: session.user.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log(`Rasm yuklandi. Foydalanuvchi: ${metadata.userId}, URL: ${file.url}`)
      return { uploadedBy: metadata.userId, url: file.url }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter