import { Wishlist, WishlistItem } from "../types"

const psnProductUrlTester = /https:\/\/(store|www)\.playstation\.com\/[a-zA-Z-]+\/(product|games|concept)\/\S+/g

// const testItem = {
//   title: 'TEST',
//   price: 'RUB 3300.20',
//   ogPrice: 'RUB 37300.20',
//   saleEnds: 'tomorrow!',
//   url: 'www.google.ca',
//   outdated: true
// }

// const TEST = []
// for (let i = 0; i<40; i++) {
//   TEST.push(testItem)
// }

export function getWishlist (cb: (arg1: Wishlist) => any) {
  chrome.storage.sync.get(['wishlist'], ({ wishlist }) => {
    if (wishlist && wishlist.items) {
      // wishlist.items = [...wishlist.items, testItem]
      cb(wishlist)
    } else {
      cb({
        items: [],
        lastUpdated: null,
        sortBy: 'title',
        sortOrder: 'asc',
      })
    }
  })
}

export function updateWishlist (updatedWishlist: Partial<Wishlist>, partialUpdate = false): Promise<void> {
  return new Promise(resolve => {
    if (partialUpdate) {
      getWishlist(wishlist => {
        chrome.storage.sync.set({ wishlist: { ...wishlist, ...updatedWishlist } }, () => {
          resolve()
        })
      })
    } else {
      chrome.storage.sync.set({ wishlist: updatedWishlist }, () => {
        resolve()
      })
    }
  })
}

export function updateBadge (items: WishlistItem[]) {
  const numOnSale = items.reduce((num, item) => item.ogPrice ? num + 1 : num, 0)
  chrome.browserAction.setBadgeText({ text: numOnSale ? numOnSale.toString() : '' })
}

export function isOnStoreUrl (cb: (currentUrl: string, isOnStore: boolean) => any) {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    const currentUrl = tabs[0].url
    cb(currentUrl, psnProductUrlTester.test(currentUrl))
  })
}
