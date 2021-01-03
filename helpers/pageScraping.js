const priceQuery = "span[data-qa='mfeCtaMain#offer0#finalPrice']"
const ogPriceQuery = "span[data-qa='mfeCtaMain#offer0#originalPrice']"
const saleEndsQuery = "span[data-qa='mfeCtaMain#offer0#discountDescriptor']"
const nameQuery = 'title'

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
          title: title.innerHTML.trim(),
          price: price.innerHTML,
          ogPrice: ogPrice ? ogPrice.innerHTML : null,
          saleEnds: saleEnds ? saleEnds.innerHTML : null,
          url
        }
      } catch {
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
