export type Wishlist = {
  items: WishlistItem[];
  lastUpdated?: number;
  sortBy: string;
  sortOrder: string;
}

export type WishlistItem = {
  title: string;
  price: string;
  ogPrice?: string;
  saleEnds?: string;
  url: string;
  outdated?: boolean;
}