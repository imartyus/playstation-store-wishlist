import { getWishlist, updateBadge, updateWishlist } from './browserApi'
import { WishlistItem } from '../types'

const priceQuery = "span[data-qa='mfeCtaMain#offer0#finalPrice']"
const ogPriceQuery = "span[data-qa='mfeCtaMain#offer0#originalPrice']"
const saleEndsQuery = "span[data-qa='mfeCtaMain#offer0#discountDescriptor']"
const nameQuery = 'h1'

export async function fetchAndScrapeUrl(url: string): Promise<WishlistItem> {
  try {
    const res = await fetch(url)
    const html = await res.text()
    const doc = <HTMLElement>htmlToElement(html)
    const price = <HTMLElement>doc.querySelector(priceQuery)
    const ogPrice = <HTMLElement>doc.querySelector(ogPriceQuery)
    const saleEnds = <HTMLElement>doc.querySelector(saleEndsQuery)
    const title = <HTMLElement>doc.querySelector(nameQuery)
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
  } catch (err) {
    throw err
  }
}

function htmlToElement(html: string) {
  const template = document.createElement('template')
  html = html.trim() // Never return a text node of whitespace as the result
  template.innerHTML = html
  return template.content.cloneNode(true)
}

export function refreshPriceData(): Promise<void> {
  return new Promise((resolve) => {
    getWishlist(wishlist => {
      if (!wishlist.items.length) {
        return resolve()
      }

      const requests = wishlist.items.map(item => fetchAndScrapeUrl(item.url))

      Promise.allSettled(requests)
        .then(results => {
          const updatedItems = wishlist.items.map(item => {
            const updatedItem = results.find(el => el.status === 'fulfilled' && el.value.url === item.url)
            // @ts-ignore
            return updatedItem ? updatedItem.value : { ...item, outdated: true }
          })

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
