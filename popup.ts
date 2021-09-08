import 'alpinejs'
import { fetchAndScrapeUrl, refreshPriceData } from './helpers/pageScraping'
import { getWishlist, updateWishlist, isOnStoreUrl } from './helpers/browserApi'
import orderBy from 'lodash.orderby'

// Init component state
function getState () {
  return {
    loading: false,
    refreshing: false,
    onStoreUrl: '',
    onStoreAlreadyAdded: false,
    gameList: [],
    lastUpdated: '',
    sortBy: 'title', // | 'price'
    sortOrder: 'asc',

    addGameFromTab () {
      getWishlist(wishlist => {
        this.loading = true
        fetchAndScrapeUrl(this.onStoreUrl)
          .then(gameData => {
            if (gameData) {
              wishlist.items.push(gameData)
              updateWishlist(wishlist)
              this.gameList = this.getSortedList(wishlist.items)
              this.onStoreAlreadyAdded = true
            }
            this.loading = false
          })
      })
    },

    removeGame (url) {
      this.gameList = this.gameList.filter(item => item.url !== url)
      updateWishlist({ items: [...this.gameList] }, true)
    },

    updateSort (sortBy) {
      if (sortBy === this.sortBy) {
        this.sortOrder = this.sortOrder === 'desc' ? 'asc' : 'desc'
      } else {
        this.sortBy = sortBy
        this.sortOrder = 'asc'
      }
      updateWishlist({ sortBy: this.sortBy, sortOrder: this.sortOrder }, true)
      this.gameList = this.getSortedList(this.gameList)
    },

    getSortedList (list) {
      const NUMERIC_REGEXP = /[-]{0,1}[\d]*[.]{0,1}[\d]+/g // extract price number

      const sort = (item) => {
        if (this.sortBy === 'price') {
          return parseInt(item.price.match(NUMERIC_REGEXP)[0])
        }
        return item[this.sortBy]
      }

      //@ts-ignore
      return orderBy(list, sort, this.sortOrder)
    },

    manualRefresh () {
      this.refreshing = true
      refreshPriceData().then(_ => {
        this.refreshing = false
        this.init()
      })
    },

    init () {
      getWishlist(wishlist => {
        this.sortBy = wishlist.sortBy || this.sortBy
        this.sortOrder = wishlist.sortOrder || this.sortOrder
        this.gameList = this.getSortedList(wishlist.items)
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

//@ts-ignore
window.getState = getState
