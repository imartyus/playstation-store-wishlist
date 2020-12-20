const priceQuery = "span[data-qa='mfeCtaMain#offer0#finalPrice']"
const ogPriceQuery = "span[data-qa='mfeCtaMain#offer0#originalPrice']"
const nameQuery = 'title'

export function fetchAndScrapeUrl (url) {
  return fetch(url)
    .then(res => res.text())
    .then(html => {
      const doc = htmlToElement(html)
      const price = doc.querySelector(priceQuery)
      const ogPrice = doc.querySelector(ogPriceQuery)
      const title = doc.querySelector(nameQuery)
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

function htmlToElement (html) {
  const template = document.createElement('template')
  html = html.trim() // Never return a text node of whitespace as the result
  template.innerHTML = html
  return template.content.cloneNode(true)
}