chrome.runtime.onInstalled.addListener(function() {
	chrome.alarms.create('wishlistPoll', { periodInMinutes: 60 })
});


// Refresh price data periodically
chrome.alarms.onAlarm.addListener(function() {
	chrome.storage.sync.get(['wishlist'], ({ wishlist }) => {
		if (wishlist && wishlist.items && wishlist.items.length) {
			const requests = []
			wishlist.items.forEach(item => {
				requests.push(fetchAndScrapeUrl(item.url))
			})
			Promise.all(requests)
			.then(updatedWishlist => {
				updatedWishlist = updatedWishlist.filter(item => !!item) // clear nulls
				const wishlist = {
					items: updatedWishlist,
					lastUpdated: Date.now()
				}
				updateBadge(updatedWishlist)
				chrome.storage.sync.set({ wishlist })
			})
			.catch(err => console.log('On Alarm error: ', err))
		}
	})
})

function updateBadge(items) {
	const numOnSale = items.reduce((num, item) => {
		if (item.ogPrice) {
			return num + 1
		}
		return num
	}, 0)
	chrome.browserAction.setBadgeText({ text: numOnSale ? numOnSale.toString() : '' })
}

function fetchAndScrapeUrl(url) {
  return fetch(url)
  .then(res => res.text())
  .then(html => {
    const doc = htmlToElement(html)
    const price = doc.querySelector("span[data-qa='mfeCtaMain#offer0#finalPrice']")
    const ogPrice = doc.querySelector("span[data-qa='mfeCtaMain#offer0#originalPrice']")
    const title = doc.querySelector('title')
    try {
      return {
        title: title.innerHTML,
        price: price.innerHTML,
        ogPrice: ogPrice ? ogPrice.innerHTML : null,
        url
      }
    } catch {
      return null
    }
  })
}

function htmlToElement(html) {
  const template = document.createElement('template');
  html = html.trim(); // Never return a text node of whitespace as the result
  template.innerHTML = html;
  return template.content.cloneNode(true);
}

