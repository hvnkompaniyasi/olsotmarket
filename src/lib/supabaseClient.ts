import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Environment o'zgaruvchilari bo'lmasa, aniq xatolik beramiz
if (!supabaseUrl) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL topilmadi. .env.local faylida sozlang."
  )
}

if (!supabaseAnonKey) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY topilmadi. .env.local faylida sozlang."
  )
}

// Faqat client-side (brauzer) uchun mo'ljallangan singleton client.
// Server Component yoki route handler ichida ishlatilmasin.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
