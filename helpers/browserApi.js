const psnProductUrlTester = /https:\/\/store\.playstation\.com\/\D{5}\/product\/\S+/g

export function getWishlist (cb) {
  chrome.storage.sync.get(['wishlist'], ({ wishlist }) => {
    if (wishlist && wishlist.items) {
      cb(wishlist)
    } else {
      cb({
        items: [],
        lastUpdated: null
      })
    }
  })
}

export function updateWishlist (updatedWishlist, partialUpdate = false) {
  if (partialUpdate) {
    getWishlist(wishlist => {
      chrome.storage.sync.set({ wishlist: { ...wishlist, ...updatedWishlist } })
    })
  } else {
    chrome.storage.sync.set({ wishlist: updatedWishlist })
  }
}

export function updateBadge (items) {
  const numOnSale = items.reduce((num, item) => item.ogPrice ? num + 1 : num, 0)
  chrome.browserAction.setBadgeText({ text: numOnSale ? numOnSale.toString() : '' })
}

export function isOnStoreUrl (cb) {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    const currentUrl = tabs[0].url
    cb(currentUrl, psnProductUrlTester.test(currentUrl))
  })
}
