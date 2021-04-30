import { getWishlist, updateBadge, updateWishlist } from './browserApi'

const priceQuery = "span[data-qa='mfeCtaMain#offer0#finalPrice']"
const ogPriceQuery = "span[data-qa='mfeCtaMain#offer0#originalPrice']"
const saleEndsQuery = "span[data-qa='mfeCtaMain#offer0#discountDescriptor']"
const nameQuery = 'h1'

export function fetchAndScrapeUrl (url) {
  return fetch(url)
    .then(res => res.text())
    .then(html => {
      const doc = htmlToElement(html)
      const price = doc.querySelector(priceQuery)
      const ogPrice = doc.querySelector(ogPriceQuery)
      const saleEnds = doc.querySelector(saleEndsQuery)
      const title = doc.querySelector(nameQuery)
      try {
        return {
          title: title.innerText.trim(),
          price: price.innerText,
          ogPrice: ogPrice ? ogPrice.innerText : null,
          saleEnds: saleEnds ? saleEnds.innerText : null,
          url
        }
      } catch (e) {
        // console.log(e);
        throw new Error(`Could not parse response from ${url}`)
      }
    })
    .catch(err => {
      throw err
    })
}

function htmlToElement (html) {
  const template = document.createElement('template')
  html = html.trim() // Never return a text node of whitespace as the result
  template.innerHTML = html
  return template.content.cloneNode(true)
}

export function refreshPriceData () {
  return new Promise((resolve) => {
    getWishlist(wishlist => {
      if (!wishlist.items.length) {
        return resolve()
      }
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
          updateWishlist(newWishlist, true).then(resolve)
        })
        .catch(err => {
          console.log('Data refresh error: ', err)
          resolve()
        })
    })
  })
}