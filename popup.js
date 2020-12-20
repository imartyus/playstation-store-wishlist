import 'alpinejs'
import { fetchAndScrapeUrl } from './helpers/pageScraping'
import { getWishlist, updateWishlist, isOnStoreUrl } from './helpers/browserApi'

// Init component state
function getState () {
  return {
    loading: false,
    onStoreUrl: '',
    onStoreAlreadyAdded: false,
    gameList: [],
    lastUpdated: '',

    addGameFromTab () {
      getWishlist(wishlist => {
        this.loading = true
        fetchAndScrapeUrl(this.onStoreUrl)
          .then(gameData => {
            if (gameData) {
              wishlist.items.push(gameData)
              updateWishlist(wishlist)
              this.gameList = wishlist.items
              this.onStoreAlreadyAdded = true
            }
            this.loading = false
          })
      })
    },

    removeGame (url) {
      getWishlist(wishlist => {
        wishlist.items = wishlist.items.filter(item => item.url !== url)
        updateWishlist(wishlist)
        this.gameList = wishlist.items
      })
    },

    init () {
      getWishlist(wishlist => {
        this.gameList = wishlist.items
        this.lastUpdated = wishlist.lastUpdated ? (new Date(wishlist.lastUpdated)).toLocaleString() : null
        isOnStoreUrl((currentUrl, isStoreUrl) => {
          if (isStoreUrl) {
            // TODO clean up url before comparing
            const existingGame = wishlist.items.find(item => item.url === currentUrl)
            this.onStoreUrl = currentUrl
            this.onStoreAlreadyAdded = !!existingGame
          }
        })
      })
    }
  }
}

window.getState = getState
