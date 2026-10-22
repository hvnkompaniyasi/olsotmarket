export const MAX_LISTING_IMAGES = 10
export const MAX_LISTING_IMAGE_SIZE = 5 * 1024 * 1024

export interface CreateListingState {
  error: string | null
  fieldErrors?: Record<string, string[] | undefined>
}

export const INITIAL_CREATE_LISTING_STATE: CreateListingState = { error: null }
