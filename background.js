chrome.runtime.onInstalled.addListener(function() {
	chrome.alarms.create('wishlistPoll', { periodInMinutes: 5 })
});


// Refresh price data periodically
chrome.alarms.onAlarm.addListener(function() {
	chrome.storage.sync.get(['wishlist'], ({ wishlist }) => {
		if (wishlist && wishlist.items && wishlist.items.length) {
			console.log('Updating!');
			const requests = []
			wishlist.items.forEach(item => {
				requests.push(fetchAndScrapeUrl(item.url))
			})
			Promise.all(requests)
			.then(updatedWishlist => {
				const wishlist = {
					items: updatedWishlist,
					lastUpdated: Date.now()
				}
				chrome.storage.sync.set({ wishlist })
			})
			.catch(err => console.log('On Alarm error: ', err))
		}
	})
})

function fetchAndScrapeUrl(url) {
  return fetch(url)
  .then(res => res.text())
  .then(html => {
    const doc = htmlToElement(html)
    const price = doc.querySelector("span[data-qa='mfeCtaMain#offer0#finalPrice']")
    const ogPrice = doc.querySelector("span[data-qa='mfeCtaMain#offer0#originalPrice']")
    const title = doc.querySelector('title')
    return {
      title: title.innerHTML,
      price: price.innerHTML,
			ogPrice: ogPrice ? ogPrice.innerHTML : null,
			url
    }
  })
}

function htmlToElement(html) {
  const template = document.createElement('template');
  html = html.trim(); // Never return a text node of whitespace as the result
  template.innerHTML = html;
  return template.content.cloneNode(true);
}

