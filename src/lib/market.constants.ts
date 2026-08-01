export const LISTING_CATEGORIES = ["doll", "handmade", "art", "tattoo", "vintage", "other"] as const;

export type ListingCategory = (typeof LISTING_CATEGORIES)[number];