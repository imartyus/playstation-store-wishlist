const psnProductUrlTester = /https:\/\/(store|www)\.playstation\.com\/[a-zA-Z-]+\/(product|games)\/\S+/g

// const testItem = {
//   title: 'TEST',
//   price: 'RUB 3300.20',
//   // ogPrice: ogPrice ? ogPrice.innerHTML : null,
//   // saleEnds: saleEnds ? saleEnds.innerHTML : null,
//   url: 'www.google.ca'
// }

// const TEST = []
// for (let i = 0; i<40; i++) {
//   TEST.push(testItem)
// }

export function getWishlist (cb) {
  chrome.storage.sync.get(['wishlist'], ({ wishlist }) => {
    if (wishlist && wishlist.items) {
      // wishlist.items = [...wishlist.items, ...TEST]
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
