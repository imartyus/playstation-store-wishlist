import { fetchAndScrapeUrl } from './helpers/pageScraping'
import { getWishlist, updateWishlist, updateBadge } from './helpers/browserApi'

chrome.runtime.onInstalled.addListener(function () {
  chrome.alarms.create('wishlistPoll', { periodInMinutes: 60 })
})

// Refresh price data periodically
chrome.alarms.onAlarm.addListener(function () {
  getWishlist(wishlist => {
    if (wishlist.items.length) {
      const requests = []
      wishlist.items.forEach(item => {
        requests.push(fetchAndScrapeUrl(item.url))
      })
      Promise.all(requests)
        .then(updatedWishlist => {
          const updatedItems = updatedWishlist.filter(item => !!item) // clear nulls
          const newWishlist = {
            items: updatedItems,
            lastUpdated: Date.now()
          }
          updateBadge(updatedItems)
          updateWishlist(newWishlist, true)
        })
        .catch(err => console.log('On Alarm error: ', err))
    }
  })
})
