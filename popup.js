const url1 = 'https://store.playstation.com/en-ca/product/UP4497-CUSA13472_00-0000000000000002'

const psnProductUrlTester = /https:\/\/store\.playstation\.com\/\D{5}\/product\/\S+/g

// Init component state
function getState() {
  return {
    inputError: false,
    inputWarn: false,
    loading: false,
    onStoreUrl: '',
    onStoreAlreadyAdded: false,
    inputVal: '',
    gameList: [],
    lastUpdated: '',
    addGame() {
      this.inputWarn = false
      this.inputError = false
      const validUrl = psnProductUrlTester.test(this.inputVal)
      if (validUrl) {
        getWishlist(wishlist => {
          const existingGame = wishlist.items.find(item => item.url === this.inputVal)
          if (existingGame) {
            // show warning
            this.inputWarn = true
            this.inputVal = ''
          } else {
            this.loading = true
            fetchAndScrapeUrl(this.inputVal)
            .then(gameData => {
              if (gameData) {
                wishlist.items.push(gameData)
                chrome.storage.sync.set({ wishlist })
                this.gameList = wishlist.items
              }
              this.inputVal = ''
              this.loading = false  
            })
          }
        })
      } else {
        this.inputError = true
      }
    },
    addGameFromTab() {
      getWishlist(wishlist => {
        this.loading = true
        fetchAndScrapeUrl(this.onStoreUrl)
        .then(gameData => {
          if (gameData) {
            wishlist.items.push(gameData)
            chrome.storage.sync.set({ wishlist })
            this.gameList = wishlist.items
            this.onStoreAlreadyAdded = true
          }
          this.loading = false  
        })
      })
    },
    removeGame(url) {
      getWishlist(wishlist => {
        wishlist.items = wishlist.items.filter(item => item.url !== url)
        chrome.storage.sync.set({ wishlist })
        this.gameList = wishlist.items
      })
    },
    init() {
      getWishlist(wishlist => {
        this.gameList = wishlist.items
        this.lastUpdated = wishlist.lastUpdated ? (new Date(wishlist.lastUpdated)).toLocaleString() : null
        
        chrome.tabs.query({active: true, currentWindow: true}, tabs => {
          const currentUrl = tabs[0].url
          const isStoreUrl = psnProductUrlTester.test(currentUrl)
          if (isStoreUrl) {
            const existingGame = wishlist.items.find(item => item.url === currentUrl)
            this.onStoreUrl = currentUrl
            this.onStoreAlreadyAdded = !!existingGame
          }
        })
      })
    }
  }
}

/////////////////////////////////////////////////////////////////////

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