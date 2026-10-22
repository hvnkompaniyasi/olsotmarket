export function formatPrice(price: number, typeName?: string, currency?: string): string {
  const n = price.toLocaleString("ru-RU").replace(/\u00A0/g, " ");
  if (currency === "USD") return `$${n}`;
  if (currency === "UZS") {
    if (typeName === "Ijara") return `${n} so'm/oy`;
    if (typeName === "Kunlik") return `${n} so'm/kun`;
    return `${n} so'm`;
  }
  if (typeName === "Ijara") return `${n} so'm/oy`;
  if (typeName === "Kunlik") return `${n} so'm/kun`;
  return `${n} y.e.`;
}
