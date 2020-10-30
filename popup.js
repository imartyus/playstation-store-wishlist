const url1 = 'https://store.playstation.com/en-ca/product/UP4497-CUSA13472_00-0000000000000002'
const url2 = 'https://store.playstation.com/en-ca/product/UP5927-CUSA20145_00-STAR990000300002'

// const mockItems = [
//   {
//     title: 'AAA',
//     price: '$20',
//     ogPrice: '$100'
//   },
//   {
//     title: 'BBB',
//     price: '$200',
//     ogPrice: null
//   },
// ]

const psnProductUrlTester = /https:\/\/store\.playstation\.com\/\D{5}\/product\/\S+/g

// Init component state
function initState() {
  return {
    inputError: false,
    loading: false,
    inputVal: '',
    gameList: [],
    lastUpdated: '',
    addGame() {
      const validUrl = psnProductUrlTester.test(this.inputVal)
      if (validUrl) {
        this.loading = true
        this.inputError = false
        fetchAndScrapeUrl(this.inputVal)
        .then(gameData => {
          getWishlist(wishlist => {
            wishlist.items.push(gameData)
            chrome.storage.sync.set({ wishlist })
            this.gameList = wishlist.items
            this.inputVal = ''
            this.loading = false
          })
        })
      } else {
        this.inputError = true
      }
    },
    removeGame(url) {
      getWishlist(wishlist => {
        wishlist.items = wishlist.items.filter(item => item.url !== url)
        chrome.storage.sync.set({ wishlist })
        this.gameList = wishlist.items
      })
    },
    readStorage() {
      getWishlist(wishlist => {
        this.gameList = wishlist.items
        this.lastUpdated = wishlist.lastUpdated ? (new Date(wishlist.lastUpdated)).toLocaleString() : null
      })
    }
  }
}

function getWishlist(cb) {
  chrome.storage.sync.get(['wishlist'], ({wishlist}) => {
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