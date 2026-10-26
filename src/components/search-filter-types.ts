export const FILTER_KEYS = [
  "q",
  "type",
  "category",
  "region",
  "district",
  "minPrice",
  "maxPrice",
  "rooms",
  "sortBy",
] as const

export type FilterKey = (typeof FILTER_KEYS)[number]
export type FilterValues = Record<FilterKey, string>

export const EMPTY_FILTERS: FilterValues = {
  q: "",
  type: "",
  category: "",
  region: "",
  district: "",
  minPrice: "",
  maxPrice: "",
  rooms: "",
  sortBy: "newest",
}
