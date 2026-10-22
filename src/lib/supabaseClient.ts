import { createClient, type SupabaseClient } from "@supabase/supabase-js"

export const LISTING_IMAGES_BUCKET = "listing-images"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const PLACEHOLDER_MARKERS = [
  "your-project",
  "your-anon-key",
  "placeholder",
  "example.supabase.co",
] as const

function isUsableEnvValue(value: string | undefined): value is string {
  if (!value) return false
  const normalized = value.trim().toLowerCase()
  if (normalized.length === 0) return false
  return !PLACEHOLDER_MARKERS.some((marker) => normalized.includes(marker))
}

export function isSupabaseConfigured(): boolean {
  return isUsableEnvValue(supabaseUrl) && isUsableEnvValue(supabaseAnonKey)
}

const PUBLIC_IMAGE_PATH = `/storage/v1/object/public/${LISTING_IMAGES_BUCKET}/`

export function isListingImageUrl(url: string): boolean {
  if (!isUsableEnvValue(supabaseUrl)) return false
  try {
    const target = new URL(url)
    const base = new URL(supabaseUrl)
    return target.origin === base.origin && target.pathname.startsWith(PUBLIC_IMAGE_PATH)
  } catch {
    return false
  }
}

export function listingImagePathFromUrl(url: string): string | null {
  if (!isListingImageUrl(url)) return null
  try {
    const target = new URL(url)
    const path = decodeURIComponent(target.pathname.slice(PUBLIC_IMAGE_PATH.length))
    return path || null
  } catch {
    return null
  }
}

let supabaseClient: SupabaseClient | null = null

function getSupabaseClient(): SupabaseClient {
  if (!isUsableEnvValue(supabaseUrl) || !isUsableEnvValue(supabaseAnonKey)) {
    throw new Error(
      "Supabase Storage sozlanmagan. NEXT_PUBLIC_SUPABASE_URL va NEXT_PUBLIC_SUPABASE_ANON_KEY qiymatlarini .env.local faylida belgilang."
    )
  }

  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    })
  }

  return supabaseClient
}

function sanitizeSegment(value: string): string {
  return value.trim().replace(/[^a-zA-Z0-9_-]/g, "")
}

function getFileExtension(fileName: string): string {
  const parts = fileName.split(".")
  if (parts.length < 2) return "jpg"
  const extension = parts[parts.length - 1].toLowerCase().replace(/[^a-z0-9]/g, "")
  return extension || "jpg"
}

export async function uploadListingImage(file: File, listingId: string): Promise<string> {
  const client = getSupabaseClient()
  const folder = sanitizeSegment(listingId)

  if (!folder) {
    throw new Error("listingId bo'sh bo'lmasligi kerak")
  }
  if (file.size === 0) {
    throw new Error("Fayl bo'sh bo'lmasligi kerak")
  }

  const path = `${folder}/${Date.now()}-${crypto.randomUUID()}.${getFileExtension(file.name)}`

  const { error } = await client.storage.from(LISTING_IMAGES_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || undefined,
  })

  if (error) {
    throw new Error(`Rasm yuklanmadi: ${error.message}`)
  }

  const { data } = client.storage.from(LISTING_IMAGES_BUCKET).getPublicUrl(path)
  if (!data.publicUrl) {
    throw new Error("Rasm uchun public URL olinmadi")
  }

  return data.publicUrl
}

export async function deleteListingImage(path: string): Promise<void> {
  const client = getSupabaseClient()
  const normalizedPath = path.trim()

  if (!normalizedPath) {
    throw new Error("Rasm path bo'sh bo'lmasligi kerak")
  }

  const { error } = await client.storage.from(LISTING_IMAGES_BUCKET).remove([normalizedPath])

  if (error) {
    throw new Error(`Rasm o'chirilmadi: ${error.message}`)
  }
}
