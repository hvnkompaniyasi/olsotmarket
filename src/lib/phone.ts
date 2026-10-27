export function normalizeUzbekPhone(value: string): string | null {
  const digits = value.replace(/\D/g, "")
  const nationalNumber = digits.startsWith("998") && digits.length === 12
    ? digits.slice(3)
    : digits

  if (!/^\d{9}$/.test(nationalNumber)) return null
  return `+998${nationalNumber}`
}